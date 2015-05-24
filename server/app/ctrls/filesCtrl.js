/**
 * @file 图片上传，zip包下载
 * @author jagus.ou@gmail.com
 */

var fs = require('fs');
var path = require('path');
var util = require('../../util/util');
var archiver = require('archiver');
var workModel = require('../models/workModel');


/**
 * 图片base64上传
 * 如果没有workID，则将图片放到userID/temp目录下
 */

module.exports.upload = function(req, res) {
    var imgBase64Str = req.body.img || '';
    var userID = util.getUid(req);
    var workID = util.getWorkId(req);
    var cndFolder;
    var imgName = req.body.img_name || util.guid();
    var imgExtName;

    // 对base64串作检测
    if(! /^data:(.*);base64,/.test(imgBase64Str) && imgBase64Str.length < 100) {
        return util.json(res, {
            errType: 1,
            errCode: 6
        });
    }

    if(workID) {
        cndFolder = util.getCdnDir()+[userID, workID].join('/');
    } else {
        cndFolder = util.getCdnDir()+[userID, 'temp'].join('/');
    }

    if(! fs.existsSync(cndFolder)) {
        util.mkdirsSync(cndFolder);
    }

    imgExtName = '.'+util.getBase64ExtName(imgBase64Str);
    imgReName = path.join(cndFolder, imgName + imgExtName);

    // 如果图片已经存在，重命名规则为在后面简单加0
    while(fs.existsSync(imgReName)) {
        imgReName = path.join(cndFolder, path.basename(imgReName, imgExtName) + '0'+imgExtName);
    }

    fs.writeFileSync(imgReName, new Buffer(imgBase64Str.replace(/^data:(.*);base64,/, ''), "base64"));

    util.json(res, {
        errType: 0,
        json: {
            url: util.uriChange(imgReName)
        }
    });
};

// 作品打包下载
module.exports.workdownloads = function (req, res) {
    // 先判断此用户下此作品是否存在，存在即可下载
    // 最后证明不需要作品id,因为JS文件始终是临时生成的
    var user_id = util.getUid(req),
        work_id = util.getWorkId(req);

    var jsPath, imgPath, archive;

    if(user_id) {
        conditions = {
            user_id: {$eq: user_id},
            _id: {$eq: work_id}
        };

        if(! conditions.id) {
            // 如果没有work_id，则使用user_id/temp打包
            archive = archiver('zip');
            archive.on('error', function(err) {
                res.status(500).send({error: '系统出错'});
            });

            res.on('close', function() {
                console.log('Archive wrote %d bytes', archive.pointer());
                return res.status(200).send('OK').end();
            });

            res.attachment('aeditor-'+new Date()*1+'.zip');
            archive.pipe(res);
            jsPath = path.join(util.getCdnDir(), 'js', user_id);
            imgPath = path.join(util.getCdnDir(), user_id, 'temp');

            archive.bulk([
                { expand: true, cwd: 'zip', src: ['index.html'], dest:'/' },
                { expand: true, cwd: 'zip/css', src: ['*.css'], dest:'/css/' },
                { expand: true, cwd: 'zip/js', src: ['*.js'], dest:'/js/' },
                { expand: true, cwd: jsPath, src: ['main.js'], dest:'/js/' },
                { expand: true, cwd: imgPath, src: ['*.*'], dest:'/img/' }
            ]);

            archive.finalize();
            return;
        }

        workModel.count(conditions, function(err, count) {
            if (err) {
                return util.json(res, {
                    errType: 2,
                    errCode: 9
                });
            }
            var imgFdExist = fs.existsSync(path.join(util.getCdnDir(), user_id, work_id));

            if(count === 1 && imgFdExist) {
                archive = archiver('zip');
                archive.on('error', function(err) {
                    res.status(500).send({error: '系统出错'});
                });

                res.on('close', function() {
                    console.log('Archive wrote %d bytes', archive.pointer());
                    return res.status(200).send('OK').end();
                });

                res.attachment('aeditor-'+new Date()*1+'.zip');
                archive.pipe(res);
                jsPath = path.join(util.getCdnDir(), 'js', user_id);
                imgPath = path.join(util.getCdnDir(), user_id, work_id);

                archive.bulk([
                    { expand: true, cwd: 'zip', src: ['index.html'], dest:'/' },
                    { expand: true, cwd: 'zip/css', src: ['*.css'], dest:'/css/' },
                    { expand: true, cwd: 'zip/js', src: ['*.js'], dest:'/js/' },
                    { expand: true, cwd: jsPath, src: ['main.js'], dest:'/js/' },
                    { expand: true, cwd: imgPath, src: ['*.*'], dest:'/img/' }
                ]);

                archive.finalize();
            } else {
                return util.json(res, {
                    errType: 2,
                    errCode: 10
                });
            }
        })

    } else {
        return util.json(res, {
            errType: 1,
            errCode: 1
        });
    }
};

// 利用前台传过来的JScode，生成下载用JS
module.exports.createJsFile = function (req, res, next) {
    var jscode = req.body.jscode || '';
    var userId= util.getUid(req);

    var jsFileDir = path.join(util.getCdnDir(), '/js/'+userId);
    var jsFilePath = path.join(jsFileDir, '/main.js');
    if(! jscode || !userId) {
        return util.json(res, {
            errType: 1,
            errCode: 1
        });
    }

    if(! fs.existsSync(jsFileDir)) {
        util.mkdirsSync(jsFileDir);
    } else {
        // 存在则删除main.js文件
        try {
            fs.unlinkSync(jsFilePath);
        } catch (e) {

        }
    }

    fs.writeFile(jsFilePath, [';',jscode,';'].join(''), function (err) {
        if (err) {
            return util.json(res, {
                errType: 2,
                errCode: 11
            });
        };

        util.json(res, {
            errType: 0,
            json: {
                msg: '生成JS文件成功'
            }
        });
    });
};


module.exports.deleteTempDir = function (req, res) {
    var uid = util.getUid(req);
    var temp = path.join(util.getCdnDir(), uid, 'temp');

    if(fs.existsSync(temp)) {
        util.rmdirsSync(temp);
    }
    util.json(res, {
        errType: 0,
        json: {
            msg: '清空temp目录成功'
        }
    });
};
