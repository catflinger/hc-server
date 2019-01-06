import * as Debug from "debug";
import * as http from "http";

import { container } from "./inversify.config";
import { ExpressApp } from "./server/express-app";
import { INJECTABLES } from "./types";

process.on("unhandledRejection", (reason, p) => {
    const message: string = `'Unhandled Promise Rejection at: Promise ${p} reason: ${reason}`;
    throw new Error(message);
  });

const port = container.get<number>(INJECTABLES.ExpressPort);
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
