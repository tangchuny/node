'use strict'
var fs=require('fs');
var Promise=require('bluebird');

//用exports对外暴露一个readFileAsync异步的方法
//参数是fpath和编码encoding

//读取文件
exports.readFileAsync = function(fpath,encoding){
	return new Promise(function(reslove,reject){
		fs.readFile(fpath, encoding, function(err,content){
			if(err)reject(err); 
			else reslove(content);
		});
	})
}
//写文件,把content当做第二个参数传
exports.writeFileAsync =function(fpath,content){
	return new Promise(function(reslove,reject){
		fs.writeFile(fpath, content,function(err){
			if(err) reject(err); 
			else reslove();
		});
	})
}