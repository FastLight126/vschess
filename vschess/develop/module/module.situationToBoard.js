// 显示指定索引号的局面，负值表示从最后一个局面向前
fn.setBoardByStep = function(step, indexUnChange){
	step = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var _this = this;
	this._.currentStep = vs.limit(step, 0, this.lastSituationIndex());
	this.clearBoard(  );
	this.clearBoard(-1);
	this.animating = false;

	this.piece.each(function(index){
		var piece = _this.situationList[_this.getCurrentStep()][vs.b2s[vs.turn[_this.getTurn()][index]]];
		piece > 1 && $(this).addClass("vschess-piece-" + vs.n2f[piece]);
	});

	this.getPieceRotate() ? this.loadPieceRotate() : this.clearPieceRotate();

	// 从 setTurn 方法过来的无需更新合法列表，提高执行速度
	if (!indexUnChange) {
		this.legalList     = vs.legalList    (this.situationList[this.getCurrentStep()]);
		this.legalMoveList = vs.legalMoveList(this.situationList[this.getCurrentStep()]);
		this.repeatLongThreatMoveList = this.getBanRepeatLongThreat() ? this.getRepeatLongThreatMove() : [];
		this.repeatLongKillMoveList   = this.getBanRepeatLongKill  () ? this.getRepeatLongKillMove  () : [];
	}

	this.setSelectByStep();
	this.refreshMoveSelectListNodeColor();
	this.refreshChangeSelectListNode();
	this.setCommentByStep();
    this.getExportFormat() === "TextBoard" && this.setExportFormat("TextBoard");
    this.getExportFormat() === "ChessDB"   && this.setExportFormat("ChessDB"  );
	return this;
};

// 显示指定步数后的局面，正数向后，负数向前，默认为下一步
fn.setBoardByOffset = function(offset){
	return this.setBoardByStep(vs.limit(this.getCurrentStep() + vs.limit(offset, -Infinity, Infinity, 1), 0, this.lastSituationIndex()));
};

// 刷新棋盘，一般用于设置棋盘方向之后
fn.refreshBoard = function(indexUnChange){
	return this.setBoardByStep(this.getCurrentStep(), indexUnChange).refreshMoveListNode();
};

// 设置棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下翻转，3(0x11) 上下翻转 + 左右翻转
fn.setTurn = function(turn){
	this._.turn = vs.limit(turn, 0, 3, 0);
	arguments[1] || this.setConfigItemValue("turnX", !!(turn & 1));
	arguments[1] || this.setConfigItemValue("turnY",    turn > 1 );
	return this.refreshBoard(true).setExportFormat().refreshColumnIndex();
};

// 取得棋盘方向
fn.getTurn = function(){
	return this._.turn;
};

// 取得棋盘着法翻转状态
fn.getTurnForMove = function(){
	return this.getTurn() >> 1 !== (this.getTurn() & 1);
};

// 取得当前局面号
fn.getCurrentStep = function(){
	return this._.currentStep;
};

// 取得当前走棋方，1 为红方，2 为黑方
fn.getCurrentPlayer = function(){
	return this.situationList[this.getCurrentStep()][0];
};

// 刷新列号
fn.refreshColumnIndex = function(turn){
	this.columnIndexR.removeClass("vschess-column-index-a vschess-column-index-b");
	this.columnIndexB.removeClass("vschess-column-index-a vschess-column-index-b");

	if (vs.limit(turn, 0, 3, this.getTurn()) > 1) {
		this.columnIndexR.addClass("vschess-column-index-a");
		this.columnIndexB.addClass("vschess-column-index-b");
	}
	else {
		this.columnIndexR.addClass("vschess-column-index-b");
		this.columnIndexB.addClass("vschess-column-index-a");
	}

	return this;
};

// 设置棋子随机旋转状态
fn.setPieceRotate = function(status){
	this._.pieceRotate = !!status;
	return this.setConfigItemValue("pieceRotate", this._.pieceRotate);
};

// 取得棋子随机旋转状态
fn.getPieceRotate = function(){
	return this._.pieceRotate;
};

// 初始化棋子旋转角度
fn.initPieceRotateDeg = function(){
	this.pieceRotateDeg = [];

	for (var i = 0; i < 90; ++i) {
		this.pieceRotateDeg.push(Math.random() * 360);
	}

	return this;
};

// 设置棋子旋转
fn.loadPieceRotate = function(){
	var _this = this;

	this.piece.children("span").each(function(k){
		$(this).attr({ style: vs.degToRotateCSS(_this.pieceRotateDeg[k]) });
	});

	return this;
};

// 移除棋子旋转
fn.clearPieceRotate = function(){
	this.piece.children("span").removeAttr("style");
	return this;
};
