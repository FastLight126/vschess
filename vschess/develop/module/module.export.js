// 创建导出棋谱区域
fn.createExport = function(){
	var _this = this;
    this.exportTitle = $('<div class="vschess-tab-title vschess-tab-title-export">' + this.options.tagName.export + '</div>');
	this.exportArea     = $('<form method="post" action="' + this.options.cloudApi.saveBook + '" class="vschess-tab-body vschess-tab-body-export"></form>');
	this.exportTextarea = $('<textarea class="vschess-tab-body-export-textarea" readonly="readonly" name="data"></textarea>').appendTo(this.exportArea);
	this.exportFormat   = $('<select class="vschess-tab-body-export-format"   name="format"></select>').appendTo(this.exportArea);
	this.exportFilename = $('<input  class="vschess-tab-body-export-filename" name="filename" type="hidden" />').appendTo(this.exportArea);
	this.exportGenerate = $('<button type="button" class="vschess-button vschess-tab-body-export-generate">生成棋谱</button>').appendTo(this.exportArea);
	this.exportCopy     = $('<button type="button" class="vschess-button vschess-tab-body-export-copy     vschess-tab-body-export-current">复制</button>').appendTo(this.exportArea);
	this.exportDownload = $('<button type="button" class="vschess-button vschess-tab-body-export-download vschess-tab-body-export-current">保存</button>').appendTo(this.exportArea);
	this.exportData     = {};
	this.tabArea.children(".vschess-tab-title-export, .vschess-tab-body-export").remove();
	this.tabArea.append(this.exportTitle);
	this.tabArea.append(this.exportArea );
	this.exportTitle.bind(this.options.click, function(){ _this.showTab("export"); });
	this.createExportList();
	return this;
};

// 创建导出格式列表
fn.createExportList = function(){
	var _this = this, generating = false;
	this.exportFormatOptions = {};

	for (var i in vs.exportFormatList) {
		this.exportFormatOptions[i] = $('<option value="' + i + '">' + vs.exportFormatList[i] + '</option>');
		this.exportFormatOptions[i].addClass("vschess-tab-body-export-format-options");
		this.exportFormatOptions[i].addClass("vschess-tab-body-export-format-options-" + i);
		this.exportFormat.append(this.exportFormatOptions[i]);
	}

	this.exportFormat.bind("change", function(){
		if (_this.getNodeLength() >= vs.bigBookCritical && (this.value === "PengFei" || this.value === "DhtmlXQ")) {
			_this.exportDownload.removeClass("vschess-tab-body-export-current");
			_this.exportCopy    .removeClass("vschess-tab-body-export-current");
			_this.exportGenerate.   addClass("vschess-tab-body-export-current");
			_this.setExportFormat(this.value, "");
		}
		else {
			_this.exportGenerate.removeClass("vschess-tab-body-export-current");
			_this.exportCopy    .   addClass("vschess-tab-body-export-current");
			_this.exportDownload.   addClass("vschess-tab-body-export-current");
			_this.setExportFormat(this.value);
		}
	});

	this.exportGenerate.bind(this.options.click, function(){
		if (generating) {
			return false;
		}

		generating = true;
		_this.exportTextarea.val("正在生成棋谱，请稍候。");

		setTimeout(function(){
			switch (_this.exportFormat.val()) {
				case "PengFei": _this.rebuildExportPengFei(); _this.setExportFormat("PengFei", true); break;
				default       : _this.rebuildExportDhtmlXQ(); _this.setExportFormat("DhtmlXQ", true); break;
			}

			_this.exportGenerate.removeClass("vschess-tab-body-export-current");
			_this.exportDownload.   addClass("vschess-tab-body-export-current");
			_this.exportCopy    .   addClass("vschess-tab-body-export-current");
			generating = false;
		}, vs.threadTimeout);
	});

	this.exportCopy.bind(this.options.click, function(){
		_this.copy(_this.exportTextarea.val(), function(){ _this.showMessage("棋谱复制成功，您可以直接粘贴使用！"); });
	});

	this.exportDownload.bind(this.options.click, function(){
		if (vs.localDownload) {
			var UTF8Text = _this.exportTextarea.val().replace(/\n/g, "\r\n").replace(/\r\r/g, "\r");
			var GBKArray = new Uint8Array(vs.iconv2GBK(UTF8Text));
			var exportFormat = _this.exportFormat.val();
			var fileName = _this.chessInfo.title || "中国象棋";

			if (exportFormat.indexOf("PGN") === 0) {
				_this.localDownload(fileName + ".pgn", GBKArray, { type: "application/octet-stream" });
			}
			else if (exportFormat.indexOf("QQ") === 0) {
				_this.localDownload(fileName + ".che", GBKArray, { type: "application/octet-stream" });
			}
			else if (exportFormat === "PengFei") {
				_this.localDownload(fileName + ".pfc", UTF8Text, { type: "application/octet-stream" });
			}
			else {
				_this.localDownload(fileName + ".txt", UTF8Text, { type: "text/plain" });
			}
		}
		else {
			_this.exportArea.trigger("submit");
		}
	});

	return this;
};

