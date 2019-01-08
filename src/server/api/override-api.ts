import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

import { BasicHeatingRule } from "../../app/configuration/basic-heating-rule";
import { ConfigValidation as Validation } from "../../app/configuration/config-validation";
import { IApi, IClock, INJECTABLES, IOverrideManager, ITimeOfDay } from "../../types";

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
                return res.json({
                    date: this.clock.now(),
                    overrides: this.overrideManager.getOverrides(),
                });
            } catch (err) {
                return res.status(500).send("could not process this request " + err);
            }
        });

        router.put("/override", (req, res) => {
            let duration: number;
            log("PUT /override");

            try {
                duration = Validation.getNumber(req.body.duration, "set override:minutes");

                if (duration < 0 || duration > 24 * 60) {
                    throw new Error("value for duraion out of range");
                }
            } catch (err) {
                return res.status(400).send("Bad request " + err);
            }

            try {
                const now: ITimeOfDay = this.clock.timeOfDay();
                this.overrideManager.addOverride(new BasicHeatingRule({
                    endTime: now,
                    startTime: now.addSeconds(duration * 60),
                }));

                // TO DO: think about what we should return here, is the data useful or an abuse of REST?
                return res.json({
                    date: this.clock.now(),
                    overrides: this.overrideManager.getOverrides(),
                });
            } catch (err) {
                return res.status(500).send("could not process this request " + err);
            }
        });
    }
}
