import { IController, IProgram, IControlState } from "../../../src/types";
import { injectable } from "inversify";

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
        throw new Error("Method not implemented.");
    }
    public getControlState(): IControlState {
        return this.state;
    }
}
