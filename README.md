# Nodester API CLI access

This app is a little wrapper around the REST API for the [Nodester](http://nodester.com/) OS Node hosting platform.

## Installation

    npm install nodester-cli

## Usage

    nodester help
    nodester help app
    nodester help user

    //All options
    nodester help all


## Local installation

If you have your own instance of [Nodester](http://nodester.com/) installed on your own server, the 
command line app is designed to work with that too. Currently it supports 3 environment variables
to change a couple of default settings.

Here is a simple example:

    #!/bin/bash

    export NODESTER_BRAND=davster;
    export NODESTER_APIHOST=auth.davglass.com;
    nodester "$@"
    export NODESTER_BRAND=;
    export NODESTER_APIHOST=;

