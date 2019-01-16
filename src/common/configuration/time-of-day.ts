import { ConfigValidation } from "../config-validation";
import { ITimeOfDay } from "../interfaces";

export class TimeOfDay implements ITimeOfDay {

    private static fromSeconds(totalSeconds: number): ITimeOfDay {
        // tidy up the input value to a reasonable positive innteger
        totalSeconds = Math.floor(totalSeconds);
        totalSeconds = Math.max(0, totalSeconds);
        totalSeconds = Math.min(24 * 60 * 60 - 1, totalSeconds);

        const hour = Math.floor(totalSeconds / (60 * 60));
        const minute = Math.floor((totalSeconds - hour * 60 * 60) / 60);
        const second = Math.floor(totalSeconds - hour * 60 * 60 - minute * 60);

        return new TimeOfDay({ hour, minute, second });
    }

    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;

    constructor(data: any) {
        this.hour = Math.floor(ConfigValidation.getNumber(data.hour, "timeOfDayConfig:hour"));
        this.minute = Math.floor(ConfigValidation.getNumber(data.minute, "timeOfDayConfig:minute"));
        this.second = Math.floor(ConfigValidation.getNumber(data.second, "timeOfDayConfig:second", 0));

        if (this.hour < 0 || this.hour > 23) {
            throw new Error(`TimeOfDay: value [${this.hour}] for hour outside range`);
        }

        if (this.minute < 0 || this.minute > 59) {
            throw new Error(`TimeOfDay: value [${this.minute}] for minute outside range`);
        }

        if (this.second < 0 || this.second > 59) {
            throw new Error(`TimeOfDay: value [${this.second}] for second outside range`);
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

    public addHours(hours: number): ITimeOfDay {
        return TimeOfDay.fromSeconds(this.toSeconds() + hours * 60 * 60);
    }

    public addMinutes(minutes: number): ITimeOfDay {
        return TimeOfDay.fromSeconds(this.toSeconds() + minutes * 60);
    }

    public addSeconds(seconds: number): ITimeOfDay {
        return TimeOfDay.fromSeconds(this.toSeconds() + seconds);
    }

    public toSeconds(): number {
        return this.hour * 60 * 60 + this.minute * 60 + this.second;
    }
}
