// 查找连杀着法
vs.findKill = function (situation, maxDeep = Infinity) {
  if (typeof situation === "string") {
    var RegExp = vs.RegExp();
    RegExp.FenShort.test(situation) && (situation = vs.fenToSituation(situation));
  }

  var checkedFen = {};
  var root = { situation: situation, parent: null, key: vs.ZobristKey(vs.situationToFen(situation)), next: [], player: 1, score: 0, deep: 1 };
  var checkQueue = [root];

  main: while (checkQueue.length) {
    var checkTask = checkQueue.shift();

    if (checkedFen[checkTask.key]) {
      continue;
    }

    checkedFen[checkTask.key] = 1;
    var legalList = vs.legalList(checkTask.situation);
    var nextList = legalList;

    if (checkTask.player) {
      nextList = [];

      for (var i = 0; i < legalList.length; ++i) {
        var movedSituation = checkTask.situation.slice(0);
        movedSituation[legalList[i][1]] = movedSituation[legalList[i][0]];
        movedSituation[legalList[i][0]] = 1;
        movedSituation[0] = 3 - movedSituation[0];
        (vs.checkThreat(movedSituation) || !vs.hasLegalMove(movedSituation)) && nextList.push(legalList[i]);
      }
    }

    if (nextList.length) {
      for (var i = 0; i < nextList.length; ++i) {
        var movedSituation = checkTask.situation.slice(0);
        movedSituation[nextList[i][1]] = movedSituation[nextList[i][0]];
        movedSituation[nextList[i][0]] = 1;
        movedSituation[0] = 3 - movedSituation[0];
        var movedFen = vs.situationToFen(movedSituation);
        var movedZobristKey = vs.ZobristKey(movedFen);

        if ((!checkTask.player || !checkedFen[movedZobristKey]) && checkTask.deep < maxDeep) {
          var next = { situation: movedSituation, parent: checkTask, key: movedZobristKey, next: [], player: 1 - checkTask.player, score: 0, deep: checkTask.deep + 1 };
          checkTask.next.push(next);
          checkQueue.push(next);
        }
      }
    }
    else {
      checkTask.score = checkTask.player ? -31999 : 31999;
      var parent = checkTask.parent;

      while (parent) {
        if (parent.player) {
          var maxScore = -Infinity;
          var hasZero = false;
          var hasScore = false;

          for (var i = 0; i < parent.next.length; ++i) {
            var score = parent.next[i].score;

            if (score > 0) {
              maxScore = score;
              hasScore = true;
              break;
            }
            else if (score < 0) {
              if (score > maxScore) {
                maxScore = score;
              }
            }
            else {
              hasZero = true;
            }
          }

          if (hasScore || !hasZero) {
            parent.score = maxScore + (maxScore > 0 ? -1 : 1);
            parent = parent.parent;
          }
          else {
            parent = null;
          }
        }
        else {
          var minScore = Infinity;
          var hasZero = false;

          for (var i = 0; i < parent.next.length; ++i) {
            var score = parent.next[i].score;

            if (score === 0) {
              hasZero = true;
              break;
            }

            if (score < minScore) {
              minScore = score;
            }
          }

          if (hasZero) {
            parent = null;
          } else {
            parent.score = minScore + (minScore > 0 ? -1 : 1);
            parent = parent.parent;
          }
        }

        // if (parent && !parent.parent) {
        //   break main;
        // }
        if (parent) {
          // break main;
          console.log(parent.deep);
        }
      }
    }
  }

  var maxIndex = -1;

  for (var i = 0; i < root.next.length; ++i) {
    var currentScore = maxIndex === -1 ? -Infinity : root.next[maxIndex].score;

    if (root.next[i].score > 0 && root.next[i].score > currentScore) {
      maxIndex = i;
      break;
    }
  }

  if (maxIndex === -1) {
    return null;
  }
  else {
    var fenA = vs.situationToFen(root.situation);
    var fenB = vs.situationToFen(root.next[maxIndex].situation);
    return { move: vs.compareFen(fenA, fenB, "node"), score: root.next[maxIndex].score };
  }
};
