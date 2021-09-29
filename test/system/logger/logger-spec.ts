import "mocha";
import * as chai from "chai";
import * as fs from "fs";
import * as mysql from "mysql";

import { INJECTABLES, ILogger, ILoggerConfig } from "../../../src/types";
import { container } from "./inversify-test.config";

const expect = chai.expect;

let connection: mysql.Connection;

function runQuery(sql: string, args?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
}

function deleteDatabase(config: ILoggerConfig): Promise<void> {
    return runQuery("DROP DATABASE IF EXISTS " + config.database);
}

function createDatabase(config: ILoggerConfig): Promise<void> {
    return runQuery("CREATE DATABASE IF NOT EXISTS " + config.database);
}

function clearDatabase(): Promise<void> {
    return runQuery("DELETE FROM reading")
        // .then(() => {
        //     return runQuery("DELETE FROM sensor");
        // })
        .then(() => {
            return runQuery("DELETE FROM control_state");
        })
        .then(() => {
            return Promise.resolve();
        });
}

function databaseExists(config: ILoggerConfig): Promise<boolean> {
    return runQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", config.database)
        .then((rows) => {
            return Promise.resolve(rows.length === 2);
        });
}

function useDatabase(config: ILoggerConfig): Promise<void> {
    return new Promise((resolve, reject) => {
        connection.changeUser({ database: config.database }, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

describe("Logger", () => {

    let logger: ILogger;

    before(() => {
        logger = container.get<ILogger>(INJECTABLES.Logger);
        connection = mysql.createConnection({
            host: logger.config.server,
            user: logger.config.testUser,
            password: logger.config.testPassword,
            // database: logDatabase,
        });
        connection.connect();
    });

    after(() => {
        return logger.end()
            .then(() => {
                return new Promise<void>((resolve) => {
                    connection.end(() => {
                        resolve();
                    });
                });
            });
    });

    it("should create a new database", () => {
        return deleteDatabase(logger.config)
            .then(() => {
                return createDatabase(logger.config);
            })
            .then(() => {
                return logger.init();
            })
            .then(() => {
                return useDatabase(logger.config);
            })
            .then(() => {
                return databaseExists(logger.config);
            })
            .then((result: boolean) => {
                expect(result).to.be.true;
                return Promise.resolve();
            });
    });

    it("should log a record", () => {
        const date: Date = new Date("2019-12-19T10:23:00");
        const expectedDate = new Date("2019-12-19T10:20:00");
        //const logger = container.get<ILogger>(INJECTABLES.Logger);

        return clearDatabase()
            .then(() => {
                return logger.log(
                    date,
                    [{
                        id: "foo", 
                        description: "a sensor", 
                        role: "hw", 
                        reading: 10.1234567, 
                        displayColor: "black",
                        displayOrder: 100,
                    }],
                    { heating: true, hotWater: false }
                )
            })
            .then((success) => {
                expect(success).to.be.true;
                return runQuery("SELECT * from reading");
            })
            .then((readings: any[]) => {
                expect(readings.length).to.be.equal(1);
                // date should have been rounded to nearest 10 miniutes
                expect(new Date(readings[0].date).toISOString()).to.equal(expectedDate.toISOString());
                expect(readings[0].sensor_id).to.equal("foo");
                // temperature should be in tenths of a degree, whole numbers only
                expect(readings[0].reading).to.equal(101);

                return Promise.resolve();
            })
            .then(() => {
                return runQuery("SELECT * from control_state");
            })
            .then((controlStatuses: any[]) => {
                expect(controlStatuses.length).to.be.equal(1);
                expect(new Date(controlStatuses[0].date).toISOString()).to.equal(expectedDate.toISOString());
                expect(controlStatuses[0].heating).to.equal(1);
                expect(controlStatuses[0].hw).to.equal(0);

                return Promise.resolve();
            });
    });

    it("should not log another record for same time", () => {
        const date1: Date = new Date("2019-12-19T10:19:00");
        const date2: Date = new Date("2019-12-19T10:29:00");
        const date3: Date = new Date("2019-12-19T10:23:00");

        //const logger = container.get<ILogger>(INJECTABLES.Logger);

        return clearDatabase()
            .then(() => {
                return logger.log(
                    date1,
                    [{
                        id: "foo",
                        description: "a sensor",
                        role: "hw",
                        reading: 10.1234567,
                        displayColor: "black",
                        displayOrder: 100,
                    }],
                    { heating: true, hotWater: false }
                );
            })
            .then(() => {
                return logger.log(
                    date2,
                    [{
                        id: "bar",
                        description: "a sensor",
                        role: "hw",
                        reading: 11.1234567,
                        displayColor: "black",
                        displayOrder: 100,
                    }],
                    { heating: true, hotWater: false }
                );
            })
            .then(() => {
                // this should succed: same time slot but different id
                return logger.log(
                    date3,
                    [{
                        id: "fish",
                        description: "a sensor",
                        role: "hw",
                        reading: 11.1234567,
                        displayColor: "black",
                        displayOrder: 100,
                    }],
                    { heating: true, hotWater: false }
                );
            })
            .then(() => {
                // this reading shold be skipped as it resolves to the same id and time as the first reading
                return logger.log(
                    date3,
                    [{
                        id: "foo",
                        description: "a sensor",
                        role: "hw",
                        reading: 12.1234567,
                        displayColor: "black",
                        displayOrder: 100,
                    }],
                    { heating: true, hotWater: false }
                );
            })
            .then(() => {
                return runQuery("SELECT * from reading");
            })
            .then((readings) => {
                expect(readings.length).to.be.equal(3);
                expect(readings[0].sensor_id).to.equal("foo");
                expect(readings[1].sensor_id).to.equal("bar");
                expect(readings[2].sensor_id).to.equal("fish");

                return Promise.resolve();
            });
    });

    it("should log null readings", () => {
        const date: Date = new Date("2019-12-19T10:23:00");
        //const logger = container.get<ILogger>(INJECTABLES.Logger);

        return clearDatabase()
            .then(() => {
                return logger.log(
                    date,
                    [{
                        id: "foo",
                        description: null,
                        role: null,
                        reading: null,
                        displayColor: "black",
                        displayOrder: 100,
                    }],
                    { heating: true, hotWater: false }
                );
            })
            .then(() => {
                return runQuery("SELECT * from reading");
            })
            .then((readings) => {
                expect(readings.length).to.be.equal(1);
                // date should have been rounded to nearest 10 miniutes
                expect(new Date(readings[0].date).toISOString()).to.equal(new Date("2019-12-19T10:20:00").toISOString());
                expect(readings[0].sensor_id).to.equal("foo");
                expect(readings[0].reading).to.be.null;
                return Promise.resolve();
            });
    });
});
