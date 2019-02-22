import { injectable } from "inversify";

import { TimeOfDay } from "../../common/configuration/time-of-day";
import { IControlState, IRuleConfig, ISensorReading, ITimeOfDay } from "../../common/interfaces";
import { IRule, IRuleResult } from "../../types";

@injectable()
export class BasicHeatingRule implements IRule {

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
            result.heating = true;
        }

        return result;
    }
}
