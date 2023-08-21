local M = {}

local enable_logging = false

---@param source string
local print_cmd = function(source)
	return function(_, data)
		if enable_logging then
			print(source .. " " .. vim.inspect(data))
		end
	end
end

---@class opts
---@field autostart boolean
---@field port number
--
---@param opts opts
M.setup = function(opts)
	---@type opts
	local default_opts = {
		autostart = true,
		port = 4001,
	}
	opts = vim.tbl_deep_extend("keep", opts, default_opts)

	vim.api.nvim_create_autocmd({ "TextChangedI", "TextChanged" }, {
		pattern = { "*.ghost" },
		callback = function(args)
			vim.rpcnotify(0, "ghost-text-change", args)
		end,
	})

	vim.api.nvim_create_autocmd({ "BufDelete" }, {
		pattern = { "*.ghost" },
		callback = function(args)
			vim.rpcnotify(0, "ghost-buffer-delete", args)
		end,
	})

	local current_file_path = debug.getinfo(1, "S").source:sub(2)
	local plugin_root = vim.fn.fnamemodify(current_file_path, ":p:h:h:h") .. "/"
	local serverlist = vim.fn.serverlist()
	local nvim_socket = serverlist[1]
	local shell_command = "node " .. plugin_root .. "dist/index.js " .. nvim_socket .. " " .. opts.port

	local function start_server()
		vim.fn.jobstart(shell_command, {
			on_stdout = print_cmd("stdout"),
			on_stderr = print_cmd("stderr"),
			on_exit = print_cmd("exit"),
		})
	end

	if opts.autostart then
		start_server()
	else
		vim.api.nvim_create_user_command("GhostTextStart", start_server, {})
	end
end

return M
