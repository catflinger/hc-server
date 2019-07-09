import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";
import { isArray } from "util";

import { ILogApiResponse, ILogExtract, IDayOfYear } from "../../common/interfaces";
import { ConfigValidation } from "../../common/types";
import { IApi, IClock, ILogger, INJECTABLES } from "../../types";
import { DayOfYear } from "../../common/configuration/day-of-year";

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
        let dayOfYear: IDayOfYear;

        router.get("/log", (req, res) => {
            apiLog("GET /log");

            try {
                dayOfYear = new DayOfYear({
                    year: parseInt(req.query.year, 10), 
                    month: parseInt(req.query.month, 10), 
                    day: parseInt(req.query.day, 10),
                });

            } catch (error) {
                errorLog("ERROR " + error);
                return res.status(400).send("Bad request " + error);
            }

            try {
                this.logger.getExtract(dayOfYear)
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
