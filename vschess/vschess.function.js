/*
 * 微思象棋函数库 V2.6.0
 * https://www.xiaxiangqi.com/
 *
 * Copyright @ 2009-2023 Margin.Top 版权所有
 * https://margin.top/
 *
 * 本程序遵循 LGPL 协议
 * https://www.gnu.org/licenses/lgpl.html
 *
 * ECCO 开局分类编号系统算法由象棋百科全书友情提供，在此表示衷心感谢。
 * https://www.xqbase.com/
 *
 * 最后修改日期：北京时间 2023年3月11日
 * Sat, 11 Mar 2023 20:01:37 +0800
 */

// 主程序
var vschess = {
	// 当前版本号
	version: "2.6.0",

	// 版本时间戳
	timestamp: "Sat, 11 Mar 2023 20:01:37 +0800",

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

	// 已创建棋盘对象列表
	chessList: [],

	// 默认 Fen 串
	defaultFen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",

	// 空白 Fen 串
	blankFen: "9/9/9/9/9/9/9/9/9/9 w - - 0 1",

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
		DHJHtmlXQ: {
			title		: 10,
			event		: 11,
			date		: 13,
			place		: 14,
			round		: 15,
			table		: 16,
			red			: 17,
			redname		: 18,
			redlevel	: 19,
			redrating	: 20,
			black		: 21,
			blackname	: 22,
			blacklevel	: 23,
			blackrating	: 24,
			result		: 28,
			redtime		: 29,
			blacktime	: 30,
			open		: 36,
			variation	: 37,
			remark		: 40,
			author		: 41,
			record		: 42
		},
		pgn: {
			place		: "Site",
			open		: "Opening",
			ecco		: "ECCO"
		}
	},

	// ECCO 编号目录
	eccoDir: {
		A: "\u5176\u4ed6\u5f00\u5c40 \u4e0a\u4ed5\u5c40 \u8fb9\u9a6c\u5c40 \u8fb9\u70ae\u5c40 \u5de1\u6cb3\u70ae\u5c40 \u8fc7\u6cb3\u70ae\u5c40 \u5175\u5e95\u70ae\u5c40 \u91d1\u94a9\u70ae\u5c40 \u8fb9\u5175\u5c40  \u98de\u76f8\u5c40 \u987a\u76f8\u5c40 \u5217\u76f8\u5c40 \u98de\u76f8\u5bf9\u8fdb\u5de6\u9a6c \u98de\u76f8\u5bf9\u8fdb\u53f3\u9a6c \u98de\u76f8\u8fdb\u4e09\u5175\u5bf9\u8fdb\u53f3\u9a6c \u98de\u76f8\u8fdb\u4e03\u5175\u5bf9\u8fdb\u53f3\u9a6c    \u98de\u76f8\u5bf9\u5de6\u58eb\u89d2\u70ae \u98de\u76f8\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u5de6\u9a6c\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u5de6\u8fb9\u9a6c\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u6a2a\u8f66\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u4e09\u5175\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u4e03\u5175\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u5bf9\u5de6\u4e2d\u70ae \u98de\u76f8\u8f6c\u5c4f\u98ce\u9a6c\u5bf9\u5de6\u4e2d\u70ae \u98de\u76f8\u5bf9\u53f3\u4e2d\u70ae \u98de\u76f8\u5bf9\u5de6\u8fc7\u5bab\u70ae \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u7ea2\u76f4\u8f66\u5bf9\u9ed1\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u7ea2\u76f4\u8f66\u8fb9\u70ae\u5bf9\u9ed1\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u4e92\u8fdb\u4e03\u5175 \u98de\u76f8\u5bf9\u53f3\u8fc7\u5bab\u70ae \u98de\u76f8\u5bf9\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u5de6\u9a6c\u5bf9\u8fdb\uff17\u5352 \u98de\u76f8\u4e92\u8fdb\u4e03\u5175\u5c40 \u98de\u76f8\u5bf9\u8fdb\uff13\u5352 \u8d77\u9a6c\u5c40 \u8d77\u9a6c\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u8fb9\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u4ed5\u89d2\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u4e2d\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u4e92\u8fdb\u4e03\u5175\u5c40     \u4ed5\u89d2\u70ae\u5c40 \u4ed5\u89d2\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u4ed5\u89d2\u70ae\u5bf9\u53f3\u4e2d\u70ae \u4ed5\u89d2\u70ae\u8f6c\u53cd\u5bab\u9a6c\u5bf9\u53f3\u4e2d\u70ae \u4ed5\u89d2\u70ae\u5bf9\u8fdb\uff17\u5352      \u8fc7\u5bab\u70ae\u5c40 \u8fc7\u5bab\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u8fc7\u5bab\u70ae\u5bf9\u6a2a\u8f66 \u8fc7\u5bab\u70ae\u5bf9\u5de6\u4e2d\u70ae \u8fc7\u5bab\u70ae\u76f4\u8f66\u5bf9\u5de6\u4e2d\u70ae \u8fc7\u5bab\u70ae\u76f4\u8f66\u5bf9\u5de6\u4e2d\u70ae\u6a2a\u8f66".split(" "),
		B: "\u4e2d\u70ae\u5c40 \u4e2d\u70ae\u5bf9\u8fdb\u53f3\u9a6c \u4e2d\u70ae\u5bf9\u8fdb\u53f3\u9a6c\u5148\u4e0a\u58eb \u4e2d\u70ae\u5bf9\u9e33\u9e2f\u70ae \u4e2d\u70ae\u5bf9\u53f3\u4e09\u6b65\u864e \u4e2d\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u5bf9\u9f9f\u80cc\u70ae \u4e2d\u70ae\u5bf9\u5de6\u70ae\u5c01\u8f66   \u4e2d\u70ae\u5bf9\u5355\u63d0\u9a6c \u4e2d\u70ae\u5bf9\u58eb\u89d2\u70ae\u8f6c\u5355\u63d0\u9a6c \u4e2d\u70ae\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66 \u4e2d\u70ae\u8fdb\u4e03\u5175\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66      \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u8fb9\u76f8\u5bf9\u5de6\u4e09\u6b65\u864e\u9a91\u6cb3\u8f66 \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u8fc7\u6cb3\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u4e24\u5934\u86c7\u5bf9\u5de6\u4e09\u6b65\u864e     \u4e2d\u70ae\u5bf9\u53cd\u5bab\u9a6c\u540e\u8865\u5de6\u9a6c \u4e2d\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u6025\u8fdb\u5de6\u9a6c\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516b\u70ae\u5bf9\u53cd\u5bab\u9a6c    \u4e94\u516d\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66\u8fb9\u70ae \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66\u8fb9\u70ae\u8fdb\uff17\u5352 \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u53cd\u5bab\u9a6c     \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u5de6\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u5de6\u6a2a\u8f66 \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c#\u7ea2\u5f03\u53cc\u5175\u5bf9\u9ed1\u53f3\u70ae\u8fc7\u6cb3".split(" "),
		C: "\u4e2d\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175 \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175\u5bf9\u9ed1\u53cc\u70ae\u8fc7\u6cb3 \u4e2d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u6a2a\u8f66    \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de1\u6cb3\u70ae \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fb9\u70ae \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175 \u4e2d\u70ae\u5de1\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u4e0d\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u4e09\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u4e03\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u53cc\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae     \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u4e0a\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u98de\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u53f3\u6a2a\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u53f3\u70ae\u8fc7\u6cb3 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c\u9ad8\u5de6\u70ae\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u8fb9\u70ae\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb\u53f3\u76f4\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4ed5\u89d2\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u8fdb\u4e2d\u5175\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e94\u516d\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u4e24\u5934\u86c7    \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u9ed1\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u5de6\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u53f3\u70ae\u5de1\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u9ed1\u53f3\u70ae\u5de1\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c  \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff13\u5352 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff13\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u53f3\u8f66\u5de1\u6cb3\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u5151\u8fb9\u5352  \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61\u53f3\u6a2a\u8f66 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61\u5de6\u70ae\u5de1\u6cb3 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u5de6\u9a6c\u5916\u76d8\u6cb3 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u7f13\u5f00\u8f66\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u53f3\u6a2a\u8f66    \u4e94\u516b\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u6b63\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u4e0a\u58eb \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u5151\uff17\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u8fb9\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5e73\u70ae\u538b\u9a6c\u5bf9\u9ed1\u8fb9\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5e73\u70ae\u538b\u9a6c \u4e94\u4e5d\u70ae\u5bf9\u5c4f\u98ce\u9a6c".split(" "),
		D: "\u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u5176\u4ed6 \u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u6a2a\u8f66 \u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u76f4\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u7f13\u5f00\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u76f4\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u76f4\u8f66\u5de1\u6cb3     \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u5de6\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u53f3\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u5151\u76f4\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u8fc7\u6cb3\u70ae \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u8fb9\u70ae     \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5148\u4e0a\u4ed5 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5de6\u8fb9\u9a6c \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5de1\u6cb3\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fc7\u6cb3\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4ed5\u89d2\u70ae \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fdb\u4e09\u5175 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fdb\u4e03\u5175 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4e24\u5934\u86c7 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4e24\u5934\u86c7\u5bf9\u9ed1\u53cc\u6a2a\u8f66 \u4e2d\u70ae\u4e0d\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u53f3\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u4e03\u8def\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u5de6\u8fb9\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u8fdb\u70ae\u6253\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u4e24\u5934\u86c7    \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e2d\u5175\u5bf9\u5de6\u4e09\u6b65\u864e\u9a91\u6cb3\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae#\u7ea2\u5de6\u76f4\u8f66 \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae#\u7ea2\u4e24\u5934\u86c7       \u4e2d\u70ae\u5bf9\u5217\u70ae \u4e2d\u70ae\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u53f3\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u5de6\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u53cc\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae".split(" "),
		E: "\u4ed9\u4eba\u6307\u8def\u5c40 \u4ed9\u4eba\u6307\u8def\u5bf9\u98de\u8c61 \u4ed9\u4eba\u6307\u8def\u8fdb\u53f3\u9a6c\u5bf9\u98de\u8c61 \u4ed9\u4eba\u6307\u8def\u5bf9\u4e2d\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u4ed5\u89d2\u70ae\u6216\u8fc7\u5bab\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u91d1\u94a9\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u8fdb\u53f3\u9a6c \u4ed9\u4eba\u6307\u8def\u4e92\u8fdb\u53f3\u9a6c\u5c40 \u4e24\u5934\u86c7\u5bf9\u8fdb\u53f3\u9a6c \u4e24\u5934\u86c7\u5bf9\u8fdb\u53f3\u9a6c\u8f6c\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u98de\u76f8\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u53f3\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61#\u7ea2\u53f3\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61#\u4e92\u8fdb\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u8f6c\u987a\u70ae   \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5148\u4e0a\u4ed5 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u8fdb\u5de6\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u8fdb\u5de6\u9a6c\u5bf9\u9ed1\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u4e0a\u58eb \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u8fc7\u6cb3 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u8fb9\u5352   \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u9ed1\u8fdb\uff17\u5352 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u9ed1\u8fde\u8fdb\uff17\u5352 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u62d0\u89d2\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb7\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u4e0a\u4ed5\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de1\u6cb3\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u53cc\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u53f3\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u70ae\u6253\u4e2d\u5352  \u5bf9\u5175\u5c40 \u5bf9\u5175\u8fdb\u53f3\u9a6c\u5c40 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u98de\u76f8 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u6a2a\u8f66 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u8fb9\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae\u5bf9\u53f3\u4e2d\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae\u5bf9\u5de6\u4e2d\u70ae".split(" ")
	}
};

// 程序默认参数
vschess.defaultOptions = {
	// 中文着法文字
	ChineseChar: {
		Piece	 : "\u8f66\u9a6c\u76f8\u4ed5\u5e05\u70ae\u5175\u8f66\u9a6c\u8c61\u58eb\u5c06\u70ae\u5352",
		Number	 : "\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19",
		PawnIndex: "\u4e00\u4e8c\u4e09\u56db\u4e94\u4e00\u4e8c\u4e09\u56db\u4e94",
		Text	 : "\u524d\u4e2d\u540e\u8fdb\u9000\u5e73"
	}
};

// 从二进制原始数据中抽取棋局信息
vschess.binaryToInfo = function(buffer, parseType){
    parseType = parseType || "auto";

    // 象棋演播室 XQF 格式
	if (parseType === "auto" && buffer[0] === 88 && buffer[1] === 81 || parseType === "xqf") {
		return vschess.binaryToInfo_XQF(buffer);
	}

    // 未能识别的数据，返回空
	return {};
};

// 从象棋演播室 XQF 格式中抽取棋局信息
vschess.binaryToInfo_XQF = function(buffer){
    var header = vschess.XQF_Header(buffer), r = {};

    header.Title    .length && (r.title     = vschess.GBK2UTF8(header.Title    ));
    header.MatchName.length && (r.event     = vschess.GBK2UTF8(header.MatchName));
    header.MatchTime.length && (r.date      = vschess.GBK2UTF8(header.MatchTime));
    header.MatchAddr.length && (r.place     = vschess.GBK2UTF8(header.MatchAddr));
    header.RedPlayer.length && (r.redname   = vschess.GBK2UTF8(header.RedPlayer));
    header.BlkPlayer.length && (r.blackname = vschess.GBK2UTF8(header.BlkPlayer));
    header.RedTime  .length && (r.redtime   = vschess.GBK2UTF8(header.RedTime  ));
    header.BlkTime  .length && (r.blacktime = vschess.GBK2UTF8(header.BlkTime  ));
    header.RMKWriter.length && (r.remark    = vschess.GBK2UTF8(header.RMKWriter));
    header.Author   .length && (r.author    = vschess.GBK2UTF8(header.Author   ));
    header.TimeRule .length && (r.timerule  = vschess.GBK2UTF8(header.TimeRule ));

    switch (header.PlayResult) {
        case  1: r.result = "1-0"; break;
        case  2: r.result = "0-1"; break;
        case  3: r.result = "1/2-1/2"; break;
        default: r.result = "*"; break;
    }

    return r;
};

// 将二进制原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vschess.binaryToNode = function(buffer, parseType){
    parseType = parseType || "auto";

    // 象棋演播室 XQF 格式
	if (parseType === "auto" && buffer[0] === 88 && buffer[1] === 81 || parseType === "xqf") {
		return vschess.binaryToNode_XQF(buffer);
	}

    // 中国游戏中心 CCM 格式
	if (parseType === "auto" && buffer[0] === 1 || parseType === "ccm") {
		return vschess.binaryToNode_CCM(buffer);
	}

    // 未能识别的数据，返回起始局面
	return { fen: vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
};

// 将中国游戏中心 CCM 格式转换为棋谱节点树
vschess.binaryToNode_CCM = function(buffer) {
	var stepList = [];

	for (k = 1; k < buffer.length; k += 7) {
		var fromX = 8 - buffer[k + 2];
		var   toX = 8 - buffer[k + 3];
		var fromY = 9 - buffer[k + 4];
		var   toY = 9 - buffer[k + 5];
		stepList.push(vschess.b2i[fromY * 9 + fromX] + vschess.b2i[toY * 9 + toX]);
	}

	return vschess.stepListToNode(vschess.defaultFen, stepList);
};

// 将象棋演播室 XQF 格式转换为棋谱节点树
vschess.binaryToNode_XQF = function(buffer) {
    var XQF_Header = vschess.XQF_Header(buffer    );
    var XQF_Key    = vschess.XQF_Key   (XQF_Header);

    // 计算开局 Fen 串
    var fenArray = new Array(91).join("*").split("");
    var fenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp";

    for (var i = 0; i < 32; ++i) {
        if (XQF_Header.Version > 11) {
            var pieceKey = XQF_Key.XYp + i + 1 & 31;
            var piecePos = XQF_Header.QiziXY[i] - XQF_Key.XYp & 255;
        }
        else {
            var pieceKey = i;
            var piecePos = XQF_Header.QiziXY[i];
        }

        if (piecePos < 90) {
            var X = Math.floor(piecePos / 10);
            var Y = 9 - piecePos % 10;
            fenArray[Y * 9 + X] = fenPiece.charAt(pieceKey);
        }
    }

    fen  = vschess.arrayToFen(fenArray);
    fen +=  XQF_Header.WhoPlay === 1 ? " b - - 0 " : " w - - 0 ";
    fen += (XQF_Header.PlayStepNo >> 1) || 1;

    // 解密数据
    if (XQF_Header.Version > 15) {
        var decode = [];

        for (var i = 1024; i < buffer.length; ++i) {
            decode.push(buffer[i] - XQF_Key.F32[i % 32] & 255);
        }
    }
    else {
        var decode = Array.from(buffer.slice(1024));
    }

    // 求和函数
    var K = function(start, length){
        var array = decode.slice(start, start + length), sum = 0;

        for (var i = 0; i < array.length; ++i) {
            sum += array[i] * Math.pow(256, i);
        }

        return sum;
    };

    // 生成节点树
    var node = { fen: fen, comment: comment, next: [], defaultIndex: 0 };
    var parent = node, changeNode = [];

    for (var pos = 0; pos < decode.length;) {
        // 着法计算
        var Pf = decode[pos    ] - 24 - XQF_Key.XYf & 255;
        var Pt = decode[pos + 1] - 32 - XQF_Key.XYt & 255;
        var Xf = Math.floor(Pf / 10);
        var Xt = Math.floor(Pt / 10);
        var Yf = 9 - Pf % 10;
        var Yt = 9 - Pt % 10;

        // 注释提取
        if (XQF_Header.Version > 10) {
            if (decode[pos + 2] & 32) {
                var commentLen = K(pos + 4, 4) - XQF_Key.RMK;
                var comment = vschess.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
                var nextOffset = commentLen + 8;
            }
            else {
                var comment = "";
                var nextOffset = 4;
            }
        }
        else {
            var commentLen = K(pos + 4, 4);
            var comment = vschess.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
            var nextOffset = commentLen + 8;
        }

        // 生成节点树
        if (pos) {
            var move = vschess.b2i[Yf * 9 + Xf] + vschess.b2i[Yt * 9 + Xt];
            var step = { move: move, comment: comment, next: [], defaultIndex: 0 };
            parent.next.push(step);

            var hasNext   = decode[pos + 2] & (XQF_Header.Version > 10 ? 128 : 240);
            var hasChange = decode[pos + 2] & (XQF_Header.Version > 10 ?  64 :  15);

            if (hasNext) {
                hasChange && changeNode.push(parent);
                parent = step;
            }
            else {
                hasChange || (parent = changeNode.pop());
            }
        }
        else {
            node.comment = comment;
        }

        // 指针往前走
        pos += nextOffset;
    }

    // 增强兼容性
    if (node.next.length) {
        var fenArray = vschess.fenToArray(node.fen);
        var fenSplit = node.fen.split(" ");
        var position = vschess.i2b[node.next[0].move.substring(0, 2)];

        if (fenArray[position].toUpperCase() === fenArray[position]) {
            fenSplit[1] = "w";
        }
        else {
            fenSplit[1] = "b";
        }

        node.fen = fenSplit.join(" ");
    }

    return node;
};

// 从原始数据中抽取棋局信息
vschess.dataToInfo = function(chessData, parseType){
	chessData = vschess.replaceNbsp(chessData);
	var replaceQuote = chessData.replace(/\'/g, '"');
	parseType = parseType || "auto";

	// 标准节点树格式，即鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("n version") || parseType === "pfc") {
		return vschess.dataToInfo_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return vschess.dataToInfo_DhtmlXQ(chessData);
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return vschess.dataToInfo_DHJHtmlXQ(chessData);
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~replaceQuote.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return vschess.dataToInfo_PGN(chessData);
	}

	// PlayOK 格式
	if (parseType === "auto" && ~chessData.indexOf("START{") || parseType === "playok") {
		return vschess.dataToInfo_PlayOK(chessData);
	}

	// 未能识别的数据，返回空
	return {};
};

// 从鹏飞象棋 PFC 格式中抽取棋局信息
vschess.dataToInfo_PFC = function(chessData){
	chessData = chessData.replace("<!--", "").replace("-->", "").replace(/<\?xml(.*)\?>/, "");
	chessData = chessData.replace(/<n/ig, "<div").replace(/\/>/ig, "></div>").replace(/<\/n>/ig, "</div>");
	var node  = $(vschess.trim(chessData)), result = {};

	for (var i in vschess.info.name) {
		node.attr(i) && (result[i] = vschess.stripTags(node.attr(i)));
	}

	return result;
};

// 从标准 PGN 格式中抽取棋局信息
vschess.dataToInfo_PGN = function(chessData){
	// 识别模式 A
	var resultA = {}, original = {};
	var lines = chessData.split("\n");

	for (var i = 0; i < lines.length; ++i) {
		var l = vschess.trim(lines[i]);
		var start = l.    indexOf("[");
		var end   = l.lastIndexOf("]");

		if (~start && ~end) {
			var info  = l.substring(start + 1, end);
			var name  = info.split(/[\s]/)[0];
			var value = vschess.trim(info.replace(name, ""));
			var quotA = value.charAt(0               ) === "'" || value.charAt(0               ) === '"';
			var quotB = value.charAt(value.length - 1) === "'" || value.charAt(value.length - 1) === '"';
			quotA && (value = value.substring(1                  ));
			quotB && (value = value.substring(0, value.length - 1));
			original[name] = value;
		}
	}

	for (var i in vschess.info.name) {
		var name = vschess.info.pgn[i] || vschess.fieldNameToCamel(i);
		original[name] && (resultA[i] = vschess.stripTags(original[name]));
	}

	// 识别模式 B
	var resultB = {};

	for (var i in vschess.info.name) {
		var startTag = "[" + (vschess.info.pgn[i] || vschess.fieldNameToCamel(i));
		var startPos = chessData.indexOf(startTag);

		if (~startPos) {
			var value = chessData.substring(startPos + startTag.length + 2, chessData.indexOf("]", startPos) - 1);
			value && (resultB[i] = vschess.stripTags(value));
		}
	}

	// AB 结果集合并
	for (var i in resultB) {
		(!resultA[i] || resultB[i].length > resultA[i].length) && (resultA[i] = resultB[i]);
	}

	return resultA;
};

// 从 PlayOK 格式中抽取棋局信息
vschess.dataToInfo_PlayOK = function(chessData){
	var result = {};
	var lines = chessData.split("\n");

	for (var i = 0; i < lines.length; ++i) {
		var line = vschess.trim(lines[i]);

		if (line.indexOf("RED") === 0) {
			var RED = line.split(";");
			result.red = vschess.trim(RED[0].replace("RED", ""));
			result.redrating = RED[1];
		}
		else if (line.indexOf("BLACK") === 0) {
			var BLACK = line.split(";");
			result.black = vschess.trim(BLACK[0].replace("BLACK", ""));
			result.blackrating = BLACK[1];
		}
		else if (line.indexOf("RESULT") === 0) {
			result.result = vschess.trim(line.replace("RESULT", ""));
		}
		else if (line.indexOf("DATE") === 0) {
			result.date = vschess.trim(line.replace("DATE", "")).split(" ")[0];
		}
		else if (line.indexOf("BLACK") === 0) {
			var EVENT = line.split(";");
			result.event = vschess.trim(EVENT[0].replace("EVENT", ""));
			result.group = EVENT[1];
		}
	}

	return result;
};

