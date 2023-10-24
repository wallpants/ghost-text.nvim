import { type WebSocketHandler } from "bun";
import { type Nvim } from "bunvim";
import { minimatch } from "minimatch";
import { onBufDelete } from "../nvim-events/buffer-delete";
import { onBufferContentChange } from "../nvim-events/on-content-change";
import {
    type CustomEvents,
    type GhostClientMessage,
    type PluginInit,
    type WebsocketData,
    type WsMessage,
} from "../types";

export function websocketHandler(
    init: PluginInit,
    nvim: Nvim<CustomEvents>,
): WebSocketHandler<WebsocketData> {
    return {
        open(webSocket) {
            webSocket.data = {
                buffer: null,
                lines: [],
            };
        },
        async close(webSocket) {
            if (typeof webSocket.data.buffer === "number") {
                await nvim.call("nvim_buf_delete", [webSocket.data.buffer, {}]);
            }
        },
        async message(webSocket, message: string) {
            const ghostMessage = JSON.parse(message) as GhostClientMessage;
            nvim.logger?.verbose({ INCOMING_WEBSOCKET: ghostMessage });

            if (webSocket.data.buffer === null) {
                // create buff on first message
                webSocket.data.buffer = await nvim.call("nvim_create_buf", [true, true]);

                await nvim.call("nvim_buf_set_name", [
                    webSocket.data.buffer,
                    ghostMessage.url + ".ghost-text",
                ]);

                let customFiletype: string | undefined;

                for (const [filetype, domains] of Object.entries(init.filetype_domains)) {
                    nvim.logger?.info("matches", { filetype, domains });
                    for (const domain of domains) {
                        if (minimatch(ghostMessage.url, domain)) {
                            customFiletype = filetype;
                        }
                    }
                }

                await onBufferContentChange(webSocket, nvim, (lines) => {
                    webSocket.data.lines = lines;
                    const message: WsMessage = { text: lines.join("\n") };
                    nvim.logger?.verbose({ OUTGOING_WEBSOCKET: message });
                    webSocket.send(JSON.stringify(message));
                });

                await onBufDelete(webSocket, nvim, () => {
                    webSocket.close();
                });

                // set new buffer as current buffer
                await nvim.call("nvim_set_current_buf", [webSocket.data.buffer]);

                if (customFiletype) {
                    await nvim.call("nvim_buf_set_option", [
                        webSocket.data.buffer,
                        "filetype",
                        customFiletype,
                    ]);
                }
            }

            // update buffer content on browser input change
            await nvim.call("nvim_buf_set_lines", [
                webSocket.data.buffer,
                0,
                -1,
                true,
                ghostMessage.text.split("\n"),
            ]);
        },
    };
}
