import { ITimeOfDay } from "../../types";

export class TimeOfDay implements ITimeOfDay {
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;

    constructor(data: any) {
        if (data.hour) {
            this.hour = data.hour;
        } else {
            throw new Error("hour not found in rule config");
        }
        if (data.minute) {
            // TO DO VALIDATE NUMERIC
            this.minute = data.minute;
        } else {
            throw new Error("minute not found in rule config");
        }
        if (data.second) {
            this.second = data.second;
        } else {
            throw new Error("second not found in rule config");
        }
    }
}
