import "mocha";
import * as chai from "chai";

import { Configuration } from "../../../../../src/app/configuration/configuration";

const expect = chai.expect;

describe("Program", () => {

    describe("should load with valid data", () => {
        it ("should load with empty arrays", () => {
            let c: Configuration = new Configuration(goodDataEmpty); 
            expect(c.getNamedConfig().saturdayProgramId).to.equal("A");
        });
        it ("should load with full arrays", () => {
            let c: Configuration = new Configuration(goodData); 
            expect(c.getNamedConfig().saturdayProgramId).to.equal("A");
        });
    });
        it("should fail to load with invalid data", () => {
        expect(() => { new Configuration({})}).to.throw;
        expect(() => { new Configuration(undefined)}).to.throw;
    });
});

const goodDataEmpty: any = {
    namedConfig: {
        saturdayProgramId: "A",
        sundayProgramId: "B",
        weekdayProgramId: "C",
    },
    datedConfig: [] as any[],
    programConfig: [] as any[],
    sensorConfig: [] as any[],
};

const goodData: any = {
    namedConfig: {
        saturdayProgramId: "A",
        sundayProgramId: "B",
        weekdayProgramId: "C",
    },
    datedConfig: [
        {
            programId: "X",
            date: "2012-12-12T00:00:00"
        },
        {
            programId: "Y",
            date: "2010-10-10T00:00:00"
        }
    ],
    programConfig: [
        {
            name: "P1",
            minHwTemp: 12,
            maxHwTemp: 14
        },
        {
            name: "P2",
            minHwTemp: 12,
            maxHwTemp: 14
        }

    ],
    sensorConfig: [
        {
            id: "A",
            description: "B",
        },
        {
            id: "C",
            description: "D",
        }    
    ],
};