// 从东萍象棋 DhtmlXQ 格式中抽取棋局信息
vschess.dataToInfo_DhtmlXQ = function(chessData){
	var eachLine = chessData.split("[DhtmlXQ");
	var small = [];

	for (var i = 0; i < eachLine.length; ++i) {
		~eachLine[i].indexOf("_comment") || ~eachLine[i].indexOf("_move") || small.push(eachLine[i]);
	}

	chessData = small.join("[DhtmlXQ");
	var result = {};

	for (var i in vschess.info.name) {
		var startTag = "[DhtmlXQ_" + (vschess.info.DhtmlXQ[i] || i) + "]";
		var startPos = chessData.indexOf(startTag);

		if (~startPos) {
			var value = chessData.substring(startPos + startTag.length, chessData.indexOf("[/DhtmlXQ_", startPos));
			value && (result[i] = vschess.stripTags(value));
		}
	}

	result.result = vschess.dataText(result.result, "result");
	return result;
};

// 从广东象棋网打虎将 DHJHtmlXQ 格式中抽取棋局信息
vschess.dataToInfo_DHJHtmlXQ = function(chessData){
	for (var i in vschess.info.DHJHtmlXQ) {
		chessData = chessData.replace(RegExp("DHJHtmlXQ_" + vschess.info.DHJHtmlXQ[i], "g"), "DhtmlXQ_" + i);
	}

	return vschess.dataToInfo_DhtmlXQ(chessData);
};

// 检查原始数据中是否包含棋谱
vschess.isDataHasBook = function(chessData, parseType){
	chessData = vschess.replaceNbsp(chessData);
	var match, RegExp = vschess.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~chessData.indexOf("n version") || parseType === "pfc") {
		return true;
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return true;
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return true;
	}

	// QQ新中国象棋格式
	if (parseType === "auto" && RegExp.QQNew.test(chessData) || parseType === "qqnew") {
		return true;
	}

	// 象棋世家格式
	if (parseType === "auto" && RegExp.ShiJia.test(chessData) || parseType === "shijia") {
		return true;
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return true;
	}

	// PlayOK 格式
	if (parseType === "auto" && ~chessData.indexOf("START{") || parseType === "playok") {
		return true;
	}

	// 发现着法，尝试识别
	if (RegExp.Chinese.test(chessData)) {
		return true;
	}

	if (RegExp.WXF.test(chessData)) {
		return true;
	}

	if (RegExp.ICCS.test(chessData)) {
		return true;
	}

	if (RegExp.Node.test(chessData)) {
		return true;
	}

	if (RegExp.FenMini.exec(chessData)) {
		return true;
	}

	return false;
};

// 将原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vschess.dataToNode = function(chessData, parseType){
	var match, RegExp = vschess.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~chessData.indexOf("n version") || parseType === "pfc") {
		return vschess.dataToNode_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return vschess.dataToNode_DhtmlXQ(chessData);
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return vschess.dataToNode_DHJHtmlXQ(chessData);
	}

	// QQ新中国象棋格式
	if (parseType === "auto" && RegExp.QQNew.test(chessData) || parseType === "qqnew") {
		return vschess.dataToNode_QQNew(chessData);
	}

	// 象棋世家格式
	if (parseType === "auto" && RegExp.ShiJia.test(chessData) || parseType === "shijia") {
		return vschess.dataToNode_ShiJia(chessData);
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return vschess.dataToNode_PGN(chessData);
	}

	// PlayOK 格式
	if (parseType === "auto" && ~chessData.indexOf("START{") || parseType === "playok") {
		return vschess.dataToNode_PlayOK(chessData);
	}

	// 中国游戏中心 CCM 格式
	if (parseType === "auto" && vschess.cca(chessData) === 1 || parseType === "ccm") {
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

	// 简易坐标格式兼容，将简易坐标转换为 ICCS 格式，然后直接调用 ICCS 转换器转换，其实 PGN 格式并没有此种着法格式。
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

	// 迷你 Fen 串
	if (match = RegExp.FenMini.exec(chessData)) {
		return { fen: match[0] + " w - - 0 1", comment: "", next: [], defaultIndex: 0 };
	}

	// 未能识别的数据，返回起始局面
	return { fen: vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
};

// 将鹏飞象棋 PFC 格式转换为棋谱节点树
vschess.dataToNode_PFC = function(chessData){
	if (~chessData.indexOf("[pfchessrecord]")) {
		var start = chessData.indexOf("<!--");
		var end   = chessData.indexOf("-->");
		chessData = chessData.substring(start + 4, end).replace(/<\?xml(.*)\?>/, "");
	}
	else {
		chessData = chessData.replace("<!--", "").replace("-->", "").replace(/<\?xml(.*)\?>/, "");
	}

	chessData  = chessData.replace(/<n/ig, "<div").replace(/\/>/ig, "></div>").replace(/<\/n>/ig, "</div>");
	var node   = $(vschess.trim(chessData));
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
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "ICCS"]')) {
		var format = "iccs";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "WXF"]')) {
		var format = "wxf";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/1\-0([\S\s]*)/g, "").replace(/0\-1([\S\s]*)/g, "")
			.replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else {
		var format = "chinese";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
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
	var match, startFen, noFenData;

	if (match = RegExp.FenLong.exec(originalChessData)) {
		startFen  = match[0];
		noFenData = chessData.replace(RegExp.FenMini, "");
	}
	else if (match = RegExp.FenShort.exec(originalChessData)) {
		startFen = match[0] + " - - 0 1";
		noFenData = chessData.replace(RegExp.FenMini, "");
	}
	else if (match = RegExp.FenMini.exec(originalChessData)) {
		startFen = match[0] + " w - - 0 1";
		noFenData = chessData.replace(RegExp.FenMini, "");
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

	// 交换先后手，用于纠正 Fen 串的先后手错误和自动识别迷你 Fen 串的先后手
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

// 将 PlayOK 格式转换为棋谱节点树
vschess.dataToNode_PlayOK = function(chessData){
	var start = chessData.indexOf("{");
	var end   = chessData.indexOf("}");
	return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "WXF"]' + chessData.substring(start + 1, end));
};

// 将东萍象棋 DhtmlXQ 格式转换为棋谱节点树
vschess.dataToNode_DhtmlXQ = function(chessData, onlyFen){
	var DhtmlXQ_Comment	 = {};
	var DhtmlXQ_Change	 = [];
	var DhtmlXQ_Start	 = "";
	var DhtmlXQ_MoveList = "";
	var DhtmlXQ_Fen		 = "";
	var DhtmlXQ_EachLine = chessData.split("[DhtmlXQ");

	for (var i = 0; i < DhtmlXQ_EachLine.length; ++i) {
		var l = "[DhtmlXQ" + DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_comment")) {
			var start	  = l.indexOf("]");
			var commentId = l.substring(16, start);
			~commentId.indexOf("_") || (commentId = "0_" + commentId);
			DhtmlXQ_Comment[commentId] = l.substring(start + 1, l.indexOf("[/DhtmlXQ_")).replace(/\|\|/g, "\n").replace(/\\u([0-9a-zA-Z]{4})/g, function(){ return vschess.fcc(parseInt(arguments[1], 16)); });
		}
		else if (~l.indexOf("[DhtmlXQ_binit")) {
			DhtmlXQ_Start = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_"));
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			DhtmlXQ_MoveList = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_"));
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start	 = l.indexOf("]");
			var changeId = l.substring(14, start);
			DhtmlXQ_Change.push({ id: changeId, change: l.substring(start + 1, l.indexOf("[/DhtmlXQ_")) });
		}
		else if (~l.indexOf("[DhtmlXQ_fen")) {
			DhtmlXQ_Fen = l.substring(l.indexOf("[DhtmlXQ_fen") + 13, l.indexOf("[/DhtmlXQ_"));
		}
	}

	// Fen 串优先
	if (DhtmlXQ_Fen) {
		var DhtmlXQ_ToFenFinal = DhtmlXQ_Fen;
	}
	// 抽取起始局面，生成起始 Fen 串
	else {
		if (DhtmlXQ_Start) {
			var DhtmlXQ_ToFen = new Array(91).join("*").split(""), DhtmlXQ_ToFenFinal = [];
			var DhtmlXQ_ToFenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp";

			for (var i = 0; i < 32; ++i) {
				var move = DhtmlXQ_Start.substring(i * 2, i * 2 + 2).split("");
				DhtmlXQ_ToFen[+move[0] + move[1] * 9] = DhtmlXQ_ToFenPiece.charAt(i);
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
	}

	if (onlyFen) {
		return DhtmlXQ_ToFenFinal;
	}

	var branchHashTable = {};

	// DhtmlXQ 着法列表转换为 node 节点列表
	function DhtmlXQ_MoveToMove(s){
		var moveList = [];

		while (s.length) {
			var move = s.slice(-4).split("");
			moveList.push(vschess.fcc(+move[0] + 97) + (9 - move[1]) + vschess.fcc(+move[2] + 97) + (9 - move[3]));
			s = s.slice(0, -4);
		}

		return moveList;
	}

	// 根据 node 节点列表创建分支
	function makeBranch(list, target, b, i){
		var next = { move: list.pop(), comment: DhtmlXQ_Comment[b + "_" + i] || "", next: [], defaultIndex: 0 };
		branchHashTable[b + "_" + ++i] = next;
		target.next.push(next);
		list.length && makeBranch(list, next, b, i);
	}

	// 生成主分支
	var result   = { fen: DhtmlXQ_ToFenFinal, comment: DhtmlXQ_Comment["0_0"] || "", next: [], defaultIndex: 0 };
	var moveList = DhtmlXQ_MoveToMove(DhtmlXQ_MoveList);
	branchHashTable["0_1"] = result;
	moveList.length && makeBranch(moveList, result, 0, 1);

	// 生成变着分支
	var undoList = [];

	for (var i = 0; i < DhtmlXQ_Change.length; ++i) {
		var line   = DhtmlXQ_Change[i];
		var id     = line.id.split("_");
		var target = branchHashTable[id[0] + "_" + id[1]];

		if (target) {
			var moveList = DhtmlXQ_MoveToMove(line.change);
			moveList.length && makeBranch(moveList, target, id[2], id[1]);
			undoList.length = 0;
		}
		else {
			if (~undoList.indexOf(line.id)) {
				break;
			}
			else {
				DhtmlXQ_Change.push(line   );
				undoList      .push(line.id);
			}
		}
	}

	return result;
};

// 将广东象棋网打虎将 DHJHtmlXQ 格式转换为棋谱节点树
vschess.dataToNode_DHJHtmlXQ = function(chessData){
	chessData = chessData.replace(/DHJHtmlXQ/g, "DhtmlXQ");
	chessData = chessData.replace(/DhtmlXQ_31/g, "DhtmlXQ_fen");
	chessData = chessData.replace(/DhtmlXQ_32/g, "DhtmlXQ_startPlayer");
	chessData = chessData.replace(/DhtmlXQ_33/g, "DhtmlXQ_startStep");
	chessData = chessData.replace(/DhtmlXQ_34/g, "DhtmlXQ_movelist");
	chessData = chessData.replace(/game_comment_/g, "DhtmlXQ_comment");
	chessData = chessData.replace(/comment_/g, "DhtmlXQ_comment");

	if (~chessData.indexOf("[DhtmlXQ_startPlayer")) {
		var start = chessData.indexOf("[DhtmlXQ_startPlayer");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var begin = chessData.substring(start + 21, end);
		begin = +begin === 1 ? "b" : "w";
	}
	else {
		var begin = "w";
	}

	if (~chessData.indexOf("[DhtmlXQ_startStep")) {
		var start = chessData.indexOf("[DhtmlXQ_startStep");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var step  = chessData.substring(start + 19, end);
		step = begin === "w" ? Math.floor(step / 2) + 1 : Math.ceil(step / 2) + 1;
	}
	else {
		var step = 1;
	}

	if (~chessData.indexOf("[DhtmlXQ_fen")) {
		var start = chessData.indexOf("[DhtmlXQ_fen");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var fen   = chessData.substring(start + 13, end);

		if (fen) {
			fen = vschess.arrayToFen(fen.split("")) + " " + begin + " - - 0 " + step;
		}
		else {
			fen = vschess.defaultFen;
		}

		chessData = chessData.replace(chessData.substring(start, end + 14), "[DhtmlXQ_fen]" + fen + "[/DhtmlXQ_fen]");
	}

	if (~chessData.indexOf("[DhtmlXQ_movelist")) {
		var start = chessData.indexOf("[DhtmlXQ_movelist");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var moves = chessData.substring(start + 18, end);

		var moveSplit = moves.split("");

		for (var i = 1; i < moveSplit.length; i += 2) {
			moveSplit[i] = 9 - moveSplit[i];
		}

		moves = moveSplit.join("");
		chessData = chessData.replace(chessData.substring(start, end + 19), "[DhtmlXQ_movelist]" + moves + "[/DhtmlXQ_movelist]");
	}

	return vschess.dataToNode_DhtmlXQ(chessData);
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
		var chessman  = "*PPPPPCCNNRRBBAAKpppppccnnrrbbaak";
		var situation = vschess.fenToSituation(vschess.blankFen);
		situation[0]  = match[33].toUpperCase() === "B" ? 2 : 1;

		for (var i = 1; i < 33; ++i) {
			situation[match[i] - 1] = vschess.f2n[chessman.charAt(i)];
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
	typeof num === "undefined" && typeof defaultValue !== "undefined" && (num = defaultValue);
	vschess.isNumber(min) || (min = -Infinity);
	vschess.isNumber(max) || (max =  Infinity);
	vschess.isNumber(num) || (num =         0);
	num < min && (num = min);
	num > max && (num = max);
	return +num;
};

// 正则表达式，使用时都是新的，避免出现 lastIndex 冲突
vschess.RegExp = function(){
	return {
		// Fen 串识别正则表达式
		FenLong	: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr][\s]-[\s]-[\s][0-9]+[\s][0-9]+/,
		FenShort: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr]/,
		FenMini : /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}/,

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

// Fen 串是否为红方
vschess.fenIsR = function(fen){
	return !vschess.fenIsB(fen);
};

// Fen 串是否为黑方
vschess.fenIsB = function(fen){
	return fen.split(" ")[1].toLowerCase() === "b";
};

// Fen 串改变走棋方
vschess.fenChangePlayer = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var fenSplit = fen.split(" ");
	fenSplit[1]  = vschess.fenIsB(fen) ? "w" : "b";
	return fenSplit.join(" ");
};

// Fen 串转换为局面
vschess.fenToSituation = function(fen){
	var fenSplit  = fen.split(" ");
	var situation = vschess.situation.slice(0);
	var currentPiece = 0;
	var pieceEach = vschess.fenToArray(fen);
	situation[0] = vschess.fenIsB(fen) ? 2 : 1;
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
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
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
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
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
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

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
			case "node": return move;
			case "iccs": return vschess.Node2ICCS_NoFen(move);
			case "wxf" : return vschess.Node2WXF    (move, fromFen).move;
			default    : return vschess.Node2Chinese(move, fromFen).move;
		}
	}

	switch (format) {
		case "node": return "none";
		case "iccs": return "Error";
		case "wxf" : return "None";
		default    : return "\u65e0\u6548\u7740\u6cd5";
	}
};

// Fen 串移动一枚棋子
vschess.fenMovePiece = function(fen, move){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var situation = vschess.fenToSituation(fen);
	var src = vschess.i2s[move.substring(0, 2)];
	var dst = vschess.i2s[move.substring(2, 4)];
	situation[dst] = situation[src];
	situation[src] = 1;
	situation[0]   = 3    - situation[0];
	situation[0] === 1 && ++situation[1];
	return vschess.situationToFen(situation);
};

// Fen 串颠倒红黑
vschess.invertFen = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var fenSplit = fen.split(" ");
	fenSplit[1]  = vschess.fenIsB(fen) ? "w" : "b";
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	var eachPiece = fenSplit[0].split("");

	for (var i = 0; i < eachPiece.length; ++i) {
		eachPiece[i] = vschess.cca(eachPiece[i]) > 96 ? eachPiece[i].toUpperCase() : eachPiece[i].toLowerCase();
	}

	fenSplit[0] = eachPiece.join("");
	return fenSplit.join(" ");
};

// 获取棋局信息显示文本
vschess.showText = function(showText, item){
	var map = {
		result: { "*": "", "1-0": "\u7ea2\u80dc", "0-1": "\u9ed1\u80dc", "1/2-1/2": "\u548c\u68cb" }
	};

	return map[item] && map[item][showText] || showText;
};

// 获取棋局信息数据文本
vschess.dataText = function(dataText, item){
	var map = {
		result: {
			"\u7ea2\u80dc": "1-0", "\u7ea2\u5148\u80dc": "1-0", "\u9ed1\u8d1f": "1-0",
			"\u7ea2\u8d1f": "0-1", "\u7ea2\u5148\u8d1f": "0-1", "\u9ed1\u80dc": "0-1", "0-1": "0-1",
			"\u7ea2\u548c": "1/2-1/2", "\u7ea2\u5148\u548c": "1/2-1/2", "\u548c\u68cb": "1/2-1/2", "\u548c": "1/2-1/2",
			"1-0": "1-0", "0-1": "0-1", "1/2-1/2": "1/2-1/2",
			__default__: "*"
		}
	};

	return map[item] && (map[item][dataText] || map[item].__default__) || dataText;
};

