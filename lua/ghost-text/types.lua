---@class env
---@field LOG_LEVEL string?
---@field IS_DEV boolean?

---@class ghost_text_config
---@field port number | nil
---@field autostart boolean | nil
---@field log_level nil | "verbose" | "debug"
---@field filetype_domains { [string]: string[] } | nil

---@class ghost_text_props
---@field config ghost_text_config
