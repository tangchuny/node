'use strict'
/*
 * 微信的回复文件，支付等
 */
var config = require('../config');
var Wechat = require('../wechat/wechat');
var path = require('path');
var menu =require('./menu');
var wechatApi = new Wechat(config.wechat);

wechatApi.deleteMenu().then(function(){//删除现有的才创建
	return wechatApi.createMenu(menu);
}).then(function(msg){
	console.log(msg);
})
//构造wechatApi
var wechatApi = new Wechat(config.wechat);

exports.reply = function*(next) {
	var message = this.weixin;

	if(message.MsgType === 'event') {
		if(message.Event === 'subscribe') {
			if(message.EventKey) {
				console.log("扫二维码进来：" + message.EventKey);
			}
			reply = [{
				title: '回复1,看看你是不是坑货！',
				description: '描述',
				picUrl: 'http://b.hiphotos.baidu.com/album/s%3D1600%3Bq%3D90/sign=4f04be8ab8014a90853e42bb99470263/b8389b504fc2d562d426d1d5e61190ef76c66cdf.jpg?v=tbs',
				url: 'https://www.baidu.com/'
			}, {
				title: '知识改变命运！',
				description: '没有穷死只有懒死的！',
				picUrl: 'http://pic.58pic.com/58pic/13/40/15/74W58PICfa7_1024.jpg',
				url: 'https://mp.weixin.qq.com/cgi-bin/frame?t=advanced/dev_tools_frame&nav=10049&token=1162030020&lang=zh_CN'
			}];
			this.body = reply;
		} else if(message.Event === 'unsubscribe') {
			console.log("取消订阅");
			this.body = '取消订阅'; //取消订阅不会在微信上显示
		} else if(message.Event === 'location_select') {
			this.body = '您上报的位置是' + message.latitude + '/' + message.longitude; + '-' + message.Precision;

		} else if(message.Event === 'CLICK') {
			this.body = '您点击了菜单' + message.EventKey;
		} else if(message.Event === 'SCAN') { //32
			console.log('关注后扫描二维码' + message.EventKey + '' + message.Ticket);
			this.body = '看到你扫了一下！';
		} else if(message.Event === 'VIEW') { //EventKey 相当于url地址
			this.body = '你点击菜单中的链接！' + message.EventKey;
		}else if(message.Event === 'scancode_push') { //扫码推送事件
			console.log(message.ScanCodeInfo);
			console.log(message.ScanResult);
			
			this.body = '你点击菜单中的链接！' + message.EventKey;
		}else if(message.Event === 'scancode_waitmsg') { //扫码推送等待事件
			this.body = '你确定你是一个坑货么？' + message.EventKey;
		}else if(message.Event === 'pic_sysphoto') { //
			this.body = '你点击菜单中的链接！' + message.EventKey;
		}
	} else if(message.MsgType === 'text') { //如果是文本类型
		var content = message.Content;
		var reply = '额，你说的' + message.Content + '太复杂了';

		if(content === '1') {
			reply = '第一';
		} else if(content === '2') {
			reply = '第二';
		} else if(content === '3') {
			reply = '第三';
		} else if(content === '4') { //图文
			reply = [{
				title: '技术改变未来！',
				description: '描述',
				picUrl: 'http://b.hiphotos.baidu.com/album/s%3D1600%3Bq%3D90/sign=4f04be8ab8014a90853e42bb99470263/b8389b504fc2d562d426d1d5e61190ef76c66cdf.jpg?v=tbs',
				url: 'https://www.baidu.com/'
			}, {
				title: '知识改变命运！',
				description: '没有穷死只有懒死的！',
				picUrl: 'http://pic.58pic.com/58pic/13/40/15/74W58PICfa7_1024.jpg',
				url: 'https://mp.weixin.qq.com/cgi-bin/frame?t=advanced/dev_tools_frame&nav=10049&token=1162030020&lang=zh_CN'
			}];
			
		}else if(content === '5') {
			var mpnews={
				media_id:'HGImvk3_jQW8fzQHYXgt_3Z7_kvMmjJ1wiOpudUrk_g'
			};
			var msgData = yield wechatApi.sendByGroup('mpnews',mpnews,0); //创建一个分组wechat
			reply = "done!";
		} else if(content === '6') {
			var semanticData=
				{
					"query":"寻龙决",
					"city":"北京",
					"category": "movies",
					"uid":message.FromUserName
				}
			var _semanticData = yield wechatApi.semantic(semanticData); //创建一个分组wechat
			reply = JSON.stringify(_semanticData);
		}

		

		this.body = reply;

	}  else {
		console.log("weixin.js 报 err");
	}
	yield next;
}