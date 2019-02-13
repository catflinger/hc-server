import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

import { IConfigApiResponse, IConfiguration } from "../../common/interfaces";
import { Configuration } from "../../common/types";
import { IApi, IClock, IConfigManager, INJECTABLES } from "../../types";

const log = Debug("api");

@injectable()
export class ConfigApi implements IApi {

    @inject(INJECTABLES.ConfigManager)
    private configManager: IConfigManager;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    public addRoutes(router: Router): void {
        router.get("/config", (req, resp) => {
            try {
                log("GET /config");

                const data: IConfigApiResponse  = {
                    config: this.configManager.getConfig(),
                    date: this.clock.now(),
                };

                return resp.json(data);
            } catch (err) {
                log("GET /config ERROR : " +  err);
                return resp.status(500).send(err);
            }
        });

        router.put("/config", async (req, resp) => {
            try {
                log("PUT /config");

                const config: IConfiguration = new Configuration(req.body);

                await this.configManager.setConfig(config);

                const data: IConfigApiResponse  = {
                    config: this.configManager.getConfig(),
                    date: this.clock.now(),
                };

                return resp.json(data);
            } catch (err) {
                log("PUT /config ERROR : " +  err);
                return resp.status(500).send(err);
            }
        });
    }
}
