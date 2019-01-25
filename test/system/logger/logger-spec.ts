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

const expect = chai.expect;

const logRoot = container.get<string>(INJECTABLES.LogRootDir);

const dbFile = path.join(logRoot, "hc-log.db");
const journalFile = path.join(logRoot, "hc-log.db-journal");

function deleteDatabase() {
    if (fs.existsSync(dbFile)) {
        fs.unlinkSync(dbFile);
    }
    if (fs.existsSync(journalFile)) {
        fs.unlinkSync(journalFile);
    }
}

function clearDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = new Database(dbFile, (error) => {
            if (error) { 
                reject(error);
            } else {
                db.run("DELETE FROM reading WHERE 1", (error) => {
                    if (error) { 
                        reject(error);
                    } else {
                        db.run("DELETE FROM sensor WHERE 1", (error) => {
                            if (error) { 
                                reject(error);
                            } else {
                                db.run("DELETE from control_state WHERE 1", (error) => {
                                    if (error) { 
                                        reject(error);
                                    } else {
                                        db.close();
                                        resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}

describe("Logger", () => {
    let logger: ILogger;

    before (() => {
        logger = container.get<ILogger>(INJECTABLES.Logger);
    });

    it("should create a new database", async () => {
        deleteDatabase();

        await logger.init();
        expect(fs.existsSync(dbFile)).to.be.true;
    });

    it("should log a record", async () => {
        
        await clearDatabase();

        const date: Date = new Date("2019-12-19T10:23:00");
        const expectedDate = new Date("2019-12-19T10:20:00");
        const logger = container.get<ILogger>(INJECTABLES.Logger);

        await logger.log(
            date, 
            [ { id: "foo", description: "a sensor", role: "hw", reading: 10.1234567 }], 
            { heating: true, hotWater: false }
        );

        const db = new Database(dbFile);
        const readings = await getReadings(db);

        expect(readings.length).to.be.equal(1);
        // date should have been rounded to nearest 10 miniutes
        expect(new Date(readings[0].date).toISOString()).to.equal(new Date("2019-12-19T10:20:00").toISOString());
        expect(readings[0].sensor_id).to.equal("foo");
        // temperature should be in tenths of a degree, whole numbers only
        expect(readings[0].reading).to.equal(101);

        const controlStatus = await getStatus(db);

        expect(new Date(controlStatus[0].date).toISOString()).to.equal(expectedDate.toISOString());
        expect(controlStatus.length).to.be.equal(1);
        expect(controlStatus[0].heating).to.equal(1);
        expect(controlStatus[0].hw).to.equal(0);

        db.close();
    });

    it("should not log another record for same time", () => {
        expect(false).to.be.true;
    });

    it("should log null readings", () => {
        expect(false).to.be.true;
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