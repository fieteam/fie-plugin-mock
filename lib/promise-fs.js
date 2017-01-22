'use strict';
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');


fs.readDirectory = function (params) {
   return  new Promise(function (resolve, reject) {
        fs.readdirAsync(DIR, function (err, files) {
            err ? reject(err) : resolve(files)
        })
    })
}

//创建多层文件夹 同步
fs.mkdirsSync = function(dirpath, mode) { 
    if (!fs.existsSync(dirpath)) {
        console.log(dirpath,'dirpath');
        var pathtmp;
        console.log(dirpath.split('\/'),'dirpath.split()');
        var dirst = dirpath.split('\/');
        for(var i=0;i< dirst.length;i++){
            let dirname = dirst[i];
            if(!dirname) continue;
            console.log(dirname,'dirname');
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
             console.log(pathtmp,'pathtmp');
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp, mode)) {
                    return false;
                }
            }
        }
    }
    return true; 
}

module.exports = fs;

