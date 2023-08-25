import { createServer } from "http";
import { minimatch } from "minimatch";
import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { WebSocketServer } from "ws";
import {
    type GhostClientMessage,
    type NeovimNotificationArgs,
    type PluginProps,
    type WsMessage,
} from "./types";

const RPC_EVENTS = ["ghost-text-changed", "ghost-buffer-delete"] as const;

export function startServer(nvim: NeovimClient, props: PluginProps) {
    const server = createServer((_req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json",
        }).end(
            JSON.stringify({
                ProtocolVersion: 1,
                WebSocketPort: props.port,
            }),
        );
    });

    const wss = new WebSocketServer({ server });

    wss.on("connection", async (ws, _req) => {
        let buffer: AsyncBuffer | null = null;
        for (const event of RPC_EVENTS) {
            await nvim.subscribe(event);
        }

        nvim.on(
            "notification",
            async (
                event: (typeof RPC_EVENTS)[number],
                [_arg]: NeovimNotificationArgs[],
            ) => {
                if (event === "ghost-text-changed") {
                    // set browser lines on buffer change
                    const text = (await buffer?.lines)?.join("\n") ?? "";
                    const message: WsMessage = { text };
                    ws.send(JSON.stringify(message));
                }

                if (event === "ghost-buffer-delete") {
                    ws.close();
                }
            },
        );

        ws.on("close", async () => {
            buffer = null;
            for (const event of RPC_EVENTS) {
                await nvim.unsubscribe(event);
            }
        });

        ws.on("message", async (data) => {
            const message = JSON.parse(String(data)) as GhostClientMessage;

            if (!buffer) {
                // create buff on first message
                buffer = (await nvim.createBuffer(true, true)) as AsyncBuffer;
                buffer.name = message.url + ".ghost-text";
                for (const [filetype, domains] of Object.entries(
                    props.filetype_domains,
                )) {
                    for (const domain of domains) {
                        if (minimatch(message.url, domain)) {
                            await buffer.setOption("filetype", filetype);
                        }
                    }
                }
                nvim.buffer = buffer;
            }

            // set buffer lines on browser change
            const lines = message.text.split("\n");
            await buffer.setLines(lines, {
                start: 0,
                end: -1,
                strictIndexing: true,
            });
        });
    });

    server.listen(props.port);
}
