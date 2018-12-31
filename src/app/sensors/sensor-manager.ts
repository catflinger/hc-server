import { inject, injectable } from "inversify";
import * as path from "path";

import {
    IConfigManager,
    IConfiguration,
    INJECTABLES,
    IReading,
    ISensorConfig,
    ISensorManager,
} from "../../types";

import * as fsu from "../../utils/fs-utils";

@injectable()
export class SensorManager implements ISensorManager {

    @inject(INJECTABLES.OneWireDir)
    private oneWireRoot: string;

    @inject(INJECTABLES.ConfigManager)
    private configManager: IConfigManager;

    public async readAvailableSensors(): Promise<IReading[]> {
        const sensorsIds = await fsu.listDirectoriesP(this.oneWireRoot);
        const readings: Array<Promise<IReading>> = [];

        sensorsIds.forEach((id: string) => {
            readings.push(this.readSensor({
                deleted: false,
                description: "",
                id,
                role: "",
            }));
        });

        return Promise.all(readings);

    }

    public async readConfiguredSensors(): Promise<IReading[]> {
        const config: IConfiguration = await this.configManager.getConfig();
        const readings: Array<Promise<IReading>> = [];

        config.getSensorConfig().forEach((sc: ISensorConfig) => {
            if (!sc.deleted) {
                readings.push(this.readSensor(sc));
            }
        });

        return Promise.all(readings);
    }

    private readSensor(config: ISensorConfig): Promise<IReading> {
        return new Promise((resolve) => {
            fsu.readFileP(path.join(this.oneWireRoot, config.id, "temperature"), "utf-8")
            .then((val) => {
                resolve({
                    description: config.description,
                    id: config.id,
                    role: config.role,
                    value: Number.parseFloat(val),
                });
            });
        });
    }
}
