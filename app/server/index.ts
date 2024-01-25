import { type Server } from "bun";
import { type GhostText } from "../ghost-text.ts";
import { httpHandler } from "./http.ts";
import { websocketHandler } from "./websocket.ts";

export function startServer(app: GhostText): Server {
    const { port } = app.config;

    const server = Bun.serve({
        port: port,
        fetch: httpHandler(app),
        websocket: websocketHandler(app),
    });

    return server;
}
