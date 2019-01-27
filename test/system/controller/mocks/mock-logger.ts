import { ILogger } from "../../../../src/types";
import { ISensorReading, IControlState, ILogExtract } from "../../../../src/common/interfaces";
import { injectable } from "inversify";

@injectable()
export class MockLogger implements ILogger {
    getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract> {
        throw new Error("Method not implemented.");
    }
    log(date: Date, readings: ISensorReading[], controlState: IControlState): Promise<void> {
        throw new Error("Method not implemented.");
    }
    init(): Promise<void> {
        return Promise.resolve();
    }
}