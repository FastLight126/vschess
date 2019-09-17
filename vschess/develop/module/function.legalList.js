// 将军检查器
vs.checkThreat = function(situation){
    if (typeof situation === "string") {
		var RegExp = vs.RegExp();
		RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
	}

    situation = situation.slice(0);
	var kingIndex = 0;
	var player = situation[0];
	var enermy = 3 - player;

	// 寻找帅、将
	if (player === 1) {
		for (var i = 0; !kingIndex && i < 9; ++i) {
			situation[vs.castleR[i]] === 21 && (kingIndex = vs.castleR[i]);
		}
	}
	else {
		for (var i = 0; !kingIndex && i < 9; ++i) {
			situation[vs.castleB[i]] === 37 && (kingIndex = vs.castleB[i]);
		}
	}

	// 车、将、帅
	for (var k = 0; k < 4; ++k) {
		for (var i = kingIndex + vs.kingDelta[k]; situation[i]; i += vs.kingDelta[k]) {
			if (situation[i] > 1) {
				if (((situation[i] & 15) === 1 || (situation[i] & 15) === 5) && situation[i] >> 4 === enermy) {
					return true;
				}

				break;
			}
		}
	}

	// 马
	for (var i = 0; i < 4; ++i) {
		if (situation[kingIndex + vs.advisorDelta[i]] === 1) {
			var piece = situation[kingIndex + vs.knightCheckDelta[i][0]];

			if ((piece & 15) === 2 && piece >> 4 === enermy) {
				return true;
			}

			var piece = situation[kingIndex + vs.knightCheckDelta[i][1]];

			if ((piece & 15) === 2 && piece >> 4 === enermy) {
				return true;
			}
		}
	}

	// 炮
	for (var k = 0; k < 4; ++k) {
		var barbette = false;

		for (var i = kingIndex + vs.kingDelta[k]; situation[i]; i += vs.kingDelta[k]) {
			if (barbette) {
				if (situation[i] > 1) {
					if ((situation[i] & 15) === 6 && situation[i] >> 4 === enermy) {
						return true;
					}

					break;
				}
			}
			else {
				situation[i] > 1 && (barbette = true);
			}
		}
	}

	// 兵、卒
	if ((situation[kingIndex + 1] & 15) === 7 && situation[kingIndex + 1] >> 4 === enermy) {
		return true;
	}

	if ((situation[kingIndex - 1] & 15) === 7 && situation[kingIndex - 1] >> 4 === enermy) {
		return true;
	}

	if (player === 1) {
		if ((situation[kingIndex - 16] & 15) === 7 && situation[kingIndex - 16] >> 4 === 2) {
			return true;
		}
	}
	else {
		if ((situation[kingIndex + 16] & 15) === 7 && situation[kingIndex + 16] >> 4 === 1) {
			return true;
		}
	}

	return false;
};

