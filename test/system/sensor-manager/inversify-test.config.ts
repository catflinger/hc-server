import { Container, injectable, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { INJECTABLES, ISensorManager, IConfiguration, IConfigManager } from "../../../src/types";
import { SensorManager } from "../../../src/app/sensors/sensor-manager";
import { MockConfigManager } from "./mock-config-manager";

export const container = new Container();

container.bind<string>(INJECTABLES.OneWireRootDir).toConstantValue(path.join(__dirname, "data", "onewire"));

container.bind<ISensorManager>(INJECTABLES.SensorManager).to(SensorManager);

container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(MockConfigManager);