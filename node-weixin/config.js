'use strict'

var path=require('path');
var util=require('./libs/util');
var wechat_file=path.join(__dirname,'./config/wechat.txt');
var wechat_ticket_file=path.join(__dirname,'./config/wechat_ticket.txt');
var config = {
	wechat:{
		appId:'wxde2c1e506814f8f6',
		appSecret:'21abcd7e21da96e372fe1428a14efa3a',
		token:'weixinToken123',
		getAccessToken:function(){//票据的存取操作
			return util.readFileAsync(wechat_file);
		},
		saveAccessToken:function(data){
			data=JSON.stringify(data);
			return util.writeFileAsync(wechat_file,data);
		},
		getTicket:function(){//票据的存取操作
			return util.readFileAsync(wechat_ticket_file);
		},
		saveTicket:function(data){
			data=JSON.stringify(data);
			return util.writeFileAsync(wechat_ticket_file,data);
		}
	}
}

module.exports=config
