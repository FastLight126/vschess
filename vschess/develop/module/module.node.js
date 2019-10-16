// 重建所有局面，一般用于变招切换和节点发生变化
fn.rebuildSituation = function(){
	this.situationList = [vs.fenToSituation(this.node.fen)];
	this.fenList   = [this.node.fen];
	this.moveList  = [this.node.fen];
	this.eatStatus = [false];
	this.commentList = [this.node.comment || ""];
	this.changeLengthList = [ ];
	this.currentNodeList  = [0];
	this.nodeList = [this.node];

	var turnFen = vs.turnFen(this.node.fen);

	this.moveNameList = {
		WXF		: [this.node.fen], WXFM		: [turnFen],
		ICCS	: [this.node.fen], ICCSM	: [turnFen],
		Chinese	: [this.node.fen], ChineseM	: [turnFen]
	};

	for (var currentNode = this.node; currentNode.next.length; ) {
		this.changeLengthList.push(currentNode.next.length );
		this.currentNodeList .push(currentNode.defaultIndex);
		currentNode = currentNode.next[currentNode.defaultIndex];
		this.nodeList.push(currentNode);

		var from = vs.i2s[currentNode.move.substring(0, 2)];
		var to   = vs.i2s[currentNode.move.substring(2, 4)];
		var lastSituation = this.situationList[this.lastSituationIndex()].slice(0);
		var prevFen = vs.situationToFen(lastSituation);
		var prevPieceCount = vs.countPieceLength(lastSituation);

		lastSituation[to  ] = lastSituation[from];
		lastSituation[from] = 1;
		lastSituation[0]    = 3  -   lastSituation[0];
		lastSituation[0]  === 1 && ++lastSituation[1];

		this.eatStatus		.push(vs.countPieceLength(lastSituation) !== prevPieceCount);
		this.moveList		.push(currentNode.move);
		this.commentList	.push(currentNode.comment || "");
		this.situationList	.push(lastSituation);
		this.fenList		.push(vs.situationToFen(lastSituation));

		var wxf  = vs.Node2WXF(currentNode.move, prevFen).move;
		var wxfM = wxf.charCodeAt(1) > 96 ? vs.Node2WXF(vs.turnMove(currentNode.move), vs.turnFen(prevFen)).move : vs.turnWXF(wxf);

		this.moveNameList.   ICCS .push(vs.Node2ICCS_NoFen(			   currentNode.move ));
		this.moveNameList.   ICCSM.push(vs.Node2ICCS_NoFen(vs.turnMove(currentNode.move)));
		this.moveNameList.    WXF .push(wxf );
		this.moveNameList.    WXFM.push(wxfM);
		this.moveNameList.Chinese .push(vs.Node2Chinese(wxf , prevFen, this.options));
		this.moveNameList.ChineseM.push(vs.Node2Chinese(wxfM, prevFen, this.options));
	}

	return this.rebuildExportAll().setExportFormat();
};

// 选择指定默认节点
fn.selectDefault = function(step){
	step = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var currentNode = this.node;

	for (var i = 0; i < step; ++i) {
		currentNode = currentNode.next[currentNode.defaultIndex];
	}

	return currentNode;
};

// 节点内是否含有指定着法
fn.hasMoveAtNode = function(move, step){
	var nextList = this.selectDefault(vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())).next;

	for (var i = 0; i < nextList.length; ++i) {
		if (nextList[i].move === move) {
			return true;
		}
	}

	return false;
};

// 节点增加着法
fn.addNodeByMoveName = function(move, step){
	step = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (!this.hasMoveAtNode(move, step)) {
		this.selectDefault(step).next.push({ move: move, comment: "", next: [], defaultIndex: 0 });
		++this._.nodeLength;
	}

	return this;
};

// 将节点内指定着法设为默认着法，并返回节点是否发生变化
fn.setMoveDefaultAtNode = function(move, step){
	step = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var currentNode = this.selectDefault(step);

	if (currentNode.next.length && currentNode.next[currentNode.defaultIndex].move === move) {
		return false;
	}

	for (var i = 0; i < currentNode.next.length; ++i) {
		if (currentNode.next[i].move === move) {
			currentNode.defaultIndex = i;
			this.setSaved(false);
			return true;
		}
	}

	this.addNodeByMoveName(move, step);
	currentNode.defaultIndex = currentNode.next.length - 1;
	this.setSaved(false);
	return true;
};

// 取得着法列表
fn.getMoveNameList = function(format, isMirror){
	typeof isMirror === "undefined" && (isMirror = this.getTurnForMove());

	switch (format) {
		case  "wxf": return isMirror ? this.moveNameList.    WXFM.slice(0) : this.moveNameList.    WXF.slice(0);
		case "iccs": return isMirror ? this.moveNameList.   ICCSM.slice(0) : this.moveNameList.   ICCS.slice(0);
		default    : return isMirror ? this.moveNameList.ChineseM.slice(0) : this.moveNameList.Chinese.slice(0);
	}

	return this;
};

// 刷新节点数
fn.refreshNodeLength = function(){
	var total = 1;

	function countNode(node){
		total += node.next.length;

		for (var i = 0; i < node.next.length; ++i) {
			countNode(node.next[i]);
		}
	}

	countNode(this.node);
	this._.nodeLength = total;
	return this;
};

// 取得节点数
fn.getNodeLength = function(){
	return this._.nodeLength;
};

// 设置当前节点树
fn.setNode = function(node){
	this.node = node;
	this.refreshNodeLength();
	return this;
};
