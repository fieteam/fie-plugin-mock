/* 
* 对 ./mock/mock-db.json 操作的基础类
* 类似于对数据库的操作
*
*/


'use strict'

let tool = require('../lib/tool');
var  _   = require('lodash');


class JsonDatabase{
    constructor(option){
        this.config = Object.assign({ mockDataPath : '../mock/mock-db.json'}, option);
        this.db = require(this.config.mockDataPath);
       
        this.PARAMS_KEY  = this.config.PARAMS_KEY ||  "params"; //可以用户配置
        this.tableProfile = this.get("tableProfile").value();
    }

    isExist(resource){
       if(!this.db){
           throw "项目下没有找到../mock/mock-db.json,请执行fie mock init 或手工创建这个文件";
       }
       return typeof this.db[resource] !== "undefined";
    }
    get(resource){
       if(this.isExist(resource)){
            return _.chain(this.db[resource]);
       }
       return null;
    }
    getPrimaryKey(resource){
       if(this.tableProfile[resource] && this.tableProfile[resource].primaryKey){
           return this.tableProfile[resource].primaryKey;
       }
       return  "id";
    }
    generateId(resource) {
       //返回最大的id ＋ 1 
       var resourceData =  this.get(resource);
       var idObj = {};
       if(resourceData){
          var idKey = this.getPrimaryKey(resource);
          idObj[idKey] =  resourceData.value().length + 1;
       }
       return idObj;
    }
    getIdCondition(resource, dataWithId){
        var idCon = {};
        var primaryKey = this.getPrimaryKey(resource);
        var id =  dataWithId[primaryKey] || dataWithId.primaryKeyId; 
        // todo: bug, 客户端传来的数字变string,需要在server那处理一下。
        //前端post 过来的 id: 2 会变成 id: "1",好吧，在此转换一下；
        if(/^-?\d+$/.test(id)){
            id = parseInt(id); 
        }

        idCon[primaryKey] = id//like { id: id} || { itemId: id}
        return idCon;
    }

    getById(resource, dataWithId){
        dataWithId = this.formatParams(dataWithId);
        var condition = this.getIdCondition(resource, dataWithId);
        return this.getBy(resource, condition);
    }
    removeById(resource, dataWithId){
        dataWithId = this.formatParams(dataWithId);
        var condition = this.getIdCondition(resource, dataWithId);
        return this.remove(resource, condition);
    }
    updateById(resource, dataWithId){
        dataWithId = this.formatParams(dataWithId);
        var condition = this.getIdCondition(resource, dataWithId);
     
        var entity = Object.assign(dataWithId, condition);
        return this.update(resource,entity, condition);
    }
    getBy(resource, condition){
       if(this.isExist(resource)){
           var resourceData = this.get(resource);
           var index = resourceData.findIndex(condition).value();
           return resourceData.value()[index];
       }
       return null; 
    }
    getList(resource, condition){
       if(this.isExist(resource)){
           //表中所有数据
           var resourceDataList = this.get(resource);
           //查询条件
           //http://smf.daily.taobao.net/itemactivity/ActivityItemList.do?_
           //input_charset=utf-8&params={"query":{"pageSize":10,"pageNum":1,"title":"商品名称","itemId":商品ID}}
           var clientParams = null;
           if(condition[this.PARAMS_KEY]){
               try{
                   clientParams = JSON.parse(condition[this.PARAMS_KEY]);
                   if(clientParams.query){
 
                       var whereCon = null;
                       for(var q in clientParams.query){
                           if(clientParams.query.hasOwnProperty(q)){
                               //pageSize, pageNum 不作为数据查询条件，itemId: null 表示全部，不作为查询条件.
                               if(q === "pageNum" || q ==="pageSize" || q=== "totalPage" || clientParams.query[q] === null){
                                   continue;
                               }
                               whereCon = whereCon || {};
                               whereCon[q] =  clientParams.query[q];
                           }
                       }
                       condition["where"] =  whereCon ;
                       condition["pageSize"] = clientParams.query.pageSize || null;
                       condition["pageNum"] = clientParams.query.pageNum || null;
                   }
                   if(clientParams.sort){
                       condition["sort"] = clientParams.sort;
                   }
                   
               }
               catch(ex){
                   console.log("url中传来params不是标准备的JSON串:" + condition[this.PARAMS_KEY]);
               }
               resourceDataList = this.queryDataByWhere(resourceDataList, condition.where);
           }
           else{
               //支持条件，模糊查询的接口
               if(condition.query){
                    resourceDataList = this.queryDataByQuery(resourceDataList, condition.query);
               }
           }
 
           //排序
           if(condition.sort){
               resourceDataList = this.sortData(resourceDataList, condition.sort);
           }

           return this.getPageData(resourceDataList, condition);
       }
       return null; 
    }

