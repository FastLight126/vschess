# 微思象棋播放器
这是一个专业的中国象棋 Web 界面，支持多种棋谱格式，可以打谱、对弈、拆解残局。<br />
提供丰富的 API 接口，可以实现在线对弈、在线拆解、在线打谱等多种功能。<br />
新项目刚刚上线，开发文档目前已编写了一部分，完整文档敬请期待。<br />
官方网站：https://www.xiaxiangqi.com/vschess/

# 目录结构
index.html 普通demo<br />
dhtmlxq.html ajax加载方式demo<br />
dhtmlxq.txt ajax加载方式用到的棋谱文件<br />
vschess/develop/module 所有模块文件都在这里<br />
vschess/vschess.js.php 自动打包程序，可以将 module 下的所有模块自动打包生成最终的 js 文件<br />
vschess/vschess.js 自动打包生成完整程序<br />
vschess/vschess.min.js 自动打包生成的完整程序压缩版（因为集成了GBK转码UTF-8映射表，所以并没有压缩多少）<br />
vschess/global.css 全局css<br />
vschess/layout 布局（皮肤）文件夹<br />
vschess/sound 音效文件夹<br />
vschess/style 棋子、棋盘文件夹<br />

# 相关网站
象棋巫师：https://www.xqbase.com 程序内部使用了由象棋巫师提供的 ECCO 开局分类编号算法，在此表示衷心感谢。
