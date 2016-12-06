# fie-plugin-mock 原理

## 说明

fie-plugin-mock 插件用于配置一个简单，易用，灵活的http mock服务。



## 用法
通常执行fie mock init  项目根目录下生成以下3个可选配置的文件:

### mock/mock-db.json 

1. 如果您偏向于通过json定义您的mock 数据，可以忽略另外两个文件，直接将您的数据写入mock-db.json
    * 如 添加以下对象到mock-db.json中
    ```
   "brandlist": [
   {
      "id": 1,
      "brandName": "Central Markets Manager",
      "platform": "天猫",
      "logo": "http://placehold.it/90x45/227b4"
    },
    {
      "id": 2,
      "brandName": "Senior Optimization Strategist",
      "platform": "聚划算",
      "logo": "http://placehold.it/90x45/92c322"
    }
   ]
    ```
    * 那么通过fie mock start 启动服务后，您可以得到以下API 接口


 调用resful Api | Ajax Method| 参数| 返回结果|
 ----------------|-----------|-----|--------|
http://127.0.0.1:9090/brandlist|GET| |取得到这个列表数据。|
http://127.0.0.1:9090/brandlist |POST| { "id": 3,  "brandName":"AE", "platform": "淘宝", "logo":"xx"}| 将淘宝这条数据添加到brandlist|
http://127.0.0.1:9090/brandlist | GET | {"pageSize":2, "pageNum":1 } | 可以获取分页数据。|
http://127.0.0.1:9090/brandlist/1 |GET | | 将 返回id = 1 的那条数据。|
http://127.0.0.1:9090/brandlist/1 |PUT/POST | {"platform": "天猫2016"}|返回id = 1 的那条数据的platform更新为"天猫2016"|
http://127.0.0.1:9090/brandlist/1 |DELETE| | 将 删除掉id = 1 的那条数据。再调用http://127.0.0.1:9090/brandlist 会发现数据已经被删除|

### mock/mock-seed.js 
0. 如果您觉得直接在mock/mock-db.json 中写类似brandlist 这样的数据太麻烦。本插件提供一个通用规范的mock json数据的方法,打开mock/mock-seed.js 文件只需三步
	* 定义表名
	* 添加字段,设置主键, 及生成mock数据规则
	* 循环生成mock数据
0. 做完以上三步，在项目根目录 fie mock fake 即按这个文件的规定生成 ./mock-db.json 数据。调用api 请参照上表.
 
0. mock 数据字段生在规范(完善中)
   * 标题:  Mock.name()
   * 活动标题:  Mock.activityName()
   * 优惠标题:  Mock.activityDesc()
   * 商品标题:  Mock.itemName()
   * 描述:  Mock.words()
   * 折扣:  Mock.discount()
   * 日期:  Mock.time()
   * 链接:  Mock.url()
   * 价格:  Mock.price()
   * 图片:  Mock.image('100x100')
   * 数字:  Mock.number()
   * 布尔:  Mock.boolean()
   * 枚举:  Mock.enum(['打折','减价','促销价'])
   
### mock/mock-api.js 
0. 这是高阶玩法: 打开mock/mock-api.js  可以灵活自定义接口与接口的返回的格式
	* 如您在 routeMap 中定义一个helloworld , 关在return 中返回
	
	```
	"helloworld": function(data, method){
	   if(method === "POST"){
	   		//可以在这里对post/get做判断
	   }
	   if(data.xxx === "xxx"){
	   		//可以在这里对post/get 传过来的data做判断
	   }
	   
	   //可以返回数据可以方便调用"db",通过 lodash 的链式写法取得相关的数据。
	   return {
	     isSuccess: true,
         data:{
          brandList: db.get("brandList"),
          shopList: db.get("shopList").find({ platform: "淘宝"})
          }
	     }
	   }
	}
	```
	启动fie mock start, 调用  http://127.0.0.1:9090/helloword , 可以看到你想要的结果。
	
	

## 功能

```
fie mock init 
```
在项目根目录下运行此命令
会在项目目录下创建mock 目录及三个文件

0. mock/mock-db.json  在这个文件是写上json数据，便可以通过 http://127.0.0.1:9090/xxxxx 等resful 接口访问 支持跨域，支持添加，删除，修改，查询(含分页)
0. mock/mock-seed.js （可选功能）生成mock-db.json 的最佳实践, 编辑好后能通过 fie init mock
0. mock/mock-api.js   (可选功能）自定义接口，一个key 加一行return 代码就可实现  http://127.0.0.1:9090/helloword 这样的接口

请看用法

```
fie mock fake 
```
 打开项目初始化mock数据的种子文件.
 
0. 定义表名
0. 添加字段,设置主键, 及生成mock数据规则
0. 循环生成mock数据
 做完以上三步，在项目根目录 fie mock fake 即按这个文件的规定生成 ./mock-db.json 数据
 
```
fie mock start 
```
0. fie mock start --port 9090 默认端口 9090 
0. http://127.0.0.1:9090/index.html 是个可视化界面用于简单调用定义的接口

## TODO
0. 完善MockFaker.Filed
0. 文档与开发体验




 
 


