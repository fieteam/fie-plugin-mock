# fie-plugin-mock

> fie-plugin-mock 插件用于配置一个简单、易用、灵活的、可交互的前端 http 数据mock服务。

## 说明

0. 前端与后端定义接口规范，[DIP](http://dip.alibaba-inc.com/?spm=a312q.7764190.0.0.20YyEM)可以解决，它也可以生成基于请求/响应规范的mock数据及接口。
但这样的mock接口是<b>不可交互的</b>，比如请求的数据不支持分页、不支持搜索、不支持更新..... 

0. 即使通过DIP与后端定义接口规范后，联调等待将是一个相对比较漫长的过程，要依赖后端mock数据，还要依赖他们不稳定的环境。

如果前端可以配置一套完整的接口就好了，所以为解决以下痛点，通过本地配置一套接口的方法,实现: 

*  自动生成mock数据
* 接口的常用操作:
    * 添加
    * 修改(更新)
    * 删除
    * 搜索(带分页，带搜索条件，带排序)
0. mock自定义接口返回


## 使用场景

适合前后端分离的项目。项目中需要通过jsonp的方式

* 获取数据列表(带分页，带搜索条件，带排序)
* 添加或修改一条数据（添加后，获取当前数据或数据列表会相应更新)
* mock接口返回定义一些额外逻辑

## 安装