// PGN 字段驼峰化
vschess.fieldNameToCamel = function(fieldName){
	var key = fieldName || "";
	var keySplit = key.split("");

	if (key.length > 3 && key.substring(0, 3) === "red") {
		keySplit[0] = "R";
		keySplit[3] = keySplit[3].toUpperCase();
	}
	else if (key.length > 5 && key.substring(0, 5) === "black") {
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
	var tempArr = [], blank = 0;

	for (var i = 0; i < 90; ++i) {
		if (array[i] === "*") {
			++blank;
		}
		else {
			blank && tempArr.push(blank);
			blank = 0;
			tempArr.push(array[i]);
		}

		if (i % 9 === 8) {
			blank && tempArr.push(blank);
			blank = 0;
			tempArr.push("/");
		}
	}

	--tempArr.length;
	return tempArr.join("");
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

// 文字棋盘
vschess.textBoard = function(fen, options) {
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	typeof options === "undefined" && (options = vschess.defaultOptions);

	function piece(f){
		var pieceId = vschess.f2n[f];

		if (pieceId > 32) {
			return "[" + options.ChineseChar.Piece[(pieceId & 15) + 6] + "]";
		}

		if (pieceId > 16) {
			return "(" + options.ChineseChar.Piece[(pieceId & 15) - 1] + ")";
		}

		return "----";
	}

	var isB = vschess.fenIsB(fen);
	var board = vschess.fenToArray(fen);
	var text = [isB ? "\u9ed1\u65b9 \u8d70\u68cb\u65b9\n\n" : "\u9ed1\u65b9\n\n"];

	var boardText = [
		" \u250c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u2510 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u203b-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2524 ",
		" \u251c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u203b-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u2514-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2518 "
	];

	var insertLine = ["",
		"\n \u2502  \u2502  \u2502  \u2502\uff3c\u2502\uff0f\u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502\uff0f\u2502\uff3c\u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502    \u695a  \u6cb3          \u6c49  \u754c    \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502\uff3c\u2502\uff0f\u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502\uff0f\u2502\uff3c\u2502  \u2502  \u2502  \u2502 \n"
	];

	for (var i = 0; i < 90; ++i) {
		i % 9 === 0 && text.push(insertLine[i / 9]);
		text.push(board[i] === "*" ? boardText[i] : piece(board[i]));
	}

	text.push(isB ? "\n\n\u7ea2\u65b9" : "\n\n\u7ea2\u65b9 \u8d70\u68cb\u65b9");
	return text.join("").replace(/--/g, "\u2500");
};

// 字符串清除标签
vschess.stripTags = function(str){
	return $('<div>' + str + '</div>').text();
};

// 时间格式统一
vschess.dateFormat = function(date){
	if (/^([0-9]{8})$/.test(date)) {
		return date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
	}

	return date;
};

// 替换不间断空格
vschess.replaceNbsp = function(str){
	return str.replace(new RegExp(vschess.fcc(160), "g"), " ");
};

// 长 Fen 串变短 Fen 串
vschess.shortFen = function(fen){
	return fen.split(' ')[0] + ' ' + fen.split(' ')[1];
};

// GBK 转 UTF-8 编码表
vschess.GBK2UTF8Charset = (function(){
	// 压缩编码表，负数表示无数据的间隔，例如-5表示连续5个值无数据
	// 0-114表示连续编码长度
	// 164及以上为正式数据
	// 举例：20726,4，会被解码为 20726,20727,20728,20729,20730
	var charset = [19970,19972,2,19983,19986,19991,19999,2,20003,20006,20009,20014,1,20017,20019,20021,20023,20028,20032,2,20036,20038,20042,20049,20053,20055,20058,1,20066,3,20071,1,20074,5,20082,20084,9,20095,6,20103,20106,-1,20112,20118,1,20121,20124,2,20131,20138,20143,2,20148,20150,3,20156,2,20168,20172,20175,1,20178,20186,2,20192,20194,20198,1,20201,20205,2,20209,20212,20216,2,20220,20222,20224,20226,6,20235,1,20242,4,20252,1,20257,20259,20264,1,20268,2,20273,20275,20277,20279,20281,20283,20286,4,20292,1,20295,5,20306,20308,20310,20321,1,20326,20328,20330,1,20333,1,20337,1,20341,20343,3,20349,20352,2,20357,2,20362,20364,20366,20368,20370,1,20373,1,20376,2,20380,20382,1,20385,1,-65,20388,20395,20397,20400,4,20406,8,20416,2,20422,3,20427,2,20434,4,20441,20443,20448,20450,20452,1,20455,20459,1,20464,20466,20468,3,20473,20475,2,20479,11,-1,20491,20494,20496,1,20499,20501,2,20507,20509,1,20512,20514,2,20519,20523,20527,10,20539,20541,20543,3,20548,2,20553,2,20557,20560,4,20566,3,20571,20573,7,20582,5,20589,8,20600,2,20604,1,20609,3,20614,1,20617,3,20622,20,20644,20646,20650,1,20653,4,20659,6,20668,-65,20669,17,20688,5,20695,2,20699,10,20712,3,20719,3,20724,20726,4,20732,9,20744,-1,20745,1,20748,5,20755,13,20770,28,20802,20807,20810,20812,20814,2,20818,1,20823,2,20827,20829,4,20835,1,20838,1,20841,1,20847,20850,20858,20862,1,20867,1,20870,1,20874,1,20878,3,20883,1,20888,20890,20893,2,20897,20899,20902,4,20909,1,20916,20920,2,20926,1,20929,2,20933,20936,20938,20941,1,20944,20946,5,-65,20952,2,20956,20958,1,20962,1,20965,5,20972,20974,20977,1,20980,20983,20990,20996,1,21001,21003,1,21007,1,21011,2,21020,21022,1,21025,2,21029,2,21034,21036,21039,21041,1,21044,1,21052,21054,21060,5,21067,21070,1,21074,1,21077,21079,1,-1,21081,2,21085,21087,1,21090,2,21094,21096,21099,3,21104,1,21107,9,21118,21120,21123,4,21129,6,21137,1,21140,6,21148,21156,3,21166,2,21172,9,21184,2,21188,2,21192,21194,21196,3,21201,21203,2,21207,21209,5,21216,3,21221,10,21233,7,21243,2,21249,3,21255,21257,3,21262,-65,21265,3,21272,21275,1,21278,1,21282,21284,1,21287,2,21291,2,21295,9,21308,1,21312,21314,21316,21318,21323,2,21328,21332,21336,1,21339,21341,21349,21352,21354,21356,1,21362,21366,21369,21371,3,21376,1,21379,21383,1,21386,21390,1,-1,21392,4,21398,1,21401,21403,1,21406,21408,1,21412,21415,21418,3,21423,6,21431,3,21436,2,21440,21443,4,21454,2,21458,1,21461,21466,21468,2,21473,1,21479,21492,21498,21502,2,21506,21509,21511,21515,21524,21528,2,21532,21538,21540,1,21546,21552,21555,21558,1,21562,21565,21567,21569,1,21572,1,21575,21577,21580,3,21585,21594,21597,4,21603,21605,21607,21609,7,21620,21625,1,21630,1,21633,21635,21637,21639,3,21645,21649,21651,21655,1,21660,21662,3,-65,21666,21669,21678,21680,21682,21685,2,21689,1,21692,21694,21699,21701,21706,1,21718,21720,21723,21728,4,21739,1,21743,2,21748,5,21755,21758,21760,21762,3,21768,21770,4,21778,1,21781,5,21788,3,21793,21797,1,-1,21800,1,21803,21805,21810,21812,2,21816,3,21821,21824,21826,21829,21831,1,21835,4,21841,3,21847,4,21853,3,21858,1,21864,1,21867,21871,5,21881,1,21885,21887,21893,1,21900,2,21904,21906,1,21909,2,21914,1,21918,21920,6,21928,8,21938,21940,21942,21944,21946,21948,21951,4,21958,2,21962,1,21966,2,21973,21975,4,21982,21984,21986,21991,21993,21997,1,22000,1,22004,22006,22008,4,22015,22018,3,-65,22022,1,22026,1,22029,22032,7,22041,1,22044,1,22048,2,22053,1,22056,3,22062,2,22067,22069,22071,1,22074,22076,2,22080,11,22095,4,22101,1,22106,1,22109,4,-1,22115,22117,2,22125,3,22130,3,22135,3,22141,7,22151,6,22160,2,22164,14,22180,10,22192,6,22200,3,22205,12,22219,8,22229,1,22232,1,22236,22243,22245,5,22252,22254,1,22258,1,22262,2,22267,1,22272,2,22277,22279,22283,6,-65,22290,9,22301,1,22304,2,22308,3,22315,22321,1,22324,4,22332,1,22335,22337,22339,3,22344,1,22347,22354,4,22360,1,22370,1,22373,22375,22380,22382,22384,2,22388,1,22392,2,22397,3,-1,22401,22407,3,22413,4,22420,6,22428,3,22437,22440,22442,22444,22447,2,22451,22453,2,22457,8,22468,6,22476,1,22480,1,22483,22486,1,22491,1,22494,22497,2,22501,7,22510,22512,3,22517,2,22523,1,22526,1,22529,22531,2,22536,2,22540,22542,2,22546,2,22550,2,22554,3,22559,22562,1,22565,4,22571,4,22577,3,22582,7,-65,22590,5,22597,6,22606,2,22610,1,22613,2,22617,4,22623,5,22630,4,22637,16,22655,22658,22660,22662,2,22666,2,-1,22669,4,22676,4,22683,2,22688,7,22698,17,22717,3,22722,2,22726,10,22738,2,22742,13,22757,5,22765,22767,22769,1,22772,1,22775,1,22778,7,22787,22789,1,22792,4,22798,22800,3,22807,1,22811,22813,1,22816,3,22822,22824,22828,22832,22834,1,22837,1,22843,-65,22845,3,22851,22853,1,22858,22860,1,22864,22866,1,22873,22875,4,22881,22883,1,22886,12,22901,22903,22906,2,22910,2,22917,22921,22923,1,22926,3,22932,1,22936,22938,3,22943,3,22950,-1,22951,22956,1,22960,1,22963,5,22970,22972,1,22975,6,22983,2,22988,3,22997,1,23001,23003,23006,4,23012,23014,1,23017,2,23021,11,23034,23036,2,23040,23042,23050,1,23053,3,23058,23060,3,23065,2,23069,1,23073,1,23076,23078,2,23082,6,23091,23093,23095,4,23101,2,23105,4,23111,1,23115,9,23126,3,23131,5,-65,23137,23139,3,23144,1,23147,8,23160,1,23163,3,23168,17,23187,6,23196,13,23211,1,-1,23213,4,23220,23222,1,23225,4,23231,1,23235,5,23242,1,23245,4,23251,23253,23255,23257,2,23261,2,23266,23268,1,23271,1,23274,23276,4,23282,22,23306,11,23320,25,23347,23349,1,23352,7,23361,6,-65,23368,7,23378,23382,23390,23392,1,23399,1,23403,23405,2,23410,23412,23414,3,23419,1,23422,1,23426,23430,23434,23437,1,23440,2,23444,23446,23455,23463,2,23468,3,23473,1,23479,23482,2,23488,1,23491,23496,3,23501,2,-1,23505,23508,8,23520,23522,1,23526,1,23529,4,23535,23537,6,23549,1,23552,23554,1,23557,23559,1,23563,3,23568,23570,1,23575,23577,23579,23582,3,23587,23590,23592,3,23597,3,23602,1,23605,2,23619,1,23622,1,23628,1,23634,2,23638,2,23642,3,23647,23650,23652,23655,6,23664,23666,6,23675,3,23680,23683,4,23689,2,23694,1,23698,1,23701,23709,4,23716,4,-65,23722,23726,2,23730,23732,23734,23737,3,23742,23744,23746,1,23749,5,23756,5,23763,5,23770,6,23778,1,23783,23785,23787,1,23790,1,23793,9,23804,4,-1,23809,23812,1,23816,5,23823,4,23829,23831,3,23836,1,23839,4,23845,23848,23850,2,23855,4,23861,7,23871,7,23880,1,23885,10,23897,1,23900,23902,10,23914,23917,1,23920,3,23925,12,23939,21,23962,2,23966,2,-65,23969,21,23992,12,24006,6,24014,12,24028,24031,1,24035,1,24042,24044,1,-1,24048,24053,1,24056,4,24063,1,24068,24071,24073,2,24077,1,24082,1,24087,24094,7,24104,4,24111,1,24114,4,24121,1,24126,3,24131,24134,5,24141,6,24150,4,24156,1,24159,1,24163,14,24181,24183,24185,24190,24193,2,24197,24200,1,24204,2,24210,24216,24219,24221,24225,3,24232,4,24238,4,24244,24250,3,24255,6,-65,24262,2,24267,5,24276,1,24279,3,24284,11,24297,24299,8,24309,24312,1,24315,2,24325,2,24329,24332,2,24336,24338,24340,24342,24345,1,24348,2,24353,3,-1,24360,24363,1,24366,24368,24370,6,24379,24381,2,24385,14,24401,24404,24409,3,24414,2,24419,24421,24423,1,24427,24430,1,24434,24436,2,24440,24442,24445,2,24451,24454,24461,2,24465,24467,1,24470,24474,1,24477,3,24482,5,24489,24491,1,24495,5,24502,24504,3,24510,4,24519,1,24522,1,24526,24531,2,24538,2,24542,1,24546,1,24549,1,24552,1,24556,24559,1,24562,2,24566,1,24569,1,24572,24583,-65,24584,1,24587,1,24592,1,24595,24599,1,24602,24606,1,24610,2,24620,2,24624,4,24630,4,24637,1,24640,24644,6,24652,24654,1,24657,24659,1,24662,2,24667,1,24670,3,24677,1,24686,24689,1,24692,1,24695,24702,24704,-1,24705,1,24709,3,24714,1,24718,3,24723,24725,24727,2,24732,24734,24737,1,24740,1,24743,24745,1,24750,24752,24755,24757,2,24761,1,24765,7,24775,2,24780,4,24786,2,24790,1,24793,24795,24798,24801,4,24810,24817,1,24821,24823,1,24827,4,24834,3,24839,24842,2,24848,4,24854,3,24859,3,24865,1,24869,24872,2,24876,18,24896,6,-65,24903,24905,24907,24909,24911,1,24914,2,24918,6,24926,3,24931,3,24937,6,24945,3,24950,24952,18,24972,1,24975,4,24981,-1,24982,6,24990,8,25002,1,25005,9,25016,5,25023,2,25027,4,25033,25036,4,25043,25045,16,25063,13,25078,8,25088,5,25095,25097,25107,1,25113,25116,2,25120,25123,25126,3,25131,25133,25135,3,25141,1,25144,4,25154,25156,2,25162,-65,25167,1,25173,2,25177,1,25180,6,25188,1,25192,25201,1,25204,1,25207,1,25210,1,25213,25217,2,25221,3,25227,5,25236,25241,25244,2,25251,25254,1,25257,1,25261,3,25266,2,25270,2,25274,25278,25280,1,-1,25283,25291,25295,25297,25301,25309,1,25312,1,25316,25322,1,25328,25330,25333,25336,3,25344,25347,3,25354,3,25359,1,25362,3,25367,2,25372,25382,1,25385,25388,2,25392,1,25395,5,25403,1,25406,3,25412,25415,1,25418,25425,3,25430,7,25440,25444,2,25448,25450,2,25455,1,25458,3,25464,1,25468,3,25473,25475,3,25483,25485,25489,25491,2,25495,25497,6,25505,25508,25510,25515,25519,25521,1,25525,1,25529,25531,25533,25535,1,-65,25537,2,25541,25543,1,25546,2,25553,25555,2,25559,6,25567,25570,25572,4,25579,1,25582,3,25587,25589,25591,25593,3,25598,25603,1,25606,4,25613,1,25617,1,25621,5,25629,25631,25634,2,-1,25637,25639,2,25643,25646,5,25653,4,25659,1,25662,25664,25666,1,25673,25675,6,25683,25685,2,25689,4,25695,7,25704,25706,2,25710,9,25723,6,25731,25734,25736,8,25747,1,25751,1,25754,3,25759,4,25765,3,25770,1,25775,25777,3,25782,25785,25787,25789,2,25793,25795,1,25798,6,25807,25809,25811,3,25817,1,-65,25819,2,25823,2,25827,25829,25831,24,25857,7,25866,7,25875,4,25881,8,-1,25890,2,25894,4,25900,1,25904,3,25911,25914,25916,1,25920,4,25926,1,25930,1,25933,1,25936,25938,2,25943,1,25946,25948,25951,2,25956,1,25959,3,25965,2,25969,25971,25973,1,25976,14,25992,2,25997,2,26002,26004,2,26008,26010,26013,1,26016,26018,1,26022,26024,26026,26028,26030,26033,7,26042,1,26046,2,26050,26055,3,26061,26064,1,26067,2,26072,7,26081,26083,1,26090,1,-65,26098,3,26104,1,26107,4,26113,26116,1,26119,2,26123,26125,26128,2,26134,2,26138,2,26142,26145,3,26150,26153,3,26158,26160,26162,1,26167,4,26173,26175,1,26178,26180,6,26189,1,26192,1,26200,-1,26201,26203,3,26208,26210,1,26213,26215,26217,4,26225,2,26229,26232,1,26235,2,26239,2,26243,26245,1,26248,3,26253,3,26258,3,26264,4,26270,8,26281,4,26287,4,26293,3,26298,3,26303,25,26330,26334,7,26343,1,26346,5,26353,26357,1,26360,26362,1,26365,26369,2,-65,26372,3,26380,26382,1,26385,2,26390,26392,2,26396,26398,26400,5,26407,26409,26414,26416,26418,1,26422,3,26427,1,26430,1,26433,26436,1,26439,26442,1,26445,26450,26452,1,26455,4,26461,26466,2,26470,1,26475,1,26478,26481,26484,26486,-1,26488,3,26493,26496,26498,1,26501,1,26504,26506,26508,3,26513,3,26518,26521,26523,26527,2,26532,26534,26537,26540,26542,26545,1,26548,26553,7,26562,26565,9,26581,2,26587,26591,26593,26595,1,26598,2,26602,1,26605,1,26610,26613,7,26622,26625,3,26630,26637,26640,26642,26644,1,26648,4,26654,2,26658,6,26667,6,26676,2,26682,1,26687,26695,26699,26701,26703,26706,26710,5,-65,26716,3,26730,26732,7,26741,26744,8,26754,26756,26759,7,26768,2,26772,2,26776,9,26787,2,26793,3,26798,26801,1,26804,26806,2,-1,26809,6,26817,26819,5,26826,26828,26830,3,26835,1,26838,1,26841,26843,4,26849,1,26852,9,26863,26866,2,26870,2,26875,26877,3,26882,2,26886,4,26892,26895,26897,26899,11,26913,2,26917,7,26926,1,26929,2,26933,3,26938,2,26942,26944,1,26947,16,26965,1,26968,1,26971,1,26975,-65,26977,1,26980,1,26983,3,26988,1,26991,1,26994,4,27002,1,27005,2,27009,27011,27013,27018,2,27022,5,27030,1,27033,1,27037,9,27049,1,27052,27054,2,27058,1,27061,1,27064,2,27068,1,-1,27070,2,27074,7,27083,27085,27087,27089,2,27093,5,27100,2,27105,11,27118,3,27123,9,27134,27136,9,27147,11,27161,5,27168,27170,5,27177,27179,3,27184,27186,2,27190,6,27199,4,27205,1,27208,7,27217,6,27226,-65,27228,4,27234,2,27238,10,27250,6,27258,1,27261,2,27265,2,27269,8,27279,27282,4,27288,7,27297,5,-1,27303,1,27306,27309,114,27429,1,27432,6,-65,27439,2,27443,3,27448,27451,2,27455,3,27460,1,27464,27466,1,27469,11,27482,7,27496,1,27499,13,27514,27517,3,27525,27528,-1,27532,27534,3,27540,1,27543,2,27548,4,27554,7,27563,7,27574,27576,6,27584,27587,1,27590,4,27596,27598,27600,1,27608,27610,27612,4,27618,7,27628,2,27632,2,27636,27638,2,27642,2,27646,6,27656,4,27662,27666,27671,27676,2,27680,27683,27685,27691,2,27697,27699,27702,1,27705,3,27710,1,27715,2,27720,27723,4,27729,2,27734,27736,-65,27737,1,27746,1,27749,2,27755,4,27761,27763,27765,27767,1,27770,2,27775,1,27780,27783,27786,1,27789,1,27793,1,27797,3,27802,27804,2,27808,27810,27816,27820,27823,1,27828,3,27834,27840,3,27846,2,27851,27853,2,27857,1,27864,-1,27865,1,27868,1,27871,27876,27878,1,27881,27884,1,27890,27892,27897,27903,1,27906,1,27909,1,27912,2,27917,27919,2,27923,3,27928,27932,1,27935,5,27942,27944,1,27948,1,27951,1,27956,27958,2,27962,27967,1,27970,27972,27977,27980,27984,27989,3,27995,27997,27999,28001,1,28004,1,28007,1,28011,2,28016,3,28021,1,28025,2,28029,4,28035,1,28038,1,28042,1,28045,28047,1,28050,28054,4,28060,28066,28069,28076,1,28080,1,28083,1,28086,1,28089,5,28097,2,28104,2,-65,28109,3,28114,3,28119,28122,2,28127,28130,1,28133,28135,3,28141,28143,1,28146,28148,2,28152,28154,28157,7,28166,3,28171,28175,28178,1,28181,28184,1,28187,1,28190,1,28194,28198,2,28202,28204,28206,28208,1,28211,28213,-1,28214,1,28217,28219,7,28229,7,28239,3,28245,28247,28249,1,28252,2,28256,10,28268,1,28271,14,28288,2,28292,28295,1,28298,4,28305,6,28313,2,28317,1,28320,1,28323,1,28326,28328,1,28331,3,28336,28339,28341,28344,1,28348,28350,2,28355,3,28360,2,28364,2,28368,28370,28374,28376,1,28379,2,28387,28391,28394,5,-65,28400,3,28405,3,28410,7,28419,2,28423,1,28426,4,28432,2,28438,9,28449,2,28453,3,28460,28462,28464,28466,28468,1,28471,6,28479,3,-1,28483,2,28488,2,28492,28494,9,28505,2,28509,28511,2,28515,2,28519,5,28527,2,28531,28533,2,28537,28539,28541,6,28549,2,28554,1,28559,12,28573,3,28578,4,28584,10,28596,1,28599,1,28602,5,28609,28611,5,28618,6,28627,10,28639,28642,3,-65,28646,7,28656,32,28690,7,28700,6,28708,6,-1,28715,9,28726,2,28730,17,28749,1,28752,13,28767,11,28782,28785,3,28791,28793,2,28797,28801,3,28806,2,28811,2,28815,2,28819,28823,1,28826,1,28830,12,28848,28850,28852,2,28858,28862,1,28868,3,28873,28875,12,28890,-65,28892,2,28896,3,28901,28906,28910,28912,6,28920,28922,2,28926,10,28939,4,28945,1,28948,28951,28955,10,28967,7,28978,2,-1,28981,28983,13,28998,3,29003,29005,29007,12,29021,29023,4,29029,29033,4,29039,2,29044,3,29049,29051,1,29054,5,29061,4,29067,3,29072,3,29077,2,29082,4,29089,6,29097,2,29101,5,29108,29110,2,29114,8,29124,9,29135,4,-65,29142,9,29153,3,29158,29160,5,29167,9,29178,11,29191,19,-1,29211,1,29214,9,29225,29227,29229,2,29234,2,29242,29244,29246,29248,6,29257,2,29262,3,29267,2,29271,1,29274,29276,29278,29280,29283,2,29288,29290,3,29296,1,29299,1,29302,2,29307,2,29314,1,29317,4,29324,29326,29328,1,29331,11,29344,11,29358,29361,2,29365,29370,6,29381,2,29385,3,29391,29393,29395,3,29400,29402,1,-162,12288,2,183,713,711,168,12291,12293,8212,65374,8214,8230,8216,1,8220,1,12308,1,12296,7,12310,1,12304,1,177,215,247,8758,8743,1,8721,8719,8746,8745,8712,8759,8730,8869,8741,8736,8978,8857,8747,8750,8801,8780,8776,8765,8733,8800,8814,1,8804,1,8734,8757,8756,9794,9792,176,8242,1,8451,65284,164,65504,1,8240,167,8470,9734,9733,9675,9679,9678,9671,9670,9633,9632,9651,9650,8251,8594,8592,1,8595,12307,-162,8560,9,-6,9352,19,9332,19,9312,9,-2,12832,9,-2,8544,11,-164,65281,2,65509,65285,88,65507,-162,12353,82,-173,12449,85,-170,913,16,931,6,-8,945,16,963,6,-7,65077,1,65081,1,65087,1,65085,1,65089,3,-2,65083,1,65079,1,65073,-1,65075,1,-171,1040,5,1025,1046,25,-15,1072,5,1105,1078,25,-78,714,1,729,8211,8213,8229,8245,8453,8457,8598,3,8725,8735,8739,8786,8806,1,8895,9552,35,9601,6,-1,9608,7,9619,2,9660,1,9698,3,9737,8853,12306,12317,1,-11,257,225,462,224,275,233,283,232,299,237,464,236,333,243,466,242,363,250,468,249,470,472,474,476,252,234,593,-1,324,328,-1,609,-4,12549,36,-86,12321,8,12963,13198,1,13212,2,13217,13252,13262,13265,1,13269,65072,65506,65508,-1,8481,12849,-1,8208,-3,12540,12443,1,12541,1,12294,12445,1,65097,9,65108,3,65113,8,-1,65122,4,65128,3,-13,12295,-13,9472,75,-80,29404,1,29407,29410,5,29418,1,29429,1,29433,29437,3,29442,29444,5,29451,2,29455,3,29460,29464,2,29471,1,29475,1,29478,2,29485,29487,1,29490,1,29493,1,29498,3,29504,8,-1,29513,3,29518,1,29521,29523,3,29528,7,29537,10,29550,29552,1,-159,29554,11,29567,4,29573,1,29576,29578,29580,1,29583,1,29586,3,29591,3,29596,2,29600,1,29603,5,29610,29612,1,29617,29620,2,29624,1,29628,3,29633,29635,4,-1,29643,1,29646,29650,6,29658,3,29663,29665,3,29670,29672,29674,2,29678,3,29683,4,-159,29688,10,29700,29703,1,29707,3,29713,8,29724,5,29731,1,29735,29737,29739,29741,29743,29745,1,29751,4,29757,3,29762,11,-1,29774,6,29782,29784,29789,29792,12,29806,1,29809,4,29816,2,-159,29819,2,29823,29826,29828,2,29832,2,29836,1,29839,29841,10,29853,29855,7,29866,15,29883,12,-1,29896,9,29907,8,29917,29919,29921,29925,29927,6,29936,2,-159,29939,29941,29944,6,29952,3,29957,7,29966,29968,29970,29972,3,29979,29981,1,29984,4,29990,1,29994,29998,30004,30006,30009,30012,1,30015,30017,3,30022,1,30025,1,30029,30032,3,30037,3,-1,30045,7,30055,2,30059,6,30067,30069,2,30074,4,30080,2,30084,1,30087,-159,30088,2,30092,2,30096,30099,30101,30104,30107,1,30110,30114,30118,4,30125,30134,1,30138,1,30143,2,30150,30155,1,30158,3,30163,30167,30169,1,30172,1,30175,2,30181,30185,30188,3,30194,1,30197,3,30202,1,30205,1,30210,30212,30214,1,-1,30216,1,30219,30221,2,30225,3,30230,30234,30236,2,30241,30243,30247,1,30252,30254,1,30257,1,30262,1,30265,2,30269,30273,1,30276,-159,30277,6,30286,5,30293,30295,4,30301,30303,3,30308,6,30316,2,30320,7,30329,1,30332,30335,2,30339,30341,30345,1,30348,1,30351,1,30354,30356,1,30359,1,30362,1,-1,30364,7,30373,8,30383,1,30387,30389,9,30400,1,30403,21834,38463,22467,25384,21710,21769,21696,30353,30284,34108,30702,33406,30861,29233,38552,38797,27688,23433,20474,25353,26263,23736,33018,26696,32942,26114,30414,20985,25942,29100,32753,34948,20658,22885,25034,28595,33453,25420,25170,21485,21543,31494,20843,30116,24052,25300,36299,38774,25226,32793,22365,38712,32610,29240,30333,26575,30334,25670,20336,36133,25308,31255,26001,29677,25644,25203,33324,39041,26495,29256,25198,25292,20276,29923,21322,21150,32458,37030,24110,26758,27036,33152,32465,26834,30917,34444,38225,20621,35876,33502,32990,21253,35090,21093,-65,30404,30407,30409,30411,1,30419,30421,30425,1,30428,2,30432,4,30438,7,30448,30451,30453,2,30458,1,30461,30463,1,30466,1,30469,1,30474,30476,30478,10,30491,3,30497,30499,2,30503,30506,1,-1,30508,30510,30512,4,30521,30523,30525,2,30530,30532,2,30536,7,30546,7,30556,34180,38649,20445,22561,39281,23453,25265,25253,26292,35961,40077,29190,26479,30865,24754,21329,21271,36744,32972,36125,38049,20493,29384,22791,24811,28953,34987,22868,33519,26412,31528,23849,32503,29997,27893,36454,36856,36924,40763,27604,37145,31508,24444,30887,34006,34109,27605,27609,27606,24065,24199,30201,38381,25949,24330,24517,36767,22721,33218,36991,38491,38829,36793,32534,36140,25153,20415,21464,21342,36776,1,36779,36941,26631,24426,33176,34920,40150,24971,21035,30250,24428,25996,28626,28392,23486,25672,20853,20912,26564,19993,31177,39292,28851,-65,30557,3,30564,30567,30569,1,30573,11,30586,2,30593,2,30598,5,30607,1,30611,11,30625,30627,1,30630,30632,30635,30637,2,30641,1,30644,30646,4,-1,30652,30654,30656,12,30670,8,30680,2,30685,4,30692,30149,24182,29627,33760,25773,25320,38069,27874,21338,21187,25615,38082,31636,20271,24091,33334,33046,33162,28196,27850,39539,25429,21340,21754,34917,22496,19981,24067,27493,31807,37096,24598,25830,29468,35009,26448,25165,36130,30572,36393,37319,24425,33756,34081,39184,21442,34453,27531,24813,24808,28799,33485,33329,20179,27815,34255,25805,31961,27133,26361,33609,21397,31574,20391,20876,27979,23618,36461,25554,21449,33580,33590,26597,30900,25661,23519,23700,24046,35815,25286,26612,35962,25600,25530,34633,39307,35863,32544,38130,20135,38416,39076,26124,29462,-65,30694,30696,30698,30703,3,30708,1,30711,30713,3,30723,5,30730,1,30734,2,30739,30741,30745,30747,30750,30752,2,30756,30760,30762,1,30766,1,30769,2,30773,1,30781,30783,30785,3,30790,30792,3,30797,30799,30801,30803,1,30808,2,-1,30811,1,30814,11,30831,7,30840,3,30845,6,22330,23581,24120,38271,20607,32928,21378,25950,30021,21809,20513,36229,25220,38046,26397,22066,28526,24034,21557,28818,36710,25199,25764,25507,24443,28552,37108,33251,36784,23576,26216,24561,27785,38472,36225,34924,25745,31216,22478,27225,25104,21576,20056,31243,24809,28548,35802,25215,36894,39563,31204,21507,30196,25345,21273,27744,36831,24347,39536,32827,40831,20360,23610,36196,32709,26021,28861,20805,20914,34411,23815,23456,25277,37228,30068,36364,31264,24833,31609,20167,32504,30597,19985,33261,21021,20986,27249,21416,36487,38148,38607,28353,38500,26970,-65,30852,2,30856,30858,1,30863,1,30866,30868,2,30873,30877,1,30880,30882,30884,30886,30888,7,30901,3,30906,3,30911,1,30914,2,30918,2,30924,3,30929,2,30934,2,30938,9,-1,30948,3,30953,2,30957,4,30963,30965,1,30968,1,30971,5,30978,2,30982,6,30784,20648,30679,25616,35302,22788,25571,24029,31359,26941,20256,33337,21912,20018,30126,31383,24162,24202,38383,21019,21561,28810,25462,38180,22402,26149,26943,37255,21767,28147,32431,34850,25139,32496,30133,33576,30913,38604,36766,24904,29943,35789,27492,21050,36176,27425,32874,33905,22257,21254,20174,19995,20945,31895,37259,31751,20419,36479,31713,31388,25703,23828,20652,33030,30209,31929,28140,32736,26449,23384,23544,30923,25774,25619,25514,25387,38169,25645,36798,31572,30249,25171,22823,21574,27513,20643,25140,24102,27526,20195,36151,34955,24453,36910,-65,30989,5,30996,9,31007,4,31013,14,31029,4,31037,31039,31042,3,31047,31050,8,31060,1,31064,1,31073,31075,-1,31076,31078,31081,3,31086,31088,6,31097,31099,4,31106,1,31110,3,31115,3,31120,2,24608,32829,25285,20025,21333,37112,25528,32966,26086,27694,20294,24814,28129,35806,24377,34507,24403,25377,20826,33633,26723,20992,25443,36424,20498,23707,31095,23548,21040,31291,24764,36947,30423,24503,24471,30340,36460,28783,30331,31561,30634,20979,37011,22564,20302,28404,36842,25932,31515,29380,28068,32735,23265,25269,24213,22320,33922,31532,24093,24351,36882,32532,39072,25474,28359,30872,28857,20856,38747,22443,30005,20291,30008,24215,24806,22880,28096,27583,30857,21500,38613,20939,20993,25481,21514,38035,35843,36300,29241,30879,34678,36845,35853,21472,-65,31123,6,31131,11,31144,10,31156,4,31164,31167,31170,31172,1,31175,1,31178,31180,31182,2,31187,1,31190,1,31193,5,31200,2,31205,31208,31210,-1,31212,31214,31217,6,31225,1,31228,31230,1,31233,31236,1,31239,3,31244,31247,4,31253,1,31256,1,31259,1,19969,30447,21486,38025,39030,40718,38189,23450,35746,20002,19996,20908,33891,25026,21160,26635,20375,24683,20923,27934,20828,25238,26007,38497,35910,36887,30168,37117,30563,27602,29322,29420,35835,22581,30585,36172,26460,38208,32922,24230,28193,22930,31471,30701,38203,27573,26029,32526,22534,20817,38431,23545,22697,21544,36466,25958,39039,22244,38045,30462,36929,25479,21702,22810,22842,22427,36530,26421,36346,33333,21057,24816,22549,34558,23784,40517,20420,39069,35769,23077,24694,21380,25212,36943,37122,39295,24681,32780,20799,32819,23572,39285,27953,20108,-65,31261,31263,31265,1,31268,14,31284,2,31288,31290,31294,31296,5,31303,9,31314,4,31320,16,-1,31337,6,31345,2,31349,31355,3,31362,31365,31367,31369,3,31374,2,31379,1,31385,2,31390,31393,1,36144,21457,32602,31567,20240,20047,38400,27861,29648,34281,24070,30058,32763,27146,30718,38034,32321,20961,28902,21453,36820,33539,36137,29359,39277,27867,22346,33459,26041,32938,25151,38450,22952,20223,35775,32442,25918,33778,38750,21857,39134,32933,21290,35837,21536,32954,24223,27832,36153,33452,37210,21545,27675,20998,32439,22367,28954,27774,31881,22859,20221,24575,24868,31914,20016,23553,26539,34562,23792,38155,39118,30127,28925,36898,20911,32541,35773,22857,20964,20315,21542,22827,25975,32932,23413,25206,25282,36752,24133,27679,31526,20239,20440,26381,-65,31395,1,31399,31401,2,31406,4,31412,10,31424,10,31436,9,31447,1,31450,3,31457,1,31460,31463,5,31470,31472,3,-1,31476,4,31483,1,31486,31488,2,31493,31495,31497,31500,2,31504,31506,1,31510,2,31514,31516,1,31519,31521,2,31527,31529,31533,28014,28074,31119,34993,24343,29995,25242,36741,20463,37340,26023,33071,33105,24220,33104,36212,21103,35206,36171,22797,20613,20184,38428,29238,33145,36127,23500,35747,38468,22919,32538,21648,22134,22030,35813,25913,27010,38041,30422,28297,24178,29976,26438,26577,31487,32925,36214,24863,31174,25954,36195,20872,21018,38050,32568,32923,32434,23703,28207,26464,31705,30347,39640,33167,32660,31957,25630,38224,31295,21578,21733,27468,25601,25096,40509,33011,30105,21106,38761,33883,26684,34532,38401,38548,38124,20010,21508,32473,26681,36319,32789,26356,24218,32697,-65,31535,1,31538,31540,3,31545,31547,31549,31551,5,31558,31560,31562,31565,1,31571,31573,31575,31577,31580,31582,1,31585,31587,10,31599,1,31603,1,31606,31608,31610,31612,1,31615,31617,3,31622,6,31630,1,-1,31633,2,31638,31640,3,31646,2,31651,2,31662,2,31666,1,31669,2,31673,7,31682,2,22466,32831,26775,24037,25915,21151,24685,40858,20379,36524,20844,23467,24339,24041,27742,25329,36129,20849,38057,21246,27807,33503,29399,22434,26500,36141,22815,36764,33735,21653,31629,20272,27837,23396,22993,40723,21476,34506,39592,35895,32929,25925,39038,22266,38599,21038,29916,21072,23521,25346,35074,20054,25296,24618,26874,20851,23448,20896,35266,31649,39302,32592,24815,28748,36143,20809,24191,36891,29808,35268,22317,30789,24402,40863,38394,36712,39740,35809,30328,26690,26588,36330,36149,21053,36746,28378,26829,38149,37101,22269,26524,35065,36807,21704,-65,31685,31688,3,31693,3,31698,31700,4,31707,1,31710,2,31714,2,31719,2,31723,2,31727,1,31730,4,31736,3,31741,31743,7,31752,2,31757,1,31760,5,31767,2,-1,31770,4,31776,5,31784,1,31787,12,31801,5,31810,39608,23401,28023,27686,20133,23475,39559,37219,25000,37039,38889,21547,28085,23506,20989,21898,32597,32752,25788,25421,26097,25022,24717,28938,27735,27721,22831,26477,33322,22741,22158,35946,27627,37085,22909,32791,21495,28009,21621,21917,33655,33743,26680,31166,21644,20309,21512,30418,35977,38402,27827,28088,36203,35088,40548,36154,22079,40657,30165,24456,29408,24680,21756,20136,27178,34913,24658,36720,21700,28888,34425,40511,27946,23439,24344,32418,21897,20399,29492,21564,21402,20505,21518,21628,20046,24573,29786,22774,33899,32993,34676,29392,31946,28246,-65,31811,9,31822,36,31861,5,31870,9,-1,31880,31882,6,31891,1,31894,31897,2,31904,1,31907,31910,3,31915,2,31919,1,31924,4,31930,1,24359,34382,21804,25252,20114,27818,25143,33457,21719,21326,29502,28369,30011,21010,21270,35805,27088,24458,24576,28142,22351,27426,29615,26707,36824,32531,25442,24739,21796,30186,35938,28949,28067,23462,24187,33618,24908,40644,30970,34647,31783,30343,20976,24822,29004,26179,24140,24653,35854,28784,25381,36745,24509,24674,34516,22238,27585,24724,24935,21321,24800,26214,36159,31229,20250,28905,27719,35763,35826,32472,33636,26127,23130,39746,27985,28151,35905,27963,20249,28779,33719,25110,24785,38669,36135,31096,20987,22334,22522,26426,30072,31293,31215,31637,-65,31935,1,31938,2,31942,31945,31947,31950,6,31960,31962,1,31965,1,31969,6,31977,5,31984,7,31993,1,31996,13,32011,5,-1,32017,14,32033,32035,3,32040,2,32044,2,32048,6,32908,39269,36857,28608,35749,40481,23020,32489,32521,21513,26497,26840,36753,31821,38598,21450,24613,30142,27762,21363,23241,32423,25380,20960,33034,24049,34015,25216,20864,23395,20238,31085,21058,24760,27982,23492,23490,35745,35760,26082,24524,38469,22931,32487,32426,22025,26551,22841,20339,23478,21152,33626,39050,36158,30002,38078,20551,31292,20215,26550,39550,23233,27516,30417,22362,23574,31546,38388,29006,20860,32937,33392,22904,32516,33575,26816,26604,30897,30839,25315,25441,31616,20461,21098,20943,33616,27099,37492,36341,36145,35265,38190,31661,20214,-65,32055,54,32111,7,-1,32120,32,20581,33328,21073,39279,28176,28293,28071,24314,20725,23004,23558,27974,27743,30086,33931,26728,22870,35762,21280,37233,38477,34121,26898,30977,28966,33014,20132,37066,27975,39556,23047,22204,25605,38128,30699,20389,33050,29409,35282,39290,32564,32478,21119,25945,37237,36735,36739,21483,31382,25581,25509,30342,31224,34903,38454,25130,21163,33410,26708,26480,25463,30571,31469,27905,32467,35299,22992,25106,34249,33445,30028,20511,20171,30117,35819,23626,24062,31563,26020,37329,20170,27941,35167,32039,38182,20165,35880,36827,38771,26187,31105,36817,28908,28024,-65,32153,12,32167,6,32175,42,-1,32218,32,23613,21170,33606,20834,33550,30555,26230,40120,20140,24778,31934,31923,32463,20117,35686,26223,39048,38745,22659,25964,38236,24452,30153,38742,31455,31454,20928,28847,31384,25578,31350,32416,29590,38893,20037,28792,20061,37202,21417,25937,26087,33276,33285,21646,23601,30106,38816,25304,29401,30141,23621,39545,33738,23616,21632,30697,20030,27822,32858,25298,25454,24040,20855,36317,36382,38191,20465,21477,24807,28844,21095,25424,40515,23071,20518,30519,21367,32482,25733,25899,25225,25496,20500,29237,35273,20915,35776,32477,22343,33740,38055,20891,21531,23803,-65,32251,62,-1,32314,32316,4,32322,4,32328,21,20426,31459,27994,37089,39567,21888,21654,21345,21679,24320,25577,26999,20975,24936,21002,22570,21208,22350,30733,30475,24247,24951,31968,25179,25239,20130,28821,32771,25335,28900,38752,22391,33499,26607,26869,30933,39063,31185,22771,21683,21487,28212,20811,21051,23458,35838,32943,21827,22438,24691,22353,21549,31354,24656,23380,25511,25248,21475,25187,23495,26543,21741,31391,33510,37239,24211,35044,22840,22446,25358,36328,33007,22359,31607,20393,24555,23485,27454,21281,31568,29378,26694,30719,30518,26103,20917,20111,30420,23743,31397,33909,22862,39745,20608,-65,32350,35,32387,23,32412,2,-1,32430,32436,32443,1,32470,32484,32492,32505,32522,32528,32542,32567,32569,32571,6,32579,32582,9,32594,1,39304,24871,28291,22372,26118,25414,22256,25324,25193,24275,38420,22403,25289,21895,34593,33098,36771,21862,33713,26469,36182,34013,23146,26639,25318,31726,38417,20848,28572,35888,25597,35272,25042,32518,28866,28389,29701,27028,29436,24266,37070,26391,28010,25438,21171,29282,32769,20332,23013,37226,28889,28061,21202,20048,38647,38253,34174,30922,32047,20769,22418,25794,32907,31867,27882,26865,26974,20919,21400,26792,29313,40654,31729,29432,31163,28435,29702,26446,37324,40100,31036,33673,33620,21519,26647,20029,21385,21169,30782,21382,21033,20616,20363,20432,-65,32598,32601,32603,3,32608,32611,4,32619,2,32623,1,32627,32629,3,32634,3,32639,1,32642,7,32651,32653,32655,4,32661,4,32667,1,32672,32674,1,32677,1,32680,6,32689,-1,32691,4,32698,1,32702,32704,32706,2,32710,3,32715,32717,32719,4,32726,1,32729,5,32738,1,30178,31435,31890,27813,38582,21147,29827,21737,20457,32852,33714,36830,38256,24265,24604,28063,24088,25947,33080,38142,24651,28860,32451,31918,20937,26753,31921,33391,20004,36742,37327,26238,20142,35845,25769,32842,20698,30103,29134,23525,36797,28518,20102,25730,38243,24278,26009,21015,35010,28872,21155,29454,29747,26519,30967,38678,20020,37051,40158,28107,20955,36161,21533,25294,29618,33777,38646,40836,38083,20278,32666,20940,28789,38517,23725,39046,21478,20196,28316,29705,27060,30827,39311,30041,21016,30244,27969,26611,20845,40857,32843,21657,31548,31423,-65,32740,32743,1,32746,3,32751,32754,32756,6,32765,2,32770,32775,3,32782,1,32785,32787,32794,1,32797,2,32801,32803,1,32811,5,32818,32820,32825,1,32828,32830,32832,1,32836,1,32839,2,32846,3,32851,32853,2,-1,32857,32859,13,32875,5,32882,11,38534,22404,25314,38471,27004,23044,25602,31699,28431,38475,33446,21346,39045,24208,28809,25523,21348,34383,40065,40595,30860,38706,36335,36162,40575,28510,31108,24405,38470,25134,39540,21525,38109,20387,26053,23653,23649,32533,34385,27695,24459,29575,28388,32511,23782,25371,23402,28390,21365,20081,25504,30053,25249,36718,20262,20177,27814,32438,35770,33821,34746,32599,36923,38179,31657,39585,35064,33853,27931,39558,32476,22920,40635,29595,30721,34434,39532,39554,22043,21527,22475,20080,40614,21334,36808,33033,30610,39314,34542,28385,34067,26364,24930,28459,-65,32894,32897,1,32901,32904,32906,32909,5,32916,1,32919,32921,32926,32931,32934,2,32940,32944,32947,32949,1,32952,1,32955,32965,32967,4,32975,6,32984,32991,1,32994,1,32998,33006,33013,33015,33017,33019,33022,3,33027,2,33031,1,33035,-1,33036,33045,33047,33049,33051,2,33055,12,33069,1,33072,33075,2,33079,33081,4,33087,35881,33426,33579,30450,27667,24537,33725,29483,33541,38170,27611,30683,38086,21359,33538,20882,24125,35980,36152,20040,29611,26522,26757,37238,38665,29028,27809,30473,23186,38209,27599,32654,26151,23504,22969,23194,38376,38391,20204,33804,33945,27308,30431,38192,29467,26790,23391,30511,37274,38753,31964,36855,35868,24357,31859,31192,35269,27852,34588,23494,24130,26825,30496,32501,20885,20813,21193,23081,32517,38754,33495,25551,30596,34256,31186,28218,24217,22937,34065,28781,27665,25279,30399,25935,24751,38397,26126,34719,40483,38125,21517,21629,35884,25720,-65,33088,5,33095,33097,33101,2,33106,33110,2,33115,4,33121,3,33126,33128,33130,2,33135,33138,1,33141,3,33153,33155,4,33161,33163,3,33168,33170,5,33177,1,33182,4,33188,1,-1,33191,33193,33195,7,33204,5,33212,3,33220,1,33223,2,33227,33229,6,25721,34321,27169,33180,30952,25705,39764,25273,26411,33707,22696,40664,27819,28448,23518,38476,35851,29279,26576,25287,29281,20137,22982,27597,22675,26286,24149,21215,24917,26408,30446,30566,29287,31302,25343,21738,21584,38048,37027,23068,32435,27670,20035,22902,32784,22856,21335,30007,38590,22218,25376,33041,24700,38393,28118,21602,39297,20869,23273,33021,22958,38675,20522,27877,23612,25311,20320,21311,33147,36870,28346,34091,25288,24180,30910,25781,25467,24565,23064,37247,40479,23615,25423,32834,23421,21870,38218,38221,28037,24744,26592,29406,20957,23425,-65,33236,14,33252,2,33256,1,33259,33262,4,33269,5,33277,33279,33283,33287,4,33294,1,33297,33299,33301,5,33309,33312,33316,3,33321,33326,33330,33338,33340,1,33343,-1,33344,3,33349,1,33352,33354,33356,2,33360,7,33369,33371,3,33376,7,33385,25319,27870,29275,25197,38062,32445,33043,27987,20892,24324,22900,21162,24594,22899,26262,34384,30111,25386,25062,31983,35834,21734,27431,40485,27572,34261,21589,20598,27812,21866,36276,29228,24085,24597,29750,25293,25490,29260,24472,28227,27966,25856,28504,30424,30928,30460,30036,21028,21467,20051,24222,26049,32810,32982,25243,21638,21032,28846,34957,36305,27873,21624,32986,22521,35060,36180,38506,37197,20329,27803,21943,30406,30768,25256,28921,28558,24429,34028,26842,30844,31735,33192,26379,40527,25447,30896,22383,30738,38713,25209,25259,21128,29749,27607,-65,33386,3,33393,33397,3,33403,1,33408,1,33411,33413,2,33417,33420,33424,33427,3,33434,1,33438,33440,33442,1,33447,33458,33461,1,33466,2,33471,1,33474,1,33477,1,33481,33488,33494,33497,1,33501,33506,33511,3,33516,2,33520,33522,1,33525,1,33528,-1,33530,33532,4,33546,1,33549,33552,33554,1,33558,33560,1,33565,9,33577,1,33582,33584,33586,33591,33595,33597,21860,33086,30130,30382,21305,30174,20731,23617,35692,31687,20559,29255,39575,39128,28418,29922,31080,25735,30629,25340,39057,36139,21697,32856,20050,22378,33529,33805,24179,20973,29942,35780,23631,22369,27900,39047,23110,30772,39748,36843,31893,21078,25169,38138,20166,33670,33889,33769,33970,22484,26420,22275,26222,28006,35889,26333,28689,26399,27450,26646,25114,22971,19971,20932,28422,26578,27791,20854,26827,22855,27495,30054,23822,33040,40784,26071,31048,31041,39569,36215,23682,20062,20225,21551,22865,30732,22120,27668,36804,24323,27773,27875,35755,25488,-65,33598,1,33601,1,33604,1,33608,33610,4,33619,33621,4,33629,33634,33648,6,33657,1,33662,6,33671,1,33674,3,33679,2,33684,3,33689,1,33693,33695,33697,6,33708,2,-1,33711,33717,33723,33726,1,33730,2,33734,33736,1,33739,33741,1,33744,3,33749,33751,33753,2,33758,33762,2,33766,2,33771,2,24688,27965,29301,25190,38030,38085,21315,36801,31614,20191,35878,20094,40660,38065,38067,21069,28508,36963,27973,35892,22545,23884,27424,27465,26538,21595,33108,32652,22681,34103,24378,25250,27207,38201,25970,24708,26725,30631,20052,20392,24039,38808,25772,32728,23789,20431,31373,20999,33540,19988,24623,31363,38054,20405,20146,31206,29748,21220,33465,25810,31165,23517,27777,38738,36731,27682,20542,21375,28165,25806,26228,27696,24773,39031,35831,24198,29756,31351,31179,19992,37041,29699,27714,22234,37195,27845,36235,21306,34502,26354,36527,23624,39537,28192,-65,33774,1,33779,4,33786,2,33790,2,33794,33797,33799,3,33808,33810,5,33817,2,33822,5,33833,7,33842,5,33849,2,33854,7,33863,2,-1,33866,6,33874,4,33880,33885,3,33890,33892,4,33898,33902,2,33906,33908,33911,33913,33915,1,21462,23094,40843,36259,21435,22280,39079,26435,37275,27849,20840,30154,25331,29356,21048,21149,32570,28820,30264,21364,40522,27063,30830,38592,35033,32676,28982,29123,20873,26579,29924,22756,25880,22199,35753,39286,25200,32469,24825,28909,22764,20161,20154,24525,38887,20219,35748,20995,22922,32427,25172,20173,26085,25102,33592,33993,33635,34701,29076,28342,23481,32466,20887,25545,26580,32905,33593,34837,20754,23418,22914,36785,20083,27741,20837,35109,36719,38446,34122,29790,38160,38384,28070,33509,24369,25746,27922,33832,33134,40131,22622,36187,19977,21441,-65,33917,4,33923,3,33930,33933,33935,7,33944,33946,1,33949,3,33954,12,33968,1,33971,33973,2,33979,1,33982,33984,33986,1,33989,3,33995,1,33998,1,34002,34004,1,34007,-1,34008,4,34014,34017,1,34020,34023,4,34029,2,34033,10,34045,1,34048,2,20254,25955,26705,21971,20007,25620,39578,25195,23234,29791,33394,28073,26862,20711,33678,30722,26432,21049,27801,32433,20667,21861,29022,31579,26194,29642,33515,26441,23665,21024,29053,34923,38378,38485,25797,36193,33203,21892,27733,25159,32558,22674,20260,21830,36175,26188,19978,23578,35059,26786,25422,31245,28903,33421,21242,38902,23569,21736,37045,32461,22882,36170,34503,33292,1,36198,25668,23556,24913,28041,31038,35774,30775,30003,21627,20280,36523,28145,23072,32453,31070,27784,23457,23158,29978,32958,24910,28183,22768,29983,29989,29298,21319,32499,-65,34051,8,34061,3,34066,34068,2,34072,1,34075,3,34080,34082,8,34093,9,34110,4,34116,3,34123,10,-1,34135,1,34138,3,34143,4,34149,2,34153,8,34163,34165,3,34172,1,34175,2,30465,30427,21097,32988,22307,24072,22833,29422,26045,28287,35799,23608,34417,21313,30707,25342,26102,20160,39135,34432,23454,35782,21490,30690,20351,23630,39542,22987,24335,31034,22763,19990,26623,20107,25325,35475,36893,21183,26159,21980,22124,36866,20181,20365,37322,39280,27663,24066,24643,23460,35270,35797,25910,25163,39318,23432,23551,25480,21806,21463,30246,20861,34092,26530,26803,27530,25234,36755,21460,33298,28113,30095,20070,36174,23408,29087,34223,26257,26329,32626,34560,40653,40736,23646,26415,36848,26641,26463,25101,31446,22661,24246,25968,28465,-65,34178,1,34182,34184,6,34192,10,34205,6,34213,2,34217,34219,2,34225,5,34232,34234,6,34242,6,34250,4,34257,1,-1,34260,34262,5,34269,6,34277,3,34282,14,24661,21047,32781,25684,34928,29993,24069,26643,25332,38684,21452,29245,35841,27700,30561,31246,21550,30636,39034,33308,35828,30805,26388,28865,26031,25749,22070,24605,31169,21496,19997,27515,32902,23546,21987,22235,20282,20284,39282,24051,26494,32824,24578,39042,36865,23435,35772,35829,25628,33368,25822,22013,33487,37221,20439,32032,36895,31903,20723,22609,28335,23487,35785,32899,37240,33948,31639,34429,38539,38543,32485,39635,30862,23681,31319,36930,38567,31071,23385,25439,31499,34001,26797,21766,32553,29712,32034,38145,25152,22604,20182,23427,22905,22612,-65,34297,1,34300,2,34304,4,34310,10,34322,3,34327,15,34344,34346,13,34361,2,34365,3,-1,34369,11,34386,1,34389,4,34395,2,34399,2,34403,7,29549,25374,36427,36367,32974,33492,25260,21488,27888,37214,22826,24577,27760,22349,25674,36138,30251,28393,22363,27264,30192,28525,35885,35848,22374,27631,34962,30899,25506,21497,28845,27748,22616,25642,22530,26848,33179,21776,31958,20504,36538,28108,36255,28907,25487,28059,28372,32486,33796,26691,36867,28120,38518,35752,22871,29305,34276,33150,30140,35466,26799,21076,36386,38161,25552,39064,36420,21884,20307,26367,22159,24789,28053,21059,23625,22825,28155,22635,30000,29980,24684,33300,33094,25361,26465,36834,30522,36339,36148,38081,24086,21381,21548,28867,-65,34413,34415,1,34418,6,34435,6,34446,4,34452,34454,5,34462,4,34469,1,34475,34477,1,34482,1,34487,2,34491,4,34497,2,34501,34504,34508,1,34514,1,34517,2,34522,34524,-1,34525,34528,3,34533,3,34538,2,34543,34549,2,34554,3,34559,34561,34564,2,34571,1,34574,3,34580,34582,27712,24311,20572,20141,24237,25402,33351,36890,26704,37230,30643,21516,38108,24420,31461,26742,25413,31570,32479,30171,20599,25237,22836,36879,20984,31171,31361,22270,24466,36884,28034,23648,22303,21520,20820,28237,22242,25512,39059,33151,34581,35114,36864,21534,23663,33216,25302,25176,33073,40501,38464,39534,39548,26925,22949,25299,21822,25366,21703,34521,27964,23043,29926,34972,27498,22806,35916,24367,28286,29609,39037,20024,28919,23436,30871,25405,26202,30358,24779,23451,23113,19975,33109,27754,29579,20129,26505,32593,24448,26106,26395,24536,22916,23041,-65,34585,34587,34589,34591,1,34596,34598,2,34602,3,34607,1,34610,1,34613,1,34616,2,34620,1,34624,6,34634,1,34637,34639,3,34644,2,34648,34650,5,34657,1,34662,7,34671,34673,2,34677,-1,34679,3,34687,2,34692,34694,1,34697,1,34700,34702,4,34708,2,34712,6,34720,4,24013,24494,21361,38886,36829,26693,22260,21807,24799,20026,28493,32500,33479,33806,22996,20255,20266,23614,32428,26410,34074,21619,30031,32963,21890,39759,20301,28205,35859,23561,24944,21355,30239,28201,34442,25991,38395,32441,21563,31283,32010,38382,21985,32705,29934,25373,34583,28065,31389,25105,26017,21351,25569,27779,24043,21596,38056,20044,27745,35820,23627,26080,33436,26791,21566,21556,27595,27494,20116,25410,21320,33310,20237,20398,22366,25098,38654,26212,29289,21247,21153,24735,35823,26132,29081,26512,35199,30802,30717,26224,22075,21560,38177,29306,-65,34725,2,34729,1,34734,34736,2,34740,34742,3,34747,1,34750,1,34753,4,34759,2,34764,4,34772,6,34780,3,34785,3,34790,3,34795,2,34799,9,-1,34810,3,34815,3,34820,5,34827,7,34836,34839,3,34844,4,34851,31232,24687,24076,24713,33181,22805,24796,29060,28911,28330,27728,29312,27268,34989,24109,20064,23219,21916,38115,27927,31995,38553,25103,32454,30606,34430,21283,38686,36758,26247,23777,20384,29421,19979,21414,22799,21523,25472,38184,20808,20185,40092,32420,21688,36132,34900,33335,38386,28046,24358,23244,26174,38505,29616,29486,21439,33146,39301,32673,23466,38519,38480,32447,30456,21410,38262,39321,31665,35140,28248,20065,32724,31077,35814,24819,21709,20139,39033,24055,27233,20687,21521,35937,33831,30813,38660,21066,21742,22179,38144,28040,23477,28102,26195,-65,34852,13,34867,5,34874,1,34877,2,34881,2,34886,5,34894,5,34901,1,34904,34906,6,34918,1,34922,34925,34927,34929,34931,3,34936,2,-1,34939,1,34944,34947,34950,1,34953,1,34956,34958,3,34963,2,34967,4,34973,4,34979,34981,5,23567,23389,26657,32918,21880,31505,25928,26964,20123,27463,34638,38795,21327,25375,25658,37034,26012,32961,35856,20889,26800,21368,34809,25032,27844,27899,35874,23633,34218,33455,38156,27427,36763,26032,24571,24515,20449,34885,26143,33125,29481,24826,20852,21009,22411,24418,37026,34892,37266,24184,26447,24615,22995,20804,20982,33016,21256,27769,38596,29066,20241,20462,32670,26429,21957,38152,31168,34966,32483,22687,25100,38656,34394,22040,39035,24464,35768,33988,37207,21465,26093,24207,30044,24676,32110,23167,32490,32493,36713,21927,23459,24748,26059,29572,-65,34988,34990,2,34994,4,35000,3,35005,3,35011,1,35015,1,35018,3,35023,2,35027,35030,1,35034,4,35040,1,35046,1,35049,6,35058,35061,2,35066,1,35069,35071,2,35075,5,-1,35081,35083,4,35089,35092,4,35100,4,35106,2,35110,3,35116,3,35121,2,35125,35127,36873,30307,30505,32474,38772,34203,23398,31348,38634,34880,21195,29071,24490,26092,35810,23547,39535,24033,27529,27739,35757,35759,36874,36805,21387,25276,40486,40493,21568,20011,33469,29273,34460,23830,34905,28079,38597,21713,20122,35766,28937,21693,38409,28895,28153,30416,20005,30740,34578,23721,24310,35328,39068,38414,28814,27839,22852,25513,30524,34893,28436,33395,22576,29141,21388,30746,38593,21761,24422,28976,23476,35866,39564,27523,22830,40495,31207,26472,25196,20335,30113,32650,27915,38451,27687,20208,30162,20859,26679,28478,36992,33136,22934,29814,-65,35128,8,35138,1,35141,24,35168,5,35175,19,35196,-1,35197,1,35200,35202,35204,1,35207,26,25671,23591,36965,31377,35875,23002,21676,33280,33647,35201,32768,26928,22094,32822,29239,37326,20918,20063,39029,25494,19994,21494,26355,33099,22812,28082,19968,22777,21307,25558,38129,20381,20234,34915,39056,22839,36951,31227,20202,33008,30097,27778,23452,23016,24413,26885,34433,20506,24050,20057,30691,20197,33402,25233,26131,37009,23673,20159,24441,33222,36920,32900,30123,20134,35028,24847,27589,24518,20041,30410,28322,35811,35758,35850,35793,24322,32764,32716,32462,33589,33643,22240,27575,38899,38452,23035,21535,38134,28139,23493,39278,23609,24341,38544,-65,35234,30,35267,35277,35283,2,35287,2,35291,35293,35295,3,35300,35303,3,35308,2,35312,2,35316,6,-1,35323,4,35329,5,35336,21,21360,33521,27185,23156,40560,24212,32552,33721,33828,1,33639,34631,36814,36194,30408,24433,39062,30828,26144,21727,25317,20323,33219,30152,24248,38605,36362,34553,21647,27891,28044,27704,24703,21191,29992,24189,20248,24736,24551,23588,30001,37038,38080,29369,27833,28216,37193,26377,21451,21491,20305,37321,35825,21448,24188,36802,28132,20110,30402,27014,34398,24858,33286,20313,20446,36926,40060,24841,28189,28180,38533,20104,23089,38632,19982,23679,31161,23431,35821,32701,29577,22495,33419,37057,21505,36935,21947,23786,24481,24840,27442,29425,32946,35465,-65,35358,31,35391,8,35401,21,-1,35423,25,35450,6,28020,23507,35029,39044,35947,39533,40499,28170,20900,20803,22435,34945,21407,25588,36757,22253,21592,22278,29503,28304,32536,36828,33489,24895,24616,38498,26352,32422,36234,36291,38053,23731,31908,26376,24742,38405,32792,20113,37095,21248,38504,20801,36816,34164,37213,26197,38901,23381,21277,30776,26434,26685,21705,28798,23472,36733,20877,22312,21681,25874,26242,36190,36163,33039,33900,36973,31967,20991,34299,26531,26089,28577,34468,36481,22122,36896,30338,28790,29157,36131,25321,21017,27901,36156,24590,22686,24974,26366,36192,25166,21939,28195,26413,36711,-65,35457,7,35467,7,35476,46,-1,35523,32,38113,38392,30504,26629,27048,21643,20045,28856,35784,25688,25995,23429,31364,20538,23528,30651,27617,35449,31896,27838,30415,26025,36759,23853,23637,34360,26632,21344,25112,31449,28251,32509,27167,31456,24432,28467,24352,25484,28072,26454,19976,24080,36134,20183,32960,30260,38556,25307,26157,25214,27836,36213,29031,32617,20806,32903,21484,36974,25240,21746,34544,36761,32773,38167,34071,36825,27993,29645,26015,30495,29956,30759,33275,36126,38024,20390,26517,30137,35786,38663,25391,38215,38453,33976,25379,30529,24449,29424,20105,24596,25972,25327,27491,25919,-65,35556,34,35592,27,-1,35620,1,35623,30,24103,30151,37073,35777,33437,26525,25903,21553,34584,30693,32930,33026,27713,20043,32455,32844,30452,26893,27542,25191,20540,20356,22336,25351,27490,36286,21482,26088,32440,24535,25370,25527,33267,1,32622,24092,23769,21046,26234,31209,31258,36136,28825,30164,28382,27835,31378,20013,30405,24544,38047,34935,32456,31181,32959,37325,20210,20247,33311,21608,24030,27954,35788,31909,36724,32920,24090,21650,30385,23449,26172,39588,29664,26666,34523,26417,29482,35832,35803,36880,31481,28891,29038,25284,30633,22065,20027,33879,26609,21161,34496,36142,38136,31569,-65,35654,31,35687,4,35693,25,-1,35719,24,35756,35761,35771,35783,35792,35818,35849,35870,20303,27880,31069,39547,25235,29226,25341,19987,30742,36716,25776,36186,31686,26729,24196,35013,22918,25758,22766,29366,26894,38181,36861,36184,22368,32512,35846,20934,25417,25305,21331,26700,29730,33537,37196,21828,30528,28796,27978,20857,21672,36164,23039,28363,28100,23388,32043,20180,31869,28371,23376,33258,28173,23383,39683,26837,36394,23447,32508,24635,32437,37049,36208,22863,25549,31199,36275,21330,26063,31062,35781,38459,32452,38075,32386,22068,37257,26368,32618,23562,36981,26152,24038,20304,26590,20570,20316,22352,24231,-70,35896,8,35906,3,35912,35914,1,35917,7,35926,3,35931,5,35939,6,35948,6,35956,3,35963,6,35971,1,35974,1,-1,35976,35979,35981,6,35989,2,35993,20,20109,19980,20800,19984,24319,21317,19989,20120,19998,39730,23404,22121,20008,31162,20031,21269,20039,22829,29243,21358,27664,22239,32996,39319,27603,30590,40727,20022,20127,40720,20060,20073,20115,33416,23387,21868,22031,20164,21389,21405,21411,21413,21422,38757,36189,21274,21493,21286,21294,21310,36188,21350,21347,20994,21000,21006,21037,21043,21055,1,21068,21086,21089,21084,33967,21117,21122,21121,21136,21139,20866,32596,20155,20163,20169,20162,20200,20193,20203,20190,20251,20211,20258,20324,20213,20261,20263,20233,20267,20318,20327,25912,20314,20317,-65,36014,62,-1,36077,32,20319,20311,20274,20285,20342,20340,20369,20361,20355,20367,20350,20347,20394,20348,20396,20372,20454,20456,20458,20421,20442,20451,20444,20433,20447,20472,20521,20556,20467,20524,20495,20526,20525,20478,20508,20492,20517,20520,20606,20547,20565,20552,20558,20588,20603,20645,20647,20649,20666,20694,20742,20717,20716,20710,20718,20743,20747,20189,27709,20312,20325,20430,40864,27718,31860,20846,24061,40649,39320,20865,22804,21241,21261,35335,21264,20971,22809,20821,20128,20822,20147,34926,34980,20149,33044,35026,31104,23348,34819,32696,20907,20913,20925,20924,-65,36110,14,36128,36177,1,36183,36191,36197,36200,2,36204,36206,1,36209,1,36216,8,36226,1,36230,3,36236,4,36242,1,36245,9,36256,1,-1,36258,36260,12,36274,36278,1,36281,36283,36285,36288,2,36293,36295,3,36301,36304,36306,2,20935,20886,20898,20901,35744,35750,1,35754,35764,1,35767,35778,1,35787,35791,35790,35794,2,35798,35800,1,35804,35807,1,35812,35816,1,35822,35824,35827,35830,35833,35836,35839,1,35842,35844,35847,35852,35855,35857,1,35860,2,35865,35867,35864,35869,35871,2,35877,35879,35882,1,35886,1,35890,1,35893,1,21353,21370,38429,38434,38433,38449,38442,38461,38460,38466,38473,38484,38495,38503,38508,38514,38516,38536,38541,38551,38576,37015,37019,37021,37017,37036,37025,37044,37043,37046,37050,-65,36309,36312,1,36316,36320,2,36325,2,36329,36333,1,36336,2,36340,36342,36348,36350,6,36358,2,36363,36365,1,36368,3,36373,7,36384,1,36388,4,36395,36397,36400,36402,2,36406,2,36411,1,36414,-1,36415,36419,36421,1,36428,4,36435,5,36442,11,36455,1,36458,1,36462,36465,37048,37040,37071,37061,37054,37072,37060,37063,37075,37094,37090,37084,37079,37083,37099,37103,37118,37124,37154,37150,37155,37169,37167,37177,37187,37190,21005,22850,21154,21164,1,21182,21759,21200,21206,21232,21471,29166,30669,24308,20981,20988,39727,21430,24321,30042,24047,22348,22441,22433,22654,22716,22725,22737,22313,22316,22314,22323,22329,22318,1,22364,22331,22338,22377,22405,22379,22406,22396,22395,22376,22381,22390,22387,22445,22436,22412,22450,22479,22439,22452,22419,22432,22485,22488,22490,22489,22482,22456,22516,22511,22520,22500,22493,-65,36467,36469,36471,4,36477,1,36480,36482,2,36486,36488,6,36497,2,36501,6,36509,36511,11,36525,1,36528,1,36531,6,36539,7,-1,36547,10,36559,21,22539,22541,22525,22509,22528,22558,22553,22596,22560,22629,22636,22657,22665,22682,22656,39336,40729,25087,33401,33405,33407,33423,33418,33448,33412,33422,33425,33431,33433,33451,33464,33470,33456,33480,33482,33507,33432,33463,33454,33483,1,33473,33449,33460,33441,33450,33439,33476,33486,33444,33505,33545,33527,33508,33551,33543,33500,33524,33490,33496,33548,33531,33491,33553,33562,33542,33556,1,33504,33493,33564,33617,33627,1,33544,33682,33596,33588,33585,33691,33630,33583,33615,33607,33603,33631,33600,33559,33632,33581,33594,33587,33638,33637,-65,36581,62,-1,36644,32,33640,33563,33641,33644,33642,33645,1,33712,33656,33715,1,33696,33706,33683,33692,33669,33660,33718,33705,33661,33720,33659,33688,33694,33704,33722,33724,33729,33793,33765,33752,22535,33816,33803,33757,33789,33750,33820,33848,33809,33798,33748,33759,33807,33795,33784,1,33770,33733,33728,33830,33776,33761,33884,33873,33882,33881,33907,33927,1,33914,33929,33912,33852,33862,33897,33910,33932,33934,33841,33901,33985,33997,34000,34022,33981,34003,33994,33983,33978,34016,33953,33977,33972,33943,34021,34019,34060,29965,34104,34032,34105,34079,34106,-65,36677,32,36714,36736,36748,36754,36765,36768,2,36772,3,36778,36780,3,36786,3,36791,1,36794,2,36799,1,36803,36806,-1,36809,4,36815,36818,36822,1,36826,36832,1,36835,36839,36844,36847,36849,1,36852,2,36858,2,36862,1,36871,1,36876,36878,36883,36885,36888,34134,34107,34047,34044,34137,34120,34152,34148,34142,34170,30626,34115,34162,34171,34212,34216,34183,34191,34169,34222,34204,34181,34233,34231,34224,34259,34241,34268,34303,34343,34309,34345,34326,34364,24318,24328,22844,22849,32823,22869,22874,22872,21263,23586,23589,23596,23604,25164,25194,25247,25275,25290,25306,25303,25326,25378,25334,25401,25419,25411,25517,25590,25457,25466,25486,25524,25453,25516,25482,25449,25518,25532,25586,25592,25568,25599,25540,25566,25550,25682,25542,25534,25669,25665,25611,25627,25632,25612,25638,25633,25694,25732,25709,25750,-65,36889,36892,36899,2,36903,5,36912,4,36919,36921,1,36925,36927,1,36931,36933,1,36936,4,36942,36948,2,36953,1,36956,5,36964,36966,1,36969,3,36975,4,36982,6,36990,36993,-1,36996,3,37001,1,37004,4,37010,37012,37014,37016,37018,37020,37022,2,37028,1,37031,2,37035,37037,37042,37047,37052,1,37055,1,25722,25783,1,25753,25786,25792,25808,25815,25828,25826,25865,25893,25902,24331,24530,29977,24337,21343,21489,21501,21481,21480,21499,21522,21526,21510,21579,21586,2,21590,21571,21537,21591,21593,21539,21554,21634,21652,21623,21617,21604,21658,1,21636,21622,21606,21661,21712,21677,21698,21684,21714,21671,21670,21715,1,21618,21667,21717,21691,21695,21708,21721,1,21724,21673,1,21668,21725,21711,21726,21787,21735,21792,21757,21780,21747,21794,1,21775,21777,21799,21802,21863,21903,21941,21833,21869,21825,21845,21823,21840,21820,-65,37058,1,37062,37064,1,37067,2,37074,37076,2,37080,2,37086,2,37091,2,37097,1,37100,37102,37104,3,37109,2,37113,3,37119,2,37123,37125,19,37146,2,-1,37149,37151,2,37156,10,37168,37170,6,37178,8,37188,21815,21846,21877,2,21811,21808,21852,21899,21970,21891,21937,21945,21896,21889,21919,21886,21974,21905,21883,21983,21949,1,21908,21913,21994,22007,21961,22047,21969,21995,1,21972,21990,21981,21956,21999,21989,22002,1,21964,1,21992,22005,21988,36756,22046,22024,22028,22017,22052,22051,22014,22016,22055,22061,22104,22073,22103,22060,22093,22114,22105,22108,22092,22100,22150,22116,22129,22123,22139,1,22149,22163,22191,22228,22231,22237,22241,22261,22251,22265,22271,22276,22282,22281,22300,24079,24089,24084,24081,24113,24123,1,-65,37189,37191,1,37201,37203,3,37208,1,37211,1,37215,1,37222,2,37227,37229,37235,37242,2,37248,4,37254,37256,37258,37262,1,37267,6,37276,5,37284,5,37291,1,37296,3,37302,3,37307,-1,37308,10,37320,37323,37328,37330,9,37341,8,24119,24132,24148,24155,24158,24161,23692,23674,23693,23696,23702,23688,23704,1,23697,23706,23708,23733,23714,23741,23724,23723,23729,23715,23745,23735,23748,23762,23780,23755,23781,23810,1,23847,23846,23854,23844,23838,23814,23835,23896,23870,23860,23869,23916,23899,23919,23901,23915,23883,23882,23913,23924,23938,23961,23965,35955,23991,24005,24435,24439,24450,24455,24457,24460,24469,24473,24476,24488,24493,24501,24508,34914,24417,29357,29360,29364,29367,1,29379,29377,29390,29389,29394,29416,29423,29417,29426,29428,29431,29441,29427,29443,29434,-65,37350,62,-1,37413,32,29435,29463,29459,29473,29450,29470,29469,29461,29474,29497,29477,29484,29496,29489,29520,29517,29527,29536,29548,29551,29566,33307,22821,39143,22820,22786,39267,39271,5,39284,39287,39293,39296,39300,39303,39306,39309,39312,1,39315,2,24192,24209,24203,24214,24229,24224,24249,24245,24254,24243,36179,24274,24273,24283,24296,24298,33210,24516,24521,24534,24527,24579,24558,24580,24545,24548,24574,24581,1,24554,24557,24568,24601,24629,24614,24603,24591,24589,24617,24619,24586,24639,24609,24696,1,24699,24698,24642,-65,37446,45,37493,16,-1,37510,7,37519,24,24682,24701,24726,24730,24749,24733,24707,24722,24716,24731,24812,24763,24753,24797,24792,24774,24794,24756,24864,24870,24853,24867,24820,24832,24846,24875,24906,24949,25004,24980,24999,25015,25044,25077,24541,38579,38377,38379,38385,38387,38389,1,38396,38398,38403,1,38406,38408,38410,3,38415,38418,38421,2,38425,1,20012,29247,25109,27701,27732,27740,27722,27811,27781,27792,27796,27788,27752,1,27764,27766,27782,27817,27856,27860,27821,27895,1,27889,27863,27826,27872,27862,27898,27883,27886,27825,27859,27887,27902,-65,37544,5,37551,24,37577,31,-1,37609,32,27961,27943,27916,27971,27976,27911,27908,27929,27918,27947,27981,27950,27957,27930,27983,27986,27988,27955,28049,28015,28062,28064,27998,28051,1,27996,28000,28028,28003,28186,28103,28101,28126,28174,28095,28128,28177,28134,28125,28121,28182,28075,28172,28078,28203,28270,28238,28267,28338,28255,28294,28243,1,28210,28197,28228,28383,28337,28312,28384,28461,28386,28325,28327,28349,28347,28343,28375,28340,28367,28303,28354,28319,28514,28486,1,28452,28437,28409,28463,28470,28491,28532,28458,28425,28457,28553,28557,28556,28536,28530,28540,28538,28625,-65,37642,51,37695,10,-1,37706,31,37739,28617,28583,28601,28598,28610,28641,28654,28638,28640,28655,28698,28707,28699,28729,28725,28751,28766,23424,23428,23445,23443,23461,23480,29999,39582,25652,23524,23534,35120,23536,36423,35591,36790,36819,36821,36837,36846,36836,36841,36838,36851,36840,36869,36868,36875,36902,36881,36877,36886,36897,36917,1,36909,36911,36932,36945,1,36944,36968,36952,36962,36955,26297,36980,36989,36994,37000,36995,37003,24400,24407,24406,24408,23611,21675,23632,23641,23409,23651,23654,32700,24362,24361,24365,33396,24380,39739,23662,22913,22915,22925,22953,1,22947,-65,37740,34,37776,27,-1,37804,29,37835,2,22935,22986,22955,22942,22948,22994,22962,22959,22999,22974,23045,1,23005,23048,23011,23000,23033,23052,23049,23090,23092,23057,23075,23059,23104,23143,23114,23125,23100,23138,23157,33004,23210,23195,23159,23162,23230,23275,23218,23250,23252,23224,23264,23267,23281,23254,23270,23256,23260,23305,23319,23318,23346,23351,23360,23573,23580,23386,23397,23411,23377,23379,23394,39541,39543,1,39546,39551,39549,39552,1,39557,39560,39562,39568,39570,1,39574,39576,39579,2,39583,1,39586,1,39589,39591,32415,32417,32419,32421,32424,1,-65,37838,7,37847,54,-1,37902,32,32429,32432,32446,32448,2,32457,32459,1,32464,32468,32471,32475,32480,1,32488,32491,32494,1,32497,1,32525,32502,32506,1,32510,32513,2,32519,1,32523,1,32527,32529,1,32535,32537,32540,32539,32543,32545,6,32554,3,32559,4,32565,24186,30079,24027,30014,37013,29582,29585,29614,29602,29599,29647,29634,29649,29623,29619,29632,29641,29640,29669,29657,39036,29706,29673,29671,29662,29626,29682,29711,29738,29787,29734,29733,29736,29744,29742,29740,-65,37935,14,37951,43,37996,3,-1,38000,20,38033,38038,38040,38087,38095,38099,1,38106,38118,38139,38172,38176,29723,29722,29761,29788,29783,29781,29785,29815,29805,29822,29852,29838,29824,1,29831,29835,29854,29864,1,29840,29863,29906,29882,38890,2,26444,26451,26462,26440,26473,26533,26503,26474,26483,26520,26535,26485,26536,26526,26541,26507,26487,26492,26608,26633,26584,26634,26601,26544,26636,26585,26549,26586,26547,26589,26624,26563,26552,26594,26638,26561,26621,26674,1,26720,1,26702,26722,26692,26724,26755,26653,26709,26726,26689,26727,26688,26686,26698,26697,26665,26805,26767,26740,26743,26771,26731,26818,26990,26876,26911,1,26873,-65,38183,38195,38205,38211,38216,38219,38229,38234,38240,38254,38260,1,38263,7,38272,42,-1,38315,32,26916,26864,26891,26881,26967,26851,26896,26993,26937,26976,26946,26973,27012,26987,27008,27032,27000,26932,27084,27015,1,27086,27017,26982,26979,27001,27035,27047,27067,27051,27053,27092,27057,27073,27082,27103,27029,27104,27021,27135,27183,27117,27159,1,27237,27122,27204,27198,27296,27216,27227,27189,27278,27257,27197,27176,27224,27260,27281,27280,27305,27287,27307,29495,29522,27521,1,27527,27524,27538,1,27533,27546,1,27553,27562,36715,36717,36721,2,36725,1,36728,36727,36729,1,36732,36734,36737,1,36740,36743,36747,-65,38348,27,38380,38399,38407,38419,38424,38427,38430,38432,38435,6,38443,2,38447,1,38455,3,38462,38465,38467,38474,38478,1,38481,2,38486,1,-1,38488,2,38492,2,38496,38499,38501,1,38507,38509,4,38515,38520,12,38535,38537,1,36749,2,36760,36762,36558,25099,25111,25115,25119,25122,25121,25125,25124,25132,33255,29935,29940,29951,29967,29969,29971,25908,26094,2,26122,26137,26482,26115,26133,26112,28805,26359,26141,26164,26161,26166,26165,32774,26207,26196,26177,26191,26198,26209,26199,26231,26244,26252,26279,26269,26302,26331,1,26342,26345,36146,1,36150,36155,36157,36160,36165,1,36168,1,36167,36173,36181,36185,35271,35274,2,35278,3,29294,29343,29277,29286,29295,29310,1,29316,29323,29325,29327,29330,25352,25394,25520,-65,38540,38542,38545,2,38549,1,38554,1,38557,9,38568,7,38577,1,38580,1,38583,1,38586,1,38591,38594,1,38600,38602,1,38608,1,38611,1,38614,9,38625,6,38635,-1,38636,2,38640,2,38644,1,38648,38650,3,38655,38658,1,38661,38666,2,38672,2,38676,1,38679,4,38685,38687,1,25663,25816,32772,27626,27635,27645,27637,27641,27653,27655,27654,27661,27669,27672,2,27681,27689,27684,27690,27698,25909,25941,25963,29261,29266,29270,29232,34402,21014,32927,32924,32915,32956,26378,32957,32945,32939,32941,32948,32951,32999,3,32987,32962,32964,32985,32973,32983,26384,32989,33003,33009,33012,33005,33037,1,33010,33020,26389,33042,35930,33078,33054,33068,33048,33074,33096,33100,33107,33140,33113,1,33137,33120,33129,33148,1,33133,33127,22605,23221,33160,33154,33169,28373,33187,33194,33228,26406,33226,33211,-65,38689,8,38699,1,38702,1,38705,38707,4,38714,3,38719,18,38740,1,38743,1,38746,38748,1,38751,38755,1,38758,2,38762,7,-1,38770,38773,38775,4,38781,7,38790,4,38796,38798,2,38803,38805,2,38809,4,33217,33190,27428,27447,27449,27459,27462,27481,39121,2,39125,39129,1,27571,24384,27586,35315,26000,40785,26003,26044,26054,26052,26051,26060,26062,26066,26070,28800,28828,28822,28829,28859,28864,28855,28843,28849,28904,28874,28944,28947,28950,28975,28977,29043,29020,29032,28997,29042,29002,29048,29050,29080,29107,29109,29096,29088,29152,29140,29159,29177,29213,29224,28780,28952,29030,29113,25150,25149,25155,25160,1,31035,31040,31046,31049,31067,1,31059,31066,31074,31063,31072,31087,31079,31098,31109,31114,31130,31143,31155,24529,24528,-65,38814,1,38817,1,38820,6,38828,38830,38832,1,38835,38837,46,-1,38884,1,38888,38894,4,38900,38903,23,24636,24669,24666,24679,24641,24665,24675,24747,24838,24845,24925,25001,24989,25035,25041,25094,32896,32895,27795,27894,28156,30710,30712,30720,30729,30743,1,30737,26027,30765,30748,1,30777,2,30751,30780,30757,30764,30755,30761,30798,30829,30806,1,30758,30800,30791,30796,30826,30875,30867,30874,30855,30876,30881,30883,30898,30905,30885,30932,30937,30921,30956,30962,30981,30964,30995,31012,31006,31028,40859,40697,40699,1,30449,30468,30477,30457,30471,1,30490,30498,30489,30509,30502,30517,30520,30544,1,30535,30531,30554,30568,-65,38927,62,-1,38990,32,30562,30565,30591,30605,30589,30592,30604,30609,30623,1,30640,30645,30653,30010,30016,30030,30027,30024,30043,30066,30073,30083,32600,32609,32607,35400,32616,32628,32625,32633,32641,32638,30413,30437,34866,38021,2,38027,38026,38028,1,38031,1,38036,38039,38037,38042,2,38051,1,38059,38058,38061,38060,38063,1,38066,38068,38070,4,38076,1,38079,38084,38088,6,38096,2,38101,2,38105,38104,38107,38110,2,38114,38116,1,38119,1,38122,-65,39023,5,39051,39054,39058,39061,39065,39075,39080,37,39119,1,39124,39126,1,39131,2,39136,4,-1,39141,1,39145,30,38121,38123,38126,1,38131,2,38135,38137,38140,1,38143,38147,38146,38150,1,38153,1,38157,2,38162,4,38168,38171,38173,2,38178,38186,1,38185,38188,38193,1,38196,38198,2,38204,38206,1,38210,38197,38212,2,38217,38220,38222,1,38226,2,38230,3,38235,38238,1,38237,38241,1,38244,8,38255,38257,2,38202,30695,30700,38601,31189,31213,31203,31211,31238,23879,31235,31234,31262,31252,-65,39176,4,39182,1,39185,28,39215,26,-1,39242,9,39254,12,39268,39270,39283,39288,1,39291,39294,39298,1,39305,31289,31287,31313,40655,39333,31344,30344,30350,30355,30361,30372,29918,29920,29996,40480,40482,40488,4,40498,40497,40502,40504,40503,40505,1,40510,40513,1,40516,40518,3,40523,1,40526,40529,40533,40535,40538,2,40542,40547,40550,6,40561,40557,40563,30098,30100,30102,30112,30109,30124,30115,30131,1,30136,30148,30129,30128,30147,30146,30166,30157,30179,30184,30182,30180,30187,30183,30211,30193,30204,30207,30224,30208,30213,30220,30231,30218,30245,30232,30229,30233,-65,39308,39310,39322,10,39334,1,39337,47,-1,39385,32,30235,30268,30242,30240,30272,30253,30256,30271,30261,30275,30270,30259,30285,30302,30292,30300,30294,30315,30319,32714,31462,31352,1,31360,31366,31368,31381,31398,31392,31404,31400,31405,31411,34916,34921,34930,34941,34943,34946,34978,35014,34999,35004,35017,35042,35022,35043,35045,35057,35098,35068,35048,35070,35056,35105,35097,35091,35099,35082,35124,35115,35126,35137,35174,35195,30091,32997,30386,30388,30684,32786,32788,32790,32796,32800,32802,32805,2,32809,32808,32817,32779,32821,32835,32838,32845,32850,32873,32881,35203,39032,39040,39043,-65,39418,62,-1,39481,32,39049,39052,1,39055,39060,39066,1,39070,1,39073,1,39077,1,34381,34388,34412,34414,34431,34426,34428,34427,34472,34445,34443,34476,34461,34471,34467,34474,34451,34473,34486,34500,34485,34510,34480,34490,34481,34479,34505,34511,34484,34537,34545,1,34541,34547,34512,34579,34526,34548,34527,34520,34513,34563,34567,34552,34568,34570,34573,34569,34595,34619,34590,34597,34606,34586,34622,34632,34612,34609,34601,34615,34623,34690,34594,34685,1,34683,34656,34672,34636,34670,34699,34643,34659,34684,34660,34649,34661,34707,34735,34728,34770,-65,39514,17,39538,39555,39561,39565,1,39572,1,39577,39590,39593,6,39602,3,39609,39611,39613,2,39619,1,39622,4,39629,3,39634,39636,3,39641,3,-1,39645,1,39648,39650,3,39655,3,39660,39662,39664,8,39674,39676,6,39684,2,34758,34696,34693,34733,34711,34691,34731,34789,34732,34741,34739,34763,34771,34749,34769,34752,34762,34779,34794,34784,34798,34838,34835,34814,34826,34843,34849,34873,34876,32566,32578,32580,1,33296,31482,31485,31496,31491,1,31509,31498,31531,31503,31559,31544,31530,31513,31534,31537,31520,31525,31524,31539,31550,31518,31576,31578,31557,31605,31564,31581,31584,31598,31611,31586,31602,31601,31632,31654,1,31672,31660,31645,31656,31621,31658,31644,31650,31659,31668,31697,31681,31692,31709,31706,31717,1,31722,31756,31742,31740,31759,31766,31755,-65,39687,39689,5,39696,2,39700,10,39712,2,39716,10,39728,1,39731,7,39741,3,39750,39754,2,39758,39760,39762,1,39765,5,-1,39771,32,31775,31786,31782,31800,31809,31808,33278,33281,1,33284,33260,34884,33313,2,33325,33327,33320,33323,33336,33339,33331,1,33342,33348,33353,33355,33359,33370,33375,33384,34942,34949,34952,35032,35039,35166,32669,32671,32679,32687,1,32690,31868,25929,31889,31901,31900,31902,31906,31922,31932,1,31937,31943,31948,1,31944,31941,31959,31976,33390,26280,32703,32718,32725,32741,32737,32742,32745,32750,32755,31992,32119,32166,32174,32327,32411,40632,40628,36211,36228,36244,36241,36273,36199,36205,35911,35913,37194,37200,37198,1,37220,-65,39804,62,-1,39867,32,37218,37217,37232,37225,37231,37245,1,37234,37236,37241,37260,37253,37264,37261,37265,37282,1,37290,37293,2,37301,37300,37306,35925,40574,36280,36331,36357,36441,36457,36277,36287,36284,36282,36292,36310,1,36314,36318,36302,1,36315,36294,36332,36343,1,36323,36345,36347,36324,36361,36349,36372,36381,36383,36396,36398,36387,36399,36410,36416,36409,36405,36413,36401,36425,36417,1,36433,1,36426,36464,36470,36476,36463,36468,36485,36495,36500,36496,36508,36510,35960,35970,35978,35973,35992,35988,26011,35286,35294,35290,35292,-65,39900,62,-1,39963,32,35301,35307,35311,35390,35622,38739,38633,38643,38639,38662,38657,38664,38671,38670,38698,38701,38704,38718,40832,40835,40837,5,40844,40702,40715,40717,38585,38588,1,38606,38610,30655,38624,37518,37550,37576,37694,37738,37834,37775,37950,37995,40063,40066,40069,3,31267,40075,40078,40080,2,40084,1,40090,1,40094,5,40101,4,40107,40109,1,40112,7,40122,3,40132,3,40138,1,-65,39996,62,-1,40059,40061,1,40064,40067,1,40073,1,40076,40079,40083,40086,3,40093,40106,40108,40111,40121,40126,4,40136,1,40145,1,40154,1,40160,1,40140,4,40147,2,40151,2,40156,1,40159,40162,38780,38789,38801,1,38804,38831,38827,38819,38834,38836,39601,39600,39607,40536,39606,39610,39612,39617,39616,39621,39618,39627,1,39633,39749,39747,39751,39753,39752,39757,39761,39144,39181,39214,39253,39252,39647,39649,39654,39663,39659,39675,39661,39673,39688,39695,39699,39711,39715,40637,1,32315,40578,40583,1,40587,40594,37846,40605,40607,40667,2,40672,40671,40674,40681,40679,40677,40682,40687,40738,40748,40751,40761,40759,40765,1,40772,-65,40163,62,-1,40226,32,-159,40259,62,-1,40322,32,-159,40355,62,-1,40418,32,-159,40451,27,40484,40487,40494,40496,40500,40507,1,40512,40525,40528,40530,2,40534,40537,40541,40543,3,40549,40558,1,40562,40564,9,40576,-1,40577,40579,3,40585,1,40588,5,40596,8,40606,40608,5,40615,3,-159,40619,8,40629,2,40633,1,40636,40639,4,40645,3,40650,2,40656,40658,1,40661,2,40665,1,40670,40673,40675,1,40678,40680,40683,3,40688,8,40698,40701,40703,6,-1,40710,4,40716,40719,40721,1,40724,2,40728,40730,5,40737,40739,8,40749,1,40752,1,-159,40754,4,40760,40762,40764,40767,4,40773,10,40786,38,-1,40825,5,40833,1,40845,11,40860,2,40865,4,63788,63865,63893,63975,63985,-159,64012,3,64017,64019,1,64024,64031,2,64035,1,64039,2];

	var result = [];

	for (var i = 0; i < charset.length; ++i) {
		// 编码中断部分，用负数代表中断长度
		if (charset[i] < 0) {
			result.length -= charset[i];
		}
		// 正式编码中，164为最小值，而连续编码长度最长的为114，所以不冲突，小于164的即为连续编码
		else if (charset[i] < 164) {
			for (var j = 0; j < charset[i]; ++j) {
				result.push(result[result.length - 1] + 1);
			}
		}
		// 连续编码初始值，是几就是几
		else {
			result.push(charset[i]);
		}
	}

	return result;
})();

// UTF-8 转 GBK 编码表
vschess.UTF82GBKCharset = (function(){
	var result = [];

	for (var i in vschess.GBK2UTF8Charset) {
		result[vschess.GBK2UTF8Charset[+i]] = +i;
	}

	return result;
})();

// GBK 转 UTF-8
vschess.GBK2UTF8 = function(array){
	var result = [];

	for (var i = 0; i < array.length; ) {
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
			result.push(vschess.fcc(vschess.GBK2UTF8Charset[(k << 8 | array[i + 1]) - 33088]));
			i += 2;
		}
	}

	return result.join("");
};

// ArrayBuffer 转换为 UTF-8 字符串
vschess.UTF8 = function(array){
	var result = [];

	for (var i = 0; i < array.length; ++i) {
		if (array[i] < 16) {
			result.push("%0", array[i].toString(16));
		}
		else {
			result.push("%" , array[i].toString(16));
		}
	}

	try {
		return decodeURIComponent(result.join(""));
	}
	catch (e) {
		return ""; 
	}
};

// 检测是否为 UTF-8 编码
vschess.detectUTF8 = function(array){
	for (var i = 0; i < array.length; ) {
		var k = array[i];

		if (k < 128 || k === 255) {
			++i;
		}
		else {
			var length = k.toString(2).indexOf("0");

			for (var j = 1; j < length; ++j) {
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
	return vschess.detectUTF8(array) ? vschess.UTF8(array) : vschess.GBK2UTF8(array);
};

// 将 UTF-8 字符串转换为 GBK ArrayBuffer
vschess.iconv2GBK = function(str){
	var array = str.split(""), result = [];

	for (var i = 0; i < array.length; ++i) {
		var code = vschess.cca(array[i]);

		if (code < 128) {
			result.push(code);
		}
		else if (array[i] === "\u20ac") {
			result.push(128);
		}
		else {
			var GBKCode = vschess.UTF82GBKCharset[code] + 33088;
			result.push(GBKCode >>   8);
			result.push(GBKCode  & 255);
		}
	}

	return result;
};

// 简单合并，不做处理
vschess.join = function(array){
	var result = [];

	for (var i = 0; i < array.length; ++i) {
		result.push(vschess.fcc(array[i]));
	}

	return result.join("");
};

// 查找连杀着法
vschess.findKill = function (situation, maxDeep = Infinity) {
  if (typeof situation === "string") {
    var RegExp = vschess.RegExp();
    RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
  }

  var checkedFen = {};
  var root = { situation: situation, parent: null, key: vschess.ZobristKey(vschess.situationToFen(situation)), next: [], player: 1, score: 0, deep: 1 };
  var checkQueue = [root];

  main: while (checkQueue.length) {
    var checkTask = checkQueue.shift();

    if (checkedFen[checkTask.key]) {
      continue;
    }

    checkedFen[checkTask.key] = 1;
    var legalList = vschess.legalList(checkTask.situation);
    var nextList = legalList;

    if (checkTask.player) {
      nextList = [];

      for (var i = 0; i < legalList.length; ++i) {
        var movedSituation = checkTask.situation.slice(0);
        movedSituation[legalList[i][1]] = movedSituation[legalList[i][0]];
        movedSituation[legalList[i][0]] = 1;
        movedSituation[0] = 3 - movedSituation[0];
        (vschess.checkThreat(movedSituation) || !vschess.hasLegalMove(movedSituation)) && nextList.push(legalList[i]);
      }
    }

    if (nextList.length) {
      for (var i = 0; i < nextList.length; ++i) {
        var movedSituation = checkTask.situation.slice(0);
        movedSituation[nextList[i][1]] = movedSituation[nextList[i][0]];
        movedSituation[nextList[i][0]] = 1;
        movedSituation[0] = 3 - movedSituation[0];
        var movedFen = vschess.situationToFen(movedSituation);
        var movedZobristKey = vschess.ZobristKey(movedFen);

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
    var fenA = vschess.situationToFen(root.situation);
    var fenB = vschess.situationToFen(root.next[maxIndex].situation);
    return { move: vschess.compareFen(fenA, fenB, 'node'), score: root.next[maxIndex].score };
  }
};

// 将军检查器
vschess.checkThreat = function(situation){
    if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

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

// 检查局面是否有合法着法（未被将杀或困毙）
vschess.hasLegalMove = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

	var player = situation[0];
	var enermy = 3 - player;

	function checkMove(src, dst) {
		var s  = situation.slice(0);
		s[dst] = s[src];
		s[src] = 1;
		return !vschess.checkThreat(s);
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
						if (checkMove(i, j)) return true;
						continue;
					}

					if (situation[j] >> 4 === enermy && checkMove(i, j)) return true;
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
					if (situation[targetIndex0] && situation[targetIndex0] >> 4 !== player && checkMove(i, targetIndex0)) return true;
					if (situation[targetIndex1] && situation[targetIndex1] >> 4 !== player && checkMove(i, targetIndex1)) return true;
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
						if (situation[targetIndex] >> 4 !== player && targetIndex > 127 && checkMove(i, targetIndex)) return true;
					}
				}
			}

			// 黑方象
			else {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vschess.advisorDelta[j]] === 1) {
						var targetIndex = i + (vschess.advisorDelta[j] << 1);
						if (situation[targetIndex] >> 4 !== player && targetIndex < 127 && checkMove(i, targetIndex)) return true;
					}
				}
			}
		}

		// 仕、士
		else if (piece === 4) {
			for (var j = 0; j < 4; ++j) {
				var targetIndex = i + vschess.advisorDelta[j];
				if (vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkMove(i, targetIndex)) return true;
			}
		}

		// 帅、将
		else if (piece === 5) {
			for (var k = 0; k < 4; ++k) {
				var targetIndex = i + vschess.kingDelta[k];
				if (vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkMove(i, targetIndex)) return true;
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

						if (situation[j] >> 4 === enermy && checkMove(i, j)) return true;
						break;
					}
					else {
						if (situation[j] === 1) {
							if (checkMove(i, j)) return true;
						}
						else {
							barbette = true;
						}
					}
				}
			}
		}

		// 兵、卒
		else  {
			// 红方兵
			if (player === 1) {
				if (situation[i - 16] && situation[i - 16] >> 4 !== 1 &&			checkMove(i, i - 16)) return true;
				if (situation[i +  1] && situation[i +  1] >> 4 !== 1 && i < 128 &&	checkMove(i, i +  1)) return true;
				if (situation[i -  1] && situation[i -  1] >> 4 !== 1 && i < 128 &&	checkMove(i, i -  1)) return true;
			}

			// 黑方卒
			else {
				if (situation[i + 16] && situation[i + 16] >> 4 !== 2 &&			checkMove(i, i + 16)) return true;
				if (situation[i -  1] && situation[i -  1] >> 4 !== 2 && i > 127 &&	checkMove(i, i -  1)) return true;
				if (situation[i +  1] && situation[i +  1] >> 4 !== 2 && i > 127 &&	checkMove(i, i +  1)) return true;
			}
		}
	}

	return false;
};

