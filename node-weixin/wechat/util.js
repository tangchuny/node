'use strict'
/*
 * 解析XML
 */
var xml2js=require('xml2js');
var Promise=require('bluebird');
var tpl=require('./tpl');
//接受xml的原始数据，return一个promise对象
exports.parseXMLAsync=function(xml){
	return new Promise(function(resolve,reject){
		xml2js.parseString(xml,{trim:true},function(err,content){
			if(err) reject(err);
			else resolve(content);
		})
	})
}


//需要遍历formatMessage方法，所以单独一个function
function formatMessage(result){
	var message={};
	//遍历object里面的每个key
	if(typeof result==="object"){
		var keys=Object.keys(result);
		for(var i=0;i<keys.length;i++){
			var item=result[keys[i]];//拿到每个key的值
			var key=keys[i];
			
			if(!(item instanceof Array) || item.length===0){//如果item不是数组，或者长度为0，
				continue;//跳过继续往下执行
			}
			if(item.length===1){
				var val=item[0];
				if(typeof val=="object"){
					message[key]=formatMessage(val);
				}else{
					//把val值赋给message，放到当前的key中
					message[key] = (val || '').trim();//判断是否为空，并且去掉首尾的空格
				}
			}else{//既不是0也不是1
				message[key]=[];
				for(var j=0,k=item.length;j<k;j++){
					message[key].push(formatMessage(item[j]));
				}
			}
		}
	}
	return message;
}

//格式化方法
exports.formatMessage = formatMessage;


exports.tpl=function(content,message){
	var info={};//临时存储
	var type='text';
	var fromUserName=message.FromUserName;
	var toUserName=message.ToUserName;
	if(Array.isArray(content)){
		type="news";
	}
	
	type =content.type ||type;
	info.content= content||{};
	info.createTime=new Date().getTime();
	info.msgType=type;
	info.toUserName=fromUserName;
	info.fromUserName=toUserName;
	console.log("type:"+info.msgType);
	return tpl.compiled(info);
}