1. 基于FIE开发流程的安装
```bash
    $ npm install fie -g
    $ fie install fie-plugin-mock
```
该套件依赖 [Node.js](http://nodejs.org/) 、 [tnpm](http://web.npm.alibaba-inc.com/) 、 [fie](http://fie.alibaba.net/) 。
请先确保本机已安装了fie的运行环境，若第一次使用，请[参考该文档进行环境搭建](http://fie.alibaba.net/doc)。

2. 如果单独使用插件
 
```bash-
    $ npm install fie-plugin-mock -g
```

**注意，因为此插件原是FIE体制下的插件。如果您的项目需要单独使用插件，对应的命令行使用方式只需将fie与mock之间的空格去掉**

如
 
* $ fie mock init -> fiemock init 
* $ fie mock start -> fiemock start 
* $ fie mock fake -> fiemock fake
* $ fie mock help -> fiemock help  


## 使用

### 初始化
项目根目录下或随便一个目录
```bash
    $ fie mock init  
```

即可看到目录下生成以下文件

```
.
└── mock
    ├── mock-api.js
    ├── mock-db.json  
    └── mock-seed.js  
```
### 配置

在mock-seed.js定义mock数据生成规则。

* 第一步：定义表名(资源名)
* 第二步：添加字段,设置主键, 及生成mock数据规则
* 第三步：设置循环生成mock数据

### 生成mock数据
根据mock-seed.js中定义的规则, 生成 mock-db.json

```bash
    $ fie mock fake
```

### 启动mock服务


```bash
    $ fie mock start
```

就可以通过http://localhost:9090 进行http请求了

### 显示帮助


```bash
    $ fie mock help
```

## 例子

### todo List

0. todos 是很多工具或框架入门常用例子。假设他的其本功能有:

    0. 获取所有的todo list，需要分页、排序
	0. 条件查询状态"末开始" 或“进行中”或“已完成” 的todo list, 需要分页、排序
	0. 新增一条todo 记录
    0. 根据itemId,获得一条todo 记录
	0. 改变一条todo 记录状态（由"未完成"改为“进行中”）
	0. 删除一条todo 记录
0. 基于6个需求功能点，以下一步一步设置：
	0. 安装好fie 及 初始化 fie mock init 后，打开 ./mock/mock-seed.js(参看默认代码)
		* 在 step1_baseSet()方法中: 定义表名(资源名),如
        * 在 step2_design()方法中: 添加字段,设置主键, 及生成mock数据规则
        * 在 step3_generate()方法中:设置循环生成mock数据
    0. 执行 
    ```bash
       $ fie mock fake
    ```
    根据mock-seed.js中定义的规则, 生成 mock-db.json
    0. 执行 
    ```bash
       $ fie mock start
    ```
    http://localhost:9090 mock服务起动
    
0. http://localhost:9090 mock服务起动后，服务接口将支持的功能如下
	
功能点|调用 Api | Ajax Method| 参数| 返回结果|
------| ----------------|-----------|-----|--------|
获取所有的todo list，需要分页、排序。|http://127.0.0.1:9090/todos?pramas=xxxx<br>或http://127.0.0.1:9090/getlist?pramas=xxxx<br>基中 xxxx = JSON.stringify(参数)|GET|```{ "query": {"pageSize":10, "pageNum":1}, "sort": "itemId desc"}``` |todos list|
条件查询状态"末开始" 或“进行中”或“已完成” 的todo list, 需要分页、排序|同上|GET|```{ "query": {"pageSize":10, "pageNum":1, "status":"末开始"}, "sort": "itemId desc"}``` |todos list|
新增一条todo 记录 |http://127.0.0.1:9090/todos <br>或 http://127.0.0.1:9090/todos/create| POST | {"title":"code review", "status":"未开始",...others } <br>(...others指其他字段数据) |新增的todo|
根据itemId,获得一条todo 记录|http://127.0.0.1:9090/todos/1<br>或 http://127.0.0.1:9090/todos/get?itemId=1|GET |{"itemId":"1"} | 将 返回id = 1 的那条数据。|
改变一条todo 记录状态（由"未完成"改为“已完成”）|http://127.0.0.1:9090/todos/1<br>或http://127.0.0.1:9090/todos/edit |PUT或POST | {"itemId": 1,"status":"已完成"}|返回更新(修改)后id = 1 的那条数据|
删除一条todo 记录|http://127.0.0.1:9090/todos/1 <br>http://127.0.0.1:9090/todos/delete|DELETE或POST|{"itemId":"1"}  | 将 删除掉id = 1 的那条数据。再调用http://127.0.0.1:9090/todos 会发现数据已经被删除|


PS: 调用API有的有两个，插件默认是支持[Resful Api规范](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)的， 但实际项目中，后端不一定遵循此规范。
所以, 增删改查的接口用 :resoure/keyworks 方式：

*  http://127.0.0.1:9090/todos/create 
*  http://127.0.0.1:9090/todos/edit
*  http://127.0.0.1:9090/todos/delete
*  http://127.0.0.1:9090/todos/get?Id=xxx
*  http://127.0.0.1:9090/todos/getlist?pramas=JSON.stringify({ "query": {"pageSize":10, "pageNum":1, "status":"末开始"})



## 进阶使用方法

上面例子是其本用法, 也是推荐用法。满足生成数据的mock规范，以及70%左右mock接口需求。

0. 如果觉得mock规范比较麻烦，可以直接手动编辑./mock/mock-db.json

比如您在JSON根节点添加：

```
   	"bu":[ {
      	"id": 1,
      	"name": "taobao"
    	},
    	{
      	"id": 2,
      	"name": "tmall"
    	}
  	]
```
	
fie mock start 后，您就会获得支持接口支持:
如 http://127.0.0.1:9090/bu/create （把上面表的todos 变在 bu ）

PS:  但您就不能再执行 fie mock fake 了，否则会被mock-seed.js 生成的数据覆盖

0.  如何自定义接口返回格式?
	* 打开./mock/mock-api.js 便是一个让你灵活配置的地方
	如下你可以改变查询列表返回的的数据结构

	```
        /*根据请求条件获取列表数据----响应JSON结构*/            
        return {
            success: true,
            totalCount: dataResult.totalCount,
            pageSize: dataResult.pageSize,
            pageNum: dataResult.pageNum,
            totalPage:  dataResult.totalPage,
            hasMore: dataResult.hasMore,
            data:  dataResult.data // 你可以把data 改为model: dataResult.data 
        }
	```

0.  如何新增自定义接口?
	* 比如要添加一个 http://127.0.0.1:9090/helloworld 的接口，返回数据随着
		* 打开./mock/mock-api.js 
		* 在apiRouteMap 下添加:  
	
		```
		"helloworld": function(data , method) {
	    	//data 是POST或GET过来的数据，method是POST/GET/PUT/DELETE
        	return {
            	success: true,
            	data: "hello world!"
        	}
   		}
    	```
    	
    	* http://127.0.0.1:9090/helloworld 就可以访问了。

        ＊  如果需要返回一个极其复杂的数据结构呢？既包含数组又包含对象,比如这样的返回:

        ``` 
         {
                success: true,
                data: {
                    a: [], 
                    b: {},
                    c: "whatever"
                }
         }
        ```
        你可以选择在helloworld里面写死，但a,b 数据量较大的时候，mock-api.js 这个文件会变得臃肿。
        所以建议造数据及字段尽量在mock.seed.js 中定义好。 因为 数据a 或实体b 对应的字段可重复列用的可能性较大
        这时我们就可以这样:
        
        ```
        "helloworld": function(data , method) {
           return  {
                success: true,
                data: {
                    a: this.db.get("a").value(), //获取一个数组的数据,注意：this.db.get("a")是[loadash对象](https://lodash.com/docs/4.15.0), 你可以用loadash方法做数据过滤
                    b: this.db.get("b").value()[0], //取一条数据当对象
                    c: "whatever"
                }
            }
        }
        ```

0.  我不想用以上方式定义数据接口，我只有一份json 数据，怎么快速生成接口？
    * 你只需要将你的json数据以 *.json后缀文件保存在 ./mock 目录下
    * $ fie mock start 
    * 你就可以 http://localhost:9090/yourfile 或 http://localhost:9090/yourfile.json 就能请求到了。



## todo 
    * 接口平台化 

## 问题反馈

0. 套件开发者：@六韬
0. 建议及问题反馈入口：[https://github.com/fieteam/fie-plugin-mock/issues/new](https://github.com/fieteam/fie-plugin-mock/issues/new)   
     PS: 注意将issues Assignee 给@俞上津_Alex Yu。