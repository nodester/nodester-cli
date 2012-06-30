# Nodester API CLI access [![Build Status](https://secure.travis-ci.org/alejandromg/nodester-cli.png)](http://travis-ci.org/nodester/nodester-cli)

This app is a little wrapper around the REST API for the [Nodester](http://nodester.com/) OS Node hosting platform.

## Installation

    npm install nodester-cli -g


## Usage

In your CLI run one of these commands:

    $ nodester 
    $ nodester app <usage>
    $ nodester user <usage>

Each of them will outpot the help for the respective command.


## Local installation

If you have your own instance of [Nodester](http://nodester.com/) installed on your own server, the command line app is designed to work with that too. Currently it supports 3 environment variables to change a couple of default settings.

Here is a simple example:

    #!/bin/bash

    export NODESTER_BRAND=davster;
    export NODESTER_APIHOST=auth.davglass.com;
    nodester "$@"
    export NODESTER_BRAND=;
    export NODESTER_APIHOST=;

**In the newest version of `nodester-cli`** you can easily switch betwen instances running:

    $ nodester config set <apiendpoint> <brand>

after this you can access to your instance. To rollback to the nodester endpoint run:

    $ nodester config set api.nodester.com nodester

Also you can see what is the current configuration running: 

    $ nodester config get


Also you can take a look at `examples` and see how can you roll out your personal nodester-cli


## Contributors

The nodester community (`nodester authors`):

	- [Chris Matthieu](http://matthieu.us)
    - [Daniel Bartlett <dan@f-box.org>](http://danb-uk.net/)
    - [Dav Glass <davglass@gmail.com>](http://twitter/@davglass)
    - Abraham Williams <4braham@gmail.com>
    - Contra <contra@australia.edu>
    - Marcos Oliveira <marcosvm@gmail.com>
    - [Alejandro Morales](http://alejandromorales.co.cc)

## License

MIT 2012 - Nodester

