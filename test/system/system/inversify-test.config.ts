import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { System } from "../../../src/app/system/system";
import { Device } from "../../../src/app/system/device";
import { INJECTABLES, ISwitchable, ISystem } from "../../../src/types";

export const container = new Container();

container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "data", "gpio"));

container.bind<ISystem>(INJECTABLES.System).to(System).inSingletonScope();

container.bind<interfaces.Newable<Device>>(INJECTABLES.Device).toConstructor(Device);
