import { Container } from "inversify";

import { IController, Injectables } from "./types";
import { Controller } from "./app/controller/controller";

const container = new Container(); 

container.bind<IController>(Injectables.Controller).to(Controller);
