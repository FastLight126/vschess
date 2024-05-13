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

# 纯真IP库
我正在使用免费的纯真社区版IP库。纯真(CZ88.NET)自2005年起一直为广大社区用户提供社区版IP地址库，只要获得纯真的授权就能免费使用，并不断获取后续更新的版本。
纯真除了免费的社区版IP库外，还提供数据更加准确、服务更加周全的商业版IP地址查询数据。纯真围绕IP地址，基于 网络空间拓扑测绘 + 移动位置大数据 方案，对IP地址定位、IP网络风险、IP使用场景、IP网络类型、秒拨侦测、VPN侦测、代理侦测、爬虫侦测、真人度等均有近20年丰富的数据沉淀。
