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

    if (header.Version < 16) {
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
