// 从象棋桥 CBR 格式中抽取棋局信息
vs.binaryToInfo_CBR = function(buffer){
    // 不识别的版本
    if (buffer[19] === 0 || buffer[19] > 2) {
        return {};
    }

    // 读取字符串
    var readStr = function(start, length){
        var str = [];

        for (var i = 0; i < length; i += 2) {
            if (buffer[start + i] === 0 && buffer[start + i + 1] === 0) {
                break;
            }

            str.push(vs.fcc(buffer[start + i + 1] << 8 | buffer[start + i]));
        }

        return str.join('');
    };

    // V1 版本
    if (buffer[19] === 1) {

    }
    // V2 版本
    else {
        return {
            // 各个软件的字段都不一样
            // 下面注释掉的是象棋桥专属字段，标准 PGN 格式不含这些字段
            // 如需启用这些字段，需要扩展 vs.info.name 字段列表，并且处理好信息修改界面
            // scriptfile : readStr(  52, 128),
            // path       : readStr( 308, 256),
            // from       : readStr( 564,  64),
            // eventclass : readStr( 628,  64),
            // timerule   : readStr(1012,  64),
            // remarkmail : readStr(1716,  64),
            // authormail : readStr(1844,  64),
            // createtime : readStr(1908,  40),
            // modifytime : readStr(1972,  40),
            // type       : buffer[2040],
            // property   : readStr(2044,  32),
            // finishtype : readStr(2080,  32),
            title      : readStr( 180, 128),
            event      : readStr( 692,  64),
            round      : readStr( 756,  64),
            group      : readStr( 820,  32),
            table      : readStr( 852,  32),
            date       : readStr( 884,  64),
            place      : readStr( 948,  64),
            red        : readStr(1076,  64),
            redteam    : readStr(1140,  64),
            redtime    : readStr(1204,  64),
            redrating  : readStr(1268,  32),
            black      : readStr(1300,  64),
            blackteam  : readStr(1364,  64),
            blacktime  : readStr(1428,  64),
            blackrating: readStr(1492,  32),
            judge      : readStr(1524,  64),
            record     : readStr(1588,  64),
            remark     : readStr(1652,  64),
            author     : readStr(1780,  64),
            result     : ["*", "1-0", "0-1", "1/2-1/2"][buffer[2076] > 3 ? 0 : buffer[2076]]
        };
    }
};

// 将象棋桥 CBR 格式转换为棋谱节点树
vs.binaryToNode_CBR = function(buffer) {
    // 不识别的版本
    if (buffer[19] === 0 || buffer[19] > 2) {
        return { fen: vs.defaultFen, comment: '', next: [], defaultIndex: 0 };
    }

    var board = [];

    // 默认 V2 版本
    var fenStartPos = 2120;
    var playerPos = 2112;
    var roundPos = 2116;

    // V1 版本
    if (buffer[19] === 1) {
        fenStartPos = 1880;
        playerPos = 1872;
        roundPos = 1876;
    }

    for (var i = 0; i < 90; ++i) {
        board.push(vs.n2f[buffer[i + fenStartPos]]);
    }

    var fen = vs.arrayToFen(board) + " " + (buffer[playerPos] === 2 ? "b" : "w") + " - - 0 " + (buffer[roundPos + 1] << 8 | buffer[roundPos]);

    // 生成节点树
    var node = { fen: fen, comment: '', next: [], defaultIndex: 0 };
    return node;
};
