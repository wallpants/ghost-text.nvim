local Utils = require("ghost-text.utils")
local Types = require("ghost-text.types")

local M = {}

---@type opts
M.default_opts = {
	autostart = true,
	port = 4001,
	log_output = Types.LOG_OUTPUT.none,
}

---@param opts opts
M.setup = function(opts)
	opts = vim.tbl_deep_extend("keep", opts, M.default_opts)

	local function start_server()
		---@type plugin_props
		vim.g.ghost_text_props = {
			port = opts.port,
		}

		vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
			pattern = { "*.ghost-text" },
			callback = function(args)
				vim.rpcnotify(0, "ghost-text-changed", args)
			end,
		})

		vim.api.nvim_create_autocmd({ "BufDelete" }, {
			pattern = { "*.ghost-text" },
			callback = function(args)
				vim.rpcnotify(0, "ghost-buffer-delete", args)
			end,
		})

		local shell_command = "node " .. Utils.plugin_root .. "dist/index.js " .. Utils.nvim_socket
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
