/**
 * Created by fujunou on 2015/5/20.
 */
var request = require('request');
var util = require('../../util/util');

module.exports.doLogin = function (req, res) {
    // 仅想办法关闭登录框就可以了
    var token = req.cookies.SID;
    var reqOpt = {
        //url: 'http://127.0.0.1:3000/test',
        url: 'http://10.18.87.64:10000/api/public/user/info',
        method: 'get',
        headers: {
            'cookie': 'SID='+token
        }
    };

    if(! token) {
        util.unLogin(res);
    }

    // 获取uid
    request(reqOpt, function (err, response, body) {
        var loginRet = JSON.parse(body);
        var uid;

        loginRet.hasOwnProperty('user') && (uid = loginRet.user.uid);

        if(err || ! uid) {
            util.unLogin(res);
        } else {
            var html = '<script>document.domain="alloyteam.com";top.loginCb({"uid":"'+uid+'"});</script>';
            // user_id保存一个月
            res.cookie('user_id', uid, { expires: new Date(Date.now() + 2592000000), httpOnly: true });
            res.type('.html');
            res.send(html);
        }
    });
};

// 注销
module.exports.doLogout = function (req, res) {


    // 设置cookie过期
    res.cookie('user_id', '', { expires: new Date(Date.now() - 10000000), httpOnly: true });
    // 返回注销成功
    return res.json({
        retcode: 0,
        msg:'注销成功'
    });
};
