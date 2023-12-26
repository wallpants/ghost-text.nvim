local Utils = require("github-preview.utils")
local M = {}

M.start = function()
	vim.notify("ghost-text: init", vim.log.levels.INFO)

	-- vim.g.ghost_text_init is read by bunvim
	---@type config
	vim.g.ghost_text_init = Utils.config

	local __filename = debug.getinfo(1, "S").source:sub(2)
	local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

	local command = "bun run start"

	---@type env
	local env = { IS_DEV = false }

	if Utils.config.log_level then
		command = "bun --hot run start"
		env.IS_DEV = true
		env.LOG_LEVEL = Utils.config.log_level
	end

	Utils.job_id = vim.fn.jobstart(command, {
		cwd = plugin_root,
		stdin = "null",
		on_exit = Utils.log_exit(env.LOG_LEVEL),
		on_stdout = Utils.log_job(env.LOG_LEVEL),
		on_stderr = Utils.log_job(env.LOG_LEVEL),
		env = env,
	})
end

M.stop = function()
	local channel_id = Utils.get_client_channel()
	if channel_id ~= nil then
		vim.rpcrequest(channel_id, "on_before_exit")
		if Utils.job_id then
			vim.fn.jobstop(Utils.job_id)
			Utils.job_id = nil
		end
		return true
	end
	return false
end

M.toggle = function()
	if not M.stop() then
		M.start()
	end
end

return M
