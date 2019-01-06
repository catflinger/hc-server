import { IDevice, IDeviceState } from "../../../src/types";
import { injectable } from "inversify";

@injectable()
export class MockDevice implements IDevice {
    public state: boolean;

    constructor(
        private readonly id: string,
        private readonly description: string,
        private readonly deviceFile: string) {
            this.state = false;
    }
    
    getState(): Promise<IDeviceState> {
        return Promise.resolve(
            {
                id: this.id,
                description: this.description,
                state: this.state
            }
        );
    }

    switch(state: boolean): Promise<void> {
        return new Promise((resolve) => {
            this.state = state;
            resolve();
        });
    }


}