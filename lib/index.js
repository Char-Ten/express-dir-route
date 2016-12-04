'use strict'

var fs = require('fs');
var path = require('path');
var qs = require('querystring');

/**
 *  used to regist routes
 * @param {object} app 
 * @param {String} dirName
 * @param {String} rename  
 * @param {Bool} isTreeList  
 */

module.exports = function(conf) {
    var app = conf.app;
    var dir = conf.dir;
    var rename = conf.rename || '';
    var nomalList = [];
    var treeList = [];

    read(dir, rename, treeList);
    app.get('/doc/auto-route-view', function(req, res) {
        if (req.query.type === 'nomal') {
            return res.json(nomalList);
        }
        if (req.query.type === 'tree') {
            return res.json(treeList);
        }
        res.sendFile(path.join(__dirname, 'views/index.html'))
    });

    function read(dirPath, rename, children) {
        var arr = fs.readdirSync(dirPath);

        arr.forEach(function(item) {
            var next = path.join(dirPath, item);
            var nextName = rename + '/' + item;
            var stat = fs.statSync(next);
            var child = [];

            if (stat.isDirectory()) {
                read(next, nextName, child);
                children.push({
                    label: item,
                    children: child
                })
            } else {
                registRoute(next, nextName, item, children);
            }
        });
    }

    function registRoute(next, nextName, item, children) {
        if (/^[~]*(GET|POST|PUT|PATCH|DELETE).js$/.test(item)) {
            var method = item.replace(/(~|\.js)/g, '').toLowerCase();
            var requirePath = next.replace('.js', '');
            var route = nextName.replace(/\/[~]*(GET|POST|PUT|PATCH|DELETE)\.js$/, '');
            var files = require(requirePath);


            if (/~/g.test(item)) {
                route += '/*';
            }

            app[method](route, files.handle);

            if (!files.info || typeof files.info !== 'object') {
                files.info = {}
            }

            files.info['route'] = route;
            files.info['method'] = method;
            nomalList.push(files.info);
            children.push({
                label: files.info['name'] || route,
                info: files.info
            })

        }
    }


}