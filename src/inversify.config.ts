import { Container } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ConfigManager } from "./app/configuration/config-manager";
import { Controller } from "./app/controller/controller";
import { IConfigManager, IController, INJECTABLES } from "./types";

export const container = new Container();

container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev"));

container.bind<IController>(INJECTABLES.Controller).to(Controller).inSingletonScope();
container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(ConfigManager).inSingletonScope();
