import { injectable } from "inversify";

import { TimeOfDay } from "../../common/configuration/time-of-day";
import { IControlState, IRuleConfig, ISensorReading, ITimeOfDay } from "../../common/interfaces";
import { IRule, IRuleResult } from "../../types";

const hysteresis = 1;

@injectable()
export class HeatingRule implements IRule {

    constructor(private ruleConfig: IRuleConfig) {}

    public applyRule(currentState: IControlState, readings: ReadonlyArray<ISensorReading>, time: ITimeOfDay | Date): IRuleResult {

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

                result.heating = true;

            } else {

                const sensorReading = readings.find((s) => s.role === this.ruleConfig.role);

                if (sensorReading && sensorReading.reading !== null) {
                    const temp = sensorReading.reading;
                    const min = this.ruleConfig.temp - hysteresis;
                    const max = this.ruleConfig.temp + hysteresis;

                    if (temp < min) {
                        result.heating = true;
                    } else if (temp < max && currentState.heating) {
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
