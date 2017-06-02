'use strict'
/*
 * 处理获取Token的逻辑方法
 */
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var util = require('./util');
var fs = require('fs');
var _=require('lodash');
var api=require('./api');

var prefix = "https://api.weixin.qq.com/cgi-bin/";
var semanticUrl='https://api.weixin.qq.com/semantic/semproxy/search?';//语意接口
var api = {
	semanticUrl:semanticUrl,
	accecssToken: prefix + 'token?grant_type=client_credential',
	temporary:{
		upload: prefix + 'media/upload?',//新增临时素材
		fetch:prefix+'media/get?'//获取临时素材
	},
	permanent:{
		upload: prefix + 'material/add_material?',
		uploadPic: prefix + 'material/add_material?',
		uploadNews: prefix + 'media/uploading?',
		fetch:prefix+'material/get_material?',//获取永久素材
		del:prefix+'material/del_material?',  //删除永久素材
		update:prefix+'material/update_news?',
		count:prefix+'material/get_materialcount?',
		batch:prefix+'material/batchget_material?'//获取素材列表
	},
	group:{
		create:prefix+'groups/create?',
		fetch:prefix+'groups/get?',
		check:prefix+'groups/getid?',
		update:prefix+'groups/update?',
		move:prefix+'groups/members/update?',//移动用户分组
		batchupdate:prefix+'groups/members/batchupdate?',//
		del:prefix+'groups/delete?'
	},
	user:{
		remark:prefix+'user/info/updateremark?',
		fetch:prefix+'user/info?',
		fetchBatch:prefix+'user/info/batchget?',
		list:prefix+'user/get?'
	},
	mass:{//群发消息
		group:prefix+'message/mass/sendall?'
	},
	menu:{
		create:prefix+'menu/create?',
		get:prefix+'menu/get?',
		del:prefix+'menu/delete?',
		current:prefix+'get_current_selfmenu_info?'
	},
	ticket:{//获取票据，方法和获取token的方法相似
		get:prefix+'ticket/getticket?'
	}
	
}
//定义一个函数，用来生成实例，
//读取票据信息，判断是否过期
function Wechat(opts) {
	var that = this;
	this.appId = opts.appId;
	this.appSecret = opts.appSecret;
	this.getAccessToken = opts.getAccessToken; //获取token
	this.saveAccessToken = opts.saveAccessToken; //保存token
	
	this.getTicket = opts.getTicket; //获取票据
	this.saveTicket = opts.saveTicket; //保存票据

	this.fetchAccessToken();
}

//获取token
Wechat.prototype.fetchAccessToken = function(data) {
	
	var that = this;
	if(this.access_token && this.expires_in) {
		if(this.isValidAccessToken(this)) {
			return Promise.resolve(this);
		}
	}

	return this.getAccessToken()
		.then(function(data) {
			try {
				data = JSON.parse(data);
			} catch(e) {
				return that.updateAccessToken();
			}
			if(that.isValidAccessToken(data)) { //判断票据是否有效
				return Promise.resolve(data); //如果合法，把data传下去,需要return
			} else {
				return that.updateAccessToken(); //如果无效也需要更新票据
			}
		})
		.then(function(data) {
			that.access_token = data.access_token;
			that.expires_in = data.expires_in;
			that.saveAccessToken(data); //调用自身的saveAccessToken方法
			return Promise.resolve(data);
		})
}



//在wechat的原形链上添加方法

Wechat.prototype.isValidAccessToken = function(data) {

	if(!data || !data.access_token || !data.expires_in) {
		return false;
	}
	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = (new Date().getTime());
	if(now < expires_in) {
		return true;
	} else {
		return false;
	}

}

