import * as fs from "fs";
import { inject, injectable } from "inversify";
import * as path from "path";

import { IConfiguration } from "../../common/interfaces";
import { Configuration } from "../../common/types";
import { IConfigManager, INJECTABLES, ISSLCredentials } from "../../types";

@injectable()
export class ConfigManager implements IConfigManager {

    @inject(INJECTABLES.ConfigRootDir)
    private rootDir: string;

    private configCache: IConfiguration = null;

    public start(): Promise<any> {
        return this.readConfig()
        .then((config) => {
            this.configCache = config;
        });
    }

    public getConfig(): IConfiguration {
        return this.configCache;
    }

    public setConfig(config: IConfiguration): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.configfile(), JSON.stringify(config), { encoding: "utf-8" },  (error) => {
                if (error) {
                    reject(error);
                } else {
                    this.configCache = config;
                    resolve(true);
                }
            });
        });
    }

    public getSSLCredentials(): ISSLCredentials {
        const key = fs.readFileSync(path.join(this.rootDir, "ssl-key.txt"), "utf-8");
        const cert = fs.readFileSync(path.join(this.rootDir, "ssl-cert.txt"), "utf-8");
        return { key, cert };
    }

    private readConfig(): Promise<IConfiguration> {
            return new Promise((resolve, reject) => {
                fs.readFile(this.configfile(), "utf-8", (error, data) => {

                if (error) {
                    reject(error);
                } else {
                    try {
                        const config: IConfiguration = new Configuration(JSON.parse(data));
                        resolve(config);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    private configfile(): string {
        return path.join(this.rootDir, "hc-config.json");
    }
}
