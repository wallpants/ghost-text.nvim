import { type Nvim } from "bunvim";
import { type CustomEvents, type PluginInit } from "../types.ts";
import { httpHandler } from "./http.ts";
import { websocketHandler } from "./websocket.ts";

export function startServer(init: PluginInit, nvim: Nvim<CustomEvents>) {
    Bun.serve({
        port: init.port,
        fetch: httpHandler(init, nvim),
        websocket: websocketHandler(init, nvim),
    });
}
