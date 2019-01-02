import "mocha";
import * as chai from "chai";

import { BasicHeatingRule } from "../../../../../src/app/configuration/basic-heating-rule";
import { TimeOfDay } from "../../../../../src/app/controller/time-of-day";

const expect = chai.expect;

describe("BasicHeatingRule", () => {

    it("should load with valid data", () => {
        let r: BasicHeatingRule = new BasicHeatingRule(goodData); 
        expect(r.startTime.hour).to.equal(12);
        expect(r.endTime.hour).to.equal(13);
    });

    it("should fail to load with bad data", () => {
        let badData = Object.assign({}, goodData);
        badData.endTime = undefined;
        expect(() => { new BasicHeatingRule(badData) }).to.throw; 

        badData = Object.assign({}, goodData);
        badData.startTime = undefined;
        expect(() => { new BasicHeatingRule(badData) }).to.throw; 
    });

    it("should not implement applyRule", () => {
        let r: BasicHeatingRule = new BasicHeatingRule(goodData); 
        expect(() => { r.applyRule(null, [], new TimeOfDay(goodData.startTime)) }).to.throw; 
    });
});

let goodData = {
    startTime: {
        hour: 12,
        minute: 12,
        second: 12
    },
    endTime: {
        hour: 13,
        minute: 12,
        second: 12
    }
}