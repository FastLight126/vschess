// 象棋演播室 XQF 格式文件头读取
vs.XQF_Header = function(buffer){
    var S = function(start, length){
        return Array.from(buffer.slice(start, start + length));
    };

    var K = function(start, length){
        var array = buffer.slice(start, start + length).reverse(), sum = 0;

        for (var i = 0; i < array.length; ++i) {
            sum += array[i] * Math.pow(256, i);
        }

        return sum;
    };

    return {
        Version       : buffer[ 2], // 版本号
        KeyMask       : buffer[ 3], // 加密掩码
        KeyOr         : S(  8,  4), // Or密钥
        KeySum        : buffer[12], // 加密的钥匙和
        KeyXYp        : buffer[13], // 棋子布局位置钥匙
        KeyXYf        : buffer[14], // 棋谱起点钥匙
        KeyXYt        : buffer[15], // 棋谱终点钥匙
        QiziXY        : S( 16, 32), // 32个棋子的原始位置
        PlayStepNo    : K( 48,  2), // 棋谱文件的开始步数
        WhoPlay       : buffer[50], // 该谁下
        PlayResult    : buffer[51], // 最终结果
        PlayNodes     : S( 52,  4), // 本棋谱一共记录了多少步
        PTreePos      : S( 56,  4), // 对弈树在文件中的起始位置
        Type          : buffer[64], // 对局类型(全,开,中,残等)
        Title         : S( 81, buffer[ 80]), // 标题
        MatchName     : S(209, buffer[208]), // 比赛名称
        MatchTime     : S(273, buffer[272]), // 比赛时间
        MatchAddr     : S(289, buffer[288]), // 比赛地点
        RedPlayer     : S(305, buffer[304]), // 红方姓名
        BlkPlayer     : S(321, buffer[320]), // 黑方姓名
        TimeRule      : S(337, buffer[336]), // 用时规则
        RedTime       : S(401, buffer[400]), // 红方用时
        BlkTime       : S(417, buffer[416]), // 黑方用时
        RMKWriter     : S(465, buffer[464]), // 棋谱评论员
        Author        : S(481, buffer[480])  // 文件作者
    };
};

// 象棋演播室 XQF 格式密钥计算
vs.XQF_Key = function(header) {
    var key = {
        F32: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        XYp: 0,
        XYf: 0,
        XYt: 0,
        RMK: 0
    };

    if (header.Version <= 10) {
        return key;
    }

    key.XYp = (header.KeyXYp *       header.KeyXYp  *    54 + 221) * header.KeyXYp &   255;
    key.XYf = (header.KeyXYf *       header.KeyXYf  *    54 + 221) *    key.   XYp &   255;
    key.XYt = (header.KeyXYt *       header.KeyXYt  *    54 + 221) *    key.   XYf &   255;
    key.RMK = (header.KeySum * 256 + header.KeyXYp) % 32000 + 767                  & 65535;

    var FKey = [
        header.KeySum & header.KeyMask | header.KeyOr[0],
        header.KeyXYp & header.KeyMask | header.KeyOr[1],
        header.KeyXYf & header.KeyMask | header.KeyOr[2],
        header.KeyXYt & header.KeyMask | header.KeyOr[3]
    ];

    for (var i = 0; i < 32; ++i) {
        key.F32[i] = FKey[i % 4] & "[(C) Copyright Mr. Dong Shiwei.]".charCodeAt(i);
    }

    return key;
};