Wechat.prototype.updateAccessToken = function() {
	var appId = this.appId;
	var appSecret = this.appSecret;
	var url = api.accecssToken + '&appid=' + appId + '&secret=' + appSecret;
	var options = {
		method: 'GET',
		url: url
	};
	//返回一个promise实例，希望数据向下传递,两个参数判断是成功还是失败。resolve是返回成功，reject是失败
	return new Promise(function(resolve, reject) {
		request(options, function(err, res, body) {
			if(res) {
				//返回的是json数据
				var data = JSON.parse(body); //
				var now = (new Date().getTime()); //拿到当前时间
				var expires_in = now;
				var expires_in = now + (data.expires_in - 20) * 1000; //生成一个新的时间，票据提前二十秒刷新，考虑到网络延迟
				data.expires_in = expires_in; //把新的票据赋给data对象
				resolve(data); //往下传递
			} else {
				reject(err);
			}
		});

		/*request({url:url,json:true}).then(function(response){
			console.log("url========"+url);
			//返回的是json数据
			console.log("data==="+response);
			var data = response.body;//下标是1就是第二个结果,此处用的应该是body
			var now=(new Date().getTime());//拿到当前时间
			var expires_in = now;
			var expires_in=now+(data.expires_in-20)*1000;//生成一个新的时间，票据提前二十秒刷新，考虑到网络延迟
			data.expires_in=expires_in;//把新的票据赋给data对象
		})
		resolve(data);//往下传递*/
	})

}



//获取票据
Wechat.prototype.fetchTicket = function(access_token) {
	var that = this;
	return this.getTicket()
		.then(function(data) {
			try {
				data = JSON.parse(data);
			} catch(e) {
				return that.updateTicket(access_token);
			}
			if(that.isValidTicket(data)) { //判断票据是否有效
				return Promise.resolve(data); //如果合法，把data传下去,需要return
			} else {
				return that.updateTicket(access_token); //如果无效也需要更新票据
			}
		})
		.then(function(data) {
			that.saveTicket(data); //调用自身的saveAccessToken方法
			return Promise.resolve(data);
		})
}
//更新票据
Wechat.prototype.updateTicket = function(access_token) {
	var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi';
	console.log(url);
	var options = {
		method: 'GET',
		url: url
	};
	//返回一个promise实例，希望数据向下传递,两个参数判断是成功还是失败。resolve是返回成功，reject是失败
	return new Promise(function(resolve, reject) {
		request({url:url,json:true}).then(function(response){
				//返回的是json数据
				var data = response.body; //
				var now = (new Date().getTime()); //拿到当前时间
				var expires_in = now + (data.expires_in - 20) * 1000; //生成一个新的时间，票据提前二十秒刷新，考虑到网络延迟
				data.expires_in = expires_in; //把新的票据赋给data对象
				resolve(data); //往下传递
		});

	})

}
//票据是否过期
Wechat.prototype.isValidTicket = function(data) {

	if(!data || !data.ticket || !data.expires_in) {
		return false;
	}
	var ticket = data.ticket;
	var expires_in = data.expires_in;
	var now = (new Date().getTime());
	if(ticket && now < expires_in) {//如果ticket有，并且没有过期
		return true;
	} else {
		return false;
	}

}

//素材上传
//material如果是图文的时候传进来的是一个数组，如果是视频传进来的就是一个路径
Wechat.prototype.uploadMaterial = function(type, material,permanent) {
	var that = this;
	var form ={};
	var uploadUrl= api.temporary.upload;//默认是临时素材
	if(permanent){
		uploadUrl=api.permanent.upload;
		_.extend(form,permanent);//form对象加多一个permanent参数
	}
	if(type==='pic'){
		uploadUrl=api.permanent.uploadPic;
	}
	if(type=='news'){
		uploadUrl=api.permanent.uploadNews;
		form=material;
	}else{
		form.media=fs.createReadStream(material);
	}

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) { //拿到全局票据请求Url地址
				var url = uploadUrl + '&access_token=' + data.access_token;
				//如果不是永久的，url追加type
				if(!permanent){
					url +='&type=' + type;
				}else{
					form.access_token=data.access_token;
				}
				//定义上传参数
				var options = {
					method: 'POST',
					url: url,
					JSON:true,
				};
				if(type==='news'){
					options.body=form
				}else{
					options.formData=form;	
				}
				console.log(form);
				request({
						method: 'POST',
						url: url,
						formData: form,
						json: true
				}).then(function(response) {
						var _data = response.body
						if(_data) {
							resolve(_data);
							console.log(_data)
						} else {
							throw new Error('Upload material fails')
						}
					})
					.catch(function(err) {
						reject(err)
					})
			})

	})

}

