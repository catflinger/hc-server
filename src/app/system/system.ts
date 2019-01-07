import { inject, injectable } from "inversify";
import * as path from "path";

import { IControlState, IDevice, IDeviceState, INJECTABLES, ISystem } from "../../types";
import { DeviceConstructor } from "./device";

@injectable()
export class System implements ISystem {
    private readonly boiler: IDevice;
    private readonly chPump: IDevice;
    private readonly hwPump: IDevice;

    constructor(
        @inject(INJECTABLES.GpioRootDir) private gpioRoot: string,
        @inject(INJECTABLES.Device) private device: DeviceConstructor) {
            this.boiler = new device("boiler", "boiler", path.join(this.gpioRoot, "gpio16", "temperature"));
            this.hwPump = new device("hwPump", "hot water pump", path.join(this.gpioRoot, "gpio20", "temperature"));
            this.chPump = new device("chPump", "central heating pump", path.join(this.gpioRoot, "gpio21", "temperature"));
    }

    public getDeviceState(): Promise<IDeviceState[]> {
        return Promise.all([
            this.boiler.getState(),
            this.hwPump.getState(),
            this.chPump.getState(),
        ]);
    }

    public applyControlState(controlState: IControlState): Promise<void> {
        return Promise.all([
            this.boiler.switch(controlState.heating || controlState.hotWater),
            this.chPump.switch(controlState.heating),
            this.hwPump.switch(controlState.hotWater),
        ])
        .then(() => {
            return Promise.resolve();
        });
    }
}
