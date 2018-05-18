// 取得当前节点树路径下局面数量
fn.getSituationListLength = function(){
	return this.situationList.length;
};

// 取得当前节点树路径下最后局面的索引号
fn.lastSituationIndex = function(){
	return this.getSituationListLength() - 1;
};

// 取得当前节点树路径下的所有 Fen 串
fn.getFenList = function(){
	if (!this.getTurnForMove()) {
		return this.fenList;
	}

	var result = [];

	for (var i=0;i<this.fenList.length;++i) {
		result.push(vs.turnFen(this.fenList[i]));
	}

	return result;
};

// 取得当前节点树路径下的所有节点 ICCS 着法，[0] 为初始 Fen 串
fn.getMoveList = function(){
	return this.moveList;
};

// 取得指定局面号 Fen 串
fn.getFenByStep = function(step){
	return this.getFenList()[vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
};

// 取得指定局面号节点 ICCS 着法，step 为 0 时返回初始 Fen 串
fn.getMoveByStep = function(step){
	return this.getMoveList()[vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
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
