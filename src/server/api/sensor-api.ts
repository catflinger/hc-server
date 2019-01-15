import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, IClock, INJECTABLES, ISensorManager } from "../../types";

const log = Debug("api");

@injectable()
export class SensorApi implements IApi {

    @inject(INJECTABLES.SensorManager)
    private sensorManager: ISensorManager;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    public addRoutes(router: Router): void {

        router.get("/sensor/configured", (req, res) => {
            log("GET /sensor/configured");
            try {
                this.sensorManager.readConfiguredSensors()
                .then((sensors) => {
                    res.json({
                        date: this.clock.now(),
                        sensors,
                    });
                })
                .catch((err) => {
                    res.status(500).send(err);
                });
            } catch (err) {
                res.status(500).send(err);
            }
        });

        router.get("/sensor/available", (req, res) => {
            log("GET /sensor/available");
            try {
                this.sensorManager.readAvailableSensors()
                .then((sensors) => {
                    res.json({
                        date: this.clock.now(),
                        sensors,
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
