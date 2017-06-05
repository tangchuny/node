var express = require('express');
var path = require('path');
var ejs = require('ejs');
var port = process.env.port || 3000;
var app = express();
// view 引擎设置
app.set('views', path.join(__dirname, './views/pages'));
app.set('view engine', 'html'); //把html改为ejs则用ejs后缀名的模板，
app.engine('.html', ejs.__express); //使用Html后缀名模板，
//定义静态文件的输出目录
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port); //设置端口3000
console.log('监听' + port + '端口');

app.get('/', function(req, res) {
	res.render('index');
})
