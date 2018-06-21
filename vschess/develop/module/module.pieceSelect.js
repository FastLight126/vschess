// 设置指定棋子合法目标格状态，-1 表示动画棋子
fn.setLegalByPieceIndex = function(index){
	index = vs.limit(index, -1, 89);
	~index ? this.piece.eq(index).addClass("vschess-piece-S") : this.animatePiece.addClass("vschess-piece-S");
	return this;
};

// 获取指定棋子合法目标格状态
fn.getLegalByPieceIndex = function(startIndex, targetIndex){
	 startIndex		= vs.limit( startIndex, 0, 89, this.getCurrentSelect());
	targetIndex		= vs.limit(targetIndex, 0, 89, this.getCurrentSelect());
	var  startPos	= vs.b2i[vs.turn[this.getTurn()][vs.limit( startIndex, 0, 89)]];
	var targetPos	= vs.b2i[vs.turn[this.getTurn()][vs.limit(targetIndex, 0, 89)]];
	var move		= startPos + targetPos;

	if (this.getBanRepeatLongThreat() && ~this.repeatLongThreatMoveList.indexOf(move)) {
		return false;
	}

	if (this.getBanRepeatLongKill() && ~this.repeatLongKillMoveList.indexOf(move)) {
		return false;
	}

	return !!~this.legalMoveList.indexOf(startPos + targetPos);
};

// 设置指定棋子选中状态，-1 表示动画棋子
fn.setSelectByPieceIndex = function(index){
	index = vs.limit(index, -1, 89);
	~index ? this.setCurrentSelect(index).piece.eq(index).addClass("vschess-piece-s") : this.animatePiece.addClass("vschess-piece-s");
	return this;
};

// 获取指定棋子选中状态
fn.getSelectByPieceIndex = function(index){
	return this.piece.eq(vs.limit(index, 0, 89)).hasClass("vschess-piece-s");
};

// 设置合法目标格提示状态
fn.setLegalTargetByStartIndex = function(index){
	index = vs.limit(index, 0, 89);
	var _this = this;
	this.piece.each(function(pieceIndex){ _this.getLegalByPieceIndex(index, pieceIndex) && _this.setLegalByPieceIndex(pieceIndex); });
	return this;
};

// 切换棋子选中状态
fn.toggleSelectByPieceIndex = function(index){
	index = vs.limit(index, 0, 89);

	if (this.piece.eq(index).hasClass("vschess-piece-s")) {
		this.clearSelect();
		this.callback_unSelectPiece();
	}
	else {
		this.clearSelect();
		this.setSelectByPieceIndex(index);
		this.getMoveTips() && this.setLegalTargetByStartIndex(index);
		this.callback_selectPiece();
	}

	return this;
};

// 根据局面为起始点及目标点棋子添加方框
fn.setSelectByStep = function(step){
	step = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (step <= 0) {
		return this;
	}

	var from = vs.i2s[this.getMoveByStep(step).substring(0, 2)];
	var to   = vs.i2s[this.getMoveByStep(step).substring(2, 4)];
	var currentSelect = this.getCurrentSelect();
	this.setSelectByPieceIndex(vs.turn[this.getTurn()][vs.s2b[from]]);
	this.setSelectByPieceIndex(vs.turn[this.getTurn()][vs.s2b[to  ]]);
	this.setCurrentSelect(currentSelect);
	return this;
};

// 设置当前选中的棋子编号，-1 表示没有被选中的棋子
fn.setCurrentSelect = function(currentSelect){
	this._.currentSelect = vs.limit(currentSelect, -1, 89, -1);
	return this;
};

// 取得当前选中的棋子编号，-1 表示没有被选中的棋子
fn.getCurrentSelect = function(){
	return this._.currentSelect;
};
