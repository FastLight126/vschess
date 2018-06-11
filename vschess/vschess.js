/*
 * 微思象棋播放器 V2.1.0
 * https://www.xiaxiangqi.com/
 *
 * Copyright @ 2009-2018 Margin.Top 版权所有
 * https://margin.top/
 *
 * 本程序遵循 GPL 协议
 * https://www.gnu.org/licenses/fdl.html
 *
 * ECCO 开局分类编号系统算法由象棋巫师友情提供，在此表示衷心感谢。
 * https://www.xqbase.com/
 *
 * 最后修改日期：北京时间 2018年6月11日
 * Mon, 11 Jun 2018 21:51:59 +0800
 */

(function(){

// 检查 Zepto 或 jQuery 环境
if (typeof Zepto !== "undefined") {
	var $ = Zepto;
}
else if (typeof jQuery !== "undefined") {
	var $ = jQuery;
}
else {
	// 未引入 Zepto 或 jQuery，程序将自动加载 Zepto 或 jQuery
	var currentElement = document.documentElement;

	while (currentElement.tagName.toLowerCase() !== "script") {
		currentElement = currentElement.lastChild;
	}

	window.ActiveXObject?
	document.write('<script type="text/javascript" src="https://www.xiaxiangqi.com/static/js/jquery.js"></script>'):
	document.write('<script type="text/javascript" src="https://www.xiaxiangqi.com/static/js/zepto.js"></script>');
	document.write('<script type="text/javascript" src="' + currentElement.src + '"></script>');
	return false;
}

// 主程序
var vschess = {
	// 当前版本号
	version: "2.1.0",

	// 默认局面，使用 16x16 方式存储数据，虽然浪费空间，但是便于运算，效率较高
	// situation[0] 表示的是当前走棋方，1 为红方，2 为黑方
	// situation[1] 表示的是当前回合数
	// 其余部分 0 表示棋盘外面，1 表示该位置没有棋子
	// 棋子标识采用 16 进制方式计算，如 21 为十六进制的 15，1 表示红方，与 situation[0] 对应，5 表示帅（将）
	// 1:车 2:马 3:相（象） 4:仕（士） 5:帅（将） 6:炮 7:兵（卒）
	situation: [
		1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0,33,34,35,36,37,36,35,34,33, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 1,38, 1, 1, 1, 1, 1,38, 1, 0, 0, 0, 0,
		0, 0, 0,39, 1,39, 1,39, 1,39, 1,39, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0,23, 1,23, 1,23, 1,23, 1,23, 0, 0, 0, 0,
		0, 0, 0, 1,22, 1, 1, 1, 1, 1,22, 1, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0,17,18,19,20,21,20,19,18,17, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	],

	// 九宫格
	castle: [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	],

	// 九宫格索引
	castleR: [166, 167, 168, 182, 183, 184, 198, 199, 200], // 帅
	castleB: [ 54,  55,  56,  70,  71,  72,  86,  87,  88], // 将

	// 帅(将)的步长
	kingDelta: [-16, -1, 1, 16],

	// 仕(士)的步长
	advisorDelta: [-17, -15, 15, 17],

	// 马的步长，以帅(将)的步长作为马腿
	knightDelta: [[-33, -31], [-18, 14], [-14, 18], [31, 33]],

	// 被马将军的步长，以仕(士)的步长作为马腿
	knightCheckDelta: [[-33, -18], [-31, -14], [14, 31], [18, 33]],

	// 棋盘转换为局面，就是不同格式之间的映射，下同
	b2s: [
		 51,  52,  53,  54,  55,  56,  57,  58,  59,
		 67,  68,  69,  70,  71,  72,  73,  74,  75,
		 83,  84,  85,  86,  87,  88,  89,  90,  91,
		 99, 100, 101, 102, 103, 104, 105, 106, 107,
		115, 116, 117, 118, 119, 120, 121, 122, 123,
		131, 132, 133, 134, 135, 136, 137, 138, 139,
		147, 148, 149, 150, 151, 152, 153, 154, 155,
		163, 164, 165, 166, 167, 168, 169, 170, 171,
		179, 180, 181, 182, 183, 184, 185, 186, 187,
		195, 196, 197, 198, 199, 200, 201, 202, 203
	],

	// 局面转换为棋盘
	s2b: [
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  1,  2,  3,  4,  5,  6,  7,  8, 0, 0, 0, 0,
		0, 0, 0,  9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 0, 0, 0,
		0, 0, 0, 18, 19, 20, 21, 22, 23, 24, 25, 26, 0, 0, 0, 0,
		0, 0, 0, 27, 28, 29, 30, 31, 32, 33, 34, 35, 0, 0, 0, 0,
		0, 0, 0, 36, 37, 38, 39, 40, 41, 42, 43, 44, 0, 0, 0, 0,
		0, 0, 0, 45, 46, 47, 48, 49, 50, 51, 52, 53, 0, 0, 0, 0,
		0, 0, 0, 54, 55, 56, 57, 58, 59, 60, 61, 62, 0, 0, 0, 0,
		0, 0, 0, 63, 64, 65, 66, 67, 68, 69, 70, 71, 0, 0, 0, 0,
		0, 0, 0, 72, 73, 74, 75, 76, 77, 78, 79, 80, 0, 0, 0, 0,
		0, 0, 0, 81, 82, 83, 84, 85, 86, 87, 88, 89, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0
	],

	// 棋盘转换为 ICCS
	b2i: [
		"a9", "b9", "c9", "d9", "e9", "f9", "g9", "h9", "i9",
		"a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8", "i8",
		"a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7", "i7",
		"a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6", "i6",
		"a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5", "i5",
		"a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4", "i4",
		"a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3", "i3",
		"a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", "i2",
		"a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1", "i1",
		"a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0", "i0"
	],

	// ICCS 转换为棋盘
	i2b: {
		a9:  0, b9:  1, c9:  2, d9:  3, e9:  4, f9:  5, g9:  6, h9:  7, i9:  8,
		a8:  9, b8: 10, c8: 11, d8: 12, e8: 13, f8: 14, g8: 15, h8: 16, i8: 17,
		a7: 18, b7: 19, c7: 20, d7: 21, e7: 22, f7: 23, g7: 24, h7: 25, i7: 26,
		a6: 27, b6: 28, c6: 29, d6: 30, e6: 31, f6: 32, g6: 33, h6: 34, i6: 35,
		a5: 36, b5: 37, c5: 38, d5: 39, e5: 40, f5: 41, g5: 42, h5: 43, i5: 44,
		a4: 45, b4: 46, c4: 47, d4: 48, e4: 49, f4: 50, g4: 51, h4: 52, i4: 53,
		a3: 54, b3: 55, c3: 56, d3: 57, e3: 58, f3: 59, g3: 60, h3: 61, i3: 62,
		a2: 63, b2: 64, c2: 65, d2: 66, e2: 67, f2: 68, g2: 69, h2: 70, i2: 71,
		a1: 72, b1: 73, c1: 74, d1: 75, e1: 76, f1: 77, g1: 78, h1: 79, i1: 80,
		a0: 81, b0: 82, c0: 83, d0: 84, e0: 85, f0: 86, g0: 87, h0: 88, i0: 89
	},

	// 局面转换为 ICCS
	s2i: [
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0, "a9", "b9", "c9", "d9", "e9", "f9", "g9", "h9", "i9", 0, 0, 0, 0,
		0, 0, 0, "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8", "i8", 0, 0, 0, 0,
		0, 0, 0, "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7", "i7", 0, 0, 0, 0,
		0, 0, 0, "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6", "i6", 0, 0, 0, 0,
		0, 0, 0, "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5", "i5", 0, 0, 0, 0,
		0, 0, 0, "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4", "i4", 0, 0, 0, 0,
		0, 0, 0, "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3", "i3", 0, 0, 0, 0,
		0, 0, 0, "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", "i2", 0, 0, 0, 0,
		0, 0, 0, "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1", "i1", 0, 0, 0, 0,
		0, 0, 0, "a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0", "i0", 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0
	],

	// ICCS 转换为局面
	i2s: {
		a9:  51, b9:  52, c9:  53, d9:  54, e9:  55, f9:  56, g9:  57, h9:  58, i9:  59,
		a8:  67, b8:  68, c8:  69, d8:  70, e8:  71, f8:  72, g8:  73, h8:  74, i8:  75,
		a7:  83, b7:  84, c7:  85, d7:  86, e7:  87, f7:  88, g7:  89, h7:  90, i7:  91,
		a6:  99, b6: 100, c6: 101, d6: 102, e6: 103, f6: 104, g6: 105, h6: 106, i6: 107,
		a5: 115, b5: 116, c5: 117, d5: 118, e5: 119, f5: 120, g5: 121, h5: 122, i5: 123,
		a4: 131, b4: 132, c4: 133, d4: 134, e4: 135, f4: 136, g4: 137, h4: 138, i4: 139,
		a3: 147, b3: 148, c3: 149, d3: 150, e3: 151, f3: 152, g3: 153, h3: 154, i3: 155,
		a2: 163, b2: 164, c2: 165, d2: 166, e2: 167, f2: 168, g2: 169, h2: 170, i2: 171,
		a1: 179, b1: 180, c1: 181, d1: 182, e1: 183, f1: 184, g1: 185, h1: 186, i1: 187,
		a0: 195, b0: 196, c0: 197, d0: 198, e0: 199, f0: 200, g0: 201, h0: 202, i0: 203
	},

	// 棋子标识转换为 Fen 字符
	n2f: "*****************RNBAKCP*********rnbakcp".split(""),

	// Fen 字符转换为棋子标识
	f2n: { R: 17, N: 18, H: 18, B: 19, E: 19, A: 20, K: 21, C: 22, P: 23, r: 33, n: 34, h: 34, b: 35, e: 35, a: 36, k: 37, c: 38, p: 39, "*": 1 },

	// 棋盘方向映射
	turn: [
		[
			 0,  1,  2,  3,  4,  5,  6,  7,  8,
			 9, 10, 11, 12, 13, 14, 15, 16, 17,
			18, 19, 20, 21, 22, 23, 24, 25, 26,
			27, 28, 29, 30, 31, 32, 33, 34, 35,
			36, 37, 38, 39, 40, 41, 42, 43, 44,
			45, 46, 47, 48, 49, 50, 51, 52, 53,
			54, 55, 56, 57, 58, 59, 60, 61, 62,
			63, 64, 65, 66, 67, 68, 69, 70, 71,
			72, 73, 74, 75, 76, 77, 78, 79, 80,
			81, 82, 83, 84, 85, 86, 87, 88, 89
		],
		[
			 8,  7,  6,  5,  4,  3,  2,  1,  0,
			17, 16, 15, 14, 13, 12, 11, 10,  9,
			26, 25, 24, 23, 22, 21, 20, 19, 18,
			35, 34, 33, 32, 31, 30, 29, 28, 27,
			44, 43, 42, 41, 40, 39, 38, 37, 36,
			53, 52, 51, 50, 49, 48, 47, 46, 45,
			62, 61, 60, 59, 58, 57, 56, 55, 54,
			71, 70, 69, 68, 67, 66, 65, 64, 63,
			80, 79, 78, 77, 76, 75, 74, 73, 72,
			89, 88, 87, 86, 85, 84, 83, 82, 81
		],
		[
			81, 82, 83, 84, 85, 86, 87, 88, 89,
			72, 73, 74, 75, 76, 77, 78, 79, 80,
			63, 64, 65, 66, 67, 68, 69, 70, 71,
			54, 55, 56, 57, 58, 59, 60, 61, 62,
			45, 46, 47, 48, 49, 50, 51, 52, 53,
			36, 37, 38, 39, 40, 41, 42, 43, 44,
			27, 28, 29, 30, 31, 32, 33, 34, 35,
			18, 19, 20, 21, 22, 23, 24, 25, 26,
			 9, 10, 11, 12, 13, 14, 15, 16, 17,
			 0,  1,  2,  3,  4,  5,  6,  7,  8
		],
		[
			89, 88, 87, 86, 85, 84, 83, 82, 81,
			80, 79, 78, 77, 76, 75, 74, 73, 72,
			71, 70, 69, 68, 67, 66, 65, 64, 63,
			62, 61, 60, 59, 58, 57, 56, 55, 54,
			53, 52, 51, 50, 49, 48, 47, 46, 45,
			44, 43, 42, 41, 40, 39, 38, 37, 36,
			35, 34, 33, 32, 31, 30, 29, 28, 27,
			26, 25, 24, 23, 22, 21, 20, 19, 18,
			17, 16, 15, 14, 13, 12, 11, 10,  9,
			 8,  7,  6,  5,  4,  3,  2,  1,  0
		]
	],

	// Placeholder 支持情况
	placeholder: "placeholder" in document.createElement("input"),

	// 已创建棋盘对象列表
	chessList: [],

	// 标签列表
	tabList: "comment info share export edit config".split(" "),

	// 钩子列表
	callbackList: "beforeClickAnimate afterClickAnimate loadFinish selectPiece unSelectPiece".split(" "),

	// 默认 Fen 串
	defaultFen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",

	// 空白 Fen 串
	blankFen: "9/9/9/9/9/9/9/9/9/9 w - - 0 1",

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

	// 页面 Device Pixel Ratio
	dpr: window.devicePixelRatio || 1,

	// 棋谱信息项目列表
	info: {
		name: {
			title		: "\u68cb\u5c40\u6807\u9898",
			event		: "\u8d5b\u4e8b\u540d\u79f0",
			red			: "\u7ea2\u65b9\u540d\u79f0",
			redteam		: "\u7ea2\u65b9\u56e2\u4f53",
			redname		: "\u7ea2\u65b9\u59d3\u540d",
			redeng		: "\u7ea2\u65b9\u82f1\u6587\u540d",
			redlevel	: "\u7ea2\u65b9\u7b49\u7ea7",
			redrating	: "\u7ea2\u65b9\u7b49\u7ea7\u5206",
			redtime		: "\u7ea2\u65b9\u7528\u65f6",
			black		: "\u9ed1\u65b9\u540d\u79f0",
			blackteam	: "\u9ed1\u65b9\u56e2\u4f53",
			blackname	: "\u9ed1\u65b9\u59d3\u540d",
			blackeng	: "\u9ed1\u65b9\u82f1\u6587\u540d",
			blacklevel	: "\u9ed1\u65b9\u7b49\u7ea7",
			blackrating	: "\u9ed1\u65b9\u7b49\u7ea7\u5206",
			blacktime	: "\u9ed1\u65b9\u7528\u65f6",
			ecco		: "\u5f00\u5c40\u7f16\u53f7",
			open		: "\u5e03\u5c40\u7c7b\u578b",
			variation	: "\u53d8\u4f8b\u7c7b\u578b",
			result		: "\u5bf9\u5c40\u7ed3\u679c",
			remark		: "\u8bc4\u6ce8\u4eba\u5458",
			author		: "\u68cb\u8c31\u4f5c\u8005",
			group		: "\u8d5b\u4e8b\u7ec4\u522b",
			date		: "\u6bd4\u8d5b\u65e5\u671f",
			place		: "\u6bd4\u8d5b\u5730\u70b9",
			round		: "\u6bd4\u8d5b\u8f6e\u6b21",
			table		: "\u6bd4\u8d5b\u53f0\u6b21",
			judge		: "\u6267\u53f0\u88c1\u5224",
			record		: "\u68cb\u8c31\u8bb0\u5f55\u5458"
		},
		pfc: {
			date		: "create-time"
		},
		DhtmlXQ: {},
		pgn: {
			place		: "Site",
			open		: "Opening",
			ecco		: "ECCO"
		}
	},

	// 可自动识别的棋谱信息项目列表
	autoInfo: "ecco open variation result".split(" "),

	// 可导出棋谱格式列表
	exportFormatList: {
		PGN_Chinese : "\u4e2d\u6587 PGN \u683c\u5f0f",
		PGN_WXF : "WXF PGN \u683c\u5f0f",
		PGN_ICCS : "ICCS PGN \u683c\u5f0f",
		PengFei: "\u9e4f\u98de PFC \u683c\u5f0f",
		DhtmlXQ: "\u4e1c\u840d DhtmlXQ \u683c\u5f0f",
		Text : "\u6587\u672c TXT \u683c\u5f0f",
		QQ : "\uff31\uff31 CHE \u683c\u5f0f"
	},

	// 必须为起始局面才可以导出的棋谱格式列表
	exportFormatListIfNeedStart: "QQ".split(" "),

	// ECCO 编号目录
	eccoDir: {
		A: "\u5176\u4ed6\u5f00\u5c40 \u4e0a\u4ed5\u5c40 \u8fb9\u9a6c\u5c40 \u8fb9\u70ae\u5c40 \u5de1\u6cb3\u70ae\u5c40 \u8fc7\u6cb3\u70ae\u5c40 \u5175\u5e95\u70ae\u5c40 \u91d1\u94a9\u70ae\u5c40 \u8fb9\u5175\u5c40  \u98de\u76f8\u5c40 \u987a\u76f8\u5c40 \u5217\u76f8\u5c40 \u98de\u76f8\u5bf9\u8fdb\u5de6\u9a6c \u98de\u76f8\u5bf9\u8fdb\u53f3\u9a6c \u98de\u76f8\u8fdb\u4e09\u5175\u5bf9\u8fdb\u53f3\u9a6c \u98de\u76f8\u8fdb\u4e03\u5175\u5bf9\u8fdb\u53f3\u9a6c    \u98de\u76f8\u5bf9\u5de6\u58eb\u89d2\u70ae \u98de\u76f8\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u5de6\u9a6c\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u5de6\u8fb9\u9a6c\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u6a2a\u8f66\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u4e09\u5175\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u4e03\u5175\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u5bf9\u5de6\u4e2d\u70ae \u98de\u76f8\u8f6c\u5c4f\u98ce\u9a6c\u5bf9\u5de6\u4e2d\u70ae \u98de\u76f8\u5bf9\u53f3\u4e2d\u70ae \u98de\u76f8\u5bf9\u5de6\u8fc7\u5bab\u70ae \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u7ea2\u76f4\u8f66\u5bf9\u9ed1\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u7ea2\u76f4\u8f66\u8fb9\u70ae\u5bf9\u9ed1\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u4e92\u8fdb\u4e03\u5175 \u98de\u76f8\u5bf9\u53f3\u8fc7\u5bab\u70ae \u98de\u76f8\u5bf9\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u5de6\u9a6c\u5bf9\u8fdb\uff17\u5352 \u98de\u76f8\u4e92\u8fdb\u4e03\u5175\u5c40 \u98de\u76f8\u5bf9\u8fdb\uff13\u5352 \u8d77\u9a6c\u5c40 \u8d77\u9a6c\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u8fb9\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u4ed5\u89d2\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u4e2d\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u4e92\u8fdb\u4e03\u5175\u5c40     \u4ed5\u89d2\u70ae\u5c40 \u4ed5\u89d2\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u4ed5\u89d2\u70ae\u5bf9\u53f3\u4e2d\u70ae \u4ed5\u89d2\u70ae\u8f6c\u53cd\u5bab\u9a6c\u5bf9\u53f3\u4e2d\u70ae \u4ed5\u89d2\u70ae\u5bf9\u8fdb\uff17\u5352      \u8fc7\u5bab\u70ae\u5c40 \u8fc7\u5bab\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u8fc7\u5bab\u70ae\u5bf9\u6a2a\u8f66 \u8fc7\u5bab\u70ae\u5bf9\u5de6\u4e2d\u70ae \u8fc7\u5bab\u70ae\u76f4\u8f66\u5bf9\u5de6\u4e2d\u70ae \u8fc7\u5bab\u70ae\u76f4\u8f66\u5bf9\u5de6\u4e2d\u70ae\u6a2a\u8f66".split(" "),
		B: "\u4e2d\u70ae\u5c40 \u4e2d\u70ae\u5bf9\u8fdb\u53f3\u9a6c \u4e2d\u70ae\u5bf9\u8fdb\u53f3\u9a6c\u5148\u4e0a\u58eb \u4e2d\u70ae\u5bf9\u9e33\u9e2f\u70ae \u4e2d\u70ae\u5bf9\u53f3\u4e09\u6b65\u864e \u4e2d\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u5bf9\u9f9f\u80cc\u70ae \u4e2d\u70ae\u5bf9\u5de6\u70ae\u5c01\u8f66   \u4e2d\u70ae\u5bf9\u5355\u63d0\u9a6c \u4e2d\u70ae\u5bf9\u58eb\u89d2\u70ae\u8f6c\u5355\u63d0\u9a6c \u4e2d\u70ae\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66 \u4e2d\u70ae\u8fdb\u4e03\u5175\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66      \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u8fb9\u76f8\u5bf9\u5de6\u4e09\u6b65\u864e\u9a91\u6cb3\u8f66 \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u8fc7\u6cb3\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u4e24\u5934\u86c7\u5bf9\u5de6\u4e09\u6b65\u864e     \u4e2d\u70ae\u5bf9\u53cd\u5bab\u9a6c\u540e\u8865\u5de6\u9a6c \u4e2d\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u6025\u8fdb\u5de6\u9a6c\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516b\u70ae\u5bf9\u53cd\u5bab\u9a6c    \u4e94\u516d\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66\u8fb9\u70ae \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66\u8fb9\u70ae\u8fdb\uff17\u5352 \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u53cd\u5bab\u9a6c     \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u5de6\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u5de6\u6a2a\u8f66 \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c#\u7ea2\u5f03\u53cc\u5175\u5bf9\u9ed1\u53f3\u70ae\u8fc7\u6cb3".split(" "),
		C: "\u4e2d\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175 \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175\u5bf9\u9ed1\u53cc\u70ae\u8fc7\u6cb3 \u4e2d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u6a2a\u8f66    \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de1\u6cb3\u70ae \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fb9\u70ae \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175 \u4e2d\u70ae\u5de1\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u4e0d\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u4e09\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u4e03\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u53cc\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae     \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u4e0a\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u98de\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u53f3\u6a2a\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u53f3\u70ae\u8fc7\u6cb3 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c\u9ad8\u5de6\u70ae\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u8fb9\u70ae\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb\u53f3\u76f4\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4ed5\u89d2\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u8fdb\u4e2d\u5175\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e94\u516d\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u4e24\u5934\u86c7    \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u9ed1\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u5de6\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u53f3\u70ae\u5de1\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u9ed1\u53f3\u70ae\u5de1\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c  \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff13\u5352 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff13\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u53f3\u8f66\u5de1\u6cb3\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u5151\u8fb9\u5352  \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61\u53f3\u6a2a\u8f66 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61\u5de6\u70ae\u5de1\u6cb3 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u5de6\u9a6c\u5916\u76d8\u6cb3 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u7f13\u5f00\u8f66\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u53f3\u6a2a\u8f66    \u4e94\u516b\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u6b63\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u4e0a\u58eb \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u5151\uff17\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u8fb9\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5e73\u70ae\u538b\u9a6c\u5bf9\u9ed1\u8fb9\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5e73\u70ae\u538b\u9a6c \u4e94\u4e5d\u70ae\u5bf9\u5c4f\u98ce\u9a6c".split(" "),
		D: "\u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u5176\u4ed6 \u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u6a2a\u8f66 \u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u76f4\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u7f13\u5f00\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u76f4\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u76f4\u8f66\u5de1\u6cb3     \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u5de6\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u53f3\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u5151\u76f4\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u8fc7\u6cb3\u70ae \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u8fb9\u70ae     \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5148\u4e0a\u4ed5 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5de6\u8fb9\u9a6c \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5de1\u6cb3\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fc7\u6cb3\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4ed5\u89d2\u70ae \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fdb\u4e09\u5175 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fdb\u4e03\u5175 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4e24\u5934\u86c7 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4e24\u5934\u86c7\u5bf9\u9ed1\u53cc\u6a2a\u8f66 \u4e2d\u70ae\u4e0d\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u53f3\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u4e03\u8def\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u5de6\u8fb9\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u8fdb\u70ae\u6253\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u4e24\u5934\u86c7    \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e2d\u5175\u5bf9\u5de6\u4e09\u6b65\u864e\u9a91\u6cb3\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae#\u7ea2\u5de6\u76f4\u8f66 \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae#\u7ea2\u4e24\u5934\u86c7       \u4e2d\u70ae\u5bf9\u5217\u70ae \u4e2d\u70ae\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u53f3\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u5de6\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u53cc\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae".split(" "),
		E: "\u4ed9\u4eba\u6307\u8def\u5c40 \u4ed9\u4eba\u6307\u8def\u5bf9\u98de\u8c61 \u4ed9\u4eba\u6307\u8def\u8fdb\u53f3\u9a6c\u5bf9\u98de\u8c61 \u4ed9\u4eba\u6307\u8def\u5bf9\u4e2d\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u4ed5\u89d2\u70ae\u6216\u8fc7\u5bab\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u91d1\u94a9\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u8fdb\u53f3\u9a6c \u4ed9\u4eba\u6307\u8def\u4e92\u8fdb\u53f3\u9a6c\u5c40 \u4e24\u5934\u86c7\u5bf9\u8fdb\u53f3\u9a6c \u4e24\u5934\u86c7\u5bf9\u8fdb\u53f3\u9a6c\u8f6c\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u98de\u76f8\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u53f3\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61#\u7ea2\u53f3\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61#\u4e92\u8fdb\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u8f6c\u987a\u70ae   \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5148\u4e0a\u4ed5 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u8fdb\u5de6\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u8fdb\u5de6\u9a6c\u5bf9\u9ed1\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u4e0a\u58eb \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u8fc7\u6cb3 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u8fb9\u5352   \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u9ed1\u8fdb\uff17\u5352 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u9ed1\u8fde\u8fdb\uff17\u5352 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u62d0\u89d2\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb7\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u4e0a\u4ed5\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de1\u6cb3\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u53cc\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u53f3\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u70ae\u6253\u4e2d\u5352  \u5bf9\u5175\u5c40 \u5bf9\u5175\u8fdb\u53f3\u9a6c\u5c40 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u98de\u76f8 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u6a2a\u8f66 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u8fb9\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae\u5bf9\u53f3\u4e2d\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae\u5bf9\u5de6\u4e2d\u70ae".split(" ")
	},

	// 编辑局面开始按钮列表
	editStartList: ["editStartButton", "editNodeStartButton", "editBeginButton", "editBlankButton", "editOpenButton"],

	// 编辑局面组件列表
	editModuleList: ["editEndButton", "editCancelButton", "editTips", "editTextarea", "editTextareaPlaceholder", "editPieceArea", "editBoard", "recommendClass", "recommendList", "editEditStartText", "editEditStartRound", "editEditStartPlayer"],

	// 粘贴棋谱组件列表
	editNodeModuleList: ["editNodeEndButton", "editNodeCancelButton", "editNodeTextarea", "editNodeTextareaPlaceholder"],

	// 状态参数语义化
	code: {
		// 棋子单击事件是否响应状态，0(0x00) 双方不响应，1(0x01) 仅黑方响应，2(0x10) 仅红方响应，3(0x11) 双方响应
		clickResponse: { none: 0, black: 1, red: 2, both: 3 },

		// 棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下，3(0x11) 对角旋转（左右+上下）
		turn: { none: 0, mirror: 1, reverse: 2, round: 3 }
	}
};

// 自身路径
vschess.selfPath = (function(){
	var currentElement = document.documentElement;

	while (currentElement.tagName.toLowerCase() !== "script") {
		currentElement = currentElement.lastChild;
	}

	return currentElement.src;
})();

// 默认路径为本程序的路径
vschess.defaultPath = vschess.selfPath.substring(0, vschess.selfPath.lastIndexOf("/") + 1);

// 程序默认参数
vschess.defaultOptions = {
	// 自定义棋谱
	chessData: false,

	// 默认风格
	style: "default",

	// 默认布局
	layout: "default",

	// 默认全局样式
	globalCSS: vschess.defaultPath + "global.css",

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

	// IE6 自定义棋子图片路径，如需自定义请参考官方文档
	IE6Compatible_CustomPieceUrl: false,

	// 选择解析器，默认为自动选择
	parseType: "auto",

	// 默认棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下翻转，3(0x11) 对角旋转
	// 亦可以使用 vschess.code.turn：none 不翻转，mirror 左右翻转，reverse 上下翻转，round 对角旋转
	turn: vschess.code.turn.none,

	// 默认棋子单击事件是否响应状态，0(0x00) 双方不响应，1(0x01) 仅黑方响应，2(0x10) 仅红方响应，3(0x11) 双方响应
	// 亦可以使用 vschess.code.clickResponse：none 双方不响应，black 仅黑方响应，red 仅红方响应，both 双方响应
	clickResponse: vschess.code.clickResponse.both,

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

	// 起始局面提示信息
	startTips: [
		"\u84dd\u8272\u7684\u7740\u6cd5\u542b\u6709\u53d8\u7740",
		"\u6807\u6709\u661f\u53f7\u7684\u7740\u6cd5\u542b\u6709\u6ce8\u89e3",
		"\u652f\u6301\u4e1c\u840d\u3001\u9e4f\u98de\u7b49\u591a\u79cd\u683c\u5f0f",
		"\u5355\u51fb\u201c\u590d\u5236\u201d\u590d\u5236\u5f53\u524d\u5c40\u9762",
		'<a href="https://www.xiaxiangqi.com/" target="_blank">\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V' + vschess.version + "</a>",
		'<a href="https://margin.top/" target="_blank">Margin.Top &copy; \u7248\u6743\u6240\u6709</a>'
	],

	// 中文着法文字
	ChineseChar: {
		Piece	 : "\u8f66\u9a6c\u76f8\u4ed5\u5e05\u70ae\u5175\u8f66\u9a6c\u8c61\u58eb\u5c06\u70ae\u5352",
		Number	 : "\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19",
		PawnIndex: "\u4e00\u4e8c\u4e09\u56db\u4e94\u4e00\u4e8c\u4e09\u56db\u4e94",
		Text	 : "\u524d\u4e2d\u540e\u8fdb\u9000\u5e73"
	},

	// 云服务 API 地址
	cloudApi: {
		startFen: "https://www.xiaxiangqi.com/api/cloud/startfen",
		saveBook: "https://www.xiaxiangqi.com/api/cloud/savebook",
		saveBookForShare: "https://www.xiaxiangqi.com/api/cloud/book/save"
	},

	// 默认推荐起始局面列表
	recommendList: [
		{ name: "\u5e38\u7528\u5f00\u5c40", fenList: [
			{ name: "\u7a7a\u767d\u68cb\u76d8", "fen": "9/9/9/9/9/9/9/9/9/9 w - - 0 1" },
			{ name: "\u53ea\u6709\u5e05\u5c06", "fen": "5k3/9/9/9/9/9/9/9/9/3K5 w - - 0 1" },
			{ name: "\u6807\u51c6\u5f00\u5c40", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u5de6\u9a6c", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKABNR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u5de6\u9a6c", "fen": "rnbakab1r/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53f3\u9a6c", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKAB1R w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53f3\u9a6c", "fen": "r1bakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53cc\u9a6c", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53cc\u9a6c", "fen": "r1bakab1r/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53cc\u4ed5", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNB1K1BNR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53cc\u58eb", "fen": "rnb1k1bnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53cc\u76f8", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RN1AKA1NR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53cc\u8c61", "fen": "rn1aka1nr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u4ed5\u76f8", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RN2K2NR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u58eb\u8c61", "fen": "rn2k2nr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u4e94\u5175", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u4e94\u5352", "fen": "rnbakabnr/9/1c5c1/9/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u4e5d\u5b50", "fen": "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u4e5d\u5b50", "fen": "rn2k2nr/9/1c5c1/9/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" }
		]}
	]
};

// 默认帮助信息
vschess.defaultOptions.help  = '<h1>\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V' + vschess.version + ' \u5e2e\u52a9\u4fe1\u606f</h1>';
vschess.defaultOptions.help += '<hr />';
vschess.defaultOptions.help += '<h2>1.&ensp;&ensp;\u5355\u51fb\u201c\u64ad\u653e\u201d\u6309\u94ae\uff0c\u53ef\u4ee5\u81ea\u52a8\u64ad\u653e\u68cb\u5c40\uff1b\u64ad\u653e\u8fc7\u7a0b\u4e2d\uff0c\u5355\u51fb\u201c\u6682\u505c\u201d\u6309\u94ae\uff0c\u68cb\u5c40\u505c\u6b62\u81ea\u52a8\u64ad\u653e\u3002</h2>';
vschess.defaultOptions.help += '<h2>2.&ensp;&ensp;\u5355\u51fb\u201c\u524d\u8fdb\u201d\u3001\u201c\u540e\u9000\u201d\u6309\u94ae\uff0c\u6bcf\u6b21\u53d8\u53161\u6b65\uff1b\u5355\u51fb\u201c\u5feb\u8fdb\u201d\u3001\u201c\u5feb\u9000\u201d\u6309\u94ae\uff0c\u6bcf\u6b21\u53d8\u5316#quickStepOffsetRound#\u4e2a\u56de\u5408\uff0c\u5373#quickStepOffset#\u6b65\u3002</h2>';
vschess.defaultOptions.help += '<h2>3.&ensp;&ensp;\u5355\u51fb\u201c\u590d\u5236\u201d\u6309\u94ae\uff0c\u53ef\u4ee5\u590d\u5236\u5f53\u524d\u5c40\u9762\u3002</h2>';
vschess.defaultOptions.help += '<h2>4.&ensp;&ensp;\u590d\u5236\u5c40\u9762\u540e\uff0c\u53ef\u4ee5\u76f4\u63a5\u5728\u4e13\u4e1a\u8c61\u68cb\u8f6f\u4ef6\u4e2d\u7c98\u8d34\u4f7f\u7528\u3002</h2>';
vschess.defaultOptions.help += '<h2>5.&ensp;&ensp;\u5206\u6790\u5c40\u9762\u65f6\uff0c\u5efa\u8bae\u5c06\u5c40\u9762\u590d\u5236\u5230\u4e13\u4e1a\u8c61\u68cb\u8f6f\u4ef6\u4e2d\u8fdb\u884c\u5206\u6790\u3002</h2>';
vschess.defaultOptions.help += '<h2>6.&ensp;&ensp;\u53ef\u4ee5\u76f4\u63a5\u5728\u68cb\u76d8\u4e0a\u8d70\u68cb\uff0c\u4fbf\u4e8e\u5206\u6790\u5c40\u9762\u3002</h2>';
vschess.defaultOptions.help += '<h2>7.&ensp;&ensp;\u5728\u7740\u6cd5\u5217\u8868\u4e2d\u53ef\u4ee5\u8c03\u6574\u53d8\u62db\u987a\u5e8f\u6216\u5220\u9664\u7740\u6cd5\u3002</h2>';
vschess.defaultOptions.help += '<h2>8.&ensp;&ensp;\u6ce8\u91ca\u4fee\u6539\u540e\u76f4\u63a5\u5728\u6ce8\u91ca\u533a\u5916\u9762\u4efb\u610f\u5904\u5355\u51fb\u5373\u53ef\u751f\u6548\u3002</h2>';
vschess.defaultOptions.help += '<h2>9.&ensp;&ensp;\u7f16\u8f91\u5c40\u9762\u4f1a\u5931\u53bb\u5f53\u524d\u68cb\u8c31\uff0c\u8bf7\u6ce8\u610f\u4fdd\u5b58\u3002</h2>';
vschess.defaultOptions.help += '<h2>10.&ensp;\u7f16\u8f91\u5c40\u9762\u6807\u7b7e\u4e2d\uff0c\u53ef\u4ee5\u76f4\u63a5\u6253\u5f00\u7535\u8111\u4e2d\u7684\u68cb\u8c31\uff0c\u4e5f\u53ef\u4ee5\u76f4\u63a5\u5c06\u68cb\u8c31\u6587\u4ef6\u62d6\u62fd\u5230\u672c\u68cb\u76d8\u4e0a\u3002</h2>';
vschess.defaultOptions.help += '<h2>11.&ensp;\u652f\u6301\u4e1c\u840d\u3001\u9e4f\u98de\u3001\u8c61\u68cb\u4e16\u5bb6\u3001\u6807\u51c6PGN\u3001\u4e2d\u56fd\u6e38\u620f\u4e2d\u5fc3\u3001QQ\u8c61\u68cb\u7b49\u683c\u5f0f\uff0c\u5176\u4ed6\u683c\u5f0f\u7a0b\u5e8f\u4e5f\u4f1a\u5c1d\u8bd5\u81ea\u52a8\u8bc6\u522b\u3002</h2>';
vschess.defaultOptions.help += '<h2>12.&ensp;\u68cb\u76d8\u9009\u9879\u4e2d\uff0c\u53ef\u4ee5\u63a7\u5236\u68cb\u76d8\u65b9\u5411\u3001\u64ad\u653e\u901f\u5ea6\u3001\u8d70\u5b50\u58f0\u97f3\u7b49\u3002</h2>';
vschess.defaultOptions.help += '<hr />';
vschess.defaultOptions.help += '<h2><a href="https://www.xiaxiangqi.com/" target="_blank">\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V' + vschess.version + '</a> <a href="https://margin.top/" target="_blank">Margin.Top &copy; \u7248\u6743\u6240\u6709</a></h2>';

// IE6 兼容，棋子 PNG 图片透明，如果需要自定义棋子图片路径，请参考官方文档
vschess.IE6Compatible_setPieceTransparent = function(options){
	if (!window.ActiveXObject || window.XMLHttpRequest || options.IE6Compatible_CustomPieceUrl) {
		return this;
	}

	var cssRule = 'filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled="true", sizingMethod="scale", src="#"); background:none;';
	var sheet = document.createStyleSheet();

	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-S"     , cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/nr.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-s"     , cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/ns.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-R span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rr.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-N span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rn.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-B span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rb.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-A span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/ra.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-K span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rk.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-C span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rc.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-P span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rp.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-r span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/br.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-n span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bn.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-b span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bb.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-a span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/ba.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-k span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bk.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-c span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bc.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-p span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bp.png"));

	return this;
};

// 从原始数据中抽取棋局信息
vschess.dataToInfo = function(chessData, parseType){
	var replaceQuote = chessData.replace(/\'/g, '"');

	// 标准节点树格式，即鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("n version") || parseType === "pfc") {
		return vschess.dataToInfo_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return vschess.dataToInfo_DhtmlXQ(chessData);
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~replaceQuote.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return vschess.dataToInfo_PGN(chessData);
	}

	// 未能识别的数据，返回空
	return {};
};

// 从鹏飞象棋 PFC 格式中抽取棋局信息
vschess.dataToInfo_PFC = function(chessData){
	chessData = chessData.replace("<!--", "").replace("-->", "").replace(/<\?xml(.*)\?>/, "");
	chessData = chessData.replace(/<n/ig, "<div").replace(/\/>/ig, "></div>").replace(/<\/n>/ig, "</div>");
	var node  = $($.trim(chessData)), result = {};

	for (var i in vschess.info.name) {
		node.attr(i) && (result[i] = node.attr(i));
	}

	return result;
};

// 从标准 PGN 格式中抽取棋局信息
vschess.dataToInfo_PGN = function(chessData){
	// 识别模式 A
	var resultA = {}, original = {};
	var lines = chessData.split("\n");

	for (var i = 0; i < lines.length; ++i) {
		var l = $.trim(lines[i]);
		var start = l.    indexOf("[");
		var end   = l.lastIndexOf("]");

		if (~start && ~end) {
			var info  = l.substring(start + 1, end);
			var name  = info.split(/[\s]/)[0];
			var value = $.trim(info.replace(name, ""));
			var quotA = value.charAt(0               ) === "'" || value.charAt(0               ) === '"';
			var quotB = value.charAt(value.length - 1) === "'" || value.charAt(value.length - 1) === '"';
			quotA && (value = value.substring(1                  ));
			quotB && (value = value.substring(0, value.length - 1));
			original[name] = value;
		}
	}

	for (var i in vschess.info.name) {
		var name = vschess.info.pgn[i] || vschess.fieldNameToCamel(i);
		original[name] && (resultA[i] = original[name]);
	}

	// 识别模式 B
	var resultB = {};

	for (var i in vschess.info.name) {
		var startTag = "[" + (vschess.info.pgn[i] || vschess.fieldNameToCamel(i));
		var startPos = chessData.indexOf(startTag);

		if (~startPos) {
			var value = chessData.substring(startPos + startTag.length + 2, chessData.indexOf("]", startPos) - 1);
			value && (resultB[i] = value);
		}
	}

	// AB 结果集合并
	for (var i in resultB) {
		(!resultA[i] || resultB[i].length > resultA[i].length) && (resultA[i] = resultB[i]);
	}

	return resultA;
};

// 从东萍象棋 Dhtml 格式中抽取棋局信息
vschess.dataToInfo_DhtmlXQ = function(chessData){
	var result = {};

	for (var i in vschess.info.name) {
		var key = "DhtmlXQ_" + (vschess.info.DhtmlXQ[i] || i);
		var startTag = "[" + key + "]";
		var startPos = chessData.indexOf(startTag);

		if (~startPos) {
			var value = chessData.substring(startPos + startTag.length, chessData.indexOf("[/" + key + "]", startPos));
			value && (result[i] = value);
		}
	}

	switch (result.result) {
		case "\u7ea2\u80dc": result.result = "1-0"    ; break;
		case "\u9ed1\u80dc": result.result = "0-1"    ; break;
		case "\u548c\u68cb": result.result = "1/2-1/2"; break;
		default    : result.result = "*"      ; break;
	}

	return result;
};

// 将原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vschess.dataToNode = function(chessData, parseType){
	var match, RegExp = vschess.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType == "auto" && ~chessData.indexOf("n version") || parseType == "pfc") {
		return vschess.dataToNode_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType == "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType == "DhtmlXQ") {
		return vschess.dataToNode_DhtmlXQ(chessData);
	}

	// QQ新中国象棋格式
	if (parseType == "auto" && RegExp.QQNew.test(chessData) || parseType == "qqnew") {
		return vschess.dataToNode_QQNew(chessData);
	}

	// 象棋世家格式
	if (parseType == "auto" && RegExp.ShiJia.test(chessData) || parseType == "shijia") {
		return vschess.dataToNode_ShiJia(chessData);
	}

	// 标准 PGN 格式
	if (parseType == "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType == "pgn") {
		return vschess.dataToNode_PGN(chessData);
	}

	// 中国游戏中心 CCM 格式
	if (parseType == "auto" && vschess.cca(chessData) === 1 || parseType == "ccm") {
		return vschess.dataToNode_CCM(chessData);
	}

	// 发现着法，尝试识别
	if (RegExp.Chinese.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"]' + chessData);
	}

	if (RegExp.WXF.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "WXF"]' + chessData);
	}

	if (RegExp.ICCS.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "ICCS"]' + chessData);
	}

	// 简易坐标格式兼容，将简易坐标转换为 ICCS 格式，然后直接调用 ICCS 转换器转换，其实PGN格式并没有此种着法格式。
	if (RegExp.Node.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "Node"]' + chessData);
	}

	// 长 Fen 串
	if (match = RegExp.FenLong.exec(chessData)) {
		return { fen: match[0], comment: "", next: [], defaultIndex: 0 };
	}

	// 短 Fen 串
	if (match = RegExp.FenShort.exec(chessData)) {
		return { fen: match[0] + " - - 0 1", comment: "", next: [], defaultIndex: 0 };
	}

	// 未能识别的数据，返回起始局面
	return { fen: vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
};

// 将鹏飞象棋 PFC 格式转换为棋谱节点树
vschess.dataToNode_PFC = function(chessData){
	chessData  = chessData.replace("<!--", "").replace("-->", "").replace(/<\?xml(.*)\?>/, "");
	chessData  = chessData.replace(/<n/ig, "<div").replace(/\/>/ig, "></div>").replace(/<\/n>/ig, "</div>");
	var node   = $($.trim(chessData));
	var result = { fen: node.attr("m"), comment: node.attr("c") || "", next: [], defaultIndex: 0 };

	function insertNext(node, target){
		node.children("div").each(function(index){
			var each = $(this);
			var insert = { move: each.attr("m"), comment: each.attr("c") || "", next: [], defaultIndex: 0 };
			each.attr("default") && (target.defaultIndex = index);
			target.next.push(insert);
			insertNext(each, insert);
		});
	}

	insertNext(node, result);
	return result;
};

// 将标准 PGN 格式转换为棋谱节点树
vschess.dataToNode_PGN = function(chessData){
	var originalChessData = chessData, RegExp = vschess.RegExp();

	// 识别着法格式
	if (~chessData.indexOf('[Format "Node"]')) {
		var format = "node";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "ICCS"]')) {
		var format = "iccs";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "WXF"]')) {
		var format = "wxf";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/1\-0([\S\s]*)/g, "").replace(/0\-1([\S\s]*)/g, "")
			.replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}
	else {
		var format = "chinese";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "").replace(/\*([\S\s]*)/g, "");
	}

	// 抽取注释
	var RegExp_PGN_Comment = /\{([^\{\}]*)\}/, RegExp_PGN_Comment_Result, commentList = [];

	while (RegExp_PGN_Comment_Result = RegExp_PGN_Comment.exec(chessData)) {
		commentList.push(RegExp_PGN_Comment_Result[1]);
		chessData = chessData.replace(RegExp_PGN_Comment, "COMMENT");
	}

	// 映射着法和对应的注释
	var dataSplitByMove = [], commentListByStep = [];

	switch (format) {
		case "node": dataSplitByMove = chessData.split(RegExp.Node	 ); break;
		case "iccs": dataSplitByMove = chessData.split(RegExp.ICCS	 ); break;
		case "wxf" : dataSplitByMove = chessData.split(RegExp.WXF	 ); break;
		default    : dataSplitByMove = chessData.split(RegExp.Chinese); break;
	}

	for (var i = 0, j = 0; i < dataSplitByMove.length; ++i) {
		~dataSplitByMove[i].indexOf("COMMENT") && (commentListByStep[i] = commentList[j++]);
	}

	// 抽取起始 Fen 串
	var match, startFen, noFenData;//, RegExp = vschess.RegExp();

	if (match = RegExp.FenLong.exec(originalChessData)) {
		startFen  = match[0];
		noFenData = chessData.replace(RegExp.FenShort, "");
	}
	else if (match = RegExp.FenShort.exec(originalChessData)) {
		startFen = match[0] + " - - 0 1";
		noFenData = chessData.replace(RegExp.FenShort, "");
	}
	else {
		startFen = vschess.defaultFen;
		noFenData = chessData;
	}

	// 抽取着法
	var moveList = [];

	if (format === "node") {
		while (match = RegExp.Node.exec(noFenData)) {
			moveList.push(vschess.Node2ICCS_NoFen(match[0]));
		}
	}
	else if (format === "iccs") {
		while (match = RegExp.ICCS.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}
	else if (format === "wxf") {
		while (match = RegExp.WXF.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}
	else {
		while (match = RegExp.Chinese.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}

	// 生成节点树
	var stepList = vschess.stepList2nodeList(moveList, startFen);

	// 尝试识别黑先
	var fenChangePlayer = vschess.fenChangePlayer(startFen);
	var stepListM = vschess.stepList2nodeList(moveList, fenChangePlayer);

	if (stepListM.length > stepList.length) {
		startFen = fenChangePlayer;
		stepList = stepListM;
	}

	function makeBranch(list, target, b, i){
		var step = list.shift();
		var next = { move: step, comment: commentListByStep[i] || "", next: [], defaultIndex: 0 };
		target.next.push(next);
		list.length && makeBranch(list, next, b, i + 1);
	}

	var result = { fen: stepList.shift(), comment: commentListByStep[0] || "", next: [], defaultIndex: 0 };
	stepList.length && makeBranch(stepList, result, 0, 1);
	return result;
};

// 将东萍象棋 Dhtml 格式转换为棋谱节点树
vschess.dataToNode_DhtmlXQ = function(chessData, onlyFen){
	var DhtmlXQ_Comment  = {};
	var DhtmlXQ_Change   = {};
	var DhtmlXQ_Start    = "";
	var DhtmlXQ_MoveList = "";
	var DhtmlXQ_EachLine = chessData.split("\n");

	for (var i = 0; i < DhtmlXQ_EachLine.length; ++i) {
		var l = DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_comment")) {
			var start	  = l.indexOf("]");
			var end 	  = l.indexOf("[/DhtmlXQ_comment");
			var commentId = l.substring(16, start);
			~commentId.indexOf("_") || (commentId = "0_" + commentId);
			DhtmlXQ_Comment[commentId] = l.substring(start + 1, end).replace(/\|\|/g, "\n");
		}
		else if (~l.indexOf("[DhtmlXQ_binit")) {
			DhtmlXQ_Start = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_binit"));
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			DhtmlXQ_MoveList = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_movelist"));
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start	 = l.indexOf("]");
			var end 	 = l.indexOf("[/DhtmlXQ_move_");
			var changeId = l.substring(14, start);
			DhtmlXQ_Change[changeId] = l.substring(start + 1, end);
		}
	}

	// 抽取起始局面，生成起始 Fen 串
	if (DhtmlXQ_Start) {
		var DhtmlXQ_ToFen = new Array(91).join("*").split(""), DhtmlXQ_ToFenFinal = [];
		var DhtmlXQ_ToFenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp".split("");

		for (var i = 0; i < 32; ++i) {
			var move = DhtmlXQ_Start.substring(i * 2, i * 2 + 2).split("");
			DhtmlXQ_ToFen[+move[0] + move[1] * 9] = DhtmlXQ_ToFenPiece[i];
		}

		DhtmlXQ_ToFenFinal = vschess.arrayToFen(DhtmlXQ_ToFen);
	}
	else {
		var DhtmlXQ_ToFenFinal = vschess.defaultFen.split(" ")[0];
		var DhtmlXQ_ToFen = vschess.fenToArray(DhtmlXQ_ToFenFinal);
	}

	if (DhtmlXQ_MoveList) {
		var firstMovePos = DhtmlXQ_MoveList.substring(0, 2).split("");
		DhtmlXQ_ToFenFinal += vschess.cca(DhtmlXQ_ToFen[+firstMovePos[0] + firstMovePos[1] * 9]) > 96 ? " b - - 0 1" : " w - - 0 1";
	}
	else {
		var checkW = DhtmlXQ_ToFenFinal + " w - - 0 1";
		var checkB = DhtmlXQ_ToFenFinal + " b - - 0 1";
		DhtmlXQ_ToFenFinal = vschess.checkFen(checkB).length < vschess.checkFen(checkW).length ? checkB : checkW;
	}

	if (onlyFen) {
		return DhtmlXQ_ToFenFinal;
	}

	var branchHashTable = {};

	function DhtmlXQ_MoveToMove(DhtmlXQ_MoveList){
		var moveList = [];

		while (DhtmlXQ_MoveList.length) {
			var move = DhtmlXQ_MoveList.substring(0, 4).split("");
			moveList.push(vschess.fcc(+move[0] + 97) + (9 - move[1]) + vschess.fcc(+move[2] + 97) + (9 - move[3]));
			DhtmlXQ_MoveList = DhtmlXQ_MoveList.substring(4);
		}

		return moveList;
	}

	function makeBranch(list, target, b, i){
		if (list.length === 0) return false;
		var next = { move: list.shift(), comment: DhtmlXQ_Comment[b + "_" + i] || "", next: [], defaultIndex: 0 };
		branchHashTable[b + "_" + ++i] = next;
		target.next.push(next);
		makeBranch(list, next, b, i);
	}

	// 生成主分支
	var result   = { fen: DhtmlXQ_ToFenFinal, comment: DhtmlXQ_Comment["0_0"] || "", next: [], defaultIndex: 0 };
	var moveList = DhtmlXQ_MoveToMove(DhtmlXQ_MoveList);
	branchHashTable["0_1"] = result;
	makeBranch(moveList, result, 0, 1);

	// 生成变着分支
	for (var id in DhtmlXQ_Change) {
		var idSplit  = id.split("_");
		var moveList = DhtmlXQ_MoveToMove(DhtmlXQ_Change[id]);
		makeBranch(moveList, branchHashTable[idSplit[0] + "_" + idSplit[1]], idSplit[2], idSplit[1]);
	}

	return result;
};

// 将 QQ 新中国象棋格式转换为棋谱节点树
vschess.dataToNode_QQNew = function(chessData) {
	var match, stepList = [];
	var RegExp = vschess.RegExp();

	while (match = RegExp.QQNew.exec(chessData)) {
		stepList.push(vschess.fcc(105 - match[2]) + match[1] + vschess.fcc(105 - match[4]) + match[3]);
	}

	return vschess.stepListToNode(vschess.defaultFen, stepList);
};

// 将象棋世家格式转换为棋谱节点树
vschess.dataToNode_ShiJia = function(chessData, onlyFen) {
	var RegExp_Fen  = /([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)(?:[\s]+)\+([BbRr])/g;
	var RegExp_Move = /([0-9][a-zA-Z]-[0-9][a-zA-Z])/g;
	var match = RegExp_Fen.exec(chessData), stepList = [];

	if (match) {
		var chessman  = "*PPPPPCCNNRRBBAAKpppppccnnrrbbaak".split("");
		var situation = vschess.fenToSituation(vschess.blankFen);
		situation[0]  = match[33].toUpperCase() === "B" ? 2 : 1;

		for (var i = 1; i <= 32; ++i) {
			situation[match[i] - 1] = vschess.f2n[chessman[i]];
		}

		var fen = vschess.situationToFen(situation);
	}
	else {
		var fen = vschess.defaultFen;
	}

	if (onlyFen) {
		return fen;
	}

	while (match = RegExp_Move.exec(chessData)) {
		var move = match[1].toUpperCase().split("");
		stepList.push(vschess.fcc(+move[0] + 97) + (vschess.cca(move[1]) - 65) + vschess.fcc(+move[3] + 97) + (vschess.cca(move[4]) - 65));
	}

	return vschess.stepListToNode(fen, stepList);
};

// 将中国游戏中心 CCM 格式转换为棋谱节点树
vschess.dataToNode_CCM = function(chessData) {
	chessData = chessData.substring(1);
	var stepList = [];

	while (chessData.length) {
		var fromX = 8 - chessData.charCodeAt(2);
		var   toX = 8 - chessData.charCodeAt(3);
		var fromY = 9 - chessData.charCodeAt(4);
		var   toY = 9 - chessData.charCodeAt(5);
		chessData =     chessData.substring (7);
		stepList.push(vschess.b2i[fromY * 9 + fromX] + vschess.b2i[toY * 9 + toX]);
	}

	return vschess.stepListToNode(vschess.defaultFen, stepList);
};

// 将着法列表转换为棋谱节点树
vschess.stepListToNode = function(fen, stepList){
	function makeBranch(list, target, b, i){
		var step = list.shift();
		var next = { move: step, comment: "", next: [], defaultIndex: 0 };
		target.next.push(next);
		list.length && makeBranch(list, next, b, i + 1);
	}

	var result = { fen: fen || vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
	stepList.length && makeBranch(stepList, result, 0, 1);
	return result;
};

// 将整数限制在一个特定的范围内
vschess.limit = function(num, min, max, defaultValue){
	typeof num == "undefined" && typeof defaultValue != "undefined" && (num = defaultValue);
	min = parseInt(min); isNaN(min) && (min = -Infinity);
	max = parseInt(max); isNaN(max) && (max =  Infinity);
	num = parseInt(num); isNaN(num) && (num = 0);
	num < min && (num = min);
	num > max && (num = max);
	return num;
};

// 正则表达式，使用时都是新的，避免出现 lastIndex 冲突
vschess.RegExp = function(){
	return {
		// Fen 串识别正则表达式
		FenLong	: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr][\s]-[\s]-[\s][0-9]+[\s][0-9]+/,
		FenShort: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr]/,

		// 通用棋步识别正则表达式
		Chinese	: /[\u8f66\u8eca\u4fe5\u9a6c\u99ac\u508c\u76f8\u8c61\u4ed5\u58eb\u5e05\u5e25\u5c06\u5c07\u70ae\u5305\u7832\u5175\u5352\u524d\u4e2d\u540e\u5f8c\u4e00\u4e8c\u4e09\u56db\u4e94\u58f9\u8d30\u53c1\u8086\u4f0d\uff11\uff12\uff13\uff14\uff151-5][\u8f66\u8eca\u4fe5\u9a6c\u99ac\u508c\u76f8\u8c61\u4ed5\u58eb\u70ae\u5305\u7832\u5175\u5352\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u634c\u7396\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff191-9][\u8fdb\u9032\u9000\u5e73][\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u634c\u7396\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff191-9]/g,
		Node	: /[A-Ia-i][0-9][A-Ia-i][0-9]/g,
		ICCS	: /[A-Ia-i][0-9]-[A-Ia-i][0-9]/g,
		WXF		: /[RNHBEAKCPrnhbeakcp\+\-1-5][RNHBEAKCPrnhbeakcpd1-9\+\-\.][\+\-\.][1-9]/g,

		// 自动识别棋谱格式正则表达式
		QQNew	: /(?:[0-9]+) 32 (?:[0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) 0 (?:[0-9]+) 0/g,
		ShiJia	: /Moves(.*)Ends(.*)CommentsEnd/g,

		// 特殊兵东萍表示法
		Pawn	: /[\+\-2][1-9][\+\-\.][1-9]/
	};
};

// Fen 串改变走棋方
vschess.fenChangePlayer = function(fen){
	var fenSplit = fen.split(" ");
	fenSplit[1]  = fenSplit[1] === "b" ? "w" : "b";
	return fenSplit.join(" ");
};

// Fen 串转换为局面
vschess.fenToSituation = function(fen){
	var fenSplit  = fen.split(" ");
	var situation = vschess.situation.slice(0);
	var currentPiece = 0;
	var pieceEach = vschess.fenToArray(fen);
	situation[0] = fenSplit[1] === "b" ? 2 : 1;
	situation[1] = vschess.limit(fenSplit[5], 1, Infinity);

	for (var i = 51; i < 204; ++i) {
		situation[i] && (situation[i] = vschess.f2n[pieceEach[currentPiece++]]);
	}

	return situation;
};

// 局面转换为 Fen 串
vschess.situationToFen = function(situation){
	var fen = [];

	for (var i = 51; i < 204; ++i) {
		situation[i] && fen.push(vschess.n2f[situation[i]]);
	}

	fen = vschess.arrayToFen(fen);
	return fen + (situation[0] === 1 ? " w - - 0 " : " b - - 0 ") + situation[1];
};

// 翻转 FEN 串
vschess.turnFen = function(fen){
	var fenSplit = fen        .split(" ");
	var lines    = fenSplit[0].split("/");

	for (var i = 0; i < 10; ++i) {
		lines[i] = lines[i].split("").reverse().join("");
	}

	fenSplit[0] = lines.join("/");
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	return fenSplit.join(" ");
};

// 旋转 FEN 串
vschess.roundFen = function(fen){
	var fenSplit = fen        .split(" ");
	fenSplit[0]  = fenSplit[0].split("").reverse().join("");
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	return fenSplit.join(" ");
};

// 翻转节点 ICCS 着法
vschess.turnMove = function(move){
	move = move.split("");
	move[0] = vschess.fcc(202 - vschess.cca(move[0]));
	move[2] = vschess.fcc(202 - vschess.cca(move[2]));
	return move.join("");
};

// 旋转节点 ICCS 着法
vschess.roundMove = function(move){
	move = move.split("");
	move[0] = vschess.fcc(202 - vschess.cca(move[0]));
	move[2] = vschess.fcc(202 - vschess.cca(move[2]));
	move[1] = 9 - move[1];
	move[3] = 9 - move[3];
	return move.join("");
};

// 翻转 WXF 着法，不可用于特殊兵
vschess.turnWXF = function(oldMove){
	// isMBA: is Middle Before After
	var moveSplit = oldMove.split(""), isMBA = ~"+-.".indexOf(moveSplit[1]);

	// NBA: 不是你想象中的 NBA，而是马相仕（马象士）
	if (~"NBA".indexOf(moveSplit[0]) || moveSplit[2] === ".") {
		if (isMBA) {
			return oldMove.substring(0, 3) + (10 - moveSplit[3]);
		}

		return moveSplit[0] + (10 - moveSplit[1]) + moveSplit[2] + (10 - moveSplit[3]);
	}

	if (isMBA) {
		return oldMove;
	}

	return moveSplit[0] + (10 - moveSplit[1]) + oldMove.substring(2, 4);
};

// 统计局面中棋子数量
vschess.countPieceLength = function(situation){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));

	for (var i = 51, count = 0; i < 204; ++i) {
		situation[i] > 1 && ++count;
	}

	return count;
};

// 根据前后 Fen 串计算着法
vschess.compareFen = function(fromFen, toFen, format){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fromFen) || (fromFen = vschess.defaultFen);
	RegExp.FenShort.test(  toFen) || (  toFen = vschess.defaultFen);

	var from = 0, to = 0;

	var fromSituation = vschess.fenToSituation(fromFen);
	var   toSituation = vschess.fenToSituation(  toFen);

	for (var i = 51; i < 204; ++i) {
		if (fromSituation[i] !== toSituation[i]) {
			if (fromSituation[i] > 1 && toSituation[i] === 1) {
				from = i;
			}
			else {
				to = i;
			}
		}
	}

	if (from && to) {
		var move = vschess.s2i[from] + vschess.s2i[to];

		switch (format) {
			case "iccs": return vschess.Node2ICCS_NoFen(move);
			case "wxf" : return vschess.Node2WXF    (move, fromFen).move;
			default    : return vschess.Node2Chinese(move, fromFen).move;
		}
	}

	switch (format) {
		case "iccs": return "none";
		case "wxf" : return "None";
		default    : return "\u65e0\u6548\u7740\u6cd5";
	}
};

// 获取棋局信息显示文本
vschess.showText = function(showText, item){
	switch (item) {
		case "result": {
			switch (showText) {
				case "*"		: return "";
				case "1-0"		: return "\u7ea2\u80dc";
				case "0-1"		: return "\u9ed1\u80dc";
				case "1/2-1/2"	: return "\u548c\u68cb";
			}

			break;
		}
	}

	return showText;
};

// 获取棋局信息数据文本
vschess.dataText = function(dataText, item){
	switch (item) {
		case "result": {
			switch (dataText) {
				case "\u7ea2\u80dc": case "1-0"    : return "1-0"    ;
				case "\u9ed1\u80dc": case "0-1"    : return "0-1"    ;
				case "\u548c\u68cb": case "1/2-1/2": return "1/2-1/2";
				default    :                 return "*"      ;
			}

			break;
		}
	}

	return dataText;
};

// PGN 字段驼峰化
vschess.fieldNameToCamel = function(fieldName){
	var key = fieldName || "";
	var keySplit = key.split("");

	if (key.length > 3 && key.substring(0, 3) == "red") {
		keySplit[0] = "R";
		keySplit[3] = keySplit[3].toUpperCase();
	}
	else if (key.length > 5 && key.substring(0, 5) == "black") {
		keySplit[0] = "B";
		keySplit[5] = keySplit[5].toUpperCase();
	}
	else {
		keySplit[0] = keySplit[0].toUpperCase();
	}

	return keySplit.join("");
};

// GUID 生成器
vschess.guid = function(){
	var guid = "";

	for (var i = 0; i < 32; ++i) {
		guid += Math.floor(Math.random() * 16).toString(16);
		~[7, 11, 15, 19].indexOf(i) && (guid += "-");
	}

	return guid;
};

// String.fromCharCode 别名
vschess.fcc = function(code){
	return String.fromCharCode(code);
};

// String.charCodeAt 别名
vschess.cca = function(word){
	return word.charCodeAt(0);
};

// 左右填充
vschess.strpad = function(str, length, pad, direction){
	str = str || "" ; str += "";
	pad = pad || " "; pad += "";
	length = vschess.limit(length, 0, Infinity, 0);

	if (length > str.length) {
		if (direction === "left" || direction === "l") {
			return new Array(length - str.length + 1).join(pad) + str;
		}
		else if (direction === "right" || direction === "r") {
			return str + new Array(length - str.length + 1).join(pad);
		}
		else {
			return new Array(Math.floor((length - str.length) / 2) + 1).join(pad) + str + new Array(Math.ceil((length - str.length) / 2) + 1).join(pad);
		}
	}
	else {
		return str;
	}
};

// 判断字符串是否为数字
vschess.isNumber = function(str){
	return !isNaN(+str);
};

// 拆分 Fen 串
vschess.fenToArray = function(fen){
	return fen.split(" ")[0]
		.replace(/H/g, "N")
		.replace(/E/g, "B")
		.replace(/h/g, "n")
		.replace(/e/g, "b")
		.replace(/1/g, "*")
		.replace(/2/g, "**")
		.replace(/3/g, "***")
		.replace(/4/g, "****")
		.replace(/5/g, "*****")
		.replace(/6/g, "******")
		.replace(/7/g, "*******")
		.replace(/8/g, "********")
		.replace(/9/g, "*********")
		.replace(/\//g,"").split("");
};

// 合并 Fen 串
vschess.arrayToFen = function(array){
	var tempArr = [];

	for (var i = 0; i < 90; ++i) {
		tempArr.push(array[i]);
		i % 9 === 8 && i < 89 && tempArr.push("/");
	}

	return tempArr.join("")
		.replace(/\*\*\*\*\*\*\*\*\*/g, "9")
		.replace(/\*\*\*\*\*\*\*\*/g, "8")
		.replace(/\*\*\*\*\*\*\*/g, "7")
		.replace(/\*\*\*\*\*\*/g, "6")
		.replace(/\*\*\*\*\*/g, "5")
		.replace(/\*\*\*\*/g, "4")
		.replace(/\*\*\*/g, "3")
		.replace(/\*\*/g, "2")
		.replace(/\*/g, "1");
};

// 取得指定弧度值旋转 CSS 样式
vschess.degToRotateCSS = function(deg){
	if (window.ActiveXObject) {
		var css = "filter:progid:DXImageTransform.Microsoft.Matrix(SizingMethod=sMethod,M11=#M11,M12=#M12,M21=#M21,M22=#M22)";
		var rad =  Math.PI * deg / 180;
		var M11 =  Math.cos(deg);
		var M12 = -Math.sin(deg);
		var M21 =  Math.sin(deg);
		var M22 =  Math.cos(deg);
		return css.replace("#M11", M11).replace("#M12", M12).replace("#M21", M21).replace("#M22", M22);
	}
	else {
		var css = "";
		css +=         "transform:rotate(" + deg + "deg);";
		css +=      "-o-transform:rotate(" + deg + "deg);";
		css +=     "-ms-transform:rotate(" + deg + "deg);";
		css +=    "-moz-transform:rotate(" + deg + "deg);";
		css += "-webkit-transform:rotate(" + deg + "deg);";
		return css;
	}
};

// GBK 转 UTF-8
vschess.GBK2UTF8 = function(array){
	var charset = [19970,19972,19973,19974,19983,19986,19991,19999,20000,20001,20003,20006,20009,20014,20015,20017,20019,20021,20023,20028,20032,20033,20034,20036,20038,20042,20049,20053,20055,20058,20059,20066,20067,20068,20069,20071,20072,20074,20075,20076,20077,20078,20079,20082,20084,20085,20086,20087,20088,20089,20090,20091,20092,20093,20095,20096,20097,20098,20099,20100,20101,20103,20106,0,20112,20118,20119,20121,20124,20125,20126,20131,20138,20143,20144,20145,20148,20150,20151,20152,20153,20156,20157,20158,20168,20172,20175,20176,20178,20186,20187,20188,20192,20194,20198,20199,20201,20205,20206,20207,20209,20212,20216,20217,20218,20220,20222,20224,20226,20227,20228,20229,20230,20231,20232,20235,20236,20242,20243,20244,20245,20246,20252,20253,20257,20259,20264,20265,20268,20269,20270,20273,20275,20277,20279,20281,20283,20286,20287,20288,20289,20290,20292,20293,20295,20296,20297,20298,20299,20300,20306,20308,20310,20321,20322,20326,20328,20330,20331,20333,20334,20337,20338,20341,20343,20344,20345,20346,20349,20352,20353,20354,20357,20358,20359,20362,20364,20366,20368,20370,20371,20373,20374,20376,20377,20378,20380,20382,20383,20385,20386,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20388,20395,20397,20400,20401,20402,20403,20404,20406,20407,20408,20409,20410,20411,20412,20413,20414,20416,20417,20418,20422,20423,20424,20425,20427,20428,20429,20434,20435,20436,20437,20438,20441,20443,20448,20450,20452,20453,20455,20459,20460,20464,20466,20468,20469,20470,20471,20473,20475,20476,20477,20479,20480,20481,20482,20483,20484,20485,20486,20487,20488,20489,20490,0,20491,20494,20496,20497,20499,20501,20502,20503,20507,20509,20510,20512,20514,20515,20516,20519,20523,20527,20528,20529,20530,20531,20532,20533,20534,20535,20536,20537,20539,20541,20543,20544,20545,20546,20548,20549,20550,20553,20554,20555,20557,20560,20561,20562,20563,20564,20566,20567,20568,20569,20571,20573,20574,20575,20576,20577,20578,20579,20580,20582,20583,20584,20585,20586,20587,20589,20590,20591,20592,20593,20594,20595,20596,20597,20600,20601,20602,20604,20605,20609,20610,20611,20612,20614,20615,20617,20618,20619,20620,20622,20623,20624,20625,20626,20627,20628,20629,20630,20631,20632,20633,20634,20635,20636,20637,20638,20639,20640,20641,20642,20644,20646,20650,20651,20653,20654,20655,20656,20657,20659,20660,20661,20662,20663,20664,20665,20668,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20669,20670,20671,20672,20673,20674,20675,20676,20677,20678,20679,20680,20681,20682,20683,20684,20685,20686,20688,20689,20690,20691,20692,20693,20695,20696,20697,20699,20700,20701,20702,20703,20704,20705,20706,20707,20708,20709,20712,20713,20714,20715,20719,20720,20721,20722,20724,20726,20727,20728,20729,20730,20732,20733,20734,20735,20736,20737,20738,20739,20740,20741,20744,0,20745,20746,20748,20749,20750,20751,20752,20753,20755,20756,20757,20758,20759,20760,20761,20762,20763,20764,20765,20766,20767,20768,20770,20771,20772,20773,20774,20775,20776,20777,20778,20779,20780,20781,20782,20783,20784,20785,20786,20787,20788,20789,20790,20791,20792,20793,20794,20795,20796,20797,20798,20802,20807,20810,20812,20814,20815,20816,20818,20819,20823,20824,20825,20827,20829,20830,20831,20832,20833,20835,20836,20838,20839,20841,20842,20847,20850,20858,20862,20863,20867,20868,20870,20871,20874,20875,20878,20879,20880,20881,20883,20884,20888,20890,20893,20894,20895,20897,20899,20902,20903,20904,20905,20906,20909,20910,20916,20920,20921,20922,20926,20927,20929,20930,20931,20933,20936,20938,20941,20942,20944,20946,20947,20948,20949,20950,20951,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20952,20953,20954,20956,20958,20959,20962,20963,20965,20966,20967,20968,20969,20970,20972,20974,20977,20978,20980,20983,20990,20996,20997,21001,21003,21004,21007,21008,21011,21012,21013,21020,21022,21023,21025,21026,21027,21029,21030,21031,21034,21036,21039,21041,21042,21044,21045,21052,21054,21060,21061,21062,21063,21064,21065,21067,21070,21071,21074,21075,21077,21079,21080,0,21081,21082,21083,21085,21087,21088,21090,21091,21092,21094,21096,21099,21100,21101,21102,21104,21105,21107,21108,21109,21110,21111,21112,21113,21114,21115,21116,21118,21120,21123,21124,21125,21126,21127,21129,21130,21131,21132,21133,21134,21135,21137,21138,21140,21141,21142,21143,21144,21145,21146,21148,21156,21157,21158,21159,21166,21167,21168,21172,21173,21174,21175,21176,21177,21178,21179,21180,21181,21184,21185,21186,21188,21189,21190,21192,21194,21196,21197,21198,21199,21201,21203,21204,21205,21207,21209,21210,21211,21212,21213,21214,21216,21217,21218,21219,21221,21222,21223,21224,21225,21226,21227,21228,21229,21230,21231,21233,21234,21235,21236,21237,21238,21239,21240,21243,21244,21245,21249,21250,21251,21252,21255,21257,21258,21259,21260,21262,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21265,21266,21267,21268,21272,21275,21276,21278,21279,21282,21284,21285,21287,21288,21289,21291,21292,21293,21295,21296,21297,21298,21299,21300,21301,21302,21303,21304,21308,21309,21312,21314,21316,21318,21323,21324,21325,21328,21332,21336,21337,21339,21341,21349,21352,21354,21356,21357,21362,21366,21369,21371,21372,21373,21374,21376,21377,21379,21383,21384,21386,21390,21391,0,21392,21393,21394,21395,21396,21398,21399,21401,21403,21404,21406,21408,21409,21412,21415,21418,21419,21420,21421,21423,21424,21425,21426,21427,21428,21429,21431,21432,21433,21434,21436,21437,21438,21440,21443,21444,21445,21446,21447,21454,21455,21456,21458,21459,21461,21466,21468,21469,21470,21473,21474,21479,21492,21498,21502,21503,21504,21506,21509,21511,21515,21524,21528,21529,21530,21532,21538,21540,21541,21546,21552,21555,21558,21559,21562,21565,21567,21569,21570,21572,21573,21575,21577,21580,21581,21582,21583,21585,21594,21597,21598,21599,21600,21601,21603,21605,21607,21609,21610,21611,21612,21613,21614,21615,21616,21620,21625,21626,21630,21631,21633,21635,21637,21639,21640,21641,21642,21645,21649,21651,21655,21656,21660,21662,21663,21664,21665,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21666,21669,21678,21680,21682,21685,21686,21687,21689,21690,21692,21694,21699,21701,21706,21707,21718,21720,21723,21728,21729,21730,21731,21732,21739,21740,21743,21744,21745,21748,21749,21750,21751,21752,21753,21755,21758,21760,21762,21763,21764,21765,21768,21770,21771,21772,21773,21774,21778,21779,21781,21782,21783,21784,21785,21786,21788,21789,21790,21791,21793,21797,21798,0,21800,21801,21803,21805,21810,21812,21813,21814,21816,21817,21818,21819,21821,21824,21826,21829,21831,21832,21835,21836,21837,21838,21839,21841,21842,21843,21844,21847,21848,21849,21850,21851,21853,21854,21855,21856,21858,21859,21864,21865,21867,21871,21872,21873,21874,21875,21876,21881,21882,21885,21887,21893,21894,21900,21901,21902,21904,21906,21907,21909,21910,21911,21914,21915,21918,21920,21921,21922,21923,21924,21925,21926,21928,21929,21930,21931,21932,21933,21934,21935,21936,21938,21940,21942,21944,21946,21948,21951,21952,21953,21954,21955,21958,21959,21960,21962,21963,21966,21967,21968,21973,21975,21976,21977,21978,21979,21982,21984,21986,21991,21993,21997,21998,22000,22001,22004,22006,22008,22009,22010,22011,22012,22015,22018,22019,22020,22021,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22022,22023,22026,22027,22029,22032,22033,22034,22035,22036,22037,22038,22039,22041,22042,22044,22045,22048,22049,22050,22053,22054,22056,22057,22058,22059,22062,22063,22064,22067,22069,22071,22072,22074,22076,22077,22078,22080,22081,22082,22083,22084,22085,22086,22087,22088,22089,22090,22091,22095,22096,22097,22098,22099,22101,22102,22106,22107,22109,22110,22111,22112,22113,0,22115,22117,22118,22119,22125,22126,22127,22128,22130,22131,22132,22133,22135,22136,22137,22138,22141,22142,22143,22144,22145,22146,22147,22148,22151,22152,22153,22154,22155,22156,22157,22160,22161,22162,22164,22165,22166,22167,22168,22169,22170,22171,22172,22173,22174,22175,22176,22177,22178,22180,22181,22182,22183,22184,22185,22186,22187,22188,22189,22190,22192,22193,22194,22195,22196,22197,22198,22200,22201,22202,22203,22205,22206,22207,22208,22209,22210,22211,22212,22213,22214,22215,22216,22217,22219,22220,22221,22222,22223,22224,22225,22226,22227,22229,22230,22232,22233,22236,22243,22245,22246,22247,22248,22249,22250,22252,22254,22255,22258,22259,22262,22263,22264,22267,22268,22272,22273,22274,22277,22279,22283,22284,22285,22286,22287,22288,22289,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22290,22291,22292,22293,22294,22295,22296,22297,22298,22299,22301,22302,22304,22305,22306,22308,22309,22310,22311,22315,22321,22322,22324,22325,22326,22327,22328,22332,22333,22335,22337,22339,22340,22341,22342,22344,22345,22347,22354,22355,22356,22357,22358,22360,22361,22370,22371,22373,22375,22380,22382,22384,22385,22386,22388,22389,22392,22393,22394,22397,22398,22399,22400,0,22401,22407,22408,22409,22410,22413,22414,22415,22416,22417,22420,22421,22422,22423,22424,22425,22426,22428,22429,22430,22431,22437,22440,22442,22444,22447,22448,22449,22451,22453,22454,22455,22457,22458,22459,22460,22461,22462,22463,22464,22465,22468,22469,22470,22471,22472,22473,22474,22476,22477,22480,22481,22483,22486,22487,22491,22492,22494,22497,22498,22499,22501,22502,22503,22504,22505,22506,22507,22508,22510,22512,22513,22514,22515,22517,22518,22519,22523,22524,22526,22527,22529,22531,22532,22533,22536,22537,22538,22540,22542,22543,22544,22546,22547,22548,22550,22551,22552,22554,22555,22556,22557,22559,22562,22563,22565,22566,22567,22568,22569,22571,22572,22573,22574,22575,22577,22578,22579,22580,22582,22583,22584,22585,22586,22587,22588,22589,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22590,22591,22592,22593,22594,22595,22597,22598,22599,22600,22601,22602,22603,22606,22607,22608,22610,22611,22613,22614,22615,22617,22618,22619,22620,22621,22623,22624,22625,22626,22627,22628,22630,22631,22632,22633,22634,22637,22638,22639,22640,22641,22642,22643,22644,22645,22646,22647,22648,22649,22650,22651,22652,22653,22655,22658,22660,22662,22663,22664,22666,22667,22668,0,22669,22670,22671,22672,22673,22676,22677,22678,22679,22680,22683,22684,22685,22688,22689,22690,22691,22692,22693,22694,22695,22698,22699,22700,22701,22702,22703,22704,22705,22706,22707,22708,22709,22710,22711,22712,22713,22714,22715,22717,22718,22719,22720,22722,22723,22724,22726,22727,22728,22729,22730,22731,22732,22733,22734,22735,22736,22738,22739,22740,22742,22743,22744,22745,22746,22747,22748,22749,22750,22751,22752,22753,22754,22755,22757,22758,22759,22760,22761,22762,22765,22767,22769,22770,22772,22773,22775,22776,22778,22779,22780,22781,22782,22783,22784,22785,22787,22789,22790,22792,22793,22794,22795,22796,22798,22800,22801,22802,22803,22807,22808,22811,22813,22814,22816,22817,22818,22819,22822,22824,22828,22832,22834,22835,22837,22838,22843,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22845,22846,22847,22848,22851,22853,22854,22858,22860,22861,22864,22866,22867,22873,22875,22876,22877,22878,22879,22881,22883,22884,22886,22887,22888,22889,22890,22891,22892,22893,22894,22895,22896,22897,22898,22901,22903,22906,22907,22908,22910,22911,22912,22917,22921,22923,22924,22926,22927,22928,22929,22932,22933,22936,22938,22939,22940,22941,22943,22944,22945,22946,22950,0,22951,22956,22957,22960,22961,22963,22964,22965,22966,22967,22968,22970,22972,22973,22975,22976,22977,22978,22979,22980,22981,22983,22984,22985,22988,22989,22990,22991,22997,22998,23001,23003,23006,23007,23008,23009,23010,23012,23014,23015,23017,23018,23019,23021,23022,23023,23024,23025,23026,23027,23028,23029,23030,23031,23032,23034,23036,23037,23038,23040,23042,23050,23051,23053,23054,23055,23056,23058,23060,23061,23062,23063,23065,23066,23067,23069,23070,23073,23074,23076,23078,23079,23080,23082,23083,23084,23085,23086,23087,23088,23091,23093,23095,23096,23097,23098,23099,23101,23102,23103,23105,23106,23107,23108,23109,23111,23112,23115,23116,23117,23118,23119,23120,23121,23122,23123,23124,23126,23127,23128,23129,23131,23132,23133,23134,23135,23136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23137,23139,23140,23141,23142,23144,23145,23147,23148,23149,23150,23151,23152,23153,23154,23155,23160,23161,23163,23164,23165,23166,23168,23169,23170,23171,23172,23173,23174,23175,23176,23177,23178,23179,23180,23181,23182,23183,23184,23185,23187,23188,23189,23190,23191,23192,23193,23196,23197,23198,23199,23200,23201,23202,23203,23204,23205,23206,23207,23208,23209,23211,23212,0,23213,23214,23215,23216,23217,23220,23222,23223,23225,23226,23227,23228,23229,23231,23232,23235,23236,23237,23238,23239,23240,23242,23243,23245,23246,23247,23248,23249,23251,23253,23255,23257,23258,23259,23261,23262,23263,23266,23268,23269,23271,23272,23274,23276,23277,23278,23279,23280,23282,23283,23284,23285,23286,23287,23288,23289,23290,23291,23292,23293,23294,23295,23296,23297,23298,23299,23300,23301,23302,23303,23304,23306,23307,23308,23309,23310,23311,23312,23313,23314,23315,23316,23317,23320,23321,23322,23323,23324,23325,23326,23327,23328,23329,23330,23331,23332,23333,23334,23335,23336,23337,23338,23339,23340,23341,23342,23343,23344,23345,23347,23349,23350,23352,23353,23354,23355,23356,23357,23358,23359,23361,23362,23363,23364,23365,23366,23367,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23368,23369,23370,23371,23372,23373,23374,23375,23378,23382,23390,23392,23393,23399,23400,23403,23405,23406,23407,23410,23412,23414,23415,23416,23417,23419,23420,23422,23423,23426,23430,23434,23437,23438,23440,23441,23442,23444,23446,23455,23463,23464,23465,23468,23469,23470,23471,23473,23474,23479,23482,23483,23484,23488,23489,23491,23496,23497,23498,23499,23501,23502,23503,0,23505,23508,23509,23510,23511,23512,23513,23514,23515,23516,23520,23522,23523,23526,23527,23529,23530,23531,23532,23533,23535,23537,23538,23539,23540,23541,23542,23543,23549,23550,23552,23554,23555,23557,23559,23560,23563,23564,23565,23566,23568,23570,23571,23575,23577,23579,23582,23583,23584,23585,23587,23590,23592,23593,23594,23595,23597,23598,23599,23600,23602,23603,23605,23606,23607,23619,23620,23622,23623,23628,23629,23634,23635,23636,23638,23639,23640,23642,23643,23644,23645,23647,23650,23652,23655,23656,23657,23658,23659,23660,23661,23664,23666,23667,23668,23669,23670,23671,23672,23675,23676,23677,23678,23680,23683,23684,23685,23686,23687,23689,23690,23691,23694,23695,23698,23699,23701,23709,23710,23711,23712,23713,23716,23717,23718,23719,23720,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23722,23726,23727,23728,23730,23732,23734,23737,23738,23739,23740,23742,23744,23746,23747,23749,23750,23751,23752,23753,23754,23756,23757,23758,23759,23760,23761,23763,23764,23765,23766,23767,23768,23770,23771,23772,23773,23774,23775,23776,23778,23779,23783,23785,23787,23788,23790,23791,23793,23794,23795,23796,23797,23798,23799,23800,23801,23802,23804,23805,23806,23807,23808,0,23809,23812,23813,23816,23817,23818,23819,23820,23821,23823,23824,23825,23826,23827,23829,23831,23832,23833,23834,23836,23837,23839,23840,23841,23842,23843,23845,23848,23850,23851,23852,23855,23856,23857,23858,23859,23861,23862,23863,23864,23865,23866,23867,23868,23871,23872,23873,23874,23875,23876,23877,23878,23880,23881,23885,23886,23887,23888,23889,23890,23891,23892,23893,23894,23895,23897,23898,23900,23902,23903,23904,23905,23906,23907,23908,23909,23910,23911,23912,23914,23917,23918,23920,23921,23922,23923,23925,23926,23927,23928,23929,23930,23931,23932,23933,23934,23935,23936,23937,23939,23940,23941,23942,23943,23944,23945,23946,23947,23948,23949,23950,23951,23952,23953,23954,23955,23956,23957,23958,23959,23960,23962,23963,23964,23966,23967,23968,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23969,23970,23971,23972,23973,23974,23975,23976,23977,23978,23979,23980,23981,23982,23983,23984,23985,23986,23987,23988,23989,23990,23992,23993,23994,23995,23996,23997,23998,23999,24000,24001,24002,24003,24004,24006,24007,24008,24009,24010,24011,24012,24014,24015,24016,24017,24018,24019,24020,24021,24022,24023,24024,24025,24026,24028,24031,24032,24035,24036,24042,24044,24045,0,24048,24053,24054,24056,24057,24058,24059,24060,24063,24064,24068,24071,24073,24074,24075,24077,24078,24082,24083,24087,24094,24095,24096,24097,24098,24099,24100,24101,24104,24105,24106,24107,24108,24111,24112,24114,24115,24116,24117,24118,24121,24122,24126,24127,24128,24129,24131,24134,24135,24136,24137,24138,24139,24141,24142,24143,24144,24145,24146,24147,24150,24151,24152,24153,24154,24156,24157,24159,24160,24163,24164,24165,24166,24167,24168,24169,24170,24171,24172,24173,24174,24175,24176,24177,24181,24183,24185,24190,24193,24194,24195,24197,24200,24201,24204,24205,24206,24210,24216,24219,24221,24225,24226,24227,24228,24232,24233,24234,24235,24236,24238,24239,24240,24241,24242,24244,24250,24251,24252,24253,24255,24256,24257,24258,24259,24260,24261,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24262,24263,24264,24267,24268,24269,24270,24271,24272,24276,24277,24279,24280,24281,24282,24284,24285,24286,24287,24288,24289,24290,24291,24292,24293,24294,24295,24297,24299,24300,24301,24302,24303,24304,24305,24306,24307,24309,24312,24313,24315,24316,24317,24325,24326,24327,24329,24332,24333,24334,24336,24338,24340,24342,24345,24346,24348,24349,24350,24353,24354,24355,24356,0,24360,24363,24364,24366,24368,24370,24371,24372,24373,24374,24375,24376,24379,24381,24382,24383,24385,24386,24387,24388,24389,24390,24391,24392,24393,24394,24395,24396,24397,24398,24399,24401,24404,24409,24410,24411,24412,24414,24415,24416,24419,24421,24423,24424,24427,24430,24431,24434,24436,24437,24438,24440,24442,24445,24446,24447,24451,24454,24461,24462,24463,24465,24467,24468,24470,24474,24475,24477,24478,24479,24480,24482,24483,24484,24485,24486,24487,24489,24491,24492,24495,24496,24497,24498,24499,24500,24502,24504,24505,24506,24507,24510,24511,24512,24513,24514,24519,24520,24522,24523,24526,24531,24532,24533,24538,24539,24540,24542,24543,24546,24547,24549,24550,24552,24553,24556,24559,24560,24562,24563,24564,24566,24567,24569,24570,24572,24583,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24584,24585,24587,24588,24592,24593,24595,24599,24600,24602,24606,24607,24610,24611,24612,24620,24621,24622,24624,24625,24626,24627,24628,24630,24631,24632,24633,24634,24637,24638,24640,24644,24645,24646,24647,24648,24649,24650,24652,24654,24655,24657,24659,24660,24662,24663,24664,24667,24668,24670,24671,24672,24673,24677,24678,24686,24689,24690,24692,24693,24695,24702,24704,0,24705,24706,24709,24710,24711,24712,24714,24715,24718,24719,24720,24721,24723,24725,24727,24728,24729,24732,24734,24737,24738,24740,24741,24743,24745,24746,24750,24752,24755,24757,24758,24759,24761,24762,24765,24766,24767,24768,24769,24770,24771,24772,24775,24776,24777,24780,24781,24782,24783,24784,24786,24787,24788,24790,24791,24793,24795,24798,24801,24802,24803,24804,24805,24810,24817,24818,24821,24823,24824,24827,24828,24829,24830,24831,24834,24835,24836,24837,24839,24842,24843,24844,24848,24849,24850,24851,24852,24854,24855,24856,24857,24859,24860,24861,24862,24865,24866,24869,24872,24873,24874,24876,24877,24878,24879,24880,24881,24882,24883,24884,24885,24886,24887,24888,24889,24890,24891,24892,24893,24894,24896,24897,24898,24899,24900,24901,24902,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24903,24905,24907,24909,24911,24912,24914,24915,24916,24918,24919,24920,24921,24922,24923,24924,24926,24927,24928,24929,24931,24932,24933,24934,24937,24938,24939,24940,24941,24942,24943,24945,24946,24947,24948,24950,24952,24953,24954,24955,24956,24957,24958,24959,24960,24961,24962,24963,24964,24965,24966,24967,24968,24969,24970,24972,24973,24975,24976,24977,24978,24979,24981,0,24982,24983,24984,24985,24986,24987,24988,24990,24991,24992,24993,24994,24995,24996,24997,24998,25002,25003,25005,25006,25007,25008,25009,25010,25011,25012,25013,25014,25016,25017,25018,25019,25020,25021,25023,25024,25025,25027,25028,25029,25030,25031,25033,25036,25037,25038,25039,25040,25043,25045,25046,25047,25048,25049,25050,25051,25052,25053,25054,25055,25056,25057,25058,25059,25060,25061,25063,25064,25065,25066,25067,25068,25069,25070,25071,25072,25073,25074,25075,25076,25078,25079,25080,25081,25082,25083,25084,25085,25086,25088,25089,25090,25091,25092,25093,25095,25097,25107,25108,25113,25116,25117,25118,25120,25123,25126,25127,25128,25129,25131,25133,25135,25136,25137,25138,25141,25142,25144,25145,25146,25147,25148,25154,25156,25157,25158,25162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25167,25168,25173,25174,25175,25177,25178,25180,25181,25182,25183,25184,25185,25186,25188,25189,25192,25201,25202,25204,25205,25207,25208,25210,25211,25213,25217,25218,25219,25221,25222,25223,25224,25227,25228,25229,25230,25231,25232,25236,25241,25244,25245,25246,25251,25254,25255,25257,25258,25261,25262,25263,25264,25266,25267,25268,25270,25271,25272,25274,25278,25280,25281,0,25283,25291,25295,25297,25301,25309,25310,25312,25313,25316,25322,25323,25328,25330,25333,25336,25337,25338,25339,25344,25347,25348,25349,25350,25354,25355,25356,25357,25359,25360,25362,25363,25364,25365,25367,25368,25369,25372,25382,25383,25385,25388,25389,25390,25392,25393,25395,25396,25397,25398,25399,25400,25403,25404,25406,25407,25408,25409,25412,25415,25416,25418,25425,25426,25427,25428,25430,25431,25432,25433,25434,25435,25436,25437,25440,25444,25445,25446,25448,25450,25451,25452,25455,25456,25458,25459,25460,25461,25464,25465,25468,25469,25470,25471,25473,25475,25476,25477,25478,25483,25485,25489,25491,25492,25493,25495,25497,25498,25499,25500,25501,25502,25503,25505,25508,25510,25515,25519,25521,25522,25525,25526,25529,25531,25533,25535,25536,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25537,25538,25539,25541,25543,25544,25546,25547,25548,25553,25555,25556,25557,25559,25560,25561,25562,25563,25564,25565,25567,25570,25572,25573,25574,25575,25576,25579,25580,25582,25583,25584,25585,25587,25589,25591,25593,25594,25595,25596,25598,25603,25604,25606,25607,25608,25609,25610,25613,25614,25617,25618,25621,25622,25623,25624,25625,25626,25629,25631,25634,25635,25636,0,25637,25639,25640,25641,25643,25646,25647,25648,25649,25650,25651,25653,25654,25655,25656,25657,25659,25660,25662,25664,25666,25667,25673,25675,25676,25677,25678,25679,25680,25681,25683,25685,25686,25687,25689,25690,25691,25692,25693,25695,25696,25697,25698,25699,25700,25701,25702,25704,25706,25707,25708,25710,25711,25712,25713,25714,25715,25716,25717,25718,25719,25723,25724,25725,25726,25727,25728,25729,25731,25734,25736,25737,25738,25739,25740,25741,25742,25743,25744,25747,25748,25751,25752,25754,25755,25756,25757,25759,25760,25761,25762,25763,25765,25766,25767,25768,25770,25771,25775,25777,25778,25779,25780,25782,25785,25787,25789,25790,25791,25793,25795,25796,25798,25799,25800,25801,25802,25803,25804,25807,25809,25811,25812,25813,25814,25817,25818,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25819,25820,25821,25823,25824,25825,25827,25829,25831,25832,25833,25834,25835,25836,25837,25838,25839,25840,25841,25842,25843,25844,25845,25846,25847,25848,25849,25850,25851,25852,25853,25854,25855,25857,25858,25859,25860,25861,25862,25863,25864,25866,25867,25868,25869,25870,25871,25872,25873,25875,25876,25877,25878,25879,25881,25882,25883,25884,25885,25886,25887,25888,25889,0,25890,25891,25892,25894,25895,25896,25897,25898,25900,25901,25904,25905,25906,25907,25911,25914,25916,25917,25920,25921,25922,25923,25924,25926,25927,25930,25931,25933,25934,25936,25938,25939,25940,25943,25944,25946,25948,25951,25952,25953,25956,25957,25959,25960,25961,25962,25965,25966,25967,25969,25971,25973,25974,25976,25977,25978,25979,25980,25981,25982,25983,25984,25985,25986,25987,25988,25989,25990,25992,25993,25994,25997,25998,25999,26002,26004,26005,26006,26008,26010,26013,26014,26016,26018,26019,26022,26024,26026,26028,26030,26033,26034,26035,26036,26037,26038,26039,26040,26042,26043,26046,26047,26048,26050,26055,26056,26057,26058,26061,26064,26065,26067,26068,26069,26072,26073,26074,26075,26076,26077,26078,26079,26081,26083,26084,26090,26091,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26098,26099,26100,26101,26104,26105,26107,26108,26109,26110,26111,26113,26116,26117,26119,26120,26121,26123,26125,26128,26129,26130,26134,26135,26136,26138,26139,26140,26142,26145,26146,26147,26148,26150,26153,26154,26155,26156,26158,26160,26162,26163,26167,26168,26169,26170,26171,26173,26175,26176,26178,26180,26181,26182,26183,26184,26185,26186,26189,26190,26192,26193,26200,0,26201,26203,26204,26205,26206,26208,26210,26211,26213,26215,26217,26218,26219,26220,26221,26225,26226,26227,26229,26232,26233,26235,26236,26237,26239,26240,26241,26243,26245,26246,26248,26249,26250,26251,26253,26254,26255,26256,26258,26259,26260,26261,26264,26265,26266,26267,26268,26270,26271,26272,26273,26274,26275,26276,26277,26278,26281,26282,26283,26284,26285,26287,26288,26289,26290,26291,26293,26294,26295,26296,26298,26299,26300,26301,26303,26304,26305,26306,26307,26308,26309,26310,26311,26312,26313,26314,26315,26316,26317,26318,26319,26320,26321,26322,26323,26324,26325,26326,26327,26328,26330,26334,26335,26336,26337,26338,26339,26340,26341,26343,26344,26346,26347,26348,26349,26350,26351,26353,26357,26358,26360,26362,26363,26365,26369,26370,26371,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26372,26373,26374,26375,26380,26382,26383,26385,26386,26387,26390,26392,26393,26394,26396,26398,26400,26401,26402,26403,26404,26405,26407,26409,26414,26416,26418,26419,26422,26423,26424,26425,26427,26428,26430,26431,26433,26436,26437,26439,26442,26443,26445,26450,26452,26453,26455,26456,26457,26458,26459,26461,26466,26467,26468,26470,26471,26475,26476,26478,26481,26484,26486,0,26488,26489,26490,26491,26493,26496,26498,26499,26501,26502,26504,26506,26508,26509,26510,26511,26513,26514,26515,26516,26518,26521,26523,26527,26528,26529,26532,26534,26537,26540,26542,26545,26546,26548,26553,26554,26555,26556,26557,26558,26559,26560,26562,26565,26566,26567,26568,26569,26570,26571,26572,26573,26574,26581,26582,26583,26587,26591,26593,26595,26596,26598,26599,26600,26602,26603,26605,26606,26610,26613,26614,26615,26616,26617,26618,26619,26620,26622,26625,26626,26627,26628,26630,26637,26640,26642,26644,26645,26648,26649,26650,26651,26652,26654,26655,26656,26658,26659,26660,26661,26662,26663,26664,26667,26668,26669,26670,26671,26672,26673,26676,26677,26678,26682,26683,26687,26695,26699,26701,26703,26706,26710,26711,26712,26713,26714,26715,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26716,26717,26718,26719,26730,26732,26733,26734,26735,26736,26737,26738,26739,26741,26744,26745,26746,26747,26748,26749,26750,26751,26752,26754,26756,26759,26760,26761,26762,26763,26764,26765,26766,26768,26769,26770,26772,26773,26774,26776,26777,26778,26779,26780,26781,26782,26783,26784,26785,26787,26788,26789,26793,26794,26795,26796,26798,26801,26802,26804,26806,26807,26808,0,26809,26810,26811,26812,26813,26814,26815,26817,26819,26820,26821,26822,26823,26824,26826,26828,26830,26831,26832,26833,26835,26836,26838,26839,26841,26843,26844,26845,26846,26847,26849,26850,26852,26853,26854,26855,26856,26857,26858,26859,26860,26861,26863,26866,26867,26868,26870,26871,26872,26875,26877,26878,26879,26880,26882,26883,26884,26886,26887,26888,26889,26890,26892,26895,26897,26899,26900,26901,26902,26903,26904,26905,26906,26907,26908,26909,26910,26913,26914,26915,26917,26918,26919,26920,26921,26922,26923,26924,26926,26927,26929,26930,26931,26933,26934,26935,26936,26938,26939,26940,26942,26944,26945,26947,26948,26949,26950,26951,26952,26953,26954,26955,26956,26957,26958,26959,26960,26961,26962,26963,26965,26966,26968,26969,26971,26972,26975,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26977,26978,26980,26981,26983,26984,26985,26986,26988,26989,26991,26992,26994,26995,26996,26997,26998,27002,27003,27005,27006,27007,27009,27011,27013,27018,27019,27020,27022,27023,27024,27025,27026,27027,27030,27031,27033,27034,27037,27038,27039,27040,27041,27042,27043,27044,27045,27046,27049,27050,27052,27054,27055,27056,27058,27059,27061,27062,27064,27065,27066,27068,27069,0,27070,27071,27072,27074,27075,27076,27077,27078,27079,27080,27081,27083,27085,27087,27089,27090,27091,27093,27094,27095,27096,27097,27098,27100,27101,27102,27105,27106,27107,27108,27109,27110,27111,27112,27113,27114,27115,27116,27118,27119,27120,27121,27123,27124,27125,27126,27127,27128,27129,27130,27131,27132,27134,27136,27137,27138,27139,27140,27141,27142,27143,27144,27145,27147,27148,27149,27150,27151,27152,27153,27154,27155,27156,27157,27158,27161,27162,27163,27164,27165,27166,27168,27170,27171,27172,27173,27174,27175,27177,27179,27180,27181,27182,27184,27186,27187,27188,27190,27191,27192,27193,27194,27195,27196,27199,27200,27201,27202,27203,27205,27206,27208,27209,27210,27211,27212,27213,27214,27215,27217,27218,27219,27220,27221,27222,27223,27226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27228,27229,27230,27231,27232,27234,27235,27236,27238,27239,27240,27241,27242,27243,27244,27245,27246,27247,27248,27250,27251,27252,27253,27254,27255,27256,27258,27259,27261,27262,27263,27265,27266,27267,27269,27270,27271,27272,27273,27274,27275,27276,27277,27279,27282,27283,27284,27285,27286,27288,27289,27290,27291,27292,27293,27294,27295,27297,27298,27299,27300,27301,27302,0,27303,27304,27306,27309,27310,27311,27312,27313,27314,27315,27316,27317,27318,27319,27320,27321,27322,27323,27324,27325,27326,27327,27328,27329,27330,27331,27332,27333,27334,27335,27336,27337,27338,27339,27340,27341,27342,27343,27344,27345,27346,27347,27348,27349,27350,27351,27352,27353,27354,27355,27356,27357,27358,27359,27360,27361,27362,27363,27364,27365,27366,27367,27368,27369,27370,27371,27372,27373,27374,27375,27376,27377,27378,27379,27380,27381,27382,27383,27384,27385,27386,27387,27388,27389,27390,27391,27392,27393,27394,27395,27396,27397,27398,27399,27400,27401,27402,27403,27404,27405,27406,27407,27408,27409,27410,27411,27412,27413,27414,27415,27416,27417,27418,27419,27420,27421,27422,27423,27429,27430,27432,27433,27434,27435,27436,27437,27438,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27439,27440,27441,27443,27444,27445,27446,27448,27451,27452,27453,27455,27456,27457,27458,27460,27461,27464,27466,27467,27469,27470,27471,27472,27473,27474,27475,27476,27477,27478,27479,27480,27482,27483,27484,27485,27486,27487,27488,27489,27496,27497,27499,27500,27501,27502,27503,27504,27505,27506,27507,27508,27509,27510,27511,27512,27514,27517,27518,27519,27520,27525,27528,0,27532,27534,27535,27536,27537,27540,27541,27543,27544,27545,27548,27549,27550,27551,27552,27554,27555,27556,27557,27558,27559,27560,27561,27563,27564,27565,27566,27567,27568,27569,27570,27574,27576,27577,27578,27579,27580,27581,27582,27584,27587,27588,27590,27591,27592,27593,27594,27596,27598,27600,27601,27608,27610,27612,27613,27614,27615,27616,27618,27619,27620,27621,27622,27623,27624,27625,27628,27629,27630,27632,27633,27634,27636,27638,27639,27640,27642,27643,27644,27646,27647,27648,27649,27650,27651,27652,27656,27657,27658,27659,27660,27662,27666,27671,27676,27677,27678,27680,27683,27685,27691,27692,27693,27697,27699,27702,27703,27705,27706,27707,27708,27710,27711,27715,27716,27717,27720,27723,27724,27725,27726,27727,27729,27730,27731,27734,27736,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27737,27738,27746,27747,27749,27750,27751,27755,27756,27757,27758,27759,27761,27763,27765,27767,27768,27770,27771,27772,27775,27776,27780,27783,27786,27787,27789,27790,27793,27794,27797,27798,27799,27800,27802,27804,27805,27806,27808,27810,27816,27820,27823,27824,27828,27829,27830,27831,27834,27840,27841,27842,27843,27846,27847,27848,27851,27853,27854,27855,27857,27858,27864,0,27865,27866,27868,27869,27871,27876,27878,27879,27881,27884,27885,27890,27892,27897,27903,27904,27906,27907,27909,27910,27912,27913,27914,27917,27919,27920,27921,27923,27924,27925,27926,27928,27932,27933,27935,27936,27937,27938,27939,27940,27942,27944,27945,27948,27949,27951,27952,27956,27958,27959,27960,27962,27967,27968,27970,27972,27977,27980,27984,27989,27990,27991,27992,27995,27997,27999,28001,28002,28004,28005,28007,28008,28011,28012,28013,28016,28017,28018,28019,28021,28022,28025,28026,28027,28029,28030,28031,28032,28033,28035,28036,28038,28039,28042,28043,28045,28047,28048,28050,28054,28055,28056,28057,28058,28060,28066,28069,28076,28077,28080,28081,28083,28084,28086,28087,28089,28090,28091,28092,28093,28094,28097,28098,28099,28104,28105,28106,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28109,28110,28111,28112,28114,28115,28116,28117,28119,28122,28123,28124,28127,28130,28131,28133,28135,28136,28137,28138,28141,28143,28144,28146,28148,28149,28150,28152,28154,28157,28158,28159,28160,28161,28162,28163,28164,28166,28167,28168,28169,28171,28175,28178,28179,28181,28184,28185,28187,28188,28190,28191,28194,28198,28199,28200,28202,28204,28206,28208,28209,28211,28213,0,28214,28215,28217,28219,28220,28221,28222,28223,28224,28225,28226,28229,28230,28231,28232,28233,28234,28235,28236,28239,28240,28241,28242,28245,28247,28249,28250,28252,28253,28254,28256,28257,28258,28259,28260,28261,28262,28263,28264,28265,28266,28268,28269,28271,28272,28273,28274,28275,28276,28277,28278,28279,28280,28281,28282,28283,28284,28285,28288,28289,28290,28292,28295,28296,28298,28299,28300,28301,28302,28305,28306,28307,28308,28309,28310,28311,28313,28314,28315,28317,28318,28320,28321,28323,28324,28326,28328,28329,28331,28332,28333,28334,28336,28339,28341,28344,28345,28348,28350,28351,28352,28355,28356,28357,28358,28360,28361,28362,28364,28365,28366,28368,28370,28374,28376,28377,28379,28380,28381,28387,28391,28394,28395,28396,28397,28398,28399,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28400,28401,28402,28403,28405,28406,28407,28408,28410,28411,28412,28413,28414,28415,28416,28417,28419,28420,28421,28423,28424,28426,28427,28428,28429,28430,28432,28433,28434,28438,28439,28440,28441,28442,28443,28444,28445,28446,28447,28449,28450,28451,28453,28454,28455,28456,28460,28462,28464,28466,28468,28469,28471,28472,28473,28474,28475,28476,28477,28479,28480,28481,28482,0,28483,28484,28485,28488,28489,28490,28492,28494,28495,28496,28497,28498,28499,28500,28501,28502,28503,28505,28506,28507,28509,28511,28512,28513,28515,28516,28517,28519,28520,28521,28522,28523,28524,28527,28528,28529,28531,28533,28534,28535,28537,28539,28541,28542,28543,28544,28545,28546,28547,28549,28550,28551,28554,28555,28559,28560,28561,28562,28563,28564,28565,28566,28567,28568,28569,28570,28571,28573,28574,28575,28576,28578,28579,28580,28581,28582,28584,28585,28586,28587,28588,28589,28590,28591,28592,28593,28594,28596,28597,28599,28600,28602,28603,28604,28605,28606,28607,28609,28611,28612,28613,28614,28615,28616,28618,28619,28620,28621,28622,28623,28624,28627,28628,28629,28630,28631,28632,28633,28634,28635,28636,28637,28639,28642,28643,28644,28645,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28646,28647,28648,28649,28650,28651,28652,28653,28656,28657,28658,28659,28660,28661,28662,28663,28664,28665,28666,28667,28668,28669,28670,28671,28672,28673,28674,28675,28676,28677,28678,28679,28680,28681,28682,28683,28684,28685,28686,28687,28688,28690,28691,28692,28693,28694,28695,28696,28697,28700,28701,28702,28703,28704,28705,28706,28708,28709,28710,28711,28712,28713,28714,0,28715,28716,28717,28718,28719,28720,28721,28722,28723,28724,28726,28727,28728,28730,28731,28732,28733,28734,28735,28736,28737,28738,28739,28740,28741,28742,28743,28744,28745,28746,28747,28749,28750,28752,28753,28754,28755,28756,28757,28758,28759,28760,28761,28762,28763,28764,28765,28767,28768,28769,28770,28771,28772,28773,28774,28775,28776,28777,28778,28782,28785,28786,28787,28788,28791,28793,28794,28795,28797,28801,28802,28803,28804,28806,28807,28808,28811,28812,28813,28815,28816,28817,28819,28823,28824,28826,28827,28830,28831,28832,28833,28834,28835,28836,28837,28838,28839,28840,28841,28842,28848,28850,28852,28853,28854,28858,28862,28863,28868,28869,28870,28871,28873,28875,28876,28877,28878,28879,28880,28881,28882,28883,28884,28885,28886,28887,28890,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,28892,28893,28894,28896,28897,28898,28899,28901,28906,28910,28912,28913,28914,28915,28916,28917,28918,28920,28922,28923,28924,28926,28927,28928,28929,28930,28931,28932,28933,28934,28935,28936,28939,28940,28941,28942,28943,28945,28946,28948,28951,28955,28956,28957,28958,28959,28960,28961,28962,28963,28964,28965,28967,28968,28969,28970,28971,28972,28973,28974,28978,28979,28980,0,28981,28983,28984,28985,28986,28987,28988,28989,28990,28991,28992,28993,28994,28995,28996,28998,28999,29000,29001,29003,29005,29007,29008,29009,29010,29011,29012,29013,29014,29015,29016,29017,29018,29019,29021,29023,29024,29025,29026,29027,29029,29033,29034,29035,29036,29037,29039,29040,29041,29044,29045,29046,29047,29049,29051,29052,29054,29055,29056,29057,29058,29059,29061,29062,29063,29064,29065,29067,29068,29069,29070,29072,29073,29074,29075,29077,29078,29079,29082,29083,29084,29085,29086,29089,29090,29091,29092,29093,29094,29095,29097,29098,29099,29101,29102,29103,29104,29105,29106,29108,29110,29111,29112,29114,29115,29116,29117,29118,29119,29120,29121,29122,29124,29125,29126,29127,29128,29129,29130,29131,29132,29133,29135,29136,29137,29138,29139,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29142,29143,29144,29145,29146,29147,29148,29149,29150,29151,29153,29154,29155,29156,29158,29160,29161,29162,29163,29164,29165,29167,29168,29169,29170,29171,29172,29173,29174,29175,29176,29178,29179,29180,29181,29182,29183,29184,29185,29186,29187,29188,29189,29191,29192,29193,29194,29195,29196,29197,29198,29199,29200,29201,29202,29203,29204,29205,29206,29207,29208,29209,29210,0,29211,29212,29214,29215,29216,29217,29218,29219,29220,29221,29222,29223,29225,29227,29229,29230,29231,29234,29235,29236,29242,29244,29246,29248,29249,29250,29251,29252,29253,29254,29257,29258,29259,29262,29263,29264,29265,29267,29268,29269,29271,29272,29274,29276,29278,29280,29283,29284,29285,29288,29290,29291,29292,29293,29296,29297,29299,29300,29302,29303,29304,29307,29308,29309,29314,29315,29317,29318,29319,29320,29321,29324,29326,29328,29329,29331,29332,29333,29334,29335,29336,29337,29338,29339,29340,29341,29342,29344,29345,29346,29347,29348,29349,29350,29351,29352,29353,29354,29355,29358,29361,29362,29363,29365,29370,29371,29372,29373,29374,29375,29376,29381,29382,29383,29385,29386,29387,29388,29391,29393,29395,29396,29397,29398,29400,29402,29403,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12288,12289,12290,183,713,711,168,12291,12293,8212,65374,8214,8230,8216,8217,8220,8221,12308,12309,12296,12297,12298,12299,12300,12301,12302,12303,12310,12311,12304,12305,177,215,247,8758,8743,8744,8721,8719,8746,8745,8712,8759,8730,8869,8741,8736,8978,8857,8747,8750,8801,8780,8776,8765,8733,8800,8814,8815,8804,8805,8734,8757,8756,9794,9792,176,8242,8243,8451,65284,164,65504,65505,8240,167,8470,9734,9733,9675,9679,9678,9671,9670,9633,9632,9651,9650,8251,8594,8592,8593,8595,12307,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8560,8561,8562,8563,8564,8565,8566,8567,8568,8569,0,0,0,0,0,0,9352,9353,9354,9355,9356,9357,9358,9359,9360,9361,9362,9363,9364,9365,9366,9367,9368,9369,9370,9371,9332,9333,9334,9335,9336,9337,9338,9339,9340,9341,9342,9343,9344,9345,9346,9347,9348,9349,9350,9351,9312,9313,9314,9315,9316,9317,9318,9319,9320,9321,0,0,12832,12833,12834,12835,12836,12837,12838,12839,12840,12841,0,0,8544,8545,8546,8547,8548,8549,8550,8551,8552,8553,8554,8555,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65281,65282,65283,65509,65285,65286,65287,65288,65289,65290,65291,65292,65293,65294,65295,65296,65297,65298,65299,65300,65301,65302,65303,65304,65305,65306,65307,65308,65309,65310,65311,65312,65313,65314,65315,65316,65317,65318,65319,65320,65321,65322,65323,65324,65325,65326,65327,65328,65329,65330,65331,65332,65333,65334,65335,65336,65337,65338,65339,65340,65341,65342,65343,65344,65345,65346,65347,65348,65349,65350,65351,65352,65353,65354,65355,65356,65357,65358,65359,65360,65361,65362,65363,65364,65365,65366,65367,65368,65369,65370,65371,65372,65373,65507,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12353,12354,12355,12356,12357,12358,12359,12360,12361,12362,12363,12364,12365,12366,12367,12368,12369,12370,12371,12372,12373,12374,12375,12376,12377,12378,12379,12380,12381,12382,12383,12384,12385,12386,12387,12388,12389,12390,12391,12392,12393,12394,12395,12396,12397,12398,12399,12400,12401,12402,12403,12404,12405,12406,12407,12408,12409,12410,12411,12412,12413,12414,12415,12416,12417,12418,12419,12420,12421,12422,12423,12424,12425,12426,12427,12428,12429,12430,12431,12432,12433,12434,12435,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12449,12450,12451,12452,12453,12454,12455,12456,12457,12458,12459,12460,12461,12462,12463,12464,12465,12466,12467,12468,12469,12470,12471,12472,12473,12474,12475,12476,12477,12478,12479,12480,12481,12482,12483,12484,12485,12486,12487,12488,12489,12490,12491,12492,12493,12494,12495,12496,12497,12498,12499,12500,12501,12502,12503,12504,12505,12506,12507,12508,12509,12510,12511,12512,12513,12514,12515,12516,12517,12518,12519,12520,12521,12522,12523,12524,12525,12526,12527,12528,12529,12530,12531,12532,12533,12534,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,931,932,933,934,935,936,937,0,0,0,0,0,0,0,0,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,963,964,965,966,967,968,969,0,0,0,0,0,0,0,65077,65078,65081,65082,65087,65088,65085,65086,65089,65090,65091,65092,0,0,65083,65084,65079,65080,65073,0,65075,65076,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1040,1041,1042,1043,1044,1045,1025,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1072,1073,1074,1075,1076,1077,1105,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,714,715,729,8211,8213,8229,8245,8453,8457,8598,8599,8600,8601,8725,8735,8739,8786,8806,8807,8895,9552,9553,9554,9555,9556,9557,9558,9559,9560,9561,9562,9563,9564,9565,9566,9567,9568,9569,9570,9571,9572,9573,9574,9575,9576,9577,9578,9579,9580,9581,9582,9583,9584,9585,9586,9587,9601,9602,9603,9604,9605,9606,9607,0,9608,9609,9610,9611,9612,9613,9614,9615,9619,9620,9621,9660,9661,9698,9699,9700,9701,9737,8853,12306,12317,12318,0,0,0,0,0,0,0,0,0,0,0,257,225,462,224,275,233,283,232,299,237,464,236,333,243,466,242,363,250,468,249,470,472,474,476,252,234,593,0,324,328,0,609,0,0,0,0,12549,12550,12551,12552,12553,12554,12555,12556,12557,12558,12559,12560,12561,12562,12563,12564,12565,12566,12567,12568,12569,12570,12571,12572,12573,12574,12575,12576,12577,12578,12579,12580,12581,12582,12583,12584,12585,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12321,12322,12323,12324,12325,12326,12327,12328,12329,12963,13198,13199,13212,13213,13214,13217,13252,13262,13265,13266,13269,65072,65506,65508,0,8481,12849,0,8208,0,0,0,12540,12443,12444,12541,12542,12294,12445,12446,65097,65098,65099,65100,65101,65102,65103,65104,65105,65106,65108,65109,65110,65111,65113,65114,65115,65116,65117,65118,65119,65120,65121,0,65122,65123,65124,65125,65126,65128,65129,65130,65131,0,0,0,0,0,0,0,0,0,0,0,0,0,12295,0,0,0,0,0,0,0,0,0,0,0,0,0,9472,9473,9474,9475,9476,9477,9478,9479,9480,9481,9482,9483,9484,9485,9486,9487,9488,9489,9490,9491,9492,9493,9494,9495,9496,9497,9498,9499,9500,9501,9502,9503,9504,9505,9506,9507,9508,9509,9510,9511,9512,9513,9514,9515,9516,9517,9518,9519,9520,9521,9522,9523,9524,9525,9526,9527,9528,9529,9530,9531,9532,9533,9534,9535,9536,9537,9538,9539,9540,9541,9542,9543,9544,9545,9546,9547,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29404,29405,29407,29410,29411,29412,29413,29414,29415,29418,29419,29429,29430,29433,29437,29438,29439,29440,29442,29444,29445,29446,29447,29448,29449,29451,29452,29453,29455,29456,29457,29458,29460,29464,29465,29466,29471,29472,29475,29476,29478,29479,29480,29485,29487,29488,29490,29491,29493,29494,29498,29499,29500,29501,29504,29505,29506,29507,29508,29509,29510,29511,29512,0,29513,29514,29515,29516,29518,29519,29521,29523,29524,29525,29526,29528,29529,29530,29531,29532,29533,29534,29535,29537,29538,29539,29540,29541,29542,29543,29544,29545,29546,29547,29550,29552,29553,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29554,29555,29556,29557,29558,29559,29560,29561,29562,29563,29564,29565,29567,29568,29569,29570,29571,29573,29574,29576,29578,29580,29581,29583,29584,29586,29587,29588,29589,29591,29592,29593,29594,29596,29597,29598,29600,29601,29603,29604,29605,29606,29607,29608,29610,29612,29613,29617,29620,29621,29622,29624,29625,29628,29629,29630,29631,29633,29635,29636,29637,29638,29639,0,29643,29644,29646,29650,29651,29652,29653,29654,29655,29656,29658,29659,29660,29661,29663,29665,29666,29667,29668,29670,29672,29674,29675,29676,29678,29679,29680,29681,29683,29684,29685,29686,29687,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29688,29689,29690,29691,29692,29693,29694,29695,29696,29697,29698,29700,29703,29704,29707,29708,29709,29710,29713,29714,29715,29716,29717,29718,29719,29720,29721,29724,29725,29726,29727,29728,29729,29731,29732,29735,29737,29739,29741,29743,29745,29746,29751,29752,29753,29754,29755,29757,29758,29759,29760,29762,29763,29764,29765,29766,29767,29768,29769,29770,29771,29772,29773,0,29774,29775,29776,29777,29778,29779,29780,29782,29784,29789,29792,29793,29794,29795,29796,29797,29798,29799,29800,29801,29802,29803,29804,29806,29807,29809,29810,29811,29812,29813,29816,29817,29818,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29819,29820,29821,29823,29826,29828,29829,29830,29832,29833,29834,29836,29837,29839,29841,29842,29843,29844,29845,29846,29847,29848,29849,29850,29851,29853,29855,29856,29857,29858,29859,29860,29861,29862,29866,29867,29868,29869,29870,29871,29872,29873,29874,29875,29876,29877,29878,29879,29880,29881,29883,29884,29885,29886,29887,29888,29889,29890,29891,29892,29893,29894,29895,0,29896,29897,29898,29899,29900,29901,29902,29903,29904,29905,29907,29908,29909,29910,29911,29912,29913,29914,29915,29917,29919,29921,29925,29927,29928,29929,29930,29931,29932,29933,29936,29937,29938,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29939,29941,29944,29945,29946,29947,29948,29949,29950,29952,29953,29954,29955,29957,29958,29959,29960,29961,29962,29963,29964,29966,29968,29970,29972,29973,29974,29975,29979,29981,29982,29984,29985,29986,29987,29988,29990,29991,29994,29998,30004,30006,30009,30012,30013,30015,30017,30018,30019,30020,30022,30023,30025,30026,30029,30032,30033,30034,30035,30037,30038,30039,30040,0,30045,30046,30047,30048,30049,30050,30051,30052,30055,30056,30057,30059,30060,30061,30062,30063,30064,30065,30067,30069,30070,30071,30074,30075,30076,30077,30078,30080,30081,30082,30084,30085,30087,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30088,30089,30090,30092,30093,30094,30096,30099,30101,30104,30107,30108,30110,30114,30118,30119,30120,30121,30122,30125,30134,30135,30138,30139,30143,30144,30145,30150,30155,30156,30158,30159,30160,30161,30163,30167,30169,30170,30172,30173,30175,30176,30177,30181,30185,30188,30189,30190,30191,30194,30195,30197,30198,30199,30200,30202,30203,30205,30206,30210,30212,30214,30215,0,30216,30217,30219,30221,30222,30223,30225,30226,30227,30228,30230,30234,30236,30237,30238,30241,30243,30247,30248,30252,30254,30255,30257,30258,30262,30263,30265,30266,30267,30269,30273,30274,30276,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30277,30278,30279,30280,30281,30282,30283,30286,30287,30288,30289,30290,30291,30293,30295,30296,30297,30298,30299,30301,30303,30304,30305,30306,30308,30309,30310,30311,30312,30313,30314,30316,30317,30318,30320,30321,30322,30323,30324,30325,30326,30327,30329,30330,30332,30335,30336,30337,30339,30341,30345,30346,30348,30349,30351,30352,30354,30356,30357,30359,30360,30362,30363,0,30364,30365,30366,30367,30368,30369,30370,30371,30373,30374,30375,30376,30377,30378,30379,30380,30381,30383,30384,30387,30389,30390,30391,30392,30393,30394,30395,30396,30397,30398,30400,30401,30403,21834,38463,22467,25384,21710,21769,21696,30353,30284,34108,30702,33406,30861,29233,38552,38797,27688,23433,20474,25353,26263,23736,33018,26696,32942,26114,30414,20985,25942,29100,32753,34948,20658,22885,25034,28595,33453,25420,25170,21485,21543,31494,20843,30116,24052,25300,36299,38774,25226,32793,22365,38712,32610,29240,30333,26575,30334,25670,20336,36133,25308,31255,26001,29677,25644,25203,33324,39041,26495,29256,25198,25292,20276,29923,21322,21150,32458,37030,24110,26758,27036,33152,32465,26834,30917,34444,38225,20621,35876,33502,32990,21253,35090,21093,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30404,30407,30409,30411,30412,30419,30421,30425,30426,30428,30429,30430,30432,30433,30434,30435,30436,30438,30439,30440,30441,30442,30443,30444,30445,30448,30451,30453,30454,30455,30458,30459,30461,30463,30464,30466,30467,30469,30470,30474,30476,30478,30479,30480,30481,30482,30483,30484,30485,30486,30487,30488,30491,30492,30493,30494,30497,30499,30500,30501,30503,30506,30507,0,30508,30510,30512,30513,30514,30515,30516,30521,30523,30525,30526,30527,30530,30532,30533,30534,30536,30537,30538,30539,30540,30541,30542,30543,30546,30547,30548,30549,30550,30551,30552,30553,30556,34180,38649,20445,22561,39281,23453,25265,25253,26292,35961,40077,29190,26479,30865,24754,21329,21271,36744,32972,36125,38049,20493,29384,22791,24811,28953,34987,22868,33519,26412,31528,23849,32503,29997,27893,36454,36856,36924,40763,27604,37145,31508,24444,30887,34006,34109,27605,27609,27606,24065,24199,30201,38381,25949,24330,24517,36767,22721,33218,36991,38491,38829,36793,32534,36140,25153,20415,21464,21342,36776,36777,36779,36941,26631,24426,33176,34920,40150,24971,21035,30250,24428,25996,28626,28392,23486,25672,20853,20912,26564,19993,31177,39292,28851,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30557,30558,30559,30560,30564,30567,30569,30570,30573,30574,30575,30576,30577,30578,30579,30580,30581,30582,30583,30584,30586,30587,30588,30593,30594,30595,30598,30599,30600,30601,30602,30603,30607,30608,30611,30612,30613,30614,30615,30616,30617,30618,30619,30620,30621,30622,30625,30627,30628,30630,30632,30635,30637,30638,30639,30641,30642,30644,30646,30647,30648,30649,30650,0,30652,30654,30656,30657,30658,30659,30660,30661,30662,30663,30664,30665,30666,30667,30668,30670,30671,30672,30673,30674,30675,30676,30677,30678,30680,30681,30682,30685,30686,30687,30688,30689,30692,30149,24182,29627,33760,25773,25320,38069,27874,21338,21187,25615,38082,31636,20271,24091,33334,33046,33162,28196,27850,39539,25429,21340,21754,34917,22496,19981,24067,27493,31807,37096,24598,25830,29468,35009,26448,25165,36130,30572,36393,37319,24425,33756,34081,39184,21442,34453,27531,24813,24808,28799,33485,33329,20179,27815,34255,25805,31961,27133,26361,33609,21397,31574,20391,20876,27979,23618,36461,25554,21449,33580,33590,26597,30900,25661,23519,23700,24046,35815,25286,26612,35962,25600,25530,34633,39307,35863,32544,38130,20135,38416,39076,26124,29462,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30694,30696,30698,30703,30704,30705,30706,30708,30709,30711,30713,30714,30715,30716,30723,30724,30725,30726,30727,30728,30730,30731,30734,30735,30736,30739,30741,30745,30747,30750,30752,30753,30754,30756,30760,30762,30763,30766,30767,30769,30770,30771,30773,30774,30781,30783,30785,30786,30787,30788,30790,30792,30793,30794,30795,30797,30799,30801,30803,30804,30808,30809,30810,0,30811,30812,30814,30815,30816,30817,30818,30819,30820,30821,30822,30823,30824,30825,30831,30832,30833,30834,30835,30836,30837,30838,30840,30841,30842,30843,30845,30846,30847,30848,30849,30850,30851,22330,23581,24120,38271,20607,32928,21378,25950,30021,21809,20513,36229,25220,38046,26397,22066,28526,24034,21557,28818,36710,25199,25764,25507,24443,28552,37108,33251,36784,23576,26216,24561,27785,38472,36225,34924,25745,31216,22478,27225,25104,21576,20056,31243,24809,28548,35802,25215,36894,39563,31204,21507,30196,25345,21273,27744,36831,24347,39536,32827,40831,20360,23610,36196,32709,26021,28861,20805,20914,34411,23815,23456,25277,37228,30068,36364,31264,24833,31609,20167,32504,30597,19985,33261,21021,20986,27249,21416,36487,38148,38607,28353,38500,26970,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30852,30853,30854,30856,30858,30859,30863,30864,30866,30868,30869,30870,30873,30877,30878,30880,30882,30884,30886,30888,30889,30890,30891,30892,30893,30894,30895,30901,30902,30903,30904,30906,30907,30908,30909,30911,30912,30914,30915,30916,30918,30919,30920,30924,30925,30926,30927,30929,30930,30931,30934,30935,30936,30938,30939,30940,30941,30942,30943,30944,30945,30946,30947,0,30948,30949,30950,30951,30953,30954,30955,30957,30958,30959,30960,30961,30963,30965,30966,30968,30969,30971,30972,30973,30974,30975,30976,30978,30979,30980,30982,30983,30984,30985,30986,30987,30988,30784,20648,30679,25616,35302,22788,25571,24029,31359,26941,20256,33337,21912,20018,30126,31383,24162,24202,38383,21019,21561,28810,25462,38180,22402,26149,26943,37255,21767,28147,32431,34850,25139,32496,30133,33576,30913,38604,36766,24904,29943,35789,27492,21050,36176,27425,32874,33905,22257,21254,20174,19995,20945,31895,37259,31751,20419,36479,31713,31388,25703,23828,20652,33030,30209,31929,28140,32736,26449,23384,23544,30923,25774,25619,25514,25387,38169,25645,36798,31572,30249,25171,22823,21574,27513,20643,25140,24102,27526,20195,36151,34955,24453,36910,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30989,30990,30991,30992,30993,30994,30996,30997,30998,30999,31000,31001,31002,31003,31004,31005,31007,31008,31009,31010,31011,31013,31014,31015,31016,31017,31018,31019,31020,31021,31022,31023,31024,31025,31026,31027,31029,31030,31031,31032,31033,31037,31039,31042,31043,31044,31045,31047,31050,31051,31052,31053,31054,31055,31056,31057,31058,31060,31061,31064,31065,31073,31075,0,31076,31078,31081,31082,31083,31084,31086,31088,31089,31090,31091,31092,31093,31094,31097,31099,31100,31101,31102,31103,31106,31107,31110,31111,31112,31113,31115,31116,31117,31118,31120,31121,31122,24608,32829,25285,20025,21333,37112,25528,32966,26086,27694,20294,24814,28129,35806,24377,34507,24403,25377,20826,33633,26723,20992,25443,36424,20498,23707,31095,23548,21040,31291,24764,36947,30423,24503,24471,30340,36460,28783,30331,31561,30634,20979,37011,22564,20302,28404,36842,25932,31515,29380,28068,32735,23265,25269,24213,22320,33922,31532,24093,24351,36882,32532,39072,25474,28359,30872,28857,20856,38747,22443,30005,20291,30008,24215,24806,22880,28096,27583,30857,21500,38613,20939,20993,25481,21514,38035,35843,36300,29241,30879,34678,36845,35853,21472,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31123,31124,31125,31126,31127,31128,31129,31131,31132,31133,31134,31135,31136,31137,31138,31139,31140,31141,31142,31144,31145,31146,31147,31148,31149,31150,31151,31152,31153,31154,31156,31157,31158,31159,31160,31164,31167,31170,31172,31173,31175,31176,31178,31180,31182,31183,31184,31187,31188,31190,31191,31193,31194,31195,31196,31197,31198,31200,31201,31202,31205,31208,31210,0,31212,31214,31217,31218,31219,31220,31221,31222,31223,31225,31226,31228,31230,31231,31233,31236,31237,31239,31240,31241,31242,31244,31247,31248,31249,31250,31251,31253,31254,31256,31257,31259,31260,19969,30447,21486,38025,39030,40718,38189,23450,35746,20002,19996,20908,33891,25026,21160,26635,20375,24683,20923,27934,20828,25238,26007,38497,35910,36887,30168,37117,30563,27602,29322,29420,35835,22581,30585,36172,26460,38208,32922,24230,28193,22930,31471,30701,38203,27573,26029,32526,22534,20817,38431,23545,22697,21544,36466,25958,39039,22244,38045,30462,36929,25479,21702,22810,22842,22427,36530,26421,36346,33333,21057,24816,22549,34558,23784,40517,20420,39069,35769,23077,24694,21380,25212,36943,37122,39295,24681,32780,20799,32819,23572,39285,27953,20108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31261,31263,31265,31266,31268,31269,31270,31271,31272,31273,31274,31275,31276,31277,31278,31279,31280,31281,31282,31284,31285,31286,31288,31290,31294,31296,31297,31298,31299,31300,31301,31303,31304,31305,31306,31307,31308,31309,31310,31311,31312,31314,31315,31316,31317,31318,31320,31321,31322,31323,31324,31325,31326,31327,31328,31329,31330,31331,31332,31333,31334,31335,31336,0,31337,31338,31339,31340,31341,31342,31343,31345,31346,31347,31349,31355,31356,31357,31358,31362,31365,31367,31369,31370,31371,31372,31374,31375,31376,31379,31380,31385,31386,31387,31390,31393,31394,36144,21457,32602,31567,20240,20047,38400,27861,29648,34281,24070,30058,32763,27146,30718,38034,32321,20961,28902,21453,36820,33539,36137,29359,39277,27867,22346,33459,26041,32938,25151,38450,22952,20223,35775,32442,25918,33778,38750,21857,39134,32933,21290,35837,21536,32954,24223,27832,36153,33452,37210,21545,27675,20998,32439,22367,28954,27774,31881,22859,20221,24575,24868,31914,20016,23553,26539,34562,23792,38155,39118,30127,28925,36898,20911,32541,35773,22857,20964,20315,21542,22827,25975,32932,23413,25206,25282,36752,24133,27679,31526,20239,20440,26381,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31395,31396,31399,31401,31402,31403,31406,31407,31408,31409,31410,31412,31413,31414,31415,31416,31417,31418,31419,31420,31421,31422,31424,31425,31426,31427,31428,31429,31430,31431,31432,31433,31434,31436,31437,31438,31439,31440,31441,31442,31443,31444,31445,31447,31448,31450,31451,31452,31453,31457,31458,31460,31463,31464,31465,31466,31467,31468,31470,31472,31473,31474,31475,0,31476,31477,31478,31479,31480,31483,31484,31486,31488,31489,31490,31493,31495,31497,31500,31501,31502,31504,31506,31507,31510,31511,31512,31514,31516,31517,31519,31521,31522,31523,31527,31529,31533,28014,28074,31119,34993,24343,29995,25242,36741,20463,37340,26023,33071,33105,24220,33104,36212,21103,35206,36171,22797,20613,20184,38428,29238,33145,36127,23500,35747,38468,22919,32538,21648,22134,22030,35813,25913,27010,38041,30422,28297,24178,29976,26438,26577,31487,32925,36214,24863,31174,25954,36195,20872,21018,38050,32568,32923,32434,23703,28207,26464,31705,30347,39640,33167,32660,31957,25630,38224,31295,21578,21733,27468,25601,25096,40509,33011,30105,21106,38761,33883,26684,34532,38401,38548,38124,20010,21508,32473,26681,36319,32789,26356,24218,32697,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31535,31536,31538,31540,31541,31542,31543,31545,31547,31549,31551,31552,31553,31554,31555,31556,31558,31560,31562,31565,31566,31571,31573,31575,31577,31580,31582,31583,31585,31587,31588,31589,31590,31591,31592,31593,31594,31595,31596,31597,31599,31600,31603,31604,31606,31608,31610,31612,31613,31615,31617,31618,31619,31620,31622,31623,31624,31625,31626,31627,31628,31630,31631,0,31633,31634,31635,31638,31640,31641,31642,31643,31646,31647,31648,31651,31652,31653,31662,31663,31664,31666,31667,31669,31670,31671,31673,31674,31675,31676,31677,31678,31679,31680,31682,31683,31684,22466,32831,26775,24037,25915,21151,24685,40858,20379,36524,20844,23467,24339,24041,27742,25329,36129,20849,38057,21246,27807,33503,29399,22434,26500,36141,22815,36764,33735,21653,31629,20272,27837,23396,22993,40723,21476,34506,39592,35895,32929,25925,39038,22266,38599,21038,29916,21072,23521,25346,35074,20054,25296,24618,26874,20851,23448,20896,35266,31649,39302,32592,24815,28748,36143,20809,24191,36891,29808,35268,22317,30789,24402,40863,38394,36712,39740,35809,30328,26690,26588,36330,36149,21053,36746,28378,26829,38149,37101,22269,26524,35065,36807,21704,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31685,31688,31689,31690,31691,31693,31694,31695,31696,31698,31700,31701,31702,31703,31704,31707,31708,31710,31711,31712,31714,31715,31716,31719,31720,31721,31723,31724,31725,31727,31728,31730,31731,31732,31733,31734,31736,31737,31738,31739,31741,31743,31744,31745,31746,31747,31748,31749,31750,31752,31753,31754,31757,31758,31760,31761,31762,31763,31764,31765,31767,31768,31769,0,31770,31771,31772,31773,31774,31776,31777,31778,31779,31780,31781,31784,31785,31787,31788,31789,31790,31791,31792,31793,31794,31795,31796,31797,31798,31799,31801,31802,31803,31804,31805,31806,31810,39608,23401,28023,27686,20133,23475,39559,37219,25000,37039,38889,21547,28085,23506,20989,21898,32597,32752,25788,25421,26097,25022,24717,28938,27735,27721,22831,26477,33322,22741,22158,35946,27627,37085,22909,32791,21495,28009,21621,21917,33655,33743,26680,31166,21644,20309,21512,30418,35977,38402,27827,28088,36203,35088,40548,36154,22079,40657,30165,24456,29408,24680,21756,20136,27178,34913,24658,36720,21700,28888,34425,40511,27946,23439,24344,32418,21897,20399,29492,21564,21402,20505,21518,21628,20046,24573,29786,22774,33899,32993,34676,29392,31946,28246,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31811,31812,31813,31814,31815,31816,31817,31818,31819,31820,31822,31823,31824,31825,31826,31827,31828,31829,31830,31831,31832,31833,31834,31835,31836,31837,31838,31839,31840,31841,31842,31843,31844,31845,31846,31847,31848,31849,31850,31851,31852,31853,31854,31855,31856,31857,31858,31861,31862,31863,31864,31865,31866,31870,31871,31872,31873,31874,31875,31876,31877,31878,31879,0,31880,31882,31883,31884,31885,31886,31887,31888,31891,31892,31894,31897,31898,31899,31904,31905,31907,31910,31911,31912,31913,31915,31916,31917,31919,31920,31924,31925,31926,31927,31928,31930,31931,24359,34382,21804,25252,20114,27818,25143,33457,21719,21326,29502,28369,30011,21010,21270,35805,27088,24458,24576,28142,22351,27426,29615,26707,36824,32531,25442,24739,21796,30186,35938,28949,28067,23462,24187,33618,24908,40644,30970,34647,31783,30343,20976,24822,29004,26179,24140,24653,35854,28784,25381,36745,24509,24674,34516,22238,27585,24724,24935,21321,24800,26214,36159,31229,20250,28905,27719,35763,35826,32472,33636,26127,23130,39746,27985,28151,35905,27963,20249,28779,33719,25110,24785,38669,36135,31096,20987,22334,22522,26426,30072,31293,31215,31637,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31935,31936,31938,31939,31940,31942,31945,31947,31950,31951,31952,31953,31954,31955,31956,31960,31962,31963,31965,31966,31969,31970,31971,31972,31973,31974,31975,31977,31978,31979,31980,31981,31982,31984,31985,31986,31987,31988,31989,31990,31991,31993,31994,31996,31997,31998,31999,32000,32001,32002,32003,32004,32005,32006,32007,32008,32009,32011,32012,32013,32014,32015,32016,0,32017,32018,32019,32020,32021,32022,32023,32024,32025,32026,32027,32028,32029,32030,32031,32033,32035,32036,32037,32038,32040,32041,32042,32044,32045,32046,32048,32049,32050,32051,32052,32053,32054,32908,39269,36857,28608,35749,40481,23020,32489,32521,21513,26497,26840,36753,31821,38598,21450,24613,30142,27762,21363,23241,32423,25380,20960,33034,24049,34015,25216,20864,23395,20238,31085,21058,24760,27982,23492,23490,35745,35760,26082,24524,38469,22931,32487,32426,22025,26551,22841,20339,23478,21152,33626,39050,36158,30002,38078,20551,31292,20215,26550,39550,23233,27516,30417,22362,23574,31546,38388,29006,20860,32937,33392,22904,32516,33575,26816,26604,30897,30839,25315,25441,31616,20461,21098,20943,33616,27099,37492,36341,36145,35265,38190,31661,20214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32055,32056,32057,32058,32059,32060,32061,32062,32063,32064,32065,32066,32067,32068,32069,32070,32071,32072,32073,32074,32075,32076,32077,32078,32079,32080,32081,32082,32083,32084,32085,32086,32087,32088,32089,32090,32091,32092,32093,32094,32095,32096,32097,32098,32099,32100,32101,32102,32103,32104,32105,32106,32107,32108,32109,32111,32112,32113,32114,32115,32116,32117,32118,0,32120,32121,32122,32123,32124,32125,32126,32127,32128,32129,32130,32131,32132,32133,32134,32135,32136,32137,32138,32139,32140,32141,32142,32143,32144,32145,32146,32147,32148,32149,32150,32151,32152,20581,33328,21073,39279,28176,28293,28071,24314,20725,23004,23558,27974,27743,30086,33931,26728,22870,35762,21280,37233,38477,34121,26898,30977,28966,33014,20132,37066,27975,39556,23047,22204,25605,38128,30699,20389,33050,29409,35282,39290,32564,32478,21119,25945,37237,36735,36739,21483,31382,25581,25509,30342,31224,34903,38454,25130,21163,33410,26708,26480,25463,30571,31469,27905,32467,35299,22992,25106,34249,33445,30028,20511,20171,30117,35819,23626,24062,31563,26020,37329,20170,27941,35167,32039,38182,20165,35880,36827,38771,26187,31105,36817,28908,28024,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32153,32154,32155,32156,32157,32158,32159,32160,32161,32162,32163,32164,32165,32167,32168,32169,32170,32171,32172,32173,32175,32176,32177,32178,32179,32180,32181,32182,32183,32184,32185,32186,32187,32188,32189,32190,32191,32192,32193,32194,32195,32196,32197,32198,32199,32200,32201,32202,32203,32204,32205,32206,32207,32208,32209,32210,32211,32212,32213,32214,32215,32216,32217,0,32218,32219,32220,32221,32222,32223,32224,32225,32226,32227,32228,32229,32230,32231,32232,32233,32234,32235,32236,32237,32238,32239,32240,32241,32242,32243,32244,32245,32246,32247,32248,32249,32250,23613,21170,33606,20834,33550,30555,26230,40120,20140,24778,31934,31923,32463,20117,35686,26223,39048,38745,22659,25964,38236,24452,30153,38742,31455,31454,20928,28847,31384,25578,31350,32416,29590,38893,20037,28792,20061,37202,21417,25937,26087,33276,33285,21646,23601,30106,38816,25304,29401,30141,23621,39545,33738,23616,21632,30697,20030,27822,32858,25298,25454,24040,20855,36317,36382,38191,20465,21477,24807,28844,21095,25424,40515,23071,20518,30519,21367,32482,25733,25899,25225,25496,20500,29237,35273,20915,35776,32477,22343,33740,38055,20891,21531,23803,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32251,32252,32253,32254,32255,32256,32257,32258,32259,32260,32261,32262,32263,32264,32265,32266,32267,32268,32269,32270,32271,32272,32273,32274,32275,32276,32277,32278,32279,32280,32281,32282,32283,32284,32285,32286,32287,32288,32289,32290,32291,32292,32293,32294,32295,32296,32297,32298,32299,32300,32301,32302,32303,32304,32305,32306,32307,32308,32309,32310,32311,32312,32313,0,32314,32316,32317,32318,32319,32320,32322,32323,32324,32325,32326,32328,32329,32330,32331,32332,32333,32334,32335,32336,32337,32338,32339,32340,32341,32342,32343,32344,32345,32346,32347,32348,32349,20426,31459,27994,37089,39567,21888,21654,21345,21679,24320,25577,26999,20975,24936,21002,22570,21208,22350,30733,30475,24247,24951,31968,25179,25239,20130,28821,32771,25335,28900,38752,22391,33499,26607,26869,30933,39063,31185,22771,21683,21487,28212,20811,21051,23458,35838,32943,21827,22438,24691,22353,21549,31354,24656,23380,25511,25248,21475,25187,23495,26543,21741,31391,33510,37239,24211,35044,22840,22446,25358,36328,33007,22359,31607,20393,24555,23485,27454,21281,31568,29378,26694,30719,30518,26103,20917,20111,30420,23743,31397,33909,22862,39745,20608,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32350,32351,32352,32353,32354,32355,32356,32357,32358,32359,32360,32361,32362,32363,32364,32365,32366,32367,32368,32369,32370,32371,32372,32373,32374,32375,32376,32377,32378,32379,32380,32381,32382,32383,32384,32385,32387,32388,32389,32390,32391,32392,32393,32394,32395,32396,32397,32398,32399,32400,32401,32402,32403,32404,32405,32406,32407,32408,32409,32410,32412,32413,32414,0,32430,32436,32443,32444,32470,32484,32492,32505,32522,32528,32542,32567,32569,32571,32572,32573,32574,32575,32576,32577,32579,32582,32583,32584,32585,32586,32587,32588,32589,32590,32591,32594,32595,39304,24871,28291,22372,26118,25414,22256,25324,25193,24275,38420,22403,25289,21895,34593,33098,36771,21862,33713,26469,36182,34013,23146,26639,25318,31726,38417,20848,28572,35888,25597,35272,25042,32518,28866,28389,29701,27028,29436,24266,37070,26391,28010,25438,21171,29282,32769,20332,23013,37226,28889,28061,21202,20048,38647,38253,34174,30922,32047,20769,22418,25794,32907,31867,27882,26865,26974,20919,21400,26792,29313,40654,31729,29432,31163,28435,29702,26446,37324,40100,31036,33673,33620,21519,26647,20029,21385,21169,30782,21382,21033,20616,20363,20432,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32598,32601,32603,32604,32605,32606,32608,32611,32612,32613,32614,32615,32619,32620,32621,32623,32624,32627,32629,32630,32631,32632,32634,32635,32636,32637,32639,32640,32642,32643,32644,32645,32646,32647,32648,32649,32651,32653,32655,32656,32657,32658,32659,32661,32662,32663,32664,32665,32667,32668,32672,32674,32675,32677,32678,32680,32681,32682,32683,32684,32685,32686,32689,0,32691,32692,32693,32694,32695,32698,32699,32702,32704,32706,32707,32708,32710,32711,32712,32713,32715,32717,32719,32720,32721,32722,32723,32726,32727,32729,32730,32731,32732,32733,32734,32738,32739,30178,31435,31890,27813,38582,21147,29827,21737,20457,32852,33714,36830,38256,24265,24604,28063,24088,25947,33080,38142,24651,28860,32451,31918,20937,26753,31921,33391,20004,36742,37327,26238,20142,35845,25769,32842,20698,30103,29134,23525,36797,28518,20102,25730,38243,24278,26009,21015,35010,28872,21155,29454,29747,26519,30967,38678,20020,37051,40158,28107,20955,36161,21533,25294,29618,33777,38646,40836,38083,20278,32666,20940,28789,38517,23725,39046,21478,20196,28316,29705,27060,30827,39311,30041,21016,30244,27969,26611,20845,40857,32843,21657,31548,31423,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32740,32743,32744,32746,32747,32748,32749,32751,32754,32756,32757,32758,32759,32760,32761,32762,32765,32766,32767,32770,32775,32776,32777,32778,32782,32783,32785,32787,32794,32795,32797,32798,32799,32801,32803,32804,32811,32812,32813,32814,32815,32816,32818,32820,32825,32826,32828,32830,32832,32833,32836,32837,32839,32840,32841,32846,32847,32848,32849,32851,32853,32854,32855,0,32857,32859,32860,32861,32862,32863,32864,32865,32866,32867,32868,32869,32870,32871,32872,32875,32876,32877,32878,32879,32880,32882,32883,32884,32885,32886,32887,32888,32889,32890,32891,32892,32893,38534,22404,25314,38471,27004,23044,25602,31699,28431,38475,33446,21346,39045,24208,28809,25523,21348,34383,40065,40595,30860,38706,36335,36162,40575,28510,31108,24405,38470,25134,39540,21525,38109,20387,26053,23653,23649,32533,34385,27695,24459,29575,28388,32511,23782,25371,23402,28390,21365,20081,25504,30053,25249,36718,20262,20177,27814,32438,35770,33821,34746,32599,36923,38179,31657,39585,35064,33853,27931,39558,32476,22920,40635,29595,30721,34434,39532,39554,22043,21527,22475,20080,40614,21334,36808,33033,30610,39314,34542,28385,34067,26364,24930,28459,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32894,32897,32898,32901,32904,32906,32909,32910,32911,32912,32913,32914,32916,32917,32919,32921,32926,32931,32934,32935,32936,32940,32944,32947,32949,32950,32952,32953,32955,32965,32967,32968,32969,32970,32971,32975,32976,32977,32978,32979,32980,32981,32984,32991,32992,32994,32995,32998,33006,33013,33015,33017,33019,33022,33023,33024,33025,33027,33028,33029,33031,33032,33035,0,33036,33045,33047,33049,33051,33052,33053,33055,33056,33057,33058,33059,33060,33061,33062,33063,33064,33065,33066,33067,33069,33070,33072,33075,33076,33077,33079,33081,33082,33083,33084,33085,33087,35881,33426,33579,30450,27667,24537,33725,29483,33541,38170,27611,30683,38086,21359,33538,20882,24125,35980,36152,20040,29611,26522,26757,37238,38665,29028,27809,30473,23186,38209,27599,32654,26151,23504,22969,23194,38376,38391,20204,33804,33945,27308,30431,38192,29467,26790,23391,30511,37274,38753,31964,36855,35868,24357,31859,31192,35269,27852,34588,23494,24130,26825,30496,32501,20885,20813,21193,23081,32517,38754,33495,25551,30596,34256,31186,28218,24217,22937,34065,28781,27665,25279,30399,25935,24751,38397,26126,34719,40483,38125,21517,21629,35884,25720,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33088,33089,33090,33091,33092,33093,33095,33097,33101,33102,33103,33106,33110,33111,33112,33115,33116,33117,33118,33119,33121,33122,33123,33124,33126,33128,33130,33131,33132,33135,33138,33139,33141,33142,33143,33144,33153,33155,33156,33157,33158,33159,33161,33163,33164,33165,33166,33168,33170,33171,33172,33173,33174,33175,33177,33178,33182,33183,33184,33185,33186,33188,33189,0,33191,33193,33195,33196,33197,33198,33199,33200,33201,33202,33204,33205,33206,33207,33208,33209,33212,33213,33214,33215,33220,33221,33223,33224,33225,33227,33229,33230,33231,33232,33233,33234,33235,25721,34321,27169,33180,30952,25705,39764,25273,26411,33707,22696,40664,27819,28448,23518,38476,35851,29279,26576,25287,29281,20137,22982,27597,22675,26286,24149,21215,24917,26408,30446,30566,29287,31302,25343,21738,21584,38048,37027,23068,32435,27670,20035,22902,32784,22856,21335,30007,38590,22218,25376,33041,24700,38393,28118,21602,39297,20869,23273,33021,22958,38675,20522,27877,23612,25311,20320,21311,33147,36870,28346,34091,25288,24180,30910,25781,25467,24565,23064,37247,40479,23615,25423,32834,23421,21870,38218,38221,28037,24744,26592,29406,20957,23425,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33236,33237,33238,33239,33240,33241,33242,33243,33244,33245,33246,33247,33248,33249,33250,33252,33253,33254,33256,33257,33259,33262,33263,33264,33265,33266,33269,33270,33271,33272,33273,33274,33277,33279,33283,33287,33288,33289,33290,33291,33294,33295,33297,33299,33301,33302,33303,33304,33305,33306,33309,33312,33316,33317,33318,33319,33321,33326,33330,33338,33340,33341,33343,0,33344,33345,33346,33347,33349,33350,33352,33354,33356,33357,33358,33360,33361,33362,33363,33364,33365,33366,33367,33369,33371,33372,33373,33374,33376,33377,33378,33379,33380,33381,33382,33383,33385,25319,27870,29275,25197,38062,32445,33043,27987,20892,24324,22900,21162,24594,22899,26262,34384,30111,25386,25062,31983,35834,21734,27431,40485,27572,34261,21589,20598,27812,21866,36276,29228,24085,24597,29750,25293,25490,29260,24472,28227,27966,25856,28504,30424,30928,30460,30036,21028,21467,20051,24222,26049,32810,32982,25243,21638,21032,28846,34957,36305,27873,21624,32986,22521,35060,36180,38506,37197,20329,27803,21943,30406,30768,25256,28921,28558,24429,34028,26842,30844,31735,33192,26379,40527,25447,30896,22383,30738,38713,25209,25259,21128,29749,27607,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33386,33387,33388,33389,33393,33397,33398,33399,33400,33403,33404,33408,33409,33411,33413,33414,33415,33417,33420,33424,33427,33428,33429,33430,33434,33435,33438,33440,33442,33443,33447,33458,33461,33462,33466,33467,33468,33471,33472,33474,33475,33477,33478,33481,33488,33494,33497,33498,33501,33506,33511,33512,33513,33514,33516,33517,33518,33520,33522,33523,33525,33526,33528,0,33530,33532,33533,33534,33535,33536,33546,33547,33549,33552,33554,33555,33558,33560,33561,33565,33566,33567,33568,33569,33570,33571,33572,33573,33574,33577,33578,33582,33584,33586,33591,33595,33597,21860,33086,30130,30382,21305,30174,20731,23617,35692,31687,20559,29255,39575,39128,28418,29922,31080,25735,30629,25340,39057,36139,21697,32856,20050,22378,33529,33805,24179,20973,29942,35780,23631,22369,27900,39047,23110,30772,39748,36843,31893,21078,25169,38138,20166,33670,33889,33769,33970,22484,26420,22275,26222,28006,35889,26333,28689,26399,27450,26646,25114,22971,19971,20932,28422,26578,27791,20854,26827,22855,27495,30054,23822,33040,40784,26071,31048,31041,39569,36215,23682,20062,20225,21551,22865,30732,22120,27668,36804,24323,27773,27875,35755,25488,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33598,33599,33601,33602,33604,33605,33608,33610,33611,33612,33613,33614,33619,33621,33622,33623,33624,33625,33629,33634,33648,33649,33650,33651,33652,33653,33654,33657,33658,33662,33663,33664,33665,33666,33667,33668,33671,33672,33674,33675,33676,33677,33679,33680,33681,33684,33685,33686,33687,33689,33690,33693,33695,33697,33698,33699,33700,33701,33702,33703,33708,33709,33710,0,33711,33717,33723,33726,33727,33730,33731,33732,33734,33736,33737,33739,33741,33742,33744,33745,33746,33747,33749,33751,33753,33754,33755,33758,33762,33763,33764,33766,33767,33768,33771,33772,33773,24688,27965,29301,25190,38030,38085,21315,36801,31614,20191,35878,20094,40660,38065,38067,21069,28508,36963,27973,35892,22545,23884,27424,27465,26538,21595,33108,32652,22681,34103,24378,25250,27207,38201,25970,24708,26725,30631,20052,20392,24039,38808,25772,32728,23789,20431,31373,20999,33540,19988,24623,31363,38054,20405,20146,31206,29748,21220,33465,25810,31165,23517,27777,38738,36731,27682,20542,21375,28165,25806,26228,27696,24773,39031,35831,24198,29756,31351,31179,19992,37041,29699,27714,22234,37195,27845,36235,21306,34502,26354,36527,23624,39537,28192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33774,33775,33779,33780,33781,33782,33783,33786,33787,33788,33790,33791,33792,33794,33797,33799,33800,33801,33802,33808,33810,33811,33812,33813,33814,33815,33817,33818,33819,33822,33823,33824,33825,33826,33827,33833,33834,33835,33836,33837,33838,33839,33840,33842,33843,33844,33845,33846,33847,33849,33850,33851,33854,33855,33856,33857,33858,33859,33860,33861,33863,33864,33865,0,33866,33867,33868,33869,33870,33871,33872,33874,33875,33876,33877,33878,33880,33885,33886,33887,33888,33890,33892,33893,33894,33895,33896,33898,33902,33903,33904,33906,33908,33911,33913,33915,33916,21462,23094,40843,36259,21435,22280,39079,26435,37275,27849,20840,30154,25331,29356,21048,21149,32570,28820,30264,21364,40522,27063,30830,38592,35033,32676,28982,29123,20873,26579,29924,22756,25880,22199,35753,39286,25200,32469,24825,28909,22764,20161,20154,24525,38887,20219,35748,20995,22922,32427,25172,20173,26085,25102,33592,33993,33635,34701,29076,28342,23481,32466,20887,25545,26580,32905,33593,34837,20754,23418,22914,36785,20083,27741,20837,35109,36719,38446,34122,29790,38160,38384,28070,33509,24369,25746,27922,33832,33134,40131,22622,36187,19977,21441,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33917,33918,33919,33920,33921,33923,33924,33925,33926,33930,33933,33935,33936,33937,33938,33939,33940,33941,33942,33944,33946,33947,33949,33950,33951,33952,33954,33955,33956,33957,33958,33959,33960,33961,33962,33963,33964,33965,33966,33968,33969,33971,33973,33974,33975,33979,33980,33982,33984,33986,33987,33989,33990,33991,33992,33995,33996,33998,33999,34002,34004,34005,34007,0,34008,34009,34010,34011,34012,34014,34017,34018,34020,34023,34024,34025,34026,34027,34029,34030,34031,34033,34034,34035,34036,34037,34038,34039,34040,34041,34042,34043,34045,34046,34048,34049,34050,20254,25955,26705,21971,20007,25620,39578,25195,23234,29791,33394,28073,26862,20711,33678,30722,26432,21049,27801,32433,20667,21861,29022,31579,26194,29642,33515,26441,23665,21024,29053,34923,38378,38485,25797,36193,33203,21892,27733,25159,32558,22674,20260,21830,36175,26188,19978,23578,35059,26786,25422,31245,28903,33421,21242,38902,23569,21736,37045,32461,22882,36170,34503,33292,33293,36198,25668,23556,24913,28041,31038,35774,30775,30003,21627,20280,36523,28145,23072,32453,31070,27784,23457,23158,29978,32958,24910,28183,22768,29983,29989,29298,21319,32499,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34051,34052,34053,34054,34055,34056,34057,34058,34059,34061,34062,34063,34064,34066,34068,34069,34070,34072,34073,34075,34076,34077,34078,34080,34082,34083,34084,34085,34086,34087,34088,34089,34090,34093,34094,34095,34096,34097,34098,34099,34100,34101,34102,34110,34111,34112,34113,34114,34116,34117,34118,34119,34123,34124,34125,34126,34127,34128,34129,34130,34131,34132,34133,0,34135,34136,34138,34139,34140,34141,34143,34144,34145,34146,34147,34149,34150,34151,34153,34154,34155,34156,34157,34158,34159,34160,34161,34163,34165,34166,34167,34168,34172,34173,34175,34176,34177,30465,30427,21097,32988,22307,24072,22833,29422,26045,28287,35799,23608,34417,21313,30707,25342,26102,20160,39135,34432,23454,35782,21490,30690,20351,23630,39542,22987,24335,31034,22763,19990,26623,20107,25325,35475,36893,21183,26159,21980,22124,36866,20181,20365,37322,39280,27663,24066,24643,23460,35270,35797,25910,25163,39318,23432,23551,25480,21806,21463,30246,20861,34092,26530,26803,27530,25234,36755,21460,33298,28113,30095,20070,36174,23408,29087,34223,26257,26329,32626,34560,40653,40736,23646,26415,36848,26641,26463,25101,31446,22661,24246,25968,28465,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34178,34179,34182,34184,34185,34186,34187,34188,34189,34190,34192,34193,34194,34195,34196,34197,34198,34199,34200,34201,34202,34205,34206,34207,34208,34209,34210,34211,34213,34214,34215,34217,34219,34220,34221,34225,34226,34227,34228,34229,34230,34232,34234,34235,34236,34237,34238,34239,34240,34242,34243,34244,34245,34246,34247,34248,34250,34251,34252,34253,34254,34257,34258,0,34260,34262,34263,34264,34265,34266,34267,34269,34270,34271,34272,34273,34274,34275,34277,34278,34279,34280,34282,34283,34284,34285,34286,34287,34288,34289,34290,34291,34292,34293,34294,34295,34296,24661,21047,32781,25684,34928,29993,24069,26643,25332,38684,21452,29245,35841,27700,30561,31246,21550,30636,39034,33308,35828,30805,26388,28865,26031,25749,22070,24605,31169,21496,19997,27515,32902,23546,21987,22235,20282,20284,39282,24051,26494,32824,24578,39042,36865,23435,35772,35829,25628,33368,25822,22013,33487,37221,20439,32032,36895,31903,20723,22609,28335,23487,35785,32899,37240,33948,31639,34429,38539,38543,32485,39635,30862,23681,31319,36930,38567,31071,23385,25439,31499,34001,26797,21766,32553,29712,32034,38145,25152,22604,20182,23427,22905,22612,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34297,34298,34300,34301,34302,34304,34305,34306,34307,34308,34310,34311,34312,34313,34314,34315,34316,34317,34318,34319,34320,34322,34323,34324,34325,34327,34328,34329,34330,34331,34332,34333,34334,34335,34336,34337,34338,34339,34340,34341,34342,34344,34346,34347,34348,34349,34350,34351,34352,34353,34354,34355,34356,34357,34358,34359,34361,34362,34363,34365,34366,34367,34368,0,34369,34370,34371,34372,34373,34374,34375,34376,34377,34378,34379,34380,34386,34387,34389,34390,34391,34392,34393,34395,34396,34397,34399,34400,34401,34403,34404,34405,34406,34407,34408,34409,34410,29549,25374,36427,36367,32974,33492,25260,21488,27888,37214,22826,24577,27760,22349,25674,36138,30251,28393,22363,27264,30192,28525,35885,35848,22374,27631,34962,30899,25506,21497,28845,27748,22616,25642,22530,26848,33179,21776,31958,20504,36538,28108,36255,28907,25487,28059,28372,32486,33796,26691,36867,28120,38518,35752,22871,29305,34276,33150,30140,35466,26799,21076,36386,38161,25552,39064,36420,21884,20307,26367,22159,24789,28053,21059,23625,22825,28155,22635,30000,29980,24684,33300,33094,25361,26465,36834,30522,36339,36148,38081,24086,21381,21548,28867,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34413,34415,34416,34418,34419,34420,34421,34422,34423,34424,34435,34436,34437,34438,34439,34440,34441,34446,34447,34448,34449,34450,34452,34454,34455,34456,34457,34458,34459,34462,34463,34464,34465,34466,34469,34470,34475,34477,34478,34482,34483,34487,34488,34489,34491,34492,34493,34494,34495,34497,34498,34499,34501,34504,34508,34509,34514,34515,34517,34518,34519,34522,34524,0,34525,34528,34529,34530,34531,34533,34534,34535,34536,34538,34539,34540,34543,34549,34550,34551,34554,34555,34556,34557,34559,34561,34564,34565,34566,34571,34572,34574,34575,34576,34577,34580,34582,27712,24311,20572,20141,24237,25402,33351,36890,26704,37230,30643,21516,38108,24420,31461,26742,25413,31570,32479,30171,20599,25237,22836,36879,20984,31171,31361,22270,24466,36884,28034,23648,22303,21520,20820,28237,22242,25512,39059,33151,34581,35114,36864,21534,23663,33216,25302,25176,33073,40501,38464,39534,39548,26925,22949,25299,21822,25366,21703,34521,27964,23043,29926,34972,27498,22806,35916,24367,28286,29609,39037,20024,28919,23436,30871,25405,26202,30358,24779,23451,23113,19975,33109,27754,29579,20129,26505,32593,24448,26106,26395,24536,22916,23041,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34585,34587,34589,34591,34592,34596,34598,34599,34600,34602,34603,34604,34605,34607,34608,34610,34611,34613,34614,34616,34617,34618,34620,34621,34624,34625,34626,34627,34628,34629,34630,34634,34635,34637,34639,34640,34641,34642,34644,34645,34646,34648,34650,34651,34652,34653,34654,34655,34657,34658,34662,34663,34664,34665,34666,34667,34668,34669,34671,34673,34674,34675,34677,0,34679,34680,34681,34682,34687,34688,34689,34692,34694,34695,34697,34698,34700,34702,34703,34704,34705,34706,34708,34709,34710,34712,34713,34714,34715,34716,34717,34718,34720,34721,34722,34723,34724,24013,24494,21361,38886,36829,26693,22260,21807,24799,20026,28493,32500,33479,33806,22996,20255,20266,23614,32428,26410,34074,21619,30031,32963,21890,39759,20301,28205,35859,23561,24944,21355,30239,28201,34442,25991,38395,32441,21563,31283,32010,38382,21985,32705,29934,25373,34583,28065,31389,25105,26017,21351,25569,27779,24043,21596,38056,20044,27745,35820,23627,26080,33436,26791,21566,21556,27595,27494,20116,25410,21320,33310,20237,20398,22366,25098,38654,26212,29289,21247,21153,24735,35823,26132,29081,26512,35199,30802,30717,26224,22075,21560,38177,29306,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34725,34726,34727,34729,34730,34734,34736,34737,34738,34740,34742,34743,34744,34745,34747,34748,34750,34751,34753,34754,34755,34756,34757,34759,34760,34761,34764,34765,34766,34767,34768,34772,34773,34774,34775,34776,34777,34778,34780,34781,34782,34783,34785,34786,34787,34788,34790,34791,34792,34793,34795,34796,34797,34799,34800,34801,34802,34803,34804,34805,34806,34807,34808,0,34810,34811,34812,34813,34815,34816,34817,34818,34820,34821,34822,34823,34824,34825,34827,34828,34829,34830,34831,34832,34833,34834,34836,34839,34840,34841,34842,34844,34845,34846,34847,34848,34851,31232,24687,24076,24713,33181,22805,24796,29060,28911,28330,27728,29312,27268,34989,24109,20064,23219,21916,38115,27927,31995,38553,25103,32454,30606,34430,21283,38686,36758,26247,23777,20384,29421,19979,21414,22799,21523,25472,38184,20808,20185,40092,32420,21688,36132,34900,33335,38386,28046,24358,23244,26174,38505,29616,29486,21439,33146,39301,32673,23466,38519,38480,32447,30456,21410,38262,39321,31665,35140,28248,20065,32724,31077,35814,24819,21709,20139,39033,24055,27233,20687,21521,35937,33831,30813,38660,21066,21742,22179,38144,28040,23477,28102,26195,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34852,34853,34854,34855,34856,34857,34858,34859,34860,34861,34862,34863,34864,34865,34867,34868,34869,34870,34871,34872,34874,34875,34877,34878,34879,34881,34882,34883,34886,34887,34888,34889,34890,34891,34894,34895,34896,34897,34898,34899,34901,34902,34904,34906,34907,34908,34909,34910,34911,34912,34918,34919,34922,34925,34927,34929,34931,34932,34933,34934,34936,34937,34938,0,34939,34940,34944,34947,34950,34951,34953,34954,34956,34958,34959,34960,34961,34963,34964,34965,34967,34968,34969,34970,34971,34973,34974,34975,34976,34977,34979,34981,34982,34983,34984,34985,34986,23567,23389,26657,32918,21880,31505,25928,26964,20123,27463,34638,38795,21327,25375,25658,37034,26012,32961,35856,20889,26800,21368,34809,25032,27844,27899,35874,23633,34218,33455,38156,27427,36763,26032,24571,24515,20449,34885,26143,33125,29481,24826,20852,21009,22411,24418,37026,34892,37266,24184,26447,24615,22995,20804,20982,33016,21256,27769,38596,29066,20241,20462,32670,26429,21957,38152,31168,34966,32483,22687,25100,38656,34394,22040,39035,24464,35768,33988,37207,21465,26093,24207,30044,24676,32110,23167,32490,32493,36713,21927,23459,24748,26059,29572,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34988,34990,34991,34992,34994,34995,34996,34997,34998,35000,35001,35002,35003,35005,35006,35007,35008,35011,35012,35015,35016,35018,35019,35020,35021,35023,35024,35025,35027,35030,35031,35034,35035,35036,35037,35038,35040,35041,35046,35047,35049,35050,35051,35052,35053,35054,35055,35058,35061,35062,35063,35066,35067,35069,35071,35072,35073,35075,35076,35077,35078,35079,35080,0,35081,35083,35084,35085,35086,35087,35089,35092,35093,35094,35095,35096,35100,35101,35102,35103,35104,35106,35107,35108,35110,35111,35112,35113,35116,35117,35118,35119,35121,35122,35123,35125,35127,36873,30307,30505,32474,38772,34203,23398,31348,38634,34880,21195,29071,24490,26092,35810,23547,39535,24033,27529,27739,35757,35759,36874,36805,21387,25276,40486,40493,21568,20011,33469,29273,34460,23830,34905,28079,38597,21713,20122,35766,28937,21693,38409,28895,28153,30416,20005,30740,34578,23721,24310,35328,39068,38414,28814,27839,22852,25513,30524,34893,28436,33395,22576,29141,21388,30746,38593,21761,24422,28976,23476,35866,39564,27523,22830,40495,31207,26472,25196,20335,30113,32650,27915,38451,27687,20208,30162,20859,26679,28478,36992,33136,22934,29814,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35128,35129,35130,35131,35132,35133,35134,35135,35136,35138,35139,35141,35142,35143,35144,35145,35146,35147,35148,35149,35150,35151,35152,35153,35154,35155,35156,35157,35158,35159,35160,35161,35162,35163,35164,35165,35168,35169,35170,35171,35172,35173,35175,35176,35177,35178,35179,35180,35181,35182,35183,35184,35185,35186,35187,35188,35189,35190,35191,35192,35193,35194,35196,0,35197,35198,35200,35202,35204,35205,35207,35208,35209,35210,35211,35212,35213,35214,35215,35216,35217,35218,35219,35220,35221,35222,35223,35224,35225,35226,35227,35228,35229,35230,35231,35232,35233,25671,23591,36965,31377,35875,23002,21676,33280,33647,35201,32768,26928,22094,32822,29239,37326,20918,20063,39029,25494,19994,21494,26355,33099,22812,28082,19968,22777,21307,25558,38129,20381,20234,34915,39056,22839,36951,31227,20202,33008,30097,27778,23452,23016,24413,26885,34433,20506,24050,20057,30691,20197,33402,25233,26131,37009,23673,20159,24441,33222,36920,32900,30123,20134,35028,24847,27589,24518,20041,30410,28322,35811,35758,35850,35793,24322,32764,32716,32462,33589,33643,22240,27575,38899,38452,23035,21535,38134,28139,23493,39278,23609,24341,38544,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35234,35235,35236,35237,35238,35239,35240,35241,35242,35243,35244,35245,35246,35247,35248,35249,35250,35251,35252,35253,35254,35255,35256,35257,35258,35259,35260,35261,35262,35263,35264,35267,35277,35283,35284,35285,35287,35288,35289,35291,35293,35295,35296,35297,35298,35300,35303,35304,35305,35306,35308,35309,35310,35312,35313,35314,35316,35317,35318,35319,35320,35321,35322,0,35323,35324,35325,35326,35327,35329,35330,35331,35332,35333,35334,35336,35337,35338,35339,35340,35341,35342,35343,35344,35345,35346,35347,35348,35349,35350,35351,35352,35353,35354,35355,35356,35357,21360,33521,27185,23156,40560,24212,32552,33721,33828,33829,33639,34631,36814,36194,30408,24433,39062,30828,26144,21727,25317,20323,33219,30152,24248,38605,36362,34553,21647,27891,28044,27704,24703,21191,29992,24189,20248,24736,24551,23588,30001,37038,38080,29369,27833,28216,37193,26377,21451,21491,20305,37321,35825,21448,24188,36802,28132,20110,30402,27014,34398,24858,33286,20313,20446,36926,40060,24841,28189,28180,38533,20104,23089,38632,19982,23679,31161,23431,35821,32701,29577,22495,33419,37057,21505,36935,21947,23786,24481,24840,27442,29425,32946,35465,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35358,35359,35360,35361,35362,35363,35364,35365,35366,35367,35368,35369,35370,35371,35372,35373,35374,35375,35376,35377,35378,35379,35380,35381,35382,35383,35384,35385,35386,35387,35388,35389,35391,35392,35393,35394,35395,35396,35397,35398,35399,35401,35402,35403,35404,35405,35406,35407,35408,35409,35410,35411,35412,35413,35414,35415,35416,35417,35418,35419,35420,35421,35422,0,35423,35424,35425,35426,35427,35428,35429,35430,35431,35432,35433,35434,35435,35436,35437,35438,35439,35440,35441,35442,35443,35444,35445,35446,35447,35448,35450,35451,35452,35453,35454,35455,35456,28020,23507,35029,39044,35947,39533,40499,28170,20900,20803,22435,34945,21407,25588,36757,22253,21592,22278,29503,28304,32536,36828,33489,24895,24616,38498,26352,32422,36234,36291,38053,23731,31908,26376,24742,38405,32792,20113,37095,21248,38504,20801,36816,34164,37213,26197,38901,23381,21277,30776,26434,26685,21705,28798,23472,36733,20877,22312,21681,25874,26242,36190,36163,33039,33900,36973,31967,20991,34299,26531,26089,28577,34468,36481,22122,36896,30338,28790,29157,36131,25321,21017,27901,36156,24590,22686,24974,26366,36192,25166,21939,28195,26413,36711,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35457,35458,35459,35460,35461,35462,35463,35464,35467,35468,35469,35470,35471,35472,35473,35474,35476,35477,35478,35479,35480,35481,35482,35483,35484,35485,35486,35487,35488,35489,35490,35491,35492,35493,35494,35495,35496,35497,35498,35499,35500,35501,35502,35503,35504,35505,35506,35507,35508,35509,35510,35511,35512,35513,35514,35515,35516,35517,35518,35519,35520,35521,35522,0,35523,35524,35525,35526,35527,35528,35529,35530,35531,35532,35533,35534,35535,35536,35537,35538,35539,35540,35541,35542,35543,35544,35545,35546,35547,35548,35549,35550,35551,35552,35553,35554,35555,38113,38392,30504,26629,27048,21643,20045,28856,35784,25688,25995,23429,31364,20538,23528,30651,27617,35449,31896,27838,30415,26025,36759,23853,23637,34360,26632,21344,25112,31449,28251,32509,27167,31456,24432,28467,24352,25484,28072,26454,19976,24080,36134,20183,32960,30260,38556,25307,26157,25214,27836,36213,29031,32617,20806,32903,21484,36974,25240,21746,34544,36761,32773,38167,34071,36825,27993,29645,26015,30495,29956,30759,33275,36126,38024,20390,26517,30137,35786,38663,25391,38215,38453,33976,25379,30529,24449,29424,20105,24596,25972,25327,27491,25919,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35556,35557,35558,35559,35560,35561,35562,35563,35564,35565,35566,35567,35568,35569,35570,35571,35572,35573,35574,35575,35576,35577,35578,35579,35580,35581,35582,35583,35584,35585,35586,35587,35588,35589,35590,35592,35593,35594,35595,35596,35597,35598,35599,35600,35601,35602,35603,35604,35605,35606,35607,35608,35609,35610,35611,35612,35613,35614,35615,35616,35617,35618,35619,0,35620,35621,35623,35624,35625,35626,35627,35628,35629,35630,35631,35632,35633,35634,35635,35636,35637,35638,35639,35640,35641,35642,35643,35644,35645,35646,35647,35648,35649,35650,35651,35652,35653,24103,30151,37073,35777,33437,26525,25903,21553,34584,30693,32930,33026,27713,20043,32455,32844,30452,26893,27542,25191,20540,20356,22336,25351,27490,36286,21482,26088,32440,24535,25370,25527,33267,33268,32622,24092,23769,21046,26234,31209,31258,36136,28825,30164,28382,27835,31378,20013,30405,24544,38047,34935,32456,31181,32959,37325,20210,20247,33311,21608,24030,27954,35788,31909,36724,32920,24090,21650,30385,23449,26172,39588,29664,26666,34523,26417,29482,35832,35803,36880,31481,28891,29038,25284,30633,22065,20027,33879,26609,21161,34496,36142,38136,31569,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35654,35655,35656,35657,35658,35659,35660,35661,35662,35663,35664,35665,35666,35667,35668,35669,35670,35671,35672,35673,35674,35675,35676,35677,35678,35679,35680,35681,35682,35683,35684,35685,35687,35688,35689,35690,35691,35693,35694,35695,35696,35697,35698,35699,35700,35701,35702,35703,35704,35705,35706,35707,35708,35709,35710,35711,35712,35713,35714,35715,35716,35717,35718,0,35719,35720,35721,35722,35723,35724,35725,35726,35727,35728,35729,35730,35731,35732,35733,35734,35735,35736,35737,35738,35739,35740,35741,35742,35743,35756,35761,35771,35783,35792,35818,35849,35870,20303,27880,31069,39547,25235,29226,25341,19987,30742,36716,25776,36186,31686,26729,24196,35013,22918,25758,22766,29366,26894,38181,36861,36184,22368,32512,35846,20934,25417,25305,21331,26700,29730,33537,37196,21828,30528,28796,27978,20857,21672,36164,23039,28363,28100,23388,32043,20180,31869,28371,23376,33258,28173,23383,39683,26837,36394,23447,32508,24635,32437,37049,36208,22863,25549,31199,36275,21330,26063,31062,35781,38459,32452,38075,32386,22068,37257,26368,32618,23562,36981,26152,24038,20304,26590,20570,20316,22352,24231,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,35896,35897,35898,35899,35900,35901,35902,35903,35904,35906,35907,35908,35909,35912,35914,35915,35917,35918,35919,35920,35921,35922,35923,35924,35926,35927,35928,35929,35931,35932,35933,35934,35935,35936,35939,35940,35941,35942,35943,35944,35945,35948,35949,35950,35951,35952,35953,35954,35956,35957,35958,35959,35963,35964,35965,35966,35967,35968,35969,35971,35972,35974,35975,0,35976,35979,35981,35982,35983,35984,35985,35986,35987,35989,35990,35991,35993,35994,35995,35996,35997,35998,35999,36000,36001,36002,36003,36004,36005,36006,36007,36008,36009,36010,36011,36012,36013,20109,19980,20800,19984,24319,21317,19989,20120,19998,39730,23404,22121,20008,31162,20031,21269,20039,22829,29243,21358,27664,22239,32996,39319,27603,30590,40727,20022,20127,40720,20060,20073,20115,33416,23387,21868,22031,20164,21389,21405,21411,21413,21422,38757,36189,21274,21493,21286,21294,21310,36188,21350,21347,20994,21000,21006,21037,21043,21055,21056,21068,21086,21089,21084,33967,21117,21122,21121,21136,21139,20866,32596,20155,20163,20169,20162,20200,20193,20203,20190,20251,20211,20258,20324,20213,20261,20263,20233,20267,20318,20327,25912,20314,20317,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36014,36015,36016,36017,36018,36019,36020,36021,36022,36023,36024,36025,36026,36027,36028,36029,36030,36031,36032,36033,36034,36035,36036,36037,36038,36039,36040,36041,36042,36043,36044,36045,36046,36047,36048,36049,36050,36051,36052,36053,36054,36055,36056,36057,36058,36059,36060,36061,36062,36063,36064,36065,36066,36067,36068,36069,36070,36071,36072,36073,36074,36075,36076,0,36077,36078,36079,36080,36081,36082,36083,36084,36085,36086,36087,36088,36089,36090,36091,36092,36093,36094,36095,36096,36097,36098,36099,36100,36101,36102,36103,36104,36105,36106,36107,36108,36109,20319,20311,20274,20285,20342,20340,20369,20361,20355,20367,20350,20347,20394,20348,20396,20372,20454,20456,20458,20421,20442,20451,20444,20433,20447,20472,20521,20556,20467,20524,20495,20526,20525,20478,20508,20492,20517,20520,20606,20547,20565,20552,20558,20588,20603,20645,20647,20649,20666,20694,20742,20717,20716,20710,20718,20743,20747,20189,27709,20312,20325,20430,40864,27718,31860,20846,24061,40649,39320,20865,22804,21241,21261,35335,21264,20971,22809,20821,20128,20822,20147,34926,34980,20149,33044,35026,31104,23348,34819,32696,20907,20913,20925,20924,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36110,36111,36112,36113,36114,36115,36116,36117,36118,36119,36120,36121,36122,36123,36124,36128,36177,36178,36183,36191,36197,36200,36201,36202,36204,36206,36207,36209,36210,36216,36217,36218,36219,36220,36221,36222,36223,36224,36226,36227,36230,36231,36232,36233,36236,36237,36238,36239,36240,36242,36243,36245,36246,36247,36248,36249,36250,36251,36252,36253,36254,36256,36257,0,36258,36260,36261,36262,36263,36264,36265,36266,36267,36268,36269,36270,36271,36272,36274,36278,36279,36281,36283,36285,36288,36289,36290,36293,36295,36296,36297,36298,36301,36304,36306,36307,36308,20935,20886,20898,20901,35744,35750,35751,35754,35764,35765,35767,35778,35779,35787,35791,35790,35794,35795,35796,35798,35800,35801,35804,35807,35808,35812,35816,35817,35822,35824,35827,35830,35833,35836,35839,35840,35842,35844,35847,35852,35855,35857,35858,35860,35861,35862,35865,35867,35864,35869,35871,35872,35873,35877,35879,35882,35883,35886,35887,35890,35891,35893,35894,21353,21370,38429,38434,38433,38449,38442,38461,38460,38466,38473,38484,38495,38503,38508,38514,38516,38536,38541,38551,38576,37015,37019,37021,37017,37036,37025,37044,37043,37046,37050,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36309,36312,36313,36316,36320,36321,36322,36325,36326,36327,36329,36333,36334,36336,36337,36338,36340,36342,36348,36350,36351,36352,36353,36354,36355,36356,36358,36359,36360,36363,36365,36366,36368,36369,36370,36371,36373,36374,36375,36376,36377,36378,36379,36380,36384,36385,36388,36389,36390,36391,36392,36395,36397,36400,36402,36403,36404,36406,36407,36408,36411,36412,36414,0,36415,36419,36421,36422,36428,36429,36430,36431,36432,36435,36436,36437,36438,36439,36440,36442,36443,36444,36445,36446,36447,36448,36449,36450,36451,36452,36453,36455,36456,36458,36459,36462,36465,37048,37040,37071,37061,37054,37072,37060,37063,37075,37094,37090,37084,37079,37083,37099,37103,37118,37124,37154,37150,37155,37169,37167,37177,37187,37190,21005,22850,21154,21164,21165,21182,21759,21200,21206,21232,21471,29166,30669,24308,20981,20988,39727,21430,24321,30042,24047,22348,22441,22433,22654,22716,22725,22737,22313,22316,22314,22323,22329,22318,22319,22364,22331,22338,22377,22405,22379,22406,22396,22395,22376,22381,22390,22387,22445,22436,22412,22450,22479,22439,22452,22419,22432,22485,22488,22490,22489,22482,22456,22516,22511,22520,22500,22493,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36467,36469,36471,36472,36473,36474,36475,36477,36478,36480,36482,36483,36484,36486,36488,36489,36490,36491,36492,36493,36494,36497,36498,36499,36501,36502,36503,36504,36505,36506,36507,36509,36511,36512,36513,36514,36515,36516,36517,36518,36519,36520,36521,36522,36525,36526,36528,36529,36531,36532,36533,36534,36535,36536,36537,36539,36540,36541,36542,36543,36544,36545,36546,0,36547,36548,36549,36550,36551,36552,36553,36554,36555,36556,36557,36559,36560,36561,36562,36563,36564,36565,36566,36567,36568,36569,36570,36571,36572,36573,36574,36575,36576,36577,36578,36579,36580,22539,22541,22525,22509,22528,22558,22553,22596,22560,22629,22636,22657,22665,22682,22656,39336,40729,25087,33401,33405,33407,33423,33418,33448,33412,33422,33425,33431,33433,33451,33464,33470,33456,33480,33482,33507,33432,33463,33454,33483,33484,33473,33449,33460,33441,33450,33439,33476,33486,33444,33505,33545,33527,33508,33551,33543,33500,33524,33490,33496,33548,33531,33491,33553,33562,33542,33556,33557,33504,33493,33564,33617,33627,33628,33544,33682,33596,33588,33585,33691,33630,33583,33615,33607,33603,33631,33600,33559,33632,33581,33594,33587,33638,33637,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36581,36582,36583,36584,36585,36586,36587,36588,36589,36590,36591,36592,36593,36594,36595,36596,36597,36598,36599,36600,36601,36602,36603,36604,36605,36606,36607,36608,36609,36610,36611,36612,36613,36614,36615,36616,36617,36618,36619,36620,36621,36622,36623,36624,36625,36626,36627,36628,36629,36630,36631,36632,36633,36634,36635,36636,36637,36638,36639,36640,36641,36642,36643,0,36644,36645,36646,36647,36648,36649,36650,36651,36652,36653,36654,36655,36656,36657,36658,36659,36660,36661,36662,36663,36664,36665,36666,36667,36668,36669,36670,36671,36672,36673,36674,36675,36676,33640,33563,33641,33644,33642,33645,33646,33712,33656,33715,33716,33696,33706,33683,33692,33669,33660,33718,33705,33661,33720,33659,33688,33694,33704,33722,33724,33729,33793,33765,33752,22535,33816,33803,33757,33789,33750,33820,33848,33809,33798,33748,33759,33807,33795,33784,33785,33770,33733,33728,33830,33776,33761,33884,33873,33882,33881,33907,33927,33928,33914,33929,33912,33852,33862,33897,33910,33932,33934,33841,33901,33985,33997,34000,34022,33981,34003,33994,33983,33978,34016,33953,33977,33972,33943,34021,34019,34060,29965,34104,34032,34105,34079,34106,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36677,36678,36679,36680,36681,36682,36683,36684,36685,36686,36687,36688,36689,36690,36691,36692,36693,36694,36695,36696,36697,36698,36699,36700,36701,36702,36703,36704,36705,36706,36707,36708,36709,36714,36736,36748,36754,36765,36768,36769,36770,36772,36773,36774,36775,36778,36780,36781,36782,36783,36786,36787,36788,36789,36791,36792,36794,36795,36796,36799,36800,36803,36806,0,36809,36810,36811,36812,36813,36815,36818,36822,36823,36826,36832,36833,36835,36839,36844,36847,36849,36850,36852,36853,36854,36858,36859,36860,36862,36863,36871,36872,36876,36878,36883,36885,36888,34134,34107,34047,34044,34137,34120,34152,34148,34142,34170,30626,34115,34162,34171,34212,34216,34183,34191,34169,34222,34204,34181,34233,34231,34224,34259,34241,34268,34303,34343,34309,34345,34326,34364,24318,24328,22844,22849,32823,22869,22874,22872,21263,23586,23589,23596,23604,25164,25194,25247,25275,25290,25306,25303,25326,25378,25334,25401,25419,25411,25517,25590,25457,25466,25486,25524,25453,25516,25482,25449,25518,25532,25586,25592,25568,25599,25540,25566,25550,25682,25542,25534,25669,25665,25611,25627,25632,25612,25638,25633,25694,25732,25709,25750,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36889,36892,36899,36900,36901,36903,36904,36905,36906,36907,36908,36912,36913,36914,36915,36916,36919,36921,36922,36925,36927,36928,36931,36933,36934,36936,36937,36938,36939,36940,36942,36948,36949,36950,36953,36954,36956,36957,36958,36959,36960,36961,36964,36966,36967,36969,36970,36971,36972,36975,36976,36977,36978,36979,36982,36983,36984,36985,36986,36987,36988,36990,36993,0,36996,36997,36998,36999,37001,37002,37004,37005,37006,37007,37008,37010,37012,37014,37016,37018,37020,37022,37023,37024,37028,37029,37031,37032,37033,37035,37037,37042,37047,37052,37053,37055,37056,25722,25783,25784,25753,25786,25792,25808,25815,25828,25826,25865,25893,25902,24331,24530,29977,24337,21343,21489,21501,21481,21480,21499,21522,21526,21510,21579,21586,21587,21588,21590,21571,21537,21591,21593,21539,21554,21634,21652,21623,21617,21604,21658,21659,21636,21622,21606,21661,21712,21677,21698,21684,21714,21671,21670,21715,21716,21618,21667,21717,21691,21695,21708,21721,21722,21724,21673,21674,21668,21725,21711,21726,21787,21735,21792,21757,21780,21747,21794,21795,21775,21777,21799,21802,21863,21903,21941,21833,21869,21825,21845,21823,21840,21820,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37058,37059,37062,37064,37065,37067,37068,37069,37074,37076,37077,37078,37080,37081,37082,37086,37087,37088,37091,37092,37093,37097,37098,37100,37102,37104,37105,37106,37107,37109,37110,37111,37113,37114,37115,37116,37119,37120,37121,37123,37125,37126,37127,37128,37129,37130,37131,37132,37133,37134,37135,37136,37137,37138,37139,37140,37141,37142,37143,37144,37146,37147,37148,0,37149,37151,37152,37153,37156,37157,37158,37159,37160,37161,37162,37163,37164,37165,37166,37168,37170,37171,37172,37173,37174,37175,37176,37178,37179,37180,37181,37182,37183,37184,37185,37186,37188,21815,21846,21877,21878,21879,21811,21808,21852,21899,21970,21891,21937,21945,21896,21889,21919,21886,21974,21905,21883,21983,21949,21950,21908,21913,21994,22007,21961,22047,21969,21995,21996,21972,21990,21981,21956,21999,21989,22002,22003,21964,21965,21992,22005,21988,36756,22046,22024,22028,22017,22052,22051,22014,22016,22055,22061,22104,22073,22103,22060,22093,22114,22105,22108,22092,22100,22150,22116,22129,22123,22139,22140,22149,22163,22191,22228,22231,22237,22241,22261,22251,22265,22271,22276,22282,22281,22300,24079,24089,24084,24081,24113,24123,24124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37189,37191,37192,37201,37203,37204,37205,37206,37208,37209,37211,37212,37215,37216,37222,37223,37224,37227,37229,37235,37242,37243,37244,37248,37249,37250,37251,37252,37254,37256,37258,37262,37263,37267,37268,37269,37270,37271,37272,37273,37276,37277,37278,37279,37280,37281,37284,37285,37286,37287,37288,37289,37291,37292,37296,37297,37298,37299,37302,37303,37304,37305,37307,0,37308,37309,37310,37311,37312,37313,37314,37315,37316,37317,37318,37320,37323,37328,37330,37331,37332,37333,37334,37335,37336,37337,37338,37339,37341,37342,37343,37344,37345,37346,37347,37348,37349,24119,24132,24148,24155,24158,24161,23692,23674,23693,23696,23702,23688,23704,23705,23697,23706,23708,23733,23714,23741,23724,23723,23729,23715,23745,23735,23748,23762,23780,23755,23781,23810,23811,23847,23846,23854,23844,23838,23814,23835,23896,23870,23860,23869,23916,23899,23919,23901,23915,23883,23882,23913,23924,23938,23961,23965,35955,23991,24005,24435,24439,24450,24455,24457,24460,24469,24473,24476,24488,24493,24501,24508,34914,24417,29357,29360,29364,29367,29368,29379,29377,29390,29389,29394,29416,29423,29417,29426,29428,29431,29441,29427,29443,29434,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37350,37351,37352,37353,37354,37355,37356,37357,37358,37359,37360,37361,37362,37363,37364,37365,37366,37367,37368,37369,37370,37371,37372,37373,37374,37375,37376,37377,37378,37379,37380,37381,37382,37383,37384,37385,37386,37387,37388,37389,37390,37391,37392,37393,37394,37395,37396,37397,37398,37399,37400,37401,37402,37403,37404,37405,37406,37407,37408,37409,37410,37411,37412,0,37413,37414,37415,37416,37417,37418,37419,37420,37421,37422,37423,37424,37425,37426,37427,37428,37429,37430,37431,37432,37433,37434,37435,37436,37437,37438,37439,37440,37441,37442,37443,37444,37445,29435,29463,29459,29473,29450,29470,29469,29461,29474,29497,29477,29484,29496,29489,29520,29517,29527,29536,29548,29551,29566,33307,22821,39143,22820,22786,39267,39271,39272,39273,39274,39275,39276,39284,39287,39293,39296,39300,39303,39306,39309,39312,39313,39315,39316,39317,24192,24209,24203,24214,24229,24224,24249,24245,24254,24243,36179,24274,24273,24283,24296,24298,33210,24516,24521,24534,24527,24579,24558,24580,24545,24548,24574,24581,24582,24554,24557,24568,24601,24629,24614,24603,24591,24589,24617,24619,24586,24639,24609,24696,24697,24699,24698,24642,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37446,37447,37448,37449,37450,37451,37452,37453,37454,37455,37456,37457,37458,37459,37460,37461,37462,37463,37464,37465,37466,37467,37468,37469,37470,37471,37472,37473,37474,37475,37476,37477,37478,37479,37480,37481,37482,37483,37484,37485,37486,37487,37488,37489,37490,37491,37493,37494,37495,37496,37497,37498,37499,37500,37501,37502,37503,37504,37505,37506,37507,37508,37509,0,37510,37511,37512,37513,37514,37515,37516,37517,37519,37520,37521,37522,37523,37524,37525,37526,37527,37528,37529,37530,37531,37532,37533,37534,37535,37536,37537,37538,37539,37540,37541,37542,37543,24682,24701,24726,24730,24749,24733,24707,24722,24716,24731,24812,24763,24753,24797,24792,24774,24794,24756,24864,24870,24853,24867,24820,24832,24846,24875,24906,24949,25004,24980,24999,25015,25044,25077,24541,38579,38377,38379,38385,38387,38389,38390,38396,38398,38403,38404,38406,38408,38410,38411,38412,38413,38415,38418,38421,38422,38423,38425,38426,20012,29247,25109,27701,27732,27740,27722,27811,27781,27792,27796,27788,27752,27753,27764,27766,27782,27817,27856,27860,27821,27895,27896,27889,27863,27826,27872,27862,27898,27883,27886,27825,27859,27887,27902,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37544,37545,37546,37547,37548,37549,37551,37552,37553,37554,37555,37556,37557,37558,37559,37560,37561,37562,37563,37564,37565,37566,37567,37568,37569,37570,37571,37572,37573,37574,37575,37577,37578,37579,37580,37581,37582,37583,37584,37585,37586,37587,37588,37589,37590,37591,37592,37593,37594,37595,37596,37597,37598,37599,37600,37601,37602,37603,37604,37605,37606,37607,37608,0,37609,37610,37611,37612,37613,37614,37615,37616,37617,37618,37619,37620,37621,37622,37623,37624,37625,37626,37627,37628,37629,37630,37631,37632,37633,37634,37635,37636,37637,37638,37639,37640,37641,27961,27943,27916,27971,27976,27911,27908,27929,27918,27947,27981,27950,27957,27930,27983,27986,27988,27955,28049,28015,28062,28064,27998,28051,28052,27996,28000,28028,28003,28186,28103,28101,28126,28174,28095,28128,28177,28134,28125,28121,28182,28075,28172,28078,28203,28270,28238,28267,28338,28255,28294,28243,28244,28210,28197,28228,28383,28337,28312,28384,28461,28386,28325,28327,28349,28347,28343,28375,28340,28367,28303,28354,28319,28514,28486,28487,28452,28437,28409,28463,28470,28491,28532,28458,28425,28457,28553,28557,28556,28536,28530,28540,28538,28625,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37642,37643,37644,37645,37646,37647,37648,37649,37650,37651,37652,37653,37654,37655,37656,37657,37658,37659,37660,37661,37662,37663,37664,37665,37666,37667,37668,37669,37670,37671,37672,37673,37674,37675,37676,37677,37678,37679,37680,37681,37682,37683,37684,37685,37686,37687,37688,37689,37690,37691,37692,37693,37695,37696,37697,37698,37699,37700,37701,37702,37703,37704,37705,0,37706,37707,37708,37709,37710,37711,37712,37713,37714,37715,37716,37717,37718,37719,37720,37721,37722,37723,37724,37725,37726,37727,37728,37729,37730,37731,37732,37733,37734,37735,37736,37737,37739,28617,28583,28601,28598,28610,28641,28654,28638,28640,28655,28698,28707,28699,28729,28725,28751,28766,23424,23428,23445,23443,23461,23480,29999,39582,25652,23524,23534,35120,23536,36423,35591,36790,36819,36821,36837,36846,36836,36841,36838,36851,36840,36869,36868,36875,36902,36881,36877,36886,36897,36917,36918,36909,36911,36932,36945,36946,36944,36968,36952,36962,36955,26297,36980,36989,36994,37000,36995,37003,24400,24407,24406,24408,23611,21675,23632,23641,23409,23651,23654,32700,24362,24361,24365,33396,24380,39739,23662,22913,22915,22925,22953,22954,22947,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37740,37741,37742,37743,37744,37745,37746,37747,37748,37749,37750,37751,37752,37753,37754,37755,37756,37757,37758,37759,37760,37761,37762,37763,37764,37765,37766,37767,37768,37769,37770,37771,37772,37773,37774,37776,37777,37778,37779,37780,37781,37782,37783,37784,37785,37786,37787,37788,37789,37790,37791,37792,37793,37794,37795,37796,37797,37798,37799,37800,37801,37802,37803,0,37804,37805,37806,37807,37808,37809,37810,37811,37812,37813,37814,37815,37816,37817,37818,37819,37820,37821,37822,37823,37824,37825,37826,37827,37828,37829,37830,37831,37832,37833,37835,37836,37837,22935,22986,22955,22942,22948,22994,22962,22959,22999,22974,23045,23046,23005,23048,23011,23000,23033,23052,23049,23090,23092,23057,23075,23059,23104,23143,23114,23125,23100,23138,23157,33004,23210,23195,23159,23162,23230,23275,23218,23250,23252,23224,23264,23267,23281,23254,23270,23256,23260,23305,23319,23318,23346,23351,23360,23573,23580,23386,23397,23411,23377,23379,23394,39541,39543,39544,39546,39551,39549,39552,39553,39557,39560,39562,39568,39570,39571,39574,39576,39579,39580,39581,39583,39584,39586,39587,39589,39591,32415,32417,32419,32421,32424,32425,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37838,37839,37840,37841,37842,37843,37844,37845,37847,37848,37849,37850,37851,37852,37853,37854,37855,37856,37857,37858,37859,37860,37861,37862,37863,37864,37865,37866,37867,37868,37869,37870,37871,37872,37873,37874,37875,37876,37877,37878,37879,37880,37881,37882,37883,37884,37885,37886,37887,37888,37889,37890,37891,37892,37893,37894,37895,37896,37897,37898,37899,37900,37901,0,37902,37903,37904,37905,37906,37907,37908,37909,37910,37911,37912,37913,37914,37915,37916,37917,37918,37919,37920,37921,37922,37923,37924,37925,37926,37927,37928,37929,37930,37931,37932,37933,37934,32429,32432,32446,32448,32449,32450,32457,32459,32460,32464,32468,32471,32475,32480,32481,32488,32491,32494,32495,32497,32498,32525,32502,32506,32507,32510,32513,32514,32515,32519,32520,32523,32524,32527,32529,32530,32535,32537,32540,32539,32543,32545,32546,32547,32548,32549,32550,32551,32554,32555,32556,32557,32559,32560,32561,32562,32563,32565,24186,30079,24027,30014,37013,29582,29585,29614,29602,29599,29647,29634,29649,29623,29619,29632,29641,29640,29669,29657,39036,29706,29673,29671,29662,29626,29682,29711,29738,29787,29734,29733,29736,29744,29742,29740,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37935,37936,37937,37938,37939,37940,37941,37942,37943,37944,37945,37946,37947,37948,37949,37951,37952,37953,37954,37955,37956,37957,37958,37959,37960,37961,37962,37963,37964,37965,37966,37967,37968,37969,37970,37971,37972,37973,37974,37975,37976,37977,37978,37979,37980,37981,37982,37983,37984,37985,37986,37987,37988,37989,37990,37991,37992,37993,37994,37996,37997,37998,37999,0,38000,38001,38002,38003,38004,38005,38006,38007,38008,38009,38010,38011,38012,38013,38014,38015,38016,38017,38018,38019,38020,38033,38038,38040,38087,38095,38099,38100,38106,38118,38139,38172,38176,29723,29722,29761,29788,29783,29781,29785,29815,29805,29822,29852,29838,29824,29825,29831,29835,29854,29864,29865,29840,29863,29906,29882,38890,38891,38892,26444,26451,26462,26440,26473,26533,26503,26474,26483,26520,26535,26485,26536,26526,26541,26507,26487,26492,26608,26633,26584,26634,26601,26544,26636,26585,26549,26586,26547,26589,26624,26563,26552,26594,26638,26561,26621,26674,26675,26720,26721,26702,26722,26692,26724,26755,26653,26709,26726,26689,26727,26688,26686,26698,26697,26665,26805,26767,26740,26743,26771,26731,26818,26990,26876,26911,26912,26873,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38183,38195,38205,38211,38216,38219,38229,38234,38240,38254,38260,38261,38263,38264,38265,38266,38267,38268,38269,38270,38272,38273,38274,38275,38276,38277,38278,38279,38280,38281,38282,38283,38284,38285,38286,38287,38288,38289,38290,38291,38292,38293,38294,38295,38296,38297,38298,38299,38300,38301,38302,38303,38304,38305,38306,38307,38308,38309,38310,38311,38312,38313,38314,0,38315,38316,38317,38318,38319,38320,38321,38322,38323,38324,38325,38326,38327,38328,38329,38330,38331,38332,38333,38334,38335,38336,38337,38338,38339,38340,38341,38342,38343,38344,38345,38346,38347,26916,26864,26891,26881,26967,26851,26896,26993,26937,26976,26946,26973,27012,26987,27008,27032,27000,26932,27084,27015,27016,27086,27017,26982,26979,27001,27035,27047,27067,27051,27053,27092,27057,27073,27082,27103,27029,27104,27021,27135,27183,27117,27159,27160,27237,27122,27204,27198,27296,27216,27227,27189,27278,27257,27197,27176,27224,27260,27281,27280,27305,27287,27307,29495,29522,27521,27522,27527,27524,27538,27539,27533,27546,27547,27553,27562,36715,36717,36721,36722,36723,36725,36726,36728,36727,36729,36730,36732,36734,36737,36738,36740,36743,36747,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38348,38349,38350,38351,38352,38353,38354,38355,38356,38357,38358,38359,38360,38361,38362,38363,38364,38365,38366,38367,38368,38369,38370,38371,38372,38373,38374,38375,38380,38399,38407,38419,38424,38427,38430,38432,38435,38436,38437,38438,38439,38440,38441,38443,38444,38445,38447,38448,38455,38456,38457,38458,38462,38465,38467,38474,38478,38479,38481,38482,38483,38486,38487,0,38488,38489,38490,38492,38493,38494,38496,38499,38501,38502,38507,38509,38510,38511,38512,38513,38515,38520,38521,38522,38523,38524,38525,38526,38527,38528,38529,38530,38531,38532,38535,38537,38538,36749,36750,36751,36760,36762,36558,25099,25111,25115,25119,25122,25121,25125,25124,25132,33255,29935,29940,29951,29967,29969,29971,25908,26094,26095,26096,26122,26137,26482,26115,26133,26112,28805,26359,26141,26164,26161,26166,26165,32774,26207,26196,26177,26191,26198,26209,26199,26231,26244,26252,26279,26269,26302,26331,26332,26342,26345,36146,36147,36150,36155,36157,36160,36165,36166,36168,36169,36167,36173,36181,36185,35271,35274,35275,35276,35278,35279,35280,35281,29294,29343,29277,29286,29295,29310,29311,29316,29323,29325,29327,29330,25352,25394,25520,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38540,38542,38545,38546,38547,38549,38550,38554,38555,38557,38558,38559,38560,38561,38562,38563,38564,38565,38566,38568,38569,38570,38571,38572,38573,38574,38575,38577,38578,38580,38581,38583,38584,38586,38587,38591,38594,38595,38600,38602,38603,38608,38609,38611,38612,38614,38615,38616,38617,38618,38619,38620,38621,38622,38623,38625,38626,38627,38628,38629,38630,38631,38635,0,38636,38637,38638,38640,38641,38642,38644,38645,38648,38650,38651,38652,38653,38655,38658,38659,38661,38666,38667,38668,38672,38673,38674,38676,38677,38679,38680,38681,38682,38683,38685,38687,38688,25663,25816,32772,27626,27635,27645,27637,27641,27653,27655,27654,27661,27669,27672,27673,27674,27681,27689,27684,27690,27698,25909,25941,25963,29261,29266,29270,29232,34402,21014,32927,32924,32915,32956,26378,32957,32945,32939,32941,32948,32951,32999,33000,33001,33002,32987,32962,32964,32985,32973,32983,26384,32989,33003,33009,33012,33005,33037,33038,33010,33020,26389,33042,35930,33078,33054,33068,33048,33074,33096,33100,33107,33140,33113,33114,33137,33120,33129,33148,33149,33133,33127,22605,23221,33160,33154,33169,28373,33187,33194,33228,26406,33226,33211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38689,38690,38691,38692,38693,38694,38695,38696,38697,38699,38700,38702,38703,38705,38707,38708,38709,38710,38711,38714,38715,38716,38717,38719,38720,38721,38722,38723,38724,38725,38726,38727,38728,38729,38730,38731,38732,38733,38734,38735,38736,38737,38740,38741,38743,38744,38746,38748,38749,38751,38755,38756,38758,38759,38760,38762,38763,38764,38765,38766,38767,38768,38769,0,38770,38773,38775,38776,38777,38778,38779,38781,38782,38783,38784,38785,38786,38787,38788,38790,38791,38792,38793,38794,38796,38798,38799,38800,38803,38805,38806,38807,38809,38810,38811,38812,38813,33217,33190,27428,27447,27449,27459,27462,27481,39121,39122,39123,39125,39129,39130,27571,24384,27586,35315,26000,40785,26003,26044,26054,26052,26051,26060,26062,26066,26070,28800,28828,28822,28829,28859,28864,28855,28843,28849,28904,28874,28944,28947,28950,28975,28977,29043,29020,29032,28997,29042,29002,29048,29050,29080,29107,29109,29096,29088,29152,29140,29159,29177,29213,29224,28780,28952,29030,29113,25150,25149,25155,25160,25161,31035,31040,31046,31049,31067,31068,31059,31066,31074,31063,31072,31087,31079,31098,31109,31114,31130,31143,31155,24529,24528,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38814,38815,38817,38818,38820,38821,38822,38823,38824,38825,38826,38828,38830,38832,38833,38835,38837,38838,38839,38840,38841,38842,38843,38844,38845,38846,38847,38848,38849,38850,38851,38852,38853,38854,38855,38856,38857,38858,38859,38860,38861,38862,38863,38864,38865,38866,38867,38868,38869,38870,38871,38872,38873,38874,38875,38876,38877,38878,38879,38880,38881,38882,38883,0,38884,38885,38888,38894,38895,38896,38897,38898,38900,38903,38904,38905,38906,38907,38908,38909,38910,38911,38912,38913,38914,38915,38916,38917,38918,38919,38920,38921,38922,38923,38924,38925,38926,24636,24669,24666,24679,24641,24665,24675,24747,24838,24845,24925,25001,24989,25035,25041,25094,32896,32895,27795,27894,28156,30710,30712,30720,30729,30743,30744,30737,26027,30765,30748,30749,30777,30778,30779,30751,30780,30757,30764,30755,30761,30798,30829,30806,30807,30758,30800,30791,30796,30826,30875,30867,30874,30855,30876,30881,30883,30898,30905,30885,30932,30937,30921,30956,30962,30981,30964,30995,31012,31006,31028,40859,40697,40699,40700,30449,30468,30477,30457,30471,30472,30490,30498,30489,30509,30502,30517,30520,30544,30545,30535,30531,30554,30568,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,38927,38928,38929,38930,38931,38932,38933,38934,38935,38936,38937,38938,38939,38940,38941,38942,38943,38944,38945,38946,38947,38948,38949,38950,38951,38952,38953,38954,38955,38956,38957,38958,38959,38960,38961,38962,38963,38964,38965,38966,38967,38968,38969,38970,38971,38972,38973,38974,38975,38976,38977,38978,38979,38980,38981,38982,38983,38984,38985,38986,38987,38988,38989,0,38990,38991,38992,38993,38994,38995,38996,38997,38998,38999,39000,39001,39002,39003,39004,39005,39006,39007,39008,39009,39010,39011,39012,39013,39014,39015,39016,39017,39018,39019,39020,39021,39022,30562,30565,30591,30605,30589,30592,30604,30609,30623,30624,30640,30645,30653,30010,30016,30030,30027,30024,30043,30066,30073,30083,32600,32609,32607,35400,32616,32628,32625,32633,32641,32638,30413,30437,34866,38021,38022,38023,38027,38026,38028,38029,38031,38032,38036,38039,38037,38042,38043,38044,38051,38052,38059,38058,38061,38060,38063,38064,38066,38068,38070,38071,38072,38073,38074,38076,38077,38079,38084,38088,38089,38090,38091,38092,38093,38094,38096,38097,38098,38101,38102,38103,38105,38104,38107,38110,38111,38112,38114,38116,38117,38119,38120,38122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39023,39024,39025,39026,39027,39028,39051,39054,39058,39061,39065,39075,39080,39081,39082,39083,39084,39085,39086,39087,39088,39089,39090,39091,39092,39093,39094,39095,39096,39097,39098,39099,39100,39101,39102,39103,39104,39105,39106,39107,39108,39109,39110,39111,39112,39113,39114,39115,39116,39117,39119,39120,39124,39126,39127,39131,39132,39133,39136,39137,39138,39139,39140,0,39141,39142,39145,39146,39147,39148,39149,39150,39151,39152,39153,39154,39155,39156,39157,39158,39159,39160,39161,39162,39163,39164,39165,39166,39167,39168,39169,39170,39171,39172,39173,39174,39175,38121,38123,38126,38127,38131,38132,38133,38135,38137,38140,38141,38143,38147,38146,38150,38151,38153,38154,38157,38158,38159,38162,38163,38164,38165,38166,38168,38171,38173,38174,38175,38178,38186,38187,38185,38188,38193,38194,38196,38198,38199,38200,38204,38206,38207,38210,38197,38212,38213,38214,38217,38220,38222,38223,38226,38227,38228,38230,38231,38232,38233,38235,38238,38239,38237,38241,38242,38244,38245,38246,38247,38248,38249,38250,38251,38252,38255,38257,38258,38259,38202,30695,30700,38601,31189,31213,31203,31211,31238,23879,31235,31234,31262,31252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39176,39177,39178,39179,39180,39182,39183,39185,39186,39187,39188,39189,39190,39191,39192,39193,39194,39195,39196,39197,39198,39199,39200,39201,39202,39203,39204,39205,39206,39207,39208,39209,39210,39211,39212,39213,39215,39216,39217,39218,39219,39220,39221,39222,39223,39224,39225,39226,39227,39228,39229,39230,39231,39232,39233,39234,39235,39236,39237,39238,39239,39240,39241,0,39242,39243,39244,39245,39246,39247,39248,39249,39250,39251,39254,39255,39256,39257,39258,39259,39260,39261,39262,39263,39264,39265,39266,39268,39270,39283,39288,39289,39291,39294,39298,39299,39305,31289,31287,31313,40655,39333,31344,30344,30350,30355,30361,30372,29918,29920,29996,40480,40482,40488,40489,40490,40491,40492,40498,40497,40502,40504,40503,40505,40506,40510,40513,40514,40516,40518,40519,40520,40521,40523,40524,40526,40529,40533,40535,40538,40539,40540,40542,40547,40550,40551,40552,40553,40554,40555,40556,40561,40557,40563,30098,30100,30102,30112,30109,30124,30115,30131,30132,30136,30148,30129,30128,30147,30146,30166,30157,30179,30184,30182,30180,30187,30183,30211,30193,30204,30207,30224,30208,30213,30220,30231,30218,30245,30232,30229,30233,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39308,39310,39322,39323,39324,39325,39326,39327,39328,39329,39330,39331,39332,39334,39335,39337,39338,39339,39340,39341,39342,39343,39344,39345,39346,39347,39348,39349,39350,39351,39352,39353,39354,39355,39356,39357,39358,39359,39360,39361,39362,39363,39364,39365,39366,39367,39368,39369,39370,39371,39372,39373,39374,39375,39376,39377,39378,39379,39380,39381,39382,39383,39384,0,39385,39386,39387,39388,39389,39390,39391,39392,39393,39394,39395,39396,39397,39398,39399,39400,39401,39402,39403,39404,39405,39406,39407,39408,39409,39410,39411,39412,39413,39414,39415,39416,39417,30235,30268,30242,30240,30272,30253,30256,30271,30261,30275,30270,30259,30285,30302,30292,30300,30294,30315,30319,32714,31462,31352,31353,31360,31366,31368,31381,31398,31392,31404,31400,31405,31411,34916,34921,34930,34941,34943,34946,34978,35014,34999,35004,35017,35042,35022,35043,35045,35057,35098,35068,35048,35070,35056,35105,35097,35091,35099,35082,35124,35115,35126,35137,35174,35195,30091,32997,30386,30388,30684,32786,32788,32790,32796,32800,32802,32805,32806,32807,32809,32808,32817,32779,32821,32835,32838,32845,32850,32873,32881,35203,39032,39040,39043,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39418,39419,39420,39421,39422,39423,39424,39425,39426,39427,39428,39429,39430,39431,39432,39433,39434,39435,39436,39437,39438,39439,39440,39441,39442,39443,39444,39445,39446,39447,39448,39449,39450,39451,39452,39453,39454,39455,39456,39457,39458,39459,39460,39461,39462,39463,39464,39465,39466,39467,39468,39469,39470,39471,39472,39473,39474,39475,39476,39477,39478,39479,39480,0,39481,39482,39483,39484,39485,39486,39487,39488,39489,39490,39491,39492,39493,39494,39495,39496,39497,39498,39499,39500,39501,39502,39503,39504,39505,39506,39507,39508,39509,39510,39511,39512,39513,39049,39052,39053,39055,39060,39066,39067,39070,39071,39073,39074,39077,39078,34381,34388,34412,34414,34431,34426,34428,34427,34472,34445,34443,34476,34461,34471,34467,34474,34451,34473,34486,34500,34485,34510,34480,34490,34481,34479,34505,34511,34484,34537,34545,34546,34541,34547,34512,34579,34526,34548,34527,34520,34513,34563,34567,34552,34568,34570,34573,34569,34595,34619,34590,34597,34606,34586,34622,34632,34612,34609,34601,34615,34623,34690,34594,34685,34686,34683,34656,34672,34636,34670,34699,34643,34659,34684,34660,34649,34661,34707,34735,34728,34770,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39514,39515,39516,39517,39518,39519,39520,39521,39522,39523,39524,39525,39526,39527,39528,39529,39530,39531,39538,39555,39561,39565,39566,39572,39573,39577,39590,39593,39594,39595,39596,39597,39598,39599,39602,39603,39604,39605,39609,39611,39613,39614,39615,39619,39620,39622,39623,39624,39625,39626,39629,39630,39631,39632,39634,39636,39637,39638,39639,39641,39642,39643,39644,0,39645,39646,39648,39650,39651,39652,39653,39655,39656,39657,39658,39660,39662,39664,39665,39666,39667,39668,39669,39670,39671,39672,39674,39676,39677,39678,39679,39680,39681,39682,39684,39685,39686,34758,34696,34693,34733,34711,34691,34731,34789,34732,34741,34739,34763,34771,34749,34769,34752,34762,34779,34794,34784,34798,34838,34835,34814,34826,34843,34849,34873,34876,32566,32578,32580,32581,33296,31482,31485,31496,31491,31492,31509,31498,31531,31503,31559,31544,31530,31513,31534,31537,31520,31525,31524,31539,31550,31518,31576,31578,31557,31605,31564,31581,31584,31598,31611,31586,31602,31601,31632,31654,31655,31672,31660,31645,31656,31621,31658,31644,31650,31659,31668,31697,31681,31692,31709,31706,31717,31718,31722,31756,31742,31740,31759,31766,31755,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39687,39689,39690,39691,39692,39693,39694,39696,39697,39698,39700,39701,39702,39703,39704,39705,39706,39707,39708,39709,39710,39712,39713,39714,39716,39717,39718,39719,39720,39721,39722,39723,39724,39725,39726,39728,39729,39731,39732,39733,39734,39735,39736,39737,39738,39741,39742,39743,39744,39750,39754,39755,39756,39758,39760,39762,39763,39765,39766,39767,39768,39769,39770,0,39771,39772,39773,39774,39775,39776,39777,39778,39779,39780,39781,39782,39783,39784,39785,39786,39787,39788,39789,39790,39791,39792,39793,39794,39795,39796,39797,39798,39799,39800,39801,39802,39803,31775,31786,31782,31800,31809,31808,33278,33281,33282,33284,33260,34884,33313,33314,33315,33325,33327,33320,33323,33336,33339,33331,33332,33342,33348,33353,33355,33359,33370,33375,33384,34942,34949,34952,35032,35039,35166,32669,32671,32679,32687,32688,32690,31868,25929,31889,31901,31900,31902,31906,31922,31932,31933,31937,31943,31948,31949,31944,31941,31959,31976,33390,26280,32703,32718,32725,32741,32737,32742,32745,32750,32755,31992,32119,32166,32174,32327,32411,40632,40628,36211,36228,36244,36241,36273,36199,36205,35911,35913,37194,37200,37198,37199,37220,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39804,39805,39806,39807,39808,39809,39810,39811,39812,39813,39814,39815,39816,39817,39818,39819,39820,39821,39822,39823,39824,39825,39826,39827,39828,39829,39830,39831,39832,39833,39834,39835,39836,39837,39838,39839,39840,39841,39842,39843,39844,39845,39846,39847,39848,39849,39850,39851,39852,39853,39854,39855,39856,39857,39858,39859,39860,39861,39862,39863,39864,39865,39866,0,39867,39868,39869,39870,39871,39872,39873,39874,39875,39876,39877,39878,39879,39880,39881,39882,39883,39884,39885,39886,39887,39888,39889,39890,39891,39892,39893,39894,39895,39896,39897,39898,39899,37218,37217,37232,37225,37231,37245,37246,37234,37236,37241,37260,37253,37264,37261,37265,37282,37283,37290,37293,37294,37295,37301,37300,37306,35925,40574,36280,36331,36357,36441,36457,36277,36287,36284,36282,36292,36310,36311,36314,36318,36302,36303,36315,36294,36332,36343,36344,36323,36345,36347,36324,36361,36349,36372,36381,36383,36396,36398,36387,36399,36410,36416,36409,36405,36413,36401,36425,36417,36418,36433,36434,36426,36464,36470,36476,36463,36468,36485,36495,36500,36496,36508,36510,35960,35970,35978,35973,35992,35988,26011,35286,35294,35290,35292,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39900,39901,39902,39903,39904,39905,39906,39907,39908,39909,39910,39911,39912,39913,39914,39915,39916,39917,39918,39919,39920,39921,39922,39923,39924,39925,39926,39927,39928,39929,39930,39931,39932,39933,39934,39935,39936,39937,39938,39939,39940,39941,39942,39943,39944,39945,39946,39947,39948,39949,39950,39951,39952,39953,39954,39955,39956,39957,39958,39959,39960,39961,39962,0,39963,39964,39965,39966,39967,39968,39969,39970,39971,39972,39973,39974,39975,39976,39977,39978,39979,39980,39981,39982,39983,39984,39985,39986,39987,39988,39989,39990,39991,39992,39993,39994,39995,35301,35307,35311,35390,35622,38739,38633,38643,38639,38662,38657,38664,38671,38670,38698,38701,38704,38718,40832,40835,40837,40838,40839,40840,40841,40842,40844,40702,40715,40717,38585,38588,38589,38606,38610,30655,38624,37518,37550,37576,37694,37738,37834,37775,37950,37995,40063,40066,40069,40070,40071,40072,31267,40075,40078,40080,40081,40082,40084,40085,40090,40091,40094,40095,40096,40097,40098,40099,40101,40102,40103,40104,40105,40107,40109,40110,40112,40113,40114,40115,40116,40117,40118,40119,40122,40123,40124,40125,40132,40133,40134,40135,40138,40139,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39996,39997,39998,39999,40000,40001,40002,40003,40004,40005,40006,40007,40008,40009,40010,40011,40012,40013,40014,40015,40016,40017,40018,40019,40020,40021,40022,40023,40024,40025,40026,40027,40028,40029,40030,40031,40032,40033,40034,40035,40036,40037,40038,40039,40040,40041,40042,40043,40044,40045,40046,40047,40048,40049,40050,40051,40052,40053,40054,40055,40056,40057,40058,0,40059,40061,40062,40064,40067,40068,40073,40074,40076,40079,40083,40086,40087,40088,40089,40093,40106,40108,40111,40121,40126,40127,40128,40129,40130,40136,40137,40145,40146,40154,40155,40160,40161,40140,40141,40142,40143,40144,40147,40148,40149,40151,40152,40153,40156,40157,40159,40162,38780,38789,38801,38802,38804,38831,38827,38819,38834,38836,39601,39600,39607,40536,39606,39610,39612,39617,39616,39621,39618,39627,39628,39633,39749,39747,39751,39753,39752,39757,39761,39144,39181,39214,39253,39252,39647,39649,39654,39663,39659,39675,39661,39673,39688,39695,39699,39711,39715,40637,40638,32315,40578,40583,40584,40587,40594,37846,40605,40607,40667,40668,40669,40672,40671,40674,40681,40679,40677,40682,40687,40738,40748,40751,40761,40759,40765,40766,40772,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40163,40164,40165,40166,40167,40168,40169,40170,40171,40172,40173,40174,40175,40176,40177,40178,40179,40180,40181,40182,40183,40184,40185,40186,40187,40188,40189,40190,40191,40192,40193,40194,40195,40196,40197,40198,40199,40200,40201,40202,40203,40204,40205,40206,40207,40208,40209,40210,40211,40212,40213,40214,40215,40216,40217,40218,40219,40220,40221,40222,40223,40224,40225,0,40226,40227,40228,40229,40230,40231,40232,40233,40234,40235,40236,40237,40238,40239,40240,40241,40242,40243,40244,40245,40246,40247,40248,40249,40250,40251,40252,40253,40254,40255,40256,40257,40258,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40259,40260,40261,40262,40263,40264,40265,40266,40267,40268,40269,40270,40271,40272,40273,40274,40275,40276,40277,40278,40279,40280,40281,40282,40283,40284,40285,40286,40287,40288,40289,40290,40291,40292,40293,40294,40295,40296,40297,40298,40299,40300,40301,40302,40303,40304,40305,40306,40307,40308,40309,40310,40311,40312,40313,40314,40315,40316,40317,40318,40319,40320,40321,0,40322,40323,40324,40325,40326,40327,40328,40329,40330,40331,40332,40333,40334,40335,40336,40337,40338,40339,40340,40341,40342,40343,40344,40345,40346,40347,40348,40349,40350,40351,40352,40353,40354,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40355,40356,40357,40358,40359,40360,40361,40362,40363,40364,40365,40366,40367,40368,40369,40370,40371,40372,40373,40374,40375,40376,40377,40378,40379,40380,40381,40382,40383,40384,40385,40386,40387,40388,40389,40390,40391,40392,40393,40394,40395,40396,40397,40398,40399,40400,40401,40402,40403,40404,40405,40406,40407,40408,40409,40410,40411,40412,40413,40414,40415,40416,40417,0,40418,40419,40420,40421,40422,40423,40424,40425,40426,40427,40428,40429,40430,40431,40432,40433,40434,40435,40436,40437,40438,40439,40440,40441,40442,40443,40444,40445,40446,40447,40448,40449,40450,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40451,40452,40453,40454,40455,40456,40457,40458,40459,40460,40461,40462,40463,40464,40465,40466,40467,40468,40469,40470,40471,40472,40473,40474,40475,40476,40477,40478,40484,40487,40494,40496,40500,40507,40508,40512,40525,40528,40530,40531,40532,40534,40537,40541,40543,40544,40545,40546,40549,40558,40559,40562,40564,40565,40566,40567,40568,40569,40570,40571,40572,40573,40576,0,40577,40579,40580,40581,40582,40585,40586,40588,40589,40590,40591,40592,40593,40596,40597,40598,40599,40600,40601,40602,40603,40604,40606,40608,40609,40610,40611,40612,40613,40615,40616,40617,40618,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40619,40620,40621,40622,40623,40624,40625,40626,40627,40629,40630,40631,40633,40634,40636,40639,40640,40641,40642,40643,40645,40646,40647,40648,40650,40651,40652,40656,40658,40659,40661,40662,40663,40665,40666,40670,40673,40675,40676,40678,40680,40683,40684,40685,40686,40688,40689,40690,40691,40692,40693,40694,40695,40696,40698,40701,40703,40704,40705,40706,40707,40708,40709,0,40710,40711,40712,40713,40714,40716,40719,40721,40722,40724,40725,40726,40728,40730,40731,40732,40733,40734,40735,40737,40739,40740,40741,40742,40743,40744,40745,40746,40747,40749,40750,40752,40753,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40754,40755,40756,40757,40758,40760,40762,40764,40767,40768,40769,40770,40771,40773,40774,40775,40776,40777,40778,40779,40780,40781,40782,40783,40786,40787,40788,40789,40790,40791,40792,40793,40794,40795,40796,40797,40798,40799,40800,40801,40802,40803,40804,40805,40806,40807,40808,40809,40810,40811,40812,40813,40814,40815,40816,40817,40818,40819,40820,40821,40822,40823,40824,0,40825,40826,40827,40828,40829,40830,40833,40834,40845,40846,40847,40848,40849,40850,40851,40852,40853,40854,40855,40856,40860,40861,40862,40865,40866,40867,40868,40869,63788,63865,63893,63975,63985,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64012,64013,64014,64015,64017,64019,64020,64024,64031,64032,64033,64035,64036,64039,64040,64041];

	var result = [];

	for (var i=0;i<array.length;) {
		var k = array[i];

		if (k < 128) {
			result.push(vschess.fcc(k));
			++i;
		}
		else if (k === 128) {
			result.push("\u20ac");
			++i;
		}
		else {
			result.push(vschess.fcc(charset[(k << 8 | array[i + 1]) - 33088]));
			i += 2;
		}
	}

	return result.join("");
};

// ArrayBuffer 转换为 UTF-8 字符串
vschess.UTF8 = function(array){
	var result = [];

	for (var i=0;i<array.length;++i) {
		if (array[i] < 16) {
			result.push("%0", array[i].toString(16));
		}
		else {
			result.push("%" , array[i].toString(16));
		}
	}

	try { return decodeURIComponent(result.join("")); } catch (e) { return ""; }
};

// 检测是否为 UTF-8 编码
vschess.detectUTF8 = function(array){
	for (var i=0;i<array.length;) {
		var k = array[i];

		if (k < 128 || k === 255) {
			++i;
		}
		else {
			var length = k.toString(2).indexOf("0");

			for (var j=1;j<length;++j) {
				if (array[i + j] >> 6 !== 2) {
					return false;
				}
			}
	
			i += length;
		}
	}

	return true;
};

// 将 ArrayBuffer 转换为 UTF-8 字符串
vschess.iconv2UTF8 = function(array){
	if (vschess.detectUTF8(array)) {
		return vschess.UTF8(array);
	}
	else {
		return vschess.GBK2UTF8(array);
	}
};

// 简单合并，不做处理
vschess.join = function(array){
	var result = [];

	for (var i=0;i<array.length;++i) {
		result.push(vschess.fcc(array[i]));
	}

	return result.join("");
};

// 动态加载 CSS，用 Zepto 或 jQuery 方式加载的外部 CSS 在低版本 IE 下不生效，所以使用原生方法
vschess.addCSS = function(options, type, href){
	var link = document.createElement("link");
	var head = document.getElementsByTagName("head");
	typeof vschess. styleLoadedCallback[options.style ] === "undefined" && (vschess. styleLoadedCallback[options.style ] = []);
	typeof vschess.layoutLoadedCallback[options.layout] === "undefined" && (vschess.layoutLoadedCallback[options.layout] = []);
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", href);

	link.onload = function(){
		if (type === "global") {
			for (var i = 0; i < vschess.globalLoadedCallback.length; ++i) {
				typeof vschess.globalLoadedCallback[i] === "function" && vschess.globalLoadedCallback[i]();
			}

			vschess.globalLoaded = true;
		}

		if (type === "style") {
			for (var i = 0; i < vschess.styleLoadedCallback[options.style].length; ++i) {
				typeof vschess.styleLoadedCallback[options.style][i] === "function" && vschess.styleLoadedCallback[options.style][i]();
			}

			vschess.styleLoaded[options.style] = true;
		}

		if (type === "layout") {
			for (var i = 0; i < vschess.layoutLoadedCallback[options.layout].length; ++i) {
				typeof vschess.layoutLoadedCallback[options.layout][i] === "function" && vschess.layoutLoadedCallback[options.layout][i]();
			}

			vschess.layoutLoaded[options.layout] = true;
		}
	};

	head.length ? head[0].appendChild(link) : document.documentElement.appendChild(link);
	return this;
};

// 初始化程序，加载样式
vschess.init = function(options){
	// 全局样式，统一 Web Audio API
	if (!vschess.inited) {
		vschess.AudioContext = window.AudioContext || window.webkitAudioContext;
		vschess.AudioContext = vschess.AudioContext ? new vschess.AudioContext() : false;
		vschess.addCSS(options, 'global', options.globalCSS);
		vschess.inited = true;
	}

	// 风格样式
	if (!vschess.styleInit[options.style]) {
		vschess.addCSS(options, 'style', vschess.defaultPath + 'style/' + options.style + "/style.css");
		vschess.IE6Compatible_setPieceTransparent(options);
		vschess.styleInit[options.style] = true;
	}

	// 布局样式
	if (!vschess.layoutInit[options.layout]) {
		vschess.addCSS(options, 'layout', vschess.defaultPath + 'layout/' + options.layout + "/layout.css");
		vschess.layoutInit[options.layout] = true;
	}

	// 音效组件
	if (!vschess.soundInit[options.soundStyle]) {
		$.each(vschess.soundList, function(index, name){
			var soundName = options.soundStyle + "-" + name;
			var soundId   = "vschess-sound-" + soundName;
			var soundSrc  = options.soundPath ? options.soundPath + name + ".mp3" : vschess.defaultPath + 'sound/' + options.soundStyle + '/' + name + ".mp3";

			// IE 下利用 Windows Media Player 来实现走子音效
			if (window.ActiveXObject) {
				var soundHTML = '<object id="' + soundId + '" classid="clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6" style="display:none;">';
				$("body").append(soundHTML + '<param name="url" value="' + soundSrc + '" /><param name="autostart" value="false" /></object>');
				var soundObject = document.getElementById(soundId);
				vschess.soundObject[soundName] = function(volume){
					soundObject.settings.volume = volume;
					soundObject.controls.stop();
					soundObject.controls.play();
				};
			}

			// 支持 Web Audio 的浏览器使用 Web Audio API
			else if (vschess.AudioContext) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", soundSrc, true);
				xhr.responseType = "arraybuffer";

				xhr.onload = function(){
					vschess.AudioContext.decodeAudioData(this.response, function(buffer){
						vschess.soundObject[soundName] = function(volume){
							var source   = vschess.AudioContext.createBufferSource();
							var gainNode = vschess.AudioContext.createGain();
							source.buffer = buffer;
							source.connect(vschess.AudioContext.destination);
							source.connect(gainNode);
							gainNode.connect(vschess.AudioContext.destination);
							gainNode.gain.value = volume / 50 - 1;
							source.start(0);
						};
					});
				};

				xhr.send();
			}

			// 其他浏览器通过 HTML5 中的 audio 标签来实现走子音效
			else {
				$("body").append('<audio id="' + soundId + '" src="' + soundSrc + '" preload="auto"></audio>');
				var soundObject = document.getElementById(soundId);
				vschess.soundObject[soundName] = function(volume){
					soundObject.volume = volume / 100;
					soundObject.pause();
					soundObject.currentTime = 0;
					soundObject.play();
				}
			}
		});

		vschess.soundInit[options.soundStyle] = true;
	}

	return this;
};

// 将军检查器
vschess.checkThreat = function(situation){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	situation = situation.slice(0);
	var kingIndex = 0;
	var player = situation[0];
	var enermy = 3 - player;

	// 寻找帅、将
	if (player === 1) {
		for (var i = 0; !kingIndex && i < 9; ++i) {
			situation[vschess.castleR[i]] === 21 && (kingIndex = vschess.castleR[i]);
		}
	}
	else {
		for (var i = 0; !kingIndex && i < 9; ++i) {
			situation[vschess.castleB[i]] === 37 && (kingIndex = vschess.castleB[i]);
		}
	}

	// 车、将、帅
	for (var k = 0; k < 4; ++k) {
		for (var i = kingIndex + vschess.kingDelta[k]; situation[i]; i += vschess.kingDelta[k]) {
			if (situation[i] > 1) {
				if (((situation[i] & 15) === 1 || (situation[i] & 15) === 5) && situation[i] >> 4 === enermy) {
					return true;
				}
	
				break;
			}
		}
	}

	// 马
	for (var i = 0; i < 4; ++i) {
		if (situation[kingIndex + vschess.advisorDelta[i]] === 1) {
			var piece = situation[kingIndex + vschess.knightCheckDelta[i][0]];

			if ((piece & 15) === 2 && piece >> 4 === enermy) {
				return true;
			}

			var piece = situation[kingIndex + vschess.knightCheckDelta[i][1]];

			if ((piece & 15) === 2 && piece >> 4 === enermy) {
				return true;
			}
		}
	}

	// 炮
	for (var k = 0; k < 4; ++k) {
		var barbette = false;
	
		for (var i = kingIndex + vschess.kingDelta[k]; situation[i]; i += vschess.kingDelta[k]) {
			if (barbette) {
				if (situation[i] > 1) {
					if ((situation[i] & 15) === 6 && situation[i] >> 4 === enermy) {
						return true;
					}
	
					break;
				}
			}
			else {
				situation[i] > 1 && (barbette = true);
			}
		}
	}

	// 兵、卒
	if ((situation[kingIndex + 1] & 15) === 7 && situation[kingIndex + 1] >> 4 === enermy) {
		return true;
	}

	if ((situation[kingIndex - 1] & 15) === 7 && situation[kingIndex - 1] >> 4 === enermy) {
		return true;
	}

	if (player === 1) {
		if ((situation[kingIndex - 16] & 15) === 7 && situation[kingIndex - 16] >> 4 === 2) {
			return true;
		}
	}
	else {
		if ((situation[kingIndex + 16] & 15) === 7 && situation[kingIndex + 16] >> 4 === 1) {
			return true;
		}
	}

	return false;
};

// 着法生成器（索引模式）
vschess.legalList = function(situation){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	var legalList = [];
	var player = situation[0];
	var enermy = 3 - player;

	function checkPush(step) {
		var s = situation.slice(0);
		s[step[1]] = s[step[0]];
		s[step[0]] = 1;
		vschess.checkThreat(s) || legalList.push(step);
	}

	// 棋盘搜索边界
	for (var i = 51; i < 204; ++i) {
		if (situation[i] >> 4 !== player) {
			continue;
		}

		var piece = situation[i] & 15;

		// 车
		if (piece === 1) {
			for (var k = 0; k < 4; ++k) {
				for (var j = i + vschess.kingDelta[k]; situation[j]; j += vschess.kingDelta[k]) {
					if (situation[j] === 1) {
						checkPush([i, j]);
						continue;
					}

					situation[j] >> 4 === enermy && checkPush([i, j]);
					break;
				}
			}
		}

		// 马
		else if (piece === 2) {
			for (var j = 0; j < 4; ++j) {
				if (situation[i + vschess.kingDelta[j]] === 1) {
					var targetIndex0 = i + vschess.knightDelta[j][0];
					var targetIndex1 = i + vschess.knightDelta[j][1];
					situation[targetIndex0] && situation[targetIndex0] >> 4 !== player && checkPush([i, targetIndex0]);
					situation[targetIndex1] && situation[targetIndex1] >> 4 !== player && checkPush([i, targetIndex1]);
				}
			}
		}

		// 相、象
		else if (piece === 3) {
			// 红方相
			if (player === 1) {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vschess.advisorDelta[j]] === 1) {
						var targetIndex = i + (vschess.advisorDelta[j] << 1);
						situation[targetIndex] >> 4 !== player && targetIndex > 127 && checkPush([i, targetIndex]);
					}
				}
			}
	
			// 黑方象
			else {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vschess.advisorDelta[j]] === 1) {
						var targetIndex = i + (vschess.advisorDelta[j] << 1);
						situation[targetIndex] >> 4 !== player && targetIndex < 127 && checkPush([i, targetIndex]);
					}
				}
			}
		}

		// 仕、士
		else if (piece === 4) {
			for (var j = 0; j < 4; ++j) {
				var targetIndex = i + vschess.advisorDelta[j];
				vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkPush([i, targetIndex]);
			}
		}

		// 帅、将
		else if (piece === 5) {
			for (var k = 0; k < 4; ++k) {
				var targetIndex = i + vschess.kingDelta[k];
				vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkPush([i, targetIndex]);
			}
		}

		// 炮
		else if (piece === 6) {
			for (var k = 0; k < 4; ++k) {
				var barbette = false;
	
				for (var j = i + vschess.kingDelta[k]; situation[j]; j += vschess.kingDelta[k]) {
					if (barbette) {
						if (situation[j] === 1) {
							continue;
						}
	
						situation[j] >> 4 === enermy && checkPush([i, j]);
						break;
					}
					else {
						situation[j] === 1 ? checkPush([i, j]) : barbette = true;
					}
				}
			}
		}

		// 兵、卒
		else  {
			// 红方兵
			if (player === 1) {
				situation[i - 16] && situation[i - 16] >> 4 !== 1 &&			checkPush([i, i - 16]);
				situation[i +  1] && situation[i +  1] >> 4 !== 1 && i < 128 &&	checkPush([i, i +  1]);
				situation[i -  1] && situation[i -  1] >> 4 !== 1 && i < 128 &&	checkPush([i, i -  1]);
			}
	
			// 黑方卒
			else {
				situation[i + 16] && situation[i + 16] >> 4 !== 2 &&			checkPush([i, i + 16]);
				situation[i -  1] && situation[i -  1] >> 4 !== 2 && i > 127 &&	checkPush([i, i -  1]);
				situation[i +  1] && situation[i +  1] >> 4 !== 2 && i > 127 &&	checkPush([i, i +  1]);
			}
		}
	}

	return legalList;
};

// 着法生成器（坐标模式）
vschess.legalMoveList = function(situation){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	var legalList = vschess.legalList(situation), result = [];

	for (var i = 0; i < legalList.length; ++i) {
		result.push(vschess.s2i[legalList[i][0]] + vschess.s2i[legalList[i][1]]);
	}

	return result;
};

// Fen 串合法性检查，返回错误列表，列表长度为 0 表示没有错误
vschess.checkFen = function(fen){
	var RegExp = vschess.RegExp();

	if (!RegExp.FenShort.test(fen)) {
		return ["Fen \u4e32\u4e0d\u5408\u6cd5"];
	}

	var errorList = [], board = vschess.fenToArray(fen), Kk = false;
	var total = { R: 0, N: 0, B: 0, A: 0, K: 0, C: 0, P: 0, r: 0, n: 0, b: 0, a: 0, k: 0, c: 0, p: 0, "*": 0 };

	function push(error){
		~errorList.indexOf(error) || errorList.push(error);
	}

	for (var i = 0; i < 90; ++i) {
		board[i] === "K" && !~[ 66, 67, 68, 75, 76, 77, 84, 85, 86 ].indexOf(i    )  && push("\u7ea2\u65b9\u5e05\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "k" && !~[  3,  4,  5, 12, 13, 14, 21, 22, 23 ].indexOf(i    )  && push("\u9ed1\u65b9\u5c06\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "B" && !~[     47, 51, 63, 67, 71, 83, 87     ].indexOf(i    )  && push("\u7ea2\u65b9\u76f8\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "b" && !~[      2,  6, 18, 22, 26, 38, 42     ].indexOf(i    )  && push("\u9ed1\u65b9\u8c61\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "A" && !~[         66, 68, 76, 84, 86         ].indexOf(i    )  && push("\u7ea2\u65b9\u4ed5\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "a" && !~[          3,  5, 13, 21, 23         ].indexOf(i    )  && push("\u9ed1\u65b9\u58eb\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "P" && (i >= 63 || i >= 45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("\u7ea2\u65b9\u5175\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "p" && (i <  27 || i <  45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("\u9ed1\u65b9\u5352\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");

		++total[board[i]];

		if (board[i] === "K") {
			for (var j = i - 9; j > 0; j -= 9) {
				if (board[j] !== "*") {
					board[j] === "k" && (Kk = true) && push("\u5e05\u5c06\u9762\u5bf9\u9762\u4e86");
					break;
				}
			}
		}

	}

	board[45] === "P" && board[54] === "P" && push("\u7ea2\u65b9\u4e5d\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[47] === "P" && board[56] === "P" && push("\u7ea2\u65b9\u4e03\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[49] === "P" && board[58] === "P" && push("\u7ea2\u65b9\u4e94\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[51] === "P" && board[60] === "P" && push("\u7ea2\u65b9\u4e09\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[53] === "P" && board[62] === "P" && push("\u7ea2\u65b9\u4e00\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[27] === "p" && board[36] === "p" && push("\u9ed1\u65b9\uff11\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[29] === "p" && board[38] === "p" && push("\u9ed1\u65b9\uff13\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[31] === "p" && board[40] === "p" && push("\u9ed1\u65b9\uff15\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[33] === "p" && board[42] === "p" && push("\u9ed1\u65b9\uff17\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[35] === "p" && board[44] === "p" && push("\u9ed1\u65b9\uff19\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");

	total.R > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.R + "\u4e2a\u8f66\uff0c\u591a\u4e86" + (total.R - 2) + "\u4e2a");
	total.r > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.r + "\u4e2a\u8f66\uff0c\u591a\u4e86" + (total.r - 2) + "\u4e2a");
	total.N > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.N + "\u4e2a\u9a6c\uff0c\u591a\u4e86" + (total.N - 2) + "\u4e2a");
	total.n > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.n + "\u4e2a\u9a6c\uff0c\u591a\u4e86" + (total.n - 2) + "\u4e2a");
	total.B > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.B + "\u4e2a\u76f8\uff0c\u591a\u4e86" + (total.B - 2) + "\u4e2a");
	total.b > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.b + "\u4e2a\u8c61\uff0c\u591a\u4e86" + (total.b - 2) + "\u4e2a");
	total.A > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.A + "\u4e2a\u4ed5\uff0c\u591a\u4e86" + (total.A - 2) + "\u4e2a");
	total.a > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.a + "\u4e2a\u58eb\uff0c\u591a\u4e86" + (total.a - 2) + "\u4e2a");
	total.C > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.C + "\u4e2a\u70ae\uff0c\u591a\u4e86" + (total.C - 2) + "\u4e2a");
	total.c > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.c + "\u4e2a\u70ae\uff0c\u591a\u4e86" + (total.c - 2) + "\u4e2a");
	total.P > 5 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.P + "\u4e2a\u5175\uff0c\u591a\u4e86" + (total.P - 5) + "\u4e2a");
	total.p > 5 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.p + "\u4e2a\u5352\uff0c\u591a\u4e86" + (total.p - 5) + "\u4e2a");
	total.K > 1 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.K + "\u4e2a\u5e05\uff0c\u591a\u4e86" + (total.K - 1) + "\u4e2a");
	total.k > 1 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.k + "\u4e2a\u5c06\uff0c\u591a\u4e86" + (total.k - 1) + "\u4e2a");
	total.K < 1 && push("\u7ea2\u65b9\u5fc5\u987b\u6709\u4e00\u4e2a\u5e05");
	total.k < 1 && push("\u9ed1\u65b9\u5fc5\u987b\u6709\u4e00\u4e2a\u5c06");

	if (!Kk) {
		if (vschess.checkThreat(fen) && vschess.checkThreat(vschess.fenChangePlayer(fen))) {
			push("\u7ea2\u9ed1\u53cc\u65b9\u540c\u65f6\u88ab\u5c06\u519b");
		}
		else if (vschess.checkThreat(vschess.fenChangePlayer(fen))) {
			fen.split(" ")[1] === "b" ? push("\u8f6e\u5230\u9ed1\u65b9\u8d70\u68cb\uff0c\u4f46\u6b64\u65f6\u7ea2\u65b9\u6b63\u5728\u88ab\u5c06\u519b") : push("\u8f6e\u5230\u7ea2\u65b9\u8d70\u68cb\uff0c\u4f46\u6b64\u65f6\u9ed1\u65b9\u6b63\u5728\u88ab\u5c06\u519b");
		}
	}

	return errorList;
};

// 创建象棋组件，兼容两种创建模式：实例模式和方法模式
vschess.load = function(selector, options){
	// 实例模式下，每次运行时都只会为指定选择器中第一个未创建棋盘的 DOM 元素创建棋盘，若该选择器下有多个 DOM 元素，则需要多次运行
	// 实例模式使用举例：var chess = new vschess.load(".vschess");，返回一个棋盘对象
	if (this instanceof vschess.load) {
		var _this = this;
		this.options = $.extend(true, {}, vschess.defaultOptions, options);
		this._ = { nodeLength: 0 };
		vschess.init(this.options);
		this.DOM = $(selector).not(".vschess-loaded").first();
		this.createLoading(selector);

		var waitCSS = setInterval(function(){
			if (vschess.globalLoaded && vschess.layoutLoaded[_this.options.layout] && vschess.styleLoaded[_this.options.style]) {
				clearInterval(waitCSS);
				_this.createBoard();
				_this.initData();
				typeof _this["callback_loadFinish"] === "function" && _this["callback_loadFinish"]();
			}
		}, vschess.threadTimeout);

		return this;
	}

	// 方法模式下，只需运行一次，便可为该选择器下所有元素创建棋盘
	// 方法模式使用举例：var chess = vschess.load(".vschess");，返回一个包含所有棋盘对象的数组
	// 该数组可以直接调用属于每个棋盘的方法，程序将自动为所有棋盘应用此方法
	// 例如：chess.setBoardByStep(3);，将所有棋盘设置为第四个局面（越界自动修正），返回包含所有棋盘的数组，即数组本身
	// 再如：chess.isR(5);，检查所有棋盘的 index 为 5 的棋子是否为红方棋子，返回 [true, false, ......]，返回的数组长度即为棋盘数量
	else {
		var chessList = [];

		$(selector).not(".vschess-loaded").each(function(){
			chessList.push(new vschess.load(this, options));
		});

		$.each(vschess.load.prototype, function(name){
			chessList[name] = function(){
				var result = [];

				for (var i = 0; i < this.length; ++i) {
					result.push(this[i][name].apply(this[i], arguments));
				}

				name === "toString" && (result = result.toString());
				return result;
			};
		});

		return chessList;
	}
};

// 创建棋盘界面
vschess.load.prototype.createBoard = function(){
	var _this = this;
	this.DOM.children(".vschess-loading").remove();
	this.bindDrag();

	// 标题
	this.title = $('<div class="vschess-title"></div>');
	this.DOM.append(this.title);

	// 棋盘
	this.board = $('<div class="vschess-board"></div>');
	this.DOM.append(this.board);
	this.board.append(new Array(91).join('<div class="vschess-piece"><span></span></div>'));
	this.piece = this.board.children(".vschess-piece");
	this.board.append('<div class="vschess-piece-animate"><span></span></div>');
	this.animatePiece = this.board.children(".vschess-piece-animate");
	this.pieceClick();
	this.initPieceRotateDeg();

	// 其他组件
	this.createColumnIndex();
	this.createControlBar();
	this.createMoveSelectList();
	this.createChangeSelectList();
	this.createFormatBar();
	this.createTab();
	this.interval = { time: 0, tag: 0, run: setInterval(function(){ _this.intervalCallback(); }, 100) };
	this.chessId  = vschess.chessList.length;

	window.addEventListener("resize", function(){ _this.resetDPR(); }, false);
	vschess.chessList.push(this);
	return this;
};

// 填充初始数据
vschess.load.prototype.initData = function(){
	this.refreshColumnIndex();
	this.setSaved(true);
	this.showTab(this.options.defaultTab);
	this.initCallback();
	this.initArguments();
	this.initStart();
	return this;
};

// 初始化参数
vschess.load.prototype.initArguments = function(){
	this.setClickResponse	(this.options.clickResponse		);
	this.setAnimationTime	(this.options.animationTime		);
	this.setQuickStepOffset	(this.options.quickStepOffset	);
	this.setMoveFormat		(this.options.moveFormat		);
	this.setMoveTips		(this.options.moveTips			);
	this.setSaveTips		(this.options.saveTips			);
	this.setSound			(this.options.sound				);
	this.setVolume			(this.options.volume			);
	this.setPlayGap			(this.options.playGap			);
	this.setPieceRotate		(this.options.pieceRotate		);
	return this;
};

// 创建加载界面
vschess.load.prototype.createLoading = function(selector){
	this.originalData = this.DOM.html();
	this.chessData = this.options.chessData === false ? this.originalData : this.options.chessData;
	this.DOM.html('<div class="vschess-loading">\u68cb\u76d8\u52a0\u8f7d\u4e2d\uff0c\u8bf7\u7a0d\u5019\u3002</div>');
	this.DOM.addClass("vschess-loaded vschess-style-" + this.options.style + " vschess-layout-" + this.options.layout);
	this.DOM.attr("data-vschess-dpr", vschess.dpr);
	return this;
};

// 初始化起始局面
vschess.load.prototype.initStart = function(){
	this.node = vschess.dataToNode(this.chessData, this.options.parseType);
	this.rebuildSituation();
	this.setTurn		 (this.options.turn			);
	this.setBoardByStep	 (this.options.currentStep	);
	this.setExportFormat ("PGN_Chinese");
	return this;
};

// 初始化回调列表
vschess.load.prototype.initCallback = function(){
	for (var i = 0; i < vschess.callbackList.length; ++i) {
		this["callback_" + vschess.callbackList[i]] = this.options[vschess.callbackList[i]] || function(){};
	}

	return this;
};

// 自动播放组件
vschess.load.prototype.intervalCallback = function(){
	if (!this.interval.time || ++this.interval.tag % this.interval.time) {
		return false;
	}

	var _this = this;
	this.animateToNext(this.getAnimationTime(), function(){ _this.getCurrentStep() >= _this.lastSituationIndex() && _this.pause(); });
	this.interval.tag = 0;
	return this;
};

// 卸载棋盘，即将对应的 DOM 恢复原状，但不保留原 DOM 的事件绑定
vschess.load.prototype.unload = function(){
	this.DOM.html(this.originalData).removeClass("vschess-loaded vschess-style-" + this.options.style + " vschess-layout-" + this.options.layout).removeAttr("data-vschess-dpr");
	window.removeEventListener("resize", this.resetDPR, false);
	return this;
};

// 创建列号
vschess.load.prototype.createColumnIndex = function(){
	var columnText = this.options.ChineseChar.Number.split("");
	this.columnIndexR = $('<div class="vschess-column-index"></div>');
	this.columnIndexB = $('<div class="vschess-column-index"></div>');
	this.DOM.append(this.columnIndexR);
	this.DOM.append(this.columnIndexB);

	for (var i = 0; i < 9; ++i) {
		this.columnIndexR.append('<div class="vschess-column-index-item">' + columnText[i    ] + '</div>');
		this.columnIndexB.append('<div class="vschess-column-index-item">' + columnText[i + 9] + '</div>');
	}

	return this;
};

vschess.load.prototype.resetDPR = function(){
	vschess.dpr = window.devicePixelRatio || 1;
	$(this.DOM).attr("data-vschess-dpr", vschess.dpr);
	return this;
};

// 中文着法转换为节点 ICCS
vschess.Chinese2Node = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);

	if (!RegExp.Chinese.test(move)) {
		return { move: "none", movedFen: vschess.defaultFen };
	}

	var cStr = "\u8f66\u8eca\u4fe5\u9a6c\u99ac\u508c\u76f8\u8c61\u4ed5\u58eb\u5e05\u5e25\u5c06\u5c07\u70ae\u5305\u7832\u5175\u5352\u524d\u8fdb\u9032\u540e\u5f8c\u9000\u5e73\u4e2d\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u634c\u7396\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19123456789";
	var eStr = "RRRNNNBBAAKKKKCCCPP+++---..123456789123456789123456789123456789";
	var moveSplit = move.split("");
	$.each(moveSplit, function(i){ moveSplit[i] = eStr.charAt(cStr.indexOf(moveSplit[i])); });
	return vschess.WXF2Node(moveSplit.join(""), fen);
};

// WXF 着法转换为节点 ICCS
vschess.WXF2Node = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);

	if (!RegExp.WXF.test(move)) {
		return { move: "none", movedFen: vschess.defaultFen };
	}

	move = move
		.replace(/^([RNHBEAKCPrnhbeakcp])([\+\-\.])/g, "$2$1")
		.replace(/^([Pp])[Aa]/g, "1$1").replace(/^([Pp])[Bb]/g, "2$1").replace(/^([Pp])[Cc]/g, "3$1")
		.replace(/^([Pp])[Dd]/g, "4$1").replace(/^([Pp])[Ee]/g, "5$1").replace(/^([Pp])[\.]/g, ".$1");

	var from = 0, to = 0;

	// 黑方旋转处理
	if (fen.split(" ")[1] === "b") {
		var situation = vschess.fenToSituation(vschess.roundFen(fen));
		var moveSplit = move.toLowerCase().split("");
		var player    = 2, N = 34, B = 35, A = 36, P = 39;
	}
	// 红方直接处理
	else {
		var situation = vschess.fenToSituation(fen);
		var moveSplit = move.toUpperCase().split("");
		var player    = 1, N = 18, B = 19, A = 20, P = 23;
	}

	// 前
	if (moveSplit[0] === "+") {
		// 特殊兵卒东萍表示法
		if (vschess.isNumber(moveSplit[1])) {
			for (var i = 60 - moveSplit[1]; i < 204 && !from; i += 16) {
				situation[i] === P && (from = i);
			}
		}
		// 兵卒
		else if (moveSplit[1].toUpperCase() === "P") {
			for (i = 51; i < 60 && !from; ++i) {
				for (var j = i, pList = []; j < 204; j += 16) {
					situation[j] === P && pList.push(j);
				}

				pList.length > 1 && (from = pList[0]);
			}
		}
		// 车马相象仕士帅将炮
		else {
			for (var i = 51; i < 204 && !from; ++i) {
				situation[i] === vschess.f2n[moveSplit[1]] && (from = i);
			}
		}
	}
	// 后
	else if (moveSplit[0] === "-") {
		// 特殊兵卒东萍表示法
		if (vschess.isNumber(moveSplit[1])) {
			for (var i = 204 - moveSplit[1]; i > 50 && !from; i -= 16) {
				situation[i] === P && (from = i);
			}
		}
		// 兵卒
		else if (moveSplit[1].toUpperCase() === "P") {
			for (i = 51; i < 60 && !from; ++i) {
				for (var j = i, pList = []; j < 204; j += 16) {
					situation[j] === P && pList.push(j);
				}

				pList.length > 1 && (from = pList.pop());
			}
		}
		// 车马相象仕士帅将炮
		else {
			for (var i = 203; i > 50 && !from; --i) {
				situation[i] === vschess.f2n[moveSplit[1]] && (from = i);
			}
		}
	}
	// 中
	else if (moveSplit[0] === ".") {
		for (i = 51; i < 60 && !from; ++i) {
			for (var j = i, pList = []; j < 204; j += 16) {
				situation[j] === P && pList.push(j);
			}

			pList.length > 2 && (from = pList[1]);
		}
	}
	// 车马相象仕士帅将炮兵卒
	else if (isNaN(moveSplit[0])) {
		for (var i = 60 - moveSplit[1]; i < 204 && !from; i += 16) {
			situation[i] === vschess.f2n[moveSplit[0]] && (from = i);
		}
	}
	// 特殊兵卒象棋巫师表示法
	else {
		for (var i = 59, pList = []; i > 50; --i) {
			for (var j = i, pColList = []; j < 204; j += 16) {
				situation[j] === P && pColList.push(j);
			}

			pColList.length > 1 && (pList = pList.concat(pColList));
		}

		from = pList[moveSplit[0] - 1];
	}

	// 马
	if (situation[from] === N) {
		if (moveSplit[2] === "+") {
			switch (moveSplit[3] - 12 + from % 16) {
				case -1: to = from - 31; break;
				case -2: to = from - 14; break;
				case  1: to = from - 33; break;
				case  2: to = from - 18; break;
			}
		}
		else {
			switch (moveSplit[3] - 12 + from % 16) {
				case -1: to = from + 33; break;
				case -2: to = from + 18; break;
				case  1: to = from + 31; break;
				case  2: to = from + 14; break;
			}
		}
	}
	// 相象
	else if (situation[from] === B) {
		switch (moveSplit[2] + moveSplit[3]) {
			case "+1": to = 171; from && (from = 201); break;
			case "-1": to = 171; from && (from = 137); break;
			case "+9": to = 163; from && (from = 197); break;
			case "-9": to = 163; from && (from = 133); break;
			case "+3": to = 137; break;
			case "-3": to = 201; break;
			case "+7": to = 133; break;
			case "-7": to = 197; break;
			case "+5": to = 167; from && from < 195 && (from += 64); break;
			case "-5": to = 167; from && from > 139 && (from -= 64); break;
		}
	}
	// 仕士
	else if (situation[from] === A) {
		switch (moveSplit[2] + moveSplit[3]) {
			case "+4": to = 168; break;
			case "-4": to = 200; break;
			case "+6": to = 166; break;
			case "-6": to = 198; break;
			case "+5": to = 183; from && from < 195 && (from += 32); break;
			case "-5": to = 183; from && from > 171 && (from -= 32); break;
		}
	}
	// 车帅将炮兵卒
	else {
		if (moveSplit[2] === "+") {
			to = from - moveSplit[3] * 16;
		}
		else if (moveSplit[2] === "-") {
			to = from + moveSplit[3] * 16;
		}
		else {
			to = from + 12 - from % 16 - moveSplit[3];
		}
	}

	if (from && to) {
		situation[to  ]   = situation[from];
		situation[from]   = 1;
		situation[0   ]   = 3    - situation[0];
		situation[0   ] === 1 && ++situation[1];

		if (player === 1) {
			return { move: vschess.s2i[from] + vschess.s2i[to], movedFen: vschess.situationToFen(situation) };
		}
		else {
			return { move: vschess.roundMove(vschess.s2i[from] + vschess.s2i[to]), movedFen: vschess.roundFen(vschess.situationToFen(situation)) };
		}
	}
	else {
		return { move: "none", movedFen: vschess.defaultFen };
	}
};

// ICCS 着法转换为节点 ICCS
vschess.ICCS2Node = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);

	if (!RegExp.ICCS.test(move)) {
		return { move: "none", movedFen: vschess.defaultFen };
	}

	var situation = vschess.fenToSituation(fen);
	var step = move.toLowerCase().split("-");
	situation[vschess.i2s[step[1]]] = situation[vschess.i2s[step[0]]];
	situation[vschess.i2s[step[0]]] = 1;
	situation[0]   = 3    - situation[0];
	situation[0] === 1 && ++situation[1];
	return { move: step[0] + step[1], movedFen: vschess.situationToFen(situation) };
};

// ICCS 着法转换为节点 ICCS（无 Fen 串）
vschess.ICCS2Node_NoFen = function(move){
	return RegExp.ICCS.test(move) ? move.replace("-", "").toLowerCase() : "none";
};

// 着法列表转换为节点 ICCS 列表，列表第一个元素为起始局面 Fen 串
vschess.stepList2nodeList = function(moveList, fen){
	var RegExp = vschess.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		fen      = moveList.shift( );
	}
	else {
		RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	}

	var result = [fen], converter, currentFen = fen, stepData;

	if (moveList.length) {
		if (RegExp.ICCS.test(moveList[0])) {
			converter = vschess.ICCS2Node;
		}
		else if (RegExp.WXF.test(moveList[0])) {
			converter = vschess.WXF2Node;
		}
		else {
			converter = vschess.Chinese2Node;
		}

		for (var i = 0; i < moveList.length; ++i) {
			stepData = converter(moveList[i], currentFen);
			var legalList = vschess.legalMoveList(vschess.fenToSituation(currentFen));

			if (!~legalList.indexOf(stepData.move)) {
				break;
			}

			currentFen = stepData.movedFen;
			result.push(stepData.move);
		}
	}

	return result;
};

// 将着法列表转换为标准象棋 PGN 格式
vschess.moveListToData_PGN = function(moveList, startFen, commentList, infoList, result){
	var RegExp = vschess.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		startFen = moveList.shift();
	}
	else {
		RegExp.FenShort.test(startFen) || (startFen = vschess.defaultFen);
	}

	var isWXF  = RegExp.WXF .test(moveList[0]);
	var isICCS = RegExp.ICCS.test(moveList[0]);
	var startFenSplit =  startFen.split(" ");
	var startRound    = +startFenSplit[5] || 1;
	var pgnText = ['[Game "Chinese Chess"]\n'];

	for (var i in infoList) {
		pgnText.push("[", vschess.info.pgn[i] || vschess.fieldNameToCamel(i), ' "', infoList[i], '"]\n');
	}

	startFen == vschess.defaultFen || pgnText.push('[FEN "', startFen, '"]\n');
	!isICCS ? !isWXF ? null : pgnText.push('[Format "WXF"]\n') : pgnText.push('[Format "ICCS"]\n');
	pgnText.push(commentList[0] ? "{" + commentList[0] + "}\n" : "");

	if (startFenSplit[1] == "b") {
		for (var i=0;i<moveList.length;++i) {
			if (i == 0) {
				var round = startRound;
				round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
				pgnText.push(round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026 " : ". .... " : ". ..... ", moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "", "\n");
			}
			else {
				var round = (i + 1) / 2 + startRound;
				round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
				i % 2 && pgnText.push(round, ". ");
				pgnText.push(moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "");
				commentList[i + 1] && i % 2 && i != moveList.length - 1 && pgnText.push("\n", round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026" : ". ...." : ". .....");
				pgnText.push(i % 2 ? " " : "\n");
			}
		}
	}
	else {
		for (var i=0;i<moveList.length;++i) {
			var round = i / 2 + startRound;
			round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
			i % 2 || pgnText.push(round, ". ");
			pgnText.push(moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "");
			commentList[i + 1] && !(i % 2) && i != moveList.length - 1 && pgnText.push("\n", round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026" : ". ...." : ". .....");
			pgnText.push(i % 2 ? "\n" : " ");
		}
	}

	pgnText = $.trim(pgnText.join(""));

	if (pgnText.split("").pop() == "}") {
		pgnText += "\n " + result;
	}
	else {
		(startFenSplit[1] == "b") == (moveList.length % 2) && (pgnText += "\n");
		pgnText += " " + result;
	}

	return pgnText;
};

// 将着法列表转换为文本 TXT 格式
vschess.moveListToText = function(moveList, startFen, commentList, infoList, result){
	var RegExp = vschess.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		startFen = moveList.shift();
	}
	else {
		RegExp.FenShort.test(startFen) || (startFen = vschess.defaultFen);
	}

	var startFenSplit =  startFen.split(" ");
	var startRound    = +startFenSplit[5] || 1;
	var text = ["\u4e2d\u56fd\u8c61\u68cb\u5bf9\u5c40\u8bb0\u5f55\n"];

	for (var i in infoList) {
		text.push(vschess.info.name[i], "\uff1a", vschess.showText(infoList[i], i), "\n");
	}

	startFen == vschess.defaultFen || text.push("\u5f00\u5c40 Fen \u4e32\uff1a", startFen, "\n");
	text.push(commentList[0] ? "\uff08" + commentList[0] + "\uff09\n" : "");

	if (startFenSplit[1] == "b") {
		for (var i=0;i<moveList.length;++i) {
			if (i == 0) {
				var round = startRound;
				round = vschess.strpad(round, Math.ceil((moveList.length + 1) / 2).toString().length, " ", "left");
				text.push(round, ". \u2026\u2026\u2026\u2026 ", moveList[i], commentList[i + 1] ? "\n\uff08" + commentList[i + 1] + "\uff09" : "", "\n");
			}
			else {
				var round = (i + 1) / 2 + startRound;
				round = vschess.strpad(round, Math.ceil((moveList.length + 1) / 2).toString().length, " ", "left");
				i % 2 && text.push(round, ". ");
				text.push(moveList[i], commentList[i + 1] ? "\n\uff08" + commentList[i + 1] + "\uff09" : "");
				commentList[i + 1] && i % 2 && i != moveList.length - 1 && text.push("\n", round, ". \u2026\u2026\u2026\u2026");
				text.push(i % 2 ? " " : "\n");
			}
		}
	}
	else {
		for (var i=0;i<moveList.length;++i) {
			var round = i / 2 + startRound;
			round = vschess.strpad(round, Math.ceil(moveList.length / 2).toString().length, " ", "left");
			i % 2 || text.push(round, ". ");
			text.push(moveList[i], commentList[i + 1] ? "\n\uff08" + commentList[i + 1] + "\uff09" : "");
			commentList[i + 1] && !(i % 2) && i != moveList.length - 1 && text.push("\n", round, ". \u2026\u2026\u2026\u2026");
			text.push(i % 2 ? "\n" : " ");
		}
	}

	text = $.trim(text.join(""));
	var resultStr = vschess.showText(result, "result");

	if (resultStr) {
		if (text.split("").pop() == "\uff09") {
			text += "\n" + resultStr;
		}
		else {
			(startFenSplit[1] == "b") == (moveList.length % 2) && (text += "\n");
			text += resultStr;
		}
	}

	return text;
};

// 将棋谱节点树转换为东萍象棋 DhtmlXQ 格式
vschess.nodeToData_DhtmlXQ = function(nodeData, infoList, isMirror){
	var DhtmlXQ_binit = [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];
	var DhtmlXQ   = ["[DhtmlXQ]"];
	var fenSplit  = nodeData.fen.split(" ");
	var pieceEach = fenSplit[0]
		.replace(/1/g,"*")
		.replace(/2/g,"**")
		.replace(/3/g,"***")
		.replace(/4/g,"****")
		.replace(/5/g,"*****")
		.replace(/6/g,"******")
		.replace(/7/g,"*******")
		.replace(/8/g,"********")
		.replace(/9/g,"*********")
		.replace(/\//g,"").split("");

	for (var i in infoList) {
		DhtmlXQ.push('[DhtmlXQ_' + (vschess.info.DhtmlXQ[i] || i) + ']' + vschess.showText(infoList[i], i) + '[/DhtmlXQ_' + (vschess.info.DhtmlXQ[i] || i) + ']');
	}

	for (var i=0;i<90;++i) {
		var position = i % 9 * 10 + ~~(i / 9);
		position < 10 && (position = "0" + position);

		switch (pieceEach[i]) {
			case "K": DhtmlXQ_binit[ 4] = position; break;
			case "k": DhtmlXQ_binit[20] = position; break;
			case "R": DhtmlXQ_binit[ 0] == 99 ? DhtmlXQ_binit[ 0] = position : DhtmlXQ_binit[ 8] = position; break;
			case "N": DhtmlXQ_binit[ 1] == 99 ? DhtmlXQ_binit[ 1] = position : DhtmlXQ_binit[ 7] = position; break;
			case "B": DhtmlXQ_binit[ 2] == 99 ? DhtmlXQ_binit[ 2] = position : DhtmlXQ_binit[ 6] = position; break;
			case "A": DhtmlXQ_binit[ 3] == 99 ? DhtmlXQ_binit[ 3] = position : DhtmlXQ_binit[ 5] = position; break;
			case "C": DhtmlXQ_binit[ 9] == 99 ? DhtmlXQ_binit[ 9] = position : DhtmlXQ_binit[10] = position; break;
			case "r": DhtmlXQ_binit[16] == 99 ? DhtmlXQ_binit[16] = position : DhtmlXQ_binit[24] = position; break;
			case "n": DhtmlXQ_binit[17] == 99 ? DhtmlXQ_binit[17] = position : DhtmlXQ_binit[23] = position; break;
			case "b": DhtmlXQ_binit[18] == 99 ? DhtmlXQ_binit[18] = position : DhtmlXQ_binit[22] = position; break;
			case "a": DhtmlXQ_binit[19] == 99 ? DhtmlXQ_binit[19] = position : DhtmlXQ_binit[21] = position; break;
			case "c": DhtmlXQ_binit[25] == 99 ? DhtmlXQ_binit[25] = position : DhtmlXQ_binit[26] = position; break;
			case "P": {
				for (var j=11;j<16;++j) {
					if (DhtmlXQ_binit[j] == 99) {
						DhtmlXQ_binit[j] = position;
						break;
					}
				}

				break;
			}
			case "p": {
				for (var j=27;j<32;++j) {
					if (DhtmlXQ_binit[j] == 99) {
						DhtmlXQ_binit[j] = position;
						break;
					}
				}

				break;
			}
		}
	}

	DhtmlXQ.push("[DhtmlXQ_binit]" + DhtmlXQ_binit.join("") + "[/DhtmlXQ_binit]");
	var branchList = [], parentIndexList = [], parentStepsList = [], resultList = [], commentResult = [], branchIndex = 0;

	function makeBranch(){
		var step = 1;
		var node = branchList.pop();
		var parentIndex  = parentIndexList.pop();
		var parentSteps  = parentStepsList.pop();
		var branchResult = ["[DhtmlXQ_move_", parentIndex, "_", parentSteps, "_", branchIndex, "]"];
		var moveSplit    = node.move.split("");
		moveSplit[0] 	 = vschess.cca(moveSplit[0]) - 97;
		moveSplit[2] 	 = vschess.cca(moveSplit[2]) - 97;
		moveSplit[1] 	 = 9 - moveSplit[1];
		moveSplit[3] 	 = 9 - moveSplit[3];
		branchResult.push(moveSplit.join(""));
		node.comment && commentResult.push(["[DhtmlXQ_comment", branchIndex, "_", parentSteps, "]", node.comment.replace(/\n/g, "||"), "[/DhtmlXQ_comment", branchIndex, "_", parentSteps, "]"].join(""));

		while (node.next.length) {
			for (var i=node.next.length-1;i>=0;--i) {
				if (i != node.defaultIndex) {
					branchList.push(node.next[i]);
					parentIndexList.push(branchIndex);
					parentStepsList.push(parentSteps + step);
				}
			}

			node = node.next[node.defaultIndex];
			moveSplit = node.move.split("");
			moveSplit[0] = moveSplit[0].charCodeAt(0) - 97;
			moveSplit[2] = moveSplit[2].charCodeAt(0) - 97;
			moveSplit[1] = 9 - moveSplit[1];
			moveSplit[3] = 9 - moveSplit[3];
			branchResult.push(moveSplit.join(""));
			node.comment && commentResult.push(["[DhtmlXQ_comment", branchIndex, "_", parentSteps + step, "]", node.comment.replace(/\n/g, "||"), "[/DhtmlXQ_comment", branchIndex, "_", parentSteps + step, "]"].join(""));
			++step;
		}

		branchResult.push("[/DhtmlXQ_move_", parentIndex, "_", parentSteps, "_", branchIndex, "]");
		resultList.push(branchResult.join(""));
		++branchIndex;
		branchList.length && makeBranch();
	}

	for (var i=nodeData.next.length-1;i>=0;--i) {
		if (i != nodeData.defaultIndex) {
			branchList.push(nodeData.next[i]);
			parentIndexList.push(0);
			parentStepsList.push(1);
		}
	}

	nodeData.next.length && branchList.push(nodeData.next[nodeData.defaultIndex]);
	parentIndexList.push(0);
	parentStepsList.push(1);
	nodeData.comment && commentResult.push(["[DhtmlXQ_comment0]", nodeData.comment.replace(/\n/g, "||"), "[/DhtmlXQ_comment0]"].join(""));
	branchList.length && makeBranch();
	resultList.length && DhtmlXQ.push(resultList.join("\n").replace("[DhtmlXQ_move_0_1_0]", "[DhtmlXQ_movelist]").replace("[/DhtmlXQ_move_0_1_0]", "[/DhtmlXQ_movelist]"));
	commentResult.length && DhtmlXQ.push(commentResult.join("\n").replace(/DhtmlXQ_comment0_/g, "DhtmlXQ_comment"));
	DhtmlXQ.push("[/DhtmlXQ]");
	return isMirror ? vschess.turn_DhtmlXQ(DhtmlXQ.join("\n")) : DhtmlXQ.join("\n");
};

// 翻转东萍象棋 DhtmlXQ 格式
vschess.turn_DhtmlXQ = function(chessData){
	var DhtmlXQ_EachLine = chessData.split("\n");

	for (var i=0;i<DhtmlXQ_EachLine.length;++i) {
		var l = DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_binit")) {
			var startSplit = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_binit")).split("");

			for (var j=0;j<startSplit.length;j+=2) {
				startSplit[j] < 9 && (startSplit[j] = 8 - startSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_binit]" + startSplit.join("") + "[/DhtmlXQ_binit]";
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			var moveSplit = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_movelist")).split("");

			for (var j=0;j<moveSplit.length;j+=2) {
				moveSplit[j] < 9 && (moveSplit[j] = 8 - moveSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_movelist]" + moveSplit.join("") + "[/DhtmlXQ_movelist]";
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start		= l.indexOf("]");
			var end 		= l.indexOf("[/DhtmlXQ_move_");
			var changeId	= l.substring(14, start);
			var changeSplit = l.substring(start + 1, end).split("");

			for (var j=0;j<changeSplit.length;j+=2) {
				changeSplit[j] < 9 && (changeSplit[j] = 8 - changeSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_move_" + changeId + "]" + changeSplit.join("") + "[/DhtmlXQ_move_" + changeId + "]";
		}
	}

	return DhtmlXQ_EachLine.join("\n");
};

// 将棋谱节点树转换为鹏飞象棋 PFC 格式
vschess.nodeToData_PengFei = function(nodeData, infoList, result, isMirror){
	function getXmlByNode(nodeData, isDefault){
		var xmlData = ['<n m="', isMirror ? vschess.turnMove(nodeData.move) : nodeData.move, '" c="', nodeData.comment.replace(/\"/g, "&quot;"), '"'];
		isDefault && xmlData.push(' default="true"');
		xmlData.push('>');

		for (var i=0;i<nodeData.next.length;++i) {
			xmlData.push(getXmlByNode(nodeData.next[i], nodeData.defaultIndex === i));
		}

		xmlData.push('</n>');
		return xmlData.join("");
	}

	var xmlData = ['<?xml version="1.0" encoding="utf-8"?><n version="2" win="' + result + '" m="', isMirror ? vschess.turnFen(nodeData.fen) : nodeData.fen, '" c="', nodeData.comment.replace(/\"/g, "&quot;"), '"'];

	for (var i in infoList) {
		xmlData.push(" ", vschess.info.pfc[i] || i, '="', infoList[i].replace(/\"/g, "&quot;"), '"');
	}

	xmlData.push(['>']);

	for (var i=0;i<nodeData.next.length;++i) {
		xmlData.push(getXmlByNode(nodeData.next[i], nodeData.defaultIndex === i));
	}

	xmlData.push("</n>");
	return xmlData.join("").replace(/><\/n>/g, " />");
};

// 翻转鹏飞象棋 PFC 格式
vschess.turn_PengFei = function(chessData){
	chessData = chessData.split('m="');
	var end = chessData[1].indexOf('"');
	chessData[1] = vschess.turnFen(chessData[1].substring(0, end)) + chessData[1].substring(end);

	for (i=2;i<chessData.length;++i) {
		chessData[i] = vschess.turnMove(chessData[i].substring(0, 4)) + chessData[i].substring(4);
	}

	return chessData.join('m="');
};

// 将着法列表转换为 QQ 象棋 CHE 格式
vschess.moveListToData_QQ = function(moveList, isMirror){
	var result = ["1 ", moveList.length, " "], srcCol, dstCol, src;

	var board = [
		 8,  6,  4,  2,  0,  1,  3,  5,  7,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		 0, 10,  0,  0,  0,  0,  0,  9,  0,
		15,  0, 14,  0, 13,  0, 12,  0, 11,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		27,  0, 28,  0, 29,  0, 30,  0, 31,
		 0, 25,  0,  0,  0,  0,  0, 26,  0,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		23, 21, 19, 17, 16, 18, 20, 22, 24
	];

	for (var i=0;i<moveList.length;++i) {
		var moveSplit = moveList[i].split("");
		var from = vschess.i2b[moveList[i].substring(0, 2)];
		var to   = vschess.i2b[moveList[i].substring(2, 4)];
		srcCol = isMirror ? vschess.cca(moveSplit[0]) - 97 : 105 - vschess.cca(moveSplit[0]);
		dstCol = isMirror ? vschess.cca(moveSplit[2]) - 97 : 105 - vschess.cca(moveSplit[2]);
		result.push(board[from], " 32 ", 1 - i % 2, " ", moveSplit[1], " ", srcCol, " ", moveSplit[3], " ", dstCol, " 0 ", i + 1, " 0 ");
		board[to  ] = board[from];
		board[from] = 0;
	}

	return result.join("");
};

// 节点 ICCS 转换为中文着法（兼容 WXF 着法转换为中文着法，直接返回结果字符串）
vschess.Node2Chinese = function(move, fen, options){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	typeof options === "undefined" && (options = vschess.defaultOptions);
	var w2i = [{ "+": 0, ".": 1, "-": 2 }, { "+": 3, "-": 4, ".": 5 }];
	var isB = fen.split(" ")[1] == "b", result = "";
	var isWXFMove = ~"+-.".indexOf(move.charAt(2));

	if (isWXFMove) {
		var wxfSplit = move.replace(/^([RNHBEAKCP])([\+\-])/g, "$2$1").replace("Pa", "1P").replace("Pb", "2P").replace("Pc", "3P").replace("Pd", "4P").replace("Pe", "5P").replace(/^P\./, ".P").split("");
	}
	else {
		var wxfData  = vschess.Node2WXF(move, fen);

		if (wxfData.move === "None") {
			return { move: "\u65e0\u6548\u7740\u6cd5", movedFen: vschess.defaultFen };
		}
		else {
			var wxfSplit = wxfData.move.replace(/^([RNHBEAKCP])([\+\-])/g, "$2$1").replace("Pa", "1P").replace("Pb", "2P").replace("Pc", "3P").replace("Pd", "4P").replace("Pe", "5P").replace(/^P\./, ".P").split("");
		}
	}

	// 将 WXF 格式转换为中文格式，看起来眼晕@_@？（这里你用不着看懂，想看懂得可以去看官方文档，那里有这一段的最原始代码。）
	result += vschess.cca(wxfSplit[0]) > 47 ? isNaN(wxfSplit[0]) ? options.ChineseChar.Piece.charAt((vschess.f2n[wxfSplit[0]] & 15) + (isB ? 6 : -1)) : options.ChineseChar.PawnIndex.charAt(wxfSplit[0] - (isB ? -4 : 1)) : options.ChineseChar.Text.charAt(w2i[0][wxfSplit[0]]);
	result += isNaN(wxfSplit[1]) ? options.ChineseChar.Piece.charAt((vschess.f2n[wxfSplit[1]] & 15) - (isB ? -6 : 1)) : options.ChineseChar.Number.charAt(wxfSplit[1] - (isB ? -8 : 1));
	result += options.ChineseChar.Text.charAt(w2i[1][wxfSplit[2]]) + options.ChineseChar.Number.charAt(wxfSplit[3] - (isB ? -8 : 1));

	if (isWXFMove) {
		return result;
	}

	return { move: result, movedFen: wxfData.movedFen };
};

// 节点 ICCS 转换为 WXF 着法
vschess.Node2WXF = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	move = move.toLowerCase();

	// 黑方旋转处理
	if (fen.split(" ")[1] === "b") {
		var step	  = vschess.roundMove(move);
		var situation = vschess.fenToSituation(vschess.roundFen(fen));
	}
	// 红方直接处理
	else {
		var step	  = move;
		var situation = vschess.fenToSituation(fen);
	}

	var from	= vschess.i2s[step.substring(0, 2)];
	var to		= vschess.i2s[step.substring(2, 4)];
	var fromCol	= 12 - from % 16;
	var toCol	= 12 - to   % 16;
	var piece   = situation[from] & 15;
	var result	= "";

	// 相象仕士
	if (piece === 3 || piece === 4) {
		result = vschess.n2f[16 | piece] + fromCol;
	}
	// 兵卒
	else if (piece === 7) {
		for (var i = 60 - fromCol, pLength = 0; i < 204; i += 16) {
			situation[i] === situation[from] && ++pLength;
		}

		if (pLength === 1) {
			result = "P" + fromCol;
		}
		else {
			for (var i = 59, pList = []; i > 50; --i) {
				for (j = i, pColList = []; j < 204; j += 16) {
					situation[j] === situation[from] && pColList.push(j);
				}

				pColList.length > 1 && (pList = pList.concat(pColList));
			}

			if (pList.length === 2) {
				result = "P" + "+-" .charAt(pList.indexOf(from));
			}
			else if (pList.length === 3) {
				result = "P" + "+.-".charAt(pList.indexOf(from));
			}
			else {
				result = "P" + vschess.fcc(pList.indexOf(from) + 97);
			}
		}
	}
	// 车马帅将炮
	else {
		for (var i = from + 16; i < 204 && !result; i += 16) {
			situation[i] === situation[from] && (result = vschess.n2f[16 | piece] + "+");
		}

		for (var i = from - 16; i >  50 && !result; i -= 16) {
			situation[i] === situation[from] && (result = vschess.n2f[16 | piece] + "-");
		}

		result || (result = vschess.n2f[16 | piece] + fromCol);
	}

	// 马相象仕士
	if (piece === 2 || piece === 3 || piece === 4) {
		result += (from > to ? "+" : "-") + toCol;
	}
	// 车帅将炮兵卒
	else {
		var offset = to - from;

		if (Math.abs(offset) > 15) {
			result += (offset > 0 ? "-" : "+") + Math.abs(offset) / 16;
		}
		else {
			result += "." + toCol;
		}
	}

	if (result) {
		situation[to  ]   = situation[from];
		situation[from]   = 1;
		situation[0   ]   = 3    - situation[0];
		situation[0   ] === 1 && ++situation[1];

		if (fen.split(" ")[1] === "b") {
			return { move: result, movedFen: vschess.roundFen(vschess.situationToFen(situation)) };
		}

		return { move: result, movedFen: vschess.situationToFen(situation) };
	}

	return { move: "None", movedFen: vschess.defaultFen };
};

// 节点 ICCS 转换为 ICCS 着法
vschess.Node2ICCS = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var situation = vschess.fenToSituation(fen);
	situation[vschess.i2s[move.substring(2, 4)]] = situation[vschess.i2s[move.substring(0, 2)]];
	situation[vschess.i2s[move.substring(0, 2)]] = 1;
	situation[0]   = 3  -   situation[0];
	situation[0] === 1 && ++situation[1];
	return { move: move.toUpperCase().substring(0, 2) + "-" + move.toUpperCase().substring(2, 4), movedFen: vschess.situationToFen(situation) };
};

// 节点 ICCS 转换为 ICCS 着法（无 Fen 串）
vschess.Node2ICCS_NoFen = function(move){
	return move.toUpperCase().substring(0, 2) + "-" + move.toUpperCase().substring(2, 4);
};

// 节点 ICCS 列表转换为着法列表，列表第一个元素为起始局面 Fen 串
vschess.nodeList2moveList = function(moveList, fen, format, options, mirror){
	var RegExp = vschess.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		fen      = moveList.shift( );
	}
	else {
		RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	}

	mirror && (fen = vschess.turnFen(fen));
	var result = [fen], currentFen = fen, stepData, move;

	switch (format) {
		case "iccs": var converter = vschess.Node2ICCS   ; break;
		case  "wxf": var converter = vschess.Node2WXF    ; break;
		default    : var converter = vschess.Node2Chinese; break;
	}

	for (var i = 0; i < moveList.length; ++i) {
		move = mirror ? vschess.turnMove(moveList[i]) : moveList[i];
		stepData = converter(move, currentFen, options);
		currentFen = stepData.movedFen;
		result.push(stepData.move);
	}

	return result;
};

// WXF 着法字符串转换为 ECCO 开局编号及类型
vschess.WXF2ECCO = function(wxfList){
	wxfList = wxfList ? wxfList.slice(0) : [vschess.defaultFen];

	if (wxfList[0].length > 4 && wxfList.shift().split(" ", 2).join(" ") !== vschess.defaultFen.split(" ", 2).join(" ")) {
		return { ecco: "A00", opening: "\u6b8b\u5c40", variation: "" };
	}

	wxfList.length > 20 && (wxfList.length = 20);

	if (wxfList.length && wxfList[0].substring(1, 2) > 5) {
		for (var i = 0; i < wxfList.length; ++i) {
			wxfList[i] = vschess.turnWXF(wxfList[i]);
		}
	}

	var wxfList80 = wxfList.join("");
	wxfList80.length < 80 && (wxfList80 += new Array(81 - wxfList80.length).join(" "));
	var index = vschess.WXF2ECCOIndex(wxfList80);
	var ecco  = vschess.ECCOIndex2Name(index).split("#");
	return { ecco: index, opening: ecco[0], variation: ecco[1] || "" };
};

// WXF 着法字符串转换为 ECCO 开局编号
vschess.WXF2ECCOIndex = function(wxf){
	wxf = wxf ? wxf.toUpperCase() : "";
	var moveList = [], tempStr = wxf.substring(0, 80);

	while (tempStr) {
		moveList.push([tempStr.substring(0, 4), tempStr.substring(4, 8)]);
		tempStr = tempStr.substring(8);
	}

	return EccoXxx();

	function S(move, delta) {
		delta = (delta || 0) * 4;
		return wxf.substring(delta, delta + move.length) === move;
	}

	function U(move){
		var R = [], B = [], tempStr = move;

		while (tempStr) {
			tempStr && R.push(tempStr.substring(0, 4));
			tempStr = tempStr.substring(4);
			tempStr && B.push(tempStr.substring(0, 4));
			tempStr = tempStr.substring(4);
		}

		var RN = R.join(""), BN = B.join("");

		for (var i = 0; i < R.length; ++i) {
			if (!~RN.indexOf(moveList[i][0])) return false;
			RN = RN.replace(moveList[i][0], "");
		}

		for (var i = 0; i < B.length; ++i) {
			if (!~BN.indexOf(moveList[i][1])) return false;
			BN = BN.replace(moveList[i][1], "");
		}

		return !RN && !BN;
	}

	function SR(round) { return round * 2 - 2; }
	function SB(round) { return round * 2 - 1; }

	function B5x() {
		var i, bIsB54 = true;

		for (i = 1; i < 5; ++i) {
			switch (moveList[i][0]) {
				case "N2+3": case "N8+9": case "R1.2": case "P3+1": break;
				default    : bIsB54 = false; break;
			}
		}

		for (i = 1; i < 4; ++i) {
			switch (moveList[i][1]) {
				case "N8+7": case "C8.6": case "P3+1": break;
				default    : bIsB54 = false; break;
			}
		}

		if (bIsB54) {
			if (S("B7+5C8.7R1.2R9.8C2+4", SB(5))) {
				if (S("P7+1P3+1P3+1", SR(8))) return "B56";
				return "B55";
			}

			return "B54";
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][1]) {
					case "B7+5": case "B3+5": case "N8+7": case "C8.6": case "P7+1": case "P3+1": break;
					case "R1.2": return "B53";
					case "R9+1": return "B52";
					case "R9.8": return "B51";
					default    : return "B50";
				}
			}

			return "B50";
		}
	}

	function sandwich() {
		var i, bRedN7 = false, bRedN9 = false, bRedC6 = false;

		if (S("P7+1C8.6N8+7", SR(2))) {
			return "B32";
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][1]) {
					case "N8+7":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][0]) {
								case "N8+9": bRedN9 = true; break;
								case "N8+7": bRedN7 = true; break;
								case "C8.6": bRedC6 = true; break;
								case "N2+3": case "R1.2": case "P3+1": case "P7+1": break;
								case "R1+1": if (!bRedC6) return "B34"; break;
								case "R2+6": if (!bRedC6) return "B33"; break;
								case "C8.7": return B5x();
								case "C8+4": return "B36";
								case "C8+2": return "B35";
								default:
									if (bRedC6) {
										if (S("N2+3C8.6R1.2N8+7", SR(2))) {
											if (bRedN7) {
												if (moveList[3][0] === "C8.6" && moveList[3][1] === "R1.2") {
													if (moveList[4][1] === "C2.1") {
														if (moveList[5][1] === "P7+1")  return "B44";
														return "B43";
													}

													return "B42";
												}

												return "B41";
											}

											if (bRedN9) return "B45";
											return "B40";
										}

										return "B40";
									}

									return "B31";
							}
						}

						return "B30";
					case "B7+5": case "B3+5": case "C8.6": case "P7+1": case "P3+1": break;
					default    : return "B30";
				}
			}

			return "B30";
		}
	}

	function C5x() {
		var i, bIsC52 = true, bIsC55 = true;

		for (i = 1; i < 5; ++i) {
			switch (moveList[i][0]) {
				case "N2+3": case "R1.2": case "C8.6": break;
				case "N8+9": bIsC55 = false; break;
				case "R2+6": bIsC52 = false; break;
				default    : bIsC52 = bIsC55 = false; break;
			}
		}

		for (i = 1; i < 4; ++i) {
			switch (moveList[i][1]) {
				case "N2+3": case "N8+7": case "R9.8": case "P7+1": break;
				default    : bIsC52 = bIsC55 = false; break;
			}
		}

		if (bIsC52) {
			if (S("R1.2R9.8", SB(5))) {
				if (moveList[5][1] === "C2+4") return "C53";
				return "C52";
			}

			return "C51";
		}
		else if (bIsC55) {
			switch (moveList[4][1]) {
				case "P3+1": return "C56";
				case "R1.2": return "C55";
				default    : return "C54";
			}
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][0]) {
					case "N2+3": case "R1.2": case "C8.6": case "P3+1": case "P7+1": break;
					case "R2+6": return "C54";
					case "N8+9": return "C51";
					default    : return "C50";
				}
			}

			return "C50";
		}
	}

	function C8x() {
		var i, bIsC85 = true, bBlackB7 = false;

		for (i = 1; i < 5; ++i) {
			switch (moveList[i][0]) {
				case "N2+3": case "N8+7": case "C8+2": case "P7+1": break;
				default    : bIsC85 = false;
			}
		}

		for (i = 1; i < 4; ++i) {
			switch (moveList[i][1]) {
				case "N8+7": case "N2+3": case "R9.8": case "P7+1": break;
				default    : bIsC85 = false; break;
			}
		}

		if (bIsC85 && moveList[4][1] === "N7+8") {
			if (moveList[5][0] === "N7+6" && moveList[6][0] === "R1+1") return "C86";
			return "C85";
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][1]) {
					case "B7+5": bBlackB7 = true; break;
					case "B3+5": return "C84";
					case "P7+1": case "P3+1": break;
					case "N8+7": case "N2+3": case "R9.8": break;
					case "C8+2": if (bBlackB7) return "C83"; return "C80";
					case "R1+1": if (bBlackB7) return "C82"; return "C80";
					default    : if (bBlackB7) return "C81"; return "C80";
				}
			}

			return "C80";
		}
	}

	function C9x() {
		for (var i = 1; i < 10; ++i) {
			switch (moveList[i][0]) {
				case "P3+1":
					for (i = 1; i < 10; ++i) {
						switch (moveList[i][1]) {
							case "P3+1":
								for (i = 1; i < 10; ++i) {
									switch (moveList[i][0]) {
										case "N8+9":
											switch (moveList[4][1]) {
												case "B7+5": case "B3+5":
													switch (moveList[5][1]) {
														case "P1+1": if (moveList[6][0] === "C8.7") return "C97"; return "C96";
														case "A6+5": case "A4+5": return "C94";
														case "P7+1": return "C95";
														default    : return "C93";
													}
												case "P1+1": if (moveList[6][0] === "C8.7") return "C97"; return "C96";
												case "A6+5": case "A4+5": return "C94";
												case "P7+1": return "C95";
												default    : return "C93";
											}
										case "N2+3": case "R1.2": case "C8+4": case "P3+1": break;
										case "C8.7": return "C98";
										case "N8+7": return "C92";
										default    : return "C91";
									}
								}

								return "C91";
							case "N8+7": case "N2+3": case "R9.8": break;
							default    : return "C90";
						}
					}

					return "C90";
				case "N2+3": case "N8+7": case "N8+9": case "R1.2": case "R2+6": case "C8+4": break;
				default    : return "C90";
			}
		}

		return "C90";
	}

	function screen() {
		var i, bRedN7, bRedN9, bRedR6, bBlackC8, bBlackC2, bBlackP3;
		bRedN7 = bRedN9 = bRedR6 = bBlackC8 = bBlackC2 = bBlackP3 = false;

		if (U("C2.5N8+7N2+3R9.8R1.2P7+1R2+6N2+3N8+7P3+1")) {
			if (moveList[5][0] === "R9+1") {
				if (S("C2+1R2-2B3+5", SB(6))) {
					switch (moveList[7][0]) {
						case "P3+1": if (moveList[8][0] === "P7+1") return "C25"; return "C23";
						case "P7+1": if (moveList[8][0] === "P7+1") return "C25"; return "C24";
						default    : return "C22";
					}
				}

				return "C21";
			}

			return "C20";
		}
		else if (U("C2.5N8+7N2+3R9.8R1.2P7+1R2+6N2+3P7+1")) {
			switch (moveList[4][1]) {
				case "N7+6":
					if (moveList[5][0] === "N8+7") {
						if (moveList[5][1] === "B3+5") {
							switch (moveList[6][0]) {
								case "C8.9": return "C39";
								case "C8+1": return "C38";
								default    : return "C37";
							}
						}

						return "C36";
					}

					return "C35";
				case "C8.9":
					if (S("R2.3C9-1", SR(6))) {
						switch (moveList[6][0]) {
							case "N8+7":
								if (moveList[6][1] === "A4+5") {
									switch (moveList[7][0]) {
										case "C8.9": if (moveList[7][1] === "R1.2" || moveList[8][1] === "R1.2") return "C46"; return "C45";
										case "N7+6": return "C44";
										default    : return "C43";
									}
								}

								return "C42";
							case "P5+1": return "C49";
							case "C8.6": return "C48";
							case "N8+9": return "C47";
							default    : return "C41";
						}
					}

					return "C40";
				case "B7+5": case "B3+5": return "C32";
				case "A6+5": case "A4+5": return "C31";
				case "C2+4": return "C34";
				case "R1+1": return "C33";
				default    : return "C30";
			}
		}
		else if (U("C2.5N8+7N2+3R9.8R1.2P7+1N8+9N2+3C8.7")) {
			switch (moveList[4][1]) {
				case "R1.2":
					if (moveList[5][0] === "R9.8") {
						switch (moveList[5][1]) {
							case "C2+4": return "C66";
							case "C2+2": return "C65";
							case "C8+4": return "C64";
							default    : return "C63";
						}
					}

					return "C62";
				case "C2+2": return "C67";
				default    : return "C61";
			}
		}
		else if (U("C2.5N8+7N2+3R9.8R1.2N2+3P3+1P3+1N8+9P1+1C8.7N3+2")) {
			if (moveList[6][0] === "R9+1") {
				switch (moveList[6][1]) {
					case "B7+5":
						switch (moveList[7][0]) {
							case "R2+4": return "C76";
							case "N3+4": return "C75";
							default    : return "C74";
						}
					case "P1+1": return "C78";
					case "B3+5": return "C77";
					default    : return "C73";
				}
			}

			return "C72";
		}
		else {
			for (i = 1; i < 9; ++i) {
				switch (moveList[i][0]) {
					case "R2+4":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][0]) {
								case "N2+3": case "R1.2": case "R2+4": case "P3+1": case "P7+1": break;
								case "N8+7": case "N8+9": return "C16";
								default    : return "C15";
							}
						}
					case "R1+1":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][0]) {
								case "N2+3": case "N8+7": case "R1+1": case "R1.4": case "R1.6": case "P3+1": case "P7+1": break;
								case "P5+1": return "C14";
								case "C8.9": return "C13";
								case "C8+2": return "C12";
								case "N7+6": return "C11";
								default    : return "C10";
							}
						}

						return "C10";
					case "C8.7":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][1]) {
								case "P7+1":
									for (i = 1; i < 10; ++i) {
										switch (moveList[i][0]) {
											case "N2+3": case "N8+9": case "R1.2": case "R2+6": case "C8.7": break;
											case "P7+1": return "C68";
											default    : return "C60";
										}
									}

									return "C60";
								case "P3+1": bBlackP3 = true; break;
								case "N3+2": return "C71";
								case "N2+3": case "N8+7": case "R9.8": break;
								default    : if (bBlackP3) return "C70"; return "C60";
							}
						}
					case "N2+3": case "R1.2": case "P3+1": case "P7+1": break;
					case "N8+9": bRedN9 = true; break;
					case "N8+7": bRedN7 = true; break;
					case "R2+6": bRedR6 = true; break;
					case "C8+4": return C9x();
					case "C8+2": return C8x();
					case "C8.6": return C5x();
					case "C8.9": return "C99";
					default:
						if (bRedR6) {
							for (i = 1; i < 10; ++i) {
								switch (moveList[i][0]) {
									case "N2+3": case "R1.2": case "R2+6": case "P3+1": case "P7+1": break;
									case "N8+9": return "C19";
									case "N8+7": return "C18";
									default    : return "C17";
								}
							}

							return "C17";
						}
						else if (bRedN7) {
							for (i = 1; i < 10; ++i) {
								switch (moveList[i][0]) {
									case "P5+1":
										for (i = 1; i < 10; ++i) {
											switch (moveList[i][1]) {
												case "N2+3": case "N8+7": case "R9.8": case "P7+1": case "P3+1": break;
												case "C8+4": if (bBlackC2) return "C04"; bBlackC8 = true; break;
												case "C2+4": if (bBlackC8) return "C04"; bBlackC2 = true; break;
												default    : return "C03";
											}
										}

										return "C03";
									case "N2+3": case "N8+7": case "R1.2": case "P3+1": case "P7+1": break;
									case "N7+6": return "C02";
									default    : return "C01";
								}
							}

							return "C01";
						}
						else if (bRedN9) {
							for (i = 1; i < 10; ++i) {
								switch (moveList[i][0]) {
									case "N2+3": case "N8+9": case "R1.2": case "P3+1": case "P7+1": break;
									case "R9+1": return "C06";
									default    : return "C05";
								}
							}

							return "C05";
						}

						return "C00";
				}
			}

			return "C00";
		}
	}

	function Bxx() {
		switch (moveList[1][1]) {
			case "R9+1":
				if (moveList[1][0] === "N2+3" && S("R1.2R9.4", SR(3))) {
					switch (moveList[3][0]) {
						case "P7+1": return "B14";
						case "C8+2": return "B13";
						default    : return "B12";
					}
				}

				return "B10";
			case "C8.6":
				switch (moveList[2][1]) {
					case "N8+9": case "R9+1": return "B11";
					default    : return sandwich();
				}
			case "P3+1": case "P7+1":
				switch (moveList[2][1]) {
					case "A6+5": case "A4+5": return "B02";
					case "C8.6": return sandwich();
					case "N8+7": return screen();
					case "R9+2": return "B03";
					default    : return "B01";
				}
			case "N8+7": return screen();
			case "N8+9": return "B10";
			case "C2.1": return "B04";
			default: return "B01";
		}
	}

	function Cxx() {
		function CxxClassify() {
			var i, bBlackCx = 0;

			for (i = 1; i < 10; i++) {
				switch(moveList[i][1]) {
					case "R9.8": case "R8+5": case "P7+1": case "P3+1": break;
					case "N2+3": if (bBlackCx) return bBlackCx; return 7;
					case "R9+1": if (bBlackCx) return bBlackCx; return 6;
					case "C8+4": bBlackCx = 2; break;
					case "C8.9": bBlackCx = 1; break;
					case "C2.5": return 5 - bBlackCx;
					default    : return bBlackCx;
				}
			}

			return 0;
		}

		var i, bRedR2, bRedR8, bRedP3, bRedP7;
		bRedR2 = bRedR8 = bRedP3 = bRedP7 = false;

		switch (CxxClassify()) {
			case 1:
				for (i = 1; i < 10; ++i) {
					switch (moveList[i][0]) {
						case "B7+9": if (moveList[i - 1][1] === "R8+5") return "B21"; return "B20";
						case "P3+1": if (bRedP7) return "B25"; bRedP3 = true; break;
						case "P7+1": if (bRedP3) return "B25"; bRedP7 = true; break;
						case "N2+3": case "N8+7": break;
						case "C8+4": return "B24";
						case "C8+2": return "B23";
						case "R1+1": return "B22";
						default    : return "B20";
					}
				}

				return "B20";
			case 3:
				if (S("N2+3R9.8R1.2C8+4P3+1C2.5", SR(2))) {
					switch (moveList[4][0]) {
						case "P7+1": return "D36";
						case "C8+5": return "D35";
						case "N8+9": return "D34";
						case "N8+7": return "D33";
						case "N3+4": return "D32";
						default    : return "D31";
					}
				}

				return "D30";
			case 4:
				for (i = 1; i < 10; ++i) {
					switch (moveList[i][0]) {
						case "P5+1": if (moveList[i - 1][1] === "R8+5" && moveList[i][1] === "C2.5") return "D41"; return "D40";
						case "P3+1": if (bRedP7) return "D43"; bRedP3 = true; break;
						case "P7+1": if (bRedP3) return "D43"; bRedP7 = true; break;
						case "N2+3": case "N8+7": break;
						case "R9.8": return "D42";
						default    : return "D40";
					}
				}

				return "D40";
			case 5:
				for (i = 1; i < 10; ++i) {
					switch (moveList[i][0]) {
						case "R2+6": return "D53";
						case "N2+3": case "N8+7": case "P3+1": case "P7+1": break;
						case "R1.2": if (bRedR8) return "D55"; bRedR2 = true; break;
						case "R9.8": if (bRedR2) return "D55"; bRedR8 = true; break;
						default    : if (bRedR2) return "D52"; if (bRedR8) return "D54"; return "D51";
					}
				}

				return "D50";
			case  7: return screen();
			case  2: return "B07";
			case  6: return "B06";
			default: return "B05";
		}
	}

	function D1x() {
		for (var i = 2; i < 10; ++i) {
			switch (moveList[i][1]) {
				case "N2+3": case "P7+1": case "P3+1": break;
				case "C2.1": return "D15";
				case "C2+4": return "D14";
				case "R9.8": return "D13";
				case "R1+1": return "D12";
				case "R9+1": return "D11";
				default    : return "D10";
			}
		}

		return "D10";
	}

	function D2x() {
		var i, bRedP3 = false, bRedP7 = false;

		for (i = 3; i < 10; ++i) {
			switch (moveList[i][0]) {
				case "A4+5": case "A6+5": return "D21";
				case "N8+9": return "D22";
				case "R2+4": return "D23";
				case "R2+6": return "D24";
				case "C8.6": return "D25";
				case "P3+1":
					if (bRedP7) {
						for (i = 3; i < 10; ++i) {
							switch (moveList[i][1]) {
								case "N2+3": case "R9.4": break;
								case "R1+1": return "D29";
								default    : return "D28";
							}
						}

						return "D28";
					}

					bRedP3 = true;
					break;
				case "P7+1":
					if (bRedP3) {
						for (i = 3; i < 10; ++i) {
							switch (moveList[i][1]) {
								case "N2+3": case "R9.4": break;
								case "R1+1": return "D29";
								default    : return "D28";
							}
						}

						return "D28";
					}

					bRedP7 = true;
					break;
				case "N8+7": break;
				default    : if (bRedP3) return "D26"; if (bRedP7) return "D27"; return "D20";
			}
		}

		return "D20";
	}

	function Dxx() {
		switch (moveList[1][0]) {
			case "N2+3":
				switch (moveList[1][1]) {
					case "N8+7":
						switch (moveList[2][0]) {
							case "R1.2": if (moveList[2][1] === "R9+1") return D2x(); return D1x();
							case "R1+1":
								if (moveList[2][1] === "R9.8") {
									if (moveList[3][1] === "R8+4") return "D05";
									return "D04";
								}

								return "D03";
							default:
								switch (moveList[2][1]) {
									case "R9.8": return "D02";
									case "R9+1": return "D01";
									default    : return "D00";
								}
						}
					case "R9+1": if (S("R1.2N8+7", SR(3))) return D2x(); return "D01";
					default: return "D00";
				}
			case "R1+1":
				if (S("R9.8N8+7", SB(2))) {
					if (moveList[2][1] === "R8+4") return "D05";
					return "D04";
				}

				return "D03";
			default: return "D00";
		}
	}

	function EccoXxx() {
		function isA28() {
			var i, bRedN3 = false, bRedN7 = false;

			for (i = 1; i < 10; ++i) {
				switch (moveList[i][0]) {
					case "N2+3": if (bRedN7) return true; bRedN3 = true; break;
					case "N8+7": if (bRedN3) return true; bRedN7 = true; break;
					case "R1.2": case "P3+1": case "P7+1": break;
					default    : return false;
				}
			}

			return false;
		}

		function isA53() {
			var i, bRedN3 = false, bRedN7 = false;

			for (i = 1; i < 10; ++i) {
				switch (moveList[i][0]) {
					case "N2+3": if (bRedN7) return true; bRedN3 = true; break;
					case "N8+7": if (bRedN3) return true; bRedN7 = true; break;
					case "R9.8": case "P3+1": case "P7+1": break;
					default    : return false;
				}
			}

			return false;
		}

		switch (moveList[0][0]) {
			case "B3+5":
				switch (moveList[0][1]) {
					case "N2+3":
						switch (moveList[1][0]) {
							case "P7+1": return "A16";
							case "P3+1": return "A15";
							default    : return "A14";
						}
					case "C2.4":
						switch (moveList[1][0]) {
							case "P7+1": return "A26";
							case "P3+1": return "A25";
							case "R9+1": return "A24";
							case "N8+9": return "A23";
							case "N8+7": return "A22";
							default    : return "A21";
						}
					case "C8.4":
						if (moveList[1][0] === "N2+3") {
							if (S("N8+7R1.2P7+1", SB(2))) {
								switch (moveList[3][0]) {
									case "P7+1": return "A34";
									case "C2.1": return "A33";
									default    : return "A32";
								}
							}

							return "A31";
						}

						return "A30";
					case "P7+1":
						switch (moveList[1][0]) {
							case "P7+1": return "A38";
							case "N8+7": return "A37";
							default    : return "A36";
						}
					case "C8.5": if (isA28()) return "A28"; return "A27";
					case "P3+1": return "A39";
					case "C2.6": return "A35";
					case "C2.5": return "A29";
					case "C8.6": return "A20";
					case "N8+7": return "A13";
					case "B3+5": return "A12";
					case "B7+5": return "A11";
					default    : return "A10";
				}
			case "N2+3":
				if (moveList[0][1] === "P7+1") {
					switch (moveList[1][0]) {
						case "P7+1": return "A45";
						case "C8.5": return "A44";
						case "C8.6": return "A43";
						case "C2.1": return "A42";
						default    : return "A41";
					}
				}

				return "A40";
			case "C2.4":
				switch (moveList[0][1]) {
					case "C2.5": if (isA53()) return "A53"; return "A52";
					case "P7+1": return "A54";
					case "N8+7": return "A51";
					default    : return "A50";
				}
			case "C2.5":
				switch (moveList[0][1]) {
					case "C8.5": return Dxx();
					case "N8+7": return Cxx();
					case "N2+3": return Bxx();
					case "C2.5": return "D50";
					default    : return "B00";
				}
			case "C2.6":
				switch (moveList[0][1]) {
					case "C8.5":
						if (moveList[1][0] === "N2+3" && moveList[2][0] === "R1.2") {
							if (moveList[1][1] === "N8+7" && moveList[2][1] === "R9+1") return "A65";
							if (moveList[1][1] === "R9+1" && moveList[2][1] === "N8+7") return "A65";
							return "A64";
						}

						return "A63";
					case "R9+1": return "A62";
					case "N8+7": return "A61";
					default    : return "A60";
				}
			case "P3+1":
				switch (moveList[0][1]) {
					case "C8.7":
						switch (moveList[1][0]) {
							case "C8.5":
								switch (moveList[1][1]) {
									case "B3+5":
										if (moveList[2][0] === "N2+1") {
											if (moveList[2][1] === "N8+9") return "E16";
											return "E15";
										}

										return "E14";
									case "B7+5":
										switch (moveList[2][0]) {
											case "N8+7":
												switch (moveList[2][1]) {
													case "R1+1":
														if (S("R9.8R1.8N2+3N8+6", SR(4))) {
															if (S("C2.1N2+1N3+4", SR(6))) {
																switch (moveList[6][1]) {
																	case "P1+1": return "E27";
																	case "R8+6": return "E26";
																	case "A6+5": return "E25";
																	default    : return "E24";
																}
															}

															return "E24";
														}

														return "E23";
													case "P7+1":
														if (S("N2+1P7+1", SR(4)) || S("R9.8P7+1", SR(4))) {
															if (moveList[4][0] === "N2+1" || moveList[4][0] === "R9.8") {
																switch (moveList[4][1]) {
																	case "R1+1":
																		switch (moveList[5][0]) {
																			case "R1.2": return "E36";
																			case "R8+4": return "E35";
																			case "A4+5": return "E34";
																			default    : return "E33";
																		}
																	case "N8+6": return "E32";
																	default    : return "E31";
																}
															}

															return "E31";
														}

														return "E30";
													default: return "E22";
												}
											case "C5+4": return "E38";
											case "N2+1": return "E37";
											case "A4+5": return "E21";
											default    : return "E20";
										}
									case "C2.5": return "E17";
									default    : return "E13";
								}
							case "B7+5": case "B3+5": return "E11";
							case "C2.5": return "E12";
							default    : return "E10";
						}
					case "N2+3":
						switch (moveList[1][0]) {
							case "N2+3":
								if (moveList[1][1] === "P3+1") {
									switch (moveList[2][0]) {
										case "B3+5": case "B7+5": return "E43";
										case "C2.1": return "E45";
										case "R1+1": return "E44";
										default    : return "E42";
									}
								}

								return "E07";
							case "P7+1": if (moveList[1][1] === "C8.7") return "E09"; return "E08";
							default    : return "E06";
						}
					case "P3+1":
						switch (moveList[1][0]) {
							case "N2+3":
								if (moveList[1][1] === "N2+3") {
									switch (moveList[2][0]) {
										case "B3+5": case "B7+5": return "E43";
										case "C2.1": return "E45";
										case "R1+1": return "E44";
										default    : return "E42";
									}
								}

								return "E41";
							case "C8.7":
								switch (moveList[1][1]) {
									case "C8.5": return "E48";
									case "C2.5": return "E47";
									default    : return "E46";
								}
							default: return "E40";
						}
					case "B7+5": case "B3+5": if (moveList[1][0] === "N2+3") return "E02"; return "E01";
					case "C8.6": case "C8.4": case "C2.6": case "C2.4": return "E04";
					case "C8.5": case "C2.5": return "E03";
					case "C2.7": return "E05";
					default    : return "E00";
				}
			case "P1+1": return "A08";
			case "C2.7": return "A07";
			case "C2.3": return "A06";
			case "C2+4": return "A05";
			case "C2+2": return "A04";
			case "C2.1": return "A03";
			case "N2+1": return "A02";
			case "A4+5": return "A01";
			default    : return "A00";
		}
	}
};

// ECCO 编号转换为开局类型
vschess.ECCOIndex2Name = function(index){
	var k =  index.substring(0, 1);
	var i = +index.substring(1, 3);
	return vschess.eccoDir[k][i] ? vschess.eccoDir[k][i] : vschess.eccoDir.A[0];
};

// 检查指定局面号下指定棋子是否为红方棋子
vschess.load.prototype.isR = function(index, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 == 1;
};

// 检查指定局面号下指定棋子是否为黑方棋子
vschess.load.prototype.isB = function(index, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 == 2;
};

// 检查指定局面号下指定棋子是否无棋子
vschess.load.prototype.isN = function(index, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] == 1;
};

// 检查指定局面号下指定棋子是否为己方棋子
vschess.load.prototype.isPlayer = function(index, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 == this.situationList[step][0];
};

// 检查指定局面号下指定棋子是否为敌方棋子
vschess.load.prototype.isEnermy = function(index, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 == 3 - this.situationList[step][0];
};

// 获取指定起始棋子的所有合法目标坐标
vschess.load.prototype.getLegalByStartPieceIndex = function(startIndex){
	startIndex = vschess.b2s[vschess.turn[this.getTurn()][vschess.limit(startIndex, 0, 89)]];
	var legalList = [];

	for (var i=0;i<this.legalList.length;++i) {
		this.legalList[i][0] == startIndex && legalList.push(vschess.turn[this.getTurn()][vschess.s2b[this.legalList[i][1]]]);
	}

	return legalList;
};

// 将棋盘上的棋子移除，-1 表示动画棋子
vschess.load.prototype.clearPiece = function(index){
	var className =  "vschess-piece-R vschess-piece-N vschess-piece-B vschess-piece-A vschess-piece-K vschess-piece-C vschess-piece-P";
	className	 += " vschess-piece-r vschess-piece-n vschess-piece-b vschess-piece-a vschess-piece-k vschess-piece-c vschess-piece-p";

	if (typeof index == "undefined") {
		this.piece.removeClass(className);
	}
	else if (~index) {
		this.piece.eq(vschess.limit(index, 0, 89)).removeClass(className);
	}
	else {
		this.animatePiece.removeClass(className);
	}

	return this;
};

// 将棋盘上的选择状态移除，-1 表示动画棋子
vschess.load.prototype.clearSelect = function(index){
	if (typeof index == "undefined") {
		this.piece.removeClass("vschess-piece-S vschess-piece-s");
		this.setCurrentSelect(-1);
	}
	else if (~index) {
		this.piece.eq(vschess.limit(index, 0, 89)).removeClass("vschess-piece-S vschess-piece-s");
	}
	else {
		this.animatePiece.removeClass("vschess-piece-S vschess-piece-s");
	}

	return this;
};

// 将棋盘上的棋子及选择状态移除，-1 表示动画棋子
vschess.load.prototype.clearBoard = function(index){
	this.clearPiece(index);
	this.clearSelect(index);
	return this;
};

// 创建棋谱注解区域
vschess.load.prototype.createComment = function(){
	var _this = this;
	this.commentTitle = $('<div class="vschess-tab-title vschess-tab-title-comment">\u68cb\u8c31\u6ce8\u89e3</div>');
	this.commentArea = $('<div class="vschess-tab-body vschess-tab-body-comment"></div>');
	this.commentTextarea = $('<textarea class="vschess-tab-body-comment-textarea"></textarea>').appendTo(this.commentArea);
	this.tabArea.children(".vschess-tab-title-comment, .vschess-tab-body-comment").remove();
	this.tabArea.append(this.commentTitle);
	this.tabArea.append(this.commentArea );
	this.commentTitle.bind(this.options.click, function(){ _this.showTab("comment"); });
	this.commentTextarea.bind("change" , function( ){ _this.editCommentByStep(_this.commentTextarea.val()); });
	this.commentTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode == 13 && _this.commentTextarea.blur(); });
	this.createCommentPlaceholder();
	return this;
};

// 根据局面号填充注释
vschess.load.prototype.setCommentByStep = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	this.commentTextarea.val(this.commentList[step]);
	vschess.placeholder || (this.commentList[step] ?  this.commentTextareaPlaceholder.hide() : this.commentTextareaPlaceholder.show());
	return this;
};

// 创建棋谱注解区域空白提示
vschess.load.prototype.createCommentPlaceholder = function(){
	if (vschess.placeholder) {
		this.commentTextarea.attr({ "placeholder": "\u8fd9\u91cc\u53ef\u4ee5\u586b\u5199\u6ce8\u89e3" });
		return this;
	}

	var _this = this, commentMonitor;
	this.commentTextareaPlaceholder = $('<div class="vschess-tab-body-comment-textarea-placeholder">\u8fd9\u91cc\u53ef\u4ee5\u586b\u5199\u6ce8\u89e3</div>');
	this.commentArea.append(this.commentTextareaPlaceholder);
	this.commentTextarea.bind("focus", function(){ commentMonitor = setInterval(function(){ _this.commentTextarea.val() ? _this.commentTextareaPlaceholder.hide() : _this.commentTextareaPlaceholder.show(); }, 20); });
	this.commentTextarea.bind("blur" , function(){ clearInterval(commentMonitor); });
	return this;
};

// 修改当前节点树下指定局面号的注解
vschess.load.prototype.editCommentByStep = function(comment, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	this.selectDefault(step).comment = comment;
	this.commentList[step] = comment;
	this.refreshMoveListNode();
	this.setCommentByStep();
	this.rebuildExportAll();
	this.setExportFormat();
	return this;
};

// 创建棋盘选项区域
vschess.load.prototype.createConfig = function(){
	var _this = this;
	this.configTitle = $('<div class="vschess-tab-title vschess-tab-title-config">\u68cb\u76d8\u9009\u9879</div>');
	this.configArea  = $('<div class="vschess-tab-body vschess-tab-body-config"></div>');
	this.tabArea.children(".vschess-tab-title-config, .vschess-tab-body-config").remove();
	this.tabArea.append(this.configTitle);
	this.tabArea.append(this.configArea );
	this.configTitle.bind(this.options.click, function(){ _this.showTab("config"); });
	this.createConfigSwitch();
	return this;
};

// 创建棋盘选项开关列表
vschess.load.prototype.createConfigSwitch = function(){
	var _this = this;
	this.configSwitchList = $('<ul class="vschess-tab-body-config-list"></ul>');
	this.configArea.append(this.configSwitchList);
	this.configItem   = {};
	this.configItemM  = {};
	this.configValue  = {};
	this.configRange  = {};
	this.configSelect = {};
	this.addConfigItem("turnX"		, "\u5de6\u53f3\u7ffb\u8f6c", "boolean", true, ""											, function(){ _this.setTurn(_this.configValue["turnY"] * 2 + _this.configValue["turnX"], 1);		});
	this.addConfigItem("turnY"		, "\u4e0a\u4e0b\u7ffb\u8f6c", "boolean", true, ""											, function(){ _this.setTurn(_this.configValue["turnY"] * 2 + _this.configValue["turnX"], 1);		});
	this.addConfigItem("moveTips"	, "\u8d70\u5b50\u63d0\u793a", "boolean", true, ""											, function(){ _this._.moveTips		= _this.configValue["moveTips"		];							});
	this.addConfigItem("sound"		, "\u8d70\u5b50\u97f3\u6548", "boolean", true, ""											, function(){ _this._.sound			= _this.configValue["sound"			];					 		});
	this.addConfigItem("saveTips"	, "\u4fdd\u5b58\u63d0\u793a", "boolean", true, ""											, function(){ _this._.saveTips		= _this.configValue["saveTips"		];							});
	this.addConfigItem("pieceRotate", "\u68cb\u5b50\u65cb\u8f6c", "boolean", true, ""											, function(){ _this._.pieceRotate	= _this.configValue["pieceRotate"	]; _this.setBoardByStep();	});
	this.addConfigItem("playGap"	, "\u64ad\u653e\u95f4\u9694", "select" , 5   , "0.1\u79d2:1,0.2\u79d2:2,0.5\u79d2:5,1\u79d2:10,2\u79d2:20,5\u79d2:50"	, function(){ _this._.playGap		= _this.configValue["playGap"		];							});
	this.addConfigItem("volume"		, "\u97f3\u6548\u97f3\u91cf", "range"  , 100 , "0,100"										, function(){ _this._.volume		= _this.configValue["volume"		];							});
	return this;
};

// 添加棋盘选项开关
vschess.load.prototype.addConfigItem = function(name, text, type, defaultValue, param, action){
	var _this = this;
	this.configItem [name] = $('<li class="vschess-tab-body-config-item vschess-tab-body-config-item-' + name + '">' + text + '</li>');
	this.configValue[name] = defaultValue;

	if (type === "boolean") {
		this.configItemM[name] = $('<div class="vschess-tab-body-config-item-boolean"><span></span></div>');
		this.configItemM[name].bind(this.options.click, function(){ _this.setConfigItemValue(name, !_this.configValue[name]); typeof action === "function" && action(); });
		this.configValue[name] || this.configItemM[name].addClass("vschess-tab-body-config-item-boolean-false");
	}
	else if (type === "select") {
		var selectList = param.split(",");
		this.configSelect[name] = { item: [] };
		this.configItemM [name] = $('<select class="vschess-tab-body-config-item-select"></select>');

		for (var i = 0; i < selectList.length; ++i) {
			var _name  = selectList[i].split(":")[0];
			var _value = selectList[i].split(":")[1];
			this.configSelect[name].item.push({ name: _name, value: _value });

			if (_value == this.getPlayGap()) {
				this.configItemM[name].append('<option value="' + _value + '" selected="selected">' + _name + '</option>');
			}
			else {
				this.configItemM[name].append('<option value="' + _value + '">' + _name + '</option>');
			}
		}

		this.configItemM[name].bind("change", function(){ _this.setConfigItemValue(name, this.value); typeof action === "function" && action(); });
	}
	else if (type === "range") {
		var min = +param.split(",")[0];
		var max = +param.split(",")[1];
		var startX = 0, drag = false;
		var k = (defaultValue - min) * 100 / (max - min);

		this.configItemM[name] = $('<div class="vschess-tab-body-config-item-range"></div>');
		this.configRange[name] = { bar: $('<div class="vschess-tab-body-config-item-range-bar"></div>'), k: k, min: min, max: max };
		this.configItemM[name].append(this.configRange[name].bar);
		this.configRange[name].bar.css({ left: k });

		this.configRange[name].bar.bind("mousedown touchstart", function(e){
			startX = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
			drag = true;
		});

		$(document).bind("mousemove touchmove", function(e){
			if (!drag) {
				return true;
			}

			var X = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
			var deltaX = X - startX;
			var K = _this.configRange[name].k + deltaX;
			K > 100 && (K = 100);
			K <   0 && (K =   0);
			_this.configRange[name].bar.css({ left: K });
			_this.setConfigItemValue(name, K);
			typeof action === "function" && action();
			return false;
		});

		$(document).bind("mouseup touchend", function(e){
			if (!drag) {
				return true;
			}

			var X = e.type === "mouseup" ? e.pageX : e.changedTouches[0].pageX;
			var deltaX = X - startX;
			var K = _this.configRange[name].k + deltaX;
			K > 100 && (K = 100);
			K <   0 && (K =   0);
			_this.configRange[name].k = K;
			_this.configRange[name].bar.css({ left: K });
			_this.setConfigItemValue(name, K);
			typeof action === "function" && action();
			drag = false;
		});
	}

	this.configItem [name].append(this.configItemM[name]);
	this.configSwitchList .append(this.configItem[name]);
	return this;
};

// 设置棋盘选项开关
vschess.load.prototype.setConfigItemValue = function(name, value){
	if (this.configRange[name]) {
		this.configValue[name] = this.configRange[name].min + (this.configRange[name].max - this.configRange[name].min) * value / 100;
		this.configRange[name].bar.css({ left: value });
	}
	else if (this.configSelect[name]) {
		this.configValue[name] = value;

		for (var i = 0; i < this.configSelect[name].item.length; ++i) {
			if (this.configSelect[name].item[i].value == value) {
				this.configItemM[name][0].selectedIndex = i;
				break;
			}
		}
	}
	else {
		this.configValue[name] = value;
		this.configValue[name] ? this.configItemM[name].removeClass("vschess-tab-body-config-item-boolean-false") : this.configItemM[name].addClass("vschess-tab-body-config-item-boolean-false");
	}

	return this;
};

// 播放控制器
vschess.load.prototype.createControlBar = function(){
	var _this = this;
	this.controlBar = $('<div class="vschess-control-bar"></div>');
	this.controlBarButton = {
		first: $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-first" value="\u5f00 \u5c40" />'),
		prevQ: $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-prevQ" value="\u5feb \u9000" />'),
		prev : $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-prev"  value="\u540e \u9000" />'),
		play : $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-play"  value="\u64ad \u653e" />'),
		pause: $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-pause" value="\u6682 \u505c" />'),
		next : $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-next"  value="\u524d \u8fdb" />'),
		nextQ: $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-nextQ" value="\u5feb \u8fdb" />'),
		last : $('<input type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-last"  value="\u7ec8 \u5c40" />')
	};

	this.controlBarButton.first.bind(this.options.click, function(){ _this.pause(false).setBoardByStep(0); });
	this.controlBarButton.last .bind(this.options.click, function(){ _this.pause(false).setBoardByStep(_this.lastSituationIndex()); });
	this.controlBarButton.prev .bind(this.options.click, function(){ _this.pause(false).setBoardByOffset(-1); });
	this.controlBarButton.next .bind(this.options.click, function(){ _this.pause(false).animateToNext(); });
	this.controlBarButton.prevQ.bind(this.options.click, function(){ _this.pause(false).setBoardByOffset(-_this.getQuickStepOffset()); });
	this.controlBarButton.nextQ.bind(this.options.click, function(){ _this.pause(false).setBoardByOffset( _this.getQuickStepOffset()); });
	this.controlBarButton.play .bind(this.options.click, function(){ _this.lastSituationIndex() && _this.play(); });
	this.controlBarButton.pause.bind(this.options.click, function(){ _this.pause(); });

	for (var i in this.controlBarButton) {
		this.controlBar.append(this.controlBarButton[i]);
	}

	this.controlBarButton.play.addClass("vschess-control-bar-button-current");
	this.DOM.append(this.controlBar);
	return this;
};

// 自动播放
vschess.load.prototype.play = function(){
	this.getCurrentStep() >= this.lastSituationIndex() && this.setBoardByStep(0);
	this.interval.time = this.getPlayGap();
	this.controlBarButton.play .removeClass("vschess-control-bar-button-current");
	this.controlBarButton.pause.   addClass("vschess-control-bar-button-current");
	return this;
};

// 暂停播放
vschess.load.prototype.pause = function(playSound){
	this.interval.time = 0;
	this.controlBarButton.pause.removeClass("vschess-control-bar-button-current");
	this.controlBarButton.play .   addClass("vschess-control-bar-button-current");
	this.animating && this.stopAnimate(playSound);
	return this;
};

// 格式控制器
vschess.load.prototype.createFormatBar = function(){
	var _this = this;
	this.formatBar = $('<form method="post" action="' + this.options.cloudApi.savebook + '" class="vschess-format-bar"></form>');

	switch (this.getMoveFormat()) {
		case "wxf"		: var formarButton = "WXF"	; break;
		case "iccs"		: var formarButton = "ICCS"	; break;
		case "chinese"	: var formarButton = "\u4e2d \u6587"	; break;
	}

	this.formatBarButton = {
		copy		: $('<input type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-copy" value="\u590d \u5236" />'),
		format		: $('<input type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-format" value="\u683c \u5f0f" />'),
		help		: $('<input type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-help" value="\u5e2e \u52a9" />'),
		save		: $('<input type="submit" class="vschess-button vschess-format-bar-button vschess-format-bar-save" value="\u4fdd \u5b58" />'),
		chinese		: $('<input type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-chinese" value="\u4e2d \u6587" />'),
		wxf			: $('<input type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-wxf" value="WXF" />'),
		iccs		: $('<input type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-iccs" value="ICCS" />'),
		saveFormat	: $('<input type="hidden" name="format" value="DhtmlXQ" class="vschess-format-bar-save-format" />'),
		saveInput	: $('<textarea name="data" class="vschess-format-bar-save-input"></textarea>')
	};

	this.formatBarButton.format.bind(this.options.click, function(){
		_this.formatBarButton.chinese.toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .toggleClass("vschess-format-bar-button-change");
	});

	this.formatBarButton.help.bind(this.options.click, function(){
		_this.showHelpArea();
	});

	this.formatBar.bind("submit", function(){
		_this.rebuildExportDhtmlXQ();
		_this.formatBarButton.saveInput.val(_this.exportData.DhtmlXQ);
		_this.setSaved(true);
	});

	this.formatBarButton.chinese.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("chinese").refreshMoveListNode();
	});

	this.formatBarButton.wxf.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("wxf").refreshMoveListNode();
	});

	this.formatBarButton.iccs.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("iccs").refreshMoveListNode();
	});

	for (var i in this.formatBarButton) {
		this.formatBar.append(this.formatBarButton[i]);
	}

	this.formatBarButton.copy.bind(this.options.click, function(){
		if (document.execCommand && document.queryCommandSupported && document.queryCommandSupported('copy')) {
			_this.formatBarButton.saveInput.val(_this.getCurrentFen());
			_this.formatBarButton.saveInput[0].select();

			if (document.execCommand("copy")) {
				_this.copyFenFinish();
			}
			else {
				prompt("\u8bf7\u6309 Ctrl+C \u590d\u5236\uff1a", _this.getCurrentFen());
			}
		}
		else if (window.clipboardData) {
			if (window.clipboardData.setData("Text", _this.getCurrentFen())) {
				_this.copyFenFinish();
			}
			else {
				prompt("\u8bf7\u6309 Ctrl+C \u590d\u5236\uff1a", _this.getCurrentFen());
			}
		}
		else {
			prompt("\u8bf7\u6309 Ctrl+C \u590d\u5236\uff1a", _this.getCurrentFen());
		}
	});

	this.DOM.append(this.formatBar);
	return this.createCopyFinishTips().createHelp();
};

vschess.load.prototype.createCopyFinishTips = function(){
	this.copyFinishTips = $('<div class="vschess-copy-finish">\u5c40\u9762\u590d\u5236\u6210\u529f\uff0c\u60a8\u53ef\u4ee5\u76f4\u63a5\u5728\u8c61\u68cb\u8f6f\u4ef6\u4e2d\u7c98\u8d34\u4f7f\u7528\uff01</div>');
	this.DOM.append(this.copyFinishTips);
	return this;
};

// 复制成功提示
vschess.load.prototype.copyFenFinish = function(){
	var _this = this;
	this.copyFinishTips.addClass("vschess-copy-finish-show");
	setTimeout(function(){ _this.copyFinishTips.removeClass("vschess-copy-finish-show"); }, 1500);
	return this;
};

// 设置快进快退偏移量
vschess.load.prototype.setQuickStepOffset = function(quickStepOffset){
	this._.quickStepOffset = vschess.limit(quickStepOffset, 1, Infinity);
	this.refreshHelp();
	return this;
};

// 取得快进快退偏移量
vschess.load.prototype.getQuickStepOffset = function(){
	return this._.quickStepOffset;
};

// 设置自动播放时间间隔
vschess.load.prototype.setPlayGap = function(playGap){
	this._.playGap = vschess.limit(playGap, 1, Infinity);
	this.setConfigItemValue("playGap", this._.playGap);
	this.interval && this.interval.time && (this.interval.time = this.getPlayGap());
	return this;
};

// 取得自动播放时间间隔
vschess.load.prototype.getPlayGap = function(){
	return this._.playGap;
};

// 取得当前节点树路径下局面数量
vschess.load.prototype.getSituationListLength = function(){
	return this.situationList.length;
};

// 取得当前节点树路径下最后局面的索引号
vschess.load.prototype.lastSituationIndex = function(){
	return this.situationList.length - 1;
};

// 取得当前节点树路径下的所有 Fen 串
vschess.load.prototype.getFenList = function(){
	if (!this.getTurnForMove()) {
		return this.fenList;
	}

	var result = [];

	for (var i = 0; i < this.fenList.length; ++i) {
		result.push(vschess.turnFen(this.fenList[i]));
	}

	return result;
};

// 取得当前节点树路径下的所有节点 ICCS 着法，[0] 为初始 Fen 串
vschess.load.prototype.getMoveList = function(){
	return this.moveList.slice(0);
};

// 取得指定局面号 Fen 串
vschess.load.prototype.getFenByStep = function(step){
	return this.getFenList()[vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
};

// 取得指定局面号节点 ICCS 着法，step 为 0 时返回初始 Fen 串
vschess.load.prototype.getMoveByStep = function(step){
	return this.moveList[vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
};

// 取得当前 Fen 串
vschess.load.prototype.getCurrentFen = function(){
	return this.getFenByStep(this.getCurrentStep());
};

// 取得初始 Fen 串
vschess.load.prototype.getStartFen = function(){
	return this.getFenByStep(0);
};

// 取得当前节点 ICCS 着法，起始局面为初始 Fen 串
vschess.load.prototype.getCurrentMove = function(){
	return this.getMoveByStep(this.getCurrentStep());
};

// 取得指定局面号着法是否为吃子着法
vschess.load.prototype.getEatStatusByStep = function(step){
	return this.eatStatus[vschess.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep())];
};

// 取得 UCCI 着法列表
vschess.load.prototype.getUCCIList = function(step){
	step = vschess.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep());
	var startIndex = 0, result = [];

	for (var i = step; i >= 0 && !startIndex; --i) {
		this.eatStatus[i] && (startIndex = i);
	}

	result.push(this.fenList[startIndex]);
	result = result.concat(this.moveList.slice(startIndex + 1, step + 1));
	return result;
};

// 创建编辑局面区域
vschess.load.prototype.createEdit = function(){
	var _this = this;
	this.editTitle = $('<div class="vschess-tab-title vschess-tab-title-edit">\u68cb\u8c31\u5bfc\u5165</div>');
	this.editArea  = $('<div class="vschess-tab-body vschess-tab-body-edit"></div>');
	this.tabArea.children(".vschess-tab-title-edit, .vschess-tab-body-edit").remove();
	this.tabArea.append(this.editTitle);
	this.tabArea.append(this.editArea );
	this.editTitle.bind(this.options.click, function(){ _this.showTab("edit"); });
	this.createEditStartButton();
	this.createEditEndButton();
	this.createEditCancelButton();
	this.createEditTextarea();
	this.createEditPlaceholder();
	this.createEditPieceArea();
	this.createEditStartRound();
	this.createEditStartPlayer();
	this.createEditBoard();
	this.createRecommendList();
	this.createNodeStartButton();
	this.createNodeEndButton();
	this.createNodeCancelButton();
	this.createNodeEditTextarea();
	this.createNodeEditPlaceholder();
	this.createEditOtherButton();
	this.showEditStartButton();
	return this;
};

// 显示编辑开始按钮
vschess.load.prototype.showEditStartButton = function(){
	for (var i = 0; i < vschess.editStartList.length; ++i) {
		this[vschess.editStartList[i]].addClass("vschess-tab-body-edit-current");
	}

	return this;
};

// 隐藏编辑开始按钮
vschess.load.prototype.hideEditStartButton = function(){
	for (var i = 0; i < vschess.editStartList.length; ++i) {
		this[vschess.editStartList[i]].removeClass("vschess-tab-body-edit-current");
	}

	return this;
};

// 显示编辑局面组件
vschess.load.prototype.showEditModule = function(){
	for (var i = 0; i < vschess.editModuleList.length; ++i) {
		this[vschess.editModuleList[i]].addClass("vschess-tab-body-edit-current");
	}

	return this;
};

// 隐藏编辑局面组件
vschess.load.prototype.hideEditModule = function(){
	for (var i = 0; i < vschess.editModuleList.length; ++i) {
		this[vschess.editModuleList[i]].removeClass("vschess-tab-body-edit-current");
	}

	return this;
};

// 显示粘贴棋谱组件
vschess.load.prototype.showNodeEditModule = function(){
	for (var i = 0; i < vschess.editNodeModuleList.length; ++i) {
		this[vschess.editNodeModuleList[i]].addClass("vschess-tab-body-edit-current");
	}

	return this;
};

// 隐藏粘贴棋谱组件
vschess.load.prototype.hideNodeEditModule = function(){
	for (var i = 0; i < vschess.editNodeModuleList.length; ++i) {
		this[vschess.editNodeModuleList[i]].removeClass("vschess-tab-body-edit-current");
	}

	return this;
};

// 创建编辑局面区域开始编辑按钮
vschess.load.prototype.createEditStartButton = function(){
	var _this = this;
	this.editStartButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-start-button" value="\u7f16\u8f91\u5c40\u9762" />');
	this.editStartButton.appendTo(this.editArea);

	this.editStartButton.bind(this.options.click, function(){
		_this.pause(false);
		_this.fillInRecommendList(0);
		_this.hideEditStartButton();
		_this.hideNodeEditModule();
		_this.showEditModule();
		_this.fillEditBoardByFen(_this.getFenByStep(_this.getCurrentStep()));
		_this.editSelectedIndex = -99;
		_this.dragPiece = null;
	});

	return this;
};

// 创建编辑局面区域结束编辑按钮
vschess.load.prototype.createEditEndButton = function(){
	var _this = this;
	this.editEndButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-end-button" value="\u786e \u5b9a" />');
	this.editEndButton.appendTo(this.editArea);

	this.editEndButton.bind(this.options.click, function(){
		if (!_this.confirm("\u786e\u5b9a\u4f7f\u7528\u65b0\u7684\u5c40\u9762\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
			return false;
		}

		var fen				= vschess.situationToFen(_this.editSituation);
		var fenRound		= vschess.roundFen(fen);
		var errorList		= vschess.checkFen(fen);
		var errorListRound	= vschess.checkFen(fenRound);
		var turn = 0;

		if (errorList.length > errorListRound.length) {
			errorList = errorListRound;
			fen = fenRound;
			turn = 3;
		}

		if (errorList.length > 1) {
			var errorMsg = ["\u5f53\u524d\u5c40\u9762\u51fa\u73b0\u4e0b\u5217\u9519\u8bef\uff1a\n"];

			for (var i = 0; i < errorList.length; ++i) {
				errorMsg.push(i + 1, ".", errorList[i], i === errorList.length - 1 ? "\u3002\n" : "\uff1b\n");
			}

			alert(errorMsg.join(""));
		}
		else if (errorList.length > 0) {
			alert(errorList[0] + "\u3002");
		}
		else {
			_this.hideNodeEditModule();
			_this.hideEditModule();
			_this.showEditStartButton();
			_this.editTextarea.val("");
			_this.node = { fen: fen, comment: "", next: [], defaultIndex: 0 };
			_this.rebuildSituation();
			_this.setBoardByStep(0);
			_this.refreshMoveSelectListNode();
			_this.chessInfo = {};
			_this.insertInfoByCurrent();
			_this.refreshInfoEditor();
			_this.rebuildExportAll();
			_this.setExportFormat();
			_this.setTurn(turn);
			_this.setSaved(true);
		}
	});

	return this;
};

// 创建编辑局面区域取消编辑按钮
vschess.load.prototype.createEditCancelButton = function(){
	var _this = this;
	this.editCancelButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-cancel-button" value="\u53d6 \u6d88" />');
	this.editCancelButton.appendTo(this.editArea);

	this.editCancelButton.bind(this.options.click, function(){
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
	});
};

// 创建编辑局面区域输入框
vschess.load.prototype.createEditTextarea = function(){
	var _this = this;
	var UA = navigator.userAgent.toLowerCase(), contextMenu = "\u957f\u6309";
	!~UA.indexOf("android") && !~UA.indexOf("iph") && !~UA.indexOf("ipad") && (contextMenu = "\u53f3\u952e\u5355\u51fb");
	this.editTipsText = "\u70b9\u51fb\u53f3\u4fa7\u7684\u68cb\u5b50\u53ef\u5c06\u5176\u653e\u7f6e\u5728\u68cb\u76d8\u4e0a\uff0c" + contextMenu + "\u68cb\u76d8\u4e0a\u7684\u68cb\u5b50\u53ef\u4ee5\u5c06\u5176\u79fb\u9664\u3002";
	this.editTips = $('<input class="vschess-tab-body-edit-tips" value="' + this.editTipsText + '" readonly="readonly" />').appendTo(this.DOM);
	this.editTextarea = $('<textarea class="vschess-tab-body-edit-textarea"></textarea>').appendTo(this.editArea);

	this.editTextarea.bind("change" , function(){
		_this.fillEditBoardByText($(this).val());
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	this.editTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode == 13 && _this.editTextarea.blur(); });
	return this;
};

// 创建编辑局面区域空白提示
vschess.load.prototype.createEditPlaceholder = function(){
	var placeholderText = "\u8bf7\u5c06\u5c40\u9762\u4ee3\u7801\u7c98\u8d34\u5230\u8fd9\u91cc\uff0c\u652f\u6301\u6807\u51c6FEN\u3001\u4e1c\u840d\u8c61\u68cb\u3001\u8c61\u68cb\u4e16\u5bb6\u7b49\u683c\u5f0f\uff0c\u5176\u4ed6\u683c\u5f0f\u7a0b\u5e8f\u4f1a\u5c1d\u8bd5\u8fdb\u884c\u8bc6\u522b\u3002";

	if (vschess.placeholder) {
		this.editTextarea.attr({ "placeholder": placeholderText });
		this.editTextareaPlaceholder = $();
		return this;
	}

	var _this = this, editMonitor;
	this.editTextareaPlaceholder = $('<div class="vschess-tab-body-edit-textarea-placeholder">' + placeholderText + "</div>");
	this.editArea.append(this.editTextareaPlaceholder);
	this.editTextarea.bind("focus", function(){ editMonitor = setInterval(function(){ _this.editTextarea.val() ? _this.editTextareaPlaceholder.hide() : _this.editTextareaPlaceholder.show(); }, 20); });
	this.editTextarea.bind("blur" , function(){ clearInterval(editMonitor); });
	return this;
};

// 创建编辑局面区域棋子容器
vschess.load.prototype.createEditPieceArea = function(){
	var _this = this;
	var editPieceNameList = "RNBAKCP*rnbakcp".split("");
	this.editPieceArea = $('<div class="vschess-tab-body-edit-area"></div>');
	this.editArea.append(this.editPieceArea);
	this.editPieceList = {};

	for (var i = 0; i < editPieceNameList.length; ++i) {
		var k = editPieceNameList[i];

		if (k === "*") {
			this.editPieceArea.append('<div class="vschess-piece-disabled"></div>');
		}
		else {
			this.editPieceList[k] = $('<div class="vschess-piece vschess-piece-' + k + '" draggable="true"><span></span></div>');
			this.editPieceList[k].appendTo(this.editPieceArea);
		}
	}
	this.editPieceArea.bind("dragover", function(e){
		e.preventDefault();
		return true;
	});

	this.editPieceArea.bind("drop", function(e){
		_this.editRemovePiece(_this.dragPiece);
		_this.fillEditBoard();
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	$.each(this.editPieceList, function(i){
		var currentIndex = -vschess.f2n[i];

		this.bind(_this.options.click, function(e){
			_this.editRemoveSelect();

			if (_this.editSelectedIndex === -99) {
				$(this).addClass("vschess-piece-s");
				_this.editSelectedIndex = currentIndex;
			}
			else {
				if (_this.editSelectedIndex === currentIndex) {
					_this.editSelectedIndex = -99;
				}
				else {
					$(this).addClass("vschess-piece-s");
					_this.editSelectedIndex = currentIndex;
				}
			}
		});

		this.bind("selectstart", function(e) {
			e.preventDefault();
			return false;
		});
	
		this.bind("dragstart", function(e){
			e.originalEvent.dataTransfer.setData("text", e.originalEvent.target.innerHTML);
			_this.dragPiece = currentIndex;
			_this.editRemoveSelect();
			_this.editSelectedIndex = -99;
		});

		this.bind("drop", function(e) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
	});

	return this;
};

// 创建编辑局面区域开始回合数编辑框
vschess.load.prototype.createEditStartRound = function(){
	var _this = this;
	this.editEditStartText = $('<div class="vschess-tab-body-edit-start-text">\u56de\u5408\uff1a</div>');
	this.editEditStartText.appendTo(this.editArea);
	this.editEditStartRound = $('<input type="number" class="vschess-tab-body-edit-start-round" />');
	this.editEditStartRound.appendTo(this.editArea);

	this.editEditStartRound.bind("change", function(){
		_this.editSituation[1] = vschess.limit($(this).val(), 1, Infinity, 1);
		_this.fillEditBoard();
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	return this;
};

// 创建编辑局面区域先行走子方选项
vschess.load.prototype.createEditStartPlayer = function(){
	var _this = this;
	this.editEditStartPlayer = $('<div class="vschess-tab-body-edit-start-player"><span></span></div>');
	this.editEditStartPlayer.appendTo(this.editArea);

	this.editEditStartPlayer.bind(this.options.click, function(){
		_this.editSituation[0] = 3 - _this.editSituation[0];
		_this.fillEditBoard();
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	return this;
};

// 创建编辑局面专用棋盘
vschess.load.prototype.createEditBoard = function(){
	var _this = this;
	this.editBoard = $('<div class="vschess-board-edit"></div>');
	this.DOM.append(this.editBoard);
	this.editBoard.append(new Array(91).join('<div class="vschess-piece"><span></span></div>'));
	this.editPiece = this.editBoard.children(".vschess-piece");

	this.editPiece.each(function(i){
		$(this).bind(_this.options.click, function(){
			_this.editRemoveSelect();

			if (_this.editSelectedIndex === -99) {
				if (_this.editSituation[vschess.b2s[i]] > 1) {
					_this.editSelectedIndex = i;
					$(this).addClass("vschess-piece-s");
				}
			}
			else {
				_this.editSelectedIndex === i || _this.editMovePiece(_this.editSelectedIndex, i);
				_this.editSelectedIndex = -99;
			}

			_this.fillEditBoard(true);
			var currentFen = vschess.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
		});

		$(this).bind("contextmenu", function(){
			_this.editRemovePiece(i);
			_this.fillEditBoard();
			var currentFen = vschess.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
			return false;
		});

		$(this).bind("selectstart", function(e) {
			e.preventDefault();
			return false;
		});

		$(this).bind("dragstart", function(e){
			e.originalEvent.dataTransfer.setData("text", e.originalEvent.target.innerHTML);
			_this.dragPiece = i;
			_this.editRemoveSelect();
			_this.editSelectedIndex = -99;
		});

		$(this).bind("dragover", function(e){
			e.preventDefault();
			return true;
		});

		$(this).bind("drop", function(e){
			e.stopPropagation();
			e.preventDefault();

			if (_this.dragPiece !== i) {
				if (e.ctrlKey) {
					_this.editSituation[vschess.b2s[i]] = _this.editSituation[vschess.b2s[_this.dragPiece]];
				}
				else {
					_this.editMovePiece(_this.dragPiece, i);
				}
			}

			_this.fillEditBoard();
			var currentFen = vschess.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
		});
	});

	return this;
};

// 编辑器移动一枚棋子
vschess.load.prototype.editMovePiece = function(from, to){
	if (from >= 0) {
		this.editSituation[vschess.b2s[to]] = this.editSituation[vschess.b2s[from]];
		this.editRemovePiece(from);
	}
	else if (from > -99) {
		this.editSituation[vschess.b2s[to]] = -from;
	}

	return this;
};

// 编辑器移除一枚棋子
vschess.load.prototype.editRemovePiece = function(i){
	i >= 0 && (this.editSituation[vschess.b2s[i]] = 1);
	return this;
};

// 编辑器移除选中状态
vschess.load.prototype.editRemoveSelect = function(){
	$.each(this.editPieceList, function(){ $(this).removeClass("vschess-piece-s"); });
	this.editPiece.removeClass("vschess-piece-s");
	return this;
};

// 创建推荐开局列表（云服务）
vschess.load.prototype.createRecommendList = function(){
	var _this = this;
	this.recommendClass = $('<select class="vschess-recommend-class"></select>');
	this.recommendList = $('<ul class="vschess-recommend-list"></ul>');
	this.DOM.append(this.recommendClass);
	this.DOM.append(this.recommendList );
	this.recommendClass.bind("change", function(){ _this.fillInRecommendList(this.selectedIndex); });

	if (this.options.cloudApi && this.options.cloudApi.startFen) {
		$.ajax({
			url: this.options.cloudApi.startFen,
			dataType: "jsonp",
			success: function(data){
				typeof data === "string" && (data = $.parseJSON(data));

				if (data.code === 0) {
					_this.recommendStartList = _this.options.recommendList.concat(data.data);
					_this.fillInRecommendClass();
				}
				else {
				}
			},
			error: function(){
				_this.recommendStartList = _this.options.recommendList.slice(0);
				_this.fillInRecommendClass();
			}
		});
	}

	return this;
};

// 填充推荐开局分类列表
vschess.load.prototype.fillInRecommendClass = function(){
	this.recommendStartClassItem = [];

	for (var i = 0; i < this.recommendStartList.length; ++i) {
		var classItem = $(['<option value="', i, '">', this.recommendStartList[i].name, '</option>'].join("")).appendTo(this.recommendClass);
		this.recommendStartClassItem.push(classItem);
	}

	return this;
};

// 填充推荐开局列表
vschess.load.prototype.fillInRecommendList = function(classId){
	var _this = this;
	this.recommendList.empty();
	var list = this.recommendStartList[classId].fenList;

	for (var i = 0; i < list.length; ++i) {
		var recommendStart = $(['<li class="vschess-recommend-list-fen" data-fen="', list[i].fen, '"><span>', i + 1, '.</span>', list[i].name, '</li>'].join(""));
		this.recommendList.append(recommendStart);

		recommendStart.bind(this.options.click, function(){
			var fen = $(this).data("fen");
			_this.fillEditBoardByFen(fen);
			_this.editTips.val(fen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : fen);
		});
	}

	return this;
};

// 尝试识别文本棋谱
vschess.load.prototype.fillEditBoardByText = function(chessData){
	var RegExp = vschess.RegExp(), RegExp_Match, fen = vschess.blankFen;

	if (~chessData.indexOf("[DhtmlXQ]")) {
		fen = vschess.dataToNode_DhtmlXQ(chessData, true);
	}
	else if (RegExp_Match = RegExp.ShiJia.exec(chessData)) {
		fen = vschess.dataToNode_ShiJia(chessData, true);
	}
	else if (RegExp_Match = RegExp.FenLong.exec(chessData)) {
		fen = RegExp_Match[0];
	}
	else if (RegExp_Match = RegExp.FenShort.exec(chessData)) {
		fen = RegExp_Match[0] + " - - 0 1";
	}

	return this.fillEditBoardByFen(fen);
};

// 将 Fen 串导入局面编辑区
vschess.load.prototype.fillEditBoardByFen = function(fen){
	this.editSituation = vschess.fenToSituation(fen);
	this.fillEditBoard();
	return this;
};

// 将当前编辑局面展示到视图中
vschess.load.prototype.fillEditBoard = function(ignoreSelect){
	var selected = this.editPiece.filter(".vschess-piece-s");
	this.editPiece.removeClass().addClass("vschess-piece").removeAttr("draggable");
	ignoreSelect && selected.addClass("vschess-piece-s");
	this.editEditStartRound.val(this.editSituation[1]);
	this.editEditStartPlayer.removeClass("vschess-tab-body-edit-start-player-black");
	this.editSituation[0] === 2 && this.editEditStartPlayer.addClass("vschess-tab-body-edit-start-player-black");

	for (var i = 51; i < 204; ++i) {
		this.editSituation[i] > 1 && this.editPiece.eq(vschess.s2b[i]).addClass("vschess-piece-" + vschess.n2f[this.editSituation[i]]).attr({ draggable: true });
	}

	return this;
};

// 创建粘贴棋谱区域开始编辑按钮
vschess.load.prototype.createNodeStartButton = function(){
	var _this = this;
	this.editNodeStartButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-node-start-button" value="\u7c98\u8d34\u68cb\u8c31" />');
	this.editNodeStartButton.appendTo(this.editArea);

	this.editNodeStartButton.bind(this.options.click, function(){
		_this.pause(false);
		_this.hideEditModule();
		_this.hideEditStartButton();
		_this.showNodeEditModule();
	});

	return this;
};

// 创建粘贴棋谱区域完成编辑按钮
vschess.load.prototype.createNodeEndButton = function(){
	var _this = this;
	this.editNodeEndButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-node-end-button" value="\u786e \u5b9a" />');
	this.editNodeEndButton.appendTo(this.editArea);

	this.editNodeEndButton.bind(this.options.click, function(){
		if (!_this.confirm("\u786e\u5b9a\u4f7f\u7528\u65b0\u7684\u68cb\u8c31\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
			return false;
		}

		var chessData = _this.editNodeTextarea.val();
		_this.editNodeTextarea.val("");
		_this.setBoardByStep(0);
		_this.node = vschess.dataToNode(chessData);
		_this.rebuildSituation().refreshMoveSelectListNode().setBoardByStep(0);
		_this.chessInfo = vschess.dataToInfo(chessData, "auto");
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
		_this.setSaved(true);
	});

	return this;
};

// 创建粘贴棋谱区域取消编辑按钮
vschess.load.prototype.createNodeCancelButton = function(){
	var _this = this;
	this.editNodeCancelButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-node-cancel-button" value="\u53d6 \u6d88" />');
	this.editNodeCancelButton.appendTo(this.editArea);

	this.editNodeCancelButton.bind(this.options.click, function(){
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
	});

	return this;
};

// 创建粘贴棋谱区域输入框
vschess.load.prototype.createNodeEditTextarea = function(){
	var _this = this;
	this.editNodeTextarea = $('<textarea class="vschess-tab-body-edit-node-textarea"></textarea>').appendTo(this.editArea);
	this.editNodeTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode == 13 && _this.editNodeTextarea.blur(); });
	return this;
};

// 创建粘贴棋谱区域空白提示
vschess.load.prototype.createNodeEditPlaceholder = function(){
	var placeholderText = "\u8bf7\u5c06\u68cb\u8c31\u4ee3\u7801\u7c98\u8d34\u5230\u8fd9\u91cc\uff0c\u6216\u8005\u76f4\u63a5\u5c06\u68cb\u8c31\u6587\u4ef6\u62d6\u62fd\u5230\u68cb\u76d8\u4e0a\u3002\u652f\u6301\u6807\u51c6PGN\u3001\u4e1c\u840d\u8c61\u68cb DhtmlXQ\u3001\u9e4f\u98de\u8c61\u68cb PFC\u3001\u8c61\u68cb\u4e16\u5bb6\u3001QQ \u65b0\u4e2d\u56fd\u8c61\u68cb\u7b49\u683c\u5f0f\uff0c\u5176\u4ed6\u683c\u5f0f\u7a0b\u5e8f\u4f1a\u5c1d\u8bd5\u8fdb\u884c\u8bc6\u522b\u3002";

	if (vschess.placeholder) {
		this.editNodeTextarea.attr({ "placeholder": placeholderText });
		this.editNodeTextareaPlaceholder = $();
		return this;
	}

	var _this = this, editMonitor;
	this.editNodeTextareaPlaceholder = $('<div class="vschess-tab-body-edit-node-textarea-placeholder">' + placeholderText + "</div>");
	this.editArea.append(this.editNodeTextareaPlaceholder);
	this.editNodeTextarea.bind("focus", function(){ editMonitor = setInterval(function(){ _this.editNodeTextarea.val() ? _this.editNodeTextareaPlaceholder.hide() : _this.editNodeTextareaPlaceholder.show(); }, 20); });
	this.editNodeTextarea.bind("blur" , function(){ clearInterval(editMonitor); });
	return this;
};

// 创建其他按钮
vschess.load.prototype.createEditOtherButton = function(){
	var _this = this;

	// 打开棋谱按钮
	var buttonId = "vschess-tab-body-edit-open-button-" + vschess.guid();
	this.editOpenButton = $('<label for="' + buttonId + '" class="vschess-button vschess-tab-body-edit-open-button">\u6253\u5f00\u68cb\u8c31</label>');
	this.editOpenButton.appendTo(this.editArea);
	this.editOpenFile = $('<input type="file" class="vschess-tab-body-edit-open-file" id="' + buttonId + '" />');
	this.editOpenFile.appendTo(this.editArea);

	this.editOpenFile.bind("change", function(){
		if (typeof FileReader === "function") {
			if (this.files.length) {
				var file = this.files[0];
				var reader = new FileReader();
				reader.readAsArrayBuffer(file);
				reader.onload = function(){
					if (!_this.confirm("\u786e\u5b9a\u6253\u5f00\u8be5\u68cb\u8c31\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
						return false;
					}
	
					var RegExp = vschess.RegExp();
					var fileData = new Uint8Array(this.result);
					var chessData = vschess.join(fileData);
					fileData[0] !== 1 && !RegExp.ShiJia.test(chessData) && (chessData = vschess.iconv2UTF8(fileData));
					_this.setBoardByStep(0);
					_this.node = vschess.dataToNode(chessData);
					_this.rebuildSituation().refreshMoveSelectListNode().setBoardByStep(0);
					_this.chessInfo = vschess.dataToInfo(chessData, "auto");
					_this.insertInfoByCurrent();
					_this.refreshInfoEditor();
					_this.rebuildExportAll();
					_this.setExportFormat();
					_this.editNodeTextarea.val("");
					_this.hideNodeEditModule();
					_this.hideEditModule();
					_this.showEditStartButton();
					_this.setSaved(true);
				}
			}
		}
		else {
			alert("\u5bf9\u4e0d\u8d77\uff0c\u8be5\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u6253\u5f00\u68cb\u8c31\u3002");
		}

		this.value = "";
	});

	// 重新开局按钮
	this.editBeginButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-begin-button" value="\u91cd\u65b0\u5f00\u5c40" />');
	this.editBeginButton.appendTo(this.editArea);

	this.editBeginButton.bind(this.options.click, function(){
		if (!_this.confirm("\u786e\u5b9a\u91cd\u65b0\u5f00\u5c40\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
			return false;
		}

		_this.node = { fen: vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
		_this.rebuildSituation();
		_this.setBoardByStep(0);
		_this.refreshMoveSelectListNode();
		_this.chessInfo = {};
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
		_this.setTurn(0);
		_this.setSaved(true);
	});

	// 清空棋盘按钮
	this.editBlankButton = $('<input type="button" class="vschess-button vschess-tab-body-edit-blank-button" value="\u6e05\u7a7a\u68cb\u76d8" />');
	this.editBlankButton.appendTo(this.editArea);

	this.editBlankButton.bind(this.options.click, function(){
		_this.pause(false);
		_this.fillInRecommendList(0);
		_this.hideEditStartButton();
		_this.hideNodeEditModule();
		_this.showEditModule();
		_this.fillEditBoardByFen(vschess.blankFen);
		_this.editSelectedIndex = -99;
		_this.dragPiece = null;
	});

	return this;
};

// 绑定拖拽棋谱事件
vschess.load.prototype.bindDrag = function(){
	var _this = this;

	this.DOM.on("dragover", function(e){
		e.preventDefault();
	});
	
	this.DOM.on("drop", function(e){
		e.preventDefault();

		if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
			var file = e.originalEvent.dataTransfer.files[0];
			var reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = function(){
				if (!_this.confirm("\u786e\u5b9a\u4f7f\u7528\u65b0\u7684\u68cb\u8c31\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
					return false;
				}

				var RegExp = vschess.RegExp();
				var fileData = new Uint8Array(this.result);
				var chessData = vschess.join(fileData);
				fileData[0] !== 1 && !RegExp.ShiJia.test(chessData) && (chessData = vschess.iconv2UTF8(fileData));
				_this.setBoardByStep(0);
				_this.node = vschess.dataToNode(chessData);
				_this.rebuildSituation().refreshMoveSelectListNode().setBoardByStep(0);
				_this.chessInfo = vschess.dataToInfo(chessData, "auto");
				_this.insertInfoByCurrent();
				_this.refreshInfoEditor();
				_this.rebuildExportAll();
				_this.setExportFormat();
				_this.editNodeTextarea.val("");
				_this.hideNodeEditModule();
				_this.hideEditModule();
				_this.showEditStartButton();
				_this.setSaved(true);
				_this.hideHelpArea();
				_this.hideInfoEditor();
			}
		}
	});
};

// 确认提示框
vschess.load.prototype.confirm = function(str){
	if (this.getSaveTips() && !this.getSaved()) {
		return confirm(str);
	}
	else {
		return true;
	}
};

// 设置保存状态
vschess.load.prototype.setSaved = function(status){
	this._.saved = !!status;
	return this;
};

// 取得保存状态
vschess.load.prototype.getSaved = function(){
	return this._.saved;
};

// 设置保存提示状态
vschess.load.prototype.setSaveTips = function(status){
	this._.saveTips = !!status;
	this.setConfigItemValue("saveTips", this._.saveTips);
	return this;
};

// 取得保存提示状态
vschess.load.prototype.getSaveTips = function(){
	return this._.saveTips;
};

// 创建导出棋谱区域
vschess.load.prototype.createExport = function(){
	var _this = this;
	this.exportTitle    = $('<div class="vschess-tab-title vschess-tab-title-export">\u68cb\u8c31\u5bfc\u51fa</div>');
	this.exportArea     = $('<form method="post" action="' + this.options.cloudApi.saveBook + '" class="vschess-tab-body vschess-tab-body-export"></form>');
	this.exportTextarea = $('<textarea class="vschess-tab-body-export-textarea" readonly="readonly" name="data"></textarea>').appendTo(this.exportArea);
	this.exportFormat   = $('<select class="vschess-tab-body-export-format" name="format"></select>').appendTo(this.exportArea);
	this.exportGenerate = $('<input type="button" class="vschess-button vschess-tab-body-export-generate" value="\u751f \u6210" />').appendTo(this.exportArea);
	this.exportDownload = $('<input type="submit" class="vschess-button vschess-tab-body-export-download vschess-tab-body-export-current" value="\u4fdd \u5b58" />').appendTo(this.exportArea);
	this.exportData     = {};
	this.tabArea.children(".vschess-tab-title-export, .vschess-tab-body-export").remove();
	this.tabArea.append(this.exportTitle);
	this.tabArea.append(this.exportArea );
	this.exportTitle.bind(this.options.click, function(){ _this.showTab("export"); });
	this.createExportList();
	return this;
};

// 创建导出格式列表
vschess.load.prototype.createExportList = function(){
	var _this = this, generating = false;
	this.exportFormatOptions = {};

	for (var i in vschess.exportFormatList) {
		this.exportFormatOptions[i] = $('<option value="' + i + '">' + vschess.exportFormatList[i] + '</option>');
		this.exportFormatOptions[i].addClass("vschess-tab-body-export-format-options");
		this.exportFormatOptions[i].addClass("vschess-tab-body-export-format-options-" + i);
		this.exportFormat.append(this.exportFormatOptions[i]);
	}

	this.exportFormat.bind("change", function(){
		if (_this.getNodeLength() >= 10000 && (this.value === "PengFei" || this.value === "DhtmlXQ")) {
			_this.exportDownload.removeClass("vschess-tab-body-export-current");
			_this.exportGenerate.   addClass("vschess-tab-body-export-current");
			_this.setExportFormat(this.value, "");
		}
		else {
			_this.exportGenerate.removeClass("vschess-tab-body-export-current");
			_this.exportDownload.   addClass("vschess-tab-body-export-current");
			_this.setExportFormat(this.value);
		}
	});

	this.exportGenerate.bind(this.options.click, function(){
		if (generating) {
			return false;
		}

		generating = true;
		_this.exportTextarea.val("\u6b63\u5728\u751f\u6210\u68cb\u8c31\uff0c\u8bf7\u7a0d\u5019\u3002");

		setTimeout(function(){
			switch (_this.exportFormat.val()) {
				case "PengFei": _this.rebuildExportPengFei(); _this.setExportFormat("PengFei", true); break;
				default       : _this.rebuildExportDhtmlXQ(); _this.setExportFormat("DhtmlXQ", true); break;
			}
	
			_this.exportGenerate.removeClass("vschess-tab-body-export-current");
			_this.exportDownload.   addClass("vschess-tab-body-export-current");
			generating = false;
		}, vschess.threadTimeout);
	});

	return this;
};

// 取得当前导出格式
vschess.load.prototype.getExportFormat = function(){
	return this._.exportFormat || "DhtmlXQ";
};

// 设置当前导出格式
vschess.load.prototype.setExportFormat = function(format, force){
	format = format || this.getExportFormat();
	this._.exportFormat = vschess.exportFormatList[format] ? format : this.getExportFormat();

	if (this.getNodeLength() >= 10000 && (format === "PengFei" || format === "DhtmlXQ") && !force) {
		// 大棋谱需要加参数才同步
		this.exportDownload.removeClass("vschess-tab-body-export-current");
		this.exportGenerate.   addClass("vschess-tab-body-export-current");
		this.exportTextarea.val("\u8bf7\u70b9\u51fb\u201d\u751f\u6210\u201c\u6309\u94ae\u751f\u6210\u68cb\u8c31\u3002");
	}
	else {
		this.exportGenerate.removeClass("vschess-tab-body-export-current");
		this.exportDownload.   addClass("vschess-tab-body-export-current");
		this.exportTextarea.val(this.exportData[this.getExportFormat() + (this.getTurnForMove() ? "M" : "")]);
	}

	return this;
};

// 重建所有棋谱
vschess.load.prototype.rebuildExportAll = function(all){
	var nodeLength = this.refreshNodeLength();
	this.rebuildExportPGN();
	this.rebuildExportText();
	this.rebuildExportQQ();

	// 大棋谱生成东萍 DhtmlXQ 格式和鹏飞 PFC 格式比较拖性能
	(nodeLength < 10000 || all) && this.rebuildExportPengFei();
	(nodeLength < 10000 || all) && this.rebuildExportDhtmlXQ();

	this.hideExportFormatIfNeedStart();
	return this;
};

// 重建 PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN = function(){
	this.rebuildExportPGN_Chinese();
	this.rebuildExportPGN_WXF    ();
	this.rebuildExportPGN_ICCS   ();
	return this;
};

// 重建中文 PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN_Chinese = function(){
	var moveList  = this.moveNameList.Chinese .slice(0);
	var moveListM = this.moveNameList.ChineseM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_Chinese  = vschess.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_ChineseM = vschess.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 WXF PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN_WXF = function(turn){
	var moveList  = this.moveNameList.WXF .slice(0);
	var moveListM = this.moveNameList.WXFM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_WXF  = vschess.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_WXFM = vschess.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 ICCS PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN_ICCS = function(turn){
	var moveList  = this.moveNameList.ICCS .slice(0);
	var moveListM = this.moveNameList.ICCSM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_ICCS  = vschess.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_ICCSM = vschess.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建文本 TXT 格式棋谱
vschess.load.prototype.rebuildExportText = function(){
	var moveList  = this.moveNameList.Chinese .slice(0);
	var moveListM = this.moveNameList.ChineseM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.Text  = vschess.moveListToText(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.TextM = vschess.moveListToText(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 QQ 象棋 CHE 格式棋谱
vschess.load.prototype.rebuildExportQQ = function(){
	var moveList = this.moveList.slice(1);
	this.exportData.QQ  = vschess.moveListToData_QQ(moveList      );
	this.exportData.QQM = vschess.moveListToData_QQ(moveList, true);
	return this;
};

// 重建鹏飞 PFC 格式棋谱
vschess.load.prototype.rebuildExportPengFei = function(){
	this.exportData.PengFei  = vschess.nodeToData_PengFei(this.node, this.chessInfo, this.getResultByCurrent());
	this.exportData.PengFeiM = vschess.turn_PengFei(this.exportData.PengFei);
	return this;
};

// 重建东萍 Dhtml 格式棋谱
vschess.load.prototype.rebuildExportDhtmlXQ = function(){
	this.exportData.DhtmlXQ  = vschess.nodeToData_DhtmlXQ(this.node, this.chessInfo);
	this.exportData.DhtmlXQM = vschess.turn_DhtmlXQ(this.exportData.DhtmlXQ);
	return this;
};

// 非标准起始局面隐藏掉部分不支持的导出格式
vschess.load.prototype.hideExportFormatIfNeedStart = function(){
	if (this.getFenByStep(0).split(" ", 2).join(" ") === vschess.defaultFen.split(" ", 2).join(" ")) {
		for (var i in vschess.exportFormatList) {
			this.exportFormatOptions[i].show();
		}
	}
	else {
		for (var i=0;i<vschess.exportFormatListIfNeedStart.length;++i) {
			this.exportFormatOptions[vschess.exportFormatListIfNeedStart[i]].hide();
		}
	}

	return this;
};

// 创建帮助区域
vschess.load.prototype.createHelp = function(){
	var _this = this;
	var helpDetail = this.options.help.replace(/#quickStepOffsetRound#/g, this._.quickStepOffset / 2).replace(/#quickStepOffset#/g, this._.quickStepOffset);
	this.helpArea = $('<div class="vschess-help-area"></div>');
	this.helpArea.html('<div class="vschess-help-area-detail">' + helpDetail + '</div>');
	this.DOM.append(this.helpArea);
	this.helpAreaClose = $('<input type="button" class="vschess-button vschess-help-close" value="\u5173 \u95ed" />');
	this.helpAreaClose.bind(this.options.click, function(){ _this.hideHelpArea(); });
	this.helpArea.append(this.helpAreaClose);
	return this;
};

// 刷新帮助信息
vschess.load.prototype.refreshHelp = function(){
	var helpDetail = this.options.help.replace(/#quickStepOffsetRound#/g, this._.quickStepOffset / 2).replace(/#quickStepOffset#/g, this._.quickStepOffset);
	this.helpArea.children(".vschess-help-area-detail").html(helpDetail);
	return this;
};

// 显示帮助区域
vschess.load.prototype.showHelpArea = function(){
	this.helpArea.addClass("vschess-help-show");
	return this;
};

// 隐藏帮助区域
vschess.load.prototype.hideHelpArea = function(){
	this.helpArea.removeClass("vschess-help-show");
	return this;
};

// 创建棋局信息区域
vschess.load.prototype.createInfo = function(){
	var _this = this;
	this.infoTitle = $('<div class="vschess-tab-title vschess-tab-title-info">\u68cb\u5c40\u4fe1\u606f</div>');
	this.infoArea  = $('<div class="vschess-tab-body vschess-tab-body-info"></div>');
	this.tabArea.children(".vschess-tab-title-info, .vschess-tab-body-info").remove();
	this.tabArea.append(this.infoTitle);
	this.tabArea.append(this.infoArea );
	this.infoTitle.bind(this.options.click, function(){ _this.showTab("info"); });
	this.createInfoList();
	this.createInfoEditor();
	return this;
};

// 创建棋局信息列表
vschess.load.prototype.createInfoList = function(){
	var _this = this;
	this.chessInfo = vschess.dataToInfo(this.chessData, this.options.parseType);
	this.setChessTitle(this.chessInfo && this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb");
	this.infoList = $('<ul class="vschess-tab-body-info-list"></ul>');
	this.infoArea.append(this.infoList);
	this.insertInfoByCurrent();
	this.infoEdit  = $('<input type="button" class="vschess-button vschess-tab-body-info-edit"  value="\u7f16 \u8f91" />');
	this.infoEmpty = $('<input type="button" class="vschess-button vschess-tab-body-info-empty" value="\u6e05 \u7a7a" />');
	this.infoArea.append(this.infoEdit );
	this.infoArea.append(this.infoEmpty);
	this.infoEdit.bind(this.options.click, function(){ _this.showInfoEditor(); });

	this.infoEmpty.bind(this.options.click, function(){
		if (!confirm("\u786e\u5b9a\u8981\u6e05\u7a7a\u6240\u6709\u4fe1\u606f\u5417\uff1f")) {
			return false;
		}

		_this.chessInfo = {};
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
	});

	return this;
};

// 填充当前棋谱信息
vschess.load.prototype.insertInfoByCurrent = function(){
	this.infoItem = {};
	this.infoList.empty();

	for (var i in this.chessInfo) {
		this.infoItem[i] = $('<li class="vschess-tab-body-info-item">' + vschess.info.name[i] + '\uff1a' + vschess.showText(this.chessInfo[i], i) + '</li>');
		this.infoList.append(this.infoItem[i]);
	}
};

// 创建棋局信息编辑器
vschess.load.prototype.createInfoEditor = function(){
	var _this = this;
	this.infoEditorArea = $('<div class="vschess-info-editor-area"></div>');
	this.infoEditorList = $('<ul class="vschess-info-editor-list"></ul>');
	this.infoEditorArea.append(this.infoEditorList);
	this.infoEditorItem = {};
	this.infoEditorItemName  = {};
	this.infoEditorItemValue = {};
	this.infoEditorItemAuto  = {};
	this.DOM.append(this.infoEditorArea);

	for (var i in vschess.info.name) {
		this.infoEditorItem[i] = $('<li class="vschess-info-editor-item vschess-info-editor-item-' + i + '"></li>');
		this.infoEditorItemName [i] = $('<div class="vschess-info-editor-item-name vschess-info-editor-item-name-' + i + '">' + vschess.info.name[i] + '\uff1a</div></li>');
		this.infoEditorItemValue[i] = $('<input type="' + (i == "date" ? "date" : "text") + '" class="vschess-info-editor-item-value vschess-info-editor-item-value-' + i + '" value="' + vschess.dataText(this.chessInfo[i] || "", i) + '" />');
		this.infoEditorItem[i].append(this.infoEditorItemName [i]);
		this.infoEditorItem[i].append(this.infoEditorItemValue[i]);
		this.infoEditorList.append(this.infoEditorItem[i]);

		if (i === "result") {
			var radio_name = "vschess-info-editor-item-value-result-radio-name-" + vschess.guid();
			var r_randomId = "vschess-info-editor-item-value-result-label-id-r-" + vschess.guid();
			var b_randomId = "vschess-info-editor-item-value-result-label-id-b-" + vschess.guid();
			var d_randomId = "vschess-info-editor-item-value-result-label-id-d-" + vschess.guid();
			var u_randomId = "vschess-info-editor-item-value-result-label-id-u-" + vschess.guid();

			this.infoEditorItemValueResult = {
				r_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-r" for="' + r_randomId + '">\u7ea2\u80dc</label>'),
				b_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-b" for="' + b_randomId + '">\u9ed1\u80dc</label>'),
				d_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-d" for="' + d_randomId + '">\u548c\u68cb</label>'),
				u_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-u" for="' + u_randomId + '">\u672a\u77e5</label>'),
				r_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-r" id="' + r_randomId + '" />'),
				b_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-b" id="' + b_randomId + '" />'),
				d_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-d" id="' + d_randomId + '" />'),
				u_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-u" id="' + u_randomId + '" />')
			};

			this.infoEditorItem.result.append(this.infoEditorItemValueResult.r_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.r_label);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.b_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.b_label);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.d_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.d_label);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.u_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.u_label);
		}

		if (~vschess.autoInfo.indexOf(i)) {
			this.infoEditorItemAuto[i] = $('<input type="button" class="vschess-button vschess-info-editor-item-auto vschess-info-editor-item-auto-' + i + '" value="\u8bc6 \u522b" alt="\u6839\u636e\u5f53\u524d\u5206\u652f\u81ea\u52a8\u8bc6\u522b' + vschess.info.name[i] + '" title="\u6839\u636e\u5f53\u524d\u5206\u652f\u81ea\u52a8\u8bc6\u522b' + vschess.info.name[i] + '" />');
			this.infoEditorItem[i].append(this.infoEditorItemAuto[i]);
		}
	}

	this.setInfoEditorItemValueResult(this.infoEditorItemValue.result.val());
	this.infoEditorOK     = $('<input type="button" class="vschess-button vschess-info-editor-ok"     value="\u786e \u5b9a" />');
	this.infoEditorEmpty  = $('<input type="button" class="vschess-button vschess-info-editor-empty"  value="\u6e05 \u7a7a" />');
	this.infoEditorCancel = $('<input type="button" class="vschess-button vschess-info-editor-cancel" value="\u53d6 \u6d88" />');

	this.infoEditorOK.bind(this.options.click, function(){
		_this.chessInfo = _this.getInfoFromEditor();
		_this.setChessTitle(_this.chessInfo && _this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb");
		_this.insertInfoByCurrent();
		_this.hideInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
	});

	this.infoEditorEmpty.bind(this.options.click, function(){
		if (!confirm("\u786e\u5b9a\u8981\u6e05\u7a7a\u6240\u6709\u4fe1\u606f\u5417\uff1f")) {
			return false;
		}

		for (var i in vschess.info.name) {
			_this.infoEditorItemValue[i].val("");
		}
	});

	this.infoEditorCancel.bind(this.options.click, function(){ _this.hideInfoEditor(); });
	this.infoEditorArea.append(this.infoEditorOK    );
	this.infoEditorArea.append(this.infoEditorEmpty );
	this.infoEditorArea.append(this.infoEditorCancel);
	this.infoEditorItemAuto.ecco          .bind(this.options.click, function(){ _this.infoEditorItemValue.ecco     .val(vschess.WXF2ECCO(_this.moveNameList.WXF).ecco     ); });
	this.infoEditorItemAuto.open          .bind(this.options.click, function(){ _this.infoEditorItemValue.open     .val(vschess.WXF2ECCO(_this.moveNameList.WXF).opening  ); });
	this.infoEditorItemAuto.variation     .bind(this.options.click, function(){ _this.infoEditorItemValue.variation.val(vschess.WXF2ECCO(_this.moveNameList.WXF).variation); });
	this.infoEditorItemValueResult.r_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("1-0"    ); });
	this.infoEditorItemValueResult.b_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("0-1"    ); });
	this.infoEditorItemValueResult.d_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("1/2-1/2"); });
	this.infoEditorItemValueResult.u_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("*"      ); });

	this.infoEditorItemAuto.result.bind(this.options.click, function(){
		var result = _this.getAutoResultByCurrent();
		_this.infoEditorItemValue.result.val(result);
		_this.setInfoEditorItemValueResult(result);
	});

	return this;
};

// 刷新棋局信息编辑器
vschess.load.prototype.refreshInfoEditor = function(){
	for (var i in vschess.info.name) {
		if (i === "result") {
			var result = vschess.dataText(this.chessInfo[i] || "", i);
			this.infoEditorItemValue.result.val(result);
			this.setInfoEditorItemValueResult(result);
		}
		else {
			this.infoEditorItemValue[i].val(vschess.dataText(this.chessInfo[i] || "", i));
		}
	}

	return this.setChessTitle(this.chessInfo && this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb");
};

// 根据结果设置选择结果单选按钮
vschess.load.prototype.setInfoEditorItemValueResult = function(result){
	switch (result) {
		case     "1-0": this.infoEditorItemValueResult.r_radio.attr("checked", "checked"); break;
		case     "0-1": this.infoEditorItemValueResult.b_radio.attr("checked", "checked"); break;
		case "1/2-1/2": this.infoEditorItemValueResult.d_radio.attr("checked", "checked"); break;
		default       : this.infoEditorItemValueResult.u_radio.attr("checked", "checked"); break;
	}

	return this;
};

// 设置棋盘标题
vschess.load.prototype.setChessTitle = function(title){
	this.title.text(title);
	return this;
};

// 显示棋局信息编辑器
vschess.load.prototype.showInfoEditor = function(){
	this.infoEditorArea.addClass("vschess-info-editor-show");
	return this;
};

// 隐藏棋局信息编辑器
vschess.load.prototype.hideInfoEditor = function(){
	this.infoEditorArea.removeClass("vschess-info-editor-show");
	return this;
};

// 从编辑器中获取最新棋谱信息数据
vschess.load.prototype.getInfoFromEditor = function(){
	var newInfo = {};

	for (var i in vschess.info.name) {
		var value = this.infoEditorItemValue[i].val();
		value && (newInfo[i] = value);
	}

	return newInfo;
};

// 获取当前对弈结果
vschess.load.prototype.getResultByCurrent = function(){
	return this.infoEditorItemValue.result.val() || this.getAutoResultByCurrent();
};

// 自动识别当前分支的对弈结果
vschess.load.prototype.getAutoResultByCurrent = function(){
	var lastSituation = this.situationList[this.lastSituationIndex()];
	return !vschess.legalList(lastSituation).length ? lastSituation[0] == 1 ? "0-1" : "1-0" : "*";
};

// 着法选择列表
vschess.load.prototype.createMoveSelectList = function(){
	this.DOM.children(".vschess-move-select-list").remove();
	this.moveSelectList = $('<ul class="vschess-move-select-list"></ul>');
	this.DOM.append(this.moveSelectList);
	return this;
};

// 刷新着法选择列表内所有着法
vschess.load.prototype.refreshMoveSelectListNode = function(){
	var _this = this;
	var startRound = this.situationList[0][1];
	var selectListNode = ['<li class="vschess-move-select-node-begin">===== \u68cb\u5c40\u5f00\u59cb' + (this.commentList[0] ? "*" : "") + ' =====</li>'];

	switch (this.getMoveFormat()) {
		case "iccs": var moveList = this.getTurnForMove() ? this.moveNameList.   ICCSM.slice(0) : this.moveNameList.   ICCS.slice(0); break;
		case "wxf" : var moveList = this.getTurnForMove() ? this.moveNameList.    WXFM.slice(0) : this.moveNameList.    WXF.slice(0); break;
		default    : var moveList = this.getTurnForMove() ? this.moveNameList.ChineseM.slice(0) : this.moveNameList.Chinese.slice(0); break;
	}

	this.situationList[0][0] === 1 ? moveList.shift() : moveList[0] = "";

	if (this.situationList[0][0] === 1 || this.situationList[0][0] === 2 && moveList.length > 1) {
		for (var i = 0; i < moveList.length; ++i) {
			i % 2 || selectListNode.push('<li class="vschess-move-select-node-round">', startRound++, '.</li>');
			selectListNode.push('<li class="vschess-move-select-node-', moveList[i] ? "move" : "blank", '">');
			selectListNode.push(moveList[i], this.commentList[!!moveList[0] + i] && moveList[i] ? "*" : "", '</li>');
		}
	}

	this.moveSelectList.html(selectListNode.join(""));
	this.moveSelectListSteps = this.moveSelectList.children().not(".vschess-move-select-node-round, .vschess-move-select-node-blank");

	this.moveSelectListSteps.each(function(index){
		var each = $(this);
		index && _this.changeLengthList[index - 1] > 1 && each.addClass("vschess-move-select-node-change");
		each.bind(_this.options.click, function(){ _this.setBoardByStep(index); });
	});

	return this.refreshMoveSelectListNodeColor();
};

// 着法列表着色
vschess.load.prototype.refreshMoveSelectListNodeColor = function(){
	this.moveSelectListSteps || this.refreshMoveListNode();
	this.moveSelectListSteps.removeClass("vschess-move-select-node-lose vschess-move-select-node-threat vschess-move-select-node-normal");

	if (vschess.legalList(this.situationList[this.getCurrentStep()]).length === 0) {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-lose");
	}
	else if (vschess.checkThreat(this.situationList[this.getCurrentStep()])) {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-threat");
	}
	else {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-normal");
	}

	this.setMoveLeaveHide();
	return this;
};

// 避免当前着法进入滚动区域外
vschess.load.prototype.setMoveLeaveHide = function(){
	var bottomLine  = this.moveSelectList.height() - this.moveSelectListSteps.first().height();
	var currentTop  = this.moveSelectListSteps.eq(this.getCurrentStep()).position().top;
	var currentScrollTop = this.moveSelectList.scrollTop();
	currentTop > bottomLine	&& this.moveSelectList.scrollTop(currentScrollTop + currentTop - bottomLine	);
	currentTop < 0			&& this.moveSelectList.scrollTop(currentScrollTop + currentTop				);
	return this;
};

// 变招选择列表
vschess.load.prototype.createChangeSelectList = function(){
	this.DOM.children(".vschess-change-select-title, .vschess-change-select-list").remove();
	this.changeSelectTitle = $('<div class="vschess-change-select-title"></div>');
	this.changeSelectList  = $('<ul class="vschess-change-select-list"></ul>');
	this.DOM.append(this.changeSelectTitle);
	this.DOM.append(this.changeSelectList);
	return this;
};

// 刷新变招选择列表内所有着法
vschess.load.prototype.refreshChangeSelectListNode = function(){
	if (this.getCurrentStep() <= 0) {
		this.changeSelectTitle.text("\u63d0\u793a\u4fe1\u606f");
		this.changeSelectList.empty();

		for (var i = 0; i < this.options.startTips.length; ++i) {
			this.changeSelectList.append('<li class="vschess-change-select-tips">' + this.options.startTips[i] + '</li>');
		}

		return this;
	}

	var _this = this;
	var selectListNode = [];
	var parentNode = this.selectDefault(this.getCurrentStep() - 1);
	var changeList  = parentNode.next;
	var currentNodeIndex = this.currentNodeList[this.getCurrentStep()];

	switch (this.getMoveFormat()) {
		case "iccs": var converter = vschess.Node2ICCS	; break;
		case "wxf" : var converter = vschess.Node2WXF	; break;
		default    : var converter = vschess.Node2Chinese; break;
	}

	for (var i = 0; i < changeList.length; ++i) {
		var changeMove	= this.getTurnForMove() ? vschess.turnMove(changeList[i].move) : changeList[i].move;
		var prevFen		= this.getFenByStep(this.getCurrentStep() - 1);

		selectListNode.push('<li class="vschess-change-select-node">');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-move">');
		selectListNode.push(converter(changeMove, prevFen, this.options).move, changeList[i].comment ? "*" : "", '</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-up">\u4e0a\u79fb</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-down">\u4e0b\u79fb</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-delete">\u5220\u9664</span>');
		selectListNode.push('</li>');
	}

	this.changeSelectTitle.text("\u53d8\u62db\u5217\u8868");
	this.changeSelectList.html(selectListNode.join(""));
	this.changeSelectListChanges = this.changeSelectList.children();
	this.changeSelectListChanges.first().addClass("vschess-change-select-node-first");
	this.changeSelectListChanges.last ().addClass("vschess-change-select-node-last" );

	this.changeSelectListChanges.each(function(index){
		var each = $(this);
		var move = changeList[index].move;
		index === currentNodeIndex && each.addClass("vschess-change-select-node-current");
		each.hasClass("vschess-change-select-node-current") && each.hasClass("vschess-change-select-node-first") && each.addClass("vschess-change-select-node-current-and-first");
		each.hasClass("vschess-change-select-node-current") && each.hasClass("vschess-change-select-node-last" ) && each.addClass("vschess-change-select-node-current-and-last" );

		each.bind(_this.options.click, function(){
			_this.setMoveDefaultAtNode(move, _this.getCurrentStep() - 1 ) && _this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-up").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (index <= 0) {
				return false;
			}

			var prevTarget = changeList[index - 1];
			changeList[index - 1] = changeList[index];
			changeList[index    ] = prevTarget;

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = index - 1;
			}
			else if (parentNode.defaultIndex === index - 1) {
				parentNode.defaultIndex = index;
			}

			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-down").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (index >= changeList.length - 1) {
				return false;
			}

			var prevTarget = changeList[index + 1];
			changeList[index + 1] = changeList[index];
			changeList[index    ] = prevTarget;

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = index + 1;
			}
			else if (parentNode.defaultIndex === index + 1) {
				parentNode.defaultIndex = index;
			}

			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-delete").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (!confirm("\u786e\u5b9a\u8981\u5220\u9664\u8be5\u7740\u6cd5\u5417\uff1f\u8be5\u7740\u6cd5\u53ca\u4e4b\u540e\u7684\u6240\u6709\u7740\u6cd5\u90fd\u5c06\u88ab\u5220\u9664\uff01")) {
				return false;
			}

			for (var i = index; i < changeList.length; ++i) {
				changeList[i] = changeList[i + 1];
			}

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = 0;
			}
			else if (parentNode.defaultIndex > index) {
				--parentNode.defaultIndex;
			}

			--changeList.length;
			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});
	});

	this.setChangeLeaveHide();
	return this;
};

// 避免当前变招进入滚动区域外
vschess.load.prototype.setChangeLeaveHide = function(){
	var bottomLine           = this.changeSelectList.height() - this.changeSelectListChanges.first().height();
	var currentTop           = this.changeSelectListChanges.eq(this.currentNodeList[this.getCurrentStep()]).position().top;
	var currentScrollTop     = this.changeSelectList.scrollTop();
	currentTop > bottomLine	&& this.changeSelectList.scrollTop(currentScrollTop + currentTop - bottomLine);
	currentTop < 0			&& this.changeSelectList.scrollTop(currentScrollTop + currentTop			 );
	return this;
};

// 刷新着法列表及变招列表
vschess.load.prototype.refreshMoveListNode = function(){
	return this.refreshMoveSelectListNode().refreshChangeSelectListNode();
};

// 设置当前着法列表格式
vschess.load.prototype.setMoveFormat = function(format){
	switch (format) {
		case "iccs": this._.moveFormat = "iccs"		; break;
		case "wxf" : this._.moveFormat = "wxf"		; break;
		default    : this._.moveFormat = "chinese"	; break;
	}

	return this;
};

// 取得当前着法列表格式
vschess.load.prototype.getMoveFormat = function(){
	return this._.moveFormat;
};

// 移动一枚棋子
vschess.load.prototype.movePieceByPieceIndex = function(from, to, animationTime, callback, callbackIllegal){
	// 动画过程中，直接跳过
	if (this.animating) {
		return this;
	}

	if (typeof animationTime === "function") {
		callbackIllegal = callback;
		callback = animationTime;
		animationTime = 0;
	}

	from = vschess.limit(from, 0, 89);
	to   = vschess.limit(to  , 0, 89);
	animationTime = vschess.limit(animationTime, 0, Infinity);

	var From = vschess.b2i[vschess.turn[this.getTurn()][from]];
	var To   = vschess.b2i[vschess.turn[this.getTurn()][to  ]];
	var Move = From + To;

	// 着法不合法，不移动棋子
	if (!~this.legalMoveList.indexOf(Move)) {
		typeof callbackIllegal === "function" && callbackIllegal();
		return this;
	}

	// 动画过渡，即动画时间大于 100，100毫秒以下效果很差，直接屏蔽
	if (animationTime >= 100) {
		var _this = this;
		this.animating = true;
		this.clearSelect();
		this.clearSelect(-1);
		this.clearPiece(from);
		this.clearPiece(-1);
		this.setSelectByPieceIndex(from);
		this.setSelectByPieceIndex(-1);

		// IE+jQuery 模式下，使用 jQuery 的动画效果
		if (window.ActiveXObject && typeof jQuery !== "undefined") {
			var _playSound = true;
			var finishHandlerRunned = false;

			var finishHandler = function(){
				_this.setMoveDefaultAtNode(Move) && _this.rebuildSituation().refreshMoveSelectListNode();
				_this.setBoardByOffset(1);
				_this.setSelectByStep();
				_this.animatePiece.hide();
				_playSound && _this.playSoundBySituation();
				_this.animating = false;
				finishHandlerRunned = true;

				_this.pieceRotateDeg[to]   = _this.pieceRotateDeg[from];
				_this.pieceRotateDeg[from] = Math.random() * 360;
				_this.getPieceRotate() ? _this.loadPieceRotate() : _this.clearPieceRotate();

				typeof callback === "function" && callback();
			};

			var sIndex = vschess.b2s[vschess.turn[this.getTurn()][from]];
			var piece  = this.situationList[this.getCurrentStep()][sIndex];

			this.getPieceRotate() ? this.animatePiece.children("span").attr({ style: vschess.degToRotateCSS(this.pieceRotateDeg[from]) }) : this.animatePiece.children("span").removeAttr("style");

			this.animatePiece.addClass("vschess-piece-" + vschess.n2f[piece]).css({
				top : this.piece.eq(from).position().top,
				left: this.piece.eq(from).position().left
			}).show().animate({
				top : this.piece.eq(to).position().top,
				left: this.piece.eq(to).position().left
			}, animationTime, finishHandler);

			this.stopAnimate = function(playSound){
				typeof playSound !== "undefined" && (_playSound = playSound);
				_this.animatePiece.stop(true, true);
			};

			setTimeout(function(){ finishHandlerRunned || finishHandler(); }, animationTime + 500);
		}

		// 其他浏览器或 Zepto 模式下，使用原生 CSS3 动画效果
		else {
			var finishHandlerRunned = false;

			var finishHandler = function(playSound){
				var _playSound = true;
				typeof playSound !== "undefined" && (_playSound = playSound);

				_this.setMoveDefaultAtNode(Move) && _this.rebuildSituation().refreshMoveSelectListNode();
				_this.setBoardByOffset(1);
				_this.setSelectByStep();
				_this.animatePiece.hide().css({ "-webkit-transition": "0ms", "-moz-transition": "0ms", "-ms-transition": "0ms", "-o-transition": "0ms", "transition": "0ms" });
				_playSound && _this.playSoundBySituation();
				_this.animating = false;

				setTimeout(function(){
					_this.animatePiece.hide().css({
						"-webkit-transform": "translate3d(0px, 0px, 0px)",
						   "-moz-transform": "translate3d(0px, 0px, 0px)",
							"-ms-transform": "translate3d(0px, 0px, 0px)",
						     "-o-transform": "translate3d(0px, 0px, 0px)",
						        "transform": "translate3d(0px, 0px, 0px)"
					});
				}, vschess.threadTimeout);

				var Evt = _this.animatePiece[0];
				Evt.removeEventListener("webkitTransitionEnd", finishHandler);
				Evt.removeEventListener(   "mozTransitionEnd", finishHandler);
				Evt.removeEventListener(    "msTransitionEnd", finishHandler);
				Evt.removeEventListener(     "oTransitionEnd", finishHandler);
				Evt.removeEventListener(      "transitionend", finishHandler);

				finishHandlerRunned = true;

				_this.pieceRotateDeg[to]   = _this.pieceRotateDeg[from];
				_this.pieceRotateDeg[from] = Math.random() * 360;
				_this.getPieceRotate() ? _this.loadPieceRotate() : _this.clearPieceRotate();

				typeof callback == "function" && callback();
			};

			var deltaX = this.piece.eq(to).position().left - this.piece.eq(from).position().left;
			var deltaY = this.piece.eq(to).position().top  - this.piece.eq(from).position().top;
			var sIndex = vschess.b2s[vschess.turn[this.getTurn()][from]];
			var piece  = this.situationList[this.getCurrentStep()][sIndex];

			this.getPieceRotate() ? this.animatePiece.children("span").attr({ style: vschess.degToRotateCSS(this.pieceRotateDeg[from]) }) : this.animatePiece.children("span").removeAttr("style");

			var Evt = this.animatePiece.addClass("vschess-piece-" + vschess.n2f[piece]).css({
				top : this.piece.eq(from).position().top,
				left: this.piece.eq(from).position().left,
				"-webkit-transition": animationTime + "ms",
				   "-moz-transition": animationTime + "ms",
					"-ms-transition": animationTime + "ms",
				     "-o-transition": animationTime + "ms",
				        "transition": animationTime + "ms"
			}).show()[0];

			Evt.addEventListener("webkitTransitionEnd", finishHandler);
			Evt.addEventListener(   "mozTransitionEnd", finishHandler);
			Evt.addEventListener(    "msTransitionEnd", finishHandler);
			Evt.addEventListener(     "oTransitionEnd", finishHandler);
			Evt.addEventListener(      "transitionend", finishHandler);

			setTimeout(function(){
				_this.animatePiece.css({
					"-webkit-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					   "-moz-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
						"-ms-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					     "-o-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					        "transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)"
				});
			}, vschess.threadTimeout);

			this.stopAnimate = finishHandler;
			setTimeout(function(){ finishHandlerRunned || finishHandler(); }, animationTime + 500);
		}
	}

	// 无动画过渡，即动画时间为 0
	else {
		this.stopAnimate = function(){};
		this.setMoveDefaultAtNode(Move) && this.rebuildSituation().refreshMoveSelectListNode();
		this.setBoardByOffset(1);
		this.setSelectByStep();
		this.playSoundBySituation();
		typeof callback === "function" && callback();
	}

	return this;
};

// 根据节点 ICCS 移动一枚棋子
vschess.load.prototype.movePieceByNode = function(move, animationTime, callback, callbackIllegal){
	var from = vschess.turn[this.getTurn()][vschess.i2b[move.substring(0, 2)]];
	var to   = vschess.turn[this.getTurn()][vschess.i2b[move.substring(2, 4)]];
	return this.movePieceByPieceIndex(from, to, animationTime, callback, callbackIllegal);
};

// 根据中文着法移动一枚棋子
vschess.load.prototype.movePieceByChinese = function(move, animationTime, callback, callbackIllegal){
	return this.movePieceByNode(vschess.Chinese2Node(move, this.getCurrentFen()).move, animationTime, callback, callbackIllegal);
};

// 根据 WXF 着法移动一枚棋子
vschess.load.prototype.movePieceByWXF = function(move, animationTime, callback, callbackIllegal){
	return this.movePieceByNode(vschess.WXF2Node(move, this.getCurrentFen()).move, animationTime, callback, callbackIllegal);
};

// 以动画方式过渡到下一个局面
vschess.load.prototype.animateToNext = function(animationTime, callback){
	if (this.animating || this.getCurrentStep() >= this.lastSituationIndex()) {
		return this;
	}

	var from = vschess.turn[this.getTurn()][vschess.i2b[this.getMoveByStep(this.getCurrentStep() + 1).substring(0, 2)]];
	var to   = vschess.turn[this.getTurn()][vschess.i2b[this.getMoveByStep(this.getCurrentStep() + 1).substring(2, 4)]];
	this.movePieceByPieceIndex(from, to, vschess.limit(animationTime, 0, Infinity), callback);
	return this;
};

// 设置动画时间
vschess.load.prototype.setAnimationTime = function(animationTime){
	this._.animationTime = vschess.limit(animationTime, 0, Infinity);
	return this;
};

// 取得动画时间
vschess.load.prototype.getAnimationTime = function(animationTime){
	return this._.animationTime >= this._.playGap * 100 ? this._.playGap * 50 : this._.animationTime;
};

// 重建所有局面，一般用于变招切换和节点发生变化
vschess.load.prototype.rebuildSituation = function(){
	this.situationList = [vschess.fenToSituation(this.node.fen)];
	this.fenList   = [this.node.fen];
	this.moveList  = [this.node.fen];
	this.eatStatus = [false];
	this.commentList = [this.node.comment ? decodeURIComponent(this.node.comment) : ""];
	this.changeLengthList = [];
	this.currentNodeList = [0];

	var turnFen = vschess.turnFen(this.node.fen);

	this.moveNameList = {
		WXF		: [this.node.fen], WXFM		: [turnFen],
		ICCS	: [this.node.fen], ICCSM	: [turnFen],
		Chinese	: [this.node.fen], ChineseM	: [turnFen]
	};

	for (var currentNode=this.node;currentNode.next.length;) {
		this.changeLengthList.push(currentNode.next.length);
		this.currentNodeList.push(currentNode.defaultIndex);
		currentNode = currentNode.next[currentNode.defaultIndex];

		var from = vschess.i2s[currentNode.move.substring(0, 2)];
		var to   = vschess.i2s[currentNode.move.substring(2, 4)];
		var lastSituation = this.situationList[this.lastSituationIndex()].slice(0);
		var prevFen = vschess.situationToFen(lastSituation);
		var prevPieceCount = vschess.countPieceLength(lastSituation);

		lastSituation[to  ] = lastSituation[from];
		lastSituation[from] = 1;
		lastSituation[0]  = 3  -   lastSituation[0];
		lastSituation[0] == 1 && ++lastSituation[1];

		this.eatStatus.push(vschess.countPieceLength(lastSituation) !== prevPieceCount);
		this.moveList.push(currentNode.move);
		this.commentList.push(currentNode.comment ? decodeURIComponent(currentNode.comment) : "");
		this.situationList.push(lastSituation);
		this.fenList.push(vschess.situationToFen(lastSituation));

		var wxf  = vschess.Node2WXF(currentNode.move, prevFen).move;
		var wxfM = wxf.charCodeAt(1) > 96 ? vschess.Node2WXF(vschess.turnMove(currentNode.move), vschess.turnFen(prevFen)).move : vschess.turnWXF(wxf);

		this.moveNameList.   ICCS .push(vschess.Node2ICCS_NoFen(			   currentNode.move ));
		this.moveNameList.   ICCSM.push(vschess.Node2ICCS_NoFen(vschess.turnMove(currentNode.move)));
		this.moveNameList.    WXF .push(wxf );
		this.moveNameList.    WXFM.push(wxfM);
		this.moveNameList.Chinese .push(vschess.Node2Chinese(wxf , prevFen, this.options));
		this.moveNameList.ChineseM.push(vschess.Node2Chinese(wxfM, prevFen, this.options));
	}

	return this.rebuildExportAll().setExportFormat();
};

// 选择指定默认节点
vschess.load.prototype.selectDefault = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var currentNode = this.node;

	for (var i=0;i<step;++i) {
		currentNode = currentNode.next[currentNode.defaultIndex];
	}

	return currentNode;
};

// 节点内是否含有指定着法
vschess.load.prototype.hasMoveAtNode = function(move, step){
	var nextList = this.selectDefault(vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())).next;

	for (var i=0;i<nextList.length;++i) {
		if (nextList[i].move == move) {
			return true;
		}
	}

	return false;
};

// 节点增加着法
vschess.load.prototype.addNodeByMoveName = function(move, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	this.hasMoveAtNode(move, step) || this.selectDefault(step).next.push({ move: move, comment: "", next: [], defaultIndex: 0 });
	return this;
};

// 将节点内指定着法设为默认着法，并返回节点是否发生变化
vschess.load.prototype.setMoveDefaultAtNode = function(move, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var currentNode = this.selectDefault(step);

	if (currentNode.next.length && currentNode.next[currentNode.defaultIndex].move == move) {
		return false;
	}

	for (var i=0;i<currentNode.next.length;++i) {
		if (currentNode.next[i].move == move) {
			currentNode.defaultIndex = i;
			this.setSaved(false);
			return true;
		}
	}

	this.addNodeByMoveName(move, step);
	currentNode.defaultIndex = currentNode.next.length - 1;
	this.setSaved(false);
	return true;
};

// 取得着法列表
vschess.load.prototype.getMoveNameList = function(format, isMirror){
	typeof isMirror === "undefined" && (isMirror = this.getTurnForMove());

	switch (format) {
		case  "wxf": return isMirror ? this.moveNameList.    WXFM.slice(0) : this.moveNameList.    WXF.slice(0);
		case "iccs": return isMirror ? this.moveNameList.   ICCSM.slice(0) : this.moveNameList.   ICCS.slice(0);
		default    : return isMirror ? this.moveNameList.ChineseM.slice(0) : this.moveNameList.Chinese.slice(0);
	}

	return this;
};

// 刷新并取得节点数
vschess.load.prototype.refreshNodeLength = function(){
	var total = 0;

	function countNode(node){
		++total;

		for (var i=0;i<node.next.length;++i) {
			countNode(node.next[i]);
		}
	}

	countNode(this.node);
	this._.nodeLength = total;
	return total;
};

// 取得节点数
vschess.load.prototype.getNodeLength = function(){
	return this._.nodeLength;
};

// 棋子单击事件绑定
vschess.load.prototype.pieceClick = function(){
	var _this = this;

	this.piece.each(function(index){
		$(this).bind(_this.options.click, function(){
			// 是本方棋子，切换选中状态
			if (_this.isPlayer(index)) {
				if (_this.getClickResponse() > 1 && _this.isR(index) || (_this.getClickResponse() & 1) && _this.isB(index)) {
					_this.toggleSelectByPieceIndex(index);
					_this.playSound("click");
				}
			}

			// 不是本方棋子，即为走子目标或空白点
			else {
				// 合法着法，移动棋子
				if (_this.getLegalByPieceIndex(_this.getCurrentSelect(), index)) {
					_this.callback_beforeClickAnimate();
					_this.movePieceByPieceIndex(_this.getCurrentSelect(), index, _this.getAnimationTime(), function(){ _this.callback_afterClickAnimate(); });
				}

				// 不合法着法，播放非法着法音效
				else if (~_this.getCurrentSelect()) {
					_this.playSound("illegal");
				}
			}
		});
	});

	return this;
};

// 设置单击响应状态
vschess.load.prototype.setClickResponse = function(clickResponse){
	this._.clickResponse = vschess.limit(clickResponse, 0, 3);
	return this;
};

// 取得单击相应状态
vschess.load.prototype.getClickResponse = function(){
	return this._.clickResponse;
};

// 设置走子提示状态
vschess.load.prototype.setMoveTips = function(moveTips){
	this._.moveTips = !!moveTips;
	this.setConfigItemValue("moveTips", this._.moveTips);
	return this;
};

// 取得走子提示状态
vschess.load.prototype.getMoveTips = function(){
	return this._.moveTips;
};

// 设置指定棋子合法目标格状态，-1 表示动画棋子
vschess.load.prototype.setLegalByPieceIndex = function(index){
	index = vschess.limit(index, -1, 89);
	~index ? this.piece.eq(index).addClass("vschess-piece-S") : this.animatePiece.addClass("vschess-piece-S");
	return this;
};

// 获取指定棋子合法目标格状态
vschess.load.prototype.getLegalByPieceIndex = function(startIndex, targetIndex){
	 startIndex = vschess.limit( startIndex, 0, 89, this.getCurrentSelect());
	targetIndex = vschess.limit(targetIndex, 0, 89, this.getCurrentSelect());
	return ~$.inArray(targetIndex, this.getLegalByStartPieceIndex(startIndex));
};

// 设置指定棋子选中状态，-1 表示动画棋子
vschess.load.prototype.setSelectByPieceIndex = function(index){
	index = vschess.limit(index, -1, 89);
	~index ? this.setCurrentSelect(index).piece.eq(index).addClass("vschess-piece-s") : this.animatePiece.addClass("vschess-piece-s");
	return this;
};

// 获取指定棋子选中状态
vschess.load.prototype.getSelectByPieceIndex = function(index){
	return this.piece.eq(vschess.limit(index, 0, 89)).hasClass("vschess-piece-s");
};

// 设置合法目标格提示状态
vschess.load.prototype.setLegalTargetByStartIndex = function(index){
	index = vschess.limit(index, 0, 89);
	var _this = this;
	this.piece.each(function(pieceIndex){ _this.getLegalByPieceIndex(index, pieceIndex) && _this.setLegalByPieceIndex(pieceIndex); });
	return this;
};

// 切换棋子选中状态
vschess.load.prototype.toggleSelectByPieceIndex = function(index){
	index = vschess.limit(index, 0, 89);

	if (this.piece.eq(index).hasClass("vschess-piece-s")) {
		this.clearSelect();
		this.callback_unSelectPiece();
	}
	else {
		this.clearSelect();
		this.setSelectByPieceIndex(index);
		this.getMoveTips() && this.setLegalTargetByStartIndex(index);
		this.callback_selectPiece();
	}

	return this;
};

// 根据局面为起始点及目标点棋子添加方框
vschess.load.prototype.setSelectByStep = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (step <= 0) {
		return this;
	}

	var from = vschess.i2s[this.getMoveByStep(step).substring(0, 2)];
	var to   = vschess.i2s[this.getMoveByStep(step).substring(2, 4)];
	var currentSelect = this.getCurrentSelect();
	this.setSelectByPieceIndex(vschess.turn[this.getTurn()][vschess.s2b[from]]);
	this.setSelectByPieceIndex(vschess.turn[this.getTurn()][vschess.s2b[to  ]]);
	this.setCurrentSelect(currentSelect);
	return this;
};

// 设置当前选中的棋子编号，-1 表示没有被选中的棋子
vschess.load.prototype.setCurrentSelect = function(currentSelect){
	this._.currentSelect = vschess.limit(currentSelect, -1, 89, -1);
	return this;
};

// 取得当前选中的棋子编号，-1 表示没有被选中的棋子
vschess.load.prototype.getCurrentSelect = function(){
	return this._.currentSelect;
};

// 创建棋谱分享区域
vschess.load.prototype.createShare = function(){
	var _this = this;
	this.shareTitle    = $('<div class="vschess-tab-title vschess-tab-title-share">\u68cb\u8c31\u5206\u4eab</div>');
	this.shareArea     = $('<div class="vschess-tab-body vschess-tab-body-share"></div>');
	this.tabArea.children(".vschess-tab-title-share, .vschess-tab-body-share").remove();
	this.tabArea.append(this.shareTitle);
	this.tabArea.append(this.shareArea );
	this.shareTitle.bind(this.options.click, function(){ _this.showTab("share"); });
	this.createShareGenerateButton();
	this.createShareUBB();
	return this;
};

// 创建生成分享信息按钮
vschess.load.prototype.createShareGenerateButton = function(){
	var _this = this;
	this.shareGenerateButton = $('<input type="button" class="vschess-button vschess-tab-body-share-generate-button" value="\u751f\u6210\u5206\u4eab\u4ee3\u7801" />');
	this.shareGenerateButton.appendTo(this.shareArea);

	this.shareGenerateButton.bind(this.options.click, function(){
		if (_this.options.cloudApi && _this.options.cloudApi.saveBookForShare) {
			_this.rebuildExportDhtmlXQ();

			$.ajax({
				url: _this.options.cloudApi.saveBookForShare,
				type: "post",
				data: { book: _this.exportData.DhtmlXQ },
				dataType: "json",
				success: function(response){
					if (response.code === 0) {
						_this.shareUBBText.val("[" + _this.options.ubbTagName + "]" + response.data.id + "[/" + _this.options.ubbTagName + "]");
					}
				},
				error: function(){
					alert("\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u5141\u8bb8\u8de8\u57df\uff0c\u4e0d\u80fd\u4f7f\u7528\u6b64\u529f\u80fd\u3002");
				}
			});
		}
	});

	return this;
};

// 创建 UBB 分享信息区域
vschess.load.prototype.createShareUBB = function(){
	this.shareUBBTitle = $('<div class="vschess-tab-body-share-title">\u8bba\u575b UBB \u4ee3\u7801\uff1a</div>');
	this.shareUBBTitle.appendTo(this.shareArea);
	this.shareUBBText = $('<input class="vschess-tab-body-share-text" value="\u8bf7\u70b9\u51fb\u201c\u751f\u6210\u5206\u4eab\u4fe1\u4ee3\u7801\u201d\u6309\u94ae\u3002" readonly="readonly" />');
	this.shareUBBText.appendTo(this.shareArea);
	return this;
};

// 显示指定索引号的局面，负值表示从最后一个局面向前
vschess.load.prototype.setBoardByStep = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var _this = this;
	this._.currentStep = vschess.limit(step, 0, this.lastSituationIndex());
	this.clearBoard();
	this.clearBoard(-1);
	this.animating = false;

	this.piece.each(function(index){
		var piece = _this.situationList[_this.getCurrentStep()][vschess.b2s[vschess.turn[_this.getTurn()][index]]];
		piece > 1 && $(this).addClass("vschess-piece-" + vschess.n2f[piece]);
	});

	this.getPieceRotate() ? this.loadPieceRotate() : this.clearPieceRotate();
	this.legalList     = vschess.legalList    (this.situationList[this.getCurrentStep()]);
	this.legalMoveList = vschess.legalMoveList(this.situationList[this.getCurrentStep()]);
	this.setSelectByStep();
	this.refreshMoveSelectListNodeColor();
	this.refreshChangeSelectListNode();
	this.setCommentByStep();
	return this;
};

// 显示指定步数后的局面，正数向后，负数向前，默认为下一步
vschess.load.prototype.setBoardByOffset = function(offset){
	return this.setBoardByStep(vschess.limit(this.getCurrentStep() + vschess.limit(offset, -Infinity, Infinity, 1), 0, this.lastSituationIndex()));
};

// 刷新棋盘，一般用于设置棋盘方向之后
vschess.load.prototype.refreshBoard = function(){
	return this.setBoardByStep(this.getCurrentStep()).refreshMoveListNode();
};

// 设置棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下翻转，3(0x11) 上下翻转 + 左右翻转
vschess.load.prototype.setTurn = function(turn){
	this._.turn = vschess.limit(turn, 0, 3, 0);
	arguments[1] || this.setConfigItemValue("turnX", !!(turn & 1));
	arguments[1] || this.setConfigItemValue("turnY",    turn > 1 );
	this.setExportFormat();
	return this.refreshBoard().refreshColumnIndex();
};

// 取得棋盘方向
vschess.load.prototype.getTurn = function(){
	return this._.turn;
};

// 取得棋盘着法翻转状态
vschess.load.prototype.getTurnForMove = function(){
	return this.getTurn() >> 1 !== (this.getTurn() & 1);
};

// 取得当前局面号
vschess.load.prototype.getCurrentStep = function(){
	return this._.currentStep;
};

// 取得当前走棋方，1 为红方，2 为黑方
vschess.load.prototype.getCurrentPlayer = function(){
	return this.situationList[this.getCurrentStep()][0];
};

// 刷新列号
vschess.load.prototype.refreshColumnIndex = function(turn){
	this.columnIndexR.removeClass("vschess-column-index-a vschess-column-index-b");
	this.columnIndexB.removeClass("vschess-column-index-a vschess-column-index-b");

	if (vschess.limit(turn, 0, 3, this.getTurn()) > 1) {
		this.columnIndexR.addClass("vschess-column-index-a");
		this.columnIndexB.addClass("vschess-column-index-b");
	}
	else {
		this.columnIndexR.addClass("vschess-column-index-b");
		this.columnIndexB.addClass("vschess-column-index-a");
	}

	return this;
};

// 设置棋子随机旋转状态
vschess.load.prototype.setPieceRotate = function(status){
	this._.pieceRotate = !!status;
	return this.setConfigItemValue("pieceRotate", this._.pieceRotate);
};

// 取得棋子随机旋转状态
vschess.load.prototype.getPieceRotate = function(){
	return this._.pieceRotate;
};

// 初始化棋子旋转角度
vschess.load.prototype.initPieceRotateDeg = function(){
	this.pieceRotateDeg = [];

	for (var i = 0; i < 90; ++i) {
		this.pieceRotateDeg.push(Math.random() * 360);
	}

	return this;
};

// 设置棋子旋转
vschess.load.prototype.loadPieceRotate = function(){
	var _this = this;

	this.piece.children("span").each(function(k){
		$(this).attr({ style: vschess.degToRotateCSS(_this.pieceRotateDeg[k]) });
	});

	return this;
};

// 移除棋子旋转
vschess.load.prototype.clearPieceRotate = function(){
	this.piece.children("span").removeAttr("style");
	return this;
};

// 音效播放组件
vschess.load.prototype.playSound = function(name){
	this.getSound() && vschess.soundObject[this.options.soundStyle + "-" + name](this.getVolume());
	return this;
};

// 根据局面播放音效
vschess.load.prototype.playSoundBySituation = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (step <= 0) {
		return this;
	}

	var fromPiece = this.situationList[step - 1][vschess.i2s[this.getMoveByStep(step).substring(0, 2)]];
	var   toPiece = this.situationList[step - 1][vschess.i2s[this.getMoveByStep(step).substring(2, 4)]];

	// 播放将杀音效
	if (this.legalList.length == 0) {
		this.playSound("lose");
	}

	// 播放将军音效
	else if (vschess.checkThreat(this.situationList[this.getCurrentStep()])) {
		this.playSound("check");
	}

	// 播放炮吃子、普通吃子音效
	else if (toPiece > 1) {
		(fromPiece & 15) == 6 ? this.playSound("bomb") : this.playSound("eat");
	}

	// 播放移动棋子音效
	else {
		this.playSound("move");
	}

	return this;
};

// 设置音效状态
vschess.load.prototype.setSound = function(sound){
	this._.sound = !!sound;
	this.setConfigItemValue("sound", this._.sound);
	return this;
};

// 取得音效状态
vschess.load.prototype.getSound = function(){
	return this._.sound;
};

// 设置音量大小
vschess.load.prototype.setVolume = function(volume){
	this._.volume = vschess.limit(volume, 0, 100);
	this.setConfigItemValue("volume", this._.volume);
	return this;
};

// 获取音量大小
vschess.load.prototype.getVolume = function(){
	return this._.volume;
};

// 创建标签
vschess.load.prototype.createTab = function(){
	this.tabArea = $('<div class="vschess-tab-area"></div>');
	this.DOM.children(".vschess-tab-area").remove();
	this.DOM.append(this.tabArea);
	this.createComment();
	this.createInfo   ();
	this.createShare  ();
	this.createExport ();
	this.createEdit   ();
	this.createConfig ();
	this.tabTitle = this.tabArea.children(".vschess-tab-title");
	this.tabBody  = this.tabArea.children(".vschess-tab-body" );
	return this;
};

// 显示指定标签
vschess.load.prototype.showTab = function(tabName){
	if (!~vschess.tabList.indexOf(tabName)) {
		return this;
	}

	this.tabTitle.removeClass("vschess-tab-title-current").filter(".vschess-tab-title-" + tabName).addClass("vschess-tab-title-current");
	this.tabBody .removeClass("vschess-tab-body-current" ).filter(".vschess-tab-body-"  + tabName).addClass("vschess-tab-body-current" );
	return this;
};

// 棋盘对象转换为字符串信息
vschess.load.prototype.toString = function(){
	return this.getCurrentFen();
};

// 程序转换为字符串信息
vschess.toString = function(){
	return "\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V" + vschess.version + " https://www.xiaxiangqi.com/ Copyright \u00a9 2009-2018 Margin.Top \u7248\u6743\u6240\u6709";
};

// 将 vschess 提升为全局变量，这样外部脚本就可以调用了
typeof window.vschess === "undefined" && (window.vschess = vschess);

})();