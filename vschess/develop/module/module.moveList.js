// 着法选择列表
fn.createMoveSelectList = function(){
	this.DOM.children(".vschess-move-select-list").remove();
	this.moveSelectList = $('<ul class="vschess-move-select-list"></ul>');
	this.DOM.append(this.moveSelectList);
	return this;
};

// 刷新着法选择列表内所有着法
fn.refreshMoveSelectListNode = function(){
	var _this = this;
	var startRound = this.situationList[0][1];
	var selectListNode = ['<li class="vschess-move-select-node-begin">===== 棋局开始' + (this.commentList[0] ? "*" : "") + ' =====</li>'];

	switch (this.getMoveFormat()) {
		case "iccs": var moveList = this.getTurnForMove() ? this.moveNameList.   ICCSM.slice(0) : this.moveNameList.   ICCS.slice(0); break;
		case "wxf" : var moveList = this.getTurnForMove() ? this.moveNameList.    WXFM.slice(0) : this.moveNameList.    WXF.slice(0); break;
		default    : var moveList = this.getTurnForMove() ? this.moveNameList.ChineseM.slice(0) : this.moveNameList.Chinese.slice(0); break;
	}

	this.situationList[0][0] === 1 ? moveList.shift() : moveList[0] = "";

	if (this.situationList[0][0] === 1 || this.situationList[0][0] === 2 && moveList.length > 1) {
		for (var i = 0; i < moveList.length; ++i) {
			i % 2 || selectListNode.push('<li class="vschess-move-select-node-round">', startRound++, '.</li>');
			selectListNode.push('<li class="vschess-move-select-node-', moveList[i] ? "move" : "blank", '">');
			selectListNode.push(moveList[i], this.commentList[!!moveList[0] + i] && moveList[i] ? "*" : "", '</li>');
		}
	}

	this.moveSelectList.html(selectListNode.join(""));
	this.moveSelectListSteps = this.moveSelectList.children().not(".vschess-move-select-node-round, .vschess-move-select-node-blank");

	this.moveSelectListSteps.each(function(index){
		var each = $(this);
		index && _this.changeLengthList[index - 1] > 1 && each.addClass("vschess-move-select-node-change");
		each.bind(_this.options.click, function(){ _this.setBoardByStep(index); });
	});

	return this.refreshMoveSelectListNodeColor();
};

// 着法列表着色
fn.refreshMoveSelectListNodeColor = function(){
	this.moveSelectListSteps || this.refreshMoveListNode();
	this.moveSelectListSteps.removeClass("vschess-move-select-node-lose vschess-move-select-node-threat vschess-move-select-node-normal");

	var legalLength = this.legalList ? this.legalList.length : 0;
	var repeatLongThreatLength = this.repeatLongThreatMoveList ? this.repeatLongThreatMoveList.length : 0;

	if (legalLength === 0) {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-lose");
	}
	else if (vs.checkThreat(this.situationList[this.getCurrentStep()])) {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-threat");
	}
	else if (this.getBanRepeatLongThreat() && legalLength <= repeatLongThreatLength) {
			this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-lose");
	}
	else {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-normal");
	}

	this.setMoveLeaveHide();
	return this;
};

// 避免当前着法进入滚动区域外
fn.setMoveLeaveHide = function(){
	var bottomLine           = this.moveSelectList.height() - this.moveSelectListSteps.first().height();
	var currentTop           = this.moveSelectListSteps.eq(this.getCurrentStep()).position().top;
	var currentScrollTop     = this.moveSelectList.scrollTop();
	currentTop > bottomLine	&& this.moveSelectList.scrollTop(currentScrollTop + currentTop - bottomLine	);
	currentTop < 0			&& this.moveSelectList.scrollTop(currentScrollTop + currentTop				);
	return this;
};

// 变招选择列表
fn.createChangeSelectList = function(){
	this.DOM.children(".vschess-change-select-title, .vschess-change-select-list").remove();
	this.changeSelectTitle = $('<div class="vschess-change-select-title"></div>');
	this.changeSelectList  = $('<ul class="vschess-change-select-list"></ul>');
	this.DOM.append(this.changeSelectTitle);
	this.DOM.append(this.changeSelectList);
	return this;
};

