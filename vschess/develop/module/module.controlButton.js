// 播放控制器
fn.createControlBar = function(){
	var _this = this;
	this.controlBar = $('<div class="vschess-control-bar"></div>');
	this.controlBarButton = {
		first: $('<input type="button" class="vschess-control-bar-button vschess-control-bar-first" value="开 局" />'),
		prevQ: $('<input type="button" class="vschess-control-bar-button vschess-control-bar-prevQ" value="快 退" />'),
		prev : $('<input type="button" class="vschess-control-bar-button vschess-control-bar-prev"  value="后 退" />'),
		play : $('<input type="button" class="vschess-control-bar-button vschess-control-bar-play"  value="播 放" />'),
		pause: $('<input type="button" class="vschess-control-bar-button vschess-control-bar-pause" value="暂 停" />'),
		next : $('<input type="button" class="vschess-control-bar-button vschess-control-bar-next"  value="前 进" />'),
		nextQ: $('<input type="button" class="vschess-control-bar-button vschess-control-bar-nextQ" value="快 进" />'),
		last : $('<input type="button" class="vschess-control-bar-button vschess-control-bar-last"  value="终 局" />')
	};

	this.controlBarButton.first.bind(this.options.click, function(){ _this.pause(false).setBoardByStep(0); });
	this.controlBarButton.last .bind(this.options.click, function(){ _this.pause(false).setBoardByStep(_this.lastSituationIndex()); });
	this.controlBarButton.prev .bind(this.options.click, function(){ _this.pause(false).setBoardByOffset(-1); });
	this.controlBarButton.next .bind(this.options.click, function(){ _this.pause(false).animateToNext(); });
	this.controlBarButton.prevQ.bind(this.options.click, function(){ _this.pause(false).setBoardByOffset(-_this.getQuickStepOffset()); });
	this.controlBarButton.nextQ.bind(this.options.click, function(){ _this.pause(false).setBoardByOffset( _this.getQuickStepOffset()); });
	this.controlBarButton.play .bind(this.options.click, function(){ _this.lastSituationIndex() && _this.play(); });
	this.controlBarButton.pause.bind(this.options.click, function(){ _this.pause(); });

	for (var i in this.controlBarButton) {
		this.controlBar.append(this.controlBarButton[i]);
	}

	this.controlBarButton.play.addClass("vschess-control-bar-button-current");
	this.DOM.append(this.controlBar);
	return this;
};

// 自动播放
fn.play = function(){
	this.getCurrentStep() >= this.lastSituationIndex() && this.setBoardByStep(0);
	this.interval.time = this.getPlayGap();
	this.controlBarButton.play .removeClass("vschess-control-bar-button-current");
	this.controlBarButton.pause.   addClass("vschess-control-bar-button-current");
	return this;
};

// 暂停播放
fn.pause = function(playSound){
	this.interval.time = 0;
	this.controlBarButton.pause.removeClass("vschess-control-bar-button-current");
	this.controlBarButton.play .   addClass("vschess-control-bar-button-current");
	this.animating && this.stopAnimate(playSound);
	return this;
};

// 格式控制器
fn.createFormatBar = function(){
	var _this = this;
	this.formatBar = $('<form method="post" action="' + this.options.cloudApi.savebook + '" class="vschess-format-bar"></form>');

	switch (this.getMoveFormat()) {
		case "wxf"		: var formarButton = "WXF"	; break;
		case "iccs"		: var formarButton = "ICCS"	; break;
		case "chinese"	: var formarButton = "中 文"	; break;
	}

	this.formatBarButton = {
		copy		: $('<input type="button" class="vschess-format-bar-button vschess-format-bar-copy" value="复 制" />'),
		format		: $('<input type="button" class="vschess-format-bar-button vschess-format-bar-format" value="格 式" />'),
		help		: $('<input type="button" class="vschess-format-bar-button vschess-format-bar-help" value="帮 助" />'),
		save		: $('<input type="submit" class="vschess-format-bar-button vschess-format-bar-save" value="保 存" />'),
		chinese		: $('<input type="button" class="vschess-format-bar-button vschess-format-bar-chinese" value="中 文" />'),
		wxf			: $('<input type="button" class="vschess-format-bar-button vschess-format-bar-wxf" value="WXF" />'),
		iccs		: $('<input type="button" class="vschess-format-bar-button vschess-format-bar-iccs" value="ICCS" />'),
		saveFormat	: $('<input type="hidden" name="format" value="DhtmlXQ" class="vschess-format-bar-save-format" />'),
		saveInput	: $('<input type="text" name="data" class="vschess-format-bar-save-input" />')
	};

	this.formatBarButton.format.bind(this.options.click, function(){
		_this.formatBarButton.chinese.toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .toggleClass("vschess-format-bar-button-change");
	});

	this.formatBarButton.help.bind(this.options.click, function(){
		_this.showHelpArea();
	});

	this.formatBar.bind("submit", function(){
		_this.rebuildExportDhtmlXQ();
		_this.formatBarButton.saveInput.val(_this.exportData.DhtmlXQ);
		_this.setSaved(true);
	});

	this.formatBarButton.chinese.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("chinese").refreshMoveListNode();
	});

	this.formatBarButton.wxf.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("wxf").refreshMoveListNode();
	});

	this.formatBarButton.iccs.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("iccs").refreshMoveListNode();
	});

	for (var i in this.formatBarButton) {
		this.formatBar.append(this.formatBarButton[i]);
	}

	this.formatBarButton.copy.bind(this.options.click, function(){
		if (document.execCommand && document.queryCommandSupported && document.queryCommandSupported('copy')) {
			_this.formatBarButton.saveInput.val(_this.getCurrentFen());
			_this.formatBarButton.saveInput[0].select();

			if (document.execCommand("copy")) {
				_this.copyFenFinish();
			}
			else {
				prompt("请按 Ctrl+C 复制：", _this.getCurrentFen());
			}
		}
		else if (window.clipboardData) {
			if (window.clipboardData.setData("Text", _this.getCurrentFen())) {
				_this.copyFenFinish();
			}
			else {
				prompt("请按 Ctrl+C 复制：", _this.getCurrentFen());
			}
		}
		else {
			prompt("请按 Ctrl+C 复制：", _this.getCurrentFen());
		}
	});

	this.DOM.append(this.formatBar);
	return this.createCopyFinishTips().createHelp();
};

fn.createCopyFinishTips = function(){
	this.copyFinishTips = $('<div class="vschess-copy-finish">局面复制成功，您可以直接在象棋软件中粘贴使用！</div>');
	this.DOM.append(this.copyFinishTips);
	return this;
};

// 复制成功提示
fn.copyFenFinish = function(){
	var _this = this;
	this.copyFinishTips.addClass("vschess-copy-finish-show");
	setTimeout(function(){ _this.copyFinishTips.removeClass("vschess-copy-finish-show"); }, 1500);
	return this;
};

// 设置快进快退偏移量
fn.setQuickStepOffset = function(quickStepOffset){
	this._.quickStepOffset = vs.limit(quickStepOffset, 1, Infinity);
	return this;
};

// 取得快进快退偏移量
fn.getQuickStepOffset = function(){
	return this._.quickStepOffset;
};

// 设置自动播放时间间隔
fn.setPlayGap = function(playGap){
	this._.playGap = vs.limit(playGap, 1, Infinity);
	this.setConfigItemValue("playGap", this._.playGap);
	this.interval && this.interval.time && (this.interval.time = this.getPlayGap());
	return this;
};

// 取得自动播放时间间隔
fn.getPlayGap = function(){
	return this._.playGap;
};
