// 取得当前节点树路径下局面数量
fn.getSituationListLength = function(){
	return this.situationList ? this.situationList.length : 0;
};

// 取得当前节点树路径下最后局面的索引号
fn.lastSituationIndex = function(){
	return this.situationList ? this.situationList.length - 1 : 0
};

// 取得当前节点树路径下的所有 Fen 串
fn.getFenList = function(){
	if (!this.getTurnForMove()) {
		return this.fenList.slice(0);
	}

	var result = [];

	for (var i = 0; i < this.fenList.length; ++i) {
		result.push(vs.turnFen(this.fenList[i]));
	}

	return result;
};

// 取得当前节点树路径下的所有节点 ICCS 着法，[0] 为初始 Fen 串
fn.getMoveList = function(){
	if (!this.getTurnForMove()) {
		return this.moveList.slice(0);
	}

	var result = [];

	for (var i = 0; i < this.moveList.length; ++i) {
		if (i === 0) {
			result.push(vs.turnFen(this.moveList[i]));
		}
		else {
			result.push(vs.turnMove(this.moveList[i]));
		}
	}

	return result;
};

// 取得指定局面号 Fen 串
fn.getFenByStep = function(step){
	return this.getFenList()[vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
};

// 取得指定局面号节点 ICCS 着法，step 为 0 时返回初始 Fen 串
fn.getMoveByStep = function(step){
	return this.moveList[vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
};

// 取得当前 Fen 串
fn.getCurrentFen = function(){
	return this.getFenByStep(this.getCurrentStep());
};

// 取得初始 Fen 串
fn.getStartFen = function(){
	return this.getFenByStep(0);
};

// 取得当前节点 ICCS 着法，起始局面为初始 Fen 串
fn.getCurrentMove = function(){
	return this.getMoveByStep(this.getCurrentStep());
};

// 取得指定局面号着法是否为吃子着法
fn.getEatStatusByStep = function(step){
	return this.eatStatus[vs.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep())];
};

// 取得 UCCI 着法列表
fn.getUCCIList = function(step){
	step = vs.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep());
	var startIndex = 0, result = [];

	for (var i = step; i >= 0 && !startIndex; --i) {
		this.eatStatus[i] && (startIndex = i);
	}

	result.push(this.getFenList()[startIndex]);
	result = result.concat(this.getMoveList().slice(startIndex + 1, step + 1));
	return result;
};

// 取得 UCCI 局面列表
fn.getUCCIFenList = function(step){
	step = vs.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep());
    var startIndex = 0;

	for (var i = step; i >= 0 && !startIndex; --i) {
		this.eatStatus[i] && (startIndex = i);
	}

	return this.getFenList().slice(startIndex, step + 1);
};

// 取得重复长打着法（棋规判负）
fn.getRepeatLongThreatMove = function(){
	return vs.repeatLongThreatMove(this.getUCCIList());
};

// 取得重复一将一杀着法（中国棋规判负）
fn.getRepeatLongKillMove = function(){
	return vs.repeatLongKillMove(this.getUCCIList());
};

// 根据局面号取得节点
fn.getNodeByStep = function(step){
	step = vs.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep());
	return this.nodeList[step];
};
