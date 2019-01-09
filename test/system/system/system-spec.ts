import "mocha";
import * as chai from "chai";

import { container } from "./inversify-test.config";

const expect = chai.expect;

import { ISystem, INJECTABLES, IDeviceState, } from "../../../src/types";

describe("System", () => {
    it("should construct", () => {
        expect(() => container.get<ISystem>(INJECTABLES.System)).not.to.throw;
    });

    it("should get device state", async () => {
        let system: ISystem = container.get<ISystem>(INJECTABLES.System);
        let ds: ReadonlyArray<IDeviceState> = await system.getDeviceState();
        expect(ds.length).to.equal(3);

        expect(ds[0].id).to.equal("boiler");
        expect(ds[0].state).to.equal(false);

        expect(ds[1].id).to.equal("hwPump");
        expect(ds[1].state).to.equal(false);

        expect(ds[2].id).to.equal("chPump");
        expect(ds[2].state).to.equal(false);
    });

    it("should apply control state", async () => {
        let system: ISystem = container.get<ISystem>(INJECTABLES.System);

        // set both heating and hot water
        let controlState = { heating: true, hotWater: true };
        await system.applyControlState(controlState);

        let ds: ReadonlyArray<IDeviceState> = await system.getDeviceState();
        expect(ds.length).to.equal(3);

        expect(ds[0].id).to.equal("boiler");
        expect(ds[0].state).to.equal(true);

        expect(ds[1].id).to.equal("hwPump");
        expect(ds[1].state).to.equal(true);

        expect(ds[2].id).to.equal("chPump");
        expect(ds[2].state).to.equal(true);

        // set just hot water
        controlState = { heating: false, hotWater: true };
        await system.applyControlState(controlState);

        ds = await system.getDeviceState();
        expect(ds.length).to.equal(3);

        expect(ds[0].id).to.equal("boiler");
        expect(ds[0].state).to.equal(true);

        expect(ds[1].id).to.equal("hwPump");
        expect(ds[1].state).to.equal(true);

        expect(ds[2].id).to.equal("chPump");
        expect(ds[2].state).to.equal(false);

        // set just heating
        controlState = { heating: true, hotWater: false };
        await system.applyControlState(controlState);

        ds = await system.getDeviceState();
        expect(ds.length).to.equal(3);

        expect(ds[0].id).to.equal("boiler");
        expect(ds[0].state).to.equal(true);

        expect(ds[1].id).to.equal("hwPump");
        expect(ds[1].state).to.equal(false);

        expect(ds[2].id).to.equal("chPump");
        expect(ds[2].state).to.equal(true);

        // set everything off
        controlState = { heating: false, hotWater: false };
        await system.applyControlState(controlState);

        ds = await system.getDeviceState();
        expect(ds.length).to.equal(3);

        expect(ds[0].id).to.equal("boiler");
        expect(ds[0].state).to.equal(false);

        expect(ds[1].id).to.equal("hwPump");
        expect(ds[1].state).to.equal(false);

        expect(ds[2].id).to.equal("chPump");
        expect(ds[2].state).to.equal(false);

    });
});
