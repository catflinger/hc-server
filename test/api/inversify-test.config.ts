import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ConfigApi } from "../../src/server/api/config-api";
import { ExpressApp } from "../../src/server/express-app";
import { MockConfigManager } from "./mocks/mock-config-manager";
import { INJECTABLES, IController } from "../../src/types";
import { MockController } from "./mocks/mock-controller";
import { ControlStateApi } from "../../src/server/api/control-state-api";

export const container = new Container();

// mocks
container.bind<MockConfigManager>(INJECTABLES.ConfigManager).to(MockConfigManager);
container.bind<IController>(INJECTABLES.Controller).to(MockController).inSingletonScope();

// /express
container.bind<ExpressApp>(INJECTABLES.ExpressApp).to(ExpressApp).inSingletonScope();
container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join(__dirname, "wwwroot"));
container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);

// APIs
container.bind<ConfigApi>(INJECTABLES.ConfigApi).to(ConfigApi);
container.bind<ControlStateApi>(INJECTABLES.ControlApi).to(ControlStateApi);