// 着法生成器（索引模式）
vschess.legalList = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

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
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

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

// 杀棋着法生成器
vschess.killMove = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var legalList = vschess.legalMoveList(fen);
	var result    = [];

	for (var i = 0; i < legalList.length; ++i) {
		var movedFen = vschess.fenMovePiece(fen, legalList[i]);

		if (vschess.checkThreat(movedFen) && vschess.legalList(movedFen).length === 0) {
			result.push(legalList[i]);
		}
	}

	return result;
};

// 是否有杀棋着法
vschess.hasKillMove = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

	var legalList = vschess.legalList(situation);

	for (var i = 0; i < legalList.length; ++i) {
		var movedSituation = situation.slice(0);
		movedSituation[legalList[i][1]] = movedSituation[legalList[i][0]];
		movedSituation[legalList[i][0]] = 1;
		movedSituation[0] = 3 - movedSituation[0];

		if (vschess.checkThreat(movedSituation) && !vschess.hasLegalMove(movedSituation)) {
			return true;
		}
	}

	return false;
};

// 叫杀检查器
vschess.checkKill = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	return vschess.checkThreat(fen) ? false : vschess.hasKillMove(vschess.fenChangePlayer(fen));
};

// 计算长打着法
vschess.repeatLongThreatMove = function(moveList){
	if (moveList.length < 13) {
		return [];
	}

	var fenList = [moveList[0]];

	for (var i = 1; i < moveList.length; ++i) {
		fenList.push(vschess.fenMovePiece(fenList[i - 1], moveList[i]))
	}

	var threatFenList = {};

	for (var i = fenList.length - 2; i >= 0; i -= 2) {
		if (vschess.checkThreat(fenList[i])) {
			if (vschess.checkThreat(fenList[i + 1])) {
				break;
			}

			var shortFen = fenList[i].split(" ", 2).join(" ");
			shortFen in threatFenList ? ++threatFenList[shortFen] : (threatFenList[shortFen] = 1);
		}
		else {
			break;
		}
	}

	if (fenList.length - i < 14) {
		return [];
	}

	var lastFen		= fenList[fenList.length - 1];
	var legalList	= vschess.legalMoveList(lastFen);
	var banMoveList	= [];
	var canMoveList	= [];

	for (var i = 0; i < legalList.length; ++i) {
		var move     = legalList[i];
		var movedFen = vschess.fenMovePiece(lastFen, move).split(" ", 2).join(" ");
		threatFenList[movedFen] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
	}

	return banMoveList;
};

