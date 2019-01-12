import "mocha";
import * as chai from "chai";

import { container } from "./inversify-test.config";

const expect = chai.expect;

import { IOverrideManager, INJECTABLES } from "../../../src/types";
import { BasicHeatingRule, TimeOfDay, IOverride } from "../../../src/common/types";
import { MockClock } from "./mock-clock";

const clock: MockClock = container.get<MockClock>(INJECTABLES.Clock);
clock.date = new Date("2019-04-04:00:00:00");

describe("OverrideManager", () => {

    describe("constructor", () => {
        it("should construct with no overrides", () => {
            const overrideManager: IOverrideManager = container.get<IOverrideManager>(INJECTABLES.OverrideManager);
            expect(overrideManager).not.to.undefined;
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(Array.isArray(ovs)).to.be.true;
            expect(ovs.length).to.equal(0);
        });
    });

    describe("addOverride, getOverrides and clear", () => {
        let overrideManager: IOverrideManager;

        before(() => {
            overrideManager = container.get<IOverrideManager>(INJECTABLES.OverrideManager);
        });

        it("should add an override", () => {
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: clock.timeOfDay(),
                endTime: clock.timeOfDay().addMinutes(7),
            }));
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(Array.isArray(ovs)).to.be.true;
            expect(ovs.length).to.equal(1);
        });

        it("should add another override", () => {
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: clock.timeOfDay().addMinutes(5),
                endTime: clock.timeOfDay().addMinutes(10),
            }));
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(2);
        });

        it("should clear all overrides", () => {
            overrideManager.clearOverrides();
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(0);
        });

    });

    describe("housekeep", () => {
        let overrideManager: IOverrideManager;

        before(() => {
            overrideManager = container.get<IOverrideManager>(INJECTABLES.OverrideManager);
        });

        it("should remove expired overrides", () => {
            // NOTE: housekeep time will be run on 2019-04-04 at 1pm

            // EXPIRE add one day before
            clock.date = new Date("2019-04-03T00:00:00");
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 22, minute: 0, second: 0}),
            }));

            // EXPIRE add one day after
            clock.date = new Date("2019-04-05T00:00:00");
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 22, minute: 0, second: 0}),
            }));

            // EXPIRE add one early and expired
            clock.date = new Date("2019-04-04T00:00:00");
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 12, minute: 0, second: 0}),
            }));

            // KEEP add one early but still current
            clock.date = new Date("2019-04-04T00:00:00");
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 22, minute: 0, second: 0}),
            }));

            // KEEP add one later in day
            clock.date = new Date("2019-04-04T00:00:00");
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: new TimeOfDay({ hour: 15, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 16, minute: 0, second: 0}),
            }));

            // EXPIRE add another expired 
            clock.date = new Date("2019-04-04T00:00:00");
            overrideManager.addOverride(new BasicHeatingRule({
                startTime: new TimeOfDay({ hour: 9, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 10, minute: 0, second: 0}),
            }));

            // run the housekeeping
            clock.date = new Date("2019-04-04T13:00:00");
            overrideManager.housekeep();
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(2);
            expect(ovs[0].rule.startTime.hour).to.equal(11);
            expect(ovs[0].rule.endTime.hour).to.equal(22);
            expect(ovs[1].rule.startTime.hour).to.equal(15);
            expect(ovs[1].rule.endTime.hour).to.equal(16);
        });
    });
});
