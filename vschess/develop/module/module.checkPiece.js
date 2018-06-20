// 检查指定局面号下指定位置是否为红方棋子
fn.isR = function(index, step){
	step  = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vs.turn[this.getTurn()][vs.limit(index, 0, 89)];
	return this.situationList[step][vs.b2s[index]] >> 4 === 1;
};

// 检查指定局面号下指定位置是否为黑方棋子
fn.isB = function(index, step){
	step  = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vs.turn[this.getTurn()][vs.limit(index, 0, 89)];
	return this.situationList[step][vs.b2s[index]] >> 4 === 2;
};

// 检查指定局面号下指定位置是否无棋子
fn.isN = function(index, step){
	step  = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vs.turn[this.getTurn()][vs.limit(index, 0, 89)];
	return this.situationList[step][vs.b2s[index]] === 1;
};

// 检查指定局面号下指定位置是否为己方棋子
fn.isPlayer = function(index, step){
	step  = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vs.turn[this.getTurn()][vs.limit(index, 0, 89)];
	return this.situationList[step][vs.b2s[index]] >> 4 === this.situationList[step][0];
};

// 检查指定局面号下指定位置是否为敌方棋子
fn.isEnermy = function(index, step){
	step  = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vs.turn[this.getTurn()][vs.limit(index, 0, 89)];
	return this.situationList[step][vs.b2s[index]] >> 4 === 3 - this.situationList[step][0];
};

// 获取指定起始棋子的所有合法目标坐标
fn.getLegalByStartPieceIndex = function(startIndex){
	startIndex = vs.b2s[vs.turn[this.getTurn()][vs.limit(startIndex, 0, 89)]];
	var legalList = [];

	for (var i = 0; i < this.legalList.length; ++i) {
		var targetIndex = vs.turn[this.getTurn()][vs.s2b[this.legalList[i][1]]];
		this.legalList[i][0] === startIndex && legalList.push(targetIndex);
	}

	return legalList;
};
