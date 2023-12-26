local Config = require("ghost-text.config")
local Fns = require("ghost-text.functions")

local M = {}

---@param partial_config config
M.setup = function(partial_config)
	Config.value = vim.tbl_deep_extend("force", Config.value, partial_config)
	Config.validate()

	if Config.value.autostart then
		Fns.start()
	end

	vim.api.nvim_create_user_command("GhostTextStart", Fns.start, {})
	vim.api.nvim_create_user_command("GhostTextStop", Fns.stop, {})
	vim.api.nvim_create_user_command("GhostTextToggle", Fns.toggle, {})
end

return M
