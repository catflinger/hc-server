import { injectable } from "inversify";

import { IClock } from "../../../src/types";
import { ITimeOfDay } from "../../../src/common/interfaces";
import { TimeOfDay } from "../../../src/common/types";

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