// 从象棋演播室 XQF 格式中抽取棋局信息
vs.binaryToInfo_XQF = function(buffer){
    var header = vs.XQF_Header(buffer), r = {};

    header.Title    .length && (r.title     = vs.GBK2UTF8(header.Title    ));
    header.MatchName.length && (r.event     = vs.GBK2UTF8(header.MatchName));
    header.MatchTime.length && (r.date      = vs.GBK2UTF8(header.MatchTime));
    header.MatchAddr.length && (r.place     = vs.GBK2UTF8(header.MatchAddr));
    header.RedPlayer.length && (r.redname   = vs.GBK2UTF8(header.RedPlayer));
    header.BlkPlayer.length && (r.blackname = vs.GBK2UTF8(header.BlkPlayer));
    header.RedTime  .length && (r.redtime   = vs.GBK2UTF8(header.RedTime  ));
    header.BlkTime  .length && (r.blacktime = vs.GBK2UTF8(header.BlkTime  ));
    header.RMKWriter.length && (r.remark    = vs.GBK2UTF8(header.RMKWriter));
    header.Author   .length && (r.author    = vs.GBK2UTF8(header.Author   ));
    header.TimeRule .length && (r.timerule  = vs.GBK2UTF8(header.TimeRule ));

    switch (header.PlayResult) {
        case  1: r.result = "1-0"; break;
        case  2: r.result = "0-1"; break;
        case  3: r.result = "1/2-1/2"; break;
        default: r.result = "*"; break;
    }

    return r;
};

