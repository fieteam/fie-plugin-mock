/* 
* 处理http 请求和路由分发
* 路由分发先判断./mock/mock-api.js 中用户的定义，如果存在，则直接调用用户的方法
* 否则就是使用通用路由/:resource /:resource/:id请求与返回数据
*/

'use strict'
var url = require('url');
var _ = require("lodash");
var  debug   = require('debug');
var mockApi = require('./mock-api-base');
var baseConfig = null;

class MockProcess{
    constructor(cfg){
        var config = Object.assign({
            "mockPath": process.cwd() + "/mock",
            "mockApiPath": "./mock/mock-api",
            "mockDataPath": "./mock/mock-db.json"
        }, cfg );
        baseConfig = config;

        //取的是用户工作目录 mock下的路由事件合并
        let userMockApiRouteMap = require(config.mockApiPath);
        
        mockApi.routeMap = Object.assign(mockApi.routeMap, userMockApiRouteMap);

        var JsonDatabase = require('./mock-json-db');

        //用户个性化参数
        if(mockApi.routeMap.userConfig){
            cfg["PARAMS_KEY"] = mockApi.routeMap.userConfig.PARAMS_KEY;
        }
        var jsonDb = new JsonDatabase(cfg);

        mockApi.init(jsonDb, _, debug);
 
    }

    getReqestInfo(req) {
        return {
            data: req.method == "GET" ? url.parse(req.url, true).query : req.bodyData ,
            path: url.parse(req.url).path,
            method: req.method
        }
    }

    //支持在mock目录下定义json 并通过 localhost:9090/a.json 并返回mock数据
    checkAndRequestJSON(mapUrl){
        var result = {
            isMapJSON: false,
            data: null
        }

        if(mapUrl.indexOf('.json') < 0){
            mapUrl +=".json";
        }
        try{
            var jsonData = require(baseConfig.mockPath + mapUrl);
            if(jsonData){
                result = {
                    isMapJSON: true,
                    data: jsonData
                }
            }
        }
        catch(ex){

        }
        
        return result;
    }

    requestData(req, res) {
        var reqData =  this.getReqestInfo(req);

        var routeKey = req.url
        var matchRouteMathod= null;
        //mockApi.routeMap 的 function
        for(var r in mockApi.routeMap){
            var reg = new RegExp(r);
            if(reg.test(routeKey)){
                if(mockApi.routeMap[r]){
                    matchRouteMathod = mockApi.routeMap[r];
                }
            }
        }
        
        var result =null;
        if(matchRouteMathod){
            //用户定义的路由事件
            try{
                result = matchRouteMathod.call(mockApi, reqData.data, reqData.method);
            }
            catch(ex){
                result = {
                    success: false,
                    msg:  "请求自定义API(" + req.url + ")存在代码错误，方法： " + matchRouteMathod,
                    stack: "异常:" + ex.toString()
                }
            }   
        }
        else{
            var mapUrl = req.url;
            if(mapUrl.indexOf('?') > -1){
                mapUrl =  mapUrl.split('?')[0];
            }

            //判断是否有json 文件符合
            var requestJSONResult = this.checkAndRequestJSON(mapUrl);
            if(requestJSONResult.isMapJSON){
                result = requestJSONResult.data;
            }
            else{
                 // '/product-activity-manager'.match(/\w+(-)\w+|\w+/g);  4个 - 就有问题了
                var matchPath = mapUrl.match(/\w+(-)\w+(-)\w+|\w+(-)\w+|\w+/g);  
        
                try{
                    if(matchPath.length == 2){
                        var resource = matchPath[0];
                        var secondParam = matchPath[1];
                        if("create|get|edit|delete|getlist".indexOf(secondParam) > -1){
                            result = mockApi.routeMap["/:resource/" + secondParam].call(mockApi, reqData.data, reqData.method, resource);
                        }
                        else{
                        //第二个参数就默认是id了。
                        reqData.data["primaryKeyId"] = secondParam;
                        result = mockApi.routeMap["/:resource/:id"].call(mockApi, reqData.data, reqData.method, resource);
                        }
                    }
                    else if(matchPath.length == 1){
                        var resource = matchPath[0];
                        result = mockApi.routeMap["/:resource"].call(mockApi, reqData.data, reqData.method, resource);
                    }
                }
                catch(ex){
                    result = {
                        success: false,
                        msg:  "默认mock接口出现异常，请检查参数或是不是手动操作了mock-db.json文件数据? 有问题联系@六韬协助查看问题 ",
                        stack: "异常:" + ex.toString()
                    }
                }   
            }
        }
    
        return result;
    }

    request(req, res){
        return this.requestData(req, res)
    }
}
module.exports =  MockProcess;
