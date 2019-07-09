import { ILogger, ILoggerConfig } from "../../../../src/types";
import { ISensorReading, IControlState, ILogExtract, IDayOfYear } from "../../../../src/common/interfaces";
import { injectable } from "inversify";
import { DayOfYear } from "../../../../src/common/configuration/day-of-year";

@injectable()
export class MockLogger implements ILogger {
    public config: ILoggerConfig;

    getExtract(dayOfYear: IDayOfYear): Promise<ILogExtract> {
        return Promise.resolve(dummyResult);
    }
    log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<boolean> {
        return Promise.resolve(true);
    }
    init(): Promise<void> {
        return Promise.resolve();
    }
    end(): Promise<void> {
        return Promise.resolve();
    }    

}
const dummyResult = {
    sensors: ["foo", "bar"],

    // date: new Date("2019-01-03T00:00:00"),
    // logDate: new Date("2019-01-03T00:00:00"),

    dayOfYear: new DayOfYear({ year: 2019, day: 3, month: 1 }),

    // the data retrieved
    entries: [
        {
            date: new Date("2019-01-03T12:00:00"),
            heating: true,
            hotWater: false,
            readings: [ 11.1, 22.2 ],
        },
    ],
};
