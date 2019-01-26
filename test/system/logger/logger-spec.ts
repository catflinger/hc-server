import "mocha";
import * as chai from "chai";
import * as fsu from "../../../src/utils/fs-utils";
import * as path from "path";
import * as fs from "fs";

import { INJECTABLES, ILogger } from "../../../src/types";
import { Logger } from "../../../src/logger/logger";
import { container } from "./inversify-test.config";
import { Database } from "sqlite3";
import { ISensorReading } from "../../../src/common/interfaces";
import { doesNotReject } from "assert";

const expect = chai.expect;

const logRoot = container.get<string>(INJECTABLES.LogRootDir);

const dbFile = path.join(logRoot, "hc-log.db");
const journalFile = path.join(logRoot, "hc-log.db-journal");

function safeDeleteFile(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.exists(file, (exists) => {
            if (exists) {
                fs.unlink(file, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    });
}

function deleteDatabase(): void {
    // return safeDeleteFile(dbFile)
    // .then(() => {
    //     return safeDeleteFile(journalFile);
    // })
    if (fs.existsSync(dbFile)) {
        fs.unlinkSync(dbFile)
    }
    if (fs.existsSync(journalFile)) {
        fs.unlinkSync(journalFile);
    }
}

function clearDatabase(): Promise<void> {
    let db: Database;

    return openDatabase(dbFile)
    .then((database) => {
        db = database;
        return runSQL(db, "DELETE FROM reading");
    })
    .then((database) => {
        return runSQL(db, "DELETE FROM sensor");
    })
    .then((database) => {
        return runSQL(db, "DELETE from control_state");
    })
    .then(() => {
        return tryClose(db);
    })
}

describe("Logger", () => {
    let logger: ILogger;

    before (() => {
        logger = container.get<ILogger>(INJECTABLES.Logger);
    });

    it("should create a new database", () => {
        deleteDatabase();

        return logger.init()
        .then(() => {
            expect(fs.existsSync(dbFile)).to.be.true;
            Promise.resolve();
        });
    });

    it("should log a record", () => {
        const date: Date = new Date("2019-12-19T10:23:00");
        const expectedDate = new Date("2019-12-19T10:20:00");
        const logger = container.get<ILogger>(INJECTABLES.Logger);
        let db: Database;

        return clearDatabase()
        .then(() => {
            return logger.log(
                date, 
                [ { id: "foo", description: "a sensor", role: "hw", reading: 10.1234567 }], 
                { heating: true, hotWater: false }
            );
        })
        .then(() => {
            return openDatabase(dbFile);
        })
        .then((database) => {
            db = database;
            return getReadings(db);
        })
        .then((readings: any[]) => {
            expect(readings.length).to.be.equal(1);
            // date should have been rounded to nearest 10 miniutes
            expect(new Date(readings[0].date).toISOString()).to.equal(new Date("2019-12-19T10:20:00").toISOString());
            expect(readings[0].sensor_id).to.equal("foo");
            // temperature should be in tenths of a degree, whole numbers only
            expect(readings[0].reading).to.equal(101);
            
            return Promise.resolve();
        })
        .then(() => {
            return getStatus(db);
        })
        .then((controlStatus) => {
            expect(new Date(controlStatus[0].date).toISOString()).to.equal(expectedDate.toISOString());
            expect(controlStatus.length).to.be.equal(1);
            expect(controlStatus[0].heating).to.equal(1);
            expect(controlStatus[0].hw).to.equal(0);
        });
    });

    it("should not log another record for same time", () => {
        const date1: Date = new Date("2019-12-19T10:19:00");
        const date2: Date = new Date("2019-12-19T10:29:00");
        const date3: Date = new Date("2019-12-19T10:23:00");
        let db: Database;

        const logger = container.get<ILogger>(INJECTABLES.Logger);

        return clearDatabase()
        .then(() => {
            return logger.log(
                date1, 
                [ { id: "foo", description: "a sensor", role: "hw", reading: 10.1234567 }], 
                { heating: true, hotWater: false }
            );
        })
        .then(() => {
            return logger.log(
                date2, 
                [ { id: "bar", description: "a sensor", role: "hw", reading: 11.1234567 }], 
                { heating: true, hotWater: false }
            );
        })
        .then(() => {
            // this should succed: same time slot but different id
            return  logger.log(
                date3, 
                [ { id: "fish", description: "a sensor", role: "hw", reading: 11.1234567 }], 
                { heating: true, hotWater: false }
            );
        })
        .then(() => {
            // this reading shold be skipped as it resolves to the same id and time as the first reading
            return logger.log(
                date3, 
                [ { id: "foo", description: "a sensor", role: "hw", reading: 12.1234567 }], 
                { heating: true, hotWater: false }
            );
        })
        .then(() => {
            return openDatabase(dbFile);
        })
        .then((database) => {
            db = database;
            return getReadings(db);
        })
        .then((readings) => {
            expect(readings.length).to.be.equal(3);
            expect(readings[0].sensor_id).to.equal("foo");
            expect(readings[1].sensor_id).to.equal("bar");
            expect(readings[2].sensor_id).to.equal("fish");
            
            return tryClose(db);
        });
    });

    it("should log null readings", () => {
        const date: Date = new Date("2019-12-19T10:23:00");
        const logger = container.get<ILogger>(INJECTABLES.Logger);
        let db: Database;

        return clearDatabase()
        .then(() => {
            return logger.log(
                date, 
                [ { id: "foo", description: null, role: null, reading: null }], 
                { heating: true, hotWater: false }
            );
        })
        .then(() => {
            return openDatabase(dbFile);
        })
        .then((database) => {
            db = database;
            return getReadings(db);
        })
        .then((readings) => {
            expect(readings.length).to.be.equal(1);
            // date should have been rounded to nearest 10 miniutes
            expect(new Date(readings[0].date).toISOString()).to.equal(new Date("2019-12-19T10:20:00").toISOString());
            expect(readings[0].sensor_id).to.equal("foo");
            expect(readings[0].reading).to.be.null;

            return tryClose(db);
        })
    });
});

function getReadings(db: Database): Promise<any[]> {
    return new Promise<ISensorReading[]>((resolve, reject) => {
        db.all("SELECT * FROM reading", (err, rows ) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

function getStatus(db: Database): Promise<any[]> {
    return new Promise<ISensorReading[]>((resolve, reject) => {
        db.all("SELECT * FROM control_state", (err, rows ) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

function runSQL(db: Database, sql: string): Promise<void> {
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

function openDatabase(filepath: string): Promise<Database> {
    return new Promise((resolve, reject) => {
        try {
            const db: Database = new Database(filepath, (error) => {
                reject(error);
            });
            resolve(db);
        } catch (err) {
            reject(err);
        }
    });
}

function tryClose(db: Database): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            db.close(() => {
                resolve();
            })
        } catch {
            resolve();
        }
    });
}