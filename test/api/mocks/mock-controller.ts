import { IController } from "../../../src/types";
import { injectable } from "inversify";
import { IControlState, IProgram } from "../../../src/common/interfaces";
import { Program } from "../../../src/common/types";

@injectable()
export class MockController implements IController {

    hwBoost(): void {
        this.state.hotWater = true;
    }
    public state: IControlState = {
        heating: false,
        hotWater: false,
    };

    public start(): Promise<void> {
        return Promise.resolve();
    }
    public getActiveProgram(now: Date): IProgram {
        return new Program({
            id: "foo",
            name: "bar",
            maxHwTemp: 45,
            minHwTemp: 35,
            rules: [],
        });
    }
    public getControlState(): IControlState {
        return this.state;
    }
    
    public refresh(): Promise<void> {
        return Promise.resolve();
    }
}
