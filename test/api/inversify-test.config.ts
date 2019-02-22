import { Container, interfaces } from "inversify";
import * as path from "path";
import "reflect-metadata";

import { ExpressApp } from "../../src/server/express-app";
import { IApi, INJECTABLES, IController, IClock, ILogger, IRule, RuleConstructor } from "../../src/types";

import { MockConfigManager } from "./mocks/mock-config-manager";
import { MockController } from "./mocks/mock-controller";

import { ConfigApi } from "../../src/server/api/config-api";
import { ControlStateApi } from "../../src/server/api/control-state-api";
import { SensorApi } from "../../src/server/api/sensor-api";
import { MockSensorManager } from "./mocks/mock-sensor-manager";
import { Clock } from "../../src/app/controller/clock";
import { OverrideApi } from "../../src/server/api/override-api";
import { MockOverrideManager } from "../system/controller/mocks/mock-override-manager";
import { LoggerApi } from "../../src/server/api/logger-api";
import { MockLogger } from "./mocks/mock-logger";
import { DevLoggerApi } from "../../src/dev/dev.logger-api";
import { IRuleConfig } from "../../src/common/interfaces";
import { BasicHeatingRule } from "../../src/app/controller/basic-heating-rule";

export const container = new Container();

container.bind<IClock>(INJECTABLES.Clock).to(Clock).inSingletonScope();

// mocks
container.bind<IController>(INJECTABLES.Controller).to(MockController).inSingletonScope();
container.bind<MockConfigManager>(INJECTABLES.ConfigManager).to(MockConfigManager);
container.bind<MockSensorManager>(INJECTABLES.SensorManager).to(MockSensorManager);
container.bind<MockOverrideManager>(INJECTABLES.OverrideManager).to(MockOverrideManager).inSingletonScope();
container.bind<ILogger>(INJECTABLES.Logger).to(MockLogger).inSingletonScope();

// /express
container.bind<ExpressApp>(INJECTABLES.ExpressApp).to(ExpressApp).inSingletonScope();
container.bind<string>(INJECTABLES.ExpressStaticRootDir).toConstantValue(path.join(__dirname, "wwwroot"));
container.bind<number>(INJECTABLES.ExpressPort).toConstantValue(3000);

// APIs
container.bind<ConfigApi>(INJECTABLES.ConfigApi).to(ConfigApi);
container.bind<IApi>(INJECTABLES.ControlApi).to(ControlStateApi);
container.bind<IApi>(INJECTABLES.SensorApi).to(SensorApi);
container.bind<IApi>(INJECTABLES.OverrideApi).to(OverrideApi);
container.bind<IApi>(INJECTABLES.LogApi).to(LoggerApi);

// bindings for debugging support
container.bind<IApi>(INJECTABLES.DevLogApi).to(DevLoggerApi).inSingletonScope();

// tagged bindings
container.bind<interfaces.Newable<RuleConstructor>>(INJECTABLES.Rule)
    .toConstructor(BasicHeatingRule)
    .whenTargetTagged("kind", "BasicHeatingRule");

// bindings for factories
container.bind<interfaces.Factory<IRule>>(INJECTABLES.RuleFactory).toFactory<IRule>((context: interfaces.Context) => {
    return (ruleConfig: IRuleConfig) => {
        const ruleConstructor = container.getTagged<RuleConstructor>(INJECTABLES.Rule, "kind", ruleConfig.kind); 
        return new ruleConstructor(ruleConfig);
    };
});