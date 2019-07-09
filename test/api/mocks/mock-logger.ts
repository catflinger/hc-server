import { injectable } from "inversify";
import { ISensorConfig, IControlState, ILogExtract, IDayOfYear } from "../../../src/common/interfaces";
import { ILogger, ILoggerConfig } from "../../../src/types";
import { promises } from "fs";

@injectable()
export class MockLogger implements ILogger {
    public extract: ILogExtract;
    public config: ILoggerConfig;

    init(): Promise<void> {
        return Promise.resolve();
    }    
    end(): Promise<void> {
        return Promise.resolve();
    }    
    log(date: Date, readings: ISensorConfig[], controlState: IControlState): Promise<boolean> {
        return Promise.resolve(true);
    }
    getExtract(dayOfYear: IDayOfYear): Promise<ILogExtract> {
        return Promise.resolve(this.extract);
    }
}
