import { injectable } from "inversify";

import { IControlState, IReading, IRule, IRuleResult, ITimeOfDay } from "../../types";
import { TimeOfDay } from "../controller/time-of-day";
import { ConfigValidation } from "./config-validation";

/* Base class for implementing rules */

// @injectable()
export class BasicHeatingRule implements IRule {
    public readonly startTime: ITimeOfDay;
    public readonly endTime: ITimeOfDay;

    constructor(data: any) {
        if (data.startTime) {
            this.startTime = new TimeOfDay(data.startTime);
        } else {
            throw new Error("startTime not found in rule config");
        }

        if (data.endTime) {
            this.endTime = new TimeOfDay(data.endTime);
        } else {
            throw new Error("endTime not found in rule config");
        }
    }

    public applyRule(currentState: IControlState, readings: IReading[], time: ITimeOfDay | Date): IRuleResult {
        const result: IRuleResult = {
            heating: null,
            hotWater: null,
        };

        const now: TimeOfDay = time instanceof Date ?
            new TimeOfDay({
                hour: time.getHours(),
                minute: time.getMinutes(),
                second: time.getSeconds(),
            }) : time;

        if (this.startTime.isEarlierThan(now) && this.endTime.isLaterThan(now)) {
            result.heating = true;
        }

        return result;
    }
}