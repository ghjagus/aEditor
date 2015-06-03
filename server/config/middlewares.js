/**
 * Created by fujunou on 2015/4/21.
 */

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');
var util = require('../util/util');

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    // 鉴权中间件
    app.use(function (req, res, next) {
        var token = req.cookies.SID;
        var reqOpt = {
            url: 'http://10.18.87.64:10000/api/public/user/info',
            method: 'get',
            headers: {
                'cookie': 'SID='+token
            }
        };

        var noOauthCgi = app.get('noOauthCgi');
        var useThisMd  = true;

        // 判断是否要经过鉴权
        noOauthCgi.forEach(function (cgi, index) {
            var cgiName = cgi.url;
            var type = cgi.type || 'get';

            if(req.path.indexOf(cgiName) > -1 && req.method.toLowerCase() === type.toLowerCase()) {
                useThisMd = false;
            }
        });

        if(useThisMd) {
            // 没有user_id,就当作没登录
            if(! util.getUid(req)) {
                return util.unLogin(res);
            }

            request(reqOpt, function (err, response, body) {
                if(err) {
                    util.unLogin(res);
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    });
};