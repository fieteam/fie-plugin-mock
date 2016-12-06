var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));


fs.readDirectory = function (params) {
   return  new Promise(function (resolve, reject) {
        fs.readdirAsync(DIR, function (err, files) {
            err ? reject(err) : resolve(files)
        })
    })
}

module.exports = fs;

