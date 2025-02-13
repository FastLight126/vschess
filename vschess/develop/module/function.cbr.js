// 从象棋桥 CBR 格式中读取字符串
vs.readStr_CBR = function(buffer, start, length){
    var str = [];

    for (var i = 0; i < length; i += 2) {
        if (buffer[start + i] === 0 && buffer[start + i + 1] === 0) {
            break;
        }

        str.push(vs.fcc(buffer[start + i + 1] << 8 | buffer[start + i]));
    }

    return str.join("");
};

// 从象棋桥 CBR 格式中抽取棋局信息
vs.binaryToInfo_CBR = function(buffer){
    var ver = buffer[19];

    // 不识别的版本
    if (ver === 0 || ver > 2) {
        return {};
    }

    // 各个软件的字段都不一样
    // 下面注释掉的是象棋桥专属字段，标准 PGN 格式不含这些字段
    // 如需启用这些字段，需要扩展 vs.info.name 字段列表，并且处理好信息修改界面

    // V1 版本
    if (ver === 1) {
        return {
            // path       : vs.readStr_CBR(buffer,  180, 256),
            // from       : vs.readStr_CBR(buffer,  436,  64),
            // eventclass : vs.readStr_CBR(buffer,  500,  64),
            // timerule   : vs.readStr_CBR(buffer,  884,  64),
            // remarkmail : vs.readStr_CBR(buffer, 1460,  64),
            // authormail : vs.readStr_CBR(buffer, 1588,  64),
            // createtime : vs.readStr_CBR(buffer, 1652,  40),
            // modifytime : vs.readStr_CBR(buffer, 1716,  40),
            // type       : buffer[1784],
            // property   : vs.readStr_CBR(buffer, 1788,  32),
            // finishtype : vs.readStr_CBR(buffer, 1824,  32),
            title      : vs.readStr_CBR(buffer,   52, 128),
            event      : vs.readStr_CBR(buffer,  564,  64),
            round      : vs.readStr_CBR(buffer,  628,  64),
            group      : vs.readStr_CBR(buffer,  692,  32),
            table      : vs.readStr_CBR(buffer,  724,  32),
            date       : vs.readStr_CBR(buffer,  756,  64),
            place      : vs.readStr_CBR(buffer,  820,  64),
            red        : vs.readStr_CBR(buffer,  948,  64),
            redteam    : vs.readStr_CBR(buffer, 1012,  64),
            redtime    : vs.readStr_CBR(buffer, 1076,  64),
            redrating  : vs.readStr_CBR(buffer, 1140,  32),
            black      : vs.readStr_CBR(buffer, 1172,  64),
            blackteam  : vs.readStr_CBR(buffer, 1236,  64),
            blacktime  : vs.readStr_CBR(buffer, 1300,  64),
            blackrating: vs.readStr_CBR(buffer, 1364,  32),
            remark     : vs.readStr_CBR(buffer, 1396,  64),
            author     : vs.readStr_CBR(buffer, 1524,  64),
            result     : ["*", "1-0", "0-1", "1/2-1/2"][buffer[1820] > 3 ? 0 : buffer[1820]]
        };
    }
    // V2 版本
    else {
        return {
            // scriptfile : vs.readStr_CBR(buffer,   52, 128),
            // path       : vs.readStr_CBR(buffer,  308, 256),
            // from       : vs.readStr_CBR(buffer,  564,  64),
            // eventclass : vs.readStr_CBR(buffer,  628,  64),
            // timerule   : vs.readStr_CBR(buffer, 1012,  64),
            // remarkmail : vs.readStr_CBR(buffer, 1716,  64),
            // authormail : vs.readStr_CBR(buffer, 1844,  64),
            // createtime : vs.readStr_CBR(buffer, 1908,  40),
            // modifytime : vs.readStr_CBR(buffer, 1972,  40),
            // type       : buffer[2040],
            // property   : vs.readStr_CBR(buffer, 2044,  32),
            // finishtype : vs.readStr_CBR(buffer, 2080,  32),
            title      : vs.readStr_CBR(buffer,  180, 128),
            event      : vs.readStr_CBR(buffer,  692,  64),
            round      : vs.readStr_CBR(buffer,  756,  64),
            group      : vs.readStr_CBR(buffer,  820,  32),
            table      : vs.readStr_CBR(buffer,  852,  32),
            date       : vs.readStr_CBR(buffer,  884,  64),
            place      : vs.readStr_CBR(buffer,  948,  64),
            red        : vs.readStr_CBR(buffer, 1076,  64),
            redteam    : vs.readStr_CBR(buffer, 1140,  64),
            redtime    : vs.readStr_CBR(buffer, 1204,  64),
            redrating  : vs.readStr_CBR(buffer, 1268,  32),
            black      : vs.readStr_CBR(buffer, 1300,  64),
            blackteam  : vs.readStr_CBR(buffer, 1364,  64),
            blacktime  : vs.readStr_CBR(buffer, 1428,  64),
            blackrating: vs.readStr_CBR(buffer, 1492,  32),
            judge      : vs.readStr_CBR(buffer, 1524,  64),
            record     : vs.readStr_CBR(buffer, 1588,  64),
            remark     : vs.readStr_CBR(buffer, 1652,  64),
            author     : vs.readStr_CBR(buffer, 1780,  64),
            result     : ["*", "1-0", "0-1", "1/2-1/2"][buffer[2076] > 3 ? 0 : buffer[2076]]
        };
    }
};

