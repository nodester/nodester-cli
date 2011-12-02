log = require 'node-log'
config = require '../lib/config'

exports.exe = (cmd, args) ->
  return log.error 'Not logged in' unless config.username? and config.password?
  if config.applications.length > -1
    log.info x for x in config.applications
  else
    log.error 'No applications.'
