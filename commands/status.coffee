log = require 'node-log'
api = require '../lib/api'

exports.exe = (cmd, args) -> 
  api.get 'status', (res) -> log.info "#{x}: #{res[x]}" for x of res
