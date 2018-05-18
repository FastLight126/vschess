// IE6 兼容，棋子 PNG 图片透明，如果需要自定义棋子图片路径，请参考官方文档
vs.IE6Compatible_setPieceTransparent = function(options){
	if (!window.ActiveXObject || window.XMLHttpRequest || options.IE6Compatible_CustomPieceUrl) {
		return this;
	}

	var cssRule = 'filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled="true", sizingMethod="scale", src="#"); background:none;';
	var sheet = document.createStyleSheet();

	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-S"     , cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/nr.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-s"     , cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/ns.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-R span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/rr.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-N span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/rn.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-B span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/rb.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-A span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/ra.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-K span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/rk.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-C span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/rc.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-P span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/rp.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-r span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/br.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-n span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/bn.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-b span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/bb.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-a span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/ba.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-k span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/bk.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-c span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/bc.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-p span", cssRule.replace("#", vs.defaultPath + 'style/' + options.style + "/bp.png"));

	return this;
};