// 计算一将一杀着法
vschess.repeatLongKillMove = function(moveList){
	if (moveList.length < 13 || vschess.repeatLongThreatMove(moveList)) {
		return [];
	}

	var fenList = [moveList[0]];

	for (var i = 1; i < moveList.length; ++i) {
		fenList.push(vschess.fenMovePiece(fenList[i - 1], moveList[i]))
	}

	var killFenList = {};

	for (var i = fenList.length - 2; i >= 0; i -= 2) {
		if (vschess.checkThreat(fenList[i])) {
			var shortFen = fenList[i].split(" ", 2).join(" ");
			shortFen in killFenList ? ++killFenList[shortFen] : (killFenList[shortFen] = 1);
		}
		else if (vschess.checkKill(fenList[i])) {
			"kill" in killFenList ? ++killFenList["kill"] : (killFenList["kill"] = 1);
		}
		else {
			break;
		}
	}

	var lastFen		= fenList[fenList.length - 1];
	var legalList	= vschess.legalMoveList(lastFen);
	var banMoveList	= [];
	var canMoveList	= [];

	if (fenList.length - i < 14) {
		return [];
	}

	for (var i = 0; i < legalList.length; ++i) {
		var move     = legalList[i];
		var movedFen = vschess.fenMovePiece(lastFen, move).split(" ", 2).join(" ");

		if (vschess.checkKill(movedFen)) {
			killFenList["kill"] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
		}
		else {
			killFenList[movedFen] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
		}
	}

	return canMoveList.length ? banMoveList : [];
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

	for (var i = 0; i < 4; ++i) {
		moveSplit[i] = eStr.charAt(cStr.indexOf(moveSplit[i]));
	}

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
			case "+3": to = 137; from && (from = from === 167 ? 167 : 171); break;
			case "-3": to = 201; from && (from = from === 167 ? 167 : 171); break;
			case "+7": to = 133; from && (from = from === 167 ? 167 : 163); break;
			case "-7": to = 197; from && (from = from === 167 ? 167 : 163); break;
			case "+5": to = 167; from &&  from < 195 && (from += 64); break;
			case "-5": to = 167; from &&  from > 139 && (from -= 64); break;
		}
	}
	// 仕士
	else if (situation[from] === A) {
		switch (moveSplit[2] + moveSplit[3]) {
			case "+4": to = 168; from && (from = 183); break;
			case "-4": to = 200; from && (from = 183); break;
			case "+6": to = 166; from && (from = 183); break;
			case "-6": to = 198; from && (from = 183); break;
			case "+5": to = 183; from &&  from < 195 && (from += 32); break;
			case "-5": to = 183; from &&  from > 171 && (from -= 32); break;
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
			var legalList = vschess.legalMoveList(currentFen);
			stepData = converter(moveList[i], currentFen);

			if (~legalList.indexOf(stepData.move)) {
				currentFen = stepData.movedFen;
				result.push(stepData.move);
			}
			else {
				var exchangeMove = moveList[i].substring(3, 5) + "-" + moveList[i].substring(0, 2);
				stepData = converter(exchangeMove, currentFen);

				if (~legalList.indexOf(stepData.move)) {
					currentFen = stepData.movedFen;
					result.push(stepData.move);
				}
				else {
					break;
				}
			}
		}
	}

	return result;
};

