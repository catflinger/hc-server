import { Container, interfaces } from "inversify";
import "reflect-metadata";

import { OverrideManager } from "../../../src/app/override/override-manager";
import { IClock, INJECTABLES, IOverrideManager } from "../../../src/types";
import { MockClock } from "./mock-clock";

export const container = new Container();

container.bind<IClock>(INJECTABLES.Clock).to(MockClock).inSingletonScope();

container.bind<IOverrideManager>(INJECTABLES.OverrideManager).to(OverrideManager);
