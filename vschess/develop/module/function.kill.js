// 查找连杀着法
vs.findKill = function (fen, deep) {
  // small = !!small;
  deep = parseInt(deep);
  deep = deep ? deep : 9999;
  var fenList = [fen];
  var fenMarkCache = {};
  var count = 0;
  var result = fenMark(true, deep);
  console.log('count', count);
  return result;

  function fenMark(self, deep) {
    // 超出限定层数
    if (deep < 0) {
      return -31999;
    }

    var fen = fenList[fenList.length - 1];

    // 计算过的局面
    if (fenMarkCache[fen] !== undefined) {
      return fenMarkCache[fen];
    }

    ++count;
    var moveList = vs.legalMoveList(fen);

    if (self) {
      // 被杀
      if (moveList.length === 0) {
        return -31999;
      }
    }
    else {
      // 将杀
      if (moveList.length === 0) {
        return 31999;
      }

      // 长打
      if (fenList.indexOf(fen) < fenList.length - 1) {
        return -31999;
      }

      // 非将军
      if (!vs.checkThreat(fen)) {
        return -31999;
      }
    }

    var min =  31999;
    var max = -31999;

    for (var i = 0; i < moveList.length; ++i) {
      var nextFen = vs.shortFen(vs.fenMovePiece(fen, moveList[i]));
      fenList.push(nextFen);
      var nextMark = fenMark(!self, deep - 1);
      fenList.pop();
      // nextMark && (fenMarkCache[nextFen] = nextMark);
      // fenMarkCache[nextFen] = nextMark;
      var pushMark = nextMark > 0 ? nextMark - 1 : nextMark + 1;
      pushMark > max && (max = pushMark);
      pushMark < min && (min = pushMark);

      // 有就退出，不继续搜索了，不管是不是最短路径
      // 这样更快，但是路径可能会很长
      // if (!small) {
      //   if (self && nextMark > 0) {
      //     break;
      //   }
  
      //   if (!self && nextMark < 0) {
      //     break;
      //   }
      // }
    }

    return self ? max : min;
  }
};
