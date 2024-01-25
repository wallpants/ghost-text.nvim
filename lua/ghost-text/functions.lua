local Config = require("ghost-text.config")
local Utils = require("ghost-text.utils")
local M = {}

---@param silent boolean
M.start = function(silent)
	if not silent then
		vim.notify("ghost-text: init", vim.log.levels.INFO)
	end

	-- vim.g.ghost_text_props is read by bunvim
	---@type ghost_text_props
	vim.g.ghost_text_props = {
		config = Config.value,
	}

	local __filename = debug.getinfo(1, "S").source:sub(2)
	local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

	local command = "bun run start"

	---@type env
	local env = { IS_DEV = false }

	if Config.value.log_level then
		command = "bun --hot run start"
		env.IS_DEV = true
		env.LOG_LEVEL = Config.value.log_level
	end

	vim.fn.jobstart(command, {
		cwd = plugin_root,
		stdin = "null",
		on_exit = Utils.log_exit(env.LOG_LEVEL),
		on_stdout = Utils.log_job(env.LOG_LEVEL),
		on_stderr = Utils.log_job(env.LOG_LEVEL),
		env = env,
	})
end

return M
