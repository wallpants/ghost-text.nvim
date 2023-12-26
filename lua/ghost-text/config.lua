local M = {}

---@type config
M.value = {
	port = 4001,
	silent = false,
	autostart = true,
	filetype_domains = {
		markdown = { "*.openai.com*", "*.reddit.com*", "*.github.com*" },
	},
}

M.validate = function()
	vim.validate({
		port = { M.value.port, "number" },
		silent = { M.value.silent, "boolean" },
		log_level = {
			M.value.log_level,
			function(log_level)
				local is_nil = type(log_level) == "nil"
				local is_valid = (type(log_level) == "string") and ((log_level == "debug") or (log_level == "verbose"))
				return is_nil or is_valid
			end,
			'log_level must be nil, "debug" or "verbose"',
		},
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
		},
	})
end

return M
