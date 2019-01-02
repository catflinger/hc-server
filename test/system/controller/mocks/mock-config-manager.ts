import { IConfigManager, IConfiguration } from "../../../../src/types";
import { injectable } from "inversify";

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