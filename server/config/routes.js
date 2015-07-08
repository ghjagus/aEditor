var ctrls = require('../app/ctrls/crudCtrl');
var files = require('../app/ctrls/filesCtrl');
var oauth = require('../app/ctrls/oauthCtrl');

module.exports = function (app) {
	var cgiBase = '/cgi';
	
	function getCgiPath(url) {
		return cgiBase + url;
	}
    app.get('/forlogin', function (req, res) {
        res.render('login');
    });

    /*绑定CGI接口*/
    // 作品元件增加，更新
    app.post(getCgiPath('/upsert'), ctrls.upsert);

    // 作品元件删除
    app.post(getCgiPath('/delete'), ctrls.delete);

    // 作品元件查询
    app.get(getCgiPath('/query'), ctrls.query);

    // 图片上传
    app.post(getCgiPath('/upload'), files.upload);

    // 作品zip包下载
    app.get(getCgiPath('/workdownload'), files.workdownloads);

    // 生成下载用JS文件
    app.post(getCgiPath('/jscode'), files.createJsFile);

    // 登录用接口
    app.get(getCgiPath('/login'), oauth.doLogin);

    // 注销用接口
    app.get(getCgiPath('/logout'), oauth.doLogout);
    
    // 清空uid中的temp目录
    app.get(getCgiPath('/deltemp'), files.deleteTempDir);

    // 获取图片目录
    app.get(getCgiPath('/getimgs'),ctrls.getAllImgs);

    // 删除一张图片
    app.post(getCgiPath('/delimg'),files.deleteUserImage);


    // 清空uid中元件的temp目录
    app.get(getCgiPath('/delctrltemp'), files.deleteTempControllerDir);
    

};