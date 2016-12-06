/* 
* 启动一个jsonp 的http服务，支持跨域
*/


'use strict';

var http = require('http');
var fs = require('fs');
var requireExtend = require('./require.extend');
var urllib = require('url');
const querystring = require('querystring');

let watch = require('watch');
var tool = require('./tool');

let curMockServer = null;


function mockServerCreator(config) {
    
    let MockServer = null;

    var createServer = function(params) {
        if(curMockServer){
          tool.log.success('已经存在mock server, 重置配置文件....')
          curMockServer.reset();
          tool.log.success('重置配置文件成功!')
          return false;
        }
        MockServer = require('./mock-server');
        //启动mock 服务
        curMockServer = new  MockServer(config);
    }
    createServer();

    //watch 监听到]配置文件改动后, 重置mock 服务
    watch.createMonitor(config.mockPath, function (monitor) {
        monitor.files[config.mockPath + '/.zshrc'] // Stat object for my zshrc.
        monitor.on("created", function (f, stat) {
          // Handle new files
          tool.log.success("create a file");
          createServer();
        })
        monitor.on("changed", function (f, curr, prev) {
          // Handle file changes
          tool.log.success("配置文件有变动...");
          createServer();
          
        })
        monitor.on("removed", function (f, stat) {
          // Handle removed files
           createServer();
           tool.log.success("remove a file");
        })
        //monitor.stop(); // Stop watching})
    });
}

module.exports = module.exports = {
    start: function(config) {
       new mockServerCreator(config)
    },
    stop: function(){
        //todo:
    }
}
