// 棋盘对象转换为字符串信息
fn.toString = function(){
	return this.getCurrentFen();
};

// 程序转换为字符串信息
vs.toString = function(){
	return "微思象棋播放器 V" + vs.version + " https://www.xiaxiangqi.com/vschess/ Copyright © 2009-#YEAR# Margin.Top 版权所有";
};

// 将 vschess 提升为全局变量，这样外部脚本就可以调用了
typeof window.vschess === "undefined" && (window.vschess = vschess);
