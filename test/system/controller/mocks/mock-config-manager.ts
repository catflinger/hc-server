import { IConfigManager, ISSLCredentials } from "../../../../src/types";
import { injectable } from "inversify";
import { IConfiguration } from "../../../../src/common/interfaces";

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
        throw new Error("MockConfigManager.setConfig Method not implemented.");
    }
    public getSSLCredentials(): ISSLCredentials {
        return null;
    }
}