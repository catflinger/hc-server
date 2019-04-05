import * as fs from "fs";
import { inject, injectable, TargetTypeEnum } from "inversify";
import * as mysql from "mysql";
import { Pool, MysqlError, FieldInfo } from "mysql";
import * as path from "path";

import { IControlState, ILogEntry, ILogExtract, ISensorReading } from "../common/interfaces";
import { LogEntry } from "../common/log/log-entry";
import { LogExtract } from "../common/log/log-extract";
import { ILogger, INJECTABLES, ILoggerConfig } from "../types";

@injectable()
export class Logger implements ILogger {
    public readonly config: ILoggerConfig;

    private pool: Pool = null;

    constructor(
        @inject(INJECTABLES.ConfigRootDir) private configRoot: string) {
        this.config = this.getLoggerConfig();
    }

    public init(): Promise<void> {

        if (this.pool !== null) {
            return Promise.resolve();
        }

        return this.openDatabase()
        .then((pool) => {
            this.pool = pool;
            return this.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'hc_log' AND table_name = 'reading'");
        })
        .then((rows: any[]) => {

            // Create a schema if necessary
            if (rows.length> 0) {
                return Promise.resolve();
            } else {
                return this.createSchema();
            }
        });
    }

    public end(): Promise<void> {
        return new Promise((resolve) => {
            this.pool.end(() => {
                this.pool = null;
                resolve();
            });
        });
    }

    public log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<boolean> {
        let success = true;

        if (!date) {
            throw new Error("cannot log without a date");
        }
        const logDate: number = this.roundedAsUnix(date);

        return this.insertControlState(this.pool, logDate, controlState.heating, controlState.hotWater)

        .then(() => {
            const promises: Array<Promise<void>> = [];
            readings.forEach((r) => {
                if (r.id) {
                    const rounded: number = r.reading === null || r.reading === undefined ?
                        null :
                        Math.round(r.reading * 10);

                    promises.push(this.insertReading(this.pool, logDate, r.id, rounded));
                }
            });
            return Promise.all(promises);
        })
        .catch((error: any) => {
            // don't let the program fall over just because of a log record
            console.log("FAILED to write log record " + error);
            success = false;
        })
        .then(() => {
            return Promise.resolve(success);
        });
    }

    public getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract> {

        let controlStates: any[];

        return this.selectControlState(this.pool, from.getTime(), to.getTime())
        .then((rows: any[]) => {
            controlStates = rows;

            const promises: Array<Promise<any[]>> = [];
            ids.forEach((id: string) => {
                promises.push(this.selectReading(this.pool, from.getTime(), to.getTime(), id));
            });
            return Promise.all(promises);
        })
        .then((sensorReadings: any[][]) => {
            const entries: any[] = [];

            // combine all readings into one
            let allReadings: any[] = [];
            sensorReadings.forEach((sr) => {
                allReadings = allReadings.concat(sr);
            });

            // create a log entry for each control state (there will be one control state per log interval)
            controlStates.forEach((cs: any) => {
                const readings: number[] = [];

                // find the readings for the requested sensors
                ids.forEach((id: string) => {
                    const reading = allReadings.find((sr) => {
                        return sr.sensor_id === id && sr.date === cs.date;
                    });

                    if (reading) {
                        readings.push(reading.reading);
                    } else {
                        readings.push(null);
                    }
                });

                sensorReadings.forEach((sensorData: any[]) => {
                    const reading = sensorData.find((sd) => sd.date === cs.date);
                    if (reading) {
                        readings.push(reading.reading);
                    } else {
                        readings.push(null);
                    }
                });

                const entry: ILogEntry = new LogEntry({
                    date: this.fromUnixDate(cs.date),
                    heating: !!cs.heating,
                    hotWater: !!cs.hw,
                    readings,
                });

                entries.push(entry);
            });

            return Promise.resolve(new LogExtract({
                entries,
                from,
                sensors: ids,
                to,
            }));
        });
    }

    private createSchema(): Promise<void> {

        return this.query("CREATE TABLE reading (date BIGINT, sensor_id VARCHAR(255), reading INTEGER, UNIQUE(date,sensor_id))")

        .then(() => {
            return this.query("CREATE TABLE control_state (date BIGINT UNIQUE, heating BOOLEAN, hw BOOLEAN)");
        })
        .then(() => {
            return this.query("CREATE TABLE sensor (id VARCHAR(255), name VARCHAR(255))");
        })
        .then(() => {
            return this.query("CREATE INDEX reading_date ON reading (date)");
        })
        .then(() => {
            return this.query("CREATE INDEX control_state_date ON control_state (date)");
        })
        .then(() => {
            return Promise.resolve();
        });
    }

    private openDatabase(): Promise<Pool> {
        return new Promise((resolve, reject) => {
            try {
                const pool: Pool = mysql.createPool({
                    connectionLimit: 5,
                    host: this.config.server,
                    user: this.config.user,
                    password: this.config.password,
                    database: this.config.database,
                });
                resolve(pool);
            } catch (err) {
                reject(err);
            }
        });
    }

    private query(sql: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, (error: MysqlError, results: any, fields: FieldInfo[]) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // return the date as Unix time rounded to the nearest 10 minutes
    private roundedAsUnix(src: Date): number {
        const startOfDay = new Date(src.getFullYear(), src.getMonth(), src.getDate(), 0, 0, 0, 0);
        const secondsElapsed: number = (src.getTime() - startOfDay.getTime()) / 1000;
        const tenMinIntervals = Math.round(secondsElapsed / (60 * 10));

        return startOfDay.getTime() + tenMinIntervals * 10 * 60 * 1000;
    }

    // return the date as Unix time rounded to the nearest 10 minutes
    private fromUnixDate(seconds: number): Date {
        const dt: Date = new Date();
        dt.setTime(seconds);

        return dt;
    }

    private insertControlState(pool: Pool, date: number, heating: boolean, hw: boolean) {
        return new Promise<void>((resolve, reject) => {
            pool.query("INSERT IGNORE INTO control_state (date, heating, hw) VALUES (?,?,?)", [date, heating, hw], (error) => {
                if (error) {
                    reject(error);
                } else {
                    console.log("INSERTED CONTROL STATE");
                    resolve();
                }
            });
        });
    };

    private insertReading(pool: Pool, date: number, id: string, reading: number): Promise<void> {
        return new Promise((resolve, reject) => {
            pool.query("INSERT IGNORE INTO reading (date, sensor_id, reading) VALUES (?,?, ?)", [date, id, reading], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    };

    private selectControlState(pool: Pool, from: number, to: number): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.query("SELECT date, heating, hw FROM control_state WHERE date >= ? AND date < ? ORDER BY date", [from, to], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };
    
    private selectReading(pool: Pool, from: number, to: number, id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM reading WHERE date >= ? AND date < ? AND sensor_id = ?", [from, to, id], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };

    private getLoggerConfig(): ILoggerConfig {
        let cfg: any = null;
        try {
            const logConfigPath = path.join(this.configRoot, "log-config.json");
    
            const json = fs.readFileSync(logConfigPath, "utf8");
            cfg = JSON.parse(json);
    
            const members = [
                "server",
                "user",
                "password",
                "database",
                "testUser",
                "testPassword",
            ];
            
            members.forEach((member) => {
                if (!cfg.hasOwnProperty(member)) {
                    throw new Error ("missing property " + member);
                }
            });
    
        } catch (error) {
            throw new Error ("Failed to read Log config file: " + error);
        }
    
        return cfg as ILoggerConfig;
    }
}
