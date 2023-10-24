import { type ServerWebSocket } from "bun";
import { type Nvim } from "bunvim";
import { type CustomEvents, type WebsocketData } from "../types.ts";

const NOTIFICATION = "BufDelete";

export async function onBufDelete(
    webSocket: ServerWebSocket<WebsocketData>,
    nvim: Nvim<CustomEvents>,
    callback: (args: CustomEvents["notifications"][typeof NOTIFICATION]) => unknown,
) {
    // Notification handler
    nvim.onNotification(NOTIFICATION, callback);

    // Create autocmd to send RPCNotification
    const channelId = await nvim.channelId();
    await nvim.call("nvim_create_autocmd", [
        [NOTIFICATION],
        {
            buffer: webSocket.data.buffer,
            desc: "Notify ghost-text",
            command: `lua
            vim.rpcnotify(${channelId}, "${NOTIFICATION}")`,
        },
    ]);
}
