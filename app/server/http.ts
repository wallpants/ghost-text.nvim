import { type Server } from "bun";
import { type GhostText } from "../ghost-text";

export const UNALIVE_URL = "/unalive";

export function httpHandler(app: GhostText) {
    return async (req: Request, server: Server) => {
        const upgradedToWs = server.upgrade(req, {
            data: {}, // this data is available in socket.data
            headers: {},
        });
        if (upgradedToWs) {
            // If client (browser) requested to upgrade connection to websocket
            // and we successfully upgraded request
            return;
        }

        const { pathname } = new URL(req.url);

        app.nvim.logger?.verbose({ HTTP: pathname });

        if (pathname === UNALIVE_URL) {
            // This endpoint is called when starting the service to kill
            // ghost-text instances started by other nvim instances
            await app.goodbye();
        }

        return new Response(
            JSON.stringify({
                ProtocolVersion: 1,
                WebSocketPort: app.config.port,
            }),
            {
                headers: {
                    "content-type": "application/json",
                },
            },
        );
    };
}
