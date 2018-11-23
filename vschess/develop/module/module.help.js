// 创建帮助区域
fn.createHelp = function(){
	if (this._.helpAreaCreated) {
		return this;
	}

	this._.helpAreaCreated = true;
	var _this = this;
	var helpDetail = this.options.help.replace(/#quickStepOffsetRound#/g, this._.quickStepOffset / 2).replace(/#quickStepOffset#/g, this._.quickStepOffset);
	this.helpArea = $('<div class="vschess-help-area"></div>');
	this.helpArea.html('<div class="vschess-help-area-detail">' + helpDetail + '</div>');
	this.DOM.append(this.helpArea);
	this.helpAreaClose = $('<button type="button" class="vschess-button vschess-help-close">关 闭</button>');
	this.helpAreaClose.bind(this.options.click, function(){ _this.hideHelpArea(); });
	this.helpArea.append(this.helpAreaClose);
	return this;
};

// 刷新帮助信息
fn.refreshHelp = function(){
	if (!this._.helpAreaCreated) {
		return this;
	}

	var helpDetail = this.options.help.replace(/#quickStepOffsetRound#/g, this._.quickStepOffset / 2).replace(/#quickStepOffset#/g, this._.quickStepOffset);
	this.helpArea.children(".vschess-help-area-detail").html(helpDetail);
	return this;
};

// 显示帮助区域
fn.showHelpArea = function(){
	this.createHelp();
	this.helpArea.addClass("vschess-help-show");
	return this;
};

// 隐藏帮助区域
fn.hideHelpArea = function(){
	if (!this._.helpAreaCreated) {
		return this;
	}

	this.helpArea.removeClass("vschess-help-show");
	return this;
};
