// 将军检查器
vs.checkThreat = function(situation){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
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
		if (situation[kingIndex + vs.advisorDelta[i]] == 1) {
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

// 着法生成器（索引模式）
vs.legalList = function(situation){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
	situation = situation.slice(0);
	var legalList = [];
	var player = situation[0];
	var enermy = 3 - player;

	function checkPush(step) {
		var targetOld = situation[step[1]];
		situation[step[1]] = situation[step[0]];
		situation[step[0]] = 1;
		vs.checkThreat(situation) || legalList.push(step);
		situation[step[0]] = situation[step[1]];
		situation[step[1]] = targetOld;
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
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
	var legalList = vs.legalList(situation), result = [];

	for (var i=0;i<legalList.length;++i) {
		result.push(vs.s2i[legalList[i][0]] + vs.s2i[legalList[i][1]]);
	}

	return result;
};

// Fen 串合法性检查，返回错误列表
vs.checkFen = function(fen){
	var fenSplit = fen.split(" "), errorList = [];
	var R = 0, N = 0, B = 0, A = 0, K = 0, C = 0, P = 0;
	var r = 0, n = 0, b = 0, a = 0, k = 0, c = 0, p = 0;

	function push(error){
		~errorList.indexOf(error) || errorList.push(error);
	}

	var board = fenSplit[0]
		.replace(/1/g, "*")
		.replace(/2/g, "**")
		.replace(/3/g, "***")
		.replace(/4/g, "****")
		.replace(/5/g, "*****")
		.replace(/6/g, "******")
		.replace(/7/g, "*******")
		.replace(/8/g, "********")
		.replace(/9/g, "*********")
		.replace(/\//g,"").split("");

	for (var i = 0; i < 90; ++i) {
		switch (board[i]) {
			case "R": ++R; break; case "r": ++r; break;
			case "N": ++N; break; case "n": ++n; break;
			case "B": ++B; break; case "b": ++b; break;
			case "A": ++A; break; case "a": ++a; break;
			case "K": ++K; break; case "k": ++k; break;
			case "C": ++C; break; case "c": ++c; break;
			case "P": ++P; break; case "p": ++p; break;
		}

		board[i] === "K" && !~[ 66, 67, 68, 75, 76, 77, 84, 85, 86 ].indexOf(i    )  && push("红方帅的位置不符合规则");
		board[i] === "k" && !~[  3,  4,  5, 12, 13, 14, 21, 22, 23 ].indexOf(i    )  && push("黑方将的位置不符合规则");
		board[i] === "B" && !~[     47, 51, 63, 67, 71, 83, 87     ].indexOf(i    )  && push("红方相的位置不符合规则");
		board[i] === "b" && !~[      2,  6, 18, 22, 26, 38, 42     ].indexOf(i    )  && push("黑方象的位置不符合规则");
		board[i] === "A" && !~[         66, 68, 76, 84, 86         ].indexOf(i    )  && push("红方仕的位置不符合规则");
		board[i] === "a" && !~[          3,  5, 13, 21, 23         ].indexOf(i    )  && push("黑方士的位置不符合规则");
		board[i] === "P" && (i >= 63 || i >= 45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("红方兵的位置不符合规则");
		board[i] === "p" && (i <  27 || i <  45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("黑方卒的位置不符合规则");

		if (board[i] === "K") {
			for (var j = i - 9; j > 0; j -= 9) {
				if (board[j] !== "*") {
					board[j] === "k" && push("帅将面对面了");
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

	R > 2 && push("红方出现了" + R + "个车，多了" + (R - 2) + "个");
	r > 2 && push("黑方出现了" + r + "个车，多了" + (r - 2) + "个");
	N > 2 && push("红方出现了" + N + "个马，多了" + (N - 2) + "个");
	n > 2 && push("黑方出现了" + n + "个马，多了" + (n - 2) + "个");
	B > 2 && push("红方出现了" + B + "个相，多了" + (B - 2) + "个");
	b > 2 && push("黑方出现了" + b + "个象，多了" + (b - 2) + "个");
	A > 2 && push("红方出现了" + A + "个仕，多了" + (A - 2) + "个");
	a > 2 && push("黑方出现了" + a + "个士，多了" + (a - 2) + "个");
	C > 2 && push("红方出现了" + C + "个炮，多了" + (C - 2) + "个");
	c > 2 && push("黑方出现了" + c + "个炮，多了" + (c - 2) + "个");
	P > 5 && push("红方出现了" + P + "个兵，多了" + (P - 5) + "个");
	p > 5 && push("黑方出现了" + p + "个卒，多了" + (p - 5) + "个");
	K > 1 && push("红方出现了" + K + "个帅，多了" + (K - 1) + "个");
	k > 1 && push("黑方出现了" + k + "个将，多了" + (k - 1) + "个");
	K < 1 && push("红方必须有一个帅");
	k < 1 && push("黑方必须有一个将");

	return errorList;
};

