import { Container, injectable, interfaces } from "inversify";
import "reflect-metadata";

import { INJECTABLES, ISensorManager, IClock, IRule } from "../../../src/types";
import { Clock } from "../../../src/app/controller/clock";
import { HeatingRule } from "../../../src/app/controller/heating-rule";
import { IRuleConfig } from "../../../src/common/interfaces";
import { MockSensorManager } from "./mock-sensor-manager";

export const container = new Container();

container.bind<IClock>(INJECTABLES.Clock).to(Clock).inSingletonScope();
container.bind<ISensorManager>(INJECTABLES.SensorManager).to(MockSensorManager).inSingletonScope();

// bindings for factories
container.bind<interfaces.Factory<IRule>>(INJECTABLES.RuleFactory).toFactory<IRule>((context: interfaces.Context) => {
    return (ruleConfig: IRuleConfig) => {
        return new HeatingRule(ruleConfig,
            container.get<ISensorManager>(INJECTABLES.SensorManager));
    };
});