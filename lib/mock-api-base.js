/* 
* mock API 定义入口, 
* mock服务中 lib/mock-process.js 进行路由处理时，会通过此文件配置响应请求与返回数据
*  routeMap 自定义接口
*  "/:resource", "/:resource/:id" 这两个是通用路由，基于标准的resful 接口, 不要轻易删除
*  如下配置, http://localhost:xxxx/activity 即会随机返回 mock-db.json 中的activity列表(带分页、带搜索、带排序) ",
*/

'use strict';

//http 请求method
let requestMethod = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE"
}

//定义接口路由
var mockAPIBase = {
    "routeMap":{
        "/:resource": function(data, method, resource) {
            var resoureData =  this.db.isExist(resource);
            if(!resoureData){
                return {
                    success: false,
                    errorCode: 404,
                    errorMsg: "./mock/mock-db.json 或mock/mock-api.js 的routeMap中都找不到 "+ resource + "的路由对象，请配置。"
                }
            }

            switch(method){
                case requestMethod.POST: //新增一条数据
                    return this.routeMap["/:resource/create"].call(this, data, method, resource);
                case requestMethod.GET:
                    return this.routeMap["/:resource/getlist"].call(this, data, method, resource);
                default: 
                    break;
            } 

            this.debug("您的请求不与插件规不符合! 请求resource=%s, method=%s, 请求的数据data: ", resource, method, JSON.stringify(data));
            return { success: false, msg: "错误消息请查看控制台~"}
        },
        "/:resource/:id": function(dataWithId, method, resource) {
            var resoureData =  this.db.isExist(resource);
            if(!resoureData){
                return {
                    success: false,
                    errorCode: 404,
                    errorMsg: "./mock/mock-db.json 或mock/mock-api.js 的routeMap中都找不到 "+ resource + "的对象，请配置。"
                }
           }

           switch(method){
                case requestMethod.GET:    
                     return this.routeMap["/:resource/get"].call(this,dataWithId, method, resource);  

                case requestMethod.PUT:
                case requestMethod.PATCH:
                    return this.routeMap["/:resource/edit"].call(this, dataWithId, method, resource); 
                
                case requestMethod.DELETE:
                    return this.routeMap["/:resource/delete"].call(this, dataWithId, method, resource); 
                
                default: 
                    break;
           }
        }
    },
    init: function(jsonDB, _ , debug) {
         this.db = jsonDB;
         this._ = _;
         this.debug  = debug("mock-api-base:");
    }
}

module.exports = mockAPIBase