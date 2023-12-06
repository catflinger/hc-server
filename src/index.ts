import axios, { AxiosRequestConfig } from "axios";
import * as Debug from "debug";
import * as http from "http";
// import * as https from "https";

import { container } from "./inversify.config";
import { ExpressApp } from "./server/express-app";
import { ExpressAppPublic } from "./server/express-app-public";
import { IConfigManager, INJECTABLES } from "./types";

process.on("unhandledRejection", (reason, p) => {
    const message: string = `'Unhandled Promise Rejection at: Promise ${p} reason: ${reason}`;
    throw new Error(message);
});

const port = container.get<number>(INJECTABLES.ExpressPort);
const configManager: IConfigManager = container.get<IConfigManager>(INJECTABLES.ConfigManager);

const debug = Debug("app");

container.get<ExpressApp>(INJECTABLES.ExpressApp).start()
    .then((app) => {
        app.set("port", port);
        const server = http.createServer(app);
        server.listen(port);
        server.on("error", onError);
        server.on("listening", () => {
            debug("Listening on port " + port);
        });
    })
    .catch((err) => {
        debug(`got rejection from controller.start(): ${err}`);
        process.exit(1);
    });

container.get<ExpressAppPublic>(INJECTABLES.ExpressAppPublic).start()
    .then((app) => {
        // TODO: put this port number into the config file
        const publicPort = 3001;
        app.set("port", publicPort);

        // const credentials = configManager.getSSLCredentials();
        // const server = https.createServer(credentials, app);
        const server = http.createServer(app);

        server.listen(publicPort);
        server.on("error", onError);
        server.on("listening", () => {
            debug("Public server listening on port " + publicPort);
        });

    })
    .catch((err) => {
        debug(`got rejection from controller.start(): ${err}`);
        process.exit(1);
    });

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== "listen") {
        throw error;
    }
    switch (error.code) {
        case "EACCES":
            debug(`Port ${port} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            debug(`Port ${port} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function callHome(): void {
    axios.get("http://heating.drurys.org/api/ping")
    .then()
    .catch()
}

callHome();
setInterval(callHome, 10*60*1000);
