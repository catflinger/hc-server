import * as fs from "fs";
import { inject, injectable, TargetTypeEnum } from "inversify";
import * as path from "path";
import { Database, Statement } from "sqlite3";

import { IControlState, ILogEntry, ILogExtract, ISensorReading } from "../common/interfaces";
import { ILogger, INJECTABLES } from "../types";

interface ILogStore {
    db: Database;
    insertReading: Statement;
    insertControlState: Statement;
    selectReading: Statement;
    selectControlState: Statement;
}

@injectable()
export class Logger implements ILogger {

    private store: ILogStore = {
        db: null,
        insertControlState: null,
        insertReading: null,
        selectControlState: null,
        selectReading: null,
    };

    constructor(@inject(INJECTABLES.LogRootDir) private logRoot: string) {
    }

    public init(): Promise<void> {

        return this.openDatabase()
        .then((database) => {
            this.store.db = database;
            return this.querySQL("SELECT name FROM sqlite_master WHERE type='table'");
        })
        .then((rows: any[]) => {

            // Create a schema if necessary
            if (rows.find((row) => row.name === "reading")) {
                return Promise.resolve();
            } else {
                return this.createSchema();
            }
        })
        .then(() => {
            return this.prepareStatement("INSERT OR IGNORE INTO reading VALUES (?,?, ?)");
        })
        .then((statement) => {
            this.store.insertReading = statement;
            return this.prepareStatement("INSERT OR IGNORE INTO control_state VALUES (?,?,?)");
        })
        .then((statement) => {
            this.store.insertControlState = statement;
            return this.prepareStatement("SELECT date, heating, hw FROM control_state WHERE date >= ? AND date < ? ORDER BY date");
        })
        .then((statement) => {
            this.store.selectControlState = statement;
            return this.prepareStatement("SELECT * FROM reading WHERE date >= ? AND date < ? AND sensor_id = ?");
        })
        .then((statement) => {
            this.store.selectReading = statement;
        });
    }

    public log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<void> {
        if (!date) {
            throw new Error("cannot log without a date");
        }
        const logDate: number = this.roundedAsUnix(date);

        return this.execStatement(this.store.insertControlState, logDate, controlState.heating, controlState.hotWater)

        .then(() => {
            const promises: Array<Promise<void>> = [];
            readings.forEach((r) => {
                if (r.id) {
                    const rounded: number = r.reading === null || r.reading === undefined ?
                        null :
                        Math.round(r.reading * 10);

                    promises.push(this.execStatement(this.store.insertReading, logDate, r.id, rounded));
                }
            });
            return Promise.all(promises);
        })
        .catch((error: any) => {
            // don't let the program fall over just because of a log record
            // console.log("FAILED to write log record " + error);
        })
        .then(() => {
            return Promise.resolve();
        });
    }

    public getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract> {
        const extract: ILogExtract = {
            entries: [],
            from,
            sensors: ids,
            to,
        };

        let controlStates: any[];

        return this.queryAll(this.store.selectControlState, from.getTime(), to.getTime())
        .then((rows: any[]) => {
            controlStates = rows;

            const promises: Array<Promise<any[]>> = [];
            ids.forEach((id: string) => {
                promises.push(this.queryAll(this.store.selectReading, from.getTime(), to.getTime(), id));
            });
            return Promise.all(promises);
        })
        .then((sensorReadings: any[][]) => {

            // combine the data into an extract
            controlStates.forEach((cs: any) => {
                const entry: ILogEntry = {
                    date: cs.date,
                    heating: cs.heating,
                    hotWater: cs.hw,
                    readings: [],
                };

                sensorReadings.forEach((sensorData: any[]) => {
                    const reading = sensorData.find((sd) => sd.date === cs.date);
                    if (reading) {
                        entry.readings.push(reading.reading);
                    } else {
                        entry.readings.push(null);
                    }
                });
                extract.entries.push(entry);
            });

            return Promise.resolve(extract);
        });
    }

    private createSchema(): Promise<void> {

        return this.execSQL("CREATE TABLE reading (date INTEGER, sensor_id TEXT, reading INTEGER, UNIQUE(date,sensor_id))")

        .then(() => {
            return this.execSQL("CREATE TABLE control_state (date INTEGER UNIQUE, heating INTEGER, hw INTEGER)");
        })
        .then(() => {
            return this.execSQL("CREATE TABLE sensor (id TEXT, name TEXT)");
        })
        .then(() => {
            return this.execSQL("CREATE INDEX reading_date ON reading (date)");
        })
        .then(() => {
            return this.execSQL("CREATE INDEX control_state_date ON control_state (date)");
        });
    }

    private openDatabase(): Promise<Database> {
        return new Promise((resolve, reject) => {
            try {
                const db: Database = new Database(this.dbFilename, (error) => {
                    reject(error);
                });
                resolve(db);
            } catch (err) {
                reject(err);
            }
        });
    }

    private tryCloseDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.store.db.close(() => {
                    this.store.db = null;
                    resolve();
                });
            } catch {
                resolve();
            }
        });
    }

    private execSQL(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.store.db.run(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private querySQL(sql: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.store.db.all(sql, (error: Error, rows: any[]) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    private prepareStatement(sql: string): Promise<Statement> {
        return new Promise((resolve, reject) => {
            const statement = this.store.db.prepare(sql, (error) => {
                if (error) {
                    reject(error);
                }
                resolve(statement);
            });
        });
    }

    private queryAll(statement: Statement, ...params: any[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            statement.all(...params, (error: Error, rows: any[]) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    private execStatement(statement: Statement, ...params: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            statement.run(...params, (error: Error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private get dbFilename(): string {
        return path.join(this.logRoot, "hc-log.db");
    }

    // return the date as Unix time rounded to the nearest 10 minutes
    private roundedAsUnix(src: Date): number {
        const startOfDay = new Date(src.getFullYear(), src.getMonth(), src.getDate(), 0, 0, 0, 0);
        const secondsElapsed: number = (src.getTime() - startOfDay.getTime()) / 1000;
        const tenMinIntervals = Math.round(secondsElapsed / (60 * 10));

        return startOfDay.getTime() + tenMinIntervals * 10 * 60 * 1000;
    }
}