// 取得当前导出格式
fn.getExportFormat = function(){
	return this._.exportFormat || "DhtmlXQ";
};

// 设置当前导出格式
fn.setExportFormat = function(format, force){
	format = format || this.getExportFormat();
	this._.exportFormat = vs.exportFormatList[format] ? format : this.getExportFormat();
	this.exportTextarea.removeClass().addClass("vschess-tab-body-export-textarea vschess-tab-body-export-textarea-format-" + format);
	this.exportFilename.val(this.chessInfo.title || "中国象棋");

	if (format === "TextBoard") {
		this.exportGenerate.removeClass("vschess-tab-body-export-current");
		this.exportCopy    .   addClass("vschess-tab-body-export-current");
		this.exportDownload.   addClass("vschess-tab-body-export-current");
		this.exportTextarea.val(vs.textBoard(this.getCurrentFen(), this.options));
	}
    else if (format === "ChessDB") {
        this.exportGenerate.removeClass("vschess-tab-body-export-current");
        this.exportCopy    .   addClass("vschess-tab-body-export-current");
        this.exportDownload.   addClass("vschess-tab-body-export-current");

        // 从开局开始
        var list = this.getMoveList();
        var fen = list.shift().split(" ").slice(0, 2).join(" ");
        var longData = list.length ? fen + " moves " + list.join(" ") : fen;

        // 从吃子开始
        var list = this.getUCCIList();
        var fen = list.shift().split(" ").slice(0, 2).join(" ");
        var shortData = list.length ? fen + " moves " + list.join(" ") : fen;

        this.exportTextarea.val("从开局开始：\n" + longData + "\n\n从吃子开始：\n" + shortData);
    }
	else if ((format === "PengFei" || format === "DhtmlXQ") && !force && this.getNodeLength() >= vs.bigBookCritical) {
		// 大棋谱需要加参数才同步
		this.exportCopy    .removeClass("vschess-tab-body-export-current");
		this.exportDownload.removeClass("vschess-tab-body-export-current");
		this.exportGenerate.   addClass("vschess-tab-body-export-current");
		this.exportTextarea.val("请点击“生成”按钮生成棋谱。");
    }
	else {
		this.exportGenerate.removeClass("vschess-tab-body-export-current");
		this.exportCopy    .   addClass("vschess-tab-body-export-current");
		this.exportDownload.   addClass("vschess-tab-body-export-current");
		this.exportTextarea.val(this.exportData[this.getExportFormat() + (this.getTurnForMove() ? "M" : "")]);
	}

	return this;
};

