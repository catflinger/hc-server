import * as bodyParser from "body-parser";
import * as Debug from "debug";
import * as express from "express";
import { Container, inject, injectable } from "inversify";
import * as path from "path";

import { IApi,  IController, INJECTABLES } from "../types";

const log = Debug("app");

@injectable()
export class ExpressApp {
    private express: express.Application;

    @inject(INJECTABLES.ExpressStaticRootDir) private wwwRoot: string;
    @inject(INJECTABLES.Controller) private controller: IController;

    @inject(INJECTABLES.ControlApi) private controlApi: IApi;
    @inject(INJECTABLES.ConfigApi) private configApi: IApi;
    @inject(INJECTABLES.SensorApi) private sensorApi: IApi;
    @inject(INJECTABLES.OverrideApi) private overrideApi: IApi;
    @inject(INJECTABLES.LogApi) private logApi: IApi;

    public start(): Promise<express.Application> {
        // save a copy of express as a class member for convenience
        this.express = express();

        // get the router and add the API implementation
        const router: express.Router = express.Router();

        this.controlApi.addRoutes(router);
        this.configApi.addRoutes(router);
        this.sensorApi.addRoutes(router);
        this.overrideApi.addRoutes(router);
        this.logApi.addRoutes(router);

        this.express.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "HEAD, GET, PUT, POST, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.express.use(bodyParser.json({
            limit: 10000,
        }));

        // tell express to use the router for the API
        this.express.use("/api/", router);

        // tell express to use the wwwroot folder for serving staic files
        this.express.use(express.static(this.wwwRoot));
        log("Serving static content from " + this.wwwRoot);

        return new Promise((resolve, reject) => {
            // start the controller: this initialises digital outputpins and starts the environment polling
            this.controller.start()
            .then(() => {
                resolve(this.express);
            })
            .catch((err) => {
                reject(err);
            });
        });
    }
}
