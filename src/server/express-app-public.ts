import * as bodyParser from "body-parser";
import * as Debug from "debug";
import * as express from "express";
import { inject, injectable } from "inversify";

import { DayOfYear } from "../common/configuration/day-of-year";
import { IDayOfYear, ILogApiResponse, ILogExtract } from "../common/interfaces";
import { IClock, IConfigManager, IController, ILogger, INJECTABLES, IOverrideManager, ISensorManager } from "../types";

const log = Debug("app");

@injectable()
export class ExpressAppPublic {
    private express: express.Application;

    @inject(INJECTABLES.ExpressStaticRootDirPublic) private wwwRoot: string;

    @inject(INJECTABLES.SensorManager)
    private sensorManager: ISensorManager;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    @inject(INJECTABLES.ConfigManager)
    private configManager: IConfigManager;

    @inject(INJECTABLES.DevApiDelayMs)
    private delay: number;

    @inject(INJECTABLES.Controller)
    private controller: IController;

    @inject(INJECTABLES.OverrideManager)
    private overrideManager: IOverrideManager;

    @inject(INJECTABLES.Logger)
    private logger: ILogger;

    public start(): Promise<express.Application> {
        // save a copy of express as a class member for convenience
        this.express = express();

        this.express.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "HEAD, GET, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        // get the router and add the API implementation
        const router: express.Router = express.Router();

        this.addApi(router);

        // tell express to use the router for the API
        this.express.use("/api/", router);

        this.express.use(bodyParser.json({
            limit: 10000,
        }));

        // tell express to use the wwwroot folder for serving staic files
        this.express.use(express.static(this.wwwRoot));
        log("Serving public static content from " + this.wwwRoot);

        return Promise.resolve(this.express);
    }

    private addApi(router: express.Router): void {

        router.get("/info", (req, res) => {
            log("GET PUBLIC /info");

            try {
                res.json({
                    activeProgram: this.controller.getActiveProgram(this.clock.now()),
                    config : this.configManager.getConfig(),
                    controlState: this.controller.getControlState(),
                    date : this.clock.now(),
                    override: this.overrideManager.getOverrides(),
                    sensor : this.sensorManager.getReadings(),
                });
            } catch (err) {
                res.status(500).send(err);
            }
        });

        router.get("/log", (req, res) => {
            let dayOfYear: IDayOfYear;
            log("GET PUBLIC /log");

            try {
                dayOfYear = new DayOfYear({
                    day: parseInt(req.query.day as string, 10),
                    month: parseInt(req.query.month as string, 10),
                    year: parseInt(req.query.year as string, 10),
                });

                try {
                    this.logger.getExtract(dayOfYear)
                    .then((extract: ILogExtract) => {

                        const data: ILogApiResponse = {
                            date: this.clock.now(),
                            log: extract,
                        };
                        res.json(data);
                    })
                    .catch((err) => {
                        res.status(500).send(err);
                    });
                } catch (err) {
                    res.status(500).send(err);
                }
            } catch (error) {
                return res.status(400).send("Bad request " + error);
            }

        });
    }
}
