// 将整数限制在一个特定的范围内
vs.limit = function(num, min, max, defaultValue){
	typeof num == "undefined" && typeof defaultValue != "undefined" && (num = defaultValue);
	min = parseInt(min); isNaN(min) && (min = -Infinity);
	max = parseInt(max); isNaN(max) && (max =  Infinity);
	num = parseInt(num); isNaN(num) && (num = 0);
	num < min && (num = min);
	num > max && (num = max);
	return num;
};

// 正则表达式，使用时都是新的，避免出现 lastIndex 冲突
vs.RegExp = function(){
	return {
		// Fen 串识别正则表达式
		FenLong	: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr][\s]-[\s]-[\s][0-9]+[\s][0-9]+/,
		FenShort: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr]/,

		// 通用棋步识别正则表达式
		Chinese	: /[车車俥马馬傌相象仕士帅帥将將炮包砲兵卒前中后後一二三四五壹贰叁肆伍１２３４５1-5][车車俥马馬傌相象仕士炮包砲兵卒一二三四五六七八九壹贰叁肆伍陆柒捌玖１２３４５６７８９1-9][进進退平][一二三四五六七八九壹贰叁肆伍陆柒捌玖１２３４５６７８９1-9]/g,
		Node	: /[A-Ia-i][0-9][A-Ia-i][0-9]/g,
		ICCS	: /[A-Ia-i][0-9]-[A-Ia-i][0-9]/g,
		WXF		: /[RNHBEAKCPrnhbeakcp\+\-1-5][RNHBEAKCPrnhbeakcpd1-9\+\-\.][\+\-\.][1-9]/g,

		// 自动识别棋谱格式正则表达式
		QQNew	: /(?:[0-9]+) 32 (?:[0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) 0 (?:[0-9]+) 0/g,
		ShiJia	: /Moves(.*)Ends(.*)CommentsEnd/g,

		// 特殊兵东萍表示法
		Pawn	: /[\+\-2][1-9][\+\-\.][1-9]/
	};
};

// Fen 串改变走棋方
vs.fenChangePlayer = function(fen){
	var fenSplit = fen.split(" ");
	fenSplit[1]  = fenSplit[1] === "b" ? "w" : "b";
	return fenSplit.join(" ");
};

// Fen 串转换为局面
vs.fenToSituation = function(fen){
	var fenSplit  = fen.split(" ");
	var situation = vs.situation.slice(0);
	var currentPiece = 0;
	situation[0] = fenSplit[1] === "b" ? 2 : 1;
	situation[1] = vs.limit(fenSplit[5], 1, Infinity);

	var pieceEach = fenSplit[0]
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

	for (var i = 51; i < 204; ++i) {
		situation[i] && (situation[i] = vs.f2n[pieceEach[currentPiece++]]);
	}

	return situation;
};

// 局面转换为 Fen 串
vs.situationToFen = function(situation){
	var fen = [];

	for (var i = 51; i < 204; ++i) {
		situation[i]    && fen.push(vs.n2f[situation[i]]);
		(i & 15) === 15 && fen.push("/");
	}

	fen = fen.join("")
		.replace(/\*\*\*\*\*\*\*\*\*/g, "9")
		.replace(/\*\*\*\*\*\*\*\*/g, "8")
		.replace(/\*\*\*\*\*\*\*/g, "7")
		.replace(/\*\*\*\*\*\*/g, "6")
		.replace(/\*\*\*\*\*/g, "5")
		.replace(/\*\*\*\*/g, "4")
		.replace(/\*\*\*/g, "3")
		.replace(/\*\*/g, "2")
		.replace(/\*/g, "1");

	return fen + (situation[0] === 1 ? " w - - 0 " : " b - - 0 ") + situation[1];
};

// 翻转 FEN 串
vs.turnFen = function(fen){
	var fenSplit = fen        .split(" ");
	var lines    = fenSplit[0].split("/");

	for (var i = 0; i < 10; ++i) {
		lines[i] = lines[i].split("").reverse().join("");
	}

	fenSplit[0] = lines.join("/");
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	return fenSplit.join(" ");
};

