import { ConfigValidation } from "../config-validation";
import { ILogEntry, ILogExtract } from "../interfaces";
import { LogEntry } from "./log-entry";

export class LogExtract implements ILogExtract {
    public readonly from: Date;
    public readonly to: Date;
    public readonly sensors: ReadonlyArray<string>;
    public readonly entries: ReadonlyArray<ILogEntry>;

    constructor(data: any) {
        this.from = ConfigValidation.getDate(data.from, "LogExtract.from");
        this.to = ConfigValidation.getDate(data.to, "LogExtract.to");
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
