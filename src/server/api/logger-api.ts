import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

import { ILogExtract } from "../../common/interfaces";
import { IApi, IClock, ILogger, INJECTABLES } from "../../types";

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
                const from = new Date("2019-01-01T00:00:00");
                const to = new Date("2019-12-31T00:00:00");
                const sensors: string[] = ["28.0", "28.1", "28.99"];

                this.logger.getExtract(sensors, from, to)
                .then((extract: ILogExtract) => {
                    res.json({
                        date: this.clock.now(),
                        log: extract,
                    });
                })
                .catch((err) => {
                    console.log("ERROR " + err);
                    res.status(500).send(err);
                });
            } catch (err) {
                console.log("ERROR " + err);
                res.status(500).send(err);
            }
        });
    }
}
