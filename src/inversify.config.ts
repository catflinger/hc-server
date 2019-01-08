import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ConfigManager } from "./app/configuration/config-manager";
import { Clock } from "./app/controller/clock";
import { Controller } from "./app/controller/controller";
import { SensorManager } from "./app/sensors/sensor-manager";
import { Device } from "./app/system/device";
import { System } from "./app/system/system";
import { ExpressApp } from "./server/express-app";
import { IApi, IClock, IConfigManager, IController, INJECTABLES, ISensorManager, ISystem } from "./types";

import { ConfigApi } from "./server/api/config-api";
import { ControlStateApi } from "./server/api/control-state-api";
import { OverrideApi } from "./server/api/override-api";
import { SensorApi } from "./server/api/sensor-api";

export const container = new Container();

// bindings to constants
if (process.env.NODE_ENV === "production") {
    container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "data"));
    container.bind<string>(INJECTABLES.OneWireRootDir).toConstantValue(path.join("/", "mnt", "1wire"));
    container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join("/", "sys", "gpio"));
    container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "..", "wwwroot"));
    container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);
} else {
    container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "dev"));
    container.bind<string>(INJECTABLES.OneWireRootDir).toConstantValue(path.join(__dirname, "..", "dev", "onewire"));
    container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "..", "dev", "gpio"));
    container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "..", "dev", "wwwroot"));
    container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);
}

// bindings to the singletons
container.bind<IController>(INJECTABLES.Controller).to(Controller).inSingletonScope();
container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(ConfigManager).inSingletonScope();
container.bind<ISensorManager>(INJECTABLES.SensorManager).to(SensorManager).inSingletonScope();
container.bind<ISystem>(INJECTABLES.System).to(System).inSingletonScope();
container.bind<IClock>(INJECTABLES.Clock).to(Clock).inSingletonScope();

// bindings to newables
container.bind<interfaces.Newable<Device>>(INJECTABLES.Device).toConstructor(Device);

// bindings for server
container.bind<ExpressApp>(INJECTABLES.ExpressApp).to(ExpressApp).inSingletonScope();
container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join("..", "dev", "wwwroot"));
container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);

// bindings for the apis
container.bind<IApi>(INJECTABLES.ControlApi).to(ControlStateApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.SensorApi).to(SensorApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.ConfigApi).to(ConfigApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.OverrideApi).to(OverrideApi).inSingletonScope();
