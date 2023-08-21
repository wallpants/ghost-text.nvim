import { attach } from "neovim";
import { startServer } from "./server";

const socket = process.argv[2];
const PORT = Number(process.argv[3]);

async function isServerRunning() {
    try {
        await fetch(`http://localhost:${PORT}`);
        return true;
    } catch (e) {
        return false;
    }
}

async function main() {
    if (await isServerRunning()) return;
    const nvim = attach({ socket });
    await startServer(nvim, PORT);
}

void main();
