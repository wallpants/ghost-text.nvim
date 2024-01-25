import { type Awaitable } from "bunvim";
import { type GhostText } from "../ghost-text.ts";
import { type CustomEvents } from "../types.ts";

const REQUEST = "before_exit";

export async function onBeforeExit(
    app: GhostText,
    callback: (args: CustomEvents["requests"][typeof REQUEST]) => Awaitable<null>,
) {
    // Request handler
    app.nvim.onRequest(REQUEST, callback);

    // Create autocmd to make RPCRequest
    await app.nvim.call("nvim_create_autocmd", [
        ["VimLeavePre"],
        {
            group: app.augroupId,
            desc: "Notify ghost-text",
            command: `lua
            vim.rpcrequest(${app.nvim.channelId}, "${REQUEST}")`,
        },
    ]);
}
