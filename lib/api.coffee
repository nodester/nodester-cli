config = require './config'
request = require 'request'
log = require 'node-log'
      
send = (path, method, cb, msg) -> 
  request {url: "http://#{config.host}/#{path}", method: method, json: JSON.stringify msg}, (error, res, body) ->
    return log.error error if error?
    return log.error "#{res.statusCode} - Invalid API '#{path}'" if res?.statusCode is 404
    return log.error "Failed to read response from server." unless body?
    cb JSON.parse body
      
module.exports =
  get: (path, cb) -> send path, 'GET', cb
  del: (path, cb) -> send path, 'DELETE', cb
  post: (path, body, cb) -> send path, 'POST', cb, body
  put: (path, body, cb) -> send path, 'PUT', cb, body
