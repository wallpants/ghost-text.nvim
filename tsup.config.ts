import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
    treeshake: true,
    entry: ["nodejs/index.ts"],
    noExternal: ["neovim", "ws"],
    minify: true,
    clean: true,
    ...options,
}));
