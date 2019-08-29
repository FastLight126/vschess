// 中文着法转换为节点 ICCS
vs.Chinese2Node = function(move, fen){
	var RegExp = vs.RegExp();
	RegExp.FenShort.test(fen) || (fen = vs.defaultFen);

	if (!RegExp.Chinese.test(move)) {
		return { move: "none", movedFen: vs.defaultFen };
	}

	var cStr = "车車俥马馬傌相象仕士帅帥将將炮包砲兵卒前进進后後退平中一二三四五六七八九壹贰叁肆伍陆柒捌玖１２３４５６７８９123456789";
	var eStr = "RRRNNNBBAAKKKKCCCPP+++---..123456789123456789123456789123456789";
	var moveSplit = move.split("");

	for (var i = 0; i < 4; ++i) {
		moveSplit[i] = eStr.charAt(cStr.indexOf(moveSplit[i]));
	}

	return vs.WXF2Node(moveSplit.join(""), fen);
};

// WXF 着法转换为节点 ICCS
vs.WXF2Node = function(move, fen){
	var RegExp = vs.RegExp();
	RegExp.FenShort.test(fen) || (fen = vs.defaultFen);

	if (!RegExp.WXF.test(move)) {
		return { move: "none", movedFen: vs.defaultFen };
	}

	move = move
		.replace(/^([RNHBEAKCPrnhbeakcp])([\+\-\.])/g, "$2$1")
		.replace(/^([Pp])[Aa]/g, "1$1").replace(/^([Pp])[Bb]/g, "2$1").replace(/^([Pp])[Cc]/g, "3$1")
		.replace(/^([Pp])[Dd]/g, "4$1").replace(/^([Pp])[Ee]/g, "5$1").replace(/^([Pp])[\.]/g, ".$1");

	var from = 0, to = 0;

	// 黑方旋转处理
	if (fen.split(" ")[1] === "b") {
		var situation = vs.fenToSituation(vs.roundFen(fen));
		var moveSplit = move.toLowerCase().split("");
		var player    = 2, N = 34, B = 35, A = 36, P = 39;
	}
	// 红方直接处理
	else {
		var situation = vs.fenToSituation(fen);
		var moveSplit = move.toUpperCase().split("");
		var player    = 1, N = 18, B = 19, A = 20, P = 23;
	}

	// 前
	if (moveSplit[0] === "+") {
		// 特殊兵卒东萍表示法
		if (vs.isNumber(moveSplit[1])) {
			for (var i = 60 - moveSplit[1]; i < 204 && !from; i += 16) {
				situation[i] === P && (from = i);
			}
		}
		// 兵卒
		else if (moveSplit[1].toUpperCase() === "P") {
			for (i = 51; i < 60 && !from; ++i) {
				for (var j = i, pList = []; j < 204; j += 16) {
					situation[j] === P && pList.push(j);
				}

				pList.length > 1 && (from = pList[0]);
			}
		}
		// 车马相象仕士帅将炮
		else {
			for (var i = 51; i < 204 && !from; ++i) {
				situation[i] === vs.f2n[moveSplit[1]] && (from = i);
			}
		}
	}
	// 后
	else if (moveSplit[0] === "-") {
		// 特殊兵卒东萍表示法
		if (vs.isNumber(moveSplit[1])) {
			for (var i = 204 - moveSplit[1]; i > 50 && !from; i -= 16) {
				situation[i] === P && (from = i);
			}
		}
		// 兵卒
		else if (moveSplit[1].toUpperCase() === "P") {
			for (i = 51; i < 60 && !from; ++i) {
				for (var j = i, pList = []; j < 204; j += 16) {
					situation[j] === P && pList.push(j);
				}

				pList.length > 1 && (from = pList.pop());
			}
		}
		// 车马相象仕士帅将炮
		else {
			for (var i = 203; i > 50 && !from; --i) {
				situation[i] === vs.f2n[moveSplit[1]] && (from = i);
			}
		}
	}
	// 中
	else if (moveSplit[0] === ".") {
		for (i = 51; i < 60 && !from; ++i) {
			for (var j = i, pList = []; j < 204; j += 16) {
				situation[j] === P && pList.push(j);
			}

			pList.length > 2 && (from = pList[1]);
		}
	}
	// 车马相象仕士帅将炮兵卒
	else if (isNaN(moveSplit[0])) {
		for (var i = 60 - moveSplit[1]; i < 204 && !from; i += 16) {
			situation[i] === vs.f2n[moveSplit[0]] && (from = i);
		}
	}
	// 特殊兵卒象棋巫师表示法
	else {
		for (var i = 59, pList = []; i > 50; --i) {
			for (var j = i, pColList = []; j < 204; j += 16) {
				situation[j] === P && pColList.push(j);
			}

			pColList.length > 1 && (pList = pList.concat(pColList));
		}

		from = pList[moveSplit[0] - 1];
	}

	// 马
	if (situation[from] === N) {
		if (moveSplit[2] === "+") {
			switch (moveSplit[3] - 12 + from % 16) {
				case -1: to = from - 31; break;
				case -2: to = from - 14; break;
				case  1: to = from - 33; break;
				case  2: to = from - 18; break;
			}
		}
		else {
			switch (moveSplit[3] - 12 + from % 16) {
				case -1: to = from + 33; break;
				case -2: to = from + 18; break;
				case  1: to = from + 31; break;
				case  2: to = from + 14; break;
			}
		}
	}
	// 相象
	else if (situation[from] === B) {
		switch (moveSplit[2] + moveSplit[3]) {
			case "+1": to = 171; from && (from = 201); break;
			case "-1": to = 171; from && (from = 137); break;
			case "+9": to = 163; from && (from = 197); break;
			case "-9": to = 163; from && (from = 133); break;
			case "+3": to = 137; from && (from = from === 167 ? 167 : 171); break;
			case "-3": to = 201; from && (from = from === 167 ? 167 : 171); break;
			case "+7": to = 133; from && (from = from === 167 ? 167 : 163); break;
			case "-7": to = 197; from && (from = from === 167 ? 167 : 163); break;
			case "+5": to = 167; from &&  from < 195 && (from += 64); break;
			case "-5": to = 167; from &&  from > 139 && (from -= 64); break;
		}
	}
	// 仕士
	else if (situation[from] === A) {
		switch (moveSplit[2] + moveSplit[3]) {
			case "+4": to = 168; from && (from = 183); break;
			case "-4": to = 200; from && (from = 183); break;
			case "+6": to = 166; from && (from = 183); break;
			case "-6": to = 198; from && (from = 183); break;
			case "+5": to = 183; from &&  from < 195 && (from += 32); break;
			case "-5": to = 183; from &&  from > 171 && (from -= 32); break;
		}
	}
	// 车帅将炮兵卒
	else {
		if (moveSplit[2] === "+") {
			to = from - moveSplit[3] * 16;
		}
		else if (moveSplit[2] === "-") {
			to = from + moveSplit[3] * 16;
		}
		else {
			to = from + 12 - from % 16 - moveSplit[3];
		}
	}

	if (from && to) {
		situation[to  ]   = situation[from];
		situation[from]   = 1;
		situation[0   ]   = 3    - situation[0];
		situation[0   ] === 1 && ++situation[1];

		if (player === 1) {
			return { move: vs.s2i[from] + vs.s2i[to], movedFen: vs.situationToFen(situation) };
		}
		else {
			return { move: vs.roundMove(vs.s2i[from] + vs.s2i[to]), movedFen: vs.roundFen(vs.situationToFen(situation)) };
		}
	}
	else {
		return { move: "none", movedFen: vs.defaultFen };
	}
};

