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

// 将字符串写入象棋桥 CBR 格式
vs.writeStr_CBR = function(buffer, str, offset, maxLength){
    str = "" + str;
    maxLength = +maxLength || 0;

    for (var i = 0; i < str.length; ++i) {
        var pos = i * 2 + offset;
        buffer[pos    ] = str.charCodeAt(i) & 255;
        buffer[pos + 1] = str.charCodeAt(i) >>  8;

        if (maxLength && i * 2 >= maxLength) {
            break;
        }
    }

    return buffer;
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

        var comment    = "";
        var commentLen = 0;
        var nextOffset = 4;
        var hasNext    = sig % 2 === 0;
        var hasChange  = sig & 2;

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
            pos += hasNext ? nextOffset : Infinity;
            continue;
        }

        // 生成节点树
        move = ver === 1 ? vs.flipMove(vs.fcc(src / 16 + 97) + src % 16 + vs.fcc(dst / 16 + 97) + dst % 16) : vs.b2i[src] + vs.b2i[dst];
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
        console.log(node);
        var position = vs.i2b[node.next[0].move.substring(0, 2)];
        fenSplit[1] = vs.cca(fenArray[position]) < 97 ? "w" : "b";
        node.fen = fenSplit.join(" ");
    }
    
    return node;
};

// 解析象棋桥棋库 CBL 格式
vs.binaryToBook_CBL = function(buffer){
    if (vschess.subhex(buffer, 0, 15) !== '43434272696467654c696272617279') {
        return false;
    }

    var books = [];
    var splitPos = [];

    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] === 67 && vs.subhex(buffer, i, 15) === "4343427269646765205265636f7264" && splitPos.push(i);
    }

    for (var i = 0; i < splitPos.length; ++i) {
        var book = buffer.slice(splitPos[i], splitPos[i + 1] || buffer.length);
        books.push({ info: vs.binaryToInfo_CBR(book), node: vs.binaryToNode_CBR(book) });
    }

    var info = {
        name        : vs.readStr_CBR(buffer,   64,   512),
        from        : vs.readStr_CBR(buffer,  576,   256),
        creator     : vs.readStr_CBR(buffer,  832,    64),
        creatoremail: vs.readStr_CBR(buffer,  896,    64),
        createtime  : vs.readStr_CBR(buffer,  960,    64),
        modifytime  : vs.readStr_CBR(buffer, 1024,    64),
        remark      : vs.readStr_CBR(buffer, 1088, 65536)
    };

    return { info: info, books: books };
};

// 将棋谱节点树转换为象棋桥 CBR 格式
vs.nodeToBinary_CBR = function(node, chessInfo, mirror){
    var buffer = [67, 67, 66, 114, 105, 100, 103, 101, 32, 82, 101, 99, 111, 114, 100, 0, 0, 0, 0, 2];
    buffer.length = 2218;
    buffer[2210] = buffer[2211] = buffer[2212] = buffer[2213] = 255;

    // 填充棋局信息
    vs.writeStr_CBR(buffer, chessInfo.title       || "",  180, 126);
    vs.writeStr_CBR(buffer, chessInfo.event       || "",  692,  62);
    vs.writeStr_CBR(buffer, chessInfo.round       || "",  756,  62);
    vs.writeStr_CBR(buffer, chessInfo.group       || "",  820,  30);
    vs.writeStr_CBR(buffer, chessInfo.table       || "",  852,  30);
    vs.writeStr_CBR(buffer, chessInfo.date        || "",  884,  62);
    vs.writeStr_CBR(buffer, chessInfo.place       || "",  948,  62);
    vs.writeStr_CBR(buffer, chessInfo.red         || "", 1076,  62);
    vs.writeStr_CBR(buffer, chessInfo.redteam     || "", 1140,  62);
    vs.writeStr_CBR(buffer, chessInfo.redtime     || "", 1204,  62);
    vs.writeStr_CBR(buffer, chessInfo.redrating   || "", 1268,  30);
    vs.writeStr_CBR(buffer, chessInfo.black       || "", 1300,  62);
    vs.writeStr_CBR(buffer, chessInfo.blackteam   || "", 1364,  62);
    vs.writeStr_CBR(buffer, chessInfo.blacktime   || "", 1428,  62);
    vs.writeStr_CBR(buffer, chessInfo.blackrating || "", 1492,  30);
    vs.writeStr_CBR(buffer, chessInfo.judge       || "", 1524,  62);
    vs.writeStr_CBR(buffer, chessInfo.record      || "", 1588,  62);
    vs.writeStr_CBR(buffer, chessInfo.remark      || "", 1652,  62);
    vs.writeStr_CBR(buffer, chessInfo.author      || "", 1780,  62);

    buffer[2076] = ["*", "1-0", "0-1", "1/2-1/2"].indexOf(chessInfo.result);
    buffer[2076] < 0 && (buffer[2076] = 0);

    // 填充 Fen 串
    var fenSplit = node.fen.split(" ");
    buffer[2112] = fenSplit[1] === "b" ? 2 : 1;
    buffer[2116] = fenSplit[5] & 255;
    buffer[2117] = fenSplit[5] >>  8;

    var board = vs.fenToArray(mirror ? vs.turnFen(node.fen) : node.fen);

    for (var i = 0; i < 90; ++i) {
        var piece = vs.f2n[board[i]];
        buffer[i + 2120] = piece > 1 ? piece : 0;
    }

    // 填充节点树
    var pos = 2214;

    var fillNode = function(step, hasSibling){
        var sig = hasSibling << 1 | !step.next.length;
        var nextOffset = 4;

        if (step.move) {
            var move = mirror ? vs.turnMove(step.move) : step.move;
            buffer[pos + 2] = vs.i2b[move.substring(0, 2)];
            buffer[pos + 3] = vs.i2b[move.substring(2, 4)];
        }

        if (step.comment) {
            sig |= 4;
            var len = step.comment.length * 2;
            nextOffset = len + 8;

            for (var i = 4; i < 8; ++i) {
                buffer[pos + i] = len % 256;
                len = Math.floor(len / 256);
            }

            vs.writeStr_CBR(buffer, step.comment, pos + 8);
        }

        buffer[pos] = sig;
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
