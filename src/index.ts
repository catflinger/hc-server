import { container } from "./inversify.config";
import { IConfigManager, IController, INJECTABLES } from "./types";

const controller: IController = container.get<IController>(INJECTABLES.Controller);
const configManager: IConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager);

configManager.getConfig()
.then((config) => {
    console.log("hello world " + JSON.stringify(config, null, 4));
})
.catch((reason) => {
    console.log("goodbye cruel world " + JSON.stringify(reason));
});
