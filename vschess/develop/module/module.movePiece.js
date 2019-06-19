// 移动一枚棋子
fn.movePieceByPieceIndex = function(from, to, animationTime, callback, callbackIllegal){
	// 动画过程中，直接跳过
	if (this.animating) {
		return this;
	}

	if (typeof animationTime === "function") {
		callbackIllegal = callback;
		callback = animationTime;
		animationTime = 0;
	}

	from = vs.limit(from, 0, 89);
	to   = vs.limit(to  , 0, 89);
	animationTime = vs.limit(animationTime, 0, Infinity);

	var From = vs.b2i[vs.turn[this.getTurn()][from]];
	var To   = vs.b2i[vs.turn[this.getTurn()][to  ]];
	var Move = From + To;

	// 着法不合法，不移动棋子
	var isBanRepeatLongThreat = this.getBanRepeatLongThreat() && ~this.repeatLongThreatMoveList.indexOf(Move);
	var isBanRepeatLongKill   = this.getBanRepeatLongKill  () && ~this.repeatLongKillMoveList  .indexOf(Move);

	if (!~this.legalMoveList.indexOf(Move) || isBanRepeatLongThreat || isBanRepeatLongKill) {
		typeof callbackIllegal === "function" && callbackIllegal();
		return this;
	}

	// 动画过渡，即动画时间大于 100，100毫秒以下效果很差，直接屏蔽
	if (animationTime >= 100) {
		var _this = this;
		this.animating = true;
		this.clearSelect();
		this.clearSelect(-1);
		this.clearPiece(from);
		this.clearPiece(-1);
		this.setSelectByPieceIndex(from);
		this.setSelectByPieceIndex(-1);

		var ua = navigator.userAgent.toLowerCase();
		var isIE6 = ~ua.indexOf("msie 6");
		var isIE7 = ~ua.indexOf("msie 7");
		var isIE8 = ~ua.indexOf("msie 8");

		// 低版本 IE 模式下，使用 js 的动画效果
		if (isIE6 || isIE7 || isIE8) {
			var _playSound = true;
			var finishHandlerRunned = false;

			var finishHandler = function(){
				_this.setMoveDefaultAtNode(Move) && _this.rebuildSituation().refreshMoveSelectListNode();
				_this.setBoardByOffset(1);
				_this.setSelectByStep();
				_this.animatePiece.hide();
				_playSound && _this.playSoundBySituation();
				_this.animating = false;
				finishHandlerRunned = true;

				_this.pieceRotateDeg[to]   = _this.pieceRotateDeg[from];
				_this.pieceRotateDeg[from] = Math.random() * 360;
				_this.getPieceRotate() ? _this.loadPieceRotate() : _this.clearPieceRotate();

				typeof _this.callback_afterAnimate === "function" && _this.callback_afterAnimate();
				typeof callback === "function" && callback();
			};

			var sIndex = vs.b2s[vs.turn[this.getTurn()][from]];
			var piece  = this.situationList[this.getCurrentStep()][sIndex];

			this.getPieceRotate() ? this.animatePiece.children("span").attr({ style: vs.degToRotateCSS(this.pieceRotateDeg[from]) }) : this.animatePiece.children("span").removeAttr("style");

			this.animatePiece.addClass("vschess-piece-" + vs.n2f[piece]).css({
				top : this.piece.eq(from).position().top,
				left: this.piece.eq(from).position().left
			}).show().animate({
				top : this.piece.eq(to).position().top,
				left: this.piece.eq(to).position().left
			}, animationTime, finishHandler);

			this.stopAnimate = function(playSound){
				typeof playSound !== "undefined" && (_playSound = playSound);
				_this.animatePiece.stop();
			};

			setTimeout(function(){ finishHandlerRunned || finishHandler(); }, animationTime + 500);
		}

		// 其他浏览器使用原生 CSS3 动画效果
		else {
			var finishHandlerRunned = false;

			var finishHandler = function(playSound){
				var _playSound = true;
				typeof playSound !== "undefined" && (_playSound = playSound);

				_this.setMoveDefaultAtNode(Move) && _this.rebuildSituation().refreshMoveSelectListNode();
				_this.setBoardByOffset(1);
				_this.setSelectByStep();
				_this.animatePiece.hide().css({ "-webkit-transition": "0ms", "-moz-transition": "0ms", "-ms-transition": "0ms", "-o-transition": "0ms", "transition": "0ms" });
				_playSound && _this.playSoundBySituation();
				_this.animating = false;

				setTimeout(function(){
					_this.animatePiece.hide().css({
						"-webkit-transform": "translate3d(0px, 0px, 0px)",
						   "-moz-transform": "translate3d(0px, 0px, 0px)",
							"-ms-transform": "translate3d(0px, 0px, 0px)",
						     "-o-transform": "translate3d(0px, 0px, 0px)",
						        "transform": "translate3d(0px, 0px, 0px)"
					});
				}, vs.threadTimeout);

				var Evt = _this.animatePiece[0];
				Evt.removeEventListener("webkitTransitionEnd", finishHandler);
				Evt.removeEventListener(   "mozTransitionEnd", finishHandler);
				Evt.removeEventListener(    "msTransitionEnd", finishHandler);
				Evt.removeEventListener(     "oTransitionEnd", finishHandler);
				Evt.removeEventListener(      "transitionend", finishHandler);

				finishHandlerRunned = true;

				_this.pieceRotateDeg[to]   = _this.pieceRotateDeg[from];
				_this.pieceRotateDeg[from] = Math.random() * 360;
				_this.getPieceRotate() ? _this.loadPieceRotate() : _this.clearPieceRotate();

				typeof _this.callback_afterAnimate === "function" && _this.callback_afterAnimate();
				typeof callback === "function" && callback();
			};

			var deltaX = this.piece.eq(to).position().left - this.piece.eq(from).position().left;
			var deltaY = this.piece.eq(to).position().top  - this.piece.eq(from).position().top;
			var sIndex = vs.b2s[vs.turn[this.getTurn()][from]];
			var piece  = this.situationList[this.getCurrentStep()][sIndex];

			this.getPieceRotate() ? this.animatePiece.children("span").attr({ style: vs.degToRotateCSS(this.pieceRotateDeg[from]) }) : this.animatePiece.children("span").removeAttr("style");

			var Evt = this.animatePiece.addClass("vschess-piece-" + vs.n2f[piece]).css({
				top : this.piece.eq(from).position().top,
				left: this.piece.eq(from).position().left,
				"-webkit-transition": animationTime + "ms",
				   "-moz-transition": animationTime + "ms",
					"-ms-transition": animationTime + "ms",
				     "-o-transition": animationTime + "ms",
				        "transition": animationTime + "ms"
			}).show()[0];

			Evt.addEventListener("webkitTransitionEnd", finishHandler);
			Evt.addEventListener(   "mozTransitionEnd", finishHandler);
			Evt.addEventListener(    "msTransitionEnd", finishHandler);
			Evt.addEventListener(     "oTransitionEnd", finishHandler);
			Evt.addEventListener(      "transitionend", finishHandler);

			setTimeout(function(){
				_this.animatePiece.css({
					"-webkit-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					   "-moz-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
						"-ms-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					     "-o-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					        "transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)"
				});
			}, vs.threadTimeout);

			this.stopAnimate = finishHandler;
			setTimeout(function(){ finishHandlerRunned || finishHandler(); }, animationTime + 500);
		}
	}

	// 无动画过渡，即动画时间为 0
	else {
		this.stopAnimate = function(){};
		this.setMoveDefaultAtNode(Move) && this.rebuildSituation().refreshMoveSelectListNode();
		this.setBoardByOffset(1);
		this.setSelectByStep();
		this.playSoundBySituation();
		typeof this.callback_afterAnimate === "function" && this.callback_afterAnimate();
		typeof callback === "function" && callback();
	}

	return this;
};

