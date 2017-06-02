var express = require('express');
var path = require('path');
var ejs = require('ejs');
var port = process.env.port || 8080;
var app = express();
/*
app.set('viwes', './views'); //设置根目录
app.set('viwe engine', jade); //设置模板是jade*/

// view 引擎设置
app.set('views', path.join(__dirname, './views/pages'));
app.set('view engine', 'html'); //把html改为ejs则用ejs后缀名的模板，
app.engine('.html', ejs.__express); //使用Html后缀名模板，
//定义静态文件的输出目录
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port); //设置端口3000
console.log('监听' + port + '端口');

app.get('/', function(req, res) {
	res.render('index', {
		title: '电影首页',
		movies:[{
			title:"微微一笑很倾城",
			_id:1,
			score:'3.2',
			imgSrc:"https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=2426684961,331017121&fm=58",
			poster:"http://www.iqiyi.com/v_19rrm3lvmg.html?vfm=2008_aldbd&fc=828fb30b722f3164&fv=p_02_01"
		},{
			title:"三傻大闹宝莱坞",
			_id:2,
			score:'9.2',
			imgSrc:"https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3693536710,1067867236&fm=58",
			poster:"http://www.iqiyi.com/dianying/20120618/f0faf21d5f12f65e.html?vfm=2008_aldbd"
		},{
			title:"最美的时候遇见你",
			_id:3,
			score:'7.2',
			imgSrc:"https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=2024260990,400118987&fm=58",
			poster:"http://v.qq.com/x/cover/i1t9l2f2vrcbku8.html?vid=m0019vukmw3"
		},{
			title:"天下第一拳 ",
			_id:4,
			score:'5.2',
			imgSrc:"https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=3207841836,826139261&fm=58",
			poster:"http://v.youku.com/v_show/id_XMzIxMDY4MTQ4.html?from=y1.6-96.1.1.cc061672962411de83b1"
		},
		
		]
	})
})

app.get('/movie/:id', function(req, res) {
	res.render('详情页', {
		title: 'detail详情页',
		movie:{
			doctor:'老二',
			country:'美国',
			title:'大话西游3',
			year:'2012',
			poster:"http://www.iqiyi.com/v_19rr9a8i4s.html?fc=8b62d5327a54411b#vfrm=19-9-0-1",
			summary:'计算机系美女加高手贝微微（Angelababy 饰），热爱网游，却因为技术高超不爆照片被认为是人妖...'
		}
	})
})

app.get('/admin', function(req, res) {
	res.render('admin', {
		title: 'admin'
	})
})

app.get('/list', function(req, res) {
	res.render('list', {
		title: 'list'
	})
})