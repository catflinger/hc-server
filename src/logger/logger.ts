import * as fs from "fs";
import { inject, injectable } from "inversify";
import * as path from "path";
import { Database, Statement } from "sqlite3";

import { IControlState, ISensorReading } from "../common/interfaces";
import { ILogger, INJECTABLES } from "../types";

class DbStuff {
    public db: Database;
    public insertReading: Statement;
    public insertControlState: Statement;
}

@injectable()
export class Logger implements ILogger {

    constructor(@inject(INJECTABLES.LogRootDir) private logRoot: string) {
    }

    public init(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.dbFilename)) {
                const db = new Database(this.dbFilename);

                db.run("CREATE TABLE reading (date INTEGER, sensor_id TEXT, reading INTEGER, UNIQUE(date,sensor_id))", (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        db.run("CREATE TABLE control_state (date INTEGER UNIQUE, heating INTEGER, hw INTEGER)", (error1) => {
                            if (error1) {
                                reject(error1);
                            } else {
                                db.run("CREATE TABLE sensor (id TEXT, name TEXT)", (error2) => {
                                    if (error2) {
                                        reject(error2);
                                    } else {
                                        db.run("CREATE INDEX reading_date ON reading (date)", (error3) => {
                                            if (error3) {
                                                reject(error3);
                                            } else {
                                                db.run("CREATE INDEX control_state_date ON control_state (date)", (error4) => {
                                                    if (error4) {
                                                        reject(error4);
                                                    } else {
                                                        db.close((error5) => {
                                                            if (error5) {
                                                                reject(error5);
                                                            } else {
                                                                resolve();
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                resolve();
            }
        });
    }

    public log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<void> {
        const logDate: number = this.roundedAsUnix(date);
        const dbstuff: DbStuff = new DbStuff();

        return this.openDatabase(dbstuff)
        .then(() => {
            return this.prepareInsertReading(dbstuff);
        })
        .then(() => {
            return this.prepareInsertReading(dbstuff);
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
            return this.tryCloseDatabase(dbstuff);
        })
        .then(() => {
            return Promise.resolve();
        })
        .catch((error: any) => {
            console.log("FAILED to write log record " + error);
            this.tryCloseDatabase(dbstuff);
        });
    }

    private openDatabase(dbs: DbStuff): Promise<DbStuff> {
        return new Promise((resolve, reject) => {
            dbs.db = new Database(this.dbFilename, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(dbs);
                }
            });
        });
    }

    private prepareInsertReading(dbs: DbStuff): Promise<void> {
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

    private prepareInsertControlState(dbs: DbStuff): Promise<void> {
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

    private insertControlState(dbs: DbStuff, logDate: number, controlState: IControlState): Promise<void> {
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

    private insertSensorReading(dbs: DbStuff, logDate: number, reading: ISensorReading): Promise<void> {
        return new Promise((resolve, reject) => {
            const temp: number = Math.round(reading.reading * 10);
            dbs.insertReading.run([ logDate, reading.id, temp], (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private tryCloseDatabase(dbs: DbStuff): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                dbs.db.close(() => {
                    resolve();
                });
            } catch {
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
