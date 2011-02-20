#!/usr/bin/env node


var cli = require('nodester-cli'),
    command = process.argv[0],
    cmds = cli.commands;
    
cli.run(cmds, command);
