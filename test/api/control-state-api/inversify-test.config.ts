import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { MockController } from "./mock-controller";
import { IController, INJECTABLES } from "../../../src/types";

import { ControlStateApi } from "../../../src/server/api/control-state-api";
import { ExpressApp } from "../../../src/server/express-app";

export const container = new Container();

container.bind<IController>(INJECTABLES.Controller).to(MockController).inSingletonScope();
container.bind<ExpressApp>(INJECTABLES.ExpressApp).to(ExpressApp).inSingletonScope();
container.bind<ControlStateApi>(INJECTABLES.ControlApi).to(ControlStateApi).inSingletonScope();
container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join(__dirname, "wwwroot"));
container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);