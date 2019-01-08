import { Router } from "express";
import { inject, injectable } from "inversify";

import { IApi, INJECTABLES, IOverrideManager } from "../../types";

@injectable()
export class OverrideApi implements IApi {

    @inject(INJECTABLES.OverrideManager)
    private overrideManager: IOverrideManager;

    public addRoutes(router: Router): void {
        router.get("/override", (req, res) => {
            try {
                res.json({
                    overrides: this.overrideManager.getOverrides(),
                });
            } catch (err) {
                res.status(500).send("could not process this request " + err);
            }
        });

        router.put("/override", (req, res) => {
            try {

                // TO DO:

                res.json({});
            } catch (err) {
                res.status(500).send("could not process this request " + err);
            }
        });
    }
}
