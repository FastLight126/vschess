// 创建编辑局面区域
fn.createEdit = function(){
	var _this = this;
    this.editTitle = $('<div class="vschess-tab-title vschess-tab-title-edit">' + this.options.tagName.edit + '</div>');
	this.editArea  = $('<div class="vschess-tab-body vschess-tab-body-edit"></div>');
	this.tabArea.children(".vschess-tab-title-edit, .vschess-tab-body-edit").remove();
	this.tabArea.append(this.editTitle);
	this.tabArea.append(this.editArea );
	this.editTitle.bind(this.options.click, function(){ _this.showTab("edit"); });
	this.recommendStartList = this.options.recommendList;
	this.editNodeTextarea   = { val: function(){ return ""; } };
	this.createEditStartButton();
	this.createNodeStartButton();
	this.createEditOtherButton();
	this.showEditStartButton  ();

	if (this.options.cloudApi && this.options.cloudApi.startFen) {
		$.ajax({
			url: this.options.cloudApi.startFen,
			dataType: "jsonp",
			success: function(data){
				typeof data === "string" && (data = $.parseJSON(data));

				if (data.code === 0) {
					_this.recommendStartList = _this.options.recommendList.concat(data.data);
				}
				else {
				}

				typeof _this.callback_afterStartFen === "function" && _this.callback_afterStartFen();
			}
		});
	}

	return this;
};

// 创建编辑局面区域非即时加载组件
fn.createEditOtherItem = function(){
	if (this._.fenEditorCreated) {
		return this;
	}

	this._.fenEditorCreated = true;
	this.createEditEndButton();
	this.createEditCancelButton();
	this.createEditTextarea();
	this.createEditPlaceholder();
	this.createEditPieceArea();
	this.createEditStartRound();
	this.createEditStartPlayer();
	this.createEditBoard();
	this.createRecommendList();
	this.createNodeEndButton();
	this.createNodeCancelButton();
	this.createNodeEditTextarea();
	this.createNodeEditPlaceholder();
	return this;
};