// 旋转 FEN 串
vs.roundFen = function(fen){
	var fenSplit = fen        .split(" ");
	fenSplit[0]  = fenSplit[0].split("").reverse().join("");
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	return fenSplit.join(" ");
};

// 翻转节点 ICCS 着法
vs.turnMove = function(move){
	move = move.split("");
	move[0] = vs.fcc(202 - vs.cca(move[0]));
	move[2] = vs.fcc(202 - vs.cca(move[2]));
	return move.join("");
};

// 旋转节点 ICCS 着法
vs.roundMove = function(move){
	move = move.split("");
	move[0] = vs.fcc(202 - vs.cca(move[0]));
	move[2] = vs.fcc(202 - vs.cca(move[2]));
	move[1] = 9 - move[1];
	move[3] = 9 - move[3];
	return move.join("");
};

// 翻转 WXF 着法，不可用于特殊兵
vs.turnWXF = function(oldMove){
	// isMBA: is Middle Before After
	var moveSplit = oldMove.split(""), isMBA = ~"+-.".indexOf(moveSplit[1]);

	// NBA: 不是你想象中的 NBA，而是马相仕（马象士）
	if (~"NBA".indexOf(moveSplit[0]) || moveSplit[2] === ".") {
		if (isMBA) {
			return oldMove.substring(0, 3) + (10 - moveSplit[3]);
		}

		return moveSplit[0] + (10 - moveSplit[1]) + moveSplit[2] + (10 - moveSplit[3]);
	}

	if (isMBA) {
		return oldMove;
	}

	return moveSplit[0] + (10 - moveSplit[1]) + oldMove.substring(2, 4);
};

// 统计局面中棋子数量
vs.countPieceLength = function(situation){
	var RegExp = vs.RegExp();
	RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));

	for (var i = 51, count = 0; i < 204; ++i) {
		situation[i] > 1 && ++count;
	}

	return count;
};

// 根据前后 Fen 串计算着法
vs.compareFen = function(fromFen, toFen, format){
	var RegExp = vs.RegExp();
	RegExp.FenShort.test(fromFen) || (fromFen = vs.defaultFen);
	RegExp.FenShort.test(  toFen) || (  toFen = vs.defaultFen);

	var from = 0, to = 0;

	var fromSituation = vs.fenToSituation(fromFen);
	var   toSituation = vs.fenToSituation(  toFen);

	for (var i = 51; i < 204; ++i) {
		if (fromSituation[i] !== toSituation[i]) {
			if (fromSituation[i] > 1 && toSituation[i] === 1) {
				from = i;
			}
			else {
				to = i;
			}
		}
	}

	if (from && to) {
		var move = vs.s2i[from] + vs.s2i[to];

		switch (format) {
			case "iccs": return vs.Node2ICCS_NoFen(move);
			case "wxf" : return vs.Node2WXF    (move, fromFen).move;
			default    : return vs.Node2Chinese(move, fromFen).move;
		}
	}

	switch (format) {
		case "iccs": return "none";
		case "wxf" : return "None";
		default    : return "无效着法";
	}
};

// 获取棋局信息显示文本
vs.showText = function(showText, item){
	switch (item) {
		case "result": {
			switch (showText) {
				case "*"		: return "";
				case "1-0"		: return "红胜";
				case "0-1"		: return "黑胜";
				case "1/2-1/2"	: return "和棋";
			}

			break;
		}
	}

	return showText;
};

// 获取棋局信息数据文本
vs.dataText = function(dataText, item){
	switch (item) {
		case "result": {
			switch (dataText) {
				case "红胜": case "1-0"    : return "1-0"    ;
				case "黑胜": case "0-1"    : return "0-1"    ;
				case "和棋": case "1/2-1/2": return "1/2-1/2";
				default    :                 return "*"      ;
			}

			break;
		}
	}

	return dataText;
};

