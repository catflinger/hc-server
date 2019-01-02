import { ISystem, ISwitchable, IDeviceState } from "../../../../src/types";
import { injectable } from "inversify";

@injectable()
export class MockSystem implements ISystem {
    public boiler: ISwitchable = new MockDevice();
    public chPump: ISwitchable = new MockDevice();
    public hwPump: ISwitchable = new MockDevice();
}

export class MockDevice implements ISwitchable {
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