    queryDataByWhere(dataList, whereCon){
         var data = dataList.value();
         var resultData = data;
          /* 等于条件查询*/
         //console.log(whereCon, 'condition');
         if(whereCon){
	        var qData = _.filter(data, whereCon);
            resultData  = qData || [];
         }
        return _.chain(resultData);
    }

    queryDataByQuery(dataList, queryString){
         //复杂查询"status=1&&(favorLevel=2||(id=4&&endTime>2016-07-19 01:40:57))&&siShip=1||id=4"
         //暂时支持&&? status=1&&siShip=1&&endTime>2016-07-19 01:40:57
         var subCon = queryString.split("&&");
         var data = dataList.value();
         var eqCon = null;
         var likeCon = [];
         var compareCon = [];
         for(var i=0; i< subCon.length; i++){
              if(subCon[i].indexOf(">") > -1 || subCon[i].indexOf("<") > -1 ){
                 var compareType = [">=", "<=", ">", "<"];
                 for(var k in compareType){
                    if(!compareType.hasOwnProperty(k)) break;
                    if(subCon[i].indexOf(compareType[k]) > -1 ){
                        var q = subCon[i].split(compareType[k]);

                        //反射一下数据类型〜
                        var value = q[1];
                        if(data.length > 0){
                            if(typeof data[0][q[0]] === "number"){
                                value = parseInt(value);
                            }
                        }
                        compareCon.push({
                            field:  q[0],
                            value: value,
                            type: compareType[k]
                        });

                        break;
                    }
                 }
             }
             else if(subCon[i].indexOf("=") > -1){
                 var q = subCon[i].split("=");
                 eqCon = eqCon || {};
                 var value =  q[1];
                 //反射一下数据类型〜
                 if(data.length > 0){
                     if(typeof data[0][q[0]] === "number"){
                         value = parseInt(value);
                     }
                 }
                 eqCon[q[0]] = value;
             }
             else if(subCon[i].indexOf("%like%") > -1){
                 var q = subCon[i].split("%like%");
                 likeCon.push({
                     field: q[0],
                     value:  q[1],
                     type: "like"
                 });
             }
         }
         var resultData = [];

         /* 等于条件查询*/
         if(eqCon){
	        var qData = _.filter(data, eqCon);
            resultData  = qData || [];
         }

         /* 模糊查询*/
         if(likeCon.length > 0 && resultData.length > 0){
            for(var l in likeCon){
                if(!likeCon.hasOwnProperty(l)) break;
                var field = likeCon[l].field;
                var value = likeCon[l].value;
                resultData = _.filter(resultData, function(o) { 
                    return o[field].indexOf(value) > -1 }
                );
            }
         }

         /* 比较条件查询*/
         if(compareCon.length > 0 && resultData.length > 0){
            for(var l in compareCon){
                if(!compareCon.hasOwnProperty(l)) break;
                var field = compareCon[l].field;
                var value = compareCon[l].value;
                var type =  compareCon[l].type;
                resultData = _.filter(resultData, function(o) { 
                    if(type === ">="){ return o[field] >= value }
                    if(type === "<="){ return o[field] <= value }
                    if(type === ">"){ return o[field] > value }
                    if(type === "<"){ return o[field] < value }
                    return false;
                });
            }
         }

         return _.chain(resultData);
    }

