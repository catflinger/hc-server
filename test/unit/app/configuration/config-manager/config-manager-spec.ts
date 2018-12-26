import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import * as path from "path";

import { ConfigManager } from "../../../../../src/app/configuration/config-manager";
import { container } from "./inversify-test.config";
import { IConfigManager, INJECTABLES } from "../../../../../src/types";

const configPath = path.join(container.get<string>(INJECTABLES.ConfigRootDir), "hc-config.json");

const cfm: IConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager);

describe("config-manager", () => {

    before(() => {
        // delete any existing config file
        return new Promise((resolve, reject) => {
            fs.unlink(configPath, (err) => {
                if (err && !err.message.startsWith("ENOENT")) {
                    reject(err);
                } else {
                    resolve(null);
                }
            });
        });
    });

    describe("getConfig", () => {

        it("should fail to load with no config", () => {
            return cfm.getConfig()
                .then(
                    (data) => { throw new Error("getConfig returned when config missing") },
                    (reason) => { /* worked as expected */ });
        });

        it("should load with good config", () => {
            fs.writeFileSync(configPath, JSON.stringify(goodConfig));
            return cfm.getConfig()
                .then((data) => { /* worked as expected */ })
                .catch((e) => { throw e; });
        });

        it("should fail to load with bad config", () => {
            fs.writeFileSync(configPath, JSON.stringify(badConfig));

            return cfm.getConfig()
                .then((data) => { throw new Error("getConfig returned config data from bad data"); })
                .catch((e) => { /* worked as expected */ });
        });

    });

    describe("getConfig", () => {
        it("should have some tests written", () => {
            throw new Error("No test written yet");
        });
    });
});

const goodConfig: any = {
    "programConfig": [],
    "namedConfig": {
        "weekdayProgramId": "21",
        "saturdayProgramId": "23456",
        "sundayProgramId": "dr4edfgf"
    },
    "datedConfig": [
        { "programId": "abcde", "date": "2018-11-23T12:12:12" }
    ],
    "sensorConfig": [
        { "id": "abcde12345", "description": "hot water top of tank", "role": "hw", "deleted": false }
    ]
};

const badConfig: any = {
    "I AM": "BAD CONFIG DATA"
};


