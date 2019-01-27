import * as fs from "fs";
import { inject, injectable, TargetTypeEnum } from "inversify";
import * as path from "path";
import { Database, Statement } from "sqlite3";

import { IControlState, ISensorReading, ILogExtract } from "../common/interfaces";
import { ILogger, INJECTABLES } from "../types";

interface IDbStuff {
    db: Database;
    insertReading: Statement;
    insertControlState: Statement;
}

@injectable()
export class Logger implements ILogger {

    constructor(@inject(INJECTABLES.LogRootDir) private logRoot: string) {
    }

    public init(): Promise<void> {
        let db: Database;

        // create a new database and schema if they dosn't already exist
        if (fs.existsSync(this.dbFilename)) {
            return Promise.resolve();
        }

        return this.openDatabase()
        .then((database) => {
            db = database;
            // console.log ("DATABASE " + JSON.stringify(db, null, 4));
            return this.runSQL(db, "CREATE TABLE reading (date INTEGER, sensor_id TEXT, reading INTEGER, UNIQUE(date,sensor_id))");
        })
        .then(() => {
            return this.runSQL(db, "CREATE TABLE control_state (date INTEGER UNIQUE, heating INTEGER, hw INTEGER)");
        })
        .then(() => {
            return this.runSQL(db, "CREATE TABLE sensor (id TEXT, name TEXT)");
        })
        .then(() => {
            return this.runSQL(db, "CREATE INDEX reading_date ON reading (date)");
        })
        .then(() => {
            return this.runSQL(db, "CREATE INDEX control_state_date ON control_state (date)");
        })
        .then(() => {
            return this.tryCloseDatabase(db);
        });
    }

    public log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<void> {

        if (!date) {
            throw new Error("cannot log without a date");
        }
        const logDate: number = this.roundedAsUnix(date);

        const dbstuff: IDbStuff = {
            db: null,
            insertControlState: null,
            insertReading: null,
        };

        return this.openDatabase()
        .then((database) => {
            dbstuff.db = database;
            return this.prepareInsertReading(dbstuff);
        })
        .then(() => {
            return this.prepareInsertControlState(dbstuff);
        })
        .then(() => {
            return this.prepareInsertControlState(dbstuff);
        })
        .then(() => {
            return this.insertControlState(dbstuff, logDate, controlState);
        })
        .then(() => {
            const promises: Array<Promise<void>> = [];
            readings.forEach((r) => {
                promises.push(this.insertSensorReading(dbstuff, logDate, r));
            });
            return Promise.all(promises);
        })
        .then(() => {
            return this.tryCloseDatabase(dbstuff.db);
        })
        .catch((error: any) => {
            // don't let the program fall over just because of a log record
            // console.log("FAILED to write log record " + error);
        });
    }

    public getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract> {
        return Promise.resolve({
            sensors: ["foo", "bar"],

            from: new Date("2019-01-03T12:00:00"),
            to: new Date("2019-01-03T13:00:00"),

            // the data retrieved
            entries: [
                {
                    date: new Date("2019-01-03T12:00:00"),
                    heating: true,
                    hotWater: false,
                    readings: [ 111, 222 ],
                },
            ],
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

    private tryCloseDatabase(db: Database): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                db.close(() => {
                    resolve();
                });
            } catch {
                resolve();
            }
        });
    }

    private runSQL(db: Database, sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(sql, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private prepareInsertReading(dbs: IDbStuff): Promise<void> {
        return new Promise((resolve, reject) => {
            dbs.insertReading = dbs.db.prepare("INSERT OR IGNORE INTO reading VALUES (?,?, ?)", (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private prepareInsertControlState(dbs: IDbStuff): Promise<void> {
        return new Promise((resolve, reject) => {
            dbs.insertControlState = dbs.db.prepare("INSERT OR IGNORE INTO control_state VALUES (?,?,?)", (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private insertControlState(dbs: IDbStuff, logDate: number, controlState: IControlState): Promise<void> {
        return new Promise((resolve, reject) => {
            dbs.insertControlState.run([ logDate, controlState.heating, controlState.hotWater], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private insertSensorReading(dbs: IDbStuff, logDate: number, reading: ISensorReading): Promise<void> {
        return new Promise((resolve, reject) => {
            if (reading.id) {

                const temp: number = reading.reading === null || reading.reading === undefined ?
                    null :
                    Math.round(reading.reading * 10);

                dbs.insertReading.run([ logDate, reading.id, temp], (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } else {
                // skip bad readings
                resolve();
            }
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