    sortData(dataList, sortString){
        //id desc,createTime desc
        var orderCon = sortString.split(",");
        var ordConField = [];
        var ordConFieldOrder = [];
        for(var i=0; i< orderCon.length; i++){
            if(orderCon[i].indexOf(" ") > -1){
                var oStr = orderCon[i].split(" ");
                ordConField.push(oStr[0]);
                ordConFieldOrder.push(oStr[1].toLocaleLowerCase()); // desc asc
            }
        }

        var resultData =  dataList.value();
        if(ordConField.length > 0 && ordConFieldOrder.length > 0){
            resultData = _.orderBy(resultData, ordConField, ordConFieldOrder)
        }

        return _.chain(resultData);
    }

    formatParams(data){
         //有的项目接口统一用params 来传递白
        if(data[this.PARAMS_KEY]){
            try{
               return JSON.parse(data[this.PARAMS_KEY]);
            }
            catch(ex){
                console.log(data, 'params请传JSON 串');
            }
        }
        return data;
    }

    create(resource, data){
       if(this.isExist(resource)){
           //先生成一个 id对象
           var entity = this.generateId(resource); 
           var  entityData = this.formatParams(data);

           entity =  Object.assign(entityData, entity);
    
           //放在内存中就好不，不考虑保存!
           this.get(resource).value().push(entity);
    
           return entity;
       }
       return null;  
    }
    update(resource, entity, condition){
       if(this.isExist(resource)){
           var resourceData = this.get(resource);
           var index = resourceData.findIndex(condition).value();
           if(index < 0){
               return false;
           }

           var newValueEntity =  Object.assign(resourceData.value()[index], entity);;
           resourceData.value()[index] = newValueEntity;
           this.db[resource] = resourceData.value();
           
           return newValueEntity;
       }
       return null; 
    }
    remove(resource, condition){
       if(this.isExist(resource)){
           var resourceData = this.get(resource);
           var index = resourceData.findIndex(condition).value();
           this.db[resource] = resourceData.value().removeAt(index + 1);
           return true;
       }
       return null; 
    }
    getPageData(arrayChain, condition){
        var dataResult = {
            totalCount: arrayChain.value().length, //总记录数
            pageSize: arrayChain.value().length, //每页记录数据
            pageNum: 1,     //当前页数
            totalPage: 1,   //总页数
            hasMore: false, //是否存在下一页
            data: []
        }

        var queryCon = condition || {};
        if(!queryCon.pageSize || !queryCon.pageNum || arrayChain.value().length == 0){
            dataResult.data = arrayChain.value();
            return dataResult;
        }

        var totalSize = arrayChain.value().length;
        dataResult.pageSize = parseInt(queryCon.pageSize); 
        dataResult.pageNum = parseInt(queryCon.pageNum);
        dataResult.totalPage = parseInt(totalSize/queryCon.pageSize) + (totalSize%queryCon.pageSize > 0 ? 1 :0);

        if(queryCon.pageSize * queryCon.pageNum <= totalSize ){
             dataResult.data =  arrayChain.take(queryCon.pageSize * queryCon.pageNum).takeRight(queryCon.pageSize).value();
             dataResult.hasMore = true;
        }
        else{
            //最后不足一页
            if((queryCon.pageSize * queryCon.pageNum) - totalSize < queryCon.pageSize){
                 //最后一页数据= 取出 所有数据 - 前一页之前的数据有数据总数
                 dataResult.data = arrayChain.take(queryCon.pageSize * queryCon.pageNum).takeRight(totalSize - (queryCon.pageSize * (queryCon.pageNum-1))).value();
                 dataResult.hasMore = false;
            }
        }

        return dataResult;
    }
}


module.exports = JsonDatabase;
