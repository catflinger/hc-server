import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

import { IControlApiResponse } from "../../common/interfaces";
import { IApi, IClock, IController, INJECTABLES } from "../../types";

const log = Debug("api");
const errorLog = Debug("error");

@injectable()
export class ControlApi implements IApi {

    @inject(INJECTABLES.Controller)
    private controller: IController;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    @inject(INJECTABLES.DevApiDelayMs)
    private delay: number;

    // NOTE: unlike the other APIs this is not restful, it is a remote proceudre API
    // routes are of the form POST: /control/<procedure>

    public addRoutes(router: Router): void {
        router.post("/control/hwboost", (req, res) => {
            try {
                log("POST /control/hwboost");

                this.controller.hwBoost();

                const response: IControlApiResponse = {
                    date: this.clock.now(),
                };

                setTimeout(() => { res.json(response); }, this.delay);
            } catch (err) {
                errorLog("EROR: ControlApi - " + err);
                res.status(500).send("could not process this request " + err);
            }
        });
    }
}