// 根据节点 ICCS 移动一枚棋子
fn.movePieceByNode = function(move, animationTime, callback, callbackIllegal){
	this.getTurnForMove() && (move = vs.turnMove(move));
	var from = vs.turn[this.getTurn()][vs.i2b[move.substring(0, 2)]];
	var to   = vs.turn[this.getTurn()][vs.i2b[move.substring(2, 4)]];
	return this.movePieceByPieceIndex(from, to, animationTime, callback, callbackIllegal);
};

// 根据中文着法移动一枚棋子
fn.movePieceByChinese = function(move, animationTime, callback, callbackIllegal){
	return this.movePieceByNode(vs.Chinese2Node(move, this.getCurrentFen()).move, animationTime, callback, callbackIllegal);
};

// 根据 WXF 着法移动一枚棋子
fn.movePieceByWXF = function(move, animationTime, callback, callbackIllegal){
	return this.movePieceByNode(vs.WXF2Node(move, this.getCurrentFen()).move, animationTime, callback, callbackIllegal);
};

// 以动画方式过渡到下一个局面
fn.animateToNext = function(animationTime, callback){
	if (this.animating || this.getCurrentStep() >= this.lastSituationIndex()) {
		return this;
	}

	var from = vs.turn[this.getTurn()][vs.i2b[this.getMoveByStep(this.getCurrentStep() + 1).substring(0, 2)]];
	var to   = vs.turn[this.getTurn()][vs.i2b[this.getMoveByStep(this.getCurrentStep() + 1).substring(2, 4)]];
	this.movePieceByPieceIndex(from, to, vs.limit(animationTime, 0, Infinity), callback);
	return this;
};

// 设置动画时间
fn.setAnimationTime = function(animationTime){
	this._.animationTime = vs.limit(animationTime, 0, Infinity);
	return this;
};

// 取得动画时间
fn.getAnimationTime = function(animationTime){
	return this._.animationTime >= this._.playGap * 100 ? this._.playGap * 50 : this._.animationTime;
};

// 设置禁止重复长打状态
fn.setBanRepeatLongThreat = function(banRepeatLongThreat){
	this._.banRepeatLongThreat = !!banRepeatLongThreat;
	this.setConfigItemValue("banRepeatLongThreat", this._.banRepeatLongThreat);
	return this;
};

// 取得禁止重复长打状态
fn.getBanRepeatLongThreat = function(){
	return this._.banRepeatLongThreat;
};

// 设置禁止重复一将一杀状态
fn.setBanRepeatLongKill = function(banRepeatLongKill){
	this._.banRepeatLongKill = !!banRepeatLongKill;
	this.setConfigItemValue("banRepeatLongKill", this._.banRepeatLongKill);
	return this;
};

// 取得禁止重复一将一杀状态
fn.getBanRepeatLongKill = function(){
	return this._.banRepeatLongKill;
};

// 设置违例提示状态
fn.setIllegalTips = function(illegalTips){
	this._.illegalTips = !!illegalTips;
	this.setConfigItemValue("illegalTips", this._.illegalTips);
	return this;
};

// 取得违例提示状态
fn.getIllegalTips = function(){
	return this._.illegalTips;
};
