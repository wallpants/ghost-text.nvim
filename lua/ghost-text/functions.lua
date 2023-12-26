local Utils = require("github-preview.utils")
local M = {}

M.job_id = nil

M.start = function()
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
