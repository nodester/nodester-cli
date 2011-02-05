#!/usr/bin/env node
var node = require('nodester-api').nodester;
var path = require('path');
var fs = require('fs');
var sys = require('sys');
var brand = "nodester";
var apihost = "api.nodester.com";

process.argv.shift(); process.argv.shift();

var showUsage = function () {
  console.log(
    brand + " <command> <param1> <param2>\n" +
    "\n" +
    "Commands are:\n" +
    brand + " coupon <email address>\n" +
    brand + " user create <username> <password> <email address> <file containing ssh public key> <coupon code>\n" +
    brand + " user setup <username> <password>\n" +
//    brand + " user delete <username> <password>\n" +
    "The commands below require you to have run 'user setup' before.\n" +
    brand + " user setpass <new password>\n" +
    "You should run user setup after running setpass.\n" +
    brand + " user setkey <file containing ssh public key>"
  );
  console.log(
    brand + " apps list\n" +
    brand + " app create <app-name> <initial js file>\n" +
    brand + " app init <app-name> <folder>\n" +
    brand + " app setup <app-name>\n" +
    "If you use app setup <app-name> inside a folder the commands below can be run without the <app-name> from that folder.\n" +
    brand + " app info <app-name>\n" +
    brand + " app logs <app-name>\n" +
    brand + " app start <app-name>\n" +
    brand + " app restart <app-name>\n" +
    brand + " app stop <app-name>"
  );
  console.log(
    brand + " appnpm install <app-name> <package name>\n" +
    brand + " appnpm upgrade <app-name> <package name>\n" +
    brand + " appnpm uninstall <app-name> <package name>\n" +
    brand + " appdomain add <app-name> <domain-name>\n" +
    brand + " appdomain delete <app-name> <domain-name>\n"
  );
};

if (process.argv.length < 2) {
  showUsage();
  process.exit(1);
};

if (process.argv[0] === "-h" || process.argv[0] === "--help" || process.argv[0] === "help") {
  showUsage();
  process.exit(0);
};

var config = {
  username: "",
  password: ""
};
var config_file = path.join(process.env.HOME, "." + brand + "rc");
try {
  var cf_stat = fs.statSync(config_file);
  if (cf_stat.isFile()) {
    var config_str = fs.readFileSync(config_file);
    var lines = config_str.toString().split("\n");
    for(var i in lines) {
      var line = lines[i];
      if (line.length > 2) {
        var prts = line.split("=");
        config[prts[0]] = prts[1];
      }
    }
  }
} catch (e) {
  // sys.puts(sys.inspect(e));
}

var appname = "";
var apprcfile = "." + brand + ".appconfig";
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
            appname = prts[1];
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

var pad = function (str, len) {
  if (len + 1 >= str.length) {
    str = str + Array(len + 1 - str.length).join(" ");
  }
  return str;
}

var check_config = function () {
  if (config.username == "" || config.password == "") {
    console.log("Error: username and password not set in config.\nPlease run " + brand + " user setup <username> <password>\n");
    process.exit(2);
  }
};

