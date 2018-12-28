import "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

chai.use(chaiAsPromised);
const expect = chai.expect;

import { container } from "./inversify-test.config";
import { IConfigManager, INJECTABLES, IConfiguration } from "../../../../src/types";
import { Configuration } from "../../../../src/app/configuration/configuration";
import { resolve } from "url";

const writeFileP = util.promisify(fs.writeFile);
const readFileP = util.promisify(fs.readFile);

// function to delete a file only it if exists
const deleteFileP = (filepath: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        fs.unlink(filepath, (err) => {
            if (!err ||err.message.startsWith("ENOENT")) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    });
} 

const configPath = path.join(container.get<string>(INJECTABLES.ConfigRootDir), "hc-config.json");
const cfm: IConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager);

describe("config-manager", () => {

    beforeEach(() => {
        // delete any existing config file
        return deleteFileP(configPath);
    });

    describe("getConfig", () => {

        it("should fail to load with no config", () => {
            return expect(cfm.getConfig()).to.eventually.be.rejected;
        });

        it("should load with good config", () => {
            return writeFileP(configPath, JSON.stringify(goodConfig))
            .then(() => { 
                return expect(cfm.getConfig()).to.eventually.be.fulfilled; 
            });
        });

        it("should fail to load with bad config", () => {
            writeFileP(configPath, JSON.stringify(badConfig))
            .then(() => {
                return expect(cfm.getConfig()).to.eventually.be.rejected;
            });
        });

    });

    describe("setConfig", () => {
        it("should save valid config", () => {
            const c: IConfiguration = new Configuration(goodConfig);
            const testValue = "xyz";
            c.getNamedConfig().saturdayProgramId = testValue;

            return cfm.setConfig(c)
            .then(() => {
                const promiseOfData: Promise<string> = readFileP(configPath, "utf-8")
                .then((data) => { return JSON.parse(data); });
                
                return Promise.all([
                    expect(promiseOfData).to.eventually.be.fulfilled,
                    expect(promiseOfData).to.eventually.have.nested.property("namedConfig.saturdayProgramId"),
                ]);
            })
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
