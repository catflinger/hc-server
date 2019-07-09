import { ConfigValidation } from "../config-validation";
import { DayOfYear } from "../configuration/day-of-year";
import { ILogEntry, ILogExtract } from "../interfaces";
import { LogEntry } from "./log-entry";

export class LogExtract implements ILogExtract {
    public readonly dayOfYear: DayOfYear;
    public readonly sensors: ReadonlyArray<string>;
    public readonly entries: ReadonlyArray<ILogEntry>;

    constructor(data: any) {

        this.dayOfYear = new DayOfYear(data.dayOfYear);

        const sensors: string[] = [];
        const entries: ILogEntry[] = [];

        data.sensors.forEach((s: any) => {
            sensors.push(ConfigValidation.getString(s, "LogExtract.sensors"));
        });
        data.entries.forEach((entry: any) => {
            entries.push(new LogEntry(entry));
        });
        this.sensors = sensors;
        this.entries = entries;
    }
}
