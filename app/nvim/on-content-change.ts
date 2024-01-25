import { type GhostText } from "../ghost-text";
import { EDITOR_EVENTS_TOPIC } from "../server/websocket";
import { type WsServerMessage } from "../types";

export async function onContentChange(app: GhostText) {
    if (typeof app.buffer !== "number") return;

    function handleNewLines(newLines: string[]) {
        app.lines = newLines;
        const message: WsServerMessage = { text: newLines.join("\n") };
        app.nvim.logger?.verbose({ OUTGOING_WEBSOCKET: message });
        app.server.publish(EDITOR_EVENTS_TOPIC, JSON.stringify(message));
    }

    // "nvim_buf_lines_event" and "nvim_buf_changedtick_event" events are
    // only emitted by neovim if we've attached a buffer.
    app.nvim.onNotification(
        "nvim_buf_lines_event",
        ([_buffer, _changedtick, firstline, lastline, linedata, _more]) => {
            const replaceAll = lastline === -1 && firstline === 0;
            const deleteCount = lastline - firstline;
            const newLines = replaceAll
                ? linedata
                : app.lines.toSpliced(firstline, deleteCount, ...linedata);
            handleNewLines(newLines);
        },
    );

    app.nvim.onNotification("nvim_buf_changedtick_event", async ([buffer, _changedtick]) => {
        const newLines = await app.nvim.call("nvim_buf_get_lines", [buffer, 0, -1, true]);
        handleNewLines(newLines);
    });

    await app.nvim.call("nvim_buf_attach", [app.buffer, true, {}]);
}
