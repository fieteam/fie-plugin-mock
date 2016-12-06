/* 
* 
*  routeMap 自定义接口
*  "/:resource", "/:resource/:id" 这两个是通用路由，基于标准的resful 接口, 不要轻易在这里配置
*  如下配置, http://localhost:xxxx/activity 即会随机返回 mock-this.db.json 中的activity列表(带分页、带搜索、带排序) ",
*/

'use strict';

//定义接口路由
var apiRouteMap = {
    "/:resource/create": function(data, method, resource) {
        /*新增数据----响应的JSON结构*/
        return {
            success: true,
            data: this.db.create(resource, data)
        }
    },
    "/:resource/get": function(dataWithId, method, resource) {
        /*获取指定id对应数据----响应JSON结构*/
        return  {
            success: true,
            data: this.db.getById(resource, dataWithId)
        }
    },
    "/:resource/edit": function(dataWithId, method, resource, id) {
        /*更新指定id对应数据----响应JSON结构*/
        return  {
            success: true,
            data: this.db.updateById(resource, dataWithId)
        }
    },
    "/:resource/delete": function(dataWithId, method, resource, id) {
        /*删除id对应数据----响应JSON结构*/
        return  {
            success: true,
            data:  this.db.removeById(resource, dataWithId)
        }
    },
    "/:resource/getlist": function(data, method, resource) { 
        var dataResult = this.db.getList(resource, data);
        /*根据请求条件获取列表数据----响应JSON结构*/            
        return {
            success: true,
            totalCount: dataResult.totalCount,
            pageSize: dataResult.pageSize,
            pageNum: dataResult.pageNum,
            totalPage:  dataResult.totalPage,
            hasMore: dataResult.hasMore,
            data:  dataResult.data
        }
    },
    "/api\/create.jsonp\\?id=\\w+&type=\\w+": function(data , method) {
        return {
            msg: "hello! 我是支持正则的url的响应与返回",
            data: data,
            method: method
        }
    },
    "moresetting": function(data , method) {
        //1. 可以在这里对http post/get 过来的data 或method 进行判断，做不同的返回 if(data.xx === 'xxx'){return { xxxx}}
        //2. 可以通过简单接口保存到本地data.json
        return {
            success: true,
            data: "hello world!"
        }
    }
}

apiRouteMap['userConfig'] = {
    PARAMS_KEY: "params" //支持用于搜索或数据提交的参数 http://localhost:9090/todos?params={query: { pageSize: 20, pageNum:1, name:"hello world!"}}
}

module.exports = apiRouteMap