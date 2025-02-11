// 将二进制原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vs.binaryToNode = function(buffer, parseType){
    parseType = parseType || "auto";

    // 象棋演播室 XQF 格式
	if (parseType === "auto" && vs.subhex(buffer, 0, 2) === "5851" || parseType === "xqf") {
		return vs.binaryToNode_XQF(buffer);
	}

    // 象棋桥 CBR 格式
	if (parseType === "auto" && vs.subhex(buffer, 0, 16) === "4343427269646765205265636f726400" || parseType === "cbr") {
		return vs.binaryToNode_CBR(buffer);
	}

    // 中国游戏中心 CCM 格式
	if (parseType === "auto" && vs.subhex(buffer, 0, 1) === "01" || parseType === "ccm") {
		return vs.binaryToNode_CCM(buffer);
	}

    // 未能识别的数据，返回起始局面
	return { fen: vs.defaultFen, comment: "", next: [], defaultIndex: 0 };
};

// 将中国游戏中心 CCM 格式转换为棋谱节点树
vs.binaryToNode_CCM = function(buffer) {
	var stepList = [];

	for (k = 1; k < buffer.length; k += 7) {
		var fromX = 8 - buffer[k + 2];
		var   toX = 8 - buffer[k + 3];
		var fromY = 9 - buffer[k + 4];
		var   toY = 9 - buffer[k + 5];
		stepList.push(vs.b2i[fromY * 9 + fromX] + vs.b2i[toY * 9 + toX]);
	}

	return vs.stepListToNode(vs.defaultFen, stepList);
};