// 重建所有棋谱
fn.rebuildExportAll = function(all){
	this.rebuildExportPGN();
	this.rebuildExportText();
	this.rebuildExportQQ();
    this.rebuildExportDHJHtmlXQ();

	// 大棋谱生成东萍 DhtmlXQ 格式和鹏飞 PFC 格式比较拖性能
	(this.getNodeLength() < vs.bigBookCritical || all) && this.rebuildExportPengFei();
	(this.getNodeLength() < vs.bigBookCritical || all) && this.rebuildExportDhtmlXQ();

	this.hideExportFormatIfNeedStart();
	return this;
};

// 重建 PGN 格式棋谱
fn.rebuildExportPGN = function(){
	this.rebuildExportPGN_Chinese();
	this.rebuildExportPGN_WXF    ();
	this.rebuildExportPGN_ICCS   ();
	return this;
};

// 重建中文 PGN 格式棋谱
fn.rebuildExportPGN_Chinese = function(){
	var moveList  = this.moveNameList.Chinese .slice(0);
	var moveListM = this.moveNameList.ChineseM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_Chinese  = vs.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_ChineseM = vs.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 WXF PGN 格式棋谱
fn.rebuildExportPGN_WXF = function(){
	var moveList  = this.moveNameList.WXF .slice(0);
	var moveListM = this.moveNameList.WXFM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_WXF  = vs.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_WXFM = vs.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 ICCS PGN 格式棋谱
fn.rebuildExportPGN_ICCS = function(){
	var moveList  = this.moveNameList.ICCS .slice(0);
	var moveListM = this.moveNameList.ICCSM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_ICCS  = vs.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_ICCSM = vs.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建文本 TXT 格式棋谱
fn.rebuildExportText = function(){
	var moveList  = this.moveNameList.Chinese .slice(0);
	var moveListM = this.moveNameList.ChineseM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.Text  = vs.moveListToText(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.TextM = vs.moveListToText(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 QQ 象棋 CHE 格式棋谱
fn.rebuildExportQQ = function(){
	var moveList = this.moveList.slice(1);
	this.exportData.QQ  = vs.moveListToData_QQ(moveList      );
	this.exportData.QQM = vs.moveListToData_QQ(moveList, true);
	return this;
};

// 重建鹏飞 PFC 格式棋谱
fn.rebuildExportPengFei = function(){
	this.exportData.PengFei  = vs.nodeToData_PengFei(this.node, this.chessInfo, this.getResultByCurrent());
	this.exportData.PengFeiM = vs.turn_PengFei(this.exportData.PengFei);
	return this;
};

// 重建东萍 DhtmlXQ 格式棋谱
fn.rebuildExportDhtmlXQ = function(){
	this.exportData.DhtmlXQ  = vs.nodeToData_DhtmlXQ(this.node, this.chessInfo);
	this.exportData.DhtmlXQM = vs.turn_DhtmlXQ(this.exportData.DhtmlXQ);
	return this;
};

// 重建广东象棋网 DHJHtmlXQ 格式棋谱
fn.rebuildExportDHJHtmlXQ = function(){
	this.exportData.DHJHtmlXQ  = vs.nodeToData_DHJHtmlXQ(this.node, this.chessInfo);
	this.exportData.DHJHtmlXQM = vs.turn_DHJHtmlXQ(this.exportData.DHJHtmlXQ);
	return this;
};

// 非标准起始局面隐藏掉部分不支持的导出格式
fn.hideExportFormatIfNeedStart = function(){
	if (this.getFenByStep(0).split(" ", 2).join(" ") === vschess.defaultFen.split(" ", 2).join(" ")) {
		for (var i in vs.exportFormatList) {
			this.exportFormatOptions[i][0].style.display = "block";
		}
	}
	else {
		for (var i = 0; i < vs.exportFormatListIfNeedStart.length; ++i) {
			this.exportFormatOptions[vs.exportFormatListIfNeedStart[i]][0].style.display = "none";
		}
	}

	return this;
};
