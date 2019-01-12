import { IControlState, IReading, IRule, IRuleResult, ITimeOfDay } from "../interfaces";
import { TimeOfDay } from "./time-of-day";

/* Base class for implementing rules */

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

    public applyRule(currentState: IControlState, readings: ReadonlyArray<IReading>, time: ITimeOfDay | Date): IRuleResult {
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

        if (this.startTime.isEarlierThan(now) && this.endTime.isLaterThan(now)) {
            result.heating = true;
        }

        return result;
    }
}