// 将象棋桥 CBR 格式转换为棋谱节点树
vs.binaryToNode_CBR = function(buffer){
    var ver = buffer[19];

    // 不识别的版本
    if (ver < 1 || ver > 2) {
        return { fen: vs.defaultFen, comment: "", next: [], defaultIndex: 0 };
    }

    var offset = ver === 1 ? 1856 : 2112;
    var board = [];

    for (var i = 0; i < 90; ++i) {
        board.push(vs.n2f[buffer[i + offset + 8]]);
    }

    var fen = vs.arrayToFen(board) + " " + (buffer[offset] === 2 ? "b" : "w") + " - - 0 " + (buffer[offset + 5] << 8 | buffer[offset + 4]);

    // 生成节点树
    var node = { fen: fen, comment: null, next: [], defaultIndex: 0 };
    var parent = node, changeNode = [];

    for (var pos = offset + 102; pos < buffer.length;) {
        var sig = buffer[pos    ] & 255;
        var src = buffer[pos + 2] & 255;
        var dst = buffer[pos + 3] & 255;

        // 额外的结束条件
        if (sig > 7 || src === dst && typeof node.comment === "string") {
            break;
        }

        var comment = "";
        var commentLen = 0;
        var nextOffset = 4;

        // 注释提取
        if (sig & 4) {
            for (var i = 0; i < 4; ++i) {
                commentLen += buffer[pos + 4 + i] * Math.pow(256, i);
            }

            comment = vs.readStr_CBR(buffer, pos + 8, commentLen);
            nextOffset = commentLen + 8;
        }

        // 根节点注释
        if (src === dst) {
            node.comment = comment;
            pos += nextOffset;
            continue;
        }

        // 生成节点树
        move = ver === 1 ? vs.flipMove(vs.fcc(src / 16 + 97) + src % 16 + vs.fcc(dst / 16 + 97) + dst % 16) : vs.b2i[src] + vs.b2i[dst];
        var step = { move: move, comment: comment, next: [], defaultIndex: 0 };
        parent.next.push(step);

        var hasNext   = sig % 2 === 0;
        var hasChange = sig & 2;

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

// 解析象棋桥棋库 CBL 格式
vs.binaryToBook_CBL = function(buffer){
    if (vschess.subhex(buffer, 0, 16) !== '43434272696467654c69627261727900') {
        return false;
    }

    var books = [];
    var splitPos = [];

    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] === 67 && vs.subhex(buffer, i, 16) === "4343427269646765205265636f726400" && splitPos.push(i);
    }

    for (var i = 0; i < splitPos.length; ++i) {
        var book = buffer.slice(splitPos[i], splitPos[i + 1] || buffer.length);
        books.push({ info: vs.binaryToInfo_CBR(book), node: vs.binaryToNode_CBR(book) });
    }

    var info = {
        name        : vs.readStr_CBR(buffer,  64,    512),
        from        : vs.readStr_CBR(buffer, 576,    256),
        creator     : vs.readStr_CBR(buffer, 832,     64),
        creatoremail: vs.readStr_CBR(buffer, 896,     64),
        createtime  : vs.readStr_CBR(buffer, 960,     64),
        modifytime  : vs.readStr_CBR(buffer, 1024,    64),
        remark      : vs.readStr_CBR(buffer, 1088, 65536)
    };

    return { info: info, books: books };
};
