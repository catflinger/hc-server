import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, INJECTABLES, ISensorManager } from "../../types";

@injectable()
export class SensorApi implements IApi {

    @inject(INJECTABLES.SensorManager)
    private sensorManager: ISensorManager;

    public addRoutes(router: Router): void {
        router.get("/sensor/configured", (req, res) => {
            try {
                res.json({
                    sensors: this.sensorManager.readConfiguredSensors(),
                });
            } catch (err) {
                res.status(500).send("could not process this request " + err);
            }
        });

        router.get("/sensor/available", (req, res) => {
            try {
                res.json({
                    sensors: this.sensorManager.readAvailableSensors(),
                });
            } catch (err) {
                res.status(500).send("could not process this request " + err);
            }
        });
    }
}
