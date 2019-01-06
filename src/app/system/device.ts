import * as fs from "fs";
import { injectable } from "inversify";

import { IDevice, IDeviceState } from "../../types";
import { DeviceState } from "./device-state";

export type DeviceConstructor = new(id: string, description: string, devicePath: string) => Device;

@injectable()
export class Device implements IDevice {

    constructor(
        private id: string,
        private description: string,
        private deviceFile: string) {
    }

    public getState(): Promise<IDeviceState> {
        return new Promise((resolve, reject) => {
            fs.readFile(
                this.deviceFile,
                "utf-8",
                (err, val) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(new DeviceState(this.id, this.description, val === "1"));
                    }
                },
            );
        });
    }

    public switch(state: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(
                this.deviceFile,
                state ? "1" : "0",
                "utf-8",
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                    resolve();
                    }
                },
            );
        });
    }
}
