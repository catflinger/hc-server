import { Container, injectable, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { INJECTABLES, IConfigManager } from "../../../../src/types";
import { ConfigManager } from "../../../../src/app/configuration/config-manager";
import { Configuration } from "../../../../src/app/configuration/configuration";

export const container = new Container();

container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "data"));

container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(ConfigManager);

container.bind<interfaces.Newable<Configuration>>(INJECTABLES.Configuration).toConstructor(Configuration);
