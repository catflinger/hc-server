import "mocha";
import * as chai from "chai";

import { ConfigValidation} from "../../../../../src/app/configuration/config-validation";

const expect = chai.expect;

const goodDate = "2018-03-26T12:34:56";
const badDate = "2018-31-32T12:34:56";
const terribleDate = "foo bar";

const now: Date = new Date();

describe("Config Validation", () => {
    describe("getBoolean", () => {
        it("should validate without defaultValue", () => {
            expect(ConfigValidation.getBoolean(true, "A")).to.equal(true);
            expect(ConfigValidation.getBoolean(false, "A")).to.equal(false);
            expect(() => ConfigValidation.getBoolean(1, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getBoolean(undefined, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getBoolean(null, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getBoolean("", "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getBoolean("foo", "ABC")).to.throw(/ABC/);
        });

        it("should validate with defaultValue", () => {
            expect(ConfigValidation.getBoolean(true, "A", true)).to.equal(true);
            expect(ConfigValidation.getBoolean(true, "A", false)).to.equal(true);

            expect(ConfigValidation.getBoolean(false, "A", true)).to.equal(false);
            expect(ConfigValidation.getBoolean(false, "A", false)).to.equal(false);
            
            expect(ConfigValidation.getBoolean(undefined, "A", true)).to.equal(true);
            expect(ConfigValidation.getBoolean(undefined, "A", false)).to.equal(false);
            expect(() => ConfigValidation.getBoolean(null, "ABC", true)).to.throw(/ABC/);
            expect(() => ConfigValidation.getBoolean("", "ABC", true)).to.throw(/ABC/);
            expect(() => ConfigValidation.getBoolean(1, "ABC", true)).to.throw(/ABC/);
            expect(() => ConfigValidation.getBoolean("true", "ABC", true)).to.throw(/ABC/);
        });
    });

    describe("getString", () => {
        it("should validate without defaultValue", () => {
            expect(ConfigValidation.getString("hello", "A")).to.equal("hello");
            expect(ConfigValidation.getString("", "ABC")).to.equal("");
            
            expect(() => ConfigValidation.getString(1, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getString(undefined, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getString(null, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getString(true, "ABC")).to.throw(/ABC/);
        });

        it("should validate with defaultValue", () => {
            expect(ConfigValidation.getString("hello", "A", "goodbye")).to.equal("hello");
            expect(ConfigValidation.getString("", "A", "goodbye")).to.equal("");
            expect(ConfigValidation.getString(undefined, "A", "goodbye")).to.equal("goodbye");
            
            expect(() => ConfigValidation.getString(1, "ABC", "goodbye")).to.throw(/ABC/);
            expect(() => ConfigValidation.getString(null, "ABC", "goodbye")).to.throw(/ABC/);
            expect(() => ConfigValidation.getString(true, "ABC", "goodbye")).to.throw(/ABC/);
        });
    });

    describe("getNumber", () => {
        it("should validate without defaultValue", () => {
            expect(ConfigValidation.getNumber(1, "A")).to.equal(1);
            expect(ConfigValidation.getNumber(NaN, "A")).to.be.NaN;
            expect(ConfigValidation.getNumber(Infinity, "A")).to.be.equal(Infinity);
            expect(ConfigValidation.getNumber(0, "ABC")).to.equal(0);
            
            expect(() => ConfigValidation.getNumber("1", "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getNumber(undefined, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getNumber(null, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getNumber(true, "ABC")).to.throw(/ABC/);
        });

        it("should validate with defaultValue", () => {
            expect(ConfigValidation.getNumber(1, "A", 2)).to.equal(1);
            expect(ConfigValidation.getNumber(NaN, "A", 2)).to.be.NaN;
            expect(ConfigValidation.getNumber(Infinity, "A", 2)).to.equal(Infinity);
            expect(ConfigValidation.getNumber(undefined, "ABC", 2)).to.equal(2);
            
            expect(() => ConfigValidation.getNumber("1", "ABC", 2)).to.throw(/ABC/);
            expect(() => ConfigValidation.getNumber(null, "ABC", 2)).to.throw(/ABC/);
            expect(() => ConfigValidation.getNumber(true, "ABC", 2)).to.throw(/ABC/);
        });
    });

    describe("getDate", () => {
        it("should validate without defaultValue", () => {
            expect(ConfigValidation.getDate(goodDate, "A").toISOString()).to.equal(new Date(goodDate).toISOString());
            
            expect(() => ConfigValidation.getDate(badDate, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(terribleDate, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(1, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(undefined, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(null, "ABC")).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(true, "ABC")).to.throw(/ABC/);
        });

        it("should validate with defaultValue", () => {
            expect(ConfigValidation.getDate(goodDate, "A", now).toISOString()).to.equal(new Date(goodDate).toISOString());
            expect(ConfigValidation.getDate(undefined, "A", now).toISOString()).to.equal(now.toISOString());

            expect(() => ConfigValidation.getDate(badDate, "ABC", now)).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(terribleDate, "ABC", now)).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(1, "ABC", now)).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(null, "ABC", now)).to.throw(/ABC/);
            expect(() => ConfigValidation.getDate(true, "ABC", now)).to.throw(/ABC/);
        });
    });

});