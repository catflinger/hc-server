import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { System } from "../../../src/app/system/system";
import { INJECTABLES, ISystem } from "../../../src/types";
import { MockDevice } from "./mock-device";

export const container = new Container();

container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "data", "gpio"));

container.bind<ISystem>(INJECTABLES.System).to(System).inSingletonScope();

container.bind<interfaces.Newable<MockDevice>>(INJECTABLES.Device).toConstructor(MockDevice);
