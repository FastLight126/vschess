// 将原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vs.dataToNode = function(chessData, parseType){
	var match, RegExp = vs.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType == "auto" && ~chessData.indexOf("n version") || parseType == "pfc") {
		return vs.dataToNode_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType == "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType == "DhtmlXQ") {
		return vs.dataToNode_DhtmlXQ(chessData);
	}

	// QQ新中国象棋格式
	if (parseType == "auto" && RegExp.QQNew.test(chessData) || parseType == "qqnew") {
		return vs.dataToNode_QQNew(chessData);
	}

	// 象棋世家格式
	if (parseType == "auto" && RegExp.ShiJia.test(chessData) || parseType == "shijia") {
		return vs.dataToNode_ShiJia(chessData);
	}

	// 标准 PGN 格式
	if (parseType == "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType == "pgn") {
		return vs.dataToNode_PGN(chessData);
	}

	// 中国游戏中心 CCM 格式
	if (parseType == "auto" && vs.cca(chessData) === 1 || parseType == "ccm") {
		return vs.dataToNode_CCM(chessData);
	}

	// 发现着法，尝试识别
	if (RegExp.Chinese.test(chessData)) {
		return vs.dataToNode_PGN('[Game "Chinese Chess"]' + chessData);
	}

	if (RegExp.WXF.test(chessData)) {
		return vs.dataToNode_PGN('[Game "Chinese Chess"][Format "WXF"]' + chessData);
	}

	if (RegExp.ICCS.test(chessData)) {
		return vs.dataToNode_PGN('[Game "Chinese Chess"][Format "ICCS"]' + chessData);
	}

	// 简易坐标格式兼容，将简易坐标转换为 ICCS 格式，然后直接调用 ICCS 转换器转换，其实PGN格式并没有此种着法格式。
	if (RegExp.Node.test(chessData)) {
		return vs.dataToNode_PGN('[Game "Chinese Chess"][Format "Node"]' + chessData);
	}

	// 长 Fen 串
	if (match = RegExp.FenLong.exec(chessData)) {
		return { fen: match[0], comment: "", next: [], defaultIndex: 0 };
	}

	// 短 Fen 串
	if (match = RegExp.FenShort.exec(chessData)) {
		return { fen: match[0] + " - - 0 1", comment: "", next: [], defaultIndex: 0 };
	}

	// 未能识别的数据，返回起始局面
	return { fen: vs.defaultFen, comment: "", next: [], defaultIndex: 0 };
};

// 将鹏飞象棋 PFC 格式转换为棋谱节点树
vs.dataToNode_PFC = function(chessData){
	chessData  = chessData.replace("<!--", "").replace("-->", "").replace(/<\?xml(.*)\?>/, "");
	chessData  = chessData.replace(/<n/ig, "<div").replace(/\/>/ig, "></div>").replace(/<\/n>/ig, "</div>");
	var node   = $($.trim(chessData));
	var result = { fen: node.attr("m"), comment: node.attr("c") || "", next: [], defaultIndex: 0 };

	function insertNext(node, target){
		node.children("div").each(function(index){
			var each = $(this);
			var insert = { move: each.attr("m"), comment: each.attr("c") || "", next: [], defaultIndex: 0 };
			each.attr("default") && (target.defaultIndex = index);
			target.next.push(insert);
			insertNext(each, insert);
		});
	}

	insertNext(node, result);
	return result;
};

