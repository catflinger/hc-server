import { ILogger } from "../../../../src/types";
import { ISensorReading, IControlState, ILogExtract } from "../../../../src/common/interfaces";
import { injectable } from "inversify";

@injectable()
export class MockLogger implements ILogger {
    getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract> {
        return Promise.resolve(dummyResult);
    }
    log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<void> {
        return Promise.resolve();
    }
    init(): Promise<void> {
        return Promise.resolve();
    }
}
const dummyResult = {
    sensors: ["foo", "bar"],

    from: new Date("2019-01-03T12:00:00"),
    to: new Date("2019-01-03T13:00:00"),

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
