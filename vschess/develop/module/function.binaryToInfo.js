// 从二进制原始数据中抽取棋局信息
vs.binaryToInfo = function(buffer, parseType){
    parseType = parseType || "auto";

    // 象棋演播室 XQF 格式
	if (parseType === "auto" && buffer[0] === 88 && buffer[1] === 81 || parseType === "xqf") {
		return vs.binaryToInfo_XQF(buffer);
	}

    // 未能识别的数据，返回空
	return {};
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
