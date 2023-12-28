import { type Nvim } from "bunvim";
import { type CustomEvents, type PluginInit } from "../types.ts";
import { httpHandler } from "./http.ts";
import { websocketHandler } from "./websocket.ts";
import { GhostText } from "../ghost-text.ts";

export function startServer(app:GhostText ) {
    Bun.serve({
        port: app.config.port,
        fetch: httpHandler(app),
        websocket: websocketHandler(app),
    });
}
