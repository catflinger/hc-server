import { container } from "./inversify.config";
import { IConfigManager, IController, INJECTABLES } from "./types";

const controller: IController = container.get<IController>(INJECTABLES.Controller);
const configManager: IConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager);
