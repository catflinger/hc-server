import "mocha";
import * as chai from "chai";

const expect = chai.expect;

import { TimeOfDay } from "../../../../src/app/controller/time-of-day";

describe("Time Of Day", () => {
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