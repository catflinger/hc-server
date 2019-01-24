import { inject, injectable } from "inversify";
import * as path from "path";

import {
    ISensorConfig,
    ISensorReading,
} from "../../common/interfaces";

import { SensorReading } from "../../common/types";

import {
    IConfigManager,
    INJECTABLES,
    ISensorManager,
} from "../../types";

import * as fsu from "../../utils/fs-utils";

@injectable()
export class SensorManager implements ISensorManager {

    @inject(INJECTABLES.OneWireRootDir)
    private oneWireRoot: string;

    @inject(INJECTABLES.ConfigManager)
    private configManager: IConfigManager;

    public readSensors(): Promise<ISensorReading[]> {
        return new Promise<ISensorReading[]>((resolve, reject) => {
            this.readAvailableSensors()
            .then((available: ISensorReading[]) => {
                const configured: ReadonlyArray<ISensorConfig> = this.configManager.getConfig().getSensorConfig();
                const combined: ISensorReading[] = [];

                // first add all all of the configured sensors
                configured.forEach((c: ISensorConfig) => {
                    // see if we have a reading for it
                    const a: ISensorReading = available.find((r) => r.id === c.id);
                    if (a) {
                        c.reading = a.reading;
                    }
                    combined.push(c);
                });

                // next add any remaining readings from sensors that are not configured
                available.forEach((a: ISensorReading) => {
                    // see if we have configuration for it
                    const c: ISensorReading = configured.find((r) => r.id === a.id);
                    if (!c) {
                        combined.push(a);
                    }
                });

                resolve(combined);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    private async readAvailableSensors(): Promise<ISensorReading[]> {
        const sensorsIds = await fsu.listDirectoriesP(this.oneWireRoot)
        .catch((err) => {
            throw err;
        });
        const readings: Array<Promise<ISensorReading>> = [];

        sensorsIds.forEach((id: string) => {
            readings.push(this.readSensor({
                description: "",
                id,
                reading: null,
                role: "",
            }));
        });

        return Promise.all(readings);
    }

    private readSensor(config: ISensorConfig): Promise<ISensorReading> {
        return new Promise((resolve, reject) => {
            fsu.readFileP(path.join(this.oneWireRoot, config.id, "temperature"), "utf-8")
            .then((val) => {
                resolve(new SensorReading({
                    description: config.description,
                    id: config.id,
                    reading: Number.parseFloat(val),
                    role: config.role,
                }));
            })
            .catch ((err) => {
                reject(err);
            });
        });
    }
}