//群发
Wechat.prototype.sendByGroup = function(type,message,groupId) {
	var that = this;
	var msg={
		filter:{},
		msgtype:type
	};
	msg[type]=message;//msg的type的值作为message的名称
	//如果没有传入groupid则说明是群发给所有的用户
	if(!groupId){
		msg.filter.is_to_all=true;
	}else{
		msg.filter={
			is_to_all:true,
			group_id:groupId
		};
	}
	
	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.mass.group + '&access_token=' + data.access_token;
				request({
						method: 'POST',
						url: url,
						body:msg,
						json: true
				}).then(function(response) {
						var _data = response.body;
						if(_data) {
							resolve(_data);
						} else {
							throw new Error('sendByGroup fails')
						}
					})
					.catch(function(err) {
						reject(err)
					})
			})
	})

}
//创建菜单
Wechat.prototype.createMenu = function(menu) {
	var that = this;
	//console.log(menu);
	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.menu.create + 'access_token=' + data.access_token;
				request({
						method: 'POST',
						url: url,
						body: menu,
						json: true
				}).then(function(response) {
						var _data = response.body;
						if(_data) {
							resolve(_data);
						} else {
							throw new Error('createMenu fails')
						}
					})
					.catch(function(err) {
						reject(err)
					})
			})
	})
}
//获取菜单
Wechat.prototype.getMenu = function(openId,remark) {
	var that = this;
	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.menu.get + 'access_token=' + data.access_token;
				request({
						url: url,
						json: true
				}).then(function(response) {
						var _data = response.body
						if(_data) {
							resolve(_data);
						} else {
							throw new Error('getMenu fails')
						}
					})
					.catch(function(err) {
						reject(err)
					})
			})
	})
}

//删除菜单
Wechat.prototype.deleteMenu = function() {
	var that = this;
	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.menu.del + 'access_token=' + data.access_token;
				request({method: 'GET',url: url, json: true}).then(function(response){
						var _data = response.body;
						if(_data) {
							console.log(_data)
							resolve(_data);
						} else {
							throw new Error('deleteMenu fails')
						}
					})
					.catch(function(err) {
						reject(err)
					})
			})
	})
}

//自定义菜单
Wechat.prototype.getCurrentMenu = function() {
	var that = this;
	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.menu.current + 'access_token=' + data.access_token;
				request({
						url: url,
						json: true
				}).then(function(response) {
						var _data = response.body
						if(_data) {
							resolve(_data);
							console.log(_data)
						} else {
							throw new Error('getCurrentMenu fails')
						}
					})
					.catch(function(err) {
						reject(err)
					})
			})
	})
}
//语义接口,测试账号不能用，需要认证的账号
Wechat.prototype.semantic = function(semanticData) {
	console.log(semanticData);
	var that = this;
	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = api.semanticUrl + 'access_token=' + data.access_token;
				semanticData.appid=data.appId;
				request({
						method: 'POST',
						url: url,
						body: semanticData,
						json: true
				}).then(function(response) {
						var _data = response.body;
						if(_data) {
							resolve(_data);
							console.log(_data)
						} else {
							throw new Error('semantic fails')
						}
					})
					.catch(function(err) {
						reject(err)
					})
			})
	})
}

Wechat.prototype.reply = function() {
	var content = this.body; //拿到回复的内容
	var message = this.weixin;
	var xml = util.tpl(content, message);
	this.status = 200;
	this.type = 'application/xml'; //内容类型
	this.body = xml;
	console.log("xml======" + xml);
}
//把Wechat构造函数暴露出来，其他地方才能调用里面的方法
module.exports = Wechat;