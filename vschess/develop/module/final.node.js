// 字符串删除两端空白字符
vs.trim = function(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
};

// 程序转换为字符串信息
vs.toString = function(){
	return "微思象棋播放器 V" + vs.version + " https://www.xiaxiangqi.com/vschess/ Copyright © 2009-#YEAR# Margin.Top 版权所有";
};

// 导出到 module
module.exports = vschess;
