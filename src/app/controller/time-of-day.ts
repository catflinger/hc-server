import { ITimeOfDay } from "../../types";
import { ConfigValidation } from "../configuration/config-validation";

export class TimeOfDay implements ITimeOfDay {
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;

    constructor(data: any) {
        this.hour = Math.floor(ConfigValidation.getNumber(data.hour, "timeOfDayConfig:hour"));
        this.minute = Math.floor(ConfigValidation.getNumber(data.minute, "timeOfDayConfig:minute"));
        this.second = Math.floor(ConfigValidation.getNumber(data.second, "timeOfDayConfig:second", 0));

        if (this.hour < 0 || this.hour > 23) {
            throw new Error("TimeOfDay: value for hour outside range");
        }

        if (this.minute < 0 || this.minute > 59) {
            throw new Error("TimeOfDay: value for minute outside range");
        }

        if (this.second < 0 || this.second > 59) {
            throw new Error("TimeOfDay: value for second outside range");
        }
    }

    public isLaterThan(other: ITimeOfDay): boolean {
        let result: boolean;

        if (this.hour > other.hour) {
            result = true;
        } else if (this.hour < other.hour) {
            result = false;
        } else if (this.minute > other.minute) {
            result = true;
        } else if (this.minute < other.minute) {
            result = false;
        } else if (this.second > other.second) {
            result = true;
        } else {
            result = false;
        }

        return result;
    }
    public isSameAs(other: ITimeOfDay): boolean {
        return this.hour === other.hour &&
            this.minute === other.minute &&
            this.second === other.second;
    }
    public isEarlierThan(other: ITimeOfDay): boolean {
        return !this.isSameAs(other) && !this.isLaterThan(other);
    }
}