var action = process.argv.shift();
switch(action) {
  case "coupon":
    var email = process.argv.shift();
    var nodeapi = new node("", "", apihost);
    nodeapi.coupon_request(email, function (data) {
      console.log(data.status);
    });
    break;
  case "user":
    var subaction = process.argv.shift();
    switch(subaction) {
      case "create":
        var user = process.argv.shift();
        var pass = process.argv.shift();
        var email = process.argv.shift();
        var rsakey = process.argv.shift();
        var coupon = process.argv.shift();
        var nodeapi = new node("", "", apihost);
        if (typeof user == 'undefined' || typeof pass == 'undefined' || typeof email == 'undefined' || typeof rsakey == 'undefined' || typeof coupon == 'undefined') {
          console.log("Invalid arguments.");
          showUsage();
          process.exit(1);
        }
        nodeapi.user_create(user, pass, email, rsakey, coupon, function (data) {
          console.log(data.status);
        });
        break;
      case "setup":
        var user = process.argv.shift();
        var pass = process.argv.shift();
        if (typeof user == 'undefined' || typeof pass == 'undefined') {
          console.log("Invalid arguments.");
          showUsage();
          process.exit(1);
        }
        fs.writeFileSync(config_file, "username=" + user + "\npassword=" + pass + "\n");
        console.log("Config settings saved.");
        break;
/*
      case "delete":
        break;
*/
      case "setpass":
        check_config();
        var nodeapi = new node(config.username, config.password, apihost);
        var newpass = process.argv.shift();
        if (typeof user == 'undefined' || typeof pass == 'undefined') {
          console.log("Invalid arguments.");
          showUsage();
          process.exit(1);
        }
        nodeapi.user_setpass(newpass, function (data) {
          console.log(data.status);
        });
        break;
      case "setkey":
        check_config();
        var rsadata = fs.readFileSync(process.argv.shift()).toString();
        if (rsadata.length < 40) {
          console.log("Error: Invalid SSH key file.");
          process.exit(1);
        }
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.user_setkey(rsadata, function (data) {
          console.log(data.status);
        });
        break;
      default:
        console.log("Invalid action");
        showUsage();
        process.exit(1);
        break;
    }
    break;
  case "apps":
    var subaction = process.argv.shift();
    switch(subaction) {
      case "list":
        check_config();
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.apps_list(function (data) {
          if (data.length > 0) {
            var c = [15, 6, 91, 13, 11];
            console.log(pad("Name", c[0]) + " " + pad("Port", c[1]) + "" + pad("gitrepo", c[2]) + " " + pad("Start", c[3]) + " " + pad("Running", c[4]));
            for(var i in data) {
              console.log(pad(data[i].name, c[0]) + " " + pad(data[i].port, c[1]) + "  " + pad(data[i].gitrepo, c[2]) + " " + pad(data[i].start, c[3]) + " " + pad(data[i].running, c[4]));
            }
          }
        });
        break;
      default:
        console.log("Invalid action");
        showUsage();
        process.exit(1);
        break;
    }
    break;
  case "app":
    var subaction = process.argv.shift();
    switch(subaction) {
      case "create":
        check_config();
        var appname = process.argv.shift();
        var start = process.argv.shift();
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.app_create(appname, start, function (data) {
          if (data.status == "success") {
            var c = [15, 6, 91, 13, 11];
            console.log(pad("Name", c[0]) + " " + pad("Port", c[1]) + " " + pad("gitrepo", c[2]) + " " + pad("Start", c[3]) + " " + pad("Running", c[4]));
            console.log(pad(appname, c[0]) + " " + pad(data.port, c[1]) + " " + pad(data.gitrepo, c[2]) + " " + pad(data.start, c[3]) + " " + pad(data.running, c[4]));
          } else {
            console.log(data.status);
          }
        });
        break;
      case "init":
        check_config();
        var appname = process.argv.shift();
        var folder = process.argv.shift();
        try {
          fs.mkdirSync(folder, 0750);
        } catch (e) {
          console.log(e.toString());
        }
        var exec = require('child_process').exec;
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.app_info(appname, function (data) {
          var child = exec('git clone ' + data.gitrepo + ' ' + folder, function (error, stdout, stderr) {
            fs.writeFileSync(folder + '/' + apprcfile, "appname=" + appname + "\n");
            fs.writeFileSync(folder + '/.gitignore', apprcfile + "\n");
            fs.writeFileSync(folder + '/' + data.start,
              "var http = require('http');\n" +
              "http.createServer(function (req, res) {\n" +
              "  res.writeHead(200, {'Content-Type': 'text/plain'});\n" +
              "  res.end('Hello World\\n');\n" +
              "}).listen(" + data.port + ");\n"
            );
            var child2 = exec('cd ' + folder + '; git add ' + data.start + ' .gitignore; git commit -m "Init via ' + brand + '-cli"; git push origin master; ', function (error, stdout, stderr) {
              nodeapi.app_stop(appname, function (data) {
                if (data.status == "success") {
                  console.log("App stopped.");
                } else {
                  console.log(data.status);
                }
                nodeapi.app_start(appname, function (data) {
                  if (data.status == "success") {
                    console.log("App started.");
                  } else {
                    console.log(data.status);
                  }
                });
              });
            });
          });
        });
        break;
      case "setup":
        var appname = process.argv.shift();
        fs.writeFileSync(apprcfile, "appname=" + appname + "\n");
        console.log("App settings saved.");
        break;
      case "info":
        check_config();
        if (appname == "") {
          appname = process.argv.shift();
        }
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.app_info(appname, function (data) {
          if (data.status == "success") {
            var c = [15, 6, 91, 13, 11];
            console.log(pad("Name", c[0]) + " " + pad("Port", c[1]) + "" + pad("gitrepo", c[2]) + " " + pad("Start", c[3]) + " " + pad("Running", c[4]));
            console.log(pad(appname, c[0]) + " " + pad(data.port, c[1]) + "  " + pad(data.gitrepo, c[2]) + " " + pad(data.start, c[3]) + " " + pad(data.running, c[4]));
          } else {
            console.log(data.status);
          }
        });
        break;
      case "logs":
        check_config();
        if (appname == "") {
          appname = process.argv.shift();
        }
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.app_logs(appname, function (data) {
          if (typeof data.success != 'undefined' && data.success == true) {
            for(var i in data.lines) {
              console.log(data.lines[i]);
            };
          } else {
            console.log(data);
          }
        });
        break;
      case "start":
        check_config();
        if (appname == "") {
          appname = process.argv.shift();
        }
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.app_start(appname, function (data) {
          if (data.status == "success") {
            console.log("App started.");
          } else {
            console.log(data.status);
          }
        });
        break;
      case "restart":
        check_config();
        if (appname == "") {
          appname = process.argv.shift();
        }
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.app_restart(appname, function (data) {
          if (data.status == "success") {
            console.log("App restarted.");
          } else {
            console.log(data.status);
          }
        });
        break;
      case "stop":
        check_config();
        if (appname == "") {
          appname = process.argv.shift();
        }
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.app_stop(appname, function (data) {
          if (data.status == "success") {
            console.log("App stopped.");
          } else {
            console.log(data.status);
          }
        });
        break;
      default:
        console.log("Invalid action");
        showUsage();
        process.exit(1);
        break;
    }
    break;
  case "appnpm":
    var subaction = process.argv.shift();
    switch(subaction) {
      case "install":
        if (appname == "") {
          appname = process.argv.shift();
        }
        var package = process.argv.shift();
        check_config();
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.appnpm_install(appname, package, function (data) {
          if (data.status == "success") {
            console.log(data.output);
          } else {
            console.log(data.status);
          }
        });
        break;
      case "update":
        if (appname == "") {
          appname = process.argv.shift();
        }
        var package = process.argv.shift();
        check_config();
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.appnpm_update(appname, package, function (data) {
          if (data.status == "success") {
            console.log(data.output);
          } else {
            console.log(data.status);
          }
        });
        break;
      case "uninstall":
        if (appname == "") {
          appname = process.argv.shift();
        }
        var package = process.argv.shift();
        check_config();
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.appnpm_uninstall(appname, package, function (data) {
          if (data.status == "success") {
            console.log(data.output);
          } else {
            console.log(data.status);
          }
        });
        break;
      default:
        console.log("Invalid action");
        showUsage();
        process.exit(1);
        break;
    }
    break;
  case "appdomain":
    var subaction = process.argv.shift();
    switch(subaction) {
      case "add":
        if (appname == "") {
          appname = process.argv.shift();
        }
        var domain = process.argv.shift();
        check_config();
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.appdomain_add(appname, domain, function (data) {
          if (data.status == 'success') {
            console.log(data.message);
          } else {
            console.log(data);
          }
        });
        break;
      case "delete":
        if (appname == "") {
          appname = process.argv.shift();
        }
        var domain = process.argv.shift();
        check_config();
        var nodeapi = new node(config.username, config.password, apihost);
        nodeapi.appdomain_delete(appname, domain, function (data) {
          if (data.status == 'success') {
            console.log(data.message);
          } else {
            console.log(data);
          }
        });
        break;
      default:
        console.log("Invalid action");
        showUsage();
        process.exit(1);
        break;
    }
    break;
  default:
    showUsage();
    process.exit(1);
    break;
};
