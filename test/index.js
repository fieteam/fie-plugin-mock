'use strict';

var inquirer = require('inquirer');
let fieMock = require('../index.js');

const msg = '启动mock服务请输入: start; 初始化请输入: init; 初始化seed数据请输入: fake; 帮助请输入 help';
 var  questions = [{
    type: 'input',
    name: 'check',
    message: msg
}];
inquirer.prompt(questions).then(function(answers) {
    if (answers.check &&  ['start', 'init', 'fake','help'].indexOf(answers.check) > -1 ) {
        console.log(answers.check);
        let fie = {};
        let options = {
            clientArgs: [answers.check]
        }
        fieMock(fie, options);  
    }
    else{
        console.log(msg, "您输入的命令不支持!!!");
    }
});
