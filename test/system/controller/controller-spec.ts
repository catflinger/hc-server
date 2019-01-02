import "mocha";
import * as chai from "chai";

import { Controller } from "../../../src/app/controller/controller";
import { container } from "./inversify-test.config";
import { IController, INJECTABLES, ISystem, ISensorManager, IConfigManager, IProgram, IControlState } from "../../../src/types";
import { MockSystem } from "./mocks/mock-system";
import { MockSensorManager } from "./mocks/mock-sensor-manager";
import { MockConfigManager } from "./mocks/mock-config-manager";
import { Configuration } from "../../../src/app/configuration/configuration";

const expect = chai.expect;

const mockSystem: MockSystem = container.get<ISystem>(INJECTABLES.System) as MockSystem;
const mockSensorManager: MockSensorManager = container.get<ISensorManager>(INJECTABLES.SensorManager) as MockSensorManager;
const mockConfigManager: MockConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager) as MockConfigManager;

describe("Controller", () => {

    describe("getActiveProgram", () => {
        const controller: Controller = container.get<IController>(INJECTABLES.Controller) as Controller;

        before (() => {
            controller.start();
        });

        it("should start with everything off", () => {
            const cs: IControlState = controller.getControlState();
            expect(cs.heating).to.equal(false);
            expect(cs.hotWater).to.equal(false);
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

    describe("refresh", () => {
        const controller: Controller = container.get<IController>(INJECTABLES.Controller) as Controller;

        before (() => {
            controller.start();
        });

        it("should refresh with empty config", async () => {
            mockConfigManager.config = new Configuration(configA);
            let cs: IControlState = controller.getControlState();
            expect(cs.heating).to.equal(false);

            controller.refresh(new Date("2019-01-06T01:01:01"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(false);
        });

        it("should refresh with rules configured", async () => {
            mockConfigManager.config = new Configuration(configD);
            let cs: IControlState = controller.getControlState();
            expect(cs.heating).to.equal(false);

            // too early
            await controller.refresh(new Date("2019-01-06T01:01:01"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(false);

            // on time for 1st rule
            await controller.refresh(new Date("2019-01-06T13:00:00"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(true);

            // between the two rules
            await controller.refresh(new Date("2019-01-06T14:01:01"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(false);

            // on time for 2nd rule
            await controller.refresh(new Date("2019-01-06T14:55:55"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(true);
        });
    });

    describe("hot water", () => {
        const controller: Controller = container.get<IController>(INJECTABLES.Controller) as Controller;

        before (() => {
            controller.start();
            mockConfigManager.config = new Configuration(configE);
        });

        it("should control hw temperature", async () => {
            mockSensorManager.setHwTemp(10);

            // should start with hw off
            let cs = controller.getControlState();
            expect(cs.hotWater).to.equal(false);

            // turn on when below threshold
            await controller.refresh(new Date("2019-01-06T02:00:00"));
            cs = controller.getControlState();
            expect(cs.hotWater).to.equal(true);

            // remain on when inside threshold
            mockSensorManager.setHwTemp(20);
            await controller.refresh(new Date("2019-01-06T02:00:00"));
            cs = controller.getControlState();
            expect(cs.hotWater).to.equal(true);
            
            // turn off when above threshold
            mockSensorManager.setHwTemp(40);
            await controller.refresh(new Date("2019-01-06T02:00:00"));
            cs = controller.getControlState();
            expect(cs.hotWater).to.equal(false);
            
            // remain off when inside threshold
            mockSensorManager.setHwTemp(40);
            await controller.refresh(new Date("2019-01-06T02:00:00"));
            cs = controller.getControlState();
            expect(cs.hotWater).to.equal(false);
            
            // turn on again off when below threshold
            mockSensorManager.setHwTemp(10);
            await controller.refresh(new Date("2019-01-06T02:00:00"));
            cs = controller.getControlState();
            expect(cs.hotWater).to.equal(true);
            
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
            maxHwTemp: 30,
        },
        {
            id: "23456",
            name: "saturday",
            minHwTemp: 12,
            maxHwTemp: 30,
        },
        {
            id: "dr4edfgf",
            name: "sunday",
            minHwTemp: 12,
            maxHwTemp: 30,
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
            maxHwTemp: 30,
        },
        {
            id: "23456",
            name: "saturday",
            minHwTemp: 12,
            maxHwTemp: 30,
        },
        {
            id: "dr4edfgf",
            name: "sunday",
            minHwTemp: 12,
            maxHwTemp: 30,
        },
        {
            id: "foo",
            name: "dated",
            minHwTemp: 12,
            maxHwTemp: 30,
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

const configD: any = {
    "programConfig": [
        {
            id: "foo",
            name: "one rule",
            minHwTemp: 12,
            maxHwTemp: 30,
            rules: [
                {
                    startTime: {
                        hour: 12,
                        minute: 12,
                        second: 12
                    },
                    endTime: {
                        hour: 13,
                        minute: 13,
                        second: 13
                    },
                },
                {
                    startTime: {
                        hour: 14,
                        minute: 14,
                        second: 15
                    },
                    endTime: {
                        hour: 15,
                        minute: 15,
                        second: 15
                    },
                }

            ]
        },
    ],
    "namedConfig": {
        "weekdayProgramId": "",
        "saturdayProgramId": "",
        "sundayProgramId": ""
    },
    "datedConfig": [
        { "programId": "foo", "date": "2019-01-06T02:00:00" }
    ],
    "sensorConfig": []
};
const configE: any = {
    "programConfig": [
        {
            id: "foo",
            name: "one rule",
            minHwTemp: 12,
            maxHwTemp: 30,
            rules: []
        },
    ],
    "namedConfig": {
        "weekdayProgramId": "",
        "saturdayProgramId": "",
        "sundayProgramId": ""
    },
    "datedConfig": [
        { "programId": "foo", "date": "2019-01-06T02:00:00" }
    ],
    "sensorConfig": []
};

