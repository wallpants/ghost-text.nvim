import { attach } from "bunvim";
import { startServer } from "./server/index.ts";
import { type CustomEvents, type PluginInit } from "./types";

const SOCKET = process.env["NVIM"];
if (!SOCKET) throw Error("socket missing");

const nvim = await attach<CustomEvents>({
    socket: SOCKET,
    client: { name: "ghost-text" },
    logging: { level: "debug" },
});

const init = (await nvim.call("nvim_get_var", ["ghost_text_init"])) as PluginInit;

try {
    // unalive old instances of ghost-text
    await fetch(`http://localhost:${init.port}`, { method: "POST" });
    // eslint-disable-next-line
} catch (e) {}

startServer(init, nvim);
