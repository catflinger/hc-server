import { IConfigManager, IConfiguration } from "../../../src/types";
import { injectable } from "inversify";
import { Configuration } from "../../../src/app/configuration/configuration";

@injectable()
export class MockConfigManager implements IConfigManager {
    public config: IConfiguration = new Configuration(defaultConfig);

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

const defaultConfig: any = {
    "programConfig": [],
    "namedConfig": {
        "weekdayProgramId": null,
        "saturdayProgramId": null,
        "sundayProgramId": null
    },
    "datedConfig": [
    ],
    "sensorConfig": [
    ]
};