import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, IClock, IController, INJECTABLES } from "../../types";

const log = Debug("api");

@injectable()
export class ControlStateApi implements IApi {

    @inject(INJECTABLES.Controller)
    private controller: IController;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    public addRoutes(router: Router): void {
        router.get("/control-state", (req, res) => {
            try {
                log("GET /control-state");

                res.json({
                    controlState: this.controller.getControlState(),
                    date: this.clock.now(),
                });
            } catch (err) {
                res.status(500).send("could not process this request " + err);
            }
        });
    }
}
