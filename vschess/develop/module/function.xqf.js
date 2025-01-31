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

// 象棋演播室 XQF 格式写入头部信息的函数
vs.XQF_writeHeader = function(buffer, Version, KeyMask, KeyOr, KeySum, KeyXYp, KeyXYf, KeyXYt, key, node, chessInfo, mirror){
    // 文件标识
    buffer[0] = 88;
    buffer[1] = 81;
    buffer[2] = Version;
    buffer[3] = KeyMask;

    // KeyOr值
    buffer[8] = KeyOr[0];
    buffer[9] = KeyOr[1];
    buffer[10] = KeyOr[2];
    buffer[11] = KeyOr[3];

    // KeySum和KeyXY值
    buffer[12] = KeySum;
    buffer[13] = KeyXYp;
    buffer[14] = KeyXYf;
    buffer[15] = KeyXYt;

    // 处理 FEN 串，生成 QiziXY 数组
    var fenArray = vs.fenToArray(mirror ? vs.turnFen(node.fen) : node.fen);
    var fenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp".split("");
    var piecePositions = {};

    for (var i = 0; i < fenArray.length; i++) {
        var piece = fenArray[i];
        var index = fenPiece.indexOf(piece);

        if (~index) {
            var x = i % 9;
            var y = 9 - Math.floor(i / 9);
            var XY = x * 10 + y;
            piecePositions[index] = XY;
            fenPiece[index] = "x";
        }
    }

    // 写入 QiziXY 数组
    for (var i = 0; i < 32; i++) {
        var piecePos = piecePositions[(i + 1) % 32];

        if (typeof piecePos === "undefined") {
            piecePos = 90 + vs.rand(0, 154);
        }

        buffer[16 + i] = piecePos;
    }

    // 设置 WhoPlay
    buffer[50] = node.fen.split(" ")[1] === 'b' ? 1 : 0;

    // 设置 GameResult
    switch (chessInfo.result) {
        case "1-0": buffer[51] = 1; break;
        case "0-1": buffer[51] = 2; break;
        case "1/2-1/2": buffer[51] = 3; break;
        default: buffer[51] = 0; break;
    }

    var fillText = function(start, text, maxLength){
	    var GBKArray = new Uint8Array(vs.iconv2GBK(text));
        buffer[start] = Math.min(GBKArray.length, maxLength) & 255;

        for (var i = 0; i < GBKArray.length && i < maxLength; ++i) {
            buffer[start + 1 + i] = GBKArray[i];
        }
    };

    fillText( 80, chessInfo.title     || "", 128);
    fillText(208, chessInfo.event     || "",  64);
    fillText(272, chessInfo.date      || "",  16);
    fillText(288, chessInfo.place     || "",  16);
    fillText(304, chessInfo.redname   || "",  16);
    fillText(320, chessInfo.blackname || "",  16);
    fillText(400, chessInfo.redtime   || "",  16);
    fillText(416, chessInfo.blacktime || "",  16);
    fillText(464, chessInfo.remark    || "",  16);
    fillText(480, chessInfo.author    || "",  16);
};

// 象棋演播室 XQF 格式处理节点的函数
vs.XQF_processNode = function(node, haveNextSibling, moves, key, mirror){
    // 处理当前节点
    var moveData = [];
    var flag = 0;
    var encodePf, encodePt;

    if (node.move) {
        // 处理着法
        var move = mirror ? vs.turnMove(node.move) : node.move;
        var from = vs.i2b[move.substring(0, 2)];
        var to = vs.i2b[move.substring(2, 4)];

        var Xf = from % 9;
        var Yf = 9 - Math.floor(from / 9);
        var Xt = to % 9;
        var Yt = 9 - Math.floor(to / 9);

        var Pf = Xf * 10 + Yf;
        var Pt = Xt * 10 + Yt;

        // 加密 Pf 和 Pt
        encodePf = (Pf + 24 + key.XYf) & 255;
        encodePt = (Pt + 32 + key.XYt) & 255;
    } else {
        // 根节点
        encodePf = 88;
        encodePt = 81;
    }

    // 设置标志位
    var hasComment = node.comment && node.comment.length > 0;

    if (node.next && node.next.length > 0) {
        flag |= 128; // 有后续着法
    }

    if (haveNextSibling) {
        flag |= 64; // 有变着
    }

    if (hasComment) {
        flag |= 32; // 有注释
    }

    // 组装着法数据
    moveData.push(encodePf);
    moveData.push(encodePt);
    moveData.push(flag);
    moveData.push(0); // 保留字节

    if (hasComment) {
        // 处理注释
        var commentBytes = vs.iconv2GBK(node.comment);
        var commentLen = commentBytes.length + key.RMK;

        // 添加注释长度
        moveData.push(commentLen       & 255);
        moveData.push(commentLen >>  8 & 255);
        moveData.push(commentLen >> 16 & 255);
        moveData.push(commentLen >> 24 & 255);

        // 添加注释内容
        for (var i = 0; i < commentBytes.length; ++i) {
            moveData.push(commentBytes[i]);
        }
    }

    // 加密着法数据
    var pos = moves.length + 1024;

    for (var i = 0; i < moveData.length; ++i) {
        var keyByte = key.F32[pos % 32];
        var b = (moveData[i] + keyByte) & 255;
        moves.push(b);
        ++pos;
    }

    // 递归处理子节点
    if (node.next) {
        for (var i = 0; i < node.next.length; ++i) {
            var haveNextSibling = i < node.next.length - 1;
            vs.XQF_processNode(node.next[i], haveNextSibling, moves, key, mirror);
        }
    }
};

// 将棋谱节点树转换为象棋演播室 XQF 格式
vs.nodeToBinary_XQF = function(node, chessInfo, mirror){
    // 设置版本号和密钥相关参数
    var Version = 18;
    var KeyMask = vs.rand(1, 255);
    var KeyOr = [vs.rand(0, 255), vs.rand(0, 255), vs.rand(0, 255)];
    KeyOr[3] = 256 - KeyOr[0] - KeyOr[1] - KeyOr[2] & 255;

    var KeySum = 0;
    var KeyXYp = 0;
    var KeyXYf = 0;
    var KeyXYt = 0;

    // 计算密钥
    var key = vs.XQF_Key({
        KeySum: KeySum,
        KeyXYp: KeyXYp,
        KeyXYf: KeyXYf,
        KeyXYt: KeyXYt,
        KeyMask: KeyMask,
        KeyOr: KeyOr
    });

    // 头部信息
    var buffer = new Uint8Array(1024);
    buffer.fill(0, 0, 1024);
    vs.XQF_writeHeader(buffer, Version, KeyMask, KeyOr, KeySum, KeyXYp, KeyXYf, KeyXYt, key, node, chessInfo, mirror);

    // 处理节点树
    var moves = [];
    vs.XQF_processNode(node, false, moves, key, mirror);

    // 最终棋谱
    var finalBuffer = new Uint8Array(1024 + moves.length);
    finalBuffer.set(buffer, 0);
    finalBuffer.set(moves, 1024);
    return finalBuffer;
};
