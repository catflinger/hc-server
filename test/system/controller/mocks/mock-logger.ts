import { ILogger } from "../../../../src/types";
import { ISensorReading, IControlState } from "../../../../src/common/interfaces";
import { injectable } from "inversify";

@injectable()
export class MockLogger implements ILogger {
    log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<void> {
        throw new Error("Method not implemented.");
    }
    init(): Promise<void> {
        return Promise.resolve();
    }
}