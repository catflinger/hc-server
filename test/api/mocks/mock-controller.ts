import { IController } from "../../../src/types";
import { injectable } from "inversify";
import { IControlState, IProgram } from "../../../src/common/interfaces";
import { Program } from "../../../src/common/types";

@injectable()
export class MockController implements IController {
    public state: IControlState = {
        heating: false,
        hotWater: false,
    };

    public start(): Promise<void> {
        return Promise.resolve();
    }
    public getActiveProgram(now: Date): IProgram {
        return {
            id: "foo",
            name: "bar",
            maxHwTemp: 45,
            minHwTemp: 35,
            getRules: () => [],
        };
    }
    public getControlState(): IControlState {
        return this.state;
    }
}
