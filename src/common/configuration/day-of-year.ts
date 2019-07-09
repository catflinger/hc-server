import { ConfigValidation } from "../config-validation";
import { IDayOfYear } from "../interfaces";

export class DayOfYear implements IDayOfYear {

    public static fromDate(date: Date): IDayOfYear {
        return new DayOfYear({year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()});
    }

    public readonly year: number;
    public readonly month: number;
    public readonly day: number;

    constructor(data: {year: number, month: number, day: number}) {
        this.day = ConfigValidation.getNumber(data.day, "DayOfYear: day");
        this.month = ConfigValidation.getNumber(data.month, "DayOfYear: month");
        this.year = ConfigValidation.getNumber(data.year, "DayOfYear: year");

        if (this.year !== Math.trunc(data.year) ||
            this.month !== Math.trunc(data.month) ||
            this.day !== Math.trunc(data.day)) {

                throw new Error("DayOfYear: day, month and year must be integers");
        }

        const daysInMonth: number[] = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (this.month < 1 || this.month > 12) {
            throw new Error("DayOfYear: month out of bounds");
        }
        if (this.day < 1 || this.day > daysInMonth[this.month]) {
            throw new Error("DayOfYear: day out of bounds");
        }
        if (this.year < 2000 || this.year > 2050) {
            throw new Error("DayOfYear: year out of bounds");
        }
    }

    public isToday(date: Date): boolean {
        return this.year === date.getFullYear() &&
            this.month === date.getMonth() + 1 &&
            this.day === date.getDate();
    }

    public isSameAs(dayOfYear: IDayOfYear): boolean {
        return this.year === dayOfYear.year &&
            this.month === dayOfYear.month &&
            this.day === dayOfYear.day;
    }

    public getStartAsDate(): Date {
        return new Date(this.year, this.month - 1, this.day, 0, 0, 0);
    }

    public getEndAsDate(): Date {
        return new Date(this.year, this.month - 1, this.day, 23, 59, 59);
    }
}
