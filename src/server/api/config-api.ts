import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, IClock, IConfigManager, INJECTABLES } from "../../types";

@injectable()
export class ConfigApi implements IApi {

    @inject(INJECTABLES.ConfigManager)
    private configManager: IConfigManager;

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    public addRoutes(router: Router): void {
        router.get("/config", (req, resp) => {
            return resp.json({
                config: this.configManager.getConfig(),
                date: this.clock.now(),
            });
        });
    }
}
