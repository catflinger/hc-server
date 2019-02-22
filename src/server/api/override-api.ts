import * as Debug from "debug";
import { Response, Router } from "express";
import { inject, injectable } from "inversify";

import { RuleConfig } from "../../common/configuration/rule-config";
import { IOverrideApiResponse, ITimeOfDay } from "../../common/interfaces";
import { configValidation } from "../../common/types";

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
                duration = configValidation.getNumber(req.body.duration, "set override:minutes");

                if (duration < 0 || duration > 24 * 60) {
                    throw new Error("value for duration out of range");
                }
            } catch (err) {
                return res.status(400).send("Bad request " + err);
            }

            // next execute the request
            try {
                const now: ITimeOfDay = this.clock.timeOfDay();
                this.overrideManager.addOverride(new RuleConfig({
                    data: null,
                    kind: "BasicHeatingRule",

                    endTime: now.addSeconds(duration * 60),
                    startTime: now,
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
        const data: IOverrideApiResponse = {
            date: this.clock.now(),
            overrides: this.overrideManager.getOverrides(),
        };
        return response.json(data);
    }
}
