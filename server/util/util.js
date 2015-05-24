/**
 * Created by fujunou on 2015/4/21.
 */
var fs = require('fs'),
    path = require('path'),
    config = require('../config/env/development');

var errorMap = JSON.parse(fs.readFileSync('./config/env/'+config.err, 'utf-8'));

module.exports.getCdnDir = function () {
    return config.cdn;
};

module.exports.getDbUri = function () {
    return config.db;
};

/**
 * 从一个目标对象中返回选取指定key组成的对象
 * @param {Object} sourceObj - 目标对象
 * @param {Array} keyArr - 指定的key
 * @returns {Object}
 */
module.exports.getObjKeysMap = function (sourceObj, keyArr) {
    var retObj = {};
    keyArr.forEach(function (key, index) {
        if(sourceObj.hasOwnProperty(key) && sourceObj[key] !== undefined) {
            retObj[key] = sourceObj[key];
        }
    });
    return retObj;
};


/**
 * 创建多级目录
 * @param  {String} dirpath 路径
 * @param  {String} mode    模式
 */
module.exports.mkdirsSync = function(dirpath, mode) {
    dirpath = path.resolve(dirpath);
    if (fs.existsSync(dirpath)) {
        return;
    }
    var dirs = dirpath.split(path.sep);
    var dir = '';
    for (var i = 0; i < dirs.length; i++) {
        dir += path.join(dirs[i], path.sep);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, mode);
        }
    }
};

// 生成uid
module.exports.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }).toUpperCase();
};

module.exports.uriChange = function (uri) {
    // 去掉public
    uri = uri.slice(this.getCdnDir().length);
    return uri.replace(/\\/gm, '/');
};

// 获取base64图片格式
module.exports.getBase64ExtName = function (base64Str) {
    return /data\:image\/(\w+)\;/.exec(base64Str)[1];
};

module.exports.json = function (res, data) {
    var ret;
    if(data.errType === 0) {
        // 正常返回
        ret = {
            retcode: 0,
            result: data.json || {}
        };
        ret.result.errno = 0;
        if(data.jsonMsg) {
            ret.result.msg = data.jsonMsg
        }
    } else if(data.errType === 1) {
        // 逻辑错误返回
        ret  ={
            retcode: data.errCode,
            msg: errorMap.retcode[data.errCode]
        }
    } else if(data.errType === 2) {
        // 操作数据库出错
        ret = {
            retcode: 0,
            result: {
                errno: data.errCode,
                msg: errorMap.errno[data.errCode]
            }
        }
    }

    res.json(ret);
};

// 从请求中获取uid
module.exports.getUid = function (req) {
    return req.cookies.user_id || '';
};

// 从请求中获取作品ID
module.exports.getWorkId = function (req) {
    return req.body.work_id || req.query.work_id || '';
};

// 未登录
module.exports.unLogin = function (res) {
    return res.json({
        retcode: -1,
        msg:'未登录'
    });
};

/**
 * 递归删除目录
 * @param  {String} dirpath 路径
 */
module.exports.rmdirsSync = function(dirpath) {
    dirpath = path.resolve(dirpath);
    // console.log(dirpath);
    if (!fs.existsSync(dirpath)) {
        return;
    }
    var dirs = fs.readdirSync(dirpath);
    // console.log(dirs);
    var dir, len = dirs.length;
    if (len === 0) {
        fs.rmdirSync(dirpath);
        return;
    }
    for (var i = 0; i < len; i++) {
        dir = path.join(dirpath, dirs[i]);
        // console.log(dir);
        if (fs.statSync(dir).isDirectory()) {
            rmdirsSync(dir);
            // fs.rmdirSync(dir);
        } else {
            fs.unlinkSync(dir);
        }
    }
    fs.rmdirSync(dirpath);
};



