/* 
* 启动一个jsonp 的http服务，支持跨域
*/


'use strict';

var http = require('http');
var fs = require('fs');
var requireExtend = require('./require.extend');
var urllib = require('url');
const querystring = require('querystring');

var tool = require('./tool');

function mockServer(cfg) {

    var config =Object.assign({
      port: 9090
    }, cfg);

    //实列一个mock 处理器, 用于处理请求与并返回请求的数据
    var MockProcess = require('./mock-process');
    this.mockProcess = new MockProcess(cfg);

    var that = this;
    var server = http.createServer(function (req, res) {
        
        //http://localhost:xxxx/index.html 本地API测试页面
        if (req.url == '/index.html' || req.url == '/index' || req.url == '/') { //will be executed only on index.html
            fs.readFile(__dirname.trimEnd('lib') + '/page/index.html', function(err, page) {
                if (err) throw err;
                res.writeHead(200, {'Content-Type': 'text/html'});
                var page = page.toString().replace("{{--port}}", config.port );
                res.write(page);
                res.end();
            });
        }
        else{
          
            //支持跨域
            //==============================================================
            //https://www.bennadel.com/blog/2327-cross-origin-resource-sharing-cors-ajax-requests-between-jquery-and-node-js.htm
            // When dealing with CORS (Cross-Origin Resource Sharing)
            // requests, the client should pass-through its origin (the
            // requesting domain). We should either echo that or use *
            // if the origin was not passed.
            var origin = (req.headers.origin || "*");

            // Check to see if this is a security check by the browser to
            // test the availability of the API for the client. If the
            // method is OPTIONS, the browser is check to see to see what
            // HTTP methods (and properties) have been granted to the
            // client.
            if (req.method.toUpperCase() === "OPTIONS"){
               
                // Echo back the Origin (calling domain) so that the
                // client is granted access to make subsequent requests
                // to the API.
                res.writeHead(
                    204,
                    {
                        "access-control-allow-origin": origin,
                        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "access-control-allow-headers": "X-Requested-With, Content-Type",
                        "access-control-max-age": 10, // Seconds.
                        "content-length": 0
                    }
                );
                
                // End the response - we're not sending back any content.
                res.end();
                return false;
            }
            //==============================================================

            res.writeHead(200, {
                "Access-Control-Allow-Origin":"*",
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
                "X-Powered-By":' 3.2.1',
                'Content-Type': 'application/json;charset=UTF-8',
            });

            var bodyData = [];
            req.on('error', function(err) {
                console.error(err);
            }).on('data', function(chunk) {
                bodyData.push(chunk);
            }).on('end', function() {
                bodyData = Buffer.concat(bodyData).toString();

                try{
                    //编码转换
                    bodyData = querystring.unescape(bodyData.replace(/\+/g, '%20'));
                }catch(e){
                    console.log("编码转换错误");
                    console.log(bodyData);
                    throw e;
                }
               
                req["bodyData"] = tool.paramToObj(bodyData);
            
         

                //获取请求的数据
                var resData = that.mockProcess.request(req, res);

            
                if(!resData){
                    res.writeHead(404, {'Content-Type': 'application/json;charset=UTF-8'});
                    resData = {
                    "msg": "OH! 404! 请在mock/mock-seed.js 中的配置table-字段-生成mock数据,更高阶可以在mock/mock-api.js中配置路径规则和对应的mock数据返回"
                    }
                }

                var params = urllib.parse(req.url, true);
                if (params.query && params.query.callback) {
                    var str =  params.query.callback + '(' + JSON.stringify(resData) + ')';//jsonp
                    res.end(str);
                }
                else{
                    res.end(JSON.stringify(resData));
                }


            });
            
        }
    }); 

    server.listen(config.port, function() {
        tool.log.success('mock server start ... listening on localhost:' + config.port);
        tool.log.success('关于 fie-plugin-mock 文档可查看: http://web.npm.alibaba-inc.com/package/@ali/fie-plugin-mock');
        tool.log.success('您也可用浏览器打开: http://localhost:' + config.port + "  还有一个简单的接口调用界面供您调试 Y(^_^)Y");
    });

    //当检测到配置文件改动后, 重置mockprocess 
    this.reset = function(){
        requireExtend.uncache('./mock-process');
        MockProcess = require('./mock-process');
        that.mockProcess =  new MockProcess(cfg);
    }
}

module.exports = mockServer;