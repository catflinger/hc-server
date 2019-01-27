import { injectable } from "inversify";
import { ISensorConfig, IControlState, ILogExtract } from "../../../src/common/interfaces";
import { ILogger } from "../../../src/types";

@injectable()
export class MockLogger implements ILogger {
    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }    
    log(date: Date, readings: ISensorConfig[], controlState: IControlState): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract> {
        throw new Error("Method not implemented.");
    }

}
