var node = require('nodester-api').nodester,
  path = require('path'),
  fs = require('fs'),
  exists = path.existsSync,
  config = require('./config');

if (exists('./package.json')){
        var p = [];
        console.log('grabbing dependencies from package.json...');
        var depen = JSON.parse(fs.readFileSync('package.json')).dependencies;
        if (!depen) {
          console.log('no packages to install!');
        }
        console.log(depen);
        for (dependency in depen) {
          p.push(dependency);  
        }
        console.log(p);
}
