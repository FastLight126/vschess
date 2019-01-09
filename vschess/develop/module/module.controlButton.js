// 播放控制器
fn.createControlBar = function(){
	var _this = this;
	this.controlBar = $('<div class="vschess-control-bar"></div>');
	this.controlBarButton = {
		first: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-first">开 局</button>'),
		prevQ: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-prevQ">快 退</button>'),
		prev : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-prev" >后 退</button>'),
		play : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-play" >播 放</button>'),
		pause: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-pause">暂 停</button>'),
		next : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-next" >前 进</button>'),
		nextQ: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-nextQ">快 进</button>'),
		last : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-last" >终 局</button>')
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
	this.formatBar = $('<form method="post" action="' + this.options.cloudApi.saveBook + '" class="vschess-format-bar"></form>');

	switch (this.getMoveFormat()) {
		case "wxf"		: var formarButton = "WXF"	; break;
		case "iccs"		: var formarButton = "ICCS"	; break;
		case "chinese"	: var formarButton = "中 文"; break;
	}

	this.formatBarButton = {
		copy		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-copy"   >复 制</button>'),
		format		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-format" >格 式</button>'),
		help		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-help"   >帮 助</button>'),
		save		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-save"   >保 存</button>'),
		chinese		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-chinese">中 文</button>'),
		wxf			: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-wxf"    >WXF</button>'),
		iccs		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-iccs"   >ICCS</button>'),
		saveFormat	: $('<input  type="hidden" class="vschess-format-bar-save-format"   name="format" value="DhtmlXQ" />'),
		saveInput	: $('<input  type="hidden" class="vschess-format-bar-save-input"    name="data" />'),
		saveFilename: $('<input  type="hidden" class="vschess-format-bar-save-filename" name="filename" />')
	};

	this.formatBarButton.format.bind(this.options.click, function(){
		_this.formatBarButton.chinese.toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .toggleClass("vschess-format-bar-button-change");
	});

	this.formatBarButton.help.bind(this.options.click, function(){
		_this.showHelpArea();
	});

	this.formatBarButton.save.bind(this.options.click, function(){
		_this.rebuildExportDhtmlXQ();
		_this.setSaved(true);

		if (vs.localDownload) {
			var UTF8Text = _this.exportData.DhtmlXQ.replace(/\n/g, "\r\n").replace(/\r\r/g, "\r");
			_this.localDownload((_this.chessInfo.title || "中国象棋") + ".txt", UTF8Text, { type: "text/plain" });
		}
		else {
			_this.formatBarButton.saveInput   .val(_this.exportData.DhtmlXQ);
			_this.formatBarButton.saveFilename.val(_this.chessInfo .title  );
			_this.formatBar.trigger("submit");
		}
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
		_this.copy(_this.getCurrentFen(), function(){ _this.showMessage("局面复制成功，您可以直接在象棋软件中粘贴使用！"); });
	});

	this.DOM.append(this.formatBar);
	return this;
};

// 设置快进快退偏移量
fn.setQuickStepOffset = function(quickStepOffset){
	this._.quickStepOffset = vs.limit(quickStepOffset, 1, Infinity);
	this.refreshHelp();
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
