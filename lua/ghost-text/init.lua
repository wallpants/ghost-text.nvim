local Config = require("ghost-text.config")
local Fns = require("ghost-text.functions")

local M = {}

---@param partial_config ghost_text_config
M.setup = function(partial_config)
	Config.value = vim.tbl_deep_extend("force", Config.value, partial_config)
	Config.validate()

	vim.api.nvim_create_user_command("GhostTextStart", Fns.start, {})

	if Config.value.autostart then
		Fns.start(true)
	end
end

return M
