import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ExpressApp } from "../../src/server/express-app";
import { IApi, INJECTABLES, IController, IClock } from "../../src/types";

import { MockConfigManager } from "./mocks/mock-config-manager";
import { MockController } from "./mocks/mock-controller";

import { ConfigApi } from "../../src/server/api/config-api";
import { ControlStateApi } from "../../src/server/api/control-state-api";
import { SensorApi } from "../../src/server/api/sensor-api";
import { MockSensorManager } from "./mocks/mock-sensor-manager";
import { Clock } from "../../src/app/controller/clock";
import { OverrideApi } from "../../src/server/api/override-api";
import { MockOverrideManager } from "../system/controller/mocks/mock-override-manager";

export const container = new Container();

container.bind<IClock>(INJECTABLES.Clock).to(Clock).inSingletonScope();

// mocks
container.bind<IController>(INJECTABLES.Controller).to(MockController).inSingletonScope();
container.bind<MockConfigManager>(INJECTABLES.ConfigManager).to(MockConfigManager);
container.bind<MockSensorManager>(INJECTABLES.SensorManager).to(MockSensorManager);
container.bind<MockOverrideManager>(INJECTABLES.OverrideManager).to(MockOverrideManager);

// /express
container.bind<ExpressApp>(INJECTABLES.ExpressApp).to(ExpressApp).inSingletonScope();
container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join(__dirname, "wwwroot"));
container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);

// APIs
container.bind<ConfigApi>(INJECTABLES.ConfigApi).to(ConfigApi);
container.bind<IApi>(INJECTABLES.ControlApi).to(ControlStateApi);
container.bind<IApi>(INJECTABLES.SensorApi).to(SensorApi);
container.bind<IApi>(INJECTABLES.OverrideApi).to(OverrideApi);
