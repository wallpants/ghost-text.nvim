local M = {}

---@type config
M.config = {
	port = 4001,
	silent = false,
	autostart = true,
	filetype_domains = {
		markdown = { "*.openai.com*", "*.reddit.com*", "*.github.com*" },
	},
}

M.validate_config = function()
	vim.validate({
		port = { M.config.port, "number" },
		silent = { M.config.silent, "boolean" },
		log_level = {
			M.config.log_level,
			function(log_level)
				local is_nil = type(log_level) == "nil"
				local is_valid = (type(log_level) == "string") and ((log_level == "debug") or (log_level == "verbose"))
				return is_nil or is_valid
			end,
			'log_level must be nil, "debug" or "verbose"',
		},
		filetype_domains = {
			M.config.filetype_domains,
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

---@param log_level string
M.log_exit = function(log_level)
	if not log_level then
		return
	end
	return function(job_id, exit_code)
		vim.print("++++++++++++++++")
		vim.print("job# " .. job_id .. ":")
		vim.print("exit_code: " .. exit_code)
	end
end

---@param log_level string
M.log_job = function(log_level)
	-- https://neovim.io/doc/user/channel.html#channel-bytes
	if not log_level then
		return
	end
	local lines = { "" }
	return function(job_id, data)
		local eof = #data > 0 and data[#data] == ""
		lines[#lines] = lines[#lines] .. data[1]
		for i = 2, #data do
			table.insert(lines, data[i])
		end
		if eof then
			vim.print("----------------")
			vim.print("job# " .. job_id .. ":")
			for _, line in ipairs(lines) do
				vim.print(line)
			end
			lines = { "" }
		end
	end
end

return M
