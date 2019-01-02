import { Container, injectable, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { INJECTABLES, ISwitchable, IController, ISensorManager, IConfigManager, ISystem } from "../../../src/types";
import { Controller } from "../../../src/app/controller/controller";
import { MockSensorManager } from "./mocks/mock-sensor-manager";
import { MockConfigManager } from "./mocks/mock-config-manager";
import { MockSystem } from "./mocks/mock-system";

export const container = new Container();

container.bind<IController>(INJECTABLES.Controller).to(Controller).inSingletonScope();
container.bind<ISensorManager>(INJECTABLES.SensorManager).to(MockSensorManager).inSingletonScope();
container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(MockConfigManager).inSingletonScope();
container.bind<ISystem>(INJECTABLES.System).to(MockSystem).inSingletonScope();
