import { IDeviceState } from "../../types";

export class DeviceState implements IDeviceState {
    public readonly id: string;
    public readonly description: string;
    public readonly state: boolean;


    constructor(id: string, description: string, state: boolean) {
        this.id = id;
        this.description = description;
        this.state = state;
    }
}
