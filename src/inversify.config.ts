import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ConfigManager } from "./app/configuration/config-manager";
import { Clock } from "./app/controller/clock";
import { Controller } from "./app/controller/controller";
import { OverrideManager } from "./app/override/override-manager";
import { SensorManager } from "./app/sensors/sensor-manager";
import { Device } from "./app/system/device";
import { System } from "./app/system/system";
import { ExpressApp } from "./server/express-app";

import {
    IApi,
    IClock,
    IConfigManager,
    IController,
    ILogger,
    INJECTABLES,
    IOverrideManager,
    IRule,
    ISensorManager,
    ISystem,
    RuleConstructor,
} from "./types";

import { Logger } from "./logger/logger";
import { ConfigApi } from "./server/api/config-api";
import { ControlApi } from "./server/api/control-api";
import { ControlStateApi } from "./server/api/control-state-api";
import { LoggerApi } from "./server/api/logger-api";
import { OverrideApi } from "./server/api/override-api";
import { SensorApi } from "./server/api/sensor-api";

import { HeatingRule } from "./app/controller/heating-rule";
import { IRuleConfig } from "./common/interfaces";
import { DevLoggerApi } from "./dev/dev.logger-api";
import { ExpressAppPublic } from "./server/express-app-public";

export const container = new Container();

// environment specific bindings
if (process.env.NODE_ENV === "production") {
    container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "data"));
    container.bind<string>(INJECTABLES.OneWireRootDir).toConstantValue(path.join("/", "mnt", "1wire"));
    container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join("/", "sys", "class", "gpio"));
    container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join(__dirname, "..", "wwwroot"));
    container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(80);
    container.bind<number>(INJECTABLES.DevApiDelayMs).toConstantValue(0);
} else {
    container.bind<string>(INJECTABLES.ConfigRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev"));
    container.bind<string>(INJECTABLES.OneWireRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev", "onewire"));
    container.bind<string>(INJECTABLES.GpioRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev", "gpio"));
    container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join(__dirname, "..", "..", "dev", "wwwroot"));
    container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);
    container.bind<number>(INJECTABLES.DevApiDelayMs).toConstantValue(500);
}

// bindings to the singletons
container.bind<IController>(INJECTABLES.Controller).to(Controller).inSingletonScope();
container.bind<IConfigManager>(INJECTABLES.ConfigManager).to(ConfigManager).inSingletonScope();
container.bind<ISensorManager>(INJECTABLES.SensorManager).to(SensorManager).inSingletonScope();
container.bind<IOverrideManager>(INJECTABLES.OverrideManager).to(OverrideManager).inSingletonScope();
container.bind<ISystem>(INJECTABLES.System).to(System).inSingletonScope();
container.bind<IClock>(INJECTABLES.Clock).to(Clock).inSingletonScope();
container.bind<ILogger>(INJECTABLES.Logger).to(Logger).inSingletonScope();

// bindings to newables
container.bind<interfaces.Newable<Device>>(INJECTABLES.Device).toConstructor(Device);

// bindings for server
container.bind<ExpressApp>(INJECTABLES.ExpressApp).to(ExpressApp).inSingletonScope();
container.bind<ExpressAppPublic>(INJECTABLES.ExpressAppPublic).to(ExpressAppPublic).inSingletonScope();

// bindings for the apis
container.bind<IApi>(INJECTABLES.ControlApi).to(ControlApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.ControlStateApi).to(ControlStateApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.SensorApi).to(SensorApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.ConfigApi).to(ConfigApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.OverrideApi).to(OverrideApi).inSingletonScope();
container.bind<IApi>(INJECTABLES.LogApi).to(LoggerApi).inSingletonScope();

// bindings for debugging support
container.bind<IApi>(INJECTABLES.DevLogApi).to(DevLoggerApi).inSingletonScope();

// bindings for factories
container.bind<interfaces.Factory<IRule>>(INJECTABLES.RuleFactory).toFactory<IRule>((context: interfaces.Context) => {
    return (ruleConfig: IRuleConfig) => {
        return new HeatingRule(
            ruleConfig,
            container.get<ISensorManager>(INJECTABLES.SensorManager),
        );
    };
});
