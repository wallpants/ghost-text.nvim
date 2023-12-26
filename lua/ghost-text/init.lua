local Utils = require("ghost-text.utils")

local M = {}

---@param partial_config config
M.setup = function(partial_config)
	Utils.config = vim.tbl_deep_extend("force", Utils.config, partial_config)
	Utils.validate_config()

	local function stop_service()
		if M.job_id ~= nil then
			vim.fn.jobstop(M.job_id)
		end
	end

	local function start_service()
		vim.notify("ghost-text: init", vim.log.levels.INFO)

		-- vim.g.ghost_text_init is read by bunvim
		---@type config
		vim.g.ghost_text_init = Utils.config

		local __filename = debug.getinfo(1, "S").source:sub(2)
		local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

		local cmd = "bun start"

		M.job_id = vim.fn.jobstart(cmd, {
			cwd = plugin_root .. "app",
			stdin = "null",
		})
	end

	local function toggle_service()
		if M.job_id ~= nil then
			stop_service()
		else
			start_service()
		end
	end

	start_service()

	vim.api.nvim_create_user_command("GhostTextStart", start_service, {})
	vim.api.nvim_create_user_command("GhostTextStop", stop_service, {})
	vim.api.nvim_create_user_command("GhostTextToggle", toggle_service, {})
end

return M
