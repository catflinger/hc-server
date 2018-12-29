import "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { TimeOfDay } from "../../../../src/app/controller/time-of-day";

describe("Time Of Day", () => {
    describe("constructor", () => {
        it(" should construct with good data", () => {
            let t = new TimeOfDay(goodData1);
            expect(t.hour).to.equal(12);
            expect(t.minute).to.equal(31);
            expect(t.second).to.equal(45);
    
            t = new TimeOfDay(goodData2);
            expect(t.hour).to.equal(12);
            expect(t.minute).to.equal(31);
            expect(t.second).to.equal(0);
        });
    
        it(" should fail to construct with bad data", () => {
            expect(() => { new TimeOfDay(undefined)}).to.throw;
    
            // hour missing
            expect(test(undefined, 0, 0, 0, 0, 0)).to.be.false;
    
            // minute missing
            expect(test(0, undefined, 0, 0, 0, 0)).to.be.false;
    
            // hour invalid
            expect(test(-1, 0, 0, 0, 0, 0)).to.be.false;
            expect(test(24, 0, 0, 0, 0, 0)).to.be.false;
            expect(test(NaN, 0, 0, 0, 0, 0)).to.be.false;
    
            // minute invalid
            expect(test(0, -1, 0, 0, 0, 0)).to.be.false;
            expect(test(0, 60, 0, 0, 0, 0)).to.be.false;
            expect(test(0, NaN, 0, 0, 0, 0)).to.be.false;
    
            // second invalid
            expect(test(0, 0, -1, 0, 0, 0)).to.be.false;
            expect(test(0, 0, 60, 0, 0, 0)).to.be.false;
            expect(test(0, NaN, 60, 0, 0, 0)).to.be.false;
    
            // control to validate test function
            expect(test(1, 2, 3, 1, 2, 3)).to.be.true;
        });
    });

    describe("earlier than", () => {
        it("should reject same time", () => {
            expect(todB.isEarlierThan(todB)).to.be.false;
        });
        it("should reject earlier time", () => {
            expect(todB.isEarlierThan(todA)).to.be.false;
        });
        it("should accept later times", () => {
            expect(todB.isEarlierThan(todC)).to.be.true;
        });
    });

    describe("later than", () => {
        it("should reject same time", () => {
            expect(todB.isLaterThan(todB)).to.be.false;
        });
        it("should accept earlier time", () => {
            expect(todB.isLaterThan(todA)).to.be.true;
        });
        it("should reject later times", () => {
            expect(todB.isLaterThan(todC)).to.be.false;
        });
    });

    describe("same as", () => {
        it("should accept same time", () => {
            expect(todA.isSameAs(todA)).to.be.true;
        });
        it("should reject earlier time", () => {
            expect(todA.isSameAs(todB)).to.be.false;
        });
        it("should reject later times", () => {
            expect(todA.isSameAs(todC)).to.be.false;
        });
    });
});

function test(h: any, m: any, s: any, eh: number, em: number, es: number): boolean {
    let data = {
        hour: h,
        minute: m,
        second: s,
    };

    try {
        let tod = new TimeOfDay(data);
        if (tod.hour === eh && tod.minute === em && tod.second === es) {
            return true;
        }
    } catch {
        return false;
    }
    
    return false;
}

const goodData1 = {
    hour: 12,
    minute: 31,
    second: 45
}

const goodData2 = {
    hour: 12,
    minute: 31
}

let todA: TimeOfDay = new TimeOfDay({
    hour: 12,
    minute: 13,
    second: 13
});
let todB: TimeOfDay = new TimeOfDay({
    hour: 12,
    minute: 13,
    second: 14
});
let todC: TimeOfDay = new TimeOfDay({
    hour: 12,
    minute: 13,
    second: 15
});
