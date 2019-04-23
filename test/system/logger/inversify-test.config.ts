import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { Logger } from "../../../src/logger/logger";
import { INJECTABLES, ILogger, IClock } from "../../../src/types";
import { Clock } from "../../../src/app/controller/clock";

export const container = new Container();

container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "..", "config"));

container.bind<ILogger>(INJECTABLES.Logger).to(Logger).inSingletonScope();
container.bind<IClock>(INJECTABLES.Clock).to(Clock).inSingletonScope();
