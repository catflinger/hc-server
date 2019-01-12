import { IConfigManager } from "../../../src/types";
import { injectable } from "inversify";
import { IConfiguration, Configuration } from "../../../src/common/types";

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
    namedConfig: {
        saturdayProgramId: "A",
        sundayProgramId: "B",
        weekdayProgramId: "C",
    },
    datedConfig: [
        {
            programId: "X",
            date: "2012-12-12T00:00:00",
        },
        {
            programId: "Y",
            date: "2010-10-10T00:00:00",
        }
    ],
    programConfig: [
        {
            id: "P1",
            name: "I am called P1",
            minHwTemp: 12,
            maxHwTemp: 30,
        },
        {
            id: "p2",
            name: "I am called P2",
            minHwTemp: 12,
            maxHwTemp: 30,
        }

    ],
    sensorConfig: [
        {
            id: "A",
            description: "B",
        },
        {
            id: "C",
            description: "D",
            role: "hw",
        }    
    ],
};
