'use strict'
var Koa=require('koa');
var path=require('path');
var wechat=require('./wechat/g');
var util=require('./libs/util');
var config=require('./config');
var reply=require('./wx/reply');

var Wechat=require('./wechat/wechat');
var app=new Koa();
var ejs=require('ejs');
var crypto=require('crypto');
var heredoc=require('heredoc')
var tpl=heredoc(function(){/*
	<!DOCTYPE html>
	<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
			<title>搜电影</title>
		</head>
		<body>
			<h1>点击标题，开始录音翻译</h1>
			<p id='title'></p>
			<div id='poster'></div>
			<div id='year'></div>
			<div id='director'></div>
			<script src="http://zeptojs.com/zepto-docs.min.js"></script>
			<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
			<script>
			wx.config({
			    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			    appId: 'wxde2c1e506814f8f6', // 必填，公众号的唯一标识
			    timestamp: '<%= timestamp%>', // 必填，生成签名的时间戳
			    nonceStr: '<%= noncestr%>', // 必填，生成签名的随机串
			    signature: '<%= signature%>',// 必填，签名，见附录1
			    jsApiList: [
				    'startRecord',
					'stopRecord',
					'onVoiceRecordEnd',
					'translateVoice'
			    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
			//判断当前客户端版本是否支持指定JS接口
			wx.ready(function(){
				var isRecording=false;
				$('h1').on('tap',function(){
					if(!isRecording){
						isRecording=true;//開始錄製的時候是true
						wx.startRecord({
						    cancel: function (res) {
						        window.alert('取消了就不能用了哦，親！')
						    }
						});
						return;
					}
					isRecording=false;
					wx.stopRecord({
					    success: function (res) {
					        var localId = res.localId;
					        wx.translateVoice({
							    localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
							    isShowProgressTips: 1, // 默认为1，显示进度提示
							    success: function (res) {
							        var result = res.translateResult; // 语音识别的结果
							         window.alert(1);
							        window.alert(result);
							    	$.ajax({
							    		type:'GET',
							    		url:'https://api.douban.com/v2/movie/search?q='+result,
							    		dataType:'jsonp',
							    		jsonp:callback,
							    		success:function(data){
							    			window.alert(data);
							    			var subject=data.subjects[0];
							    			window.alert(subject);
							    			$('#director').html(subject.director[0].name);
							    			$('#poster').html('<img src="'+subject.images.large+'"/>');
							    			$('#title').html(subject.title);
							    			$('#year').html(subject.year);
							    		},
							    		error:function(xhr){
							    			window.alert(xhr.statusText);
							    		}
							 
							    	})
							    }
							});
					    }
					});
				})
			});
			</script> 
		</body>
	</html>
*/});
//创建随机字符串和时间戳
var createNonce=function (){
	return Math.random().toString(36).substr(2,15);
}
//时间戳，返回是一个字符串
var createTimestamp=function (){
	return parseInt(new Date().getTime() / 1000)+'';//
}

var _sign=function (noncestr,ticket,timestamp,url) {
	var params=[
		'noncestr='+noncestr,
		'jsapi_ticket='+ticket,
		'timestamp='+timestamp,
		'url='+url
	];
	//console.log(url);
	var str=params.sort().join('&');//字典排序
	var shasum=crypto.createHash('sha1');
	shasum.update(str);//调用update方法
	return shasum.digest('hex');
}

//签名
function sign(ticket,url){
	var noncestr=createNonce();
	var timestamp=createTimestamp();
	var signature=_sign(noncestr,ticket,timestamp,url);
	return{
		noncestr:noncestr,
		timestamp:timestamp,
		signature:signature
	}
}

app.use(function *(next){
	if(this.url.indexOf('/movie')>-1){//简单的路由，匹配到相应的地址就会返回一个html页面，访问：http://localhost:1234/movies
		//this.body='<h1>hello world!</h1>';
		var wechatApi=new Wechat(config.wechat);
		var data=yield wechatApi.fetchAccessToken();
		var access_token=data.access_token;//获取token后把token传入
		var ticketData=yield wechatApi.fetchTicket(access_token);
		var ticket=ticketData.ticket;
		var url=this.href;
		//var url=this.href.replace(':10589','');//去掉端口号
		
		var params=sign(ticket,url);
		this.body=ejs.render(tpl,params);
		return next;
	}
	yield next;
})

//传入配置参数config.wechat
app.use(wechat(config.wechat,reply.reply));

app.listen(1234);
console.log('Listening:1234');