// 显示编辑开始按钮
fn.showEditStartButton = function(){
	for (var i = 0; i < vs.editStartList.length; ++i) {
		if (this[vs.editStartList[i]] && typeof this[vs.editStartList[i]].addClass === "function") {
			this[vs.editStartList[i]].addClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 隐藏编辑开始按钮
fn.hideEditStartButton = function(){
	for (var i = 0; i < vs.editStartList.length; ++i) {
		if (this[vs.editStartList[i]] && typeof this[vs.editStartList[i]].removeClass === "function") {
			this[vs.editStartList[i]].removeClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 显示编辑局面组件
fn.showEditModule = function(){
	for (var i = 0; i < vs.editModuleList.length; ++i) {
		if (this[vs.editModuleList[i]] && typeof this[vs.editModuleList[i]].addClass === "function") {
			this[vs.editModuleList[i]].addClass("vschess-tab-body-edit-current");
		}
	}

    this.DOM.addClass("vschess-edit-mode");
	return this;
};

// 隐藏编辑局面组件
fn.hideEditModule = function(){
	for (var i = 0; i < vs.editModuleList.length; ++i) {
		if (this[vs.editModuleList[i]] && typeof this[vs.editModuleList[i]].removeClass === "function") {
			this[vs.editModuleList[i]].removeClass("vschess-tab-body-edit-current");
		}
	}

    this.DOM.removeClass("vschess-edit-mode");
	return this;
};

// 显示粘贴棋谱组件
fn.showNodeEditModule = function(){
	for (var i = 0; i < vs.editNodeModuleList.length; ++i) {
		if (this[vs.editNodeModuleList[i]] && typeof this[vs.editNodeModuleList[i]].addClass === "function") {
			this[vs.editNodeModuleList[i]].addClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 隐藏粘贴棋谱组件
fn.hideNodeEditModule = function(){
	for (var i = 0; i < vs.editNodeModuleList.length; ++i) {
		if (this[vs.editNodeModuleList[i]] && typeof this[vs.editNodeModuleList[i]].removeClass === "function") {
			this[vs.editNodeModuleList[i]].removeClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 创建编辑局面区域开始编辑按钮
fn.createEditStartButton = function(){
	var _this = this;
	this.editStartButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-start-button">编辑局面</button>');
	this.editStartButton.appendTo(this.editArea);
	this.editStartButton.bind(this.options.click, function(){ _this.showEditBoard(); });
	return this;
};

// 显示编辑局面界面
fn.showEditBoard = function(){
	this.showTab("edit");
	this.createEditOtherItem();
	this.pause(false);
	this.fillInRecommendList(0);
	this.hideEditStartButton();
	this.hideNodeEditModule();
	this.showEditModule();
	this.fillEditBoardByFen(this.getFenByStep(this.getCurrentStep()));
	this.fillInRecommendList(this.recommendClass[0].selectedIndex);
	this.editSelectedIndex = -99;
	this.dragPiece = null;
	return this;
};

// 创建编辑局面区域结束编辑按钮
fn.createEditEndButton = function(){
	var _this = this;
	this.editEndButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-end-button">确 定</button>');
	this.editEndButton.appendTo(this.editArea);

	this.editEndButton.bind(this.options.click, function(){
		if (!_this.confirm("确定使用新的局面吗？当前棋谱会丢失！")) {
			return false;
		}

		var fen				= vs.situationToFen(_this.editSituation);
		var fenRound		= vs.roundFen(fen);
		var errorList		= vs.checkFen(fen);
		var errorListRound	= vs.checkFen(fenRound);
		var turn = 0;

		if (errorList.length > errorListRound.length) {
			errorList = errorListRound;
			fen = fenRound;
			turn = 3;
		}

		if (errorList.length > 1) {
			var errorMsg = ["当前局面出现下列错误：\n"];

			for (var i = 0; i < errorList.length; ++i) {
				errorMsg.push(i + 1, ".", errorList[i], i === errorList.length - 1 ? "。" : "；\n");
			}

			alert(errorMsg.join(""));
		}
		else if (errorList.length > 0) {
			alert(errorList[0] + "。");
		}
		else {
			_this.hideNodeEditModule();
			_this.hideEditModule();
			_this.showEditStartButton();
			_this.editTextarea.val("");
			_this.setNode({ fen: fen, comment: "", next: [], defaultIndex: 0 });
			_this.rebuildSituation();
			_this.setBoardByStep(0);
			_this.refreshMoveSelectListNode();
			_this.chessInfo = {};
			_this.insertInfoByCurrent();
			_this.refreshInfoEditor();
			_this.rebuildExportAll();
			_this.setExportFormat();
			_this.setTurn(turn);
			_this.setSaved(true);
		}
	});

	return this;
};

// 创建编辑局面区域取消编辑按钮
fn.createEditCancelButton = function(){
	var _this = this;
	this.editCancelButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-cancel-button">取 消</button>');
	this.editCancelButton.appendTo(this.editArea);

	this.editCancelButton.bind(this.options.click, function(){
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
	});

	return this;
};

// 创建编辑局面区域输入框
fn.createEditTextarea = function(){
	var _this = this;
	var UA = navigator.userAgent.toLowerCase(), contextMenu = "长按";
	!~UA.indexOf("android") && !~UA.indexOf("iph") && !~UA.indexOf("ipad") && (contextMenu = "右键单击");
	this.editTipsText = "点击右侧的棋子可将其放置在棋盘上，" + contextMenu + "棋盘上的棋子可以将其移除。";
	this.editTips = $('<input class="vschess-tab-body-edit-tips" value="' + this.editTipsText + '" readonly="readonly" />').appendTo(this.DOM);
	this.editTextarea = $('<textarea class="vschess-tab-body-edit-textarea"></textarea>').appendTo(this.editArea);

	this.editTextarea.bind("change" , function(){
		_this.fillEditBoardByText($(this).val());
		var currentFen = vs.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	this.editTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode === 13 && _this.editTextarea.blur(); });
	return this;
};

// 创建编辑局面区域空白提示
fn.createEditPlaceholder = function(){
	var placeholderText = "请将局面代码粘贴到这里，支持标准FEN、东萍象棋、象棋世家等格式，其他格式程序会尝试进行识别。";

	if (vs.placeholder) {
		this.editTextarea.attr({ "placeholder": placeholderText });
		this.editTextareaPlaceholder = $();
		return this;
	}

	var _this = this, editMonitor;
	this.editTextareaPlaceholder = $('<div class="vschess-tab-body-edit-textarea-placeholder">' + placeholderText + "</div>");
	this.editArea.append(this.editTextareaPlaceholder);
	this.editTextarea.bind("focus", function(){ editMonitor = setInterval(function(){ _this.editTextarea.val() ? _this.editTextareaPlaceholder.hide() : _this.editTextareaPlaceholder.show(); }, 20); });
	this.editTextarea.bind("blur" , function(){ clearInterval(editMonitor); });
	return this;
};

// 创建编辑局面区域棋子容器
fn.createEditPieceArea = function(){
	var _this = this;
	var editPieceNameList = "RNBAKCP*rnbakcp";
	this.editPieceArea = $('<div class="vschess-tab-body-edit-area"></div>');
	this.editArea.append(this.editPieceArea);
	this.editPieceList = {};

	for (var i = 0; i < editPieceNameList.length; ++i) {
		var k = editPieceNameList.charAt(i);

		if (k === "*") {
			this.editPieceArea.append('<div class="vschess-piece-disabled"></div>');
		}
		else {
			this.editPieceList[k] = $('<div class="vschess-piece vschess-piece-' + k + '" draggable="true"><span></span></div>');
			this.editPieceList[k].appendTo(this.editPieceArea);
		}
	}

	this.editPieceArea.bind("dragover", function(e){
		e.preventDefault();
		return true;
	});

	this.editPieceArea.bind("drop", function(e){
		_this.editRemovePiece(_this.dragPiece);
		_this.fillEditBoard();
		var currentFen = vs.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	$.each(this.editPieceList, function(i){
		var currentIndex = -vs.f2n[i];

		this.bind(_this.options.click, function(e){
			_this.editRemoveSelect();

			if (_this.editSelectedIndex === -99) {
				$(this).addClass("vschess-piece-s");
				_this.editSelectedIndex = currentIndex;
			}
			else {
				if (_this.editSelectedIndex === currentIndex) {
					_this.editSelectedIndex = -99;
				}
				else {
					$(this).addClass("vschess-piece-s");
					_this.editSelectedIndex = currentIndex;
				}
			}
		});

		this.bind("selectstart", function(e) {
			e.preventDefault();
			return false;
		});

		this.bind("dragstart", function(e){
			e.dataTransfer.setData("text", e.target.innerHTML);
			_this.dragPiece = currentIndex;
			_this.editRemoveSelect();
			_this.editSelectedIndex = -99;
		});

		this.bind("drop", function(e) {
			e.stopPropagation();
			e.preventDefault();
			_this.editRemovePiece(_this.dragPiece);
			_this.fillEditBoard();
			var currentFen = vs.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
			return false;
		});
	});

	return this;
};

// 创建编辑局面区域开始回合数编辑框
fn.createEditStartRound = function(){
	var _this = this;
	this.editEditStartText = $('<div class="vschess-tab-body-edit-start-text">回合：</div>');
	this.editEditStartText.appendTo(this.editArea);
	this.editEditStartRound = $('<input type="number" class="vschess-tab-body-edit-start-round" />');
	this.editEditStartRound.appendTo(this.editArea);

	this.editEditStartRound.bind("change", function(){
		_this.editSituation[1] = vs.limit($(this).val(), 1, Infinity, 1);
		_this.fillEditBoard();
		var currentFen = vs.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	return this;
};

// 创建编辑局面区域先行走子方选项
fn.createEditStartPlayer = function(){
	var _this = this;
	this.editEditStartPlayer = $('<div class="vschess-tab-body-edit-start-player"><span></span></div>');
	this.editEditStartPlayer.appendTo(this.editArea);

	this.editEditStartPlayer.bind(this.options.click, function(){
		_this.editSituation[0] = 3 - _this.editSituation[0];
		_this.fillEditBoard();
		var currentFen = vs.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	return this;
};

// 创建编辑局面专用棋盘
fn.createEditBoard = function(){
	var _this = this;
	this.editBoard = $('<div class="vschess-board-edit"></div>');
	this.DOM.append(this.editBoard);
	this.editBoard.append(new Array(91).join('<div class="vschess-piece"><span></span></div>'));
	this.editPiece = this.editBoard.children(".vschess-piece");

	this.editPiece.each(function(i){
		$(this).bind(_this.options.click, function(){
			_this.editRemoveSelect();

			if (_this.editSelectedIndex === -99) {
				if (_this.editSituation[vs.b2s[i]] > 1) {
					_this.editSelectedIndex = i;
					$(this).addClass("vschess-piece-s");
				}
			}
			else {
				_this.editSelectedIndex === i || _this.editMovePiece(_this.editSelectedIndex, i);
				_this.editSelectedIndex = -99;
			}

			_this.fillEditBoard(true);
			var currentFen = vs.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
		});

		$(this).bind("contextmenu", function(e){
			e.preventDefault();
			_this.editRemovePiece(i);
			_this.fillEditBoard();
			var currentFen = vs.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
			return false;
		});

		$(this).bind("selectstart", function(e) {
			e.preventDefault();
			return false;
		});

		$(this).bind("dragstart", function(e){
			e.dataTransfer.setData("text", e.target.innerHTML);
			_this.dragPiece = i;
			_this.editRemoveSelect();
			_this.editSelectedIndex = -99;
		});

		$(this).bind("dragover", function(e){
			e.preventDefault();
			return true;
		});

		$(this).bind("drop", function(e){
			e.stopPropagation();
			e.preventDefault();

			if (_this.dragPiece !== i) {
				if (e.ctrlKey) {
					_this.editSituation[vs.b2s[i]] = _this.editSituation[vs.b2s[_this.dragPiece]];
				}
				else {
					_this.editMovePiece(_this.dragPiece, i);
				}
			}

			_this.fillEditBoard();
			var currentFen = vs.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
		});
	});

	return this;
};

// 编辑器移动一枚棋子
fn.editMovePiece = function(from, to){
	if (from >= 0) {
		this.editSituation[vs.b2s[to]] = this.editSituation[vs.b2s[from]];
		this.editRemovePiece(from);
	}
	else if (from > -99) {
		this.editSituation[vs.b2s[to]] = -from;
	}

	return this;
};

// 编辑器移除一枚棋子
fn.editRemovePiece = function(i){
	i >= 0 && (this.editSituation[vs.b2s[i]] = 1);
	return this;
};

// 编辑器移除选中状态
fn.editRemoveSelect = function(){
	$.each(this.editPieceList, function(){ $(this).removeClass("vschess-piece-s"); });
	this.editPiece.removeClass("vschess-piece-s");
	return this;
};

// 创建推荐开局列表（云服务）
fn.createRecommendList = function(){
	var _this = this;
	this.recommendClass = $('<select class="vschess-recommend-class"></select>');
	this.recommendList  = $('<ul class="vschess-recommend-list"></ul>');
	this.DOM.append(this.recommendClass);
	this.DOM.append(this.recommendList );
	this.recommendClass.bind("change", function(){ _this.fillInRecommendList(this.selectedIndex); });
	this.fillInRecommendClass();
	return this;
};

// 填充推荐开局分类列表
fn.fillInRecommendClass = function(){
	this.recommendStartClassItem = [];

	for (var i = 0; i < this.recommendStartList.length; ++i) {
		var classItem = $(['<option value="', i, '">', this.recommendStartList[i].name, '</option>'].join("")).appendTo(this.recommendClass);
		this.recommendStartClassItem.push(classItem);
	}

	return this;
};

// 填充推荐开局列表
fn.fillInRecommendList = function(classId){
	var _this = this;
	this.recommendList.empty();
	var list = this.recommendStartList[classId].fenList;

	for (var i = 0; i < list.length; ++i) {
		var recommendStart = $(['<li class="vschess-recommend-list-fen" data-fen="', list[i].fen, '"><span>', i + 1, '.</span>', list[i].name, '</li>'].join(""));
		this.recommendList.append(recommendStart);

		recommendStart.bind(this.options.click, function(){
			var fen = $(this).data("fen");
			_this.fillEditBoardByFen(fen);
			_this.editTips.val(fen.split(" ")[0] === vs.blankFen.split(" ")[0] ? _this.editTipsText : fen);
		});
	}

	return this;
};

// 尝试识别文本棋谱
fn.fillEditBoardByText = function(chessData){
	var RegExp = vs.RegExp(), RegExp_Match, fen = vs.blankFen;

	if (~chessData.indexOf("[DhtmlXQ]")) {
		fen = vs.dataToNode_DhtmlXQ(chessData, true);
	}
	else if (RegExp_Match = RegExp.ShiJia.exec(chessData)) {
		fen = vs.dataToNode_ShiJia(chessData, true);
	}
	else if (RegExp_Match = RegExp.FenLong.exec(chessData)) {
		fen = RegExp_Match[0];
	}
	else if (RegExp_Match = RegExp.FenShort.exec(chessData)) {
		fen = RegExp_Match[0] + " - - 0 1";
	}
	else if (RegExp_Match = RegExp.FenMini.exec(chessData)) {
		fen = RegExp_Match[0] + " w - - 0 1";
	}

	return this.fillEditBoardByFen(fen);
};

// 将 Fen 串导入局面编辑区
fn.fillEditBoardByFen = function(fen){
	(this.getTurn() >> 1) && (fen = vs.roundFen(fen));
	this.editSituation = vs.fenToSituation(fen);
	this.fillEditBoard();
	return this;
};

// 将当前编辑局面展示到视图中
fn.fillEditBoard = function(ignoreSelect){
	var selected = this.editPiece.filter(".vschess-piece-s");
	this.editPiece.removeClass().addClass("vschess-piece").removeAttr("draggable");
	ignoreSelect && selected.addClass("vschess-piece-s");
	this.editEditStartRound.val(this.editSituation[1]);
	this.editEditStartPlayer.removeClass("vschess-tab-body-edit-start-player-black");
	this.editSituation[0] === 2 && this.editEditStartPlayer.addClass("vschess-tab-body-edit-start-player-black");

	for (var i = 51; i < 204; ++i) {
		this.editSituation[i] > 1 && this.editPiece.eq(vs.s2b[i]).addClass("vschess-piece-" + vs.n2f[this.editSituation[i]]).attr({ draggable: true });
	}

	return this;
};

// 创建粘贴棋谱区域开始编辑按钮
fn.createNodeStartButton = function(){
	var _this = this;
	this.editNodeStartButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-node-start-button">粘贴棋谱</button>');
	this.editNodeStartButton.appendTo(this.editArea);

	this.editNodeStartButton.bind(this.options.click, function(){
		_this.createEditOtherItem();
		_this.pause(false);
		_this.hideEditModule();
		_this.hideEditStartButton();
		_this.showNodeEditModule();
	});

	return this;
};

// 创建粘贴棋谱区域完成编辑按钮
fn.createNodeEndButton = function(){
	var _this = this;
	this.editNodeEndButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-node-end-button">确 定</button>');
	this.editNodeEndButton.appendTo(this.editArea);

	this.editNodeEndButton.bind(this.options.click, function(){
		if (!_this.confirm("确定使用新的棋谱吗？当前棋谱会丢失！")) {
			return false;
		}

		var chessData = _this.editNodeTextarea.val();
		_this.editNodeTextarea.val("");
		_this.setBoardByStep(0);
		_this.setNode(vs.dataToNode(chessData));
		_this.rebuildSituation().refreshMoveSelectListNode().setBoardByStep(0);
		_this.chessInfo = vs.dataToInfo(chessData);
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
		_this.setSaved(true);
	});

	return this;
};

// 创建粘贴棋谱区域取消编辑按钮
fn.createNodeCancelButton = function(){
	var _this = this;
	this.editNodeCancelButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-node-cancel-button">取 消</button>');
	this.editNodeCancelButton.appendTo(this.editArea);

	this.editNodeCancelButton.bind(this.options.click, function(){
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
	});

	return this;
};

// 创建粘贴棋谱区域输入框
fn.createNodeEditTextarea = function(){
	var _this = this;
	this.editNodeTextarea = $('<textarea class="vschess-tab-body-edit-node-textarea"></textarea>').appendTo(this.editArea);
	this.editNodeTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode === 13 && _this.editNodeTextarea.blur(); });
	return this;
};

// 创建粘贴棋谱区域空白提示
fn.createNodeEditPlaceholder = function(){
	var placeholderText = "请将棋谱代码粘贴到这里，或者直接将棋谱文件拖拽到棋盘上。支持标准PGN、东萍象棋 DhtmlXQ、鹏飞象棋 PFC、象棋世家、QQ 新中国象棋等格式，其他格式程序会尝试进行识别。";

	if (vs.placeholder) {
		this.editNodeTextarea.attr({ "placeholder": placeholderText });
		this.editNodeTextareaPlaceholder = $();
		return this;
	}

	var _this = this, editMonitor;
	this.editNodeTextareaPlaceholder = $('<div class="vschess-tab-body-edit-node-textarea-placeholder">' + placeholderText + "</div>");
	this.editArea.append(this.editNodeTextareaPlaceholder);
	this.editNodeTextarea.bind("focus", function(){ editMonitor = setInterval(function(){ _this.editNodeTextarea.val() ? _this.editNodeTextareaPlaceholder.hide() : _this.editNodeTextareaPlaceholder.show(); }, 20); });
	this.editNodeTextarea.bind("blur" , function(){ clearInterval(editMonitor); });
	return this;
};

// 创建其他按钮
fn.createEditOtherButton = function(){
	var _this = this;

	// 打开棋谱按钮
	var buttonId = "vschess-tab-body-edit-open-button-" + vs.guid();
	this.editOpenButton = $('<label for="' + buttonId + '" class="vschess-button vschess-tab-body-edit-open-button">打开棋谱</label>');
	this.editOpenButton.appendTo(this.editArea);
	this.editOpenFile = $('<input type="file" class="vschess-tab-body-edit-open-file" id="' + buttonId + '" />');
	this.editOpenFile.appendTo(this.editArea);

	this.editOpenFile.bind("change", function(){
		if (typeof FileReader === "function") {
			if (this.files.length) {
				var file = this.files[0];
				var ext = file.name.split(".").pop().toLowerCase();
				var reader = new FileReader();
				reader.readAsArrayBuffer(file);
				reader.onload = function(){
					if (!_this.confirm("确定打开该棋谱吗？当前棋谱会丢失！")) {
						return false;
					}

					var RegExp    = vs.RegExp();
					var fileData  = new Uint8Array(this.result);
					var chessData = vs.join(fileData);

					if (~vs.binaryExt.indexOf(ext)) {
						var chessNode = vs.binaryToNode(fileData);
						var chessInfo = vs.binaryToInfo(fileData);
					}
					else {
						!RegExp.ShiJia.test(chessData) && (chessData = vs.iconv2UTF8(fileData));
						var chessNode = vs.dataToNode(chessData);
						var chessInfo = vs.dataToInfo(chessData);
					}

					_this.setBoardByStep(0);
					_this.setNode(chessNode);
					_this.rebuildSituation();
					_this.refreshMoveSelectListNode();
					_this.setBoardByStep(0);
					_this.chessInfo = chessInfo;
					_this.insertInfoByCurrent();
					_this.refreshInfoEditor();
					_this.rebuildExportAll();
					_this.setExportFormat();
					_this.editNodeTextarea.val("");
					_this.hideNodeEditModule();
					_this.hideEditModule();
					_this.showEditStartButton();
					_this.setSaved(true);
				}
			}
		}
		else {
			alert("对不起，该浏览器不支持打开棋谱。");
		}

		this.value = "";
	});

	// 重新开局按钮
	this.editBeginButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-begin-button">重新开局</button>');
	this.editBeginButton.appendTo(this.editArea);

	this.editBeginButton.bind(this.options.click, function(){
		if (!_this.confirm("确定重新开局吗？当前棋谱会丢失！")) {
			return false;
		}

		_this.setNode({ fen: vs.defaultFen, comment: "", next: [], defaultIndex: 0 });
		_this.rebuildSituation();
        _this.setBoardByStep(0);
		_this.refreshMoveSelectListNode();
		_this.chessInfo = {};
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
		_this.setTurn(0);
		_this.setSaved(true);
	});

	// 清空棋盘按钮
	this.editBlankButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-blank-button">清空棋盘</button>');
	this.editBlankButton.appendTo(this.editArea);

	this.editBlankButton.bind(this.options.click, function(){
		_this.createEditOtherItem();
		_this.pause(false);
		_this.fillInRecommendList(0);
		_this.hideEditStartButton();
		_this.hideNodeEditModule();
		_this.showEditModule();
		_this.fillEditBoardByFen(vs.blankFen);
		_this.editSelectedIndex = -99;
		_this.dragPiece = null;
	});

	return this;
};

// 绑定拖拽棋谱事件
fn.bindDrag = function(){
	var _this = this;

	this.DOM.bind("dragover", function(e){
		e.preventDefault();
	});

	this.DOM.bind("drop", function(e){
		e.preventDefault();

		if (e.dataTransfer && e.dataTransfer.files.length) {
			var file = e.dataTransfer.files[0];
			var ext = file.name.split(".").pop().toLowerCase();
			var reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = function(){
				if (!_this.confirm("确定使用新的棋谱吗？当前棋谱会丢失！")) {
					return false;
				}

				var RegExp    = vs.RegExp();
				var fileData  = new Uint8Array(this.result);
				var chessData = vs.join(fileData);

				if (~vs.binaryExt.indexOf(ext)) {
					var chessNode = vs.binaryToNode(fileData);
					var chessInfo = vs.binaryToInfo(fileData);
				}
				else {
					!RegExp.ShiJia.test(chessData) && (chessData = vs.iconv2UTF8(fileData));
					var chessNode = vs.dataToNode(chessData);
					var chessInfo = vs.dataToInfo(chessData);
				}

				_this.setBoardByStep(0);
				_this.setNode(chessNode);
				_this.rebuildSituation();
				_this.refreshMoveSelectListNode();
				_this.setBoardByStep(0);
				_this.chessInfo = chessInfo;
				_this.insertInfoByCurrent();
				_this.refreshInfoEditor();
				_this.rebuildExportAll();
				_this.setExportFormat();
				_this.editNodeTextarea.val("");
				_this.hideNodeEditModule();
				_this.hideEditModule();
				_this.showEditStartButton();
				_this.setSaved(true);
				_this.hideHelpArea();
				_this.hideInfoEditor();
			}
		}
	});

	return this;
};

// 确认提示框
fn.confirm = function(str){
	if (this.getSaveTips() && !this.getSaved()) {
		return confirm(str);
	}
	else {
		return true;
	}
};

// 设置保存状态
fn.setSaved = function(status){
	this._.saved = !!status;
	return this;
};

// 取得保存状态
fn.getSaved = function(){
	return this._.saved;
};

// 设置保存提示状态
fn.setSaveTips = function(status){
	this._.saveTips = !!status;
	this.setConfigItemValue("saveTips", this._.saveTips);
	return this;
};

// 取得保存提示状态
fn.getSaveTips = function(){
	return this._.saveTips;
};
