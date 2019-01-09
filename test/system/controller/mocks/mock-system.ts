import { ISystem, IDevice, IDeviceState, } from "../../../../src/types";
import { injectable } from "inversify";
import { IControlState } from "hc-common";

@injectable()
export class MockSystem implements ISystem {
    public boiler: IDevice = new MockDevice();
    public chPump: IDevice = new MockDevice();
    public hwPump: IDevice = new MockDevice();

    public getDeviceState(): Promise<IDeviceState[]> {
        throw new Error("getDeviceState not implemented in mock");
    }

    public applyControlState(cs: IControlState): Promise<void> {
        throw new Error("applyControlState not implemented in mock");
    }
    
}

export class MockDevice implements IDevice {
    public id: string;    
    public description: string;

    public deviceState: IDeviceState = new MockDeviceState();
    
    public getState(): Promise<IDeviceState> {
        return Promise.resolve(new MockDeviceState());
    }
    public switch(state: boolean): Promise<void> {
        return Promise.resolve();
    }
}

export class MockDeviceState implements IDeviceState {
    public id: string;    
    public description: string;
    public state: boolean;
}
