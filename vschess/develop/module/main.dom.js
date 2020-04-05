// 自身路径
vs.selfPath = (function(){
	var currentElement = document.documentElement;

	while (currentElement.tagName.toLowerCase() !== "script") {
		currentElement = currentElement.lastChild;
	}

	return currentElement.src;
})();

// 默认路径为本程序的路径
vs.defaultPath = vs.selfPath.substring(0, vs.selfPath.lastIndexOf("/") + 1);

// 涉及页面 DOM 的属性，单独抽出来
$.extend(vschess, {
	// Placeholder 支持情况
	placeholder: "placeholder" in document.createElement("input"),

	// 本地保存支持情况
	localDownload: !!window.Blob && !!window.URL && "download" in document.createElement("a"),

	// 标签列表
	tabList: "board move comment info share export edit config".split(" "),

	// 钩子列表
	callbackList: "beforeClickAnimate afterClickAnimate loadFinish selectPiece unSelectPiece afterStartFen afterAnimate".split(" "),

	// 二进制棋谱扩展名列表
	binaryExt: "ccm xqf".split(" "),

	// 全局样式是否已加载完成的标记
	globalLoaded: false,

	// 全局样式加载完成后的回调
	globalLoadedCallback: [],

	// 声音列表
	soundList: "click bomb eat move check lose illegal".split(" "),

	// 音效组件缓存
	soundObject: {},

	// 风格音效是否已加载的标记，保证每个风格的音效只加载一次
	soundInit: {},

	// 风格样式是否已加载的标记，保证每个风格的样式只加载一次
	styleInit: {},

	// 风格样式是否已加载完成的标记
	styleLoaded: {},

	// 风格样式加载完成后的回调
	styleLoadedCallback: {},

	// 布局样式是否已加载的标记，保证每个布局的样式只加载一次
	layoutInit: {},

	// 布局样式是否已加载完成的标记
	layoutLoaded: {},

	// 布局样式加载完成后的回调
	layoutLoadedCallback: {},

	// 伪线程延时，20 为宜
	threadTimeout: 20,

	// 大棋谱生成东萍和鹏飞格式节点数临界点
	bigBookCritical: 10000,

	// 页面 Device Pixel Ratio
	dpr: window.devicePixelRatio || 1,

	// 编辑局面开始按钮列表
	editStartList: ["editStartButton", "editNodeStartButton", "editBeginButton", "editBlankButton", "editOpenButton"],

	// 编辑局面组件列表
	editModuleList: ["editEndButton", "editCancelButton", "editTips", "editTextarea", "editTextareaPlaceholder", "editPieceArea", "editBoard", "recommendClass", "recommendList", "editEditStartText", "editEditStartRound", "editEditStartPlayer"],

	// 粘贴棋谱组件列表
	editNodeModuleList: ["editNodeEndButton", "editNodeCancelButton", "editNodeTextarea", "editNodeTextareaPlaceholder"],

	// 分享代码组件列表
	shareCodeModuleList: ["shareHTMLTitle", "shareHTMLTextBox", "shareUBBTitle", "shareUBBTextBox"],

	// 状态参数语义化
	code: {
		// 棋子单击事件是否响应状态，0(0x00) 双方不响应，1(0x01) 仅黑方响应，2(0x10) 仅红方响应，3(0x11) 双方响应
		clickResponse: { none: 0, black: 1, red: 2, both: 3 },

		// 棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下，3(0x11) 对角旋转（左右+上下）
		turn: { none: 0, mirror: 1, reverse: 2, round: 3 }
	},

	// 可自动识别的棋谱信息项目列表
	autoInfo: "ecco open variation result".split(" "),

    // 可导出棋谱格式列表
    exportFormatList: {
        PGN_Chinese: "中文 PGN 格式",
        PGN_WXF: "WXF PGN 格式",
        PGN_ICCS: "ICCS PGN 格式",
        PengFei: "鹏飞 PFC 格式",
        DhtmlXQ: "东萍 DhtmlXQ UBB 格式",
        DHJHtmlXQ: "广东象棋网 DHJHtmlXQ 格式",
        ChessDB: "云库指令格式",
        Text: "文本 TXT 格式",
        QQ: "ＱＱ CHE 格式",
        TextBoard: "文字棋盘"
    },

	// 必须为起始局面才可以导出的棋谱格式列表
	exportFormatListIfNeedStart: "QQ".split(" ")
});
