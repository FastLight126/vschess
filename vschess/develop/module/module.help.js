// 创建帮助区域
fn.createHelp = function(){
	var _this = this;
	this.helpArea = $('<div class="vschess-help-area"></div>');
	this.helpArea.html(this.options.help);
	this.DOM.append(this.helpArea);
	this.helpAreaClose = $('<input type="button" class="vschess-help-close" value="关闭" />');
	this.helpAreaClose.bind(this.options.click, function(){ _this.hideHelpArea(); });
	this.helpArea.append(this.helpAreaClose);
	return this;
};

// 显示帮助区域
fn.showHelpArea = function(){
	this.helpArea.addClass("vschess-help-show");
	return this;
};

// 隐藏帮助区域
fn.hideHelpArea = function(){
	this.helpArea.removeClass("vschess-help-show");
	return this;
};
