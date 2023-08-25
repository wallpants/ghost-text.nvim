local M = {}

---@enum log_output
M.LOG_OUTPUT = {
	none = "none",
	file = "file",
	print = "print",
}

---@class plugin_props
---@field port number

---@class opts
---@field autostart boolean
---@field port number
---@field log_output log_output

return M
