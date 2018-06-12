// 将棋盘上的棋子移除，-1 表示动画棋子
fn.clearPiece = function(index){
	var className =  "vschess-piece-R vschess-piece-N vschess-piece-B vschess-piece-A vschess-piece-K vschess-piece-C vschess-piece-P";
	className	 += " vschess-piece-r vschess-piece-n vschess-piece-b vschess-piece-a vschess-piece-k vschess-piece-c vschess-piece-p";

	if (typeof index === "undefined") {
		this.piece.removeClass(className);
	}
	else if (~index) {
		this.piece.eq(vs.limit(index, 0, 89)).removeClass(className);
	}
	else {
		this.animatePiece.removeClass(className);
	}

	return this;
};

// 将棋盘上的选择状态移除，-1 表示动画棋子
fn.clearSelect = function(index){
	if (typeof index === "undefined") {
		this.piece.removeClass("vschess-piece-S vschess-piece-s");
		this.setCurrentSelect(-1);
	}
	else if (~index) {
		this.piece.eq(vs.limit(index, 0, 89)).removeClass("vschess-piece-S vschess-piece-s");
	}
	else {
		this.animatePiece.removeClass("vschess-piece-S vschess-piece-s");
	}

	return this;
};

// 将棋盘上的棋子及选择状态移除，-1 表示动画棋子
fn.clearBoard = function(index){
	this.clearPiece(index);
	this.clearSelect(index);
	return this;
};
