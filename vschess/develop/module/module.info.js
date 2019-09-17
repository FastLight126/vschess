// 创建棋局信息区域
fn.createInfo = function(){
	var _this = this;
    this.infoTitle = $('<div class="vschess-tab-title vschess-tab-title-info">' + this.options.tagName.info + '</div>');
	this.infoArea  = $('<div class="vschess-tab-body vschess-tab-body-info"></div>');
	this.tabArea.children(".vschess-tab-title-info, .vschess-tab-body-info").remove();
	this.tabArea.append(this.infoTitle);
	this.tabArea.append(this.infoArea );
	this.infoTitle.bind(this.options.click, function(){ _this.showTab("info"); });
	this.createInfoList();
	return this;
};

// 创建棋局信息列表
fn.createInfoList = function(){
	var _this = this;
	this.chessInfo = vs.dataToInfo(this.chessData, this.options.parseType);
	this.setChessTitle(this.chessInfo && this.chessInfo.title || "中国象棋");
	this.infoList = $('<ul class="vschess-tab-body-info-list"></ul>');
	this.infoArea.append(this.infoList);
	this.insertInfoByCurrent();
	this.infoEdit  = $('<button type="button" class="vschess-button vschess-tab-body-info-edit" >编 辑</button>');
	this.infoEmpty = $('<button type="button" class="vschess-button vschess-tab-body-info-empty">清 空</button>');
	this.infoArea.append(this.infoEdit );
	this.infoArea.append(this.infoEmpty);
	this.infoEdit.bind(this.options.click, function(){ _this.showInfoEditor(); });

	this.infoEmpty.bind(this.options.click, function(){
		if (!confirm("确定要清空所有信息吗？")) {
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
fn.insertInfoByCurrent = function(){
	this.infoItem = {};
	this.infoList.empty();

	for (var i in this.chessInfo) {
		this.infoItem[i] = $('<li class="vschess-tab-body-info-item">' + vs.info.name[i] + '：' + vs.showText(this.chessInfo[i], i) + '</li>');
		this.infoList.append(this.infoItem[i]);
	}

	return this;
};

// 创建棋局信息编辑器
fn.createInfoEditor = function(){
	if (this._.infoEditorCreated) {
		return this;
	}

	var _this = this;
	this._.infoEditorCreated = true;
	this.infoEditorArea = $('<div class="vschess-info-editor-area"></div>');
	this.infoEditorList = $('<ul class="vschess-info-editor-list"></ul>');
	this.infoEditorArea.append(this.infoEditorList);
	this.infoEditorItem = {};
	this.infoEditorItemName  = {};
	this.infoEditorItemValue = {};
	this.infoEditorItemAuto  = {};
	this.DOM.append(this.infoEditorArea);

	for (var i in vs.info.name) {
		this.infoEditorItem     [i] = $('<li class="vschess-info-editor-item vschess-info-editor-item-' + i + '"></li>');
		this.infoEditorItemName [i] = $('<div class="vschess-info-editor-item-name vschess-info-editor-item-name-' + i + '">' + vs.info.name[i] + '：</div></li>');
		this.infoEditorItemValue[i] = $('<input type="' + (i === "date" ? "date" : "text") + '" class="vschess-info-editor-item-value vschess-info-editor-item-value-' + i + '" />');
		this.infoEditorItem     [i].append(this.infoEditorItemName [i]);
		this.infoEditorItem     [i].append(this.infoEditorItemValue[i]);
		this.infoEditorList        .append(this.infoEditorItem     [i]);

		if (i === "result") {
			var radio_name = "vschess-info-editor-item-value-result-radio-name-" + vs.guid();
			var r_randomId = "vschess-info-editor-item-value-result-label-id-r-" + vs.guid();
			var b_randomId = "vschess-info-editor-item-value-result-label-id-b-" + vs.guid();
			var d_randomId = "vschess-info-editor-item-value-result-label-id-d-" + vs.guid();
			var u_randomId = "vschess-info-editor-item-value-result-label-id-u-" + vs.guid();

			this.infoEditorItemValueResult = {
				r_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-r" for="' + r_randomId + '">红胜</label>'),
				b_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-b" for="' + b_randomId + '">黑胜</label>'),
				d_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-d" for="' + d_randomId + '">和棋</label>'),
				u_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-u" for="' + u_randomId + '">未知</label>'),
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

		if (~vs.autoInfo.indexOf(i)) {
			this.infoEditorItemAuto[i] = $('<button type="button" class="vschess-button vschess-info-editor-item-auto vschess-info-editor-item-auto-' + i + '" alt="根据当前分支自动识别' + vs.info.name[i] + '" title="根据当前分支自动识别' + vs.info.name[i] + '">识 别</button>');
			this.infoEditorItem    [i].append(this.infoEditorItemAuto[i]);
		}
	}

	this.setInfoEditorItemValueResult(this.infoEditorItemValue.result.val());
	this.infoEditorOK     = $('<button type="button" class="vschess-button vschess-info-editor-ok"    >确 定</button>');
	this.infoEditorEmpty  = $('<button type="button" class="vschess-button vschess-info-editor-empty" >清 空</button>');
	this.infoEditorCancel = $('<button type="button" class="vschess-button vschess-info-editor-cancel">取 消</button>');

	this.infoEditorOK.bind(this.options.click, function(){
		_this.chessInfo = _this.getInfoFromEditor();
		_this.setChessTitle(_this.chessInfo && _this.chessInfo.title || "中国象棋");
		_this.insertInfoByCurrent();
		_this.hideInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
	});

	this.infoEditorEmpty.bind(this.options.click, function(){
		if (!confirm("确定要清空所有信息吗？")) {
			return false;
		}

		for (var i in vs.info.name) {
			_this.infoEditorItemValue[i].val("");
		}
	});

	this.infoEditorCancel.bind(this.options.click, function(){ _this.hideInfoEditor(); });
	this.infoEditorArea.append(this.infoEditorOK    );
	this.infoEditorArea.append(this.infoEditorEmpty );
	this.infoEditorArea.append(this.infoEditorCancel);
	this.infoEditorItemAuto.ecco          .bind(this.options.click, function(){ _this.infoEditorItemValue.ecco     .val(vs.WXF2ECCO(_this.moveNameList.WXF).ecco     ); });
	this.infoEditorItemAuto.open          .bind(this.options.click, function(){ _this.infoEditorItemValue.open     .val(vs.WXF2ECCO(_this.moveNameList.WXF).opening  ); });
	this.infoEditorItemAuto.variation     .bind(this.options.click, function(){ _this.infoEditorItemValue.variation.val(vs.WXF2ECCO(_this.moveNameList.WXF).variation); });
	this.infoEditorItemValueResult.r_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("1-0"    ); });
	this.infoEditorItemValueResult.b_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("0-1"    ); });
	this.infoEditorItemValueResult.d_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("1/2-1/2"); });
	this.infoEditorItemValueResult.u_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("*"      ); });

	this.infoEditorItemAuto.result.bind(this.options.click, function(){
		var result = _this.getAutoResultByCurrent();
		_this.infoEditorItemValue.result.val(result);
		_this.setInfoEditorItemValueResult(result);
	});

	return this.refreshInfoEditor();
};

