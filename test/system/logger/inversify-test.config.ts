import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { Logger } from "../../../src/logger/logger";
import { INJECTABLES, ILogger } from "../../../src/types";

export const container = new Container();

container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "..", "config"));

container.bind<ILogger>(INJECTABLES.Logger).to(Logger).inSingletonScope();
