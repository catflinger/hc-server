import * as Debug from "debug";
import { inject, injectable } from "inversify";
import * as path from "path";

import {
    ISensorConfig,
    ISensorReading,
    RoleType,
} from "../../common/interfaces";

import { SensorReading } from "../../common/types";

import {
    IConfigManager,
    INJECTABLES,
    ISensorManager,
} from "../../types";

import * as fsu from "../../utils/fs-utils";

const log = Debug("sensors");

@injectable()
export class SensorManager implements ISensorManager {

    private cachedReadings: ISensorReading[];

    @inject(INJECTABLES.OneWireRootDir)
    private oneWireRoot: string;

    @inject(INJECTABLES.ConfigManager)
    private configManager: IConfigManager;

    public start(): Promise<void> {
        return this.refresh();
    }

    public getReadings(): ISensorReading[] {
            // TO DO: clone the readings
            return this.cachedReadings;
    }

    public refresh(): Promise<void> {
        log("Refreshing Sensor Readings");

        return this.readSensors()
        .then((readings: ISensorReading[]) => {
            this.cachedReadings = readings;
        });
    }

    public getReadingByRole(role: RoleType): number {
        let result: number = NaN;

        const config: ISensorConfig = this.configManager.getConfig().getSensorConfig().find((s) => s.role === role);
        if (config) {
            const reading: ISensorReading = this.cachedReadings.find((s) => s.id === config.id);
            if (reading) {
                result = reading.reading;
            }
        }
        return result;
    }

    private readSensors(): Promise<ISensorReading[]> {
        return fsu.listDirectoriesP(this.oneWireRoot)
        .then((sensorsIds: string[]) => {
            const tasks: Array<Promise<ISensorReading>> = [];

            sensorsIds.forEach((id: string) => {
                if (id.startsWith("28")) {
                    tasks.push(this.readSensor({
                        description: "",
                        displayColor: "black",
                        displayOrder: 100,
                        id,
                        reading: null,
                        role: null,
                    }));
                }
            });

            return Promise.all(tasks);

            /*
            // TO DO: this is too complicated, execute in parallel using Promise.all()
            const results: ISensorReading[] = [];

            // execute the promises sequentially
            return tasks.reduce(
                async (previousPromise: Promise<ISensorReading>, current) => {

                    // execute the previous promise
                    const reading = await previousPromise;

                    // the first promise is a dummy so don't add the reading to the results
                    if (reading !== null) {
                        results.push(reading);
                    }

                    // return the current promise so that it will be executed in the next iteration
                    return current;
                },
                Promise.resolve(null),
            )

            // this executes the final promise in the taks list
            .then((reading) => {
                if (reading !== null) {
                    results.push(reading);
                }
                // there are now no more promises to execute so we can return the results
                return Promise.resolve(results);
            });
            */
        });
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
                resolve(new SensorReading({
                    description: config.description,
                    id: config.id,
                    reading: NaN,
                    role: config.role,
                }));
            });
        });
    }
}
