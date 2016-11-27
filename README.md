[中文](./README_zh.md)  
This is a simple and small plugin for express.  
It's used to register routes that are base on files path. 

## express-dir-routes
---
### Quick usage:
* in file */app.js*:
  ```javascript
    var autoDirRoute=require('express-dir-routes');
    var app=require('express')();

    autoDirRoute({
        'app': app,//express instance 
        'dir': path.join(__dirname, 'routes'),//the directory where the routes file is
        'rename': 'api/v1'//set some strings before the routes's url
    })
  ```
  
* in file */routes/list/article/GET.js*:
  ```javascript
    module.exports={
        info:{
            name:'list',
            test:{
                query:{
                    testA:'1',
                    testB:'2'
                },
                data:{
                    testA:'this is a post data'
                },
                text:'you can write down something'
            }
        },
        handle:function(req,res,next){
            res.end(req.method+' '+req.url)// will respond  "get /routes/list/article"
        }
    }
  ```

* So you can create some directories in the directory whitch named 'routes'.
Then create the routes handle file and name it as the HTTP methods's name,such as:
  ```
    routes
    |--list
       |--article
       |  |--GET.js
       |  |--POST.js
       |  |--DELETE.js
       |  
       |--friend
          |--GET.js
          |--POST.js
  ```
  They will be translated into:
  ```http
    GET '/list/article';
    GET '/list/friend';
    POST '/list/article';
    POST '/list/friend';
    DELETE '/list/article';
  ```

* It's a plugin so that it never change any attribute and method of express.You also can register routes like that:
  ```javascript
    app.get('/',function(req,res,next){ res.end('homePage') }); 
    app.post('/',function(req,res,next){ res.end('post homePage') }) 
  ```

---
### Instructions
* This plugin just using the express method:`app[method](route,handle)`to go through all the routes handle files whitch names are:`(GET|POST|PUT|PATCH|DELET).js`
* You can named file as '`~GET.js`' so that it will translated into '`/*`';
* And the routes handle file must exports a Object:
  ```javascript
  module.exports={
      info:{},
      handle:function(res,req,next){}
  }
  ``` 
  The data in attribute `info` can be rendered a routes document.

---
###  routes document
* visit url  
`/doc/auto-route-view`
* method  
`GET`
* query<table>
        <tr><th>name</th><th>type</th><th>info</th></tr>
        <tr><td>type</td><td>String</td><td>
            <p>'type' has two values:</p>
            <p>One is 'nomal',will respond a simple array whitch include all information form routes handle files's attribute 'info'</p>
            <p>Another one is 'tree',will respond a tree's like array</p>
            <p>If it is null or other values,will respond the document's html data</p>    
        </td></tr>
  </table>
* To render as a routes document.Plugin provide a data template:
  ```javascript
    info:{
        //the route's name
        name:'To get data',
        
        //summary of this route
        summary:'this is a summary',
        
        //content
        content:[
            // a section
            {
                //section's title
                title:'Query',
                
                //section's summary
                summary:'this is query\'s summary ',
                
                //section's warn
                warn:'this is query\'s warn',
                
                //create a table,one section just have one table
                table:{
                    thead:['th1','th2','th3'],
                    tbody:[
                        ['td1','td2','td3'],
                        ['td1','td2','td3']
                    ]
                }
            },
            
            // a section
            {
                //section's title
                title:'Data',
                
                //section's summary
                summary:'this is data\'s summary ',
                
                //section's warn
                warn:'this is data\'s warn',
                
                //create a table,one section just have one table
                table:{
                    thead:['th1','th2','th3'],
                    tbody:[
                        ['td1','td2','td3'],
                        ['td1','td2','td3']
                    ]
                }
            },
        ],

        //provide data for test
        test:{
            //url's search
            query:{},

            //post form data
            data:{},

            // wirte down something about test 
            text:'',
        }

    }
  ```