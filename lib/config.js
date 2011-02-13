
var path = require('path'),
    fs = require('fs'),
    log = require('./log');


exports.check = function() {
    log.info('Checking config..');
    if (process.nodester.config.username == "" || process.nodester.config.password == "") {
        log.error("Username and password not set in config.\nPlease run " + process.nodester.brand + " user setup <username> <password>\n");
    }
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
exports.__defineGetter__('brand', function() {
    return process.nodester.brand;
});
exports.__defineGetter__('appname', function() {
    return process.nodester.appname;
});

exports.writeUser = function(user, pass) {
    log.info('writing user data to config');
    var config_file = path.join(process.env.HOME, "." + process.nodester.brand + "rc");
    fs.writeFileSync(config_file, "username=" + user + "\npassword=" + pass.replace(/\$/g,"\$") + "\n");
    return config_file;
}

exports.writeApp = function(appname, folder) {
    log.info('writing app data to config');
    if (!folder) {
        folder = '';
    }
    var config_file = path.join(folder, "." + process.nodester.brand + ".appconfig");
    fs.writeFileSync(config_file, "appname=" + appname + "\n");
    return "." + process.nodester.brand + ".appconfig";
}

exports.parse = function() {
    //log.info('parsing config');
    //This really should be rewritten to support a .json config file..
    var config_file = path.join(process.env.HOME, "." + process.nodester.brand + "rc");
    try {
      var cf_stat = fs.statSync(config_file);
      if (cf_stat.isFile()) {
        var config_str = fs.readFileSync(config_file);
        var lines = config_str.toString().split("\n");
        for(var i in lines) {
          var line = lines[i];
          if (line.length > 2) {
            var prts = line.split("=");
            process.nodester.config[prts[0]] = prts[1];
          }
        }
      }
    } catch (e) {
      // sys.puts(sys.inspect(e));
    }
    
    var apprcfile = "." + process.nodester.brand + ".appconfig";
    try {
      var cf_stat = fs.statSync(apprcfile);
      if (cf_stat.isFile()) {
        var config_str = fs.readFileSync(apprcfile);
        var lines = config_str.toString().split("\n");
        for(var i in lines) {
          var line = lines[i];
          if (line.length > 2) {
            var prts = line.split("=");
            switch(prts[0]) {
              case "appname":
                process.nodester.appname = prts[1];
                break;
              default:
                break;
            }
          }
        }
      }
    } catch (e) {
      // sys.puts(sys.inspect(e));
    }


}
