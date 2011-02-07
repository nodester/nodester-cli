#!/usr/bin/env node

var node = require('nodester-api').nodester,
    path = require('path'),
    fs = require('fs'),
    sys = require('sys'),
    colors = require('colors'),
    brand = "nodester",
    apihost = "api.nodester.com",
    env = process.env;


if (env.NODESTER_APIHOST) {
    apihost = env.NODESTER_APIHOST;
}
if (env.NODESTER_BRAND) {
    brand = env.NODESTER_BRAND;
}

process.nodester = {
    apihost: apihost,
    brand: brand,
    appname: '',
    config: {
        username: '',
        password: ''
    }
};

require('../lib/config').parse();

console.log(process.nodester);

process.exit();

process.argv = process.argv.slice(2);

var showUsage = function () {
    /* {{{
  console.log(
    brand.magenta + " <command> <param1> <param2>\n" +
    "\n" +
    "Commands are:\n" +
    brand.magenta + " coupon <email address>\n" +
    brand.magenta + " user create <username> <password> <email address> <file containing ssh public key> <coupon code>\n" +
    brand.magenta + " user setup <username> <password>\n" +
//    brand + " user delete <username> <password>\n" +
    "\nThe commands below require you to have run 'user setup' before.\n".bold +
    brand.magenta + " user setpass <new password>\n" +
    "You should run user setup after running setpass.\n".red.bold + "\n" +
    brand.magenta + " user setkey <file containing ssh public key>"
  );
  console.log(
    brand.magenta + " apps list\n" +
    brand.magenta + " app create "+"<app-name>".yellow+" <initial js file>\n" +
    brand.magenta + " app init "+"<app-name>".yellow+" <folder>\n" +
    brand.magenta + " app setup "+"<app-name>".yellow+"\n" +
    "\nIf you use app setup "+"<app-name>".yellow+" inside a folder the commands below can be run without the "+"<app-name>".yellow+" from that folder.\n".bold +
    brand.magenta + " app info "+"<app-name>".yellow+"\n" +
    brand.magenta + " app logs "+"<app-name>".yellow+"\n" +
    brand.magenta + " app start "+"<app-name>".yellow+"\n" +
    brand.magenta + " app restart "+"<app-name>".yellow+"\n" +
    brand.magenta + " app stop "+"<app-name>".yellow+""
  );
  console.log(
    brand.magenta + " appnpm install "+"<app-name>".yellow+" <package name>\n" +
    brand.magenta + " appnpm upgrade "+"<app-name>".yellow+" <package name>\n" +
    brand.magenta + " appnpm uninstall "+"<app-name>".yellow+" <package name>\n" +
    brand.magenta + " appdomain add "+"<app-name>".yellow+" <domain-name>\n" +
    brand.magenta + " appdomain delete "+"<app-name>".yellow+" <domain-name>\n"
  );
  }}}*/
};

if (process.argv.length < 2) {
  showUsage();
  process.exit(1);
};

if (process.argv[0] === "-h" || process.argv[0] === "--help" || process.argv[0] === "help") {
  showUsage();
  process.exit(0);
};

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
    console.log("Error: username and password not set in config.\nPlease run " + brand + " user setup <username> <password>\n".bold.red);
    process.exit(2);
  }
};

var action = process.argv.shift();
switch(action) {
  case "coupon":
    var email = process.argv.shift();
    var nodeapi = new node("", "", apihost);
    nodeapi.coupon_request(email, function (err, data) {
      if (err) {
        throw new Error(err);
        process.exit(1);
      }
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
        nodeapi.user_create(user, pass, email, rsakey, coupon, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.user_setpass(newpass, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.user_setkey(rsadata, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.apps_list(function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.app_create(appname, start, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.app_info(appname, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
              nodeapi.app_stop(appname, function (err, data) {
                if (err) {
                  throw new Error(err);
                  process.exit(1);
                }
                if (data.status == "success") {
                  console.log("App stopped.");
                } else {
                  console.log(data.status);
                }
                nodeapi.app_start(appname, function (err, data) {
                  if (err) {
                    throw new Error(err);
                    process.exit(1);
                  }
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
        nodeapi.app_info(appname, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.app_logs(appname, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.app_start(appname, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.app_restart(appname, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.app_stop(appname, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.appnpm_install(appname, package, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.appnpm_update(appname, package, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.appnpm_uninstall(appname, package, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.appdomain_add(appname, domain, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
        nodeapi.appdomain_delete(appname, domain, function (err, data) {
          if (err) {
            throw new Error(err);
            process.exit(1);
          }
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
