import { attach } from "neovim";
import { startServer } from "./server";
import { type PluginProps } from "./types";

const socket = process.argv[2];

async function killExisting(PORT: number) {
    try {
        await fetch(`http://localhost:${PORT}`, { method: "POST" });
    } catch (e) {}
}

async function main() {
    const nvim = attach({ socket });
    const props = (await nvim.getVar("ghost_text_props")) as PluginProps;
    await killExisting(props.port);
    startServer(nvim, props);
}

void main();
