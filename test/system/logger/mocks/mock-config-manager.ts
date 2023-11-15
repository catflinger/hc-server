import { IConfigManager, SSLCredentials } from "../../../../src/types";
import { injectable } from "inversify";
import { IConfiguration, IDatedConfig, IProgram, ISensorConfig } from "../../../../src/common/interfaces";

@injectable()
export class MockConfigManager implements IConfigManager {
    public config: IConfiguration = {
        getDatedConfig(): any {},
        getNamedConfig(): any {},
        getProgramConfig(): any {},
        toMutable(): any {},
        
        getSensorConfig(): ISensorConfig[] {
            return [
                {
                    id: "foo",
                    role: null,
                    reading: null,
                    displayColor: null,
                    displayOrder: null,
                    description: null,
                },
                {
                    id: "bar",
                    role: null,
                    reading: null,
                    displayColor: null,
                    displayOrder: null,
                    description: null,
                }
            ];
        },
    };

    public start(): Promise<void> {
        return Promise.resolve();
    }
    
    public getConfig(): IConfiguration {
        return this.config;
    }    
    public setConfig(config: IConfiguration): Promise<any> {
        throw new Error("MockConfigManager.setConfig Method not implemented.");
    }
    public getSSLCredentials(): SSLCredentials {
        throw new Error("MockConfigManager.getSSLCredentials Method not implemented.");
    }
}