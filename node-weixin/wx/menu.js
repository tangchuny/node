'use strict'

module.exports={
	 "button":[
     {	
          "name":"数据开发",
          "sub_button":[{
		      	"type":"view",
		      	"name":"angular dev",
		      	"url":"http://192.168.2.14/angular/pingan/"
	        },{
		      	"type":"view",
		      	"name":"海牛财经",
		      	"url":"http://www.tangcy.cn:8080/"
	        }
          ]
      },
      {
           "name":"菜单",
           "sub_button":[
           {	
               "type":"pic_sysphoto",
               "name":"系统拍照发图",
               "key": "rselfmenu_1_0"
            },
            {
               "type":"view",
               "name":"视频",
               "url":"http://v.qq.com/"
            },
            {
               "type":"location_select",
               "name":"发送位置",
               "key":"rselfmenu_1_1"
            },{
               "type":"pic_weixin",
               "name":"微信相册发图",
               "key":"rselfmenu_1_2"
            }]
       }, {	
          "type":"scancode_waitmsg",
          "name":"韦枫坑货",
          "key":"rselfmenu_0_3"
      }]
}