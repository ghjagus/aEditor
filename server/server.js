var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;
var util = require('./util/util');
var bodyParser = require('body-parser');


// 配置
require('./config/projectConf')(app);

// templates
require('./config/templates')(app, path.join(__dirname, 'app/views'));

// db
require('./config/mongo')();

// 存放用户上传资源
app.use(express.static(path.join(__dirname, util.getCdnDir())));

// 上传大小限制
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));


// middlewares
require('./config/middlewares')(app);

//routes
require('./config/routes')(app);



// exceptions
require('./config/exceptions')(app);



app.listen(port, function () {
    console.log('Express started on port '+port+'...');
});