// ICCS 着法转换为节点 ICCS
vs.ICCS2Node = function(move, fen){
	var RegExp = vs.RegExp();
	RegExp.FenShort.test(fen) || (fen = vs.defaultFen);

	if (!RegExp.ICCS.test(move)) {
		return { move: "none", movedFen: vs.defaultFen };
	}

	var situation = vs.fenToSituation(fen);
	var step = move.toLowerCase().split("-");
	situation[vs.i2s[step[1]]] = situation[vs.i2s[step[0]]];
	situation[vs.i2s[step[0]]] = 1;
	situation[0]   = 3    - situation[0];
	situation[0] === 1 && ++situation[1];
	return { move: step[0] + step[1], movedFen: vs.situationToFen(situation) };
};

// ICCS 着法转换为节点 ICCS（无 Fen 串）
vs.ICCS2Node_NoFen = function(move){
	return RegExp.ICCS.test(move) ? move.replace("-", "").toLowerCase() : "none";
};

// 着法列表转换为节点 ICCS 列表，列表第一个元素为起始局面 Fen 串
vs.stepList2nodeList = function(moveList, fen){
	var RegExp = vs.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		fen      = moveList.shift( );
	}
	else {
		RegExp.FenShort.test(fen) || (fen = vs.defaultFen);
	}

	var result = [fen], converter, currentFen = fen, stepData;

	if (moveList.length) {
		if (RegExp.ICCS.test(moveList[0])) {
			converter = vs.ICCS2Node;
		}
		else if (RegExp.WXF.test(moveList[0])) {
			converter = vs.WXF2Node;
		}
		else {
			converter = vs.Chinese2Node;
		}

		for (var i = 0; i < moveList.length; ++i) {
			var legalList = vs.legalMoveList(currentFen);
			stepData = converter(moveList[i], currentFen);

			if (~legalList.indexOf(stepData.move)) {
				currentFen = stepData.movedFen;
				result.push(stepData.move);
			}
			else {
				var exchangeMove = moveList[i].substring(3, 5) + "-" + moveList[i].substring(0, 2);
				stepData = converter(exchangeMove, currentFen);

				if (~legalList.indexOf(stepData.move)) {
					currentFen = stepData.movedFen;
					result.push(stepData.move);
				}
				else {
					break;
				}
			}
		}
	}

	return result;
};
