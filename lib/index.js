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
    app.get('/express-dir-route.doc', function(req, res) {
        if (req.query.type === 'nomal') {
            return res.json(nomalList);
        }
        if (req.query.type === 'tree') {
            return res.json(treeList);
        }
        res.sendFile(path.join(__dirname, 'views/index.html'))
    });

    app.get('/express-dir-route.doc/dist/*', function(req, res) {
        var filePath = req.path.split('/express-dir-route.doc/')[1];
        res.sendFile(path.join(__dirname, 'views', filePath));
    })

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
        if (/^(GET|POST|PUT|PATCH|DELETE).js$/.test(item)) {
            var method = item.replace(/(~|\.js)/g, '').toLowerCase();
            var requirePath = next.replace('.js', '');
            var route = nextName.replace(/\/(GET|POST|PUT|PATCH|DELETE)\.js$/, '');
            var files = require(requirePath);

            app[method](route, files.handle);

            if (!files.info || typeof files.info !== 'object') {
                files.info = {}
            }
            if (files.info['same'] && Array.isArray(files.info['same'])) {
                files.info['same'].forEach(function(item) {
                    app[method](item, parseParams, files.handle);
                })
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

    function parseParams(res, req, next) {
        for (var attr in res.params) {
            res.query[attr] = res.params[attr];
        }
        next();
    }


}