module.exports=function(){
	var api = {
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
	}
	
}
}
