import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ConfigManager } from "./app/configuration/config-manager";
import { Controller } from "./app/controller/controller";
import { Device } from "./app/system/device";
import { IConfigManager, IController, INJECTABLES, ISwitchable } from "./types";

export const container = new Container();

container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev"));

container.bind<IController>(INJECTABLES.Controller).to(Controller).inSingletonScope();
container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(ConfigManager).inSingletonScope();

container.bind<interfaces.Newable<Device>>(INJECTABLES.Device).toConstructor(Device);
