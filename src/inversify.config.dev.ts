import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ConfigManager } from "./app/configuration/config-manager";
import { Controller } from "./app/controller/controller";
import { SensorManager } from "./app/sensors/sensor-manager";
import { Device } from "./app/system/device";
import { System } from "./app/system/system";
import { ExpressApp } from "./server/express-app";
import { IConfigManager, IController, INJECTABLES, ISensorManager, ISystem } from "./types";

import { ControlApi } from "./server/api/control-api";

export const container = new Container();

// bindings to constants
container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev"));
container.bind<string>(INJECTABLES.OneWireRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev", "onewire"));
container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev", "gpio"));

// bindings to the singletons
container.bind<IController>(INJECTABLES.Controller).to(Controller).inSingletonScope();
container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(ConfigManager).inSingletonScope();
container.bind<ISensorManager>(INJECTABLES.SensorManager).to(SensorManager).inSingletonScope();
container.bind<ISystem>(INJECTABLES.System).to(System).inSingletonScope();

// bindings to newables
container.bind<interfaces.Newable<Device>>(INJECTABLES.Device).toConstructor(Device);

// bindings for server
container.bind<ExpressApp>(INJECTABLES.ExpressApp).to(ExpressApp).inSingletonScope();
container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join("..", "dev", "wwwroot"));
container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);

// bindings for the apis
container.bind<ControlApi>(INJECTABLES.ControlApi).to(ControlApi).inSingletonScope();
