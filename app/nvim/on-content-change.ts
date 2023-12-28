import { type ServerWebSocket } from "bun";
import { type Nvim } from "bunvim";
import { type CustomEvents, type WebsocketData } from "../types.ts";

export async function onBufferContentChange(
    webSocket: ServerWebSocket<WebsocketData>,
    nvim: Nvim<CustomEvents>,
    callback: (lines: string[]) => void,
) {
    // Buffer may have been implicitly detached
    // https://neovim.io/doc/user/api.html#nvim_buf_detach_event
    nvim.onNotification("nvim_buf_detach_event", ([buffer]) => {
        if (webSocket.data.buffer === buffer) webSocket.data.buffer = null;
    });

    await nvim.call("nvim_buf_attach", [webSocket.data.buffer!, true, {}]);

    // "nvim_buf_lines_event" and "nvim_buf_changedtick_event" events are
    // only emitted by neovim if we've attached a buffer.
    nvim.onNotification(
        "nvim_buf_lines_event",
        ([_buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            const replaceAll = lastline === -1 && firstline === 0;
            const deleteCount = lastline - firstline;
            const lines = replaceAll
                ? linedata
                : webSocket.data.lines.toSpliced(firstline, deleteCount, ...linedata);
            callback(lines);
        },
    );

    nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        const lines = await nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        callback(lines);
    });
}
