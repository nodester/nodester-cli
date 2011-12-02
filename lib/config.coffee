path = require 'path'
fs = require 'fs'

loc = path.join __dirname, '../config.json'
module.exports = config = JSON.parse fs.readFileSync loc
module.exports.write = -> fs.writeFileSync loc, JSON.stringify config
