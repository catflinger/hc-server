import { Container, injectable, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { INJECTABLES, IController, ISensorManager, IConfigManager, ISystem, IClock } from "../../../src/types";
import { Controller } from "../../../src/app/controller/controller";
import { MockSensorManager } from "./mocks/mock-sensor-manager";
import { MockConfigManager } from "./mocks/mock-config-manager";
import { MockSystem } from "./mocks/mock-system";
import { Clock } from "../../../src/app/controller/clock";
import { MockOverrideManager } from "./mocks/mock-override-manager";

export const container = new Container();

// controller in request scope so thatindividual tests are independent of each other
container.bind<IController>(INJECTABLES.Controller).to(Controller);

container.bind<IClock>(INJECTABLES.Clock).to(Clock).inSingletonScope();

container.bind<ISensorManager>(INJECTABLES.SensorManager).to(MockSensorManager).inSingletonScope();
container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(MockConfigManager).inSingletonScope();
container.bind<MockOverrideManager>(INJECTABLES.OverrideManager).to(MockOverrideManager).inSingletonScope();
container.bind<ISystem>(INJECTABLES.System).to(MockSystem).inSingletonScope();
