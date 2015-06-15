/**
 * Created by fujunou on 2015/4/21.
 */

var fs = require('fs');
var env = {};
var envFile = __dirname + '/development.json';
//var envFile = __dirname + '/production.json';


if (fs.existsSync(envFile)) {
    env = fs.readFileSync(envFile, 'utf-8');
    env = JSON.parse(env);
    Object.keys(env).forEach(function (key) {
        process.env[key] = env[key];
    });
}


module.exports = env;
