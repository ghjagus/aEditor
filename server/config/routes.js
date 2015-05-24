/**
 * Created by fujunou on 2015/4/21.
 */
var ctrls = require('../app/ctrls/crudCtrl');
var files = require('../app/ctrls/filesCtrl');
var oauth = require('../app/ctrls/oauthCtrl');

module.exports = function (app) {

    /*绑定CGI接口*/
    // 作品元件增加，更新
    app.post('/upsert', ctrls.upsert);

    // 作品元件删除
    app.post('/delete', ctrls.delete);

    // 作品元件查询
    app.get('/query', ctrls.query);

    // 图片上传
    app.post('/upload', files.upload);

    // 作品zip包下载
    app.get('/workdownload', files.workdownloads);

    // 生成下载用JS文件
    app.post('/jscode', files.createJsFile);

    // 登录用接口
    app.get('/login', oauth.doLogin);

    // 清空uid中的temp目录
    app.get('/deltemp', files.deleteTempDir)

};