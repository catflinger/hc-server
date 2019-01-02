import "mocha";
import * as chai from "chai";
import * as fsu from "../../../../../src/utils/fs-utils";
import * as path from "path";
import * as fs from "fs";

import { ISwitchable, INJECTABLES, IDeviceState } from "../../../../../src/types";
import { Device } from "../../../../../src/app/system/device";
import { container } from "./inversify-test.config";
import { interfaces } from "inversify";

const expect = chai.expect;

const gpioRoot = container.get<string>(INJECTABLES.GpioRootDir);
const deviceConstructor = container.get<interfaces.Newable<Device>>(INJECTABLES.Device);

const devicePath: string = path.join(gpioRoot, "gpio16", "value");
const device: ISwitchable = new deviceConstructor("A", "B", devicePath);

function setTestState(state: boolean): void {
    fs.writeFileSync(devicePath, state ? "1" : "0", "utf-8");
}

describe("device", () => {

    describe("constructor", () => {
        
        it("should construct", () => {
            expect(device.id).to.equal("A");
            expect(device.description).to.equal("B");
        });
    });

    describe("Switchable", () => {
        
        it("should read state", async () => {
            setTestState(true);
            let state: IDeviceState = await device.getState();
            return Promise.all([
                expect(state).to.have.property("id", "A"),
                expect(state).to.have.property("description", "B"),
                expect(state).to.have.property("state", true),
            ]);
        });

        it("should set state", async () => {
            setTestState(true);
            await device.switch(false);

            expect(fsu.readFileP(devicePath, "utf-8")).to.eventually.equal("0");

            let state: IDeviceState = await device.getState();
            return Promise.all([
                expect(state).to.have.property("id", "A"),
                expect(state).to.have.property("description", "B"),
                expect(state).to.have.property("state", false),
            ]);
        });

    });

});