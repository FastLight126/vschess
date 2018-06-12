// 检查 Zepto 或 jQuery 环境
if (typeof Zepto !== "undefined") {
	var $ = Zepto;
}
else if (typeof jQuery !== "undefined") {
	var $ = jQuery;
}
else {
	// 未引入 Zepto 或 jQuery，程序将自动加载 Zepto 或 jQuery
	var currentElement = document.documentElement;

	while (currentElement.tagName.toLowerCase() !== "script") {
		currentElement = currentElement.lastChild;
	}

	window.ActiveXObject?
	document.write('<script type="text/javascript" src="https://www.xiaxiangqi.com/static/js/jquery.js"></script>'):
	document.write('<script type="text/javascript" src="https://www.xiaxiangqi.com/static/js/zepto.js"></script>');
	document.write('<script type="text/javascript" src="' + currentElement.src + '"></script>');
	return false;
}