// 刷新棋局信息编辑器
fn.refreshInfoEditor = function(){
	this.createInfoEditor();

	for (var i in vs.info.name) {
		if (i === "result") {
			var result = vs.dataText(this.chessInfo[i] || "", i);
			this.infoEditorItemValue.result.val(result);
			this.setInfoEditorItemValueResult(result);
		}
		else if (i === "date") {
			this.infoEditorItemValue[i].val(vs.dateFormat(this.chessInfo[i] || "", i));
		}
		else {
			this.infoEditorItemValue[i].val(vs.dataText(this.chessInfo[i] || "", i));
		}
	}

	return this.setChessTitle(this.chessInfo && this.chessInfo.title || "中国象棋");
};

// 根据结果设置选择结果单选按钮
fn.setInfoEditorItemValueResult = function(result){
	this.createInfoEditor();

	switch (result) {
		case     "1-0": this.infoEditorItemValueResult.r_radio.attr("checked", "checked"); break;
		case     "0-1": this.infoEditorItemValueResult.b_radio.attr("checked", "checked"); break;
		case "1/2-1/2": this.infoEditorItemValueResult.d_radio.attr("checked", "checked"); break;
		default       : this.infoEditorItemValueResult.u_radio.attr("checked", "checked"); break;
	}

	return this;
};

// 设置棋盘标题
fn.setChessTitle = function(title){
	this.title.text(title);
	return this;
};

// 显示棋局信息编辑器
fn.showInfoEditor = function(){
	this.createInfoEditor();
	this.infoEditorArea.addClass("vschess-info-editor-show");
	return this;
};

// 隐藏棋局信息编辑器
fn.hideInfoEditor = function(){
	if (!this._.infoEditorCreated) {
		return this;
	}

	this.infoEditorArea.removeClass("vschess-info-editor-show");
	return this;
};

// 从编辑器中获取最新棋谱信息数据
fn.getInfoFromEditor = function(){
	var newInfo = {};

	for (var i in vs.info.name) {
		var value = this.infoEditorItemValue[i].val();
		value && (newInfo[i] = value);
	}

	return newInfo;
};

// 获取当前对弈结果
fn.getResultByCurrent = function(){
	if (this._.editCreated) {
		return this.infoEditorItemValue.result.val() || this.getAutoResultByCurrent();
	}

	return this.getAutoResultByCurrent();
};

// 自动识别当前分支的对弈结果
fn.getAutoResultByCurrent = function(){
	var legalLength = this.legalList ? this.legalList.length : 0;
	var repeatLongThreatLength = this.repeatLongThreatMoveList ? this.repeatLongThreatMoveList.length : 0;
	var lastSituation = this.situationList[this.lastSituationIndex()];

	if (this.getBanRepeatLongThreat() && legalLength <= repeatLongThreatLength) {
		return lastSituation[0] === 1 ? "0-1" : "1-0";
	}

	return !vs.hasLegalMove(lastSituation) ? lastSituation[0] === 1 ? "0-1" : "1-0" : "*";
};
