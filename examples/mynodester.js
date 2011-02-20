#!/usr/bin/env node

/**
* Setup the brand info here..
*/
process.nodester = {
    brand: 'myapp',
    apihost: 'nodester.myapp.com'
}
 
//Include the CLI
var cli = require('nodester-cli'),
    //Find the command (process.argv has already been processed here to remove node and scriptname)
    command = process.argv[0],
    //Include the commands so you can add your own
    cmds = cli.commands;

/*
* Add a new command:
*   mynodester davglass
*   mynodester davglass test
*   mynodester help davglass
*/
cmds.davglass = {
    test: function() {
        cli.log.info('DAVGLASS TEST');
    },
    usage: function() {
        cli.log.usage('davglass USAGE GOES HERE');
    }
}

//Execute the command..
cli.run(cmds, command);

