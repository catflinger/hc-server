import * as Debug from "debug";
import { Router, Response } from "express";
import { inject, injectable } from "inversify";

import {
    BasicHeatingRule,
    ConfigValidation,
    ITimeOfDay,
} from "../../common/types";

import { IApi, IClock, INJECTABLES, IOverrideManager } from "../../types";

const log = Debug("api");

@injectable()
export class OverrideApi implements IApi {

    @inject(INJECTABLES.OverrideManager)
    private overrideManager: IOverrideManager;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    public addRoutes(router: Router): void {

        router.get("/override", (req, res) => {
            try {
                log("GET /override");
                return this.sendOverrideList(res);
            } catch (err) {
                return res.status(500).send("could not process this request " + err);
            }
        });

        router.put("/override", (req, res) => {
            let duration: number;
            log("PUT /override");

            // first validate the input
            try {
                duration = ConfigValidation.getNumber(req.body.duration, "set override:minutes");

                if (duration < 0 || duration > 24 * 60) {
                    throw new Error("value for duraion out of range");
                }
            } catch (err) {
                return res.status(400).send("Bad request " + err);
            }

            // next execute the request
            try {
                const now: ITimeOfDay = this.clock.timeOfDay();
                this.overrideManager.addOverride(new BasicHeatingRule({
                    endTime: now,
                    startTime: now.addSeconds(duration * 60),
                }));

                // return the new override state
                return this.sendOverrideList(res);

            } catch (err) {
                return res.status(500).send("could not process this request " + err);
            }
        });

        router.delete("/override", (req, res) => {
            try {
                log("DELETE /override");
                this.overrideManager.clearOverrides();
                return this.sendOverrideList(res);
            } catch (err) {
                return res.status(500).send("could not process this request " + err);
            }
        });
    }

    private sendOverrideList(response: Response): Response {
        return response.json({
            date: this.clock.now(),
            overrides: this.overrideManager.getOverrides(),
        });
    }
}
