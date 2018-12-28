import { injectable } from "inversify";

import { IController } from "../../types";

@injectable()
export class Controller implements IController {

    public start(): void {
        // TO DO...
        // console.log("Controller started");
    }
}
