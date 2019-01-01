import { injectable } from "inversify";

import { IDeviceState, ISwitchable } from "../../types";
import * as fsu from "../../utils/fs-utils";
import { DeviceState } from "./device-state";

export type DeviceConstructor = new(id: string, description: string, devicePath: string) => Device;

@injectable()
export class Device implements ISwitchable {

    constructor(
        public readonly id: string,
        public readonly description: string,
        private readonly deviceFile: string) {
    }

    public getState(): Promise<IDeviceState> {
        return new Promise((resolve, reject) => {
            fsu.readFileP(this.deviceFile, "utf-8")
            .then((val) => {
                resolve(new DeviceState(this.id, this.description, val === "1"));
            })
            .catch((err) => reject(err));
        });
    }

    public switch(state: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            fsu.writeFileP(this.deviceFile, state ? "1" : "0", "utf-8")
            .then(() => {
                resolve();
            })
            .catch((err) => reject(err));
        });
    }
}
