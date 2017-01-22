/* 
* mock 数据通用服务
*
*/

'use strict';

//https://github.com/Marak/faker.js

var fs      = require('fs');
var  _   = require('lodash');
var Factory = require('rosie').Factory;
var Faker  = require('faker');
Faker.locale = "zh_CN";

var tool = require('./tool');

var db      = {}

class MockFaker {
    constructor(config){
        this.Factory = Factory;             
        this.db = { tableProfile: {} };
        this.config = Object.assign({
            mockDataPath: './mock/mock-db.json'
        }, config);
    }

    //创建一个表, 
    create(tableName, primaryKey){
        this.db[tableName] = [];
        this.db.tableProfile[tableName] = { primaryKey: primaryKey || "id"};
        return this;
    }

    //添加多条数据
    generateMany(tableName, count){
        var that = this;
        _(count).times(function () {
            that.generateOne(tableName);
        });
    }

    //添加一条数据
    generateOne(tableName, entityObj){
        var entity = entityObj || Factory.build(tableName);
        this.db[tableName].push(entity);
        return entity;
    }

    //保存到本地路径
    saveToLocal(){
        var mockFolder =  this.config.mockPath;
        var mockFilepath =  this.config.mockDataPath;
        var jsonFileStr = JSON.stringify(this.db, null, 2);
        var writeJson = function() {
            try{
                fs.writeFileSync(mockFilepath, jsonFileStr);
            }
            catch(e){
                tool.log.error('创建mock-db失败',e);
                throw e;
            }
        }

        if(!fs.existsSync(mockFolder)){
            fs.mkdir(mockFolder,'0777', function (err) {
                if (err) throw err;
                writeJson();
            });
        }
        else{
            writeJson();
        }
    }
}

//常用标题
var title = [
    "米其林轮胎PRIMACY LC 215/65R16 98H汽车轮胎送气嘴【免费安装】",
    "2014 新时尚苗条女性的时尚衣服，镶有花边",
    "【满99减40】施华蔻羊绒脂滋养洗发水600/400/200ml 修护烫染受",
    "蜡比小星2016春季新款手绘儿童帆布鞋低帮男童女童板鞋DIY涂鸦鞋",
    "现货 美国迪士尼代购 白雪 美人鱼 长发 苏菲亚公主儿童睡裙 睡衣",
    "现货 美国迪士尼DISNEY美国代购Sofia苏菲亚索菲亚儿童公主礼服鞋",
    "【买一送3】施华蔻羊绒脂滋养洗护套装发芯滋润柔顺1.4L",
    "【一盒仅需36元】施华蔻怡然植物染发霜3盒无氨盖白发染发剂"
] 

var todos = [
    "吃饭",
    "睡觉",
    "打豆豆",
    "撸代码"
] 

//字段规则,用定定义字段mock规范
MockFaker.prototype.Field = {
    name: function(params) {
       //return Faker.name.title();
       return  title[_.random(0,title.length-1)];
    },
    title: function(params) {
        var times = _.random(0,10);
        var result = [];
        for(var i =0;i< times; i++){
            result.push(todos[_.random(0,todos.length-1)]);  
        }
        return result.join('然后');
    },
    itemTitle: function() {
       return  title[_.random(0,title.length-1)];
    },
    activityName: function(params) {
       var aName = [
           "双十一活动",
           "年货节活动",
           "双12活动",
           "618活动"
       ]
       return  aName[_.random(0,aName.length-1)];
    },
    activityDesc: function(params) {
       var aName = [
           "双11",
           "年货节",
           "双12",
           "618"
       ]
       return  aName[_.random(0,aName.length-1)];
    },
    discount: function() {
       return parseFloat(Math.random().toFixed(2));
    },
    sku: function() {
      var aName = [
           ["红色","43"],
           ["绿色","38"],
           ["白色","99"]
       ]
       return  aName[_.random(0,aName.length-1)];
    },
    guid: function() {
       return tool.guid();
    },
    time: function(paramTime, formatStr) {
       var pTime = new Date();
       if(paramTime){
         var pTime = new Date(Date.parse(paramTime.replace(/-/g,"/"))); //将参数转换成时间类型
       }
       var format = formatStr || "yyyy-MM-dd hh:mm:ss";
       return pTime.format(format);
    },
    words: function(count) {
       return Faker.lorem.words();
    },
    url: function(parm) {
       var url = ["//taobao.com","//tmall.com","https://detail.tmall.com/item.htm?id=14554057566","https://item.taobao.com/item.htm?id=530143051901"];
       return  url[_.random(0,url.length-1)];
    },
    price: function() {
       return Faker.commerce.price();
    },
    email: function name(params) {
       return  Faker.internet.email();
    },
    number: function(num) {
       return Faker.random.number(num); 
    },
    range: function(start, end) {
        return _.random(start,end);
    },
    mobile: function name(params) {
         var list = [
           "15000875257",
           "13401996367",
           "15801113301"
       ]
       return list[_.random(0,list.length-1)];
    },
    area: function name(params) {
         var list = [
           "上海",
           "北京",
           "浙江",
           "广东"
       ]
       return list[_.random(0,list.length-1)];
    },
    image: function(size) {
       var cutSize = size ||  600; 
       // Credit http://www.paulirish.com/2009/random-hex-color-code-snippets/
       return 'http://placehold.it/' + cutSize +  '/' + Math.floor(Math.random()*16777215).toString(16);

       //http://dummyimage.com/710x79 dip 的使用方法
    },
    boolean: function(num) {
       if(_.random(true, false)){
           return true;
       }
       return false;
    },
    enum: function(data){
        var mapData = [];
        if(typeof data === "array"){
            var mapData = data;
            return mapData[_.random(mapData.length -1)];
        }
        else if(typeof data === "object"){
            //将返回的数据列表保存到mapData
            var matchData = data;
            for(var d in matchData){
                if(matchData.hasOwnProperty(d)){
                   mapData.push(matchData[d]);
                }
            }
            
            //随机返回一个数据
            return  mapData[_.random(mapData.length -1)];
        }
    },
    oneOf: function(data){
        var mapData = [];
        if(typeof data === "array"){
            var mapData = data;
            return mapData[_.random(mapData.length -1)];
        }
        else if(typeof data === "object"){
            //将返回的数据列表保存到mapData
            var matchData = data;
            for(var d in matchData){
                if(matchData.hasOwnProperty(d)){
                   mapData.push(matchData[d]);
                }
            }
            
            //随机返回一个数据
            return  mapData[_.random(mapData.length -1)];
        }
    }
}


module.exports = MockFaker;

