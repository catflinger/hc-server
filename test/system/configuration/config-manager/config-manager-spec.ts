import "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

chai.use(chaiAsPromised);
const expect = chai.expect;

import { container } from "./inversify-test.config";
import { IConfigManager, INJECTABLES } from "../../../../src/types";
import { Configuration, IConfiguration } from "../../../../src/common/types";

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
            return expect(cfm.start()).to.eventually.be.rejected;
        });

        it("should load with good config", async () => {
            fs.writeFileSync(configPath, JSON.stringify(goodConfig));
            await cfm.start();
            const config = cfm.getConfig();
            expect(config).to.have.nested.property("namedConfig.saturdayProgramId", "23456");
        });

        it("should fail to load with bad config", () => {
            fs.writeFileSync(configPath, JSON.stringify(badConfig));
            return expect(cfm.start()).to.eventually.be.rejected;
        });

    });

    describe("setConfig", () => {
        it("should save valid config", async () => {
            const c: IConfiguration = new Configuration(goodConfig);
            const testValue = "xyz";
            c.getNamedConfig().saturdayProgramId = testValue;

            await cfm.setConfig(c);
            const data: any = fs.readFileSync(configPath, "utf-8");
            const raw = JSON.parse(data);
            expect(raw).to.have.nested.property("namedConfig.saturdayProgramId", testValue);
            const config = cfm.getConfig();
            expect(config).to.have.nested.property("namedConfig.saturdayProgramId", testValue);
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
