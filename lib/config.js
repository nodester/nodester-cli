
var path = require('path'),
    fs = require('fs');


exports.parse = function() {
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
