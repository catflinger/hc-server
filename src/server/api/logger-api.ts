import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";
import { isArray } from "util";

import { ILogApiResponse, ILogExtract } from "../../common/interfaces";
import { ConfigValidation } from "../../common/types";
import { IApi, IClock, ILogger, INJECTABLES } from "../../types";

const apiLog = Debug("api");
const errorLog = Debug("error");

@injectable()
export class LoggerApi implements IApi {

    @inject(INJECTABLES.Logger)
    private logger: ILogger;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    @inject(INJECTABLES.DevApiDelayMs)
    private delay: number;

    public addRoutes(router: Router): void {
        let from: Date;
        let to: Date;
        const sensors: string[] = [];

        router.get("/log", (req, res) => {
            apiLog("GET /log");
            try {
                sensors.length = 0;
                const params: any = JSON.parse(req.query.params);

                from = ConfigValidation.getDate(params.from, "GET /log: from");
                to = ConfigValidation.getDate(params.to, "GET /log: to");
                if (isArray(params.sensors)) {
                    params.sensors.forEach((s: any) => {
                        sensors.push(ConfigValidation.getString(s, "GET /log: sensors[i]"));
                    });
                }
            } catch (error) {
                errorLog("ERROR " + error);
                return res.status(400).send("Bad request " + error);
            }

            try {
                this.logger.getExtract(sensors, from, to)
                .then((extract: ILogExtract) => {
                    const data: ILogApiResponse = {
                        date: this.clock.now(),
                        log: extract,
                    };

                    setTimeout(() => res.json(data), this.delay);
                })
                .catch((err) => {
                    errorLog("ERROR " + err);
                    res.status(500).send(err);
                });
            } catch (err) {
                errorLog("ERROR " + err);
                res.status(500).send(err);
            }
        });
    }
}
