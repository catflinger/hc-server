import { injectable } from "inversify";
import { Router } from "express";

import { IApi } from "../../types";

@injectable()
export class ConfigApi implements IApi {
    public addRoutes(router: Router): void {
        router.get("/config", (req, resp) => {
            resp.json({hello: "hello"});
        });
    }
}
