import { v4 as uuid } from "uuid";

import { ConfigValidation } from "../config-validation";
import { IControlState, IReading, IRule, IRuleResult, ITimeOfDay } from "../interfaces";
import { TimeOfDay } from "./time-of-day";

/* Base class for implementing rules */

export class BasicHeatingRule implements IRule {
    public readonly id: string;
    public readonly startTime: ITimeOfDay;
    public readonly endTime: ITimeOfDay;

    constructor(data: any) {
        this.id = data.id ?
            ConfigValidation.getString(data.id, "id not valid in BasicHeatingRule configuration") :
            uuid();

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

    public toJSON(): any {
        return {
            endTime: this.endTime,
            id: this.id,
            startTime: this.startTime,
        };
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
