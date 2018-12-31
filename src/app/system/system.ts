import { injectable } from "inversify";

import { ISwitchable, ISystem } from "../../types";
import { DeviceState } from "./device-state";

@injectable()
export class System implements ISystem {
    public boiler: ISwitchable;
    public chPump: ISwitchable;
    public hwPump: ISwitchable;
}
