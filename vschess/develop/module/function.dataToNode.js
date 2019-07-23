// 检查原始数据中是否包含棋谱
vs.isDataHasBook = function(chessData, parseType){
	chessData = vs.replaceNbsp(chessData);
	var match, RegExp = vs.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~chessData.indexOf("n version") || parseType === "pfc") {
		return true;
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return true;
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return true;
	}

	// QQ新中国象棋格式
	if (parseType === "auto" && RegExp.QQNew.test(chessData) || parseType === "qqnew") {
		return true;
	}

	// 象棋世家格式
	if (parseType === "auto" && RegExp.ShiJia.test(chessData) || parseType === "shijia") {
		return true;
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return true;
	}

	// 发现着法，尝试识别
	if (RegExp.Chinese.test(chessData)) {
		return true;
	}

	if (RegExp.WXF.test(chessData)) {
		return true;
	}

	if (RegExp.ICCS.test(chessData)) {
		return true;
	}

	if (RegExp.Node.test(chessData)) {
		return true;
	}

	if (RegExp.FenMini.exec(chessData)) {
		return true;
	}

	return false;
};

// 将原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vs.dataToNode = function(chessData, parseType){
	var match, RegExp = vs.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~chessData.indexOf("n version") || parseType === "pfc") {
		return vs.dataToNode_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return vs.dataToNode_DhtmlXQ(chessData);
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return vs.dataToNode_DHJHtmlXQ(chessData);
	}

	// QQ新中国象棋格式
	if (parseType === "auto" && RegExp.QQNew.test(chessData) || parseType === "qqnew") {
		return vs.dataToNode_QQNew(chessData);
	}

	// 象棋世家格式
	if (parseType === "auto" && RegExp.ShiJia.test(chessData) || parseType === "shijia") {
		return vs.dataToNode_ShiJia(chessData);
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return vs.dataToNode_PGN(chessData);
	}

	// 中国游戏中心 CCM 格式
	if (parseType === "auto" && vs.cca(chessData) === 1 || parseType === "ccm") {
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

	// 简易坐标格式兼容，将简易坐标转换为 ICCS 格式，然后直接调用 ICCS 转换器转换，其实 PGN 格式并没有此种着法格式。
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

	// 迷你 Fen 串
	if (match = RegExp.FenMini.exec(chessData)) {
		return { fen: match[0] + " w - - 0 1", comment: "", next: [], defaultIndex: 0 };
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
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "ICCS"]')) {
		var format = "iccs";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "WXF"]')) {
		var format = "wxf";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/1\-0([\S\s]*)/g, "").replace(/0\-1([\S\s]*)/g, "")
			.replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else {
		var format = "chinese";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
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
	var match, startFen, noFenData;

	if (match = RegExp.FenLong.exec(originalChessData)) {
		startFen  = match[0];
		noFenData = chessData.replace(RegExp.FenMini, "");
	}
	else if (match = RegExp.FenShort.exec(originalChessData)) {
		startFen = match[0] + " - - 0 1";
		noFenData = chessData.replace(RegExp.FenMini, "");
	}
	else if (match = RegExp.FenMini.exec(originalChessData)) {
		startFen = match[0] + " w - - 0 1";
		noFenData = chessData.replace(RegExp.FenMini, "");
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

	// 交换先后手，用于纠正 Fen 串的先后手错误和自动识别迷你 Fen 串的先后手
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

// 将东萍象棋 DhtmlXQ 格式转换为棋谱节点树
vs.dataToNode_DhtmlXQ = function(chessData, onlyFen){
	var DhtmlXQ_Comment	 = {};
	var DhtmlXQ_Change	 = [];
	var DhtmlXQ_Start	 = "";
	var DhtmlXQ_MoveList = "";
	var DhtmlXQ_Fen		 = "";
	var DhtmlXQ_EachLine = chessData.split("[DhtmlXQ");

	for (var i = 0; i < DhtmlXQ_EachLine.length; ++i) {
		var l = "[DhtmlXQ" + DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_comment")) {
			var start	  = l.indexOf("]");
			var commentId = l.substring(16, start);
			~commentId.indexOf("_") || (commentId = "0_" + commentId);
			DhtmlXQ_Comment[commentId] = l.substring(start + 1, l.indexOf("[/DhtmlXQ_")).replace(/\|\|/g, "\n").replace(/\\u([0-9a-zA-Z]{4})/g, function(){ return vs.fcc(parseInt(arguments[1], 16)); });
		}
		else if (~l.indexOf("[DhtmlXQ_binit")) {
			DhtmlXQ_Start = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_"));
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			DhtmlXQ_MoveList = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_"));
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start	 = l.indexOf("]");
			var changeId = l.substring(14, start);
			DhtmlXQ_Change.push({ id: changeId, change: l.substring(start + 1, l.indexOf("[/DhtmlXQ_")) });
		}
		else if (~l.indexOf("[DhtmlXQ_fen")) {
			DhtmlXQ_Fen = l.substring(l.indexOf("[DhtmlXQ_fen") + 13, l.indexOf("[/DhtmlXQ_"));
		}
	}

	// Fen 串优先
	if (DhtmlXQ_Fen) {
		var DhtmlXQ_ToFenFinal = DhtmlXQ_Fen;
	}
	// 抽取起始局面，生成起始 Fen 串
	else {
		if (DhtmlXQ_Start) {
			var DhtmlXQ_ToFen = new Array(91).join("*").split(""), DhtmlXQ_ToFenFinal = [];
			var DhtmlXQ_ToFenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp";

			for (var i = 0; i < 32; ++i) {
				var move = DhtmlXQ_Start.substring(i * 2, i * 2 + 2).split("");
				DhtmlXQ_ToFen[+move[0] + move[1] * 9] = DhtmlXQ_ToFenPiece.charAt(i);
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
	}

	if (onlyFen) {
		return DhtmlXQ_ToFenFinal;
	}

	var branchHashTable = {};

	// DhtmlXQ 着法列表转换为 node 节点列表
	function DhtmlXQ_MoveToMove(s){
		var moveList = [];

		while (s.length) {
			var move = s.slice(-4).split("");
			moveList.push(vs.fcc(+move[0] + 97) + (9 - move[1]) + vs.fcc(+move[2] + 97) + (9 - move[3]));
			s = s.slice(0, -4);
		}

		return moveList;
	}

	// 根据 node 节点列表创建分支
	function makeBranch(list, target, b, i){
		var next = { move: list.pop(), comment: DhtmlXQ_Comment[b + "_" + i] || "", next: [], defaultIndex: 0 };
		branchHashTable[b + "_" + ++i] = next;
		target.next.push(next);
		list.length && makeBranch(list, next, b, i);
	}

	// 生成主分支
	var result   = { fen: DhtmlXQ_ToFenFinal, comment: DhtmlXQ_Comment["0_0"] || "", next: [], defaultIndex: 0 };
	var moveList = DhtmlXQ_MoveToMove(DhtmlXQ_MoveList);
	branchHashTable["0_1"] = result;
	moveList.length && makeBranch(moveList, result, 0, 1);

	// 生成变着分支
	var undoList = [];

	for (var i = 0; i < DhtmlXQ_Change.length; ++i) {
		var line   = DhtmlXQ_Change[i];
		var id     = line.id.split("_");
		var target = branchHashTable[id[0] + "_" + id[1]];

		if (target) {
			var moveList = DhtmlXQ_MoveToMove(line.change);
			moveList.length && makeBranch(moveList, target, id[2], id[1]);
			undoList.length = 0;
		}
		else {
			if (~undoList.indexOf(line.id)) {
				break;
			}
			else {
				DhtmlXQ_Change.push(line   );
				undoList      .push(line.id);
			}
		}
	}

	return result;
};

// 将广东象棋网打虎将 DHJHtmlXQ 格式转换为棋谱节点树
vs.dataToNode_DHJHtmlXQ = function(chessData){
	chessData = chessData.replace(/DHJHtmlXQ/g, "DhtmlXQ");
	chessData = chessData.replace(/DhtmlXQ_31/g, "DhtmlXQ_fen");
	chessData = chessData.replace(/DhtmlXQ_32/g, "DhtmlXQ_startPlayer");
	chessData = chessData.replace(/DhtmlXQ_33/g, "DhtmlXQ_startStep");
	chessData = chessData.replace(/DhtmlXQ_34/g, "DhtmlXQ_movelist");
	chessData = chessData.replace(/game_comment_/g, "DhtmlXQ_comment");
	chessData = chessData.replace(/comment_/g, "DhtmlXQ_comment");

	if (~chessData.indexOf("[DhtmlXQ_startPlayer")) {
		var start = chessData.indexOf("[DhtmlXQ_startPlayer");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var begin = chessData.substring(start + 21, end);
		begin = +begin === 1 ? "b" : "w";
	}
	else {
		var begin = "w";
	}

	if (~chessData.indexOf("[DhtmlXQ_startStep")) {
		var start = chessData.indexOf("[DhtmlXQ_startStep");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var step  = chessData.substring(start + 19, end);
		step = begin === "w" ? Math.floor(step / 2) + 1 : Math.ceil(step / 2) + 1;
	}
	else {
		var step = 1;
	}

	if (~chessData.indexOf("[DhtmlXQ_fen")) {
		var start = chessData.indexOf("[DhtmlXQ_fen");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var fen   = chessData.substring(start + 13, end);

		if (fen) {
			fen = vs.arrayToFen(fen.split("")) + " " + begin + " - - 0 " + step;
		}
		else {
			fen = vs.defaultFen;
		}

		chessData = chessData.replace(chessData.substring(start, end + 14), "[DhtmlXQ_fen]" + fen + "[/DhtmlXQ_fen]");
	}

	if (~chessData.indexOf("[DhtmlXQ_movelist")) {
		var start = chessData.indexOf("[DhtmlXQ_movelist");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var moves = chessData.substring(start + 18, end);

		var moveSplit = moves.split("");

		for (var i = 1; i < moveSplit.length; i += 2) {
			moveSplit[i] = 9 - moveSplit[i];
		}

		moves = moveSplit.join("");
		chessData = chessData.replace(chessData.substring(start, end + 19), "[DhtmlXQ_movelist]" + moves + "[/DhtmlXQ_movelist]");
	}

	return vs.dataToNode_DhtmlXQ(chessData);
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
		var chessman  = "*PPPPPCCNNRRBBAAKpppppccnnrrbbaak";
		var situation = vs.fenToSituation(vs.blankFen);
		situation[0]  = match[33].toUpperCase() === "B" ? 2 : 1;

		for (var i = 1; i < 33; ++i) {
			situation[match[i] - 1] = vs.f2n[chessman.charAt(i)];
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
