import { type WebSocketHandler } from "bun";
import { minimatch } from "minimatch";
import { type GhostText } from "../ghost-text.ts";
import { onBufDelete } from "../nvim/on-buf-delete.ts";
import { onContentChange } from "../nvim/on-content-change.ts";
import { type WsBrowserMessage } from "../types.ts";

export const EDITOR_EVENTS_TOPIC = "editor_events";

export function websocketHandler(app: GhostText): WebSocketHandler {
    return {
        async open(ws) {
            if (typeof app.buffer !== "number") {
                app.buffer = await app.nvim.call("nvim_create_buf", [true, true]);
                await app.nvim.call("nvim_buf_set_name", [app.buffer, "ghost-text"]);
                await onContentChange(app);
                await onBufDelete(app);
            }

            // subscribe to a topic so we can publish messages from outside
            // webServer.publish(EDITOR_EVENTS_TOPIC, payload);
            //
            // it doesn't matter who's on the other end of the websocket connection,
            // all clients (browsers) share the same app state
            ws.subscribe(EDITOR_EVENTS_TOPIC);
        },
        async message(_ws, message: string) {
            if (typeof app.buffer !== "number") return;

            const browserMessage = JSON.parse(message) as WsBrowserMessage;
            app.nvim.logger?.verbose({ INCOMING_WEBSOCKET: browserMessage });

            if (browserMessage.url !== app.url) {
                app.url = browserMessage.url;
                await app.nvim.call("nvim_buf_set_name", [app.buffer, app.url]);

                let customFiletype: string | undefined;

                for (const [filetype, domains] of Object.entries(app.config.filetype_domains)) {
                    app.nvim.logger?.verbose("matches", { filetype, domains });
                    for (const domain of domains) {
                        if (minimatch(browserMessage.url, domain)) {
                            customFiletype = filetype;
                        }
                    }
                }

                // set buffer as current buffer
                await app.nvim.call("nvim_set_current_buf", [app.buffer]);

                if (customFiletype) {
                    await app.nvim.call("nvim_buf_set_option", [
                        app.buffer,
                        "filetype",
                        customFiletype,
                    ]);
                }
            }

            // update buffer content on browser input change
            await app.nvim.call("nvim_buf_set_lines", [
                app.buffer,
                0,
                -1,
                true,
                browserMessage.text.split("\n"),
            ]);
        },
    };
}
