import { ITimeOfDay, TimeOfDay } from "hc-common";
import { injectable } from "inversify";

import { IClock } from "../../types";

@injectable()
export class Clock implements IClock {
    public now(): Date {
        return new Date();
    }
    public timeOfDay(): ITimeOfDay {
        const date: Date = this.now();
        return new TimeOfDay({
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        });
    }
}
