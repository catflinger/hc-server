import { injectable } from "inversify";

import { IClock, ITimeOfDay } from "../../../src/types";
import { TimeOfDay } from "../../../src/app/controller/time-of-day";

@injectable()
export class MockClock implements IClock{
    public date: Date = new Date();

    public now(): Date {
        return this.date;
    }

    public timeOfDay(): ITimeOfDay {
        return new TimeOfDay({
            hour: this.date.getHours(),
            minute: this.date.getMinutes(),
            second: this.date.getSeconds(),
        });
    }
}