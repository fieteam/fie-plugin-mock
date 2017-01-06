#!/usr/bin/env node

/**
 * 入口文件: fie-plugin-mock/fiemock.js
 * Author: yubhbh@gmail.com
 * Date: 2017/1/4
 */

"use strict";

let request = require('npm-request');
let program = require('commander');
let gutil = require('gulp-util');
let chalk = require('chalk');
let pkg = require('./package.json');
let multiline = require('multiline');
let cp = require('child_process');
let path = require('path');
let fieMock = require('./index.js');
let fie = {}; //模拟fie

program.version(pkg.version, '-v, --version');

program.command('init')
    .description('初始化项目')
    .usage(multiline(function () {
     /*
        Examples:
        $ fiemock init
     */
    }))
    .action(function () {
         fieMock(fie, { clientArgs: ["init"]});  
    });

program.command('start')
    .description('启动服务')
    .usage(multiline(function () {
     /*
        Examples:
        $ fiemock start
     */
    }))
    .action(function () {
       fieMock(fie, { clientArgs: ["start"]});  
    });


program.command('fake')
    .description('执行重新根据mock-seed.js生成数据')
    .usage(multiline(function () {
    /*
        Examples:
        $ fiemock fake
     */
    }))
    .action(function () {
       fieMock(fie, { clientArgs: ["fake"]});    
    });

program.command('help')
    .description('帮助')
    .usage(multiline(function () {
    /*
        Examples:
        $ fiemock help
     */
    }))
    .action(function () {
       fieMock(fie, { clientArgs: ["help"]});    
    });


program.on('--help', function () {
     fieMock(fie, { clientArgs: ["help"]});    
});


program.command('latest')
    .description('版本检测')
    .usage(multiline(function () {
    /*
        Examples:
        $ fiemock latest
     */
    }))
    .action(function () {
        gutil.log(chalk.green("[Info]",'当前版本:', pkg.version, ",正在检测最新版本......"));
        // 先检查版本
        request({
            method: 'get',
            path: path.join(pkg.name, 'latest')
        }, {
            registry: 'http://registry.npmjs.org',
        }, function (err, data) {
            let localVer = parseInt((pkg.version || "").replace(/\./g, ""));
            let remoteVer = parseInt((data.version || "").replace(/\./g, ""));

            if (err) {
                gutil.log(chalk.cyan("[Warn]", '无法检查', pkg.name, '最新版本，可能是由于网络异常。'));
            } else if (localVer < remoteVer) {
                gutil.log(chalk.yellow("[Warn]",'fie-plugin-mock 推荐版本是', data.version, ', 本地版本是', pkg.version));
                gutil.log(chalk.green("[Info]", '请执行 npm install -g fie-plugin-mock 来安装推荐的版本，然后重新运行。'));
                process.exit(0);
            } else {
                gutil.log(chalk.green("[Info]",'fie-plugin-mock 已经是最新版本,本地版本是', pkg.version));
            }
        });
    });

program.parse(process.argv);
if (!program.args.length) {
    console.log(program.help());
    process.exit(0);
}


