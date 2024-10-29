import { type GhostText } from "../ghost-text.ts";
import { startServer } from "../server/index.ts";
import { type CustomEvents } from "../types.ts";

const NOTIFICATION = "buffer_delete";

export async function onBufDelete(app: GhostText) {
    function handleBufferDelete(_args: CustomEvents["notifications"][typeof NOTIFICATION]) {
        app.url = "";
        app.lines = [];
        app.buffer = null;

        // restart server to close all active websocket connections
        void app.server.stop(true);
        app.server = startServer(app);
    }

    // Request handler
    app.nvim.onNotification(NOTIFICATION, handleBufferDelete);

    // Create autocmd to send RPCNotification
    await app.nvim.call("nvim_create_autocmd", [
        ["BufDelete"],
        {
            group: app.augroupId,
            buffer: app.buffer,
            desc: "Notify ghost-text",
            command: `lua
            vim.rpcnotify(${app.nvim.channelId}, "${NOTIFICATION}")`,
        },
    ]);
}
