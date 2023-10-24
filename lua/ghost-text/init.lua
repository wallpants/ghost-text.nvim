local M = {}

---@class opts
---@field autostart boolean
---@field port number
---@field filetype_domains { [string]: string[] }

---@class plugin_init
---@field port number
---@field filetype_domains { [string]: string[] }

local function is_filetype_domains(var)
	if type(var) == "table" then
		for k, v in pairs(var) do
			if type(k) == "string" and type(v) == "table" then
				for _, item in ipairs(v) do
					if type(item) ~= "string" then
						return false
					end
				end
			else
				return false
			end
		end
		return true
	end
	return false
end

---@type opts
local default_opts = {
	port = 4001,
	autostart = false,
	filetype_domains = {
		markdown = { "*.openai.com*", "*.reddit.com*" },
	},
}

---@param opts opts
M.setup = function(opts)
	-- deep merge user opts with default opts without overriding user opts
	opts = vim.tbl_deep_extend("keep", opts, default_opts)

	vim.validate({
		autostart = { opts.autostart, "boolean" },
		port = { opts.port, "number" },
		filetype_domains = { opts.filetype_domains, is_filetype_domains },
	})

	local job_id = nil

	local function stop_service()
		if job_id ~= nil then
			vim.fn.jobstop(job_id)
		end
	end

	local function start_service()
		vim.notify("ghost-text: init", vim.log.levels.INFO)

		---@type plugin_init
		vim.g.ghost_text_init = {
			port = opts.port,
			filetype_domains = opts.filetype_domains,
		}

		local __filename = debug.getinfo(1, "S").source:sub(2)
		local plugin_root = vim.fn.fnamemodify(__filename, ":p:h:h:h") .. "/"

		local cmd = "bun start"

		job_id = vim.fn.jobstart(cmd, {
			cwd = plugin_root .. "app",
			stdin = "null",
		})
	end

	local function toggle_service()
		if job_id ~= nil then
			stop_service()
		else
			start_service()
		end
	end

	if opts.autostart then
		start_service()
	end

	vim.api.nvim_create_user_command("GhostTextStart", start_service, {})
	vim.api.nvim_create_user_command("GhostTextStop", stop_service, {})
	vim.api.nvim_create_user_command("GhostTextToggle", toggle_service, {})
end

return M
