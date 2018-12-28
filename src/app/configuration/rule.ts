import { injectable } from "inversify";

import { IControlState, IReading, IRule, IRuleResult, ITimeOfDay } from "../../types";
import { TimeOfDay } from "../controller/time-of-day";
import { ConfigValidation } from "./config-validation";

@injectable()
export class Rule implements IRule {
    public readonly id: string;
    public readonly startTime: ITimeOfDay;
    public readonly endTime: ITimeOfDay;

    constructor(data: any) {
        this.id = ConfigValidation.getString(data.id, "ruleConfig:id");

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

    public apply(currentState: IControlState, readings: IReading[], time: ITimeOfDay): IRuleResult {
        throw new Error("Method not implemented.");
    }
}
