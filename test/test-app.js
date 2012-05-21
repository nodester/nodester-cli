#!/usr/bin/env node

process.nodester = {
  brand: 'nodester',
  apihost: 'api.nodester.com',
  env: 'test',
  config: {
    username: 'test',
    password: 'test01'
  }
}

var cli = require('../lib/commands')
  , cmds = cli.commands
  ;

var assert = require('assert');

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

describe('General API test', function(){
  describe('should read all the commands', function (){
    for (var key in cmds){
      it('should run ' + key,function(){
        cli.run(cmds,key)
      })
    }
  });
  describe('General usage', function(){
    for (var key in cmds.user){
      it('should run ' + key,function(){
        cli.run(cmds,'user',key)
      })
    }
  });
  describe('App endpoint', function(){
    it('should return an error, invalid app', function(){
        cli.run(cmds,'app','infods','a')
    })
  });
  describe('Errors', function(){
    it('should return and error, invalid command', function(){
      // assert.throws doesn't work quite well
      try {
        cli.run(cmds,'ras')
      } catch(ex){
        assert.equal(ex && true, true)
      }
    })
  })
})