// 将象棋演播室 XQF 格式转换为棋谱节点树
vs.binaryToNode_XQF = function(buffer) {
    var XQF_Header = vs.XQF_Header(buffer    );
    var XQF_Key    = vs.XQF_Key   (XQF_Header);

    // 计算开局 Fen 串
    var fenArray = new Array(91).join("*").split("");
    var fenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp";

    for (var i = 0; i < 32; ++i) {
        if (XQF_Header.Version > 10) {
            var pieceKey = XQF_Key.XYp + i + 1 & 31;
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

    fen  = vs.arrayToFen(fenArray);
    fen +=  XQF_Header.WhoPlay === 1 ? " b - - 0 " : " w - - 0 ";
    fen += (XQF_Header.PlayStepNo >> 1) || 1;

    // 解密数据
    if (XQF_Header.Version > 10) {
        var decode = [];

        for (var i = 1024; i < buffer.length; ++i) {
            decode.push(buffer[i] - XQF_Key.F32[i % 32] & 255);
        }
    }
    else {
        var decode = Array.from(buffer.slice(1024));
    }

    // 求和函数
    var K = function(start, length){
        var array = decode.slice(start, start + length), sum = 0;

        for (var i = 0; i < array.length; ++i) {
            sum += array[i] * Math.pow(256, i);
        }

        return sum;
    };

    // 生成节点树
    var node = { fen: fen, comment: null, next: [], defaultIndex: 0 };
    var parent = node, changeNode = [];

    for (var pos = 0; pos < decode.length;) {
        var comment    = "";
        var commentLen = 0;
        var nextOffset = 4;
        var hasNext    = decode[pos + 2] & (XQF_Header.Version > 10 ? 128 : 240);
        var hasChange  = decode[pos + 2] & (XQF_Header.Version > 10 ?  64 :  15);

        // 注释提取
        if (XQF_Header.Version > 10) {
            if (decode[pos + 2] & 32) {
                commentLen = K(pos + 4, 4) - XQF_Key.RMK;
                comment = vs.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
                nextOffset = commentLen + 8;
            }
        }
        else {
            commentLen = K(pos + 4, 4);
            comment = vs.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
            nextOffset = commentLen + 8;
        }

        // 根节点注释
        if (!pos) {
            node.comment = comment;
            pos += hasNext ? nextOffset : Infinity;
            continue;
        }

        // 生成节点树
        var Pf = decode[pos    ] - 24 - XQF_Key.XYf & 255;
        var Pt = decode[pos + 1] - 32 - XQF_Key.XYt & 255;
        var move = vs.fcc(Pf / 10 + 97) + Pf % 10 + vs.fcc(Pt / 10 + 97) + Pt % 10;
        var step = { move: move, comment: comment, next: [], defaultIndex: 0 };
        parent.next.push(step);

        if (hasNext) {
            hasChange && changeNode.push(parent);
            parent = step;
        }
        else {
            hasChange || (parent = changeNode.pop());
        }
            
        // 部分棋谱存在冗余错误数据，直接退出
        pos += parent ? nextOffset : Infinity;
    }

    // 增强兼容性
    if (node.next.length) {
        var fenArray = vs.fenToArray(node.fen);
        var fenSplit = node.fen.split(" ");
        var position = vs.i2b[node.next[0].move.substring(0, 2)];
        fenSplit[1] = vs.cca(fenArray[position]) < 97 ? "w" : "b";
        node.fen = fenSplit.join(" ");
    }

    return node;
};

// 将棋谱节点树转换为象棋演播室 XQF 格式
vs.nodeToBinary_XQF = function(node, chessInfo, mirror){
    var buffer = [88, 81, 18];

    // 填充棋局信息
    var fillChessInfo = function(start, text, maxLength){
        var GBKArray = vs.iconv2GBK(text);
        buffer[start] = Math.min(GBKArray.length, maxLength);

        for (var i = 0; i < GBKArray.length && i < maxLength; ++i) {
            buffer[i + 1 + start] = GBKArray[i];
        }
    };

    fillChessInfo( 80, chessInfo.title     || "", 128);
    fillChessInfo(208, chessInfo.event     || "",  64);
    fillChessInfo(272, chessInfo.date      || "",  16);
    fillChessInfo(288, chessInfo.place     || "",  16);
    fillChessInfo(304, chessInfo.redname   || "",  16);
    fillChessInfo(320, chessInfo.blackname || "",  16);
    fillChessInfo(400, chessInfo.redtime   || "",  16);
    fillChessInfo(416, chessInfo.blacktime || "",  16);
    fillChessInfo(464, chessInfo.remark    || "",  16);
    fillChessInfo(480, chessInfo.author    || "",  16);

    buffer[51] = ["*", "1-0", "0-1", "1/2-1/2"].indexOf(chessInfo.result);
    buffer[51] < 0 && (buffer[2076] = 0);

    // 填充 Fen 串
    buffer[50] = node.fen.split(" ")[1] === "b" ? 1 : 0;
    var fenArray = vs.fenToArray(mirror ? vs.turnFen(node.fen) : node.fen);
    var fenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp".split("");
    var piecePositions = {};

    for (var i = 0; i < fenArray.length; i++) {
        var index = fenPiece.indexOf(fenArray[i]);

        if (!~index) {
            continue;
        }

        piecePositions[index] = i % 9 * 10 + 9 - Math.floor(i / 9);
        fenPiece[index] = "x";
    }

    for (var i = 0; i < 32; ++i) {
        var piecePos = piecePositions[i + 1 & 31];
        buffer[i + 16] = typeof piecePos === "undefined" ? 90 : piecePos;
    }

    // 填充节点树
    var pos = 1024;

    var fillNode = function(step, hasSibling){
        var sig = hasSibling << 6 | !!step.next.length << 7;
        var nextOffset = 4;

        if (step.move) {
            var mov = mirror ? vs.turnMove(step.move) : step.move;
            var src = vs.i2b[mov.substring(0, 2)];
            var dst = vs.i2b[mov.substring(2, 4)];
            buffer[pos    ] = src % 9 * 10 + 33 - Math.floor(src / 9);
            buffer[pos + 1] = dst % 9 * 10 + 41 - Math.floor(dst / 9);
        }
        else {
            buffer[pos    ] = 88;
            buffer[pos + 1] = 81;
        }

        if (step.comment) {
            sig |= 32;
            var comment = vs.iconv2GBK(step.comment);
            var len = comment.length + 767;
            nextOffset = comment.length + 8;

            for (var i = 4; i < 8; ++i) {
                buffer[pos + i] = len % 256;
                len = Math.floor(len / 256);
            }

            for (var i = 0; i < comment.length; ++i) {
                buffer[pos + i + 8] = comment[i];
            }
        }

        buffer[pos + 2] = sig;
        buffer[pos + 3] = 0;
        pos += nextOffset;

        for (var i = 0; i < step.next.length; ++i) {
            fillNode(step.next[i], i < step.next.length - 1);
        }
    };

    fillNode(node, false);

    if (Uint8Array) {
        return Uint8Array.from(buffer);
    }

    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] &= 255;
    }

    return buffer;
};
