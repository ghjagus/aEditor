/**
 * Created by fujunou on 2015/5/24.
 */

module.exports = function(app) {
    app.set('noOauthCgi', [{
        url:'forlogin'
    },{
        url:'login'
    }]);
};