#!/usr/bin/env node


process.nodester = {
  brand: 'nodester',
  apihost: 'api.nodester.com',
  env : process.env.NODE_ENV || 'production'
}

var cli = require('../lib/commands'),
    command = process.argv[0],
    cmds = cli.commands;

cli.run(cmds, command);
