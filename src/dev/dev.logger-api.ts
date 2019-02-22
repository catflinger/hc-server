import * as Debug from "debug";
import { Router } from "express";
import { injectable } from "inversify";
import * as moment from "moment";
import { isArray } from "util";

import { LogEntry } from "../common/log/log-entry";
import { configValidation } from "../common/types";
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

                from = configValidation.getDate(params.from, "GET /dev/log: from");
                to = configValidation.getDate(params.to, "GET /dev/log: to");

                if (isArray(params.sensors)) {
                    params.sensors.forEach((s: any) => {
                        sensors.push(configValidation.getString(s, "GET /dev/log: sensors[i]"));
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
        const entries: LogEntry[] = [];
        const entryCount = 24 * 6;

        for (let i = 0; i < entryCount; i++) {
            const readings: number[] = [];

            readings.push(19 * Math.sin(i * Math.PI / (2 * entryCount)));
            readings.push(35 + 15 * Math.cos(i * Math.PI / (2 * entryCount)));

            const entry: LogEntry = new LogEntry({
                date: moment(new Date("2019-01-03T00:00:00")).add(i * 10, "minutes").toDate(),
                heating: true,
                hotWater: false,
                readings,
            });

            entries.push(entry);
        }

        return {
            from: new Date("2019-01-03T00:00:00"),
            to: new Date("2019-01-03T23:59:59"),

            entries,
            sensors: ["bedroom", "hot water"],
        };
    }
}
