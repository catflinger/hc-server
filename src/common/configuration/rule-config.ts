import { v4 as uuid } from "uuid";

import { ConfigValidation } from "../config-validation";
import { IRuleConfig, ITimeOfDay, RuleType } from "../interfaces";
import { TimeOfDay } from "./time-of-day";

/* Base class for implementing rules */

export class RuleConfig implements IRuleConfig {
    public readonly id: string;
    public readonly kind: RuleType;
    public readonly data: any;
    public readonly startTime: ITimeOfDay;
    public readonly endTime: ITimeOfDay;

    constructor(data: any) {
        this.id = data.id ?
            ConfigValidation.getString(data.id, "id not valid in RuleConfig configuration") :
            uuid();

        // TO DO: make this iterate over the types somehow
        const kind: string = ConfigValidation.getString(data.kind, "RuleConfig:kind");
        if (kind === "BasicHeatingRule") {
            this.kind = kind;
        } else {
            throw new Error("invalid rule type");
        }

        this.data = data.data;

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

        if (this.startTime.isLaterThan(this.endTime)) {
            throw new Error("start time cannot be later than end time in TimeOfDay");
        }
    }

}