// 将标准 PGN 格式转换为棋谱节点树
vs.dataToNode_PGN = function(chessData){
	var originalChessData = chessData, RegExp = vs.RegExp();

	// 识别着法格式
	if (~chessData.indexOf('[Format "Node"]')) {
		var format = "node";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "ICCS"]')) {
		var format = "iccs";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "WXF"]')) {
		var format = "wxf";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/1\-0([\S\s]*)/g, "").replace(/0\-1([\S\s]*)/g, "")
			.replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}
	else {
		var format = "chinese";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}

	// 抽取注释
	var RegExp_PGN_Comment = /\{([^\{\}]*)\}/, RegExp_PGN_Comment_Result, commentList = [];

	while (RegExp_PGN_Comment_Result = RegExp_PGN_Comment.exec(chessData)) {
		commentList.push(RegExp_PGN_Comment_Result[1]);
		chessData = chessData.replace(RegExp_PGN_Comment, "COMMENT");
	}

	// 映射着法和对应的注释
	var dataSplitByMove = [], commentListByStep = [];

	switch (format) {
		case "node": dataSplitByMove = chessData.split(RegExp.Node	 ); break;
		case "iccs": dataSplitByMove = chessData.split(RegExp.ICCS	 ); break;
		case "wxf" : dataSplitByMove = chessData.split(RegExp.WXF	 ); break;
		default    : dataSplitByMove = chessData.split(RegExp.Chinese); break;
	}

	for (var i = 0, j = 0; i < dataSplitByMove.length; ++i) {
		~dataSplitByMove[i].indexOf("COMMENT") && (commentListByStep[i] = commentList[j++]);
	}

	// 抽取起始 Fen 串
	var match, startFen, noFenData;//, RegExp = vs.RegExp();

	if (match = RegExp.FenLong.exec(originalChessData)) {
		startFen  = match[0];
		noFenData = chessData.replace(RegExp.FenShort, "");
	}
	else if (match = RegExp.FenShort.exec(originalChessData)) {
		startFen = match[0] + " - - 0 1";
		noFenData = chessData.replace(RegExp.FenShort, "");
	}
	else {
		startFen = vs.defaultFen;
		noFenData = chessData;
	}

	// 抽取着法
	var moveList = [];

	if (format === "node") {
		while (match = RegExp.Node.exec(noFenData)) {
			moveList.push(vs.Node2ICCS_NoFen(match[0]));
		}
	}
	else if (format === "iccs") {
		while (match = RegExp.ICCS.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}
	else if (format === "wxf") {
		while (match = RegExp.WXF.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}
	else {
		while (match = RegExp.Chinese.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}

	// 生成节点树
	var stepList = vs.stepList2nodeList(moveList, startFen);

	// 尝试识别黑先
	var fenChangePlayer = vs.fenChangePlayer(startFen);
	var stepListM = vs.stepList2nodeList(moveList, fenChangePlayer);

	if (stepListM.length > stepList.length) {
		startFen = fenChangePlayer;
		stepList = stepListM;
	}

	function makeBranch(list, target, b, i){
		var step = list.shift();
		var next = { move: step, comment: commentListByStep[i] || "", next: [], defaultIndex: 0 };
		target.next.push(next);
		list.length && makeBranch(list, next, b, i + 1);
	}

	var result = { fen: stepList.shift(), comment: commentListByStep[0] || "", next: [], defaultIndex: 0 };
	stepList.length && makeBranch(stepList, result, 0, 1);
	return result;
};

// 将东萍象棋 Dhtml 格式转换为棋谱节点树
vs.dataToNode_DhtmlXQ = function(chessData, onlyFen){
	var DhtmlXQ_Comment  = {};
	var DhtmlXQ_Change   = {};
	var DhtmlXQ_Start    = "";
	var DhtmlXQ_MoveList = "";
	var DhtmlXQ_EachLine = chessData.split("\n");

	for (var i = 0; i < DhtmlXQ_EachLine.length; ++i) {
		var l = DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_comment")) {
			var start	  = l.indexOf("]");
			var end 	  = l.indexOf("[/DhtmlXQ_comment");
			var commentId = l.substring(16, start);
			~commentId.indexOf("_") || (commentId = "0_" + commentId);
			DhtmlXQ_Comment[commentId] = l.substring(start + 1, end).replace(/\|\|/g, "\n");
		}
		else if (~l.indexOf("[DhtmlXQ_binit")) {
			DhtmlXQ_Start = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_binit"));
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			DhtmlXQ_MoveList = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_movelist"));
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start	 = l.indexOf("]");
			var end 	 = l.indexOf("[/DhtmlXQ_move_");
			var changeId = l.substring(14, start);
			DhtmlXQ_Change[changeId] = l.substring(start + 1, end);
		}
	}

	// 抽取起始局面，生成起始 Fen 串
	if (DhtmlXQ_Start) {
		var DhtmlXQ_ToFen = new Array(91).join("*").split(""), DhtmlXQ_ToFenFinal = [];
		var DhtmlXQ_ToFenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp".split("");

		for (var i = 0; i < 32; ++i) {
			var move = DhtmlXQ_Start.substring(i * 2, i * 2 + 2).split("");
			DhtmlXQ_ToFen[+move[0] + move[1] * 9] = DhtmlXQ_ToFenPiece[i];
		}

		DhtmlXQ_ToFenFinal = vs.arrayToFen(DhtmlXQ_ToFen);
	}
	else {
		var DhtmlXQ_ToFenFinal = vs.defaultFen.split(" ")[0];
		var DhtmlXQ_ToFen = vs.fenToArray(DhtmlXQ_ToFenFinal);
	}

	if (DhtmlXQ_MoveList) {
		var firstMovePos = DhtmlXQ_MoveList.substring(0, 2).split("");
		DhtmlXQ_ToFenFinal += vs.cca(DhtmlXQ_ToFen[+firstMovePos[0] + firstMovePos[1] * 9]) > 96 ? " b - - 0 1" : " w - - 0 1";
	}
	else {
		var checkW = DhtmlXQ_ToFenFinal + " w - - 0 1";
		var checkB = DhtmlXQ_ToFenFinal + " b - - 0 1";
		DhtmlXQ_ToFenFinal = vs.checkFen(checkB).length < vs.checkFen(checkW).length ? checkB : checkW;
	}

	if (onlyFen) {
		return DhtmlXQ_ToFenFinal;
	}

	var branchHashTable = {};

	function DhtmlXQ_MoveToMove(DhtmlXQ_MoveList){
		var moveList = [];

		while (DhtmlXQ_MoveList.length) {
			var move = DhtmlXQ_MoveList.substring(0, 4).split("");
			moveList.push(vs.fcc(+move[0] + 97) + (9 - move[1]) + vs.fcc(+move[2] + 97) + (9 - move[3]));
			DhtmlXQ_MoveList = DhtmlXQ_MoveList.substring(4);
		}

		return moveList;
	}

	function makeBranch(list, target, b, i){
		if (list.length === 0) return false;
		var next = { move: list.shift(), comment: DhtmlXQ_Comment[b + "_" + i] || "", next: [], defaultIndex: 0 };
		branchHashTable[b + "_" + ++i] = next;
		target.next.push(next);
		makeBranch(list, next, b, i);
	}

	// 生成主分支
	var result   = { fen: DhtmlXQ_ToFenFinal, comment: DhtmlXQ_Comment["0_0"] || "", next: [], defaultIndex: 0 };
	var moveList = DhtmlXQ_MoveToMove(DhtmlXQ_MoveList);
	branchHashTable["0_1"] = result;
	makeBranch(moveList, result, 0, 1);

	// 生成变着分支
	for (var id in DhtmlXQ_Change) {
		var idSplit  = id.split("_");
		var moveList = DhtmlXQ_MoveToMove(DhtmlXQ_Change[id]);
		makeBranch(moveList, branchHashTable[idSplit[0] + "_" + idSplit[1]], idSplit[2], idSplit[1]);
	}

	return result;
};

// 将 QQ 新中国象棋格式转换为棋谱节点树
vs.dataToNode_QQNew = function(chessData) {
	var match, stepList = [];
	var RegExp = vs.RegExp();

	while (match = RegExp.QQNew.exec(chessData)) {
		stepList.push(vs.fcc(105 - match[2]) + match[1] + vs.fcc(105 - match[4]) + match[3]);
	}

	return vs.stepListToNode(vs.defaultFen, stepList);
};

// 将象棋世家格式转换为棋谱节点树
vs.dataToNode_ShiJia = function(chessData, onlyFen) {
	var RegExp_Fen  = /([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)(?:[\s]+)\+([BbRr])/g;
	var RegExp_Move = /([0-9][a-zA-Z]-[0-9][a-zA-Z])/g;
	var match = RegExp_Fen.exec(chessData), stepList = [];

	if (match) {
		var chessman  = "*PPPPPCCNNRRBBAAKpppppccnnrrbbaak".split("");
		var situation = vs.fenToSituation(vs.blankFen);
		situation[0]  = match[33].toUpperCase() === "B" ? 2 : 1;

		for (var i = 1; i <= 32; ++i) {
			situation[match[i] - 1] = vs.f2n[chessman[i]];
		}

		var fen = vs.situationToFen(situation);
	}
	else {
		var fen = vs.defaultFen;
	}

	if (onlyFen) {
		return fen;
	}

	while (match = RegExp_Move.exec(chessData)) {
		var move = match[1].toUpperCase().split("");
		stepList.push(vs.fcc(+move[0] + 97) + (vs.cca(move[1]) - 65) + vs.fcc(+move[3] + 97) + (vs.cca(move[4]) - 65));
	}

	return vs.stepListToNode(fen, stepList);
};

// 将中国游戏中心 CCM 格式转换为棋谱节点树
vs.dataToNode_CCM = function(chessData) {
	chessData = chessData.substring(1);
	var stepList = [];

	while (chessData.length) {
		var fromX = 8 - chessData.charCodeAt(2);
		var   toX = 8 - chessData.charCodeAt(3);
		var fromY = 9 - chessData.charCodeAt(4);
		var   toY = 9 - chessData.charCodeAt(5);
		chessData =     chessData.substring (7);
		stepList.push(vs.b2i[fromY * 9 + fromX] + vs.b2i[toY * 9 + toX]);
	}

	return vs.stepListToNode(vs.defaultFen, stepList);
};

// 将着法列表转换为棋谱节点树
vs.stepListToNode = function(fen, stepList){
	function makeBranch(list, target, b, i){
		var step = list.shift();
		var next = { move: step, comment: "", next: [], defaultIndex: 0 };
		target.next.push(next);
		list.length && makeBranch(list, next, b, i + 1);
	}

	var result = { fen: fen || vs.defaultFen, comment: "", next: [], defaultIndex: 0 };
	stepList.length && makeBranch(stepList, result, 0, 1);
	return result;
};
