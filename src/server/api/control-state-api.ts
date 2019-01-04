import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, IController, INJECTABLES } from "../../types";

@injectable()
export class ControlStateApi implements IApi {

    @inject(INJECTABLES.Controller)
    private controller: IController;

    public addRoutes(router: Router): void {
        router.get("/control-state", (req, res) => {
            try {
                res.json(this.controller.getControlState());
            } catch (err) {
                res.status(500).send("could not process this request " + err);
            }
        });
    }
}