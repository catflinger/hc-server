import "mocha";
import * as chai from "chai";

import { Controller } from "../../../src/app/controller/controller";
import { container } from "./inversify-test.config";
import { IController, INJECTABLES, ISystem, ISensorManager, IConfigManager, IProgram } from "../../../src/types";
import { MockSystem } from "./mocks/mock-system";
import { MockSensorManager } from "./mocks/mock-sensor-manager";
import { MockConfigManager } from "./mocks/mock-config-manager";
import { Configuration } from "../../../src/app/configuration/configuration";

const expect = chai.expect;

const controller: Controller = container.get<IController>(INJECTABLES.Controller) as Controller;
const mockSystem: MockSystem = container.get<ISystem>(INJECTABLES.System) as MockSystem;
const mockSensorManager: MockSensorManager = container.get<ISensorManager>(INJECTABLES.SensorManager) as MockSensorManager;
const mockConfigManager: MockConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager) as MockConfigManager;

describe("Controller", () => {

    describe("getActiveProgram", () => {

        before (() => {
            controller.start();
        });

        it("should return default if nothing configured", async () => {

            mockConfigManager.config = new Configuration(configA);
            let program: IProgram = await controller.getActiveProgram(new Date());

            expect(program.id).to.equal("");
            expect(program.name).to.equal("");
            expect(program.maxHwTemp).to.equal(50);
            expect(program.minHwTemp).to.equal(45);
            expect(program.getRules()).to.have.lengthOf(0);
        });

        it("should choose a named program for weekdays", async () => {

            mockConfigManager.config = new Configuration(configB);
            let program: IProgram = await controller.getActiveProgram(new Date("2019-01-01T01:01:01")); // a Tuesday

            expect(program.id).to.equal("21");
            expect(program.name).to.equal("weekday");
        });

        it("should choose a named program for saturdays", async () => {

            mockConfigManager.config = new Configuration(configB);
            let program: IProgram = await controller.getActiveProgram(new Date("2019-01-05T01:01:01")); // a Saturday

            expect(program.id).to.equal("23456");
            expect(program.name).to.equal("saturday");
        });

        it("should choose a named program for sundays", async () => {

            mockConfigManager.config = new Configuration(configB);
            let program: IProgram = await controller.getActiveProgram(new Date("2019-01-06T01:01:01")); // a Sunday

            expect(program.id).to.equal("dr4edfgf");
            expect(program.name).to.equal("sunday");
        });

        it("should choose a dated program in preference to a named program", async () => {

            mockConfigManager.config = new Configuration(configC);
            let program: IProgram = await controller.getActiveProgram(new Date("2019-01-06T01:01:01")); // a Sunday

            expect(program.id).to.equal("foo");
            expect(program.name).to.equal("dated");
        });

    });
});

const configA: any = {
    "programConfig": [],
    "namedConfig": {
        "weekdayProgramId": "",
        "saturdayProgramId": "",
        "sundayProgramId": ""
    },
    "datedConfig": [],
    "sensorConfig": []
};

const configB: any = {
    "programConfig": [
        {
            id: "21",
            name: "weekday",
            minHwTemp: 12,
            maxHwTemp: 14
        },
        {
            id: "23456",
            name: "saturday",
            minHwTemp: 12,
            maxHwTemp: 14
        },
        {
            id: "dr4edfgf",
            name: "sunday",
            minHwTemp: 12,
            maxHwTemp: 14
        }
    ],
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

const configC: any = {
    "programConfig": [
        {
            id: "21",
            name: "weekday",
            minHwTemp: 12,
            maxHwTemp: 14
        },
        {
            id: "23456",
            name: "saturday",
            minHwTemp: 12,
            maxHwTemp: 14
        },
        {
            id: "dr4edfgf",
            name: "sunday",
            minHwTemp: 12,
            maxHwTemp: 14
        },
        {
            id: "foo",
            name: "dated",
            minHwTemp: 12,
            maxHwTemp: 14
        }

    ],
    "namedConfig": {
        "weekdayProgramId": "21",
        "saturdayProgramId": "23456",
        "sundayProgramId": "dr4edfgf"
    },
    "datedConfig": [
        { "programId": "foo", "date": "2019-01-06T01:01:01" }
    ],
    "sensorConfig": [
        { "id": "abcde12345", "description": "hot water top of tank", "role": "hw", "deleted": false }
    ]
};