// 检查局面是否有合法着法（未被将杀或困毙）
vs.hasLegalMove = function(situation){
	if (typeof situation === "string") {
		var RegExp = vs.RegExp();
		RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
	}

	var legalList = [];
	var player = situation[0];
	var enermy = 3 - player;

	function checkMove(src, dst) {
		var s  = situation.slice(0);
		s[dst] = s[src];
		s[src] = 1;
		return !vs.checkThreat(s);
	}

	// 棋盘搜索边界
	for (var i = 51; i < 204; ++i) {
		if (situation[i] >> 4 !== player) {
			continue;
		}

		var piece = situation[i] & 15;

		// 车
		if (piece === 1) {
			for (var k = 0; k < 4; ++k) {
				for (var j = i + vs.kingDelta[k]; situation[j]; j += vs.kingDelta[k]) {
					if (situation[j] === 1) {
						if (checkMove(i, j)) return true;
						continue;
					}

					if (situation[j] >> 4 === enermy && checkMove(i, j)) return true;
					break;
				}
			}
		}

		// 马
		else if (piece === 2) {
			for (var j = 0; j < 4; ++j) {
				if (situation[i + vs.kingDelta[j]] === 1) {
					var targetIndex0 = i + vs.knightDelta[j][0];
					var targetIndex1 = i + vs.knightDelta[j][1];
					if (situation[targetIndex0] && situation[targetIndex0] >> 4 !== player && checkMove(i, targetIndex0)) return true;
					if (situation[targetIndex1] && situation[targetIndex1] >> 4 !== player && checkMove(i, targetIndex1)) return true;
				}
			}
		}

		// 相、象
		else if (piece === 3) {
			// 红方相
			if (player === 1) {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vs.advisorDelta[j]] === 1) {
						var targetIndex = i + (vs.advisorDelta[j] << 1);
						if (situation[targetIndex] >> 4 !== player && targetIndex > 127 && checkMove(i, targetIndex)) return true;
					}
				}
			}

			// 黑方象
			else {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vs.advisorDelta[j]] === 1) {
						var targetIndex = i + (vs.advisorDelta[j] << 1);
						if (situation[targetIndex] >> 4 !== player && targetIndex < 127 && checkMove(i, targetIndex)) return true;
					}
				}
			}
		}

		// 仕、士
		else if (piece === 4) {
			for (var j = 0; j < 4; ++j) {
				var targetIndex = i + vs.advisorDelta[j];
				if (vs.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkMove(i, targetIndex)) return true;
			}
		}

		// 帅、将
		else if (piece === 5) {
			for (var k = 0; k < 4; ++k) {
				var targetIndex = i + vs.kingDelta[k];
				if (vs.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkMove(i, targetIndex)) return true;
			}
		}

		// 炮
		else if (piece === 6) {
			for (var k = 0; k < 4; ++k) {
				var barbette = false;

				for (var j = i + vs.kingDelta[k]; situation[j]; j += vs.kingDelta[k]) {
					if (barbette) {
						if (situation[j] === 1) {
							continue;
						}

						if (situation[j] >> 4 === enermy && checkMove(i, j)) return true;
						break;
					}
					else {
						if (situation[j] === 1) {
							if (checkMove(i, j)) return true;
						}
						else {
							barbette = true;
						}
					}
				}
			}
		}

		// 兵、卒
		else  {
			// 红方兵
			if (player === 1) {
				if (situation[i - 16] && situation[i - 16] >> 4 !== 1 &&			checkMove(i, i - 16)) return true;
				if (situation[i +  1] && situation[i +  1] >> 4 !== 1 && i < 128 &&	checkMove(i, i +  1)) return true;
				if (situation[i -  1] && situation[i -  1] >> 4 !== 1 && i < 128 &&	checkMove(i, i -  1)) return true;
			}

			// 黑方卒
			else {
				if (situation[i + 16] && situation[i + 16] >> 4 !== 2 &&			checkMove(i, i + 16)) return true;
				if (situation[i -  1] && situation[i -  1] >> 4 !== 2 && i > 127 &&	checkMove(i, i -  1)) return true;
				if (situation[i +  1] && situation[i +  1] >> 4 !== 2 && i > 127 &&	checkMove(i, i +  1)) return true;
			}
		}
	}

	return false;
};

