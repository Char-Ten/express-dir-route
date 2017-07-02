> 一个小小的，带有接口文档生成/测试器的，为express框架准备的，文档路由注册插件！

## Express-dir-route
---
### 快速使用：
1. 安装：
```npm install express-dir-route```

2. 配置：
```javascript
var express=require('express');
var route=require('express-dir-route');
var path=require('path')
var app=express();

route({
    app:app,
    dir:path.join(__dirname,'routes'),
    rename:'api/v1'
});

module.exports=app;
```
配置参数：  
<table>
    <tr>
        <th>参数</th>
        <th>说明</th>
    </tr>
    <tr>
        <td>app</td>
        <td>express的实例</td>
    </tr>
    <tr>
        <td>dir</td>
        <td>放置路由文件的目录</td>
    </tr>
    <tr>
        <td>rename</td>
        <td>设置接口url前缀</td>
    </tr>
    <tr>
        <td>isCreateDoc</td>
        <td>是否创建接口文档</td>
    </tr>
</table>

> **注意：**  
为了更好的使用express等其他中间件和功能，请在所有中间件配置语句（`app.use(xxxx)`）之后执行`route`配置函数

3. 创建接口路径：  
创建routes目录，然后在目录下创建如下文件：
```html
routes
    |---GET.js
    |---POST.js
    |---test
    |     |---GET.js
    |     |---PUT.js
    |     |---PATCH.js
    |
    |---list
          |---GET.js
          |---DELETE.js
```
根据之前配置的信息，这些文件将会被生成为如下路径接口：
```http
GET    /api/v1/
POST   /api/v1/
GET    /api/v1/test/
PUT    /api/v1/test/
PATCH  /api/v1/test/
GET    /api/v1/list/
DELETE /api/v1/list/
```
本插件支持的使用的http方法有：
* GET
* POST
* PATCH
* PUT
* DELETE

以这些方法为名字的js文件将会被视为接口文件，并读取他们的名字作为请求方法。
4. 编写接口信息  
一个完整接口文件示例如下：  
```javascript
module.exports={
    info:{
        /*
        * info里的数据会作为接口文档的信息生成出来。
        */
        name:'该接口的名字',
        summary:'接口信息简介（可不写）',
        same:[
            /*
            * 具有相同功能的其他路径
            * 如访问'/test/a/b/c/d'的请求最终会进入本文件的handle处理函数里。
            */
            '/test/a/b/c/d',
            '/aa/dd/cc/dd/ee'
        ],
        content:[
           /*接口文档的展示组件，可自由搭配*/
            {
                //标题组件，
                title:'Query',

                //段落组件
                summary:'some words',

                //表格组件
                table:{
                    //表格头
                    thead:['Attribute','Type','Info'],
                    
                    //表格数据
                    tbody:[
                        ['type','String','this attribute have two value.One is....']
                    ]
                },

                //markdowm组件
                md:'`code`'
            },{
                //标题组件，
                title:'Query',

                //段落组件
                summary:'some words',

                //表格组件
                table:{
                    thead:['Attribute','Type','Info'],//表格头
                    tbody:[//表格数据
                        ['type','String','this attribute have two value.One is....']
                    ]
                },
                
                //markdowm组件
                md:'`code`'
            }
        ],
        test:{
            /*测试组件，为接口提供测试数据*/
            query:{
                /*query数据*/
                a:'1',
                b:'2'
            },
            data:{
                /*body数据*/
                c:'3',
                d:'4'
            },
            test:'测试组件里想要展示的文本'
        }

    },
    handle:function(req,res){
        /*接口处理函数*/
        res.end(req.url)
    }
}
```
5. 完成，  
启动express服务，  
浏览器访问'/express-dir-route.doc'查看接口文档！
![接口文档](./test/1.png)

---
### 说明
* `express-dir-route`仅仅是基于`express`的`app[method](route,handle)`方法，对设置为路由文件夹进行遍历，并未修改任何express的属性方法。
* 为了更好的使用`express-dir-route`，请务必将配置函数写在`body-parse`等相关express的中间件后面，不然无法使用`request.body/request.query`等便捷操作。
* 关于正则路由，如`/book/:name/page/:page/section/:section`之类的正则，`express-dir-route`建议先创建一个基准接口如：
  ```http
  GET /book
  ```
  然后将`/book/:name/page/:page/section/:section`这个路由写在`info.same`里面。
  则这些写在url上的参数会被视为`query`，可以从`req.query`里面获取，如：
  ```javascript
  module.exports={
      info:{
          name:'获取书本章节内容',
          same:[
              '/book/:name/page/:page/section/:section',
              '/book/:name/:page'
          ],
          test:{
              query:{
                  name:'《三体》',
                  page:4,
                  section:6
              }
          }
      },
      handle:function(req,res){
          res.json(req.query);
          /*
          * {
          *  "name":"《三体》",
          *  "page":4,
          *  "section":6   
          * }
          */
      }

  }
  ```
  如果url参数和query同时存在，如：
  ```http
  GET /book/threebody/page/4/section/6?page=1&section=2
  ```
  则`res.query`的数据为url参数的数据，即`res.query.page===4`'
* 关于接口文件，只有名字为上述五个大写的http方法名的js文件才会被视为接口文件，
其他js文件是被无视的，所以可以放心地在放置接口文件的目录下创建其他js文件用于分
模块处理等
* 关于接口文档的信息：
  * url:`/express-dir-route.doc`
  * method:`GET`
  * query:
    <table>
        <tr>
            <th>参数</th>
            <th>说明</th>
        </tr>
        <tr>
            <td>type</td>
            <td>
            key有两个值，
  * 当type为nomal时，返回一个包含所有接口的info的简单数组，
  * 当type为tree时，返回一个包含所有接口的info的树形json。
  * 若type不存在或type为其他值时，返回接口文档的html文件
            </td>
        </tr>
    </table>
  因此你可以根据这个信息，重新编写一个接口文档界面也是可以的