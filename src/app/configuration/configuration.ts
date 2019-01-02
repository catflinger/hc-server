import { IConfiguration, IDatedConfig, INamedConfig, IProgram, ISensorConfig } from "../../types";
import { DatedConfig } from "./dated-config";
import { NamedConfig } from "./named-config";
import { Program } from "./program";
import { SensorConfig } from "./sensor-config";

export class Configuration implements IConfiguration {

    private programs: IProgram[] = [];
    private sensors: ISensorConfig[] = [];
    private datedConfig: IDatedConfig[] = [];
    private namedConfig: INamedConfig;

    constructor(data: any) {

        if (data) {
            if (data.programConfig) {
                if (Array.isArray(data.programConfig)) {
                    data.programConfig.forEach((p: any) => {
                        this.programs.push(new Program(p));
                    });
                } else {
                    throw new Error("invalid config: programs not an array");
                }
            }
            if (data.datedConfig) {
                if (Array.isArray(data.datedConfig)) {
                    data.datedConfig.forEach((dc: any) => {
                        this.datedConfig.push(new DatedConfig(dc));
                    });
                } else {
                    throw new Error("invalid config: datedConfig not an array");
                }
            }
            if (data.namedConfig) {
                this.namedConfig = new NamedConfig(data.namedConfig);
            } else {
                throw new Error("no named config supplied");
            }
            if (data.sensorConfig) {
                if (Array.isArray(data.sensorConfig)) {
                    data.sensorConfig.forEach((dp: any) => {
                        this.sensors.push(new SensorConfig(dp));
                    });
                } else {
                    throw new Error("invalid config: datedConfig not an array");
                }
            }
        } else {
            throw new Error("no config supplied");
        }
    }

    public getProgramConfig(): ReadonlyArray<IProgram> {
        return this.programs as ReadonlyArray<IProgram>;
    }

    public getDatedConfig(): ReadonlyArray<IDatedConfig> {
        return this.datedConfig as ReadonlyArray<IDatedConfig>;
    }

    public getSensorConfig(): ReadonlyArray<ISensorConfig> {
        return this.sensors as ReadonlyArray<ISensorConfig>;
    }

    public getNamedConfig(): INamedConfig {
        return this.namedConfig;
    }
}
