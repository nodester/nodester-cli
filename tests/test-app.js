#!/usr/bin/env node

process.nodester = {
    brand: 'nodester',
    apihost: 'api.nodester.com'
}

var cli = require('nodester-cli'),
    command = process.argv[0],
    cmds = cli.commands;
    
cli.run(cmds, command);