// 着法生成器（索引模式）
vs.legalList = function(situation){
	if (typeof situation === "string") {
		var RegExp = vs.RegExp();
		RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
	}

	var legalList = [];
	var player = situation[0];
	var enermy = 3 - player;

	function checkPush(step) {
		var s = situation.slice(0);
		s[step[1]] = s[step[0]];
		s[step[0]] = 1;
		vs.checkThreat(s) || legalList.push(step);
	}

	// 棋盘搜索边界
	for (var i = 51; i < 204; ++i) {
		if (situation[i] >> 4 !== player) {
			continue;
		}

		var piece = situation[i] & 15;

		// 车
		if (piece === 1) {
			for (var k = 0; k < 4; ++k) {
				for (var j = i + vs.kingDelta[k]; situation[j]; j += vs.kingDelta[k]) {
					if (situation[j] === 1) {
						checkPush([i, j]);
						continue;
					}

					situation[j] >> 4 === enermy && checkPush([i, j]);
					break;
				}
			}
		}

		// 马
		else if (piece === 2) {
			for (var j = 0; j < 4; ++j) {
				if (situation[i + vs.kingDelta[j]] === 1) {
					var targetIndex0 = i + vs.knightDelta[j][0];
					var targetIndex1 = i + vs.knightDelta[j][1];
					situation[targetIndex0] && situation[targetIndex0] >> 4 !== player && checkPush([i, targetIndex0]);
					situation[targetIndex1] && situation[targetIndex1] >> 4 !== player && checkPush([i, targetIndex1]);
				}
			}
		}

		// 相、象
		else if (piece === 3) {
			// 红方相
			if (player === 1) {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vs.advisorDelta[j]] === 1) {
						var targetIndex = i + (vs.advisorDelta[j] << 1);
						situation[targetIndex] >> 4 !== player && targetIndex > 127 && checkPush([i, targetIndex]);
					}
				}
			}

			// 黑方象
			else {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vs.advisorDelta[j]] === 1) {
						var targetIndex = i + (vs.advisorDelta[j] << 1);
						situation[targetIndex] >> 4 !== player && targetIndex < 127 && checkPush([i, targetIndex]);
					}
				}
			}
		}

		// 仕、士
		else if (piece === 4) {
			for (var j = 0; j < 4; ++j) {
				var targetIndex = i + vs.advisorDelta[j];
				vs.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkPush([i, targetIndex]);
			}
		}

		// 帅、将
		else if (piece === 5) {
			for (var k = 0; k < 4; ++k) {
				var targetIndex = i + vs.kingDelta[k];
				vs.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkPush([i, targetIndex]);
			}
		}

		// 炮
		else if (piece === 6) {
			for (var k = 0; k < 4; ++k) {
				var barbette = false;

				for (var j = i + vs.kingDelta[k]; situation[j]; j += vs.kingDelta[k]) {
					if (barbette) {
						if (situation[j] === 1) {
							continue;
						}

						situation[j] >> 4 === enermy && checkPush([i, j]);
						break;
					}
					else {
						situation[j] === 1 ? checkPush([i, j]) : barbette = true;
					}
				}
			}
		}

		// 兵、卒
		else  {
			// 红方兵
			if (player === 1) {
				situation[i - 16] && situation[i - 16] >> 4 !== 1 &&			checkPush([i, i - 16]);
				situation[i +  1] && situation[i +  1] >> 4 !== 1 && i < 128 &&	checkPush([i, i +  1]);
				situation[i -  1] && situation[i -  1] >> 4 !== 1 && i < 128 &&	checkPush([i, i -  1]);
			}

			// 黑方卒
			else {
				situation[i + 16] && situation[i + 16] >> 4 !== 2 &&			checkPush([i, i + 16]);
				situation[i -  1] && situation[i -  1] >> 4 !== 2 && i > 127 &&	checkPush([i, i -  1]);
				situation[i +  1] && situation[i +  1] >> 4 !== 2 && i > 127 &&	checkPush([i, i +  1]);
			}
		}
	}

	return legalList;
};

// 着法生成器（坐标模式）
vs.legalMoveList = function(situation){
	if (typeof situation === "string") {
		var RegExp = vs.RegExp();
		RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
	}

	var legalList = vs.legalList(situation), result = [];

	for (var i = 0; i < legalList.length; ++i) {
		result.push(vs.s2i[legalList[i][0]] + vs.s2i[legalList[i][1]]);
	}

	return result;
};

