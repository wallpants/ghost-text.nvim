# Neovim GhostText

[<img src="docs/gt_banner.png" height="60px" align="right" />](https://ghosttext.fregante.com/)
[<img src="docs/nvim.svg" height="50px" align="right" />](https://neovim.io/)

Use Neovim in the browser.

Powered by [Bunvim](https://github.com/wallpants/bunvim).

## Demo

![demo.gif](https://raw.githubusercontent.com/wallpants/gifs/main/ghost-text.nvim/demo.gif)

## Requirements

1. [GhostText browser extension](https://ghosttext.fregante.com/)
2. [Bun](https://bun.sh)
3. [Neovim](https://neovim.io)

## Installation

Using [lazy.nvim](https://github.com/folke/lazy.nvim)

```lua
{
    'wallpants/ghost-text.nvim',
    opts = {
        -- config goes here
    }
}
```

## Setup

`setup` must be called for the plugin to be loaded. Some plugin managers handle this for you.

```lua
require('ghost-text').setup({
    -- these are the default values, any values
    -- you specify will be merged with this dictionary

    -- port used by local server
    port = 4001,

    -- whether to execute :GhostTextStart on Neovim start
    autostart = false,

    -- map url patterns to filetypes to set the buffer to
    -- matching done by https://github.com/isaacs/minimatch
    filetype_domains = {
        markdown = { "*.openai.com*", "*.reddit.com*" },
    },

})
```

## Usage

Usually the steps to follow are:

1. Open Neovim
2. Start `:GhostTextStart`
   - If you set `autostart = true` in your config, you can skip this step.
3. On your browser activate the extension
4. A synced buffer is created in Neovim
   - The buffer is created in the Neovim instance where `:GhostTextStart` was last called.
     If you want a specific Neovim instance to handle this, call `:GhostTextStart` in that
     instance before activating the extension in your browser.

The synced buffer will sync changes bidirectionally. Any changes in the browser input will update
Neovim's buffer. Any changes to the buffer will update the browser input.

### `:GhostTextStart`

Start service. If an instance of **ghost-text.nvim** is already running,
be it by the current Neovim instance or another, the older **ghost-text.nvim**
is unalived in favour of the younger one.

### `:GhostTextStop`

Stops the service.

### `:GhostTextToggle`

Starts the service if not running or stops it if it's already running.
