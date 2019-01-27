import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, IClock, ILogger, INJECTABLES } from "../../types";
import { ILogExtract } from "../../common/interfaces";

const log = Debug("api");

@injectable()
export class LoggerApi implements IApi {

    @inject(INJECTABLES.Logger)
    private logger: ILogger;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    public addRoutes(router: Router): void {

        router.get("/log", (req, res) => {
            log("GET /log");
            try {
                const from = new Date();
                const to = new Date();
                const sensors: string[] = [];

                this.logger.getExtract(sensors, new Date(), new Date())
                .then((extract: ILogExtract) => {
                    res.json({
                        date: this.clock.now(),
                        log: extract,
                    });
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
            } catch (err) {
                res.status(500).send(err);
            }
        });
    }
}