// Fen 串合法性检查，返回错误列表，列表长度为 0 表示没有错误
vs.checkFen = function(fen){
	var RegExp = vs.RegExp();

	if (!RegExp.FenShort.test(fen)) {
		return ["Fen 串不合法"];
	}

	var errorList = [], board = vs.fenToArray(fen), Kk = false;
	var total = { R: 0, N: 0, B: 0, A: 0, K: 0, C: 0, P: 0, r: 0, n: 0, b: 0, a: 0, k: 0, c: 0, p: 0, "*": 0 };

	function push(error){
		~errorList.indexOf(error) || errorList.push(error);
	}

	for (var i = 0; i < 90; ++i) {
		board[i] === "K" && !~[ 66, 67, 68, 75, 76, 77, 84, 85, 86 ].indexOf(i    )  && push("红方帅的位置不符合规则");
		board[i] === "k" && !~[  3,  4,  5, 12, 13, 14, 21, 22, 23 ].indexOf(i    )  && push("黑方将的位置不符合规则");
		board[i] === "B" && !~[     47, 51, 63, 67, 71, 83, 87     ].indexOf(i    )  && push("红方相的位置不符合规则");
		board[i] === "b" && !~[      2,  6, 18, 22, 26, 38, 42     ].indexOf(i    )  && push("黑方象的位置不符合规则");
		board[i] === "A" && !~[         66, 68, 76, 84, 86         ].indexOf(i    )  && push("红方仕的位置不符合规则");
		board[i] === "a" && !~[          3,  5, 13, 21, 23         ].indexOf(i    )  && push("黑方士的位置不符合规则");
		board[i] === "P" && (i >= 63 || i >= 45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("红方兵的位置不符合规则");
		board[i] === "p" && (i <  27 || i <  45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("黑方卒的位置不符合规则");

		++total[board[i]];

		if (board[i] === "K") {
			for (var j = i - 9; j > 0; j -= 9) {
				if (board[j] !== "*") {
					board[j] === "k" && (Kk = true) && push("帅将面对面了");
					break;
				}
			}
		}
	}

	board[45] === "P" && board[54] === "P" && push("红方九路出现未过河的重叠兵");
	board[47] === "P" && board[56] === "P" && push("红方七路出现未过河的重叠兵");
	board[49] === "P" && board[58] === "P" && push("红方五路出现未过河的重叠兵");
	board[51] === "P" && board[60] === "P" && push("红方三路出现未过河的重叠兵");
	board[53] === "P" && board[62] === "P" && push("红方一路出现未过河的重叠兵");
	board[27] === "p" && board[36] === "p" && push("黑方１路出现未过河的重叠卒");
	board[29] === "p" && board[38] === "p" && push("黑方３路出现未过河的重叠卒");
	board[31] === "p" && board[40] === "p" && push("黑方５路出现未过河的重叠卒");
	board[33] === "p" && board[42] === "p" && push("黑方７路出现未过河的重叠卒");
	board[35] === "p" && board[44] === "p" && push("黑方９路出现未过河的重叠卒");

	total.R > 2 && push("红方出现了" + total.R + "个车，多了" + (total.R - 2) + "个");
	total.r > 2 && push("黑方出现了" + total.r + "个车，多了" + (total.r - 2) + "个");
	total.N > 2 && push("红方出现了" + total.N + "个马，多了" + (total.N - 2) + "个");
	total.n > 2 && push("黑方出现了" + total.n + "个马，多了" + (total.n - 2) + "个");
	total.B > 2 && push("红方出现了" + total.B + "个相，多了" + (total.B - 2) + "个");
	total.b > 2 && push("黑方出现了" + total.b + "个象，多了" + (total.b - 2) + "个");
	total.A > 2 && push("红方出现了" + total.A + "个仕，多了" + (total.A - 2) + "个");
	total.a > 2 && push("黑方出现了" + total.a + "个士，多了" + (total.a - 2) + "个");
	total.C > 2 && push("红方出现了" + total.C + "个炮，多了" + (total.C - 2) + "个");
	total.c > 2 && push("黑方出现了" + total.c + "个炮，多了" + (total.c - 2) + "个");
	total.P > 5 && push("红方出现了" + total.P + "个兵，多了" + (total.P - 5) + "个");
	total.p > 5 && push("黑方出现了" + total.p + "个卒，多了" + (total.p - 5) + "个");
	total.K > 1 && push("红方出现了" + total.K + "个帅，多了" + (total.K - 1) + "个");
	total.k > 1 && push("黑方出现了" + total.k + "个将，多了" + (total.k - 1) + "个");
	total.K < 1 && push("红方必须有一个帅");
	total.k < 1 && push("黑方必须有一个将");

	if (!Kk) {
		if (vs.checkThreat(fen) && vs.checkThreat(vs.fenChangePlayer(fen))) {
			push("红黑双方同时被将军");
		}
		else if (vs.checkThreat(vs.fenChangePlayer(fen))) {
			fen.split(" ")[1] === "b" ? push("轮到黑方走棋，但此时红方正在被将军") : push("轮到红方走棋，但此时黑方正在被将军");
		}
	}

	return errorList;
};

// 杀棋着法生成器
vs.killMove = function(fen){
	var RegExp = vs.RegExp();
	RegExp.FenShort.test(fen) || (fen = vs.defaultFen);
	var legalList = vs.legalMoveList(fen);
	var result    = [];

	for (var i = 0; i < legalList.length; ++i) {
		var movedFen = vs.fenMovePiece(fen, legalList[i]);

		if (vs.checkThreat(movedFen) && vs.legalList(movedFen).length === 0) {
			result.push(legalList[i]);
		}
	}

	return result;
};

// 是否有杀棋着法
vs.hasKillMove = function(situation){
	if (typeof situation === "string") {
		var RegExp = vs.RegExp();
		RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
	}

	var legalList = vs.legalList(situation);

	for (var i = 0; i < legalList.length; ++i) {
		var movedSituation = situation.slice(0);
		movedSituation[legalList[i][1]] = movedSituation[legalList[i][0]];
		movedSituation[legalList[i][0]] = 1;
		movedSituation[0] = 3 - movedSituation[0];

		if (vs.checkThreat(movedSituation) && !vs.hasLegalMove(movedSituation)) {
			return true;
		}
	}

	return false;
};

// 叫杀检查器
vs.checkKill = function(fen){
	var RegExp = vs.RegExp();
	RegExp.FenShort.test(fen) || (fen = vs.defaultFen);
	return vs.checkThreat(fen) ? false : vs.hasKillMove(vs.fenChangePlayer(fen));
};

// 计算长打着法
vs.repeatLongThreatMove = function(moveList){
	if (moveList.length < 13) {
		return [];
	}

	var fenList = [moveList[0]];

	for (var i = 1; i < moveList.length; ++i) {
		fenList.push(vs.fenMovePiece(fenList[i - 1], moveList[i]))
	}

	var threatFenList = {};

	for (var i = fenList.length - 2; i >= 0; i -= 2) {
		if (vs.checkThreat(fenList[i])) {
			if (vs.checkThreat(fenList[i + 1])) {
				break;
			}

			var shortFen = fenList[i].split(" ", 2).join(" ");
			shortFen in threatFenList ? ++threatFenList[shortFen] : (threatFenList[shortFen] = 1);
		}
		else {
			break;
		}
	}

	if (fenList.length - i < 14) {
		return [];
	}

	var lastFen		= fenList[fenList.length - 1];
	var legalList	= vs.legalMoveList(lastFen);
	var banMoveList	= [];
	var canMoveList	= [];

	for (var i = 0; i < legalList.length; ++i) {
		var move     = legalList[i];
		var movedFen = vs.fenMovePiece(lastFen, move).split(" ", 2).join(" ");
		threatFenList[movedFen] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
	}

	return banMoveList;
};

// 计算一将一杀着法
vs.repeatLongKillMove = function(moveList){
	if (moveList.length < 13 || vs.repeatLongThreatMove(moveList)) {
		return [];
	}

	var fenList = [moveList[0]];

	for (var i = 1; i < moveList.length; ++i) {
		fenList.push(vs.fenMovePiece(fenList[i - 1], moveList[i]))
	}

	var killFenList = {};

	for (var i = fenList.length - 2; i >= 0; i -= 2) {
		if (vs.checkThreat(fenList[i])) {
			var shortFen = fenList[i].split(" ", 2).join(" ");
			shortFen in killFenList ? ++killFenList[shortFen] : (killFenList[shortFen] = 1);
		}
		else if (vs.checkKill(fenList[i])) {
			"kill" in killFenList ? ++killFenList["kill"] : (killFenList["kill"] = 1);
		}
		else {
			break;
		}
	}

	var lastFen		= fenList[fenList.length - 1];
	var legalList	= vs.legalMoveList(lastFen);
	var banMoveList	= [];
	var canMoveList	= [];

	if (fenList.length - i < 14) {
		return [];
	}

	for (var i = 0; i < legalList.length; ++i) {
		var move     = legalList[i];
		var movedFen = vs.fenMovePiece(lastFen, move).split(" ", 2).join(" ");

		if (vs.checkKill(movedFen)) {
			killFenList["kill"] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
		}
		else {
			killFenList[movedFen] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
		}
	}

	return canMoveList.length ? banMoveList : [];
};
