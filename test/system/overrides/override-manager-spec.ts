import "mocha";
import * as chai from "chai";

import { container } from "./inversify-test.config";

const expect = chai.expect;

import { IOverrideManager, INJECTABLES } from "../../../src/types";
import { IOverride, ITimeOfDay } from "../../../src/common/interfaces";
import { TimeOfDay } from "../../../src/common/types";
import { MockClock } from "./mock-clock";
import { RuleConfig } from "../../../src/common/configuration/rule-config";

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
            overrideManager.addOverride(new RuleConfig({
                data: null,
                id: null,
                startTime: clock.timeOfDay(),
                endTime: clock.timeOfDay().addMinutes(7),
            }));
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(Array.isArray(ovs)).to.be.true;
            expect(ovs.length).to.equal(1);
        });

        it("should replace an existing override", () => {
            const endTime: ITimeOfDay = clock.timeOfDay().addMinutes(10);
            overrideManager.addOverride(new RuleConfig({
                data: null,
                id: null,
                startTime: clock.timeOfDay().addMinutes(5),
                endTime,
            }));
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(1);
            expect(ovs[0].rule.endTime.toSeconds()).to.equal(endTime.toSeconds());
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

        it("should remove expired override", () => {
            // NOTE: housekeep time will be run on 2019-04-04 at 1pm

            // EXPIRE add one day before
            clock.date = new Date("2019-04-03T00:00:00");
            overrideManager.addOverride(new RuleConfig({
                data: null,
                id: null,
                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 22, minute: 0, second: 0}),
            }));

            // run the housekeeping
            clock.date = new Date("2019-04-04T13:00:00");
            overrideManager.housekeep();
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(0);
        });

        it("should remove future override", () => {
            // EXPIRE add one day after
            clock.date = new Date("2019-04-05T00:00:00");
            overrideManager.addOverride(new RuleConfig({
                data: null,
                id: null,
                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 22, minute: 0, second: 0}),
            }));

            // run the housekeeping
            clock.date = new Date("2019-04-04T13:00:00");
            overrideManager.housekeep();
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(0);
        });

        it("should remove expired today override", () => {
            // EXPIRE add one early and expired
            clock.date = new Date("2019-04-04T00:00:00");
            overrideManager.addOverride(new RuleConfig({
                data: null,
                id: null,

                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 12, minute: 0, second: 0}),
            }));

            // run the housekeeping
            clock.date = new Date("2019-04-04T13:00:00");
            overrideManager.housekeep();
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(0);
        });

        it("should not remove current override", () => {

            // KEEP add one early but still current
            clock.date = new Date("2019-04-04T00:00:00");
            overrideManager.addOverride(new RuleConfig({
                data: null,
                id: null,

                startTime: new TimeOfDay({ hour: 11, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 22, minute: 0, second: 0}),
            }));

            // run the housekeeping
            clock.date = new Date("2019-04-04T13:00:00");
            overrideManager.housekeep();
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(1);

        });

        it("should not remove pending  override", () => {
            // KEEP add one later in day
            clock.date = new Date("2019-04-04T00:00:00");
            overrideManager.addOverride(new RuleConfig({
                data: null,
                id: null,

                startTime: new TimeOfDay({ hour: 15, minute: 0, second: 0}),
                endTime: new TimeOfDay({ hour: 16, minute: 0, second: 0}),
            }));

            // run the housekeeping
            clock.date = new Date("2019-04-04T13:00:00");
            overrideManager.housekeep();
            let ovs: ReadonlyArray<IOverride> = overrideManager.getOverrides();
            expect(ovs.length).to.equal(1);
        });
    });
});
