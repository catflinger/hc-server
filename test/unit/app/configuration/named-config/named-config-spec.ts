import "mocha";
import * as chai from "chai";

import { NamedConfig } from "../../../../../src/app/configuration/named-config";

const expect = chai.expect;

describe("Named Config", () => {

    it("should load with valid data", () => {
        let nc: NamedConfig = new NamedConfig({
            saturdayProgramId: "A",
            sundayProgramId: "B",
            weekdayProgramId: "C",
        }); 
        expect(nc.saturdayProgramId).to.equal("A");
        expect(nc.sundayProgramId).to.equal("B");
        expect(nc.weekdayProgramId).to.equal("C");
    });
    it("should fail to load with invalid data", () => {
        expect(() => { new NamedConfig({})}).to.throw;
        expect(() => { new NamedConfig(undefined)}).to.throw;
    });
});
