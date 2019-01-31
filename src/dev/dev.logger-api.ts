import * as Debug from "debug";
import { Router } from "express";
import { injectable } from "inversify";
import * as moment from "moment";
import { isArray } from "util";

import { ILogExtract, ILogEntry } from "../common/interfaces";
import { ConfigValidation } from "../common/types";
import { IApi } from "../types";

const apiLog = Debug("api");
const errorLog = Debug("error");

@injectable()
export class DevLoggerApi implements IApi {

    public addRoutes(router: Router): void {
        let from: Date;
        let to: Date;
        const sensors: string[] = [];

        router.get("/dev/log", (req, res) => {
            apiLog("GET /dev/log");
            try {
                sensors.length = 0;
                const params: any = JSON.parse(req.query.params);

                from = ConfigValidation.getDate(params.from, "GET /dev/log: from");
                to = ConfigValidation.getDate(params.to, "GET /dev/log: to");
                if (isArray(params.sensors)) {
                    params.sensors.forEach((s: any) => {
                        sensors.push(ConfigValidation.getString(s, "GET /dev/log: sensors[i]"));
                    });
                }
            } catch (error) {
                errorLog("ERROR " + error);
                return res.status(400).send("Bad request " + error);
            }

            try {
                res.json({
                    date: new Date(),
                    log: this.generateLog(from, to, sensors),
                });
            } catch (err) {
                errorLog("ERROR " + err);
                res.status(500).send(err);
            }
        });
    }

    private generateLog(from: Date, to: Date, sensors: string[]) {
        const entries: ILogEntry[] = [];
        const entryCount = 24 * 6;

        for(let i = 0; i < entryCount; i++) {
            const entry: ILogEntry = {
                date: moment(new Date("2019-01-03T12:00:00")).add(i * 10, "m").toDate(),
                heating: true,
                hotWater: false,
                readings: [],
            }

            let reading = 19 * Math.sin(i * Math.PI / (2 * entryCount));
            entry.readings.push(reading);

            reading = 35 + 15 * Math.sin(i * Math.PI / (2 * entryCount));
            entry.readings.push(reading);

            entries.push(entry);
        }

        return {
            sensors: ["bedroom", "hot water"],
            from: new Date("2019-01-03T12:00:00"),
            to: new Date("2019-01-03T13:00:00"),
            entries,
        };
    }
}
