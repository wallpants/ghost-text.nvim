local Utils = require("ghost-text.utils")

local M = {}

---@class opts
---@field autostart boolean
---@field port number
---@field log_output string -- "none" | "file" | "print"
--
---@param opts opts
M.setup = function(opts)
	---@type opts
	local default_opts = {
		autostart = true,
		port = 4001,
		log_output = "none",
	}
	opts = vim.tbl_deep_extend("keep", opts, default_opts)

	-- set vars to be read and used by node-client
	vim.g.ghost_text_port = opts.port

	local shell_command = "node " .. Utils.plugin_root .. "dist/index.js " .. Utils.nvim_socket

	local function start_server()
		vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
			pattern = { "*.ghost-text" },
			callback = function(args)
				vim.rpcnotify(0, "ghost-text-change", args)
			end,
		})

		vim.api.nvim_create_autocmd({ "BufDelete" }, {
			pattern = { "*.ghost-text" },
			callback = function(args)
				vim.rpcnotify(0, "ghost-buffer-delete", args)
			end,
		})

		vim.fn.jobstart(shell_command, {
			on_stdout = Utils.log(opts.log_output, "stdout"),
			on_stderr = Utils.log(opts.log_output, "stderr"),
			on_exit = Utils.log(opts.log_output, "exit"),
		})
	end

	if opts.autostart then
		start_server()
	else
		vim.api.nvim_create_user_command("GhostTextStart", start_server, {})
	end
end

return M
