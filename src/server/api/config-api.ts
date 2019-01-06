import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, IConfigManager, INJECTABLES } from "../../types";

@injectable()
export class ConfigApi implements IApi {

    @inject(INJECTABLES.ConfigManager)
    private configManager: IConfigManager;

    public addRoutes(router: Router): void {
        router.get("/config", (req, resp) => {
            resp.json(this.configManager.getConfig());
        });
    }
}
