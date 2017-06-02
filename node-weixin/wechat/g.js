'use strict'
var sha1		= require("sha1");
var getRawBody 	= require("raw-body");
var util 		= require("./util");
var Wechat		= require("./wechat");//构造函数定义需要大写第一个字母
var tpl			= require("./tpl");

module.exports=function(opts,handler){
	var wechat =new Wechat(opts);//注释次行代码调试xml数据

	return function *(next){
		console.log(this.query);
		var that = this;
		var token=opts.token
		var signature=this.query.signature
		var nonce=this.query.nonce
		var timestamp=this.query.timestamp
		var echostr=this.query.echostr
		//
		var str=[token,timestamp,nonce].sort().join('');
		var sha=sha1(str);
		
		//判断是否是请求的方法
		if(this.method ==="GET"){//如果是GET方法，则严重签名
			if(sha===signature){
				this.body=echostr+'';
			}else{//不相等输出wrong
				this.body="wrong";
			}
		}else if(this.method ==="POST"){//如果是POST方法，签名不符号的话直接输出wrong，并返回false;
			if(sha!=signature){
				this.body="wrong";
				return false;
			}
			//通过yeild关键字拿到post请求过来的原始xml数据
			var data=yield getRawBody(this.req,{
				lenght:this.lenght,
				limit:"1mb",
				encoding:this.charset
			});
			
			//工具包util 的parseXMLAsync 解析XML数据
			var content = yield util.parseXMLAsync(data);
			//console.log(content);
			//格式方法
			
			var message =util.formatMessage(content.xml);
			console.log(message);
				
			this.weixin=message;//拿到的message挂载到weixin上
			//交给业务层处理
			yield handler.call(this,next);//next传递给handler
			wechat.reply.call(this);//wechat中需要定义reply方法
			
		}
		
		

	}
}