import { createServer } from "http";
import { type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { WebSocketServer } from "ws";
import { type EventArgs, type GhostMessage } from "./types";

const RPC_EVENTS = ["ghost-text-change", "ghost-buffer-delete"] as const;

export async function startServer(nvim: NeovimClient, PORT: number) {
    await nvim.lua('print("starting GhostText server")');

    const server = createServer((_req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json",
        }).end(
            JSON.stringify({
                ProtocolVersion: 1,
                WebSocketPort: PORT,
            }),
        );
    });

    const wss = new WebSocketServer({ server });

    wss.on("connection", async (ws, _req) => {
        let buff: AsyncBuffer | null = null;
        for (const event of RPC_EVENTS) {
            await nvim.subscribe(event);
        }

        nvim.on(
            "notification",
            async (event: (typeof RPC_EVENTS)[number], [_arg]: EventArgs[]) => {
                if (event === "ghost-text-change") {
                    // set browser lines on buffer change
                    const text = (await buff?.lines)?.join("\n") ?? "";
                    ws.send(JSON.stringify({ text }));
                }

                if (event === "ghost-buffer-delete") {
                    ws.close();
                }
            },
        );

        ws.on("close", async () => {
            buff = null;
            for (const event of RPC_EVENTS) {
                await nvim.unsubscribe(event);
            }
        });

        ws.on("message", async (data) => {
            const message = JSON.parse(String(data)) as GhostMessage;

            if (!buff) {
                // create buff on first message
                buff = (await nvim.createBuffer(true, true)) as AsyncBuffer;
                buff.name = message.url + ".ghost-text";
                nvim.buffer = buff;
            }

            // set buffer lines on browser change
            const lines = message.text.split("\n");
            await buff.setLines(lines, {
                start: 0,
                end: -1,
                strictIndexing: true,
            });
        });
    });

    server.listen(PORT);
}
