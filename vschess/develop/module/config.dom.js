// 涉及页面 DOM 的默认参数，单独抽出来
$.extend(vs.defaultOptions, {
	// 选择解析器，默认为自动选择
	parseType: "auto",

	// 自定义棋谱
	chessData: false,

	// 默认风格
	style: "default",

	// 默认布局
	layout: "default",

	// 默认全局样式
	globalCSS: vs.defaultPath + "global.css",

	// 默认棋盘初始化时展示的局面索引
	currentStep: 0,

	// 音效开关
	sound: true,

	// 默认音效
	soundStyle: "default",

	// 默认音量
	volume: 100,

	// 自定义音效路径，空字符串表示程序自动识别，如需自定义请参考官方文档
	soundPath: "",

	// 着法朗读
	speakMove: false,

	// IE6 自定义棋子图片路径，如需自定义请参考官方文档
	IE6Compatible_CustomPieceUrl: false,

	// 默认棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下翻转，3(0x11) 对角旋转
	// 亦可以使用 vschess.code.turn：none 不翻转，mirror 左右翻转，reverse 上下翻转，round 对角旋转
	turn: vs.code.turn.none,

	// 默认棋子单击事件是否响应状态，0(0x00) 双方不响应，1(0x01) 仅黑方响应，2(0x10) 仅红方响应，3(0x11) 双方响应
	// 亦可以使用 vschess.code.clickResponse：none 双方不响应，black 仅黑方响应，red 仅红方响应，both 双方响应
	clickResponse: vs.code.clickResponse.both,

	// 默认走子动画时间，单位毫秒
	animationTime: 200,

	// 默认播放间隔时间，单位百毫秒（0.1秒）
	playGap: 5,

	// 默认着法格式
	moveFormat: "chinese",

	// 单击事件名称，兼顾 PC 端和移动端
	click: (function(){
		var UA = navigator.userAgent.toLowerCase(), click = "touchend";
		!~UA.indexOf("android") && !~UA.indexOf("iph") && !~UA.indexOf("ipad") && (click = "click");
		return click;
	})(),

	// 快进快退局面数
	quickStepOffset: 10,

	// 默认展开的标签
	defaultTab: "comment",

	// UBB 分享标签名称
	ubbTagName: "vschess",

	// 走子提示
	moveTips: true,

	// 保存提示
	saveTips: false,

	// 棋子随机旋转
	pieceRotate: false,

	// 禁止重复长打
	banRepeatLongThreat: true,

	// 禁止重复一将一杀
	banRepeatLongKill: false,

	// 违例提示
	illegalTips: true,

	// 起始局面提示信息
	startTips: [
		"蓝色的着法含有变着",
		"标有星号的着法含有注解",
		"支持东萍、鹏飞等多种格式",
		"单击“复制”复制当前局面",
		'<a href="https://www.xiaxiangqi.com/vschess/" target="_blank">微思象棋播放器 V' + vs.version + "</a>",
		'<a href="https://margin.top/" target="_blank">Margin.Top &copy; 版权所有</a>'
	],

	// 云服务 API 地址
	cloudApi: {
		gif: "https://www.xiaxiangqi.com/api/cloud/gif",
		startFen: "https://www.xiaxiangqi.com/api/cloud/startfen",
		saveBook: "https://www.xiaxiangqi.com/api/cloud/savebook",
		saveBookForShare: "https://www.xiaxiangqi.com/api/cloud/book/save",
		saveBookForWeixin: "https://www.xiaxiangqi.com/api/cloud/book/weixincode",
		HTMLShareJS: "https://www.xiaxiangqi.com/static/js/share.js"
	},

	// 默认推荐起始局面列表
	recommendList: [
		{ name: "常用开局", fenList: [
			{ name: "空白棋盘", fen: "9/9/9/9/9/9/9/9/9/9 w - - 0 1" },
			{ name: "只有帅将", fen: "5k3/9/9/9/9/9/9/9/9/3K5 w - - 0 1" },
			{ name: "标准开局", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让左马", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKABNR w - - 0 1" },
			{ name: "黑让左马", fen: "rnbakab1r/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让右马", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKAB1R w - - 0 1" },
			{ name: "黑让右马", fen: "r1bakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让双马", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w - - 0 1" },
			{ name: "黑让双马", fen: "r1bakab1r/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让双仕", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNB1K1BNR w - - 0 1" },
			{ name: "黑让双士", fen: "rnb1k1bnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让双相", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RN1AKA1NR w - - 0 1" },
			{ name: "黑让双象", fen: "rn1aka1nr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让仕相", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RN2K2NR w - - 0 1" },
			{ name: "黑让士象", fen: "rn2k2nr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让五兵", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "黑让五卒", fen: "rnbakabnr/9/1c5c1/9/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "红让九子", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w - - 0 1" },
			{ name: "黑让九子", fen: "rn2k2nr/9/1c5c1/9/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" }
		]}
    ],

    // 标签名称
    tagName: {
        comment: "棋谱注解",
        info: "棋局信息",
        share: "棋谱分享",
        export: "棋谱导出",
        edit: "棋谱导入",
        config: "棋盘选项"
    }
});

// 默认帮助信息
vs.defaultOptions.help  = '<h1>微思象棋播放器 V' + vs.version + ' 帮助信息</h1>';
vs.defaultOptions.help += '<hr />';
vs.defaultOptions.help += '<h2>1.&ensp;&ensp;单击“播放”按钮，可以自动播放棋局；播放过程中，单击“暂停”按钮，棋局停止自动播放。</h2>';
vs.defaultOptions.help += '<h2>2.&ensp;&ensp;单击“前进”、“后退”按钮，每次变化1步；单击“快进”、“快退”按钮，每次变化#quickStepOffsetRound#个回合，即#quickStepOffset#步。</h2>';
vs.defaultOptions.help += '<h2>3.&ensp;&ensp;单击“复制”按钮，可以复制当前局面。</h2>';
vs.defaultOptions.help += '<h2>4.&ensp;&ensp;复制局面后，可以直接在专业象棋软件中粘贴使用。</h2>';
vs.defaultOptions.help += '<h2>5.&ensp;&ensp;分析局面时，建议将局面复制到专业象棋软件中进行分析。</h2>';
vs.defaultOptions.help += '<h2>6.&ensp;&ensp;可以直接在棋盘上走棋，便于分析局面。</h2>';
vs.defaultOptions.help += '<h2>7.&ensp;&ensp;在着法列表中可以调整变招顺序或删除着法。</h2>';
vs.defaultOptions.help += '<h2>8.&ensp;&ensp;注释修改后直接在注释区外面任意处单击即可生效。</h2>';
vs.defaultOptions.help += '<h2>9.&ensp;&ensp;编辑局面会失去当前棋谱，请注意保存。</h2>';
vs.defaultOptions.help += '<h2>10.&ensp;编辑局面标签中，可以直接打开电脑中的棋谱，也可以直接将棋谱文件拖拽到本棋盘上。</h2>';
vs.defaultOptions.help += '<h2>11.&ensp;支持东萍、鹏飞、象棋世家、标准PGN、中国游戏中心、QQ象棋等格式，其他格式程序也会尝试自动识别。</h2>';
vs.defaultOptions.help += '<h2>12.&ensp;棋盘选项中，可以控制棋盘方向、播放速度、走子声音等。</h2>';
vs.defaultOptions.help += '<h2>13.&ensp;棋谱分享功能生成的论坛 UBB 代码，可以在支持该代码的论坛中使用。<a href="https://www.xiaxiangqi.com/" target="_blank">【查看都有哪些论坛支持该代码】</a></h2>';
vs.defaultOptions.help += '<hr />';
vs.defaultOptions.help += '<h2><a href="https://www.xiaxiangqi.com/vschess/" target="_blank">微思象棋播放器 V' + vs.version + '</a> <a href="https://margin.top/" target="_blank">Margin.Top &copy; 版权所有</a></h2>';
