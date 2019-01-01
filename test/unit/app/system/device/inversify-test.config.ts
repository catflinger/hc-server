import { Container, injectable, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { INJECTABLES, ISwitchable } from "../../../../../src/types";
import { Device } from "../../../../../src/app/system/device";

export const container = new Container();

container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "data", "gpio"));

container.bind<interfaces.Newable<ISwitchable>>(INJECTABLES.Device).toConstructor(Device);