// 刷新变招选择列表内所有着法
fn.refreshChangeSelectListNode = function(){
	if (this.getCurrentStep() <= 0) {
		this.changeSelectTitle.text("提示信息");
		this.changeSelectList.empty();

		for (var i = 0; i < this.options.startTips.length; ++i) {
			this.changeSelectList.append('<li class="vschess-change-select-tips">' + this.options.startTips[i] + '</li>');
		}

		return this;
	}

	var _this = this;
	var selectListNode = [];
	var parentNode = this.selectDefault(this.getCurrentStep() - 1);
	var changeList  = parentNode.next;
	var currentNodeIndex = this.currentNodeList[this.getCurrentStep()];

	switch (this.getMoveFormat()) {
		case "iccs": var converter = vs.Node2ICCS	; break;
		case "wxf" : var converter = vs.Node2WXF	; break;
		default    : var converter = vs.Node2Chinese; break;
	}

	for (var i = 0; i < changeList.length; ++i) {
		var changeMove	= this.getTurnForMove() ? vs.turnMove(changeList[i].move) : changeList[i].move;
		var prevFen		= this.getFenByStep(this.getCurrentStep() - 1);

		selectListNode.push('<li class="vschess-change-select-node">');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-move">');
		selectListNode.push(converter(changeMove, prevFen, this.options).move, changeList[i].comment ? "*" : "", '</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-up">上移</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-down">下移</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-delete">删除</span>');
		selectListNode.push('</li>');
	}

	this.changeSelectTitle.text("变招列表");
	this.changeSelectList.html(selectListNode.join(""));
	this.changeSelectListChanges = this.changeSelectList.children();
	this.changeSelectListChanges.first().addClass("vschess-change-select-node-first");
	this.changeSelectListChanges.last ().addClass("vschess-change-select-node-last" );

	this.changeSelectListChanges.each(function(index){
		var each = $(this);
		var move = changeList[index].move;
		index === currentNodeIndex && each.addClass("vschess-change-select-node-current");
		each.hasClass("vschess-change-select-node-current") && each.hasClass("vschess-change-select-node-first") && each.addClass("vschess-change-select-node-current-and-first");
		each.hasClass("vschess-change-select-node-current") && each.hasClass("vschess-change-select-node-last" ) && each.addClass("vschess-change-select-node-current-and-last" );

		each.bind(_this.options.click, function(){
			_this.setMoveDefaultAtNode(move, _this.getCurrentStep() - 1 ) && _this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-up").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (index <= 0) {
				return false;
			}

			var prevTarget = changeList[index - 1];
			changeList[index - 1] = changeList[index];
			changeList[index    ] = prevTarget;

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = index - 1;
			}
			else if (parentNode.defaultIndex === index - 1) {
				parentNode.defaultIndex = index;
			}

			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-down").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (index >= changeList.length - 1) {
				return false;
			}

			var prevTarget = changeList[index + 1];
			changeList[index + 1] = changeList[index];
			changeList[index    ] = prevTarget;

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = index + 1;
			}
			else if (parentNode.defaultIndex === index + 1) {
				parentNode.defaultIndex = index;
			}

			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-delete").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (!confirm("确定要删除该着法吗？该着法及之后的所有着法都将被删除！")) {
				return false;
			}

			for (var i = index; i < changeList.length; ++i) {
				changeList[i] = changeList[i + 1];
			}

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = 0;
			}
			else if (parentNode.defaultIndex > index) {
				--parentNode.defaultIndex;
			}

			--changeList.length;
			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode().refreshNodeLength();
		});
	});

	this.setChangeLeaveHide();
	return this;
};

// 避免当前变招进入滚动区域外
fn.setChangeLeaveHide = function(){
	var bottomLine           = this.changeSelectList.height() - this.changeSelectListChanges.first().height();
	var currentTop           = this.changeSelectListChanges.eq(this.currentNodeList[this.getCurrentStep()]).position().top;
	var currentScrollTop     = this.changeSelectList.scrollTop();
	currentTop > bottomLine	&& this.changeSelectList.scrollTop(currentScrollTop + currentTop - bottomLine);
	currentTop < 0			&& this.changeSelectList.scrollTop(currentScrollTop + currentTop			 );
	return this;
};

// 刷新着法列表及变招列表
fn.refreshMoveListNode = function(){
	return this.refreshMoveSelectListNode().refreshChangeSelectListNode();
};

// 设置当前着法列表格式
fn.setMoveFormat = function(format){
	switch (format) {
		case "iccs": this._.moveFormat = "iccs"		; break;
		case "wxf" : this._.moveFormat = "wxf"		; break;
		default    : this._.moveFormat = "chinese"	; break;
	}

	return this;
};

// 取得当前着法列表格式
fn.getMoveFormat = function(){
	return this._.moveFormat;
};
