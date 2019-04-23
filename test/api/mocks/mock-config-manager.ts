import { IConfigManager } from "../../../src/types";
import { injectable } from "inversify";
import { IConfiguration } from "../../../src/common/interfaces";
import { Configuration } from "../../../src/common/types";

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
            timeOfYear: {
                month: 12,
                day: 12
            },
        },
        {
            programId: "Y",
            timeOfYear: {
                month: 10,
                day: 10
            },
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
