/*!
 * 初始化mock-db.json 数据的种子文件.（可选，其实手动编辑mock-db.json也是可以支持mock服务的）
 * 1. 定义表名,设置主键
 * 2. 添加字段, 及生成mock数据规则
 * 3. 循环生成mock数据
 * 做完以上三步，在项目根目录 fie mock fake 即按这个文件的规定生成 ./mock-db.json 数据。
 */

'use strict';
let Mock = null; //全局 MockFaker.Field
let THIS = null; //上下文，为了方便调用
class mockSeed {
    constructor(MockFaker, _ ){
        this.MockFaker = MockFaker;
        Mock = this.MockFaker.Field;
        this._ = _; 
        THIS = this;
    }

    //1. 第一步: 添加一个定义表名(资源名)及主键,定义表名(资源名)
    step1_baseSet(){
        // 添加映射主键,默认是id , 如配置 http://localhost:9090/todos/1  的是时候，1是用 id 还是itemId 还是 brandId 
        THIS.MockFaker.create("todos", "itemId");

        // 您就从这里开始吧~

    }

    //2. 第二步 为活动表添加字段并设置faker数据
    step2_design(){

        //定义todos表字段
        THIS.MockFaker.Factory.define('todos')
        .sequence('itemId')  // 如果ID是整数递增，用这个就行了。
        .attr('code',function() { return Mock.guid() })  //也可以这样，用guid生成唯一ID
        .attr('title', function() { return Mock.title() })
        .attr('itemTitle', function() { return Mock.itemTitle() })
        .attr('description', function() { return Mock.oneOf(["重要又紧急的事","不重要的"]) })
        .attr('createdTime', function() { return Mock.time() })
        .attr('startTime', function() { return Mock.time()  })
        .attr('endTime', function() { return  Mock.time()  })
        .attr('status',  function() { return Mock.oneOf(['未开始','进行中', '已完成' ])})
        .attr('isDelete', function() {  return Mock.boolean()})
        .attr('postImg', function() { return Mock.image("200x100")} )

    }

    //第三步，生成mock数据
    step3_generate(){

        //生成50条 todos 记录
        THIS.MockFaker.generateMany("todos", 50);

        /*
        //@desc 如果你想个性化生成50条记录，可以用以下个性化方式
        THIS._(50).times(function () {
            var oneTodo = THIS.MockFaker.Factory.build("todos");
            //新加3个字段
            oneTodo["asignTo"] = "@六韬";
            oneTodo["process"] = Mock.range(0,100);
            oneTodo["sku"] = [
                ["红色","43"],
                ["绿色","38"],
                ["白色","99"]
            ];
            THIS.MockFaker.generateOne("todos", oneTodo);
        });
        */
         
    }
}

module.exports = mockSeed;
 