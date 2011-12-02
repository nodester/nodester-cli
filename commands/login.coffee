log = require 'node-log'
api = require '../lib/api'
config = require '../lib/config'

exports.exe = (cmd, args) ->
  return log.error 'Please logout before trying to login' if config.username? and config.password?
  return log.error 'Missing arguments' if args.length < 2
  api.post 'login', {username: args[0], password: args[1]}, (error, response, body) ->
    return log.error(error) if error
    parsed = JSON.parse body
    if parsed.valid
      config.username = args[0]
      config.password = args[1]
      config.applications = parsed.applications
      config.write()
      log.info 'Login successful'
    else
      log.error parsed.error
