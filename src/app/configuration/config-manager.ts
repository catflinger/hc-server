import * as fs from "fs";
import { inject, injectable, interfaces } from "inversify";
import * as path from "path";

import { IConfigManager, IConfiguration, INJECTABLES } from "../../types";
import { Configuration } from "./configuration";

@injectable()
export class ConfigManager implements IConfigManager {

    @inject(INJECTABLES.ConfigRootDir)
    private rootDir: string;

    @inject(INJECTABLES.Configuration)
    private configuration: interfaces.Newable<Configuration>;

    public getConfig(): Promise<IConfiguration> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.configfile(), "utf-8", (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        const config: IConfiguration = new this.configuration(JSON.parse(data));
                        resolve(config);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    public setConfig(config: IConfiguration): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.configfile(), JSON.stringify(config), { encoding: "utf-8" },  (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }

    private configfile(): string {
        return path.join(this.rootDir, "hc-config.json");
    }
}
