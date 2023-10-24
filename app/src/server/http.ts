import { type Server } from "bun";
import { type Nvim } from "bunvim";
import { type PluginInit } from "../types";

export function httpHandler(init: PluginInit, nvim: Nvim) {
    return (req: Request, server: Server) => {
        const upgradedToWs = server.upgrade(req, {
            data: {}, // this data is available in socket.data
            headers: {},
        });
        if (upgradedToWs) {
            // If client (browser) requested to upgrade connection to websocket
            // and we successfully upgraded request
            return;
        }

        if (req.method === "POST") {
            // This endpoint is called when starting the service to kill
            // ghost-text instances started by other nvim instances
            nvim.detach();
            process.exit(0);
        }

        return new Response(
            JSON.stringify({
                ProtocolVersion: 1,
                WebSocketPort: init.port,
            }),
            {
                headers: {
                    "content-type": "application/json",
                },
            },
        );
    };
}
