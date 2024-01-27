# Neovim GhostText

[<img src="docs/gt_banner.png" height="60px" align="right" />](https://ghosttext.fregante.com/)
[<img src="docs/nvim.svg" height="50px" align="right" />](https://neovim.io/)

Use Neovim in the browser.

Powered by [Bunvim](https://github.com/wallpants/bunvim).

https://github.com/wallpants/ghost-text.nvim/assets/47203170/6976a5e3-3ac4-44bb-a45b-8b5dc5bd894f

## ✅ Requirements

1. [GhostText browser extension](https://ghosttext.fregante.com/)
2. [Bun](https://bun.sh)
3. [Neovim](https://neovim.io)

## 📦 Installation

Using <a href="https://github.com/folke/lazy.nvim">lazy.nvim</a>

```lua
{
    "wallpants/ghost-text.nvim",
    opts = {
        -- config goes here
    },
}
```

## ⚙️ Configuration

All values are optional, you can leave empty to use default values.
Any values you specify will be deeply merged with this dictionary.

```lua
require("ghost-text").setup({
    -- port used by local server
    port = 4001,

    -- automatically start server
    -- if "false", you must manually call ":GhostTextStart" to start server
    autostart = true,

    -- map url patterns to filetypes to set the buffer to
    -- matching done by https://github.com/isaacs/minimatch
    filetype_domains = {
      -- markdown = { "*.openai.com*", "*.github.com*" },
    },

    -- for debugging
    -- nil | "debug" | "verbose"
    log_level = nil,
})
```

## 💻 Usage

Usually the steps to follow are:

1. open Neovim (**ghost-text.nvim** automatically starts listenning for connections)
2. on your browser select an input field and activate the extension
3. a synced buffer is created in Neovim
   - The buffer is created in the Neovim instance where **ghost-text.nvim** was most recently started.
     If you want a specific Neovim instance to handle this, call `:GhostTextStart` in that
     Neovim instance before activating the extension in your browser.

The synced buffer will sync changes bidirectionally. Any changes in the browser input will update
Neovim's buffer. Any changes to the buffer will update the browser input.

### `:GhostTextStart`

**Start** listenning for connections. Any previously created **ghost-text.nvim** instances are killed.

You should only call `:GhostTextStart` if you're lazy-loading the plugin or if you want
a specific Neovim instance to handle the connection.

## 💤 lazy-loading

I recommend you don't lazy-load this plugin as having it autostart is a better experience.
That being said, you can configure <a href="https://github.com/folke/lazy.nvim">lazy.nvim</a>
to lazyload **ghost-text.nvim** with the following setup.

```lua
{
    "wallpants/ghost-text.nvim",
    cmd = { "GhostTextStart" },
    opts = {
        autostart = false
        -- ...your config
    },
}
```