// PGN 字段驼峰化
vs.fieldNameToCamel = function(fieldName){
	var key = fieldName || "";
	var keySplit = key.split("");

	if (key.length > 3 && key.substring(0, 3) == "red") {
		keySplit[0] = "R";
		keySplit[3] = keySplit[3].toUpperCase();
	}
	else if (key.length > 5 && key.substring(0, 5) == "black") {
		keySplit[0] = "B";
		keySplit[5] = keySplit[5].toUpperCase();
	}
	else {
		keySplit[0] = keySplit[0].toUpperCase();
	}

	return keySplit.join("");
};

// GUID 生成器
vs.guid = function(){
	var guid = "";

	for (var i = 0; i < 32; ++i) {
		guid += Math.floor(Math.random() * 16).toString(16);
		~[7, 11, 15, 19].indexOf(i) && (guid += "-");
	}

	return guid;
};

// String.fromCharCode 别名
vs.fcc = function(code){
	return String.fromCharCode(code);
};

// String.charCodeAt 别名
vs.cca = function(word){
	return word.charCodeAt(0);
};

// 左右填充
vs.strpad = function(str, length, pad, direction){
	str = str || "" ; str += "";
	pad = pad || " "; pad += "";
	length = vs.limit(length, 0, Infinity, 0);

	if (length > str.length) {
		if (direction === "left" || direction === "l") {
			return new Array(length - str.length + 1).join(pad) + str;
		}
		else if (direction === "right" || direction === "r") {
			return str + new Array(length - str.length + 1).join(pad);
		}
		else {
			return new Array(Math.floor((length - str.length) / 2) + 1).join(pad) + str + new Array(Math.ceil((length - str.length) / 2) + 1).join(pad);
		}
	}
	else {
		return str;
	}
};

// 判断字符串是否为数字
vs.isNumber = function(str){
	return !isNaN(+str);
};

// 拆分 Fen 串
vs.fenToArray = function(fen){
	return fen.split(" ")[0]
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
};

// 合并 Fen 串
vs.arrayToFen = function(array){
	var tempArr = [];

	for (var i = 0; i < 90; ++i) {
		tempArr.push(array[i]);
		i % 9 === 8 && i < 89 && tempArr.push("/");
	}

	return tempArr.join("")
		.replace(/\*\*\*\*\*\*\*\*\*/g, "9")
		.replace(/\*\*\*\*\*\*\*\*/g, "8")
		.replace(/\*\*\*\*\*\*\*/g, "7")
		.replace(/\*\*\*\*\*\*/g, "6")
		.replace(/\*\*\*\*\*/g, "5")
		.replace(/\*\*\*\*/g, "4")
		.replace(/\*\*\*/g, "3")
		.replace(/\*\*/g, "2")
		.replace(/\*/g, "1");
};

// 取得指定弧度值旋转 CSS 样式
vs.degToRotateCSS = function(deg){
	if (window.ActiveXObject) {
		var css = "filter:progid:DXImageTransform.Microsoft.Matrix(SizingMethod=sMethod,M11=#M11,M12=#M12,M21=#M21,M22=#M22)";
		var rad =  Math.PI * deg / 180;
		var M11 =  Math.cos(deg);
		var M12 = -Math.sin(deg);
		var M21 =  Math.sin(deg);
		var M22 =  Math.cos(deg);
		return css.replace("#M11", M11).replace("#M12", M12).replace("#M21", M21).replace("#M22", M22);
	}
	else {
		var css = "";
		css +=         "transform:rotate(" + deg + "deg);";
		css +=      "-o-transform:rotate(" + deg + "deg);";
		css +=     "-ms-transform:rotate(" + deg + "deg);";
		css +=    "-moz-transform:rotate(" + deg + "deg);";
		css += "-webkit-transform:rotate(" + deg + "deg);";
		return css;
	}
};
