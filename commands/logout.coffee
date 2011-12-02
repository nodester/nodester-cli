log = require 'node-log'
config = require '../lib/config'

exports.exe = (cmd, args) -> 
  return log.error 'Not logged in' unless config.username? and config.password?
  config.username = null
  config.password = null
  config.applications = []
  config.write()
  log.info 'Logged out'
