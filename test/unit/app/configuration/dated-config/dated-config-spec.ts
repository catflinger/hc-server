import "mocha";
import * as chai from "chai";

import { DatedConfig } from "../../../../../src/app/configuration/dated-config";

const expect = chai.expect;

describe("Named Config", () => {

    it("should load with valid data", () => {
        let date: Date = new Date("2018-12-23T12:13:14"); 
        let dc: DatedConfig = new DatedConfig({
            programId: "A",
            date: date.toISOString(),
        }); 
        expect(dc.programId).to.equal("A");
        expect(dc.date.toISOString()).to.equal(date.toISOString());
    });
    it("should fail to load with invalid data", () => {
        expect(() => { new DatedConfig({})}).to.throw;
        expect(() => { new DatedConfig(undefined)}).to.throw;
    });
});
