// 创建象棋组件，兼容两种创建模式：实例模式和方法模式
vs.load = function(selector, options){
	// 实例模式下，每次运行时都只会为指定选择器中第一个未创建棋盘的 DOM 元素创建棋盘，若该选择器下有多个 DOM 元素，则需要多次运行
	// 实例模式使用举例：var chess = new vschess.load(".vschess");，返回一个棋盘对象
	if (this instanceof vs.load) {
		var _this = this;
		this.options = $.extend(true, {}, vs.defaultOptions, options);
		this._ = { nodeLength: 0 };
		vs.init(this.options);
		this.originalDOM = $(selector).not(".vschess-loaded, .vschess-original-dom").first();
		this.DOM = this.originalDOM.clone();
		this.originalDOM.after(this.DOM).addClass("vschess-original-dom");
		this.createLoading(selector);

		var waitCSS = setInterval(function(){
			if (vs.globalLoaded && vs.layoutLoaded[_this.options.layout] && vs.styleLoaded[_this.options.style]) {
				clearInterval(waitCSS);
				_this.createBoard();
				_this.initData();
				typeof _this["callback_loadFinish"] === "function" && _this["callback_loadFinish"]();
			}
		}, vs.threadTimeout);

		return this;
	}

	// 方法模式下，只需运行一次，便可为该选择器下所有元素创建棋盘
	// 方法模式使用举例：var chess = vschess.load(".vschess");，返回一个包含所有棋盘对象的数组
	// 该数组可以直接调用属于每个棋盘的方法，程序将自动为所有棋盘应用此方法
	// 例如：chess.setBoardByStep(3);，将所有棋盘设置为第四个局面（越界自动修正），返回包含所有棋盘的数组，即数组本身
	// 再如：chess.isR(5);，检查所有棋盘的 index 为 5 的棋子是否为红方棋子，返回 [true, false, ......]，返回的数组长度即为棋盘数量
	else {
		var chessList = [];

		$(selector).not(".vschess-loaded, .vschess-original-dom").each(function(){
			chessList.push(new vs.load(this, options));
		});

		$.each(vs.load.prototype, function(name){
			chessList[name] = function(){
				var result = [];

				for (var i = 0; i < this.length; ++i) {
					result.push(vs.load.prototype[name].apply(this[i], arguments));
				}

				name === "toString" && (result = result.toString());
				return result;
			};
		});

		return chessList;
	}
};

// 创建棋盘界面
fn.createBoard = function(){
	var _this = this;
	this.DOM.children(".vschess-loading").remove();
	this.bindDrag();

	// 标题
	this.title = $('<div class="vschess-title"></div>');
	this.DOM.append(this.title);

	// 棋盘
	this.board = $('<div class="vschess-board"></div>');
	this.DOM.append(this.board);
	this.board.append(new Array(91).join('<div class="vschess-piece"><span></span></div>'));
	this.piece = this.board.children(".vschess-piece");
	this.board.append('<div class="vschess-piece-animate"><span></span></div>');
	this.animatePiece = this.board.children(".vschess-piece-animate");
	this.pieceClick();
	this.initPieceRotateDeg();

	// 其他组件
    this.createLocalDownloadLink();
    this.createChangeSelectList();
    this.createMoveSelectList();
    this.createCopyTextarea();
    this.createColumnIndex();
    this.createControlBar();
    this.createMessageBox();
    this.createGuessArrow();
    this.createFormatBar();
    this.createMobileTag();
    this.createTab();
    this.interval = { time: 0, tag: 0, run: setInterval(function(){ _this.intervalCallback(); }, 100) };
    this.chessId  = vs.chessList.length;

	window.addEventListener("resize", function(){ _this.resetDPR(); }, false);
	vs.chessList.push(this);
	return this;
};

// 填充初始数据
fn.initData = function(){
	this.refreshColumnIndex();
	this.setSaved(true);
    this.showTab(this.options.defaultTab);
	this.initCallback();
	this.initArguments();
	this.initStart();
	return this;
};

// 初始化参数
fn.initArguments = function(){
	this.setBanRepeatLongThreat	(this.options.banRepeatLongThreat	);
	this.setBanRepeatLongKill	(this.options.banRepeatLongKill		);
	this.setQuickStepOffset		(this.options.quickStepOffset		);
	this.setClickResponse		(this.options.clickResponse			);
	this.setAnimationTime		(this.options.animationTime			);
	this.setPieceRotate			(this.options.pieceRotate			);
	this.setIllegalTips			(this.options.illegalTips			);
	this.setMoveFormat			(this.options.moveFormat			);
	this.setSpeakMove			(this.options.speakMove				);
	this.setMoveTips			(this.options.moveTips				);
	this.setSaveTips			(this.options.saveTips				);
	this.setPlayGap				(this.options.playGap				);
	this.setVolume				(this.options.volume				);
	this.setSound				(this.options.sound					);
	return this;
};

// 创建加载界面
fn.createLoading = function(selector){
	this.chessData = this.options.chessData === false ? this.DOM.html() : this.options.chessData;
	this.DOM.html('<div class="vschess-loading">棋盘加载中，请稍候。</div>');
	this.DOM.addClass("vschess-loaded vschess-style-" + this.options.style + " vschess-layout-" + this.options.layout);
	this.DOM.attr("data-vschess-dpr", vs.dpr);
	return this;
};

// 初始化起始局面
fn.initStart = function(){
	this.setNode(vs.dataToNode(this.chessData, this.options.parseType));
	this.rebuildSituation();
	this.setTurn		 (this.options.turn);
	this.setBoardByStep	 (this.options.currentStep);
	this.setExportFormat ("PGN_Chinese");
	return this;
};

// 初始化回调列表
fn.initCallback = function(){
	for (var i = 0; i < vs.callbackList.length; ++i) {
		this["callback_" + vs.callbackList[i]] = this.options[vs.callbackList[i]] || function(){};
	}

	return this;
};

// 自动播放组件
fn.intervalCallback = function(){
	if (!this.interval.time || ++this.interval.tag % this.interval.time) {
		return false;
	}

	var _this = this;
	this.animateToNext(this.getAnimationTime(), function(){ _this.getCurrentStep() >= _this.lastSituationIndex() && _this.pause(); });
	this.interval.tag = 0;
	return this;
};

// 卸载棋盘，即将对应的 DOM 恢复原状
fn.unload = function(){
	this.DOM.remove();
	this.originalDOM.removeClass("vschess-original-dom");
	window.removeEventListener("resize", this.resetDPR, false);
	return this;
};

// 创建列号
fn.createColumnIndex = function(){
	var columnText = this.options.ChineseChar.Number.split("");
	this.columnIndexR = $('<div class="vschess-column-index"></div>');
	this.columnIndexB = $('<div class="vschess-column-index"></div>');
	this.DOM.append(this.columnIndexR);
	this.DOM.append(this.columnIndexB);

	for (var i = 0; i < 9; ++i) {
		this.columnIndexR.append('<div class="vschess-column-index-item">' + columnText[i    ] + '</div>');
		this.columnIndexB.append('<div class="vschess-column-index-item">' + columnText[i + 9] + '</div>');
	}

	return this;
};

// 重置 DPR
fn.resetDPR = function(){
	vs.dpr = window.devicePixelRatio || 1;
	$(this.DOM).attr("data-vschess-dpr", vs.dpr);
	return this;
};
