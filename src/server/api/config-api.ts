import * as Debug from "debug";
import { Router } from "express";
import { inject, injectable } from "inversify";

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

                return resp.json({
                    config: this.configManager.getConfig(),
                    date: this.clock.now(),
                });
            } catch (err) {
                log("GET /config ERROR : " +  err);
                return resp.status(500).send(err);
            }
        });
    }
}
