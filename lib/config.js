
var path = require('path'),
    fs = require('fs'),
    path = require('path'),
    exists = path.existsSync,
    crypto = require("crypto"),
    iniparser = require('iniparser'),    
    log = require('./log');


exports.check = function() {
    //log.info('Checking config..');
    if (process.nodester.config.username == "" || process.nodester.config.password == "") {
        log.error("Username and password not set in config.\nPlease run " + process.nodester.brand + " user setup <username> <password>\n");
    }
    //log.info('Config valid..');
}

exports.__defineGetter__('username', function() {
    return process.nodester.config.username;
});
exports.__defineGetter__('password', function() {
    return process.nodester.config.password;
});
exports.__defineGetter__('apihost', function() {
    return process.nodester.apihost;
});
exports.__defineGetter__('apisecure', function() {
    return process.nodester.apisecure;
});
exports.__defineGetter__('brand', function() {
    return process.nodester.brand;
});
exports.__defineGetter__('appname', function() {
    return process.nodester.appname.toLowerCase();
});

exports.writeUser = function(user, pass) {
    log.info('writing user data to config');
    var config_file = path.join(process.env.HOME, "." + process.nodester.brand + '.rc');
    var str = user + ':' + pass;
    var x = cryptAuth(str);
    var out = 'auth=' + x + '\n';
    fs.writeFileSync(config_file, out, encoding='utf8');
    return config_file;
}

exports.writeApp = function(appname, folder) {
    log.info('writing app data to config');
    if (!folder) {
        folder = '';
    }
    var config_file = path.join(folder, "." + process.nodester.brand + ".appconfig");
    fs.writeFileSync(config_file, "appname=" + appname.toLowerCase() + "\n");
    return "." + process.nodester.brand + ".appconfig";
}

var getKey = function(warn) {
    var ssh = path.join(process.env.HOME, ".ssh"),
        data = '',
        keys = [
            path.join(ssh, "id_dsa"),
            path.join(ssh, "id_rsa"),
            path.join(ssh, "identity")
        ];
    keys.some(function(v) {
        if (exists(v)) {
            data = fs.readFileSync(v, encoding='utf8') + '';
            return true;
        }
    });
    if (data === '' && warn) {
        log.warn('No key file found, encrypt is not going to be strong.');
    }

    return data;
}


var convertConfig = function(config_file) {
    var config = iniparser.parseSync(config_file);
    var str = config.username + ':' + config.password;
    var x = cryptAuth(str);
    var new_config_file = path.join(process.env.HOME, "." + process.nodester.brand + '.rc');
    var out = 'auth=' + x + '\n';
    fs.writeFileSync(new_config_file, out, encoding='utf8');
    log.warn('saved new config file: ' + new_config_file);
    log.warn('removing old config file');
    fs.unlinkSync(config_file);
};

/**
* Based heavily on NPM's _authCrypt
* https://github.com/isaacs/npm/blob/master/lib/utils/ini.js
*/

var decryptAuth = function(str) {
    if (crypto.Decipher) {
        var key = getKey();
        var c = (new crypto.Decipher).init("aes192", key)
        var auth = c.update(str, "hex", "utf8")
        auth += c.final("utf8");
    } else {
        auth = str;
    }

    var b = new Buffer(auth, 'base64');
    return b.toString('utf8');
}

var cryptAuth = function(str) {
    str = new Buffer(str).toString('base64');
    if (crypto.Cipher) {
        var key = getKey(true);
        var c = (new crypto.Cipher).init("aes192", key)
        var Crypt = c.update(str, "utf8", "hex");
        Crypt += c.final("hex");
    } else {
        Crypt = str;
    }
    return Crypt;
}

exports.parse = function() {
    //log.info('parsing config');
    var old_config_file = path.join(process.env.HOME, "." + process.nodester.brand + "rc");
    if (exists(old_config_file)) {
        log.warn('old config file found, converting..');
        convertConfig(old_config_file);
    }

    var config_file = path.join(process.env.HOME, "." + process.nodester.brand + '.rc');
    if (exists(config_file)) {
        var config = iniparser.parseSync(config_file);
        var a = decryptAuth(config.auth).split(':');
        process.nodester.config.username = a[0];
        process.nodester.config.password = a[1];
    }

    var apprcfile = "." + process.nodester.brand + ".appconfig";
    if (exists(apprcfile)) {
        var config = iniparser.parseSync(apprcfile);
        process.nodester.appname = config.appname.toLowerCase();
    }
}