// 将着法列表转换为标准象棋 PGN 格式
vschess.moveListToData_PGN = function(moveList, startFen, commentList, infoList, result){
	var RegExp = vschess.RegExp();

	if (moveList[0] && moveList[0].length > 4 && RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		startFen = moveList.shift( );
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

	startFen === vschess.defaultFen || pgnText.push('[FEN "', startFen, '"]\n');
	!isICCS ? !isWXF ? null : pgnText.push('[Format "WXF"]\n') : pgnText.push('[Format "ICCS"]\n');
	pgnText.push(commentList[0] ? "{" + commentList[0] + "}\n" : "");

	if (startFenSplit[1] === "b") {
		for (var i = 0; i < moveList.length; ++i) {
			if (i === 0) {
				var round = startRound;
				round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
				pgnText.push(round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026 " : ". .... " : ". ..... ", moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "", "\n");
			}
			else {
				var round = (i + 1) / 2 + startRound;
				round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
				i % 2 && pgnText.push(round, ". ");
				pgnText.push(moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "");
				commentList[i + 1] && i % 2 && i !== moveList.length - 1 && pgnText.push("\n", round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026" : ". ...." : ". .....");
				pgnText.push(i % 2 ? " " : "\n");
			}
		}
	}
	else {
		for (var i = 0; i < moveList.length; ++i) {
			var round = i / 2 + startRound;
			round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
			i % 2 || pgnText.push(round, ". ");
			pgnText.push(moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "");
			commentList[i + 1] && !(i % 2) && i !== moveList.length - 1 && pgnText.push("\n", round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026" : ". ...." : ". .....");
			pgnText.push(i % 2 ? "\n" : " ");
		}
	}

	pgnText = vschess.trim(pgnText.join(""));

	if (pgnText.split("").pop() === "}") {
		pgnText += "\n " + result;
	}
	else {
		(startFenSplit[1] === "b") === !!(moveList.length % 2) && (pgnText += "\n");
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

	startFen === vschess.defaultFen || text.push("\u5f00\u5c40 Fen \u4e32\uff1a", startFen, "\n");
	text.push(commentList[0] ? "\uff08" + commentList[0] + "\uff09\n" : "");

	if (startFenSplit[1] === "b") {
		for (var i = 0; i < moveList.length; ++i) {
			if (i === 0) {
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
		for (var i = 0; i < moveList.length; ++i) {
			var round = i / 2 + startRound;
			round = vschess.strpad(round, Math.ceil(moveList.length / 2).toString().length, " ", "left");
			i % 2 || text.push(round, ". ");
			text.push(moveList[i], commentList[i + 1] ? "\n\uff08" + commentList[i + 1] + "\uff09" : "");
			commentList[i + 1] && !(i % 2) && i != moveList.length - 1 && text.push("\n", round, ". \u2026\u2026\u2026\u2026");
			text.push(i % 2 ? "\n" : " ");
		}
	}

	text = vschess.trim(text.join(""));
	var resultStr = vschess.showText(result, "result");

	if (resultStr) {
		if (text.split("").pop() === "\uff09") {
			text += "\n" + resultStr;
		}
		else {
			(startFenSplit[1] === "b") === !!(moveList.length % 2) && (text += "\n");
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

	for (var i = 0; i < 90; ++i) {
		var position = i % 9 * 10 + Math.floor(i / 9);
		position < 10 && (position = "0" + position);

		switch (pieceEach[i]) {
			case "K": DhtmlXQ_binit[ 4] = position; break;
			case "k": DhtmlXQ_binit[20] = position; break;
			case "R": DhtmlXQ_binit[ 0] === 99 ? DhtmlXQ_binit[ 0] = position : DhtmlXQ_binit[ 8] = position; break;
			case "N": DhtmlXQ_binit[ 1] === 99 ? DhtmlXQ_binit[ 1] = position : DhtmlXQ_binit[ 7] = position; break;
			case "B": DhtmlXQ_binit[ 2] === 99 ? DhtmlXQ_binit[ 2] = position : DhtmlXQ_binit[ 6] = position; break;
			case "A": DhtmlXQ_binit[ 3] === 99 ? DhtmlXQ_binit[ 3] = position : DhtmlXQ_binit[ 5] = position; break;
			case "C": DhtmlXQ_binit[ 9] === 99 ? DhtmlXQ_binit[ 9] = position : DhtmlXQ_binit[10] = position; break;
			case "r": DhtmlXQ_binit[16] === 99 ? DhtmlXQ_binit[16] = position : DhtmlXQ_binit[24] = position; break;
			case "n": DhtmlXQ_binit[17] === 99 ? DhtmlXQ_binit[17] = position : DhtmlXQ_binit[23] = position; break;
			case "b": DhtmlXQ_binit[18] === 99 ? DhtmlXQ_binit[18] = position : DhtmlXQ_binit[22] = position; break;
			case "a": DhtmlXQ_binit[19] === 99 ? DhtmlXQ_binit[19] = position : DhtmlXQ_binit[21] = position; break;
			case "c": DhtmlXQ_binit[25] === 99 ? DhtmlXQ_binit[25] = position : DhtmlXQ_binit[26] = position; break;
			case "P": {
				for (var j = 11; j < 16; ++j) {
					if (DhtmlXQ_binit[j] === 99) {
						DhtmlXQ_binit[j] = position;
						break;
					}
				}

				break;
			}
			case "p": {
				for (var j = 27; j < 32; ++j) {
					if (DhtmlXQ_binit[j] === 99) {
						DhtmlXQ_binit[j] = position;
						break;
					}
				}

				break;
			}
		}
	}

	DhtmlXQ.push("[DhtmlXQ_fen]"   + nodeData.fen           + "[/DhtmlXQ_fen]"  );
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
			for (var i = node.next.length - 1; i >= 0; --i) {
				if (i !== node.defaultIndex) {
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

	for (var i = nodeData.next.length - 1; i >= 0; --i) {
		if (i !== nodeData.defaultIndex) {
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

	for (var i = 0; i < DhtmlXQ_EachLine.length; ++i) {
		var l = DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_binit")) {
			var startSplit = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_")).split("");

			for (var j = 0; j < startSplit.length; j += 2) {
				startSplit[j] < 9 && (startSplit[j] = 8 - startSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_binit]" + startSplit.join("") + "[/DhtmlXQ_binit]";
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			var moveSplit = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_")).split("");

			for (var j = 0; j < moveSplit.length; j += 2) {
				moveSplit[j] < 9 && (moveSplit[j] = 8 - moveSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_movelist]" + moveSplit.join("") + "[/DhtmlXQ_movelist]";
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start		= l.indexOf("]");
			var changeId	= l.substring(14, start);
			var changeSplit = l.substring(start + 1, l.indexOf("[/DhtmlXQ_")).split("");

			for (var j = 0; j < changeSplit.length; j += 2) {
				changeSplit[j] < 9 && (changeSplit[j] = 8 - changeSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_move_" + changeId + "]" + changeSplit.join("") + "[/DhtmlXQ_move_" + changeId + "]";
		}
	}

	return DhtmlXQ_EachLine.join("\n");
};

// 将棋谱节点树转换为广东象棋网打虎将 DHJHtmlXQ 格式
vschess.nodeToData_DHJHtmlXQ = function(nodeData, infoList, isMirror){
	var DHJHtmlXQ = [];
	var isB   =  nodeData.fen.split(" ")[1] === "b";
	var round = +nodeData.fen.split(" ")[5];
	DHJHtmlXQ[31] = vschess.fenToArray(nodeData.fen).join("");
	DHJHtmlXQ[32] = isB ? 1 : 0;
	DHJHtmlXQ[33] = round * 2 - isB ? 1 : 2;

	var nextList = nodeData.next, moveList = [], commentList = [nodeData.comment], step = 0;

	while (nextList.length) {
		var moveSplit = nextList[0].move.split("");
		moveList   .push(vschess.cca(moveSplit[0]) - 97, moveSplit[1], vschess.cca(moveSplit[2]) - 97, moveSplit[3]);
		commentList.push(nextList[0].comment);
		nextList = nextList[0].next;
	}

	DHJHtmlXQ[34] = moveList.join("");

	for (var i in vschess.info.DHJHtmlXQ) {
		if (infoList[i]) {
			DHJHtmlXQ[vschess.info.DHJHtmlXQ[i]] = infoList[i];
		}
	}

	var result = ["[DHJHtmlXQ]"];

	for (var i = 0; i < DHJHtmlXQ.length; ++i) {
		if (typeof DHJHtmlXQ[i] !== "undefined") {
			result.push("[DHJHtmlXQ_" + i + "]" + DHJHtmlXQ[i] + "[/DHJHtmlXQ_" + i + "]");
		}
	}

	for (var i = 0; i < commentList.length; ++i) {
		if (commentList[i].length) {
			result.push("[game_comment_0_" + i + "]" + commentList[i] + "[/comment_0_" + i + "]");
		}
	}

	result.push("[/DHJHtmlXQ]");
	return isMirror ? vschess.turn_DHJHtmlXQ(result.join("\n")) : result.join("\n");
};

// 翻转广东象棋网打虎将 DHJHtmlXQ 格式
vschess.turn_DHJHtmlXQ = function(chessData){
	var DHJHtmlXQ_EachLine = chessData.split("\n");

	for (var i = 0; i < DHJHtmlXQ_EachLine.length; ++i) {
		var l = DHJHtmlXQ_EachLine[i];

		if (~l.indexOf("[DHJHtmlXQ_31")) {
			var startSplit = l.substring(l.indexOf("[DHJHtmlXQ_31") + 14, l.indexOf("[/DHJHtmlXQ_")).split("");
			startSplit = vschess.fenToArray(vschess.turnFen(vschess.arrayToFen(startSplit)));
			DHJHtmlXQ_EachLine[i] = "[DHJHtmlXQ_31]" + startSplit.join("") + "[/DHJHtmlXQ_31]";
		}
		else if (~l.indexOf("[DHJHtmlXQ_34")) {
			var moveSplit = l.substring(l.indexOf("[DHJHtmlXQ_34") + 14, l.indexOf("[/DHJHtmlXQ_")).split("");

			for (var j = 0; j < moveSplit.length; j += 2) {
				moveSplit[j] < 9 && (moveSplit[j] = 8 - moveSplit[j]);
			}

			DHJHtmlXQ_EachLine[i] = "[DHJHtmlXQ_34]" + moveSplit.join("") + "[/DHJHtmlXQ_34]";
		}
	}

	return DHJHtmlXQ_EachLine.join("\n");
};

// 将棋谱节点树转换为鹏飞象棋 PFC 格式
vschess.nodeToData_PengFei = function(nodeData, infoList, result, isMirror){
	function getXmlByNode(nodeData, isDefault){
		var xmlData = ['<n m="', isMirror ? vschess.turnMove(nodeData.move) : nodeData.move, '" c="', nodeData.comment.replace(/\"/g, "&quot;"), '"'];
		isDefault && xmlData.push(' default="true"');
		xmlData.push(">");

		for (var i = 0; i < nodeData.next.length; ++i) {
			xmlData.push(getXmlByNode(nodeData.next[i], nodeData.defaultIndex === i));
		}

		xmlData.push('</n>');
		return xmlData.join("");
	}

	var xmlData = ['<?xml version="1.0" encoding="utf-8"?><n version="2" win="' + result + '" m="', isMirror ? vschess.turnFen(nodeData.fen) : nodeData.fen, '" c="', nodeData.comment.replace(/\"/g, "&quot;"), '"'];

	for (var i in infoList) {
		xmlData.push(" ", vschess.info.pfc[i] || i, '="', infoList[i].replace(/\"/g, "&quot;"), '"');
	}

	xmlData.push(">");

	for (var i = 0; i < nodeData.next.length; ++i) {
		xmlData.push(getXmlByNode(nodeData.next[i], nodeData.defaultIndex === i));
	}

	xmlData.push("</n>");
	return xmlData.join("").replace(/\"><\/n>/g, '" />');
};

// 翻转鹏飞象棋 PFC 格式
vschess.turn_PengFei = function(chessData){
	chessData = chessData.split('m="');
	var end = chessData[1].indexOf('"');
	chessData[1] = vschess.turnFen(chessData[1].substring(0, end)) + chessData[1].substring(end);

	for (i = 2; i < chessData.length; ++i) {
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

	for (var i = 0; i < moveList.length; ++i) {
		var moveSplit = moveList[i].split("");
		var from = vschess.i2b[moveList[i].substring(0, 2)];
		var to   = vschess.i2b[moveList[i].substring(2, 4)];
		srcCol = isMirror ? vschess.cca(moveSplit[0]) - 97 : 105 - vschess.cca(moveSplit[0]);
		dstCol = isMirror ? vschess.cca(moveSplit[2]) - 97 : 105 - vschess.cca(moveSplit[2]);
		result.push(board[from], " 32 ", 1 - i % 2, " ", moveSplit[1], " ", srcCol, " ", moveSplit[3], " ", dstCol, " 0 ", i + 1, " 0 ");
		board[to] = board[from];
	}

	return result.join("");
};

// 节点 ICCS 转换为中文着法（兼容 WXF 着法转换为中文着法，直接返回结果字符串）
vschess.Node2Chinese = function(move, fen, options){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	typeof options === "undefined" && (options = vschess.defaultOptions);
	var w2i = [{ "+": 0, ".": 1, "-": 2 }, { "+": 3, "-": 4, ".": 5 }];
	var isB = fen.split(" ")[1] === "b", result = "";
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
	var isB = fen.split(" ")[1] === "b";
	move = move.toLowerCase();

	// 黑方旋转处理
	if (isB) {
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

	if (situation[from] < 16) {
		return { move: "None", movedFen: vschess.defaultFen };
	}

	var fromCol	= 12 - from % 16;
	var toCol	= 12 - to   % 16;
	var piece   = situation[from] & 15;
	var result	= "";

	// 相象仕士
	if (piece === 3 || piece === 4) {
		result = vschess.n2f[piece | 16] + fromCol;
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
				for (var j = i, pColList = []; j < 204; j += 16) {
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
			situation[i] === situation[from] && (result = vschess.n2f[piece | 16] + "+");
		}

		for (var i = from - 16; i >  50 && !result; i -= 16) {
			situation[i] === situation[from] && (result = vschess.n2f[piece | 16] + "-");
		}

		result || (result = vschess.n2f[piece | 16] + fromCol);
	}

	// 马相象仕士
	if (piece === 2 || piece === 3 || piece === 4) {
		result += (from > to ? "+" : "-") + toCol;
	}
	// 车帅将炮兵卒
	else {
		var offset = to - from;

		if (Math.abs(offset) > 15) {
			result += (offset > 0 ? "-" : "+") + Math.abs(offset >> 4);
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
		return { move: result, movedFen: isB ? vschess.roundFen(vschess.situationToFen(situation)) : vschess.situationToFen(situation) };
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

		if (stepData.move === "None" || stepData.move === "\u65e0\u6548\u7740\u6cd5") {
			break;
		}

		result.push(stepData.move);
	}

	return result;
};

// 节点树抽取当前节点 ICCS 列表
vschess.nodeToNodeList = function(node){
	var currentNode = node;
	var fen = currentNode.fen;
	var result = [fen];

	while (currentNode.next.length) {
		var defaultIndex = currentNode.defaultIndex || 0;
		currentNode = currentNode.next[defaultIndex];
		result.push(currentNode.move);
	}

	return result;
};

// WXF 着法字符串转换为 ECCO 开局编号及类型
vschess.WXF2ECCO = function(wxfList){
	wxfList = wxfList && wxfList.length ? wxfList.slice(0) : [vschess.defaultFen];

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

// 象棋演播室 XQF 格式文件头读取
vschess.XQF_Header = function(buffer){
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
vschess.XQF_Key = function(header) {
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

// Zobrist 编码表
vschess.ZobristTable = (function () {
    var table = [66, '02010d007b4765f9', '171880531b8d5860', '957a1458a42becec', 6, 'd4a088b2e2591ccb', 'f9260f515c7bec95', '54051e52de03c1b2', 6, 'bb8cb47e59282224', '2d67375e4ccd7677', 'abba445d0e5e56a6', 69, 'ee8344c1e19954c4', 1, 'c448cf344c71909f', 7, 'c44047e6f7a8ff33', 7, '1603571cdc91c8de', 1, '9331def3087dff1e', 50, '64bf6640836f6037', 3, '2548d6fbdc1f80aa', 11, '21825ec968846814', 3, '06f79b8c40333b69', 3, '752be6837f80f5d4', 11, '3d85ff2aa5a61469', 3, '0cd680125ea617ed', 2, 'a5dff339327e7078', 'ab400c1dfe73b366', '5cf50f5d2b5c7d0b', '1c23c7a2e0de9575', '9310bfd66b61b5d1', '25489c041d6b07f6', '0c54ea7b8eb75e36', 'aa206c84fce12cdc', '603c2e6f4abef76e', 'a7950be44ce5c030', 'bf19f45cbe7877d3', '690b31994f8258da', '20f1dcb78c3ca5ee', 'f9b677558d274c3c', '35155a33f117aa34', '0463f288d157c25a', '4c8440eb5956efbc', '7debb4777a74e13f', '3b89fe2c397d1e0e', '79c03729d4807dc2', '76640b24d075993b', 'cc3030cd961231c8', 'f33f066ef548ba59', 'e650f745d76565e1', '4e7045d3c7a72acf', '2ae92f5d43121c73', '8c11d8cbf6e4a584', '3d8e6e8510a0a07e', '57242239dabe7fbd', 'df24cee742476222', '132143633cb53b74', '85ecc54bb9aa82e7', 'd2b73d12226ee596', 'f5e0f118147d9c5a', '60ebe31c90919002', '6182d88ac7fb104a', '7ffaa7b53bcd7d2d', 'f01fa550ea050e8d', 'dd3a7a97c727f8c5', '202ff086161c35a2', '63098f64c3519be0', '8b6b9080fcee6e2c', '8e64f0e0bad3b0ff', 'fdd124fbd9f47baa', 'fc9a8120eac4f4de', 'bdaf0ed0fd9f5909', 'f474564301c7213b', 'cc5a0abdd7671398', '0ceed4d537de1343', '58e79783d661be84', '82f9b58a523eeebd', '25f38588e5c2e805', '0e855f5ce0f874eb', 'e53d644bd96dfdcd', 'dc13773e39d2983e', 'd4cbd4f4f016a510', 'ec00ceb009762a51', 'bc18717e5f315789', '44e0fbc21a20374e', '77553337365a10a0', '46cbe73bf081f5ef', '879d223238fb8588', '2ed76c189342fce4', 'ad1836b1bd44ae3a', '2cb78f5a79a68d95', '9173fc9659e5c5e5', '538f503fd8ec25e5', 'e557d988a0f0b5fc', 'dbd9b79f0ddbc770', '197539f52e6a1483', 'af5546fdeefdbb80', '7a5ccee4a4b0bb30', 'f135393105f16da9', '7cb14577c1c96493', '29c08567b365d088', 'f65e476829855207', '2bb66190b0589d8b', '334afbeab5fde105', '06be417fb2f4d2c6', '579274d2719cb915', 'a849635cef43c8fe', '896a95118af5d879', '541aad61b2715a13', 'ebbba8eb36c6e5b0', 'aeb7fdd53512efe0', 'be6eabe388fbd437', '39d468522c9a1578', '59be957699b964fc', 'c7e10451f916c4c7', '9aa1b47ef1a7cddb', '0528606a6938c6f8', 'ca8a26e21869ea39', '58af39057db7692a', 'd7c175677159d07a', '854c2f005e2b90b1', 'dfdee7c57f42e59d', '6d6cd4aa8fc3284a', '15e714de3f2e60bf', 'bdb8cbb3422ce24b', '35e628d027f9981f', '77eaf786de54a30c', 'b7d723a05c7364eb', '2a4ea8bccab707f3', '529f0276deccc6df', 'c20d1474776fc285', 'f3262f5b88cbc9d3', '41486c06694d6583', '87c1db3f8a5fb573', 'f5a587a5c5b2043c', 'd7f2157e386b33f1', '2053c57ef8051a8d', '123616777af47fdd', 'd2b6bd9bbb110690', '5a242d096ee6306c', 'c30eca7eb20b31fe', 'b9350cddcb9a222f', '4743806c451489e0', '38b686616cbe95bb', '5510ef7c6ae03b73', 'd8ca5e88067d4205', 'a73a67157a66bea9', 'dc556d97bade0680', '285fcc5c81c07deb', '0d0dafceb059b98d', '63c97ba69693b7c2', 'db91fd578c381f9d', '99f174c7989c764a', 'a6a176457885ae59', '27a7b9734c0bb489', 'f6465fa4d905bb07', '214522e4393870ad', 'b463885664b813dc', '295218d708b04e88', '8aca5a337c579b7e', '1b89446e2ed73df8', '1cb65ced9de73ed5', '4ae4e0ad8ace67ae', '65213fc823013c8e', '1b6c45c466676be9', '9058254aac43b254', 'a73b15ef0d298557', '6a52e2f2e8274433', '15a42be5d8a526e4', 'c78dac6d791d037f', '6eed5739325c478a', 'c1054f9959ccb8b9', 'dd33addd43ce65c8', '0be6e3a219c1d87f', 'e768a7e3ed454bf2', '755a0d2ed90d9fb4', '1ecf834debf6a312', '136bb9b0d8daa7b5', 'bb8b44627c57b5fd', '7b067e5f34d777d5', 'b313f1fd14337904', 'e1a4a6da4d03cd2d', 'f0190bfc79ec283b', '05589d19c0a0a143', 'b89bed2df7007a8e', '83cf1ae2e97778ec', 'b4dd761623f66ff1', 'b0f607aa96f29280', 'e9f9e364f5549663', 'a00aa8dc87541658', 'cc00e8b64b51f0f1', 'dd8d3e21055d32cd', 'bc122aa51ddbc945', '0a4480148e3a87be', '06a06a7d3621a8c4', 'f65e21280296e5da', 'a0ca51f33c7a9d55', 'b547e19fbcf21922', '35caeb4c4722a4be', 'df9dc0388188808a', 'c0f609ee9a2a9027', 'b2879d8f7799de34', 'ecff7f1ae697a35b', 'e6dae6b82f8ebae0', 'd9fa6c8906fa93f1', '358c13397d9c7209', 'a7e99ca0834575eb', '2872a3e753893af0', '85f5d2fa9d3491dd', 'd501ae14f28e9b02', 'bc4856ff58678145', 'c1bbc557f7e4b967', 'f8994976f7111e32', 'da380e3058d58a66', '51bde09c572cd41c', '0fcfda00a2df7582', '78fa613231dab129', '454fbd346706e28f', '6fededeaf06c2a7c', 'fa681fad3c63d436', '99eb68c5cf1229fa', '2b1ce20b9f018221', '83373a5a2f1e120f', 'c44066ec845cdd9c', '0b79baa4ce38dcde', '70026e9382805605', '0e100ea5adb68272', '971e938a1d90ff77', 'e32ed01d314b227a', '147df51df231631b', '8801c04653b12f00', '714b6fd7487cdfaf', '493daa3229d74f30', '67b74d0281aeaa6d', 'a67c5bbfb3abac0c', '035c54358954bd7c', '74d61070ac52a463', '6dde8a787103d6ce', 'c82ef638075bd765', '63aeeae23bf85195', 'b5116be9af6fd846', '8889b1897387dce4', '07e0a5df0abd7bda', '9241ba7af22f8c09', 'b821659be01100e1', '087f12ace6a913f1', '2cc154384890cf2e', '332212fd0d4c93b0', '1ad3986a5eceabe5', '42cde963f0153516', '71809460427bc207', 'b7d6144f90015e15', 'd0140299117f3504', '4114b95f6e3cab17', '60ac28dcd62a4913', '0f296a2620172cd8', '04e31164c35e4f15', 'e466c33a2b4de535', '5c6d64a8002c13a0', 'dd066e73f4df1124', '4dff95b959371d49', 'fd9d55ff33ac5c45', '16b318d74e485bd3', 'a518062f2c0ccefa', 'd370f45ac2dba449', 'b8655a77918b7aed', '23a7bd7c80ad5a0a', 'eb849fa8a71305a5', '8f8793d12dfe840a', '7d4d49d1973b14e3', '836ee4a0f1693d56', '6741d42b00c3c409', 'd0a54661e926d116', '68f9fa3fe742cd3e', 'ee04be4df06e52d1', '2a1d652db6466c28', '0b5005e765c8a126', '3af7e4d59e46cbc4', '2737469dac0a7f91', '2f02708242092a01', 'a8cdf652345ff5ef', 'fb5eb1c305ef2b18', '822e768eb6d0f2b3', '0584b80f51416c9a', '39973817a390d296', 'c2b47076deea9063', 'd0d3a22e8b43e0a0', '2dbdcc72f2c0c73f', '4cb9b1b8637d9a4d', '0b2c99130ded34f9', '247681315a7c78f2', '0680cb501629e2e6', 'd810f1f4c5df4862', 'b62be7d66825e997', '3e3e69f9beb821de', '241f00d917a2522c', '70233bdbc8a3cd53', 'bef9c72d97d3358a', '06c9113cd1d3c725', '1de455ab8c7d850f', '2a04cbd36215d78d', 'e4df38bb6f501356', 'dfda3cdfcca10fee', 'c1139c7bf1d6b9d1', '2e4b812a51be9ce2', '1751f3760596a859', 'bc48755ea10b322a', '13749255773c21c8', 'fbcfd042255a9d89', 'd311a2f86decc442', 'a6b03b285ffef093', '9e481e985bf9bb42', '0c504fe712c8855e', '5567ab7ef06c29b9', '4f064b289b11f7f4', '5bf1466a1abf73fc', '2198da99798a20ec', '64e98c05a5e6c094', '46a771f3dff7de19', '0f5e138349460def', '8f495b2af499f1d7', '7d2c3c49a1b964f2', '74004a1cad2b4573', 'ec907668d770ae92', '25662b041d21618a', '80dac3f052ce2487', '75f42374fa78fca0', '2c882fee641ac3d0', '9c249ea4db410203', 'fbc4b652bf58b471', '3ec3f7e58325818e', '7a69e92045e9181f', 'bbc86efb9a305ddf', 'bd0075f17f04379d', '70a7d3114b38adce', '50da4d9da706d05f', '677e1761b95b0763', 'f1a71474deaafda8', '34e9a39a852f1916', '5fdc168d9d2d5873', '208044f7adb25109', '910e48f65bed86c9', 1, '6234cb83811aaf35', 1, 'b75b3a16b9dcfe11', 1, 'a62f3a5e37361b0b', 1, '37a7de5f54b2f6be', '5b4a46be7664697c', 1, '8a7ee39e70e45c72', 1, 'faf9b526a2e49055', 1, '775449c8b6a66ad5', 1, '9ccc4e653037370b', 30, '9c69702b27269ea0', 'd081c17c4335e389', '534905ef8d860369', 6, 'b7f433c21183711a', '0e9ba058fb67e701', 'f25b8f9bd234a650', 6, '659703ea7bf6d335', 'df20971f4f15896b', '34c4cc39dc2540e6', 69, '5a912193aa89f7b4', 1, '06f970f53a8599a0', 7, '6f064bce2cd50c74', 7, 'b3271f3807c1475a', 1, 'aeb2034152ce0c01', 68, '028d8dd17e7d5272', 3, 'd217f6c8f2dcec1a', 11, '8fff55d26b87f7ef', 3, 'd7143b758ea86f2c', 3, 'bcfb76ba7e946df7', 11, '6e85ab3fe77b980a', 3, '3aa6d2d969dcdfa1', 47, '6fbe86fb2f51ff7a', 'a74722d0a49e02de', '7592c54797a4da0a', '9dc7f91f8b7da86a', '6c7bef750341e9b5', '162dd072e0e3787a', 'bdaaeca5d174ed26', '3dea97632f5f7126', '0dd707d3d3bb657f', 'd54f7bfebea90a3d', '27f19f19d2717316', 'dac56a5b50656e71', '81f00d38b1594ee5', 'f67cfcf79b851f77', '52c4615c0093825f', 'c301e36df36e680f', '705e1e54abf7d645', 'f09926b9f55c81b3', 'de6de46a59a83cd5', '5a5e094da95f82c1', '31b8d66ae62bfc9b', '0cee700e60839431', '2a8ec2a02f1cc99b', '481ffc438b7daaa4', '0bb429df90cef779', 'fa989ccd422e87a9', 'fee01738cc30c80b', '326a27b396abd9b0', 'bffe7620299c2868', 'ec11f75d1b08347b', '2585c01fed5396be', 'e273ab9831ecd6df', '7d7be20119bb97e1', 'c2a8d7b69a6e6c28', 'c1b6ed0ffe81be56', 'caffb96dde233093', 'ef1c539f9d30427a', 'e72c5c5551f930d4', '2b3de5e93f2be746', '17a0987ac3c0653e', 'e2f5a6586af9293f', '517c2e7d5c078aef', '6b0ed47de1452c22', 'fe7da6edef0f078c', '3ed43dc626403a9a', '9ae45043add1c820', '552958c207e9cf0e', '62721996f8e65773', 'ce5174bd8f5f8ea1', '0de6f8aabc6765fa', '942c1cb043bceee7', '125d6b909e6c82ac', '975963c9cb96d4cb', '1dc1d8ff5cb53cac', '26aa74052a4d7ad1', 'a01f124a7f7fac5e', 'd8ab7cbccca788b4', '5dd31516e3683219', '242193a82b7bc58b', 'c0ff6aa2aad4e923', '3253c01a7b1cf04b', 'ca5ee2961d758bd5', '46b498263eceb496', '5fded798dd7f79f7', '791f1de2636e784f', 'daaf0082a5021001', 'dd88224462b00f16', 'f787a7b9e89a63af', '68d1dd6bfbeae93a', '22f8e11618ae7ac4', '774aabd4a7ab16ab', '8620949856f81764', '12798a048363c441', '4623228e3d0778a8', 'bd0a10df9aa4e38d', '51fb319467ae954a', '5d03789917478f65', '0be6e534da38b907', '1c9c1d4f5899fd1c', 'c98155980ed5738d', 'a8020802c4bea165', '1afaa49d1117879c', 'ac0cfd625c3d1974', 'be11889afc60aacd', 'd6dee8e56c7a74a5', '1e86f14f16289ae8', '33ea2135c9998ca1', '79d4576124777797', 'c20f8782413344fe', '79dce062c4cf2625', '8152a14f454a5125', '7ee6c15beeba3eec', '3624650aededfe35', '16d72743790ea00a', '19fb10721229ec81', '85b1aceb6a41611d', 'df524520064efa06', '677aaa8b5d222d66', '130f0e9ac2271108', '2ecc0acd207a9858', 'ac7803cb23f3a28b', 'ea48f53d74c4a58e', '431e7d5c8a69c486', '11890aabe8c8ad06', 'ae09a61387f214ac', '7c33bd4baa305554', '334bb3febce49b68', 'c70ad3c513c63193', '54953487341b542f', '7fa576e8e070fc2c', '90401c5f98a95bf9', '0d25ed973d7b8ce2', 'cb09fd1fb002d3bd', '7ba0863e1d849e2b', '4ca22a556600c773', '3f6df49cc12ce3c1', '738d31dc605ee312', 'f27deaf2e887bb19', '8860b0694e63a65a', '962ef558bdabe56a', '7e307f71209b9b8f', 'e0bfc7f6cdbd8364', '8c321f42cd134833', 'a00500f82c987528', '8b7ddfa8d0798372', 'f36a6dfdbfde1193', 'dede80d5373d22c3', '43838810d69fd1dc', '3a02c5df95fd2717', 'a4a856f899bf833f', '67f4ceaabafdd1f8', '54e1be0a1158779b', 'ce0b65bf10ef9877', '4ac045f452e94bbc', '18fe7d967f50b061', 'b8970343b2d85018', '64cf7bb3889695bc', 'cb70b27c29edf774', 'ae2078cc0e7ed6e3', '02fb0c044be718b6', '7c3b0e8c25ad3b7d', '18ac41058e1f50a7', '6e21b9e1da39f220', 'b02d9a63e8e30a0a', '790fcda30f14c748', '50ee1335c25bff43', '8df5d284dfedee37', '71532e198c0eb9ab', '832cc61cf7be441a', '8431dfd16e0e5d33', 'ce26f2f74f5ff23b', '1e36d36389caa05e', '9063d6730be1105b', 'e638bda968cf9bbe', 'c771048bd8a021fa', 'dad72421848e3455', '3823689faf46ef08', 'daebe25de0e823e2', '042187f1df14f055', '4b02678ef80956f9', '453c53fbfe998478', '8e95702144b82c60', 'c489e75b4e054027', '3cd217b9feb7a7a9', '0321e049527f5402', 'f99ba6ac4c9ceaac', 'afa2b9809ce8bb0b', '82ce0815e5fbe2bc', 'dc0dca97eb94ade6', '29168abcf745e0af', '5f3e461c04f38e68', '0903890e45d25671', '4472aad46e94e05b', '61ab4ec37a9108b4', 'c3ee971e1827e088', 'ebc32b8dfc648fd1', 'a062d075d09d0c81', 'c0603bad959a4b46', 'a5527848fc0c9b83', 'e862cb609b417dff', 'e45f36a8b694ab45', '9b24fe28320004df', '3642811b09588ef4', 'd788dc4fef59972f', '0a3a96442083b501', '227c1734a268afe3', '290e5437196ae2ba', 'ef952aacba3f4f69', '6ccfb906c6257385', 'b1e139e09a1e5be6', '6f3d0afd812024e4', '3678d3ac8ec5fe3e', '468f22a9a2b46aab', '7975967539fdfd49', '3a3560dc389ae61e', '6c99f906b7b4a36e', '2963c8e15bab0750', 'ce24f1b554416568', '1474da2902df8dfd', 'd4cb5b4555abd17c', '4093dd219148d1ea', '523ffe88f02e2717', '9a859ef4595b5d94', 'fba7de89b355e9d7', 'cbe4a7e7ea74bd42', 'b40dade54c85679d', '3d02faa4c31f0f0e', 'e46a08f72b35ebf6', '8a4185b3c3d5c92f', '9f38656156f1e1ed', '065d806b601df2e5', '382c64ead6812c9e', 'db0eb3157eb4a9a8', 'bad5f2966684a8fc', '99af45facd4bb152', '6cbd9df2bcabd086', 'f0993e0f9e9c3f7f', 'faf9230d5e7020c7', '8cd41f2333f1277b', '73d2955f527964c5', '283480d1dc743465', '940dbc679f722e6b', '759c7a9d40dc74a0', 'c80d7af3e01cf9b0', '4831360b9ff3911b', '10624b8841b04184', 'b93412265eedd34e', '659bdbee52978d0a', 'bab1cb0366d793a9', '3d6fc272f1588226', '93b07778dae82b37', '52afa557f6939375', '7a94983330b73a38', '93c1c1ad49228f5b', '05ad91c65a2dea33', '581b9be28d61520b', '798ca01a3b55be4e', 'c435d385a46fa6c1', '39b884e6fe73365e', '826a84511f118d67', '94ce8ff134e42dfe', 'a4594eaa7c79e0ab', '2f5bb7e4d9863113', 'aeeaf37ed6f1c0f8', '65c19736a87c9488', '2e6bd6cd9cbc783d', 'dcc129a42217657f', 'fff0a2971827d4c9', 'ee17ca08aa888c93', 'ad004364a1267202', '5a1858dc3a625f09', 'c872bc0fbf8a5350', 'c912a9b717f8ac80', '751f6d26cd92a88e', 'a1c66600137b590b', 'ddde94adae44c793', '3602893cc5fb9465', '53fbbac7f4883a94', 'dc93e87d60d1e284', 'bc365eda830fbb94', '5c0331dabeba9a60', '31a4f7c4765f42b9', '1816fcc720964226', '5af18278f263302e', 'e8408c7fb70f04ef', 'e6e00de18a92af6e', '5ac1d7c694ea9384', '5720bbd6e17f27ca', 'c0bfda4838c0a0cd', '8891314377c5c1ce', 27, '2a2ed5c026b5bc48', 1, 'c92e7b76eed97a04', 1, 'cab996739436a28c', 1, '051b2091d03357a3', 1, '18f95d4c5c8b3d6d', '664c7f4f1b4d68b0', 1, '15b1e5b3a106b873', 1, '25b4b0ce175ca086', 1, '53c20718b90a909d', 1, 'ae6c7b25d0282cc9', 'b4461d12225a6c64', '3c572019f2ee97c4', '42f349edbae36833', '0e05cf63c06ad4f3', 'af450ff674bc724a', 'f48c5b768b6d4e16', 'c2678c86dfca1b17', 'c6b1c2bd370e3d15', 'aa7e82db85741ca1', 'ee83d46e93993392', '8fa7b0500890b4b7', 'bd70197c26dfc8f9', '607ae95a948a095b', '19c4a4058799ec55', 'c5a9fc21e5df09c0', 'b84aab0833ab7396', '76c6586a1d825cbb', 'f59bf07bafbce6c0', 'bbf5cd196fe639a6', '3e1079e27b02dffb', 'a76cec86758c2bb9', 'b5616951a3210279', '4895fc655659c663', '10b487b086474df6', '5af2a8975c049bde', 'bfdefe754304b65e', '45b88c628f6ddc35', '02140517e93e594e', 'f90b46d491978b57', '8af75603e59942a8', 'f8c3ff97b4a6bbfe', '0222dbce5a80eb73', '696fc14aaddf5091', '002eab000050eaf6', '9ce095f19a33943d', '80509f3e3a14154b', 'a6dec4bf6abd9c76', '30f9b73ada41ced5', '8be437bb6bd7f13c', '4dd52d0a7130f1da', '21dd6c4a48b349bf', '4d075b28be81b1ab', '2015abdd10265d21', '2e57d1809f4e64da', '7c68260b225bc190'];
    var zobristTable = [];

    for (var i = 0; i < table.length; ++i) {
        if (typeof table[i] === "number") {
            zobristTable.length += table[i];
        }
        else {
            var nums = [];

            for (var j = 0; j < 16; ++j) {
                nums.push(parseInt(table[i][j], 16));
            }

            zobristTable.push(nums);
        }
    }

    return zobristTable;
})();

// Zobrist 棋子编号
vschess.ZobristPiece = { R: 4, N: 3, B: 2, A: 1, K: 0, C: 5, P: 6, r: 11, n: 10, b: 9, a: 8, k: 7, c: 12, p: 13 };

// Zobrist 局面码-红方 a0ce2af90c452f58
vschess.ZobristRed = [10, 0, 12, 14, 2, 10, 15, 9, 0, 12, 4, 5, 2, 15, 5, 8];

// Zobrist 局面码-黑方 0000000000000000
vschess.ZobristBlack = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 计算 ZobristKey
vschess.ZobristKey = function (fen) {
    var fenArray = vschess.fenToArray(fen);
    var zobristKey = vschess.fenIsB(fen) ? vschess.ZobristBlack.slice(0) : vschess.ZobristRed.slice(0);

    for (var i = 0; i < 90; ++i) {
        if (fenArray[i] === '*') {
            continue;
        }

        var K = vschess.ZobristPiece[fenArray[i]] * 90 + i;

        for (var j = 0; j < 16; ++j) {
            zobristKey[j] ^= vschess.ZobristTable[K][j];
        }
    }

    for (var i = 0; i < 16; ++i) {
        zobristKey[i] = zobristKey[i].toString(16);
    }

    return zobristKey.join('');
};

// 字符串删除两端空白字符
vschess.trim = function(str){
	return str.replace(/(^\s*)|(\s*$)/g, "");
};

// 程序转换为字符串信息
vschess.toString = function(){
	return "\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V" + vschess.version + " https://www.xiaxiangqi.com/vschess/ Copyright \u00a9 2009-2023 Margin.Top \u7248\u6743\u6240\u6709";
};

// 导出到 module
module.exports = vschess;