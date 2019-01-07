import { injectable } from "inversify";

import { IClock } from "../../types";
import { TimeOfDay } from "./time-of-day";

@injectable()
export class Clock implements IClock {
    public now(): Date {
        return new Date();
    }
    public timeOfDay(): TimeOfDay {
        const date: Date = this.now();
        return new TimeOfDay({
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        });
    }
}
