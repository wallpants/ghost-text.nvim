import { createServer } from "http";
import { attach, type NeovimClient } from "neovim";
import { type AsyncBuffer } from "neovim/lib/api/Buffer";
import { WebSocketServer } from "ws";
import { type GhostMessage } from "./types";

const PORT = 4001;
const socket = process.argv[2];

async function isServerRunning() {
    try {
        await fetch(`http://localhost:${PORT}`);
        return true;
    } catch (e) {
        return false;
    }
}

async function startServer(nvim: NeovimClient) {
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

    let buff: AsyncBuffer | null = null;

    wss.on("connection", async (ws, _req) => {
        await nvim.subscribe("ghost-text-change");
        await nvim.subscribe("ghost-buffer-close");

        nvim.on("notification", async (event: string, _args: unknown[]) => {
            if (event === "ghost-text-change") {
                // set browser lines on buffer change
                // const arg = args[0] as EventArgs;
                const text = (await buff?.lines)?.join("\n") ?? "";
                ws.send(JSON.stringify({ text }));
            }

            if (event === "ghost-buffer-close") {
                ws.close();
            }
        });

        ws.on("close", async () => {
            buff = null;
            await nvim.unsubscribe("ghost-text-change");
            await nvim.unsubscribe("ghost-buffer-close");
        });

        ws.on("message", async (data) => {
            const message = JSON.parse(String(data)) as GhostMessage;

            if (!buff) {
                // create buff on first message
                buff = (await nvim.createBuffer(true, true)) as AsyncBuffer;
                buff.name = message.url + ".ghost";
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

async function main() {
    if (await isServerRunning()) return;
    const nvim = attach({ socket });
    await startServer(nvim);
}

void main();
