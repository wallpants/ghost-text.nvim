local M = {}

---@type ghost_text_config
M.value = {
	-- port used by local server
	port = 4001,

	-- automatically start server
	-- if "false", you must manually call ":GhostTextStart" to start server
	autostart = true,

	-- map url patterns to filetypes to set the buffer to
	-- matching done by https://github.com/isaacs/minimatch
	filetype_domains = {
		-- markdown = { "*.openai.com*", "*.github.com*" },
	},

	-- for debugging
	-- nil | "debug" | "verbose"
	log_level = nil,
}

M.validate = function()
	vim.validate({
		port = { M.value.port, "number" },
		autostart = { M.value.autostart, "boolean" },
		filetype_domains = {
			M.value.filetype_domains,
			function(var)
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
			end,
			'log_level must be nil, "debug" or "verbose"',
		},
		log_level = {
			M.value.log_level,
			function(var)
				local is_nil = type(var) == "nil"
				local is_valid = (type(var) == "string") and ((var == "debug") or (var == "verbose"))
				return is_nil or is_valid
			end,
			'log_level must be nil, "debug" or "verbose"',
		},
	})
end

return M
