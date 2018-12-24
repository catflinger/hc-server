import { ITimeOfDay } from "../../types";
import { ConfigValidation } from "../configuration/config-validation";

export class TimeOfDay implements ITimeOfDay {
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;

    constructor(data: any) {
        this.hour = ConfigValidation.getNumber(data.hour, "timeOfDayConfig:hour");
        this.minute = ConfigValidation.getNumber(data.minute, "timeOfDayConfig:minute");
        this.second = ConfigValidation.getNumber(data.second, "timeOfDayConfig:second");
    }
}
