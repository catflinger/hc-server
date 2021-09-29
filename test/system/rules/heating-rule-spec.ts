import "mocha";
import * as chai from "chai";

import { container } from "./inversify-test.config";
import { INJECTABLES, IRule } from "../../../src/types";
import { IRuleConfig } from "../../../src/common/interfaces";
import { TimeOfDay } from "../../../src/common/types";


const ruleFactory = container.get<(ruleConfig: IRuleConfig) => IRule>(INJECTABLES.RuleFactory);

const expect = chai.expect;

describe("Heating Rule", () => {
    
    describe("Basic Heating Rule", () => {
        before(() => {
            // return controller.start();
        });

        it("should create", async () => {

            let config: IRuleConfig = {
                id: "abcde",
                startTime: new TimeOfDay({hour: 6, minute: 6, second: 6}),
                endTime: new TimeOfDay({hour: 7, minute: 7, second: 7}),
            };
            let rule: IRule = ruleFactory(config);

            expect(rule).not.to.be.undefined;
        });
    });

    describe("Thermostatic Heating Rule", () => {
        before(() => {
            // return controller.start();
        });

        it("should create", async () => {

            let config: IRuleConfig = {
                id: "abcde",
                startTime: new TimeOfDay({hour: 6, minute: 6, second: 6}),
                endTime: new TimeOfDay({hour: 7, minute: 7, second: 7}),
                role: "bedroom",
                temp: 19,
            };
            let rule: IRule = ruleFactory(config);

            expect(rule).not.to.be.undefined;
        });
    });

});
