import { injectable } from "inversify";
import { ISensorConfig, IControlState, ILogExtract } from "../../../src/common/interfaces";
import { ILogger } from "../../../src/types";
import { promises } from "fs";

@injectable()
export class MockLogger implements ILogger {
    public extract: ILogExtract;

    init(): Promise<void> {
        return Promise.resolve();
    }    
    log(date: Date, readings: ISensorConfig[], controlState: IControlState): Promise<void> {
        return Promise.resolve();
    }
    getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract> {
        return Promise.resolve(this.extract);
    }
}
