import "mocha";
import * as chai from "chai";

import { Controller } from "../../../src/app/controller/controller";
import { container } from "./inversify-test.config";
import { IController, INJECTABLES, ISensorManager, IConfigManager, IOverrideManager } from "../../../src/types";
import { MockSensorManager } from "./mocks/mock-sensor-manager";
import { MockConfigManager } from "./mocks/mock-config-manager";
import { IControlState, IProgram, IRuleConfig } from "../../../src/common/interfaces";
import { Configuration, Override, TimeOfDay } from "../../../src/common/types";
import { MockOverrideManager } from "./mocks/mock-override-manager";
import { RuleConfig } from "../../../src/common/configuration/rule-config";

const expect = chai.expect;

const mockSensorManager: MockSensorManager = container.get<ISensorManager>(INJECTABLES.SensorManager) as MockSensorManager;
const mockConfigManager: MockConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager) as MockConfigManager;
const mockOverrideManager: MockOverrideManager = container.get<IOverrideManager>(INJECTABLES.OverrideManager) as MockOverrideManager;

describe("Controller", () => {

    describe("getActiveProgram", () => {
        const controller: Controller = container.get<IController>(INJECTABLES.Controller) as Controller;

        before(() => {
            mockConfigManager.config = new Configuration(configA);
            return controller.start();
        });

        it("should return default program if nothing configured", async () => {

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

        before(() => {
            mockConfigManager.config = new Configuration(configA);
            return controller.start();
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

        it("should refresh with Thermostat rule configured", async () => {
            mockConfigManager.config = new Configuration(configF);
            let cs: IControlState = controller.getControlState();

            // TO DO: thisis  very flaky, depends on result from previous test.  Fix it.
            expect(cs.heating).to.equal(true);

            // too early
            await controller.refresh(new Date("2019-01-06T01:01:01"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(false);

            // on time for 1st rule
            await controller.refresh(new Date("2019-01-06T13:00:00"));

            // 1st rule has high temp, heating needs to come on
            cs = controller.getControlState();
            expect(cs.heating).to.equal(true);

            // between the two rules
            await controller.refresh(new Date("2019-01-06T14:01:01"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(false);

            // on time for 2nd rule, has low temp, room already warm enough
            await controller.refresh(new Date("2019-01-06T14:55:55"));

            cs = controller.getControlState();
            expect(cs.heating).to.equal(false);
        });

        it("should override program rules", async () => {
            const today: Date = new Date("2019-01-06T18:00:00");

            mockConfigManager.config = new Configuration(configD);
            mockOverrideManager.overrides = [];
            await controller.refresh(today);

            let cs: IControlState = controller.getControlState();
            expect(cs.heating).to.equal(false);
            expect(cs.hotWater).to.equal(false);

            let rule: IRuleConfig = new RuleConfig({
                id: "",
                startTime: {
                    hour: 17,
                    minute: 17,
                    second: 17
                },
                endTime: {
                    hour: 18,
                    minute: 18,
                    second: 18
                },
            });

            mockOverrideManager.overrides.push(new Override({
                rule,
                date: today
            }));

            await controller.refresh(today);
            cs = controller.getControlState();
            expect(cs.heating).to.equal(true);
            expect(cs.hotWater).to.equal(false);
        });
    });

    describe("hot water", () => {
        const controller: Controller = container.get<IController>(INJECTABLES.Controller) as Controller;

        before(() => {
            mockConfigManager.config = new Configuration(configE);
            return controller.start();
        });

        it("should control hw temperature", async () => {
            mockSensorManager.setHwTemp(10);

            // turn on when below threshold
            await controller.refresh(new Date("2019-01-06T02:00:00"));
            let cs = controller.getControlState();
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

        it("should boost hw temperature", async () => {
            mockSensorManager.setHwTemp(60);
            await controller.refresh(new Date("2019-01-06T02:00:00"));
            let cs = controller.getControlState();
            expect(cs.hotWater).to.equal(false);

            controller.hwBoost();
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
        {
            "programId": "abcde",
            dayOfYear: {
                year: 2019,
                month: 11,
                day: 23
            }
        }
    ],
    "sensorConfig": [
        { 
            "id": "abcde12345", 
            "description": "hot water top of tank", 
            "role": "hw", 
            "displayColor": "black",
            "displayOrder": 1
        }
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
        { 
            "programId": "foo",
            dayOfYear: {
                year: 2019,
                month: 1,
                day: 6
            } 
        }
    ],
    "sensorConfig": [
        { 
            "id": "abcde12345", 
            "description": "hot water top of tank", 
            "role": "hw", 
            "displayColor": "black",
            "displayOrder": 1
        }
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
                    id: null,
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
                    id: null,
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
        { 
            "programId": "foo", 
            dayOfYear: {
                year: 2019,
                month: 1,
                day: 6
            } 
        }
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
        { 
            "programId": "foo", 
            dayOfYear: {
                year: 2019,
                month: 1,
                day: 6
            } 
        }
    ],
    "sensorConfig": []
};

const configF: any = {
    "programConfig": [
        {
            id: "foo",
            name: "one rule",
            minHwTemp: 12,
            maxHwTemp: 30,
            rules: [
                {
                    id: null,
                    role: "bedroom",
                    temp: 20,
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
                    id: null,
                    role: "bedroom",
                    temp: 10,
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
        { 
            "programId": "foo", 
            dayOfYear: {
                year: 2019,
                month: 1,
                day: 6
            } 
        }
    ],
    "sensorConfig": [
        { 
            "id": "abcde12345", 
            "description": "bedroom", 
            "role": "bedroom", 
            "displayColor": "black",
            "displayOrder": 1
        }
    ]
};
