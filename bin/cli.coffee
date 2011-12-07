#!/usr/bin/env coffee
require('coffee-script');
config = require '../lib/config'
path = require 'path'
fs = require 'fs'
log = require 'node-log'
log.setName config.service
  
commando = {}
commandPath = path.join __dirname, '../commands/'

# Parse process args to command name and command arguments
parse = ->
  args = process.argv[2...]
  command = args[0]
  args.shift()
  if commandExists command
    require(commandPath + command).exe commando, args
  else if appExists command
    command = args[0]
    args.shift()
    commandPath = path.join __dirname, '../commands/app/'
    if commandExists command
      require(commandPath + command).exe commando, args
    else 
      defaultHelp commandPath, args
  else
    defaultHelp commandPath, args
      
defaultHelp = (commandPath, args) ->
  if commandExists 'help'
    require(commandPath + 'help').exe(commando, args)
  else
    files = fs.readdirSync commandPath
    return log.error 'No commands found.' unless files
    commands = (path.basename(x, path.extname(x)) for x in files)
    log.info 'Available Commands:'
    log.info "  -  #{command}" for command in commands
      
commandExists = (command) -> 
  try
    require.resolve path.join commandPath, command
    return true
  catch err
    return false
    
appExists = (appName) -> appName in config.applications

parse()
