/*
* nodester-cli
* A CLI tool to allow interaction with the http://nodester.com/ platform.
* @division clietn
*/
/*jshint node:true, noempty:true, laxcomma:true, laxbreak:false */

"use strict";

// node libraries
var fs      = require('fs')
  , path    = require('path')
  , crypto  = require('crypto')
  , resolve = path.resolve
  ;

// Custom libs
var Node = require('nodester-api').nodester
  , config = require('./config')
  , log = require('./log')
  , Table = require('cli-table')
  ;

function usage () {
  log.info('');
  log.info('`nodester client`'.bold + ' setup your own client`');
  log.usage('');
  log.usage('\tclient set <endpoint> <brand>\t- <endpoint> is the api endpoint of your nodester personal cloud and <brand> is the name of that cloud');
  log.usage('\tclient get\t- get current configuration')
  log.usage('');
  log.info('ok!'.green.bold);
}



// Config Helper
// @api public
// Uso:
// var config = new Config(); // you can pass a config file in json format
// config.get(); // gets the whole config file
// config.get('version'); // gets the version if exists
// config.set('version','0.0.1'); //sets the version to 0.0.1


function Config (configFile) {
    this.packUrl = resolve(__dirname ,'../config.json');
    if (configFile) {
        this.packUrl = resolve(__dirname, configFile);
    }
    this.configFile = require(this.packUrl);
}

Config.prototype.get = function(key){
    if (!key) return this.configFile;
    return this.configFile[key];
};

Config.prototype.reload = function() {
    var self = this;
    try {
        fs.writeFileSync(self.packUrl, JSON.stringify(self.configFile, null, 2));
        delete require.cache[require.resolve(self.packUrl)];
        self.configFile = require(self.packUrl);
        return true;
    } catch (excp) {
        return false;
    }
};

Config.prototype.set = function(key, value, cb){
    this.configFile[key] = value;
    return this.reload();
};

Config.prototype.del = function(key) {
    delete this.configFile[key];
    return this.reload();
};

var config = new Config();
var Client = {
	usage: usage,
	get: function (arg) {
		var current = config.get();
		log.info('Current client:');
		log.info('\tAPI endpoint \t-', current.apihost);
		log.info('\tBrand \t\t-', current.brand);
		log.info('ok!'.green)
		return;
	},
	set: function (args) {
		if (!args) return log.error(' No args');
		if (args.length < 2) return log.error('no enough args')
		var endpoint = args[0],
			brand = args[1];
		if (config.set('apihost',endpoint) && config.set('brand',brand)) {
			log.info(' Saved');
			log.info('ok!'.green);
		} else {
			log.error('failed to setup new creds');
		}	
	}
}
module.exports =  Client