import { Container, injectable } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { INJECTABLES, IConfigManager } from "../../../../../src/types";
import { ConfigManager } from "../../../../../src/app/configuration/config-manager";

export const container = new Container();

container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "data"));

container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(ConfigManager);