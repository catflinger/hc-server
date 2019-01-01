import { inject, injectable } from "inversify";
import * as path from "path";

import { INJECTABLES, ISwitchable, ISystem } from "../../types";
import { DeviceConstructor } from "./device";

@injectable()
export class System implements ISystem {
    public readonly boiler: ISwitchable;
    public readonly chPump: ISwitchable;
    public readonly hwPump: ISwitchable;

    constructor(
        @inject(INJECTABLES.GpioRootDir) private gpioRoot: string,
        @inject(INJECTABLES.Device) private device: DeviceConstructor) {
            this.boiler = new device("boiler", "boiler", path.join(this.gpioRoot, "gpio16", "temperature"));
            this.hwPump = new device("hwPump", "hot water pump", path.join(this.gpioRoot, "gpio20", "temperature"));
            this.chPump = new device("chPump", "central heating pump", path.join(this.gpioRoot, "gpio21", "temperature"));
    }
}
