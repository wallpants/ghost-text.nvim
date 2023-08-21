local M = {}

local current_file_path = debug.getinfo(1, "S").source:sub(2)
local plugin_root = vim.fn.fnamemodify(current_file_path, ":p:h:h:h") .. "/"
local serverlist = vim.fn.serverlist()
local nvim_socket = serverlist[1]

---@param log_output string
---@param source string
local log = function(log_output, source)
	return function(_, data)
		if log_output == "print" then
			print(source .. vim.inspect(data))
		end
		if log_output == "file" then
			local file = io.open(plugin_root .. source .. ".log", "a")
			if file then
				file:write(vim.inspect(data) .. "\n")
				file:close()
			end
		end
	end
end

---@class opts
---@field autostart boolean
---@field port number
---@field log_output string -- "none" | "file" | "print"
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

	local shell_command = "node " .. plugin_root .. "dist/index.js " .. nvim_socket

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
			on_stdout = log(opts.log_output, "stdout"),
			on_stderr = log(opts.log_output, "stderr"),
			on_exit = log(opts.log_output, "exit"),
		})
	end

	if opts.autostart then
		start_server()
	else
		vim.api.nvim_create_user_command("GhostTextStart", start_server, {})
	end
end

return M
