import * as fs from "fs";
import { Configuration, IConfiguration } from "hc-common";
import { inject, injectable } from "inversify";
import * as path from "path";

import { IConfigManager, INJECTABLES } from "../../types";

@injectable()
export class ConfigManager implements IConfigManager {

    @inject(INJECTABLES.ConfigRootDir)
    private rootDir: string;

    private configCache: IConfiguration = null;

    public start(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.readConfig()
            .then((config) => {
                this.configCache = config;
                resolve(true);
            })
            .catch((err) => {
                reject(err);
            });
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
