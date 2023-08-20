import { attach } from "neovim";
import { isServerRunning } from "./is-running";
import { startServer } from "./start-server";

const PORT = 4001;
const socket = process.argv[2];

async function main() {
    if (await isServerRunning(PORT)) return;
    const nvim = attach({ socket });
    await startServer(nvim, PORT);
}

void main();
