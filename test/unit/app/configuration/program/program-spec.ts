import "mocha";
import * as chai from "chai";

import { Program } from "../../../../../src/app/configuration/program";
import { Rule } from "../../../../../src/app/configuration/rule";
import { TimeOfDay } from "../../../../../src/app/controller/time-of-day";

const expect = chai.expect;

describe("Program", () => {

    describe("should load with valid data", () => {
        it ("should load with id specified", () => {
            let p: Program = new Program(goodDataWithId); 
            expect(p.id).to.equal("james");
            expect(p.name).to.equal("dean");
            expect(p.maxHwTemp).to.equal(14);
            expect(p.minHwTemp).to.equal(12);
        });
        it ("should load with no id specified", () => {
            let p: Program = new Program(goodDataNoId); 
            expect(p.id.length).to.equal(36);
            expect(p.name).to.equal("dean");
            expect(p.maxHwTemp).to.equal(14);
            expect(p.minHwTemp).to.equal(12);
        });
        it ("should load with rules specified", () => {
            let p: Program = new Program(goodDataWithRules); 
            expect(p.id).to.equal("james");
            expect(p.name).to.equal("dean");
            expect(p.maxHwTemp).to.equal(14);
            expect(p.minHwTemp).to.equal(12);
            expect(p.getRules().length).to.equal(2);
            expect(p.getRules()[0].startTime.hour).to.equal(10);
            expect(p.getRules()[1].startTime.hour).to.equal(12);
        });
    });

    it("should fail to load with invalid data", () => {
        expect(() => { new Program({})}).to.throw;
        expect(() => { new Program(undefined)}).to.throw;
    });
});

const goodDataNoId = {
    name: "dean",
    minHwTemp: 12,
    maxHwTemp: 14
};
const goodDataWithId = {
    id: "james",
    name: "dean",
    minHwTemp: 12,
    maxHwTemp: 14
};
const goodDataWithRules = {
    id: "james",
    name: "dean",
    minHwTemp: 12,
    maxHwTemp: 14,
    rules:[
        {
            startTime: {
                hour: 10,
                minute: 10,
                second: 10
            },
            endTime: {
                hour: 11,
                minute: 11,
                second: 11
            }
        },
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
            }
        }
    ]
};
