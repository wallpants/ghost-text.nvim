import { type Server } from "bun";
import { NVIM_LOG_LEVELS, attach, type LogLevel, type Nvim } from "bunvim";
import { parse } from "valibot";
import { startServer } from "./server";
import { UNALIVE_URL } from "./server/http";
import { PluginPropsSchema, type Config, type CustomEvents, type PluginProps } from "./types";

// These values are set by neovim when starting the bun process
const ENV = {
    NVIM: process.env["NVIM"],
    LOG_LEVEL: process.env["LOG_LEVEL"] as LogLevel | undefined,
    DEV: Boolean(process.env["IS_DEV"]),
};

export class GhostText {
    nvim: Nvim<CustomEvents>;
    /**
     * Neovim autocommand group id,
     * under which all autocommands are to be registered
     */
    augroupId: number;
    config: Config;
    server: Server;

    url = "";
    lines: string[] = [];
    buffer: number | null = null;

    private constructor(nvim: Nvim, augroupId: number, props: PluginProps) {
        this.nvim = nvim as Nvim<CustomEvents>;
        this.augroupId = augroupId;
        this.config = props.config;

        // must be called at end of constructor,
        // because it requires the values set above
        this.server = startServer(this);
    }

    static async start() {
        // we use a static method to initialize GhostText instead
        // of using the constructor, because async constructors are not a thing
        if (!ENV.NVIM) throw Error("socket missing");

        const nvim = await attach<CustomEvents>({
            socket: ENV.NVIM,
            client: { name: "ghost-text" },
            logging: { level: ENV.LOG_LEVEL },
        });

        const props = (await nvim.call("nvim_get_var", ["ghost_text_props"])) as PluginProps;
        if (ENV.DEV) parse(PluginPropsSchema, props);

        try {
            // try to unalive already running instances of ghost-text
            await fetch(`http://localhost:${props.config.port}${UNALIVE_URL}`);
            // eslint-disable-next-line
        } catch (err) {}

        const augroupId = await nvim.call("nvim_create_augroup", ["ghost-text", { clear: true }]);

        return new GhostText(nvim, augroupId, props);
    }

    async goodbye() {
        await this.nvim.call("nvim_del_augroup_by_id", [this.augroupId]);
        await this.nvim.call("nvim_notify", ["ghost-text: goodbye", NVIM_LOG_LEVELS.INFO, {}]);
        this.nvim.detach();
        process.exit(0);
    }
}
