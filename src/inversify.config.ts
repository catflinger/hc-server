import { Container } from "inversify";

import { Controller } from "./app/controller/controller";
import { IController, INJECTABLES } from "./types";

const container = new Container();

container.bind<IController>(INJECTABLES.Controller).to(Controller);
