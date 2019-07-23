// 将二进制原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vs.binaryToNode = function(buffer, parseType){
    parseType = parseType || "auto";

    // 象棋演播室 XQF 格式
	if (parseType === "auto" && buffer[0] === 88 && buffer[1] === 81 || parseType === "xqf") {
		return vs.binaryToNode_XQF(buffer);
	}

    // 中国游戏中心 CCM 格式
	if (parseType === "auto" && buffer[0] === 1 || parseType === "ccm") {
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

// 将象棋演播室 XQF 格式转换为棋谱节点树
vs.binaryToNode_XQF = function(buffer) {
    var fenArray = new Array(91).join("*").split("");
    var fenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp";

    var XQF_Header = vs.XQF_Header(buffer    );
    var XQF_Key    = vs.XQF_Key   (XQF_Header);

    for (var i = 0; i < 32; ++i) {
        if (XQF_Header.Version >= 16) {
            var pieceKey = XQF_Key .XYp + i + 1 & 31;
            var piecePos = XQF_Header.QiziXY[i] - XQF_Key.XYp & 255;
        }
        else {
            var pieceKey = i;
            var piecePos = XQF_Header.QiziXY[i];
        }

        if (piecePos < 90) {
            var X = Math.floor(piecePos / 10);
            var Y = 9 - piecePos % 10;
            fenArray[Y * 9 + X] = fenPiece.charAt(pieceKey);
        }
    }

    var fen = vs.arrayToFen(fenArray);
    fen +=  XQF_Header.WhoPlay === 1 ? " b - - 0 " : " w - - 0 ";
    fen += (XQF_Header.PlayStepNo >> 1) || 1;

    if (XQF_Header.Version >= 16) {
        var decode = [];

        for (var i = 1024; i < buffer.length; ++i) {
            decode.push(buffer[i] - XQF_Key.F32[i % 32] & 255);
        }
    }
    else {
        var decode = Array.from(buffer.slice(1024));
    }

    console.log(XQF_Key, decode);

    var pos = 0;
    var node = { fen: fen, comment: comment, next: [], defaultIndex: 0 };
    var currentNode = node;

    while (pos < decode.length && pos < 1679) {
        if (XQF_Header.Version >= 16) {
            var f = decode[pos    ] - 24 - XQF_Key.XYf & 255;
            var t = decode[pos + 1] - 32 - XQF_Key.XYt & 255;
        }
        else {
            var f = decode[pos    ] - 24;
            var t = decode[pos + 1] - 32;
        }

        var Xf = Math.floor(f / 10);
        var Yf = 9 - f % 10;
        var Xt = Math.floor(t / 10);
        var Yt = 9 - t % 10;

        //console.log(pos, decode.length);

        if (XQF_Header.Version > 10) {
            if (decode[pos + 2] & 224 & 32) {
                var commentLen = decode[pos + 4] + decode[pos + 5] * 256 + decode[pos + 6] * 65536 + decode[pos + 7] * 16777216 - XQF_Key.RMK;
                var comment = vs.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
                var nextOffset = commentLen + 8;
            }
            else {
                var comment = "";
                var nextOffset = 4;
            }
        }
        else {
            var commentLen = decode[pos + 4] + decode[pos + 5] * 256 + decode[pos + 6] * 65536 + decode[pos + 7] * 16777216 - XQF_Key.RMK;
            var comment = vs.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
            var nextOffset = commentLen + 8;
        }

        if (pos) {
            var move = vs.b2i[Yf * 9 + Xf] + vs.b2i[Yt * 9 + Xt];
            currentNode.next.push({ move: move, comment: comment, next: [], defaultIndex: 0 });
            currentNode = currentNode.next[0];
        }
        else {
            node.comment = comment;
        }

        pos += nextOffset;
        //console.log(commentLen, pos);
    }

    return node;
};
