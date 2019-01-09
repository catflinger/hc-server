import { IConfigManager } from "../../../../src/types";
import { injectable } from "inversify";
import { IConfiguration } from "hc-common";

@injectable()
export class MockConfigManager implements IConfigManager {
    public config: IConfiguration;

    public start(): Promise<void> {
        return Promise.resolve();
    }
    
    public getConfig(): IConfiguration {
        return this.config;
    }    
    public setConfig(config: IConfiguration): Promise<any> {
        throw new Error("Method not implemented.");
    }
}