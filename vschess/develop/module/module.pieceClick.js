// 棋子单击事件绑定
fn.pieceClick = function(){
	var _this = this;

	this.piece.each(function(index){
		$(this).bind(_this.options.click, function(){
			// 是本方棋子，切换选中状态
			if (_this.isPlayer(index)) {
				if (_this.getClickResponse() > 1 && _this.isR(index) || (_this.getClickResponse() & 1) && _this.isB(index)) {
					_this.toggleSelectByPieceIndex(index);
					_this.playSound("click");
				}
			}

			// 不是本方棋子，即为走子目标或空白点
			else {
				// 违例提示
				if (_this.getIllegalTips()) {
					var From = vs.b2i[vs.turn[_this.getTurn()][_this.getCurrentSelect()]];
					var To   = vs.b2i[vs.turn[_this.getTurn()][index]];
					var Move = From + To;

					if (_this.getBanRepeatLongThreat() && ~_this.repeatLongThreatMoveList.indexOf(Move)) {
						alert("禁止重复长打！");
					}

					if (_this.getBanRepeatLongKill() && ~_this.repeatLongKillMoveList.indexOf(Move)) {
						alert("禁止重复一将一杀！");
					}
				}

				// 合法着法，移动棋子
				if (_this.getLegalByPieceIndex(_this.getCurrentSelect(), index)) {
					_this.callback_beforeClickAnimate();
					_this.movePieceByPieceIndex(_this.getCurrentSelect(), index, _this.getAnimationTime(), function(){ _this.callback_afterClickAnimate(); });
				}

				// 不合法着法，播放非法着法音效
				else if (~_this.getCurrentSelect()) {
					_this.playSound("illegal");
				}
			}
		});
	});

	return this;
};

// 设置单击响应状态
fn.setClickResponse = function(clickResponse){
	this._.clickResponse = vs.limit(clickResponse, 0, 3);
	return this;
};

// 取得单击相应状态
fn.getClickResponse = function(){
	return this._.clickResponse;
};

// 设置走子提示状态
fn.setMoveTips = function(moveTips){
	this._.moveTips = !!moveTips;
	this.setConfigItemValue("moveTips", this._.moveTips);
	return this;
};

// 取得走子提示状态
fn.getMoveTips = function(){
	return this._.moveTips;
};
