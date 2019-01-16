import { injectable } from "inversify";

import { IProgram, IDatedConfig, IConfiguration } from "../../../src/common/interfaces";
import { IConfigManager } from "../../../src/types";

@injectable()
export class MockConfigManager implements IConfigManager {
    
    public start(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public getConfig(): IConfiguration {

        return {
            getSensorConfig: () => {
                return [
                    {
                        id: "28.0",
                        description: "first sensor",
                        role: "hw",
                        deleted: false
                    },
                    {
                        id: "28.1",
                        description: "second sensor",
                        role: "",
                        deleted: false
                    },
                    {
                        id: "28.99",
                        description: "deleted sensor",
                        role: "",
                        deleted: true
                    },
                ]; 
            },
            getDatedConfig: () => {
                return [] as ReadonlyArray<IDatedConfig>;
            },
            getNamedConfig: () => {
                return {
                    saturdayProgramId: "",
                    sundayProgramId: "",
                    weekdayProgramId:""
                };
            },
            getProgramConfig: () => {
                return [] as ReadonlyArray<IProgram>;
            }
        };
    }

    public setConfig(config: IConfiguration): Promise<any> {
        throw new Error("setConfig not implemented in MockConfigManager");
    }
}
