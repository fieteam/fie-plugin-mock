'use strict';

let path = require('path');
var  _   = require('lodash');
var  debug   = require('debug');

let MOCK_FOLDER = './mock';
var inquirer = require('inquirer');

let mockFacker =  require('../lib/mock-faker');
let tool = require('../lib/tool');

var fs = require("fs");
let requireExtend = require('../lib/require.extend');

//递归创建目录 同步方法
function mkdirsSync(dirname) {
    //console.log(dirname);
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

/*
@desc: 根据./mock/mock-seed 的规则生成 ./mock/mock-db.json
*/
var createMockSeed = function(config){
   var seedPath = config.mockSeedPath;
   var mf = new  mockFacker(config);
   try{
       requireExtend.uncache(seedPath);
   }
   catch(e){
       console.log(seedPath + " uncach");
   }
   let mockSeed =  require(seedPath);
   var ms = new mockSeed(mf, _);
   ms.step1_baseSet();
   ms.step2_design();
   ms.step3_generate();
   mf.saveToLocal();
   tool.log.success('成功创建mock-db.json:' + config.mockDataPath);
}


/*
@desc: 将lib/mock-template/mock-api.js //将lib/mock-template/mock-seed.js 复制到用户项目工作目录下。
@params: {Object } config  @see ./index.js 
@return: null
*/
var createMockBaseFile = function(config) {
    var mockPath = config.mockPath;
    var mockSeedPath = config.mockSeedPath;
    var mockDataPath = config.mockDataPath;
    var mockApiPath  = config.mockApiPath;
 

    /* 
    @desc: 检查mock目录,没有则创建
    @return: {Promiseable}
    */
    function checkAndCreateMockFolder(mockFolder){
        return new Promise(function(resolve, reject){
            if(!fs.existsSync(mockFolder)){
                tool.log.success("创建mock目录:" + mockFolder);
                try{
                    mkdirsSync(mockFolder);
                    resolve();
                }
                catch(ex){
                    console.log(ex, 'exxxxxx');
                    reject();
                } 
            }
            resolve();
        });
    }

    /* 
    @desc: 复制mock-api.js 到mock目录
    @return: {Promiseable}
    */
    function createApiFile(){
        return fs.readFileAsync(__dirname.trimEnd('lib') + '/mock-template/mock-api.js')
            .then(function(fileData){
                tool.log.success("成功创建mock-api.js:" +  mockApiPath);
                var text = fileData.toString();
                return fs.writeFileAsync(mockApiPath, text);  
        });
    }

    /* 
    @desc: 复制mock-seed.js 到mock目录
    @return: {Promiseable}
    */
   function createSeedFile(){
        return fs.readFileAsync(__dirname.trimEnd('lib') + '/mock-template/mock-seed.js')
        .then(function(fileData){
            var text = fileData.toString();
            tool.log.success("成功创建mock-seed.js!:" +  mockSeedPath);
            return fs.writeFileAsync(mockSeedPath, text);  
        })
    }

    /* 
    @desc: 
    * 先在项目根目录下创建mock文件夹。
    * 然后将 /mock-template/mock-api.js,/mock-template/mock-seed.js 复制过去。
    * 然后再createMockSeed生成./mock/mock-db.json
    @return: {Promiseable}
    */
    checkAndCreateMockFolder(mockPath)
    .then(function(result) {
        createApiFile();
    })
    .then(function() {
        createSeedFile()
        .then(function() {
            createMockSeed(config);
        });
    })
    .catch(function(err) {
        tool.log.error("mock init 失败!", err);
    });
}

/*
@desc: fie mock init 
*/
var init = function(config) {
    //已经存在，提示确认
    if(fs.existsSync(config.mockPath)){
        var  questions = [{
            type: 'input',
            name: 'check',
            message: 'mock已经init, 确认要重新初始化覆盖吗? 退出请Ctrl + C,确认请输入(y)'
        }];

        inquirer.prompt(questions).then(function(answers) {
            if (answers.check === 'y' || answers.check === 'Y') {
                createMockBaseFile(config);
            }
        });
    }
    else{
        createMockBaseFile(config);   
    }
}

/*
@desc: fie mock fake 
*/
var fake = function(config) {
    //已经存在，提示确认
    if(fs.existsSync(config.mockDataPath)){
        var  questions = [{
            type: 'input',
            name: 'check',
            message: '将通过./mock/mock-seed.js 设置的规则重新生成./mock/mock-db.json, 退出请Ctrl + C, 确认请输入(y)'
        }];

        inquirer.prompt(questions).then(function(answers) {
            if (answers.check === 'y' || answers.check === 'Y') {
                createMockSeed(config);
            }
        });
    }
    else{
        tool.log.error("请选择执行 fie mock init, 初始化mock服务配置文件")
    }
}

 
module.exports ={
    init: init,
    fake: fake
} ;

