import "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fsu from "../../../../../src/utils/fs-utils";
import * as path from "path";

import { ISwitchable, INJECTABLES, IDeviceState } from "../../../../../src/types";
import { Device } from "../../../../../src/app/system/device";
import { container } from "./inversify-test.config";
import { interfaces } from "inversify";

chai.use(chaiAsPromised);
const expect = chai.expect;

const gpioRoot = container.get<string>(INJECTABLES.OneWireRootDir);
const deviceConstructor = container.get<interfaces.Newable<Device>>(INJECTABLES.Device);

const devicePath: string = path.join(gpioRoot, "gpio16", "value");
const device: ISwitchable = new deviceConstructor("A", "B", devicePath);

async function setTestState(state: boolean): Promise<void> {
    await fsu.writeFileP(devicePath, state? "1": "0");
}
describe("device", () => {

    before(async () => {
        setTestState(true);
   });

    describe("constructor", () => {
        
        it("should construct", () => {
            expect(device.id).to.equal("A");
            expect(device.description).to.equal("B");
        });
    });

    describe("Switchable", () => {
        
        it("should read state", () => {
            setTestState(true);
            let state: Promise<IDeviceState> = device.getState();
            return Promise.all([
                expect(state).to.eventually.have.property("id", "A"),
                expect(state).to.eventually.have.property("description", "B"),
                expect(state).to.eventually.have.property("state", true),
            ]);
        });

        it("should set state", () => {
            setTestState(true);
            device.switch(false);

            expect(fsu.readFileP(devicePath)).to.eventually.equal("0");

            let state: Promise<IDeviceState> = device.getState();
            return Promise.all([
                expect(state).to.eventually.have.property("id", "A"),
                expect(state).to.eventually.have.property("description", "B"),
                expect(state).to.eventually.have.property("state", false),
            ]);
        });

    });

});