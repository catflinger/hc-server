import { injectable } from "inversify";

import { TimeOfDay } from "../../common/configuration/time-of-day";
import { IControlState, IRuleConfig, ISensorReading, ITimeOfDay } from "../../common/interfaces";
import { IRule, IRuleResult, ISensorManager } from "../../types";

import * as Debug from "debug";

const ruleLog = Debug("controller");

const hysteresis = 1;

@injectable()
export class HeatingRule implements IRule {

    constructor(
        private ruleConfig: IRuleConfig,
        private sensorManager: ISensorManager,
    ) {}

    public applyRule(currentState: IControlState, time: ITimeOfDay | Date): IRuleResult {

        ruleLog("Applying rule");

        const result: IRuleResult = {
            heating: null,
            hotWater: null,
        };

        const now: ITimeOfDay = time instanceof Date ?
            new TimeOfDay({
                hour: time.getHours(),
                minute: time.getMinutes(),
                second: time.getSeconds(),
            }) : time;

        if (this.ruleConfig.startTime.isEarlierThan(now) && this.ruleConfig.endTime.isLaterThan(now)) {

            if (!this.ruleConfig.role ||
                this.ruleConfig.temp === undefined ||
                this.ruleConfig.temp === null) {

                ruleLog("Executing general rule: " + this.ruleConfig.id);
                result.heating = true;

            } else {
                ruleLog(`Executing thermostat rule id: ${this.ruleConfig.id} role: [${this.ruleConfig.role}] temp: [${this.ruleConfig.temp}]`);

                const sensorReading = this.sensorManager.getReadingByRole(this.ruleConfig.role);
                ruleLog(`Sensor reading: ${sensorReading}`);

                if (sensorReading) {
                    const min = this.ruleConfig.temp - hysteresis;
                    const max = this.ruleConfig.temp + hysteresis;

                    if (sensorReading < min) {
                        result.heating = true;
                    } else if (sensorReading < max && currentState.heating) {
                        result.heating = true;
                    } else {
                        result.heating = false;
                    }
                }
            }
        }

        return result;
    }
}
