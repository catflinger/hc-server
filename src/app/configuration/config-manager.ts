import * as fs from "fs";
import { inject, injectable } from "inversify";
import * as path from "path";

import { IConfigManager, IConfiguration, INJECTABLES } from "../../types";
import { Configuration } from "./configuration";

@injectable()
export class ConfigManager implements IConfigManager {

    @inject(INJECTABLES.ConfigRootDir)
    private rootDir: string;

    public getConfig(): Promise<IConfiguration> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.configfile(), "utf-8", (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    const config: IConfiguration = new Configuration(JSON.parse(data));
                    resolve(config);
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
