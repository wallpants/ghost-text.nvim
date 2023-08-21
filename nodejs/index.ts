import { attach } from "neovim";
import { startServer } from "./server";

const socket = process.argv[2];

async function isServerRunning(PORT: number) {
    try {
        await fetch(`http://localhost:${PORT}`);
        return true;
    } catch (e) {
        return false;
    }
}

async function main() {
    const nvim = attach({ socket });
    const PORT = Number(await nvim.getVar("gc_ghost_text_port"));
    if (await isServerRunning(PORT)) return;
    await startServer(nvim, PORT);
}

void main();
