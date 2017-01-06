/*
  服务入口-for fie
*/


'use strict';

let chalk = require('chalk');
let tool = require("./lib/tool");
let fs = require("./lib/promise-fs");
let mockServerCreator = require("./lib/mock-server-creator");

//通用配置
let config = {
  port: 9090,
  mockPath: process.cwd() + "/mock",
  mockDataPath: process.cwd() + "/mock/mock-db.json",
  mockApiPath: process.cwd() + "/mock/mock-api.js",
  mockSeedPath: process.cwd() + "/mock/mock-seed.js",
}

let Commands = {

  start: function(fie, options) {
    // todo 测试: 端口 和 接口文件数据自定义 fie mock start --port 9090 --dataPath "./mock/mock-db.json" --apiPath "./mock/mock-api.js";

    if(process.argv.length > 0){
      for(let i=0;i< process.argv.length; i++){
        if(process.argv[i] == '--port' && process.argv[i+1]){
          config.port = process.argv[i+1];
        }
        if(process.argv[i] == '--dataPath' && process.argv[i+1]){
          config.mockDataPath = process.argv[i+1];
        }

        if(process.argv[i] == '--apiPath' && process.argv[i+1]){
          config.mockApiPath = process.argv[i+1];
        }

        if(process.argv[i] == '--seedPath' && process.argv[i+1]){
          config.mockSeedPath = process.argv[i+1];
        }
      }
    }
 
    if(!fs.existsSync(config.mockDataPath)){
      //默认执行行init , 再执行start
      tool.log.success("项目中没有执行行fie mock init, 默认自动生成!");
      this.init();

      let checkCount = 0;
      let checkTimes = 4; //试4次吧! todo , use Promise;
      let checkAndStartServer = function() {
          if(checkCount < checkTimes && fs.existsSync(config.mockDataPath)){
             checkCount = checkTimes;
             mockServerCreator.start(config);
          }
          else if(checkCount < checkTimes){
              setTimeout(function() { 
                 checkCount++;
                 checkAndStartServer();
              }, 1000);
          }
      }
      checkAndStartServer();
      return false;
    }
 

    mockServerCreator.start(config);

  },

  init: function (fie, options) {
     let init = require('./lib/mock-init');
     init.init(config);
  },

  fake: function (fie, options) {
     let init = require('./lib/mock-init');
     init.fake(config);
  },

  help: function() {

    let help = [
      '',
      '1. 如果你单纯用这个mock server插件:',
      ' $ fiemock start     启动mock服务(端口默认9090, 加参数 --port xxxx 可指定服务端口)',
      ' $ fiemock init      初始化mock服务',
      ' $ fiemock fake      运行种子文件生成数据',
      ' $ fiemock help      查看帮助信息',
      '',
      '2. 如果你的开发环境基于FIE, 插件使用帮助:',
      ' $ fie mock start     启动mock服务(端口默认9090, 加参数 --port xxxx 可指定服务端口)',
      ' $ fie mock init      初始化mock服务',
      ' $ fie mock fake      运行种子文件生成数据',
      ' $ fie mock help      查看帮助信息',
      '',
      '关于 fie-plugin-mock 插件的配置可查看: https://www.npmjs.com/package/fie-plugin-mock',
      '',
      ''
    ].join('\r\n');

    process.stdout.write(chalk.magenta(help));

  }
};



/**
 * @param fie fie接口集合
 * @param options
 * @param options.clientArgs , 若用户输入 fie fie-plugin-mock nnn -m xxxx 则 cliArgs为 [ 'nnn', '-m', 'xxxx']
 * @param options.pluginConfig 强制重置 fie.config.js 里面的参数,如果有传入的值,则优先使用这个,在被其他插件调用的时候可能会传入
 * @param options.callback 操作后的回调, 在被其他插件调用时,可能会传入
 */
module.exports = function(fie, options) {

  let commandMethod = options.clientArgs.splice(0, 1).pop();

  options.callback = options.callback || function() {};

  if (Commands[commandMethod]) {
    Commands[commandMethod](fie, options);
  } else {
    console.log(chalk.magenta('\r\n命令fie mock' + commandMethod + '不存在, 可以使用以下命令:'));
    Commands.help();
  }
};
