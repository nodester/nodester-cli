#!/usr/bin/env node

var config = require('../config');

process.nodester = {
  brand: config.brand,
  apihost: config.apihost,
  env : process.env.NODESTER_ENV || 'production'
}

var cli = require('../lib/commands'),
    command = process.argv[0],
    cmds = cli.commands;

cli.run(cmds, command);
