// 创建棋盘选项区域
fn.createConfig = function(){
	var _this = this;
    this.configTitle = $('<div class="vschess-tab-title vschess-tab-title-config">' + this.options.tagName.config + '</div>');
	this.configArea  = $('<div class="vschess-tab-body vschess-tab-body-config"></div>');
	this.tabArea.children(".vschess-tab-title-config, .vschess-tab-body-config").remove();
	this.tabArea.append(this.configTitle);
	this.tabArea.append(this.configArea );
	this.configTitle.bind(this.options.click, function(){ _this.showTab("config"); });
	this.createConfigSwitch();
	return this;
};

// 创建棋盘选项开关列表
fn.createConfigSwitch = function(){
	var _this = this;
	this.configSwitchList = $('<ul class="vschess-tab-body-config-list"></ul>');
	this.configArea.append(this.configSwitchList);
	this.configItem   = {};
	this.configItemM  = {};
	this.configValue  = {};
	this.configRange  = {};
	this.configSelect = {};

	this.addConfigItem("turnX", "左右翻转", "boolean", true, "", function(){
		_this.setTurn(_this.configValue["turnY"] * 2 + _this.configValue["turnX"], 1);
	});

	this.addConfigItem("turnY", "上下翻转", "boolean", true, "", function(){
		_this.setTurn(_this.configValue["turnY"] * 2 + _this.configValue["turnX"], 1);
	});

	this.addConfigItem("moveTips", "走子提示", "boolean", true, "", function(){
		_this._.moveTips = _this.configValue["moveTips"];
	});

	this.addConfigItem("sound", "走子音效", "boolean", true, "", function(){
		_this._.sound = _this.configValue["sound"];
	});

	this.addConfigItem("speakMove", "着法朗读", "boolean", false, "", function(){
		_this._.speakMove = _this.configValue["speakMove"];
	});

	this.addConfigItem("saveTips", "保存提示", "boolean", true, "", function(){
		_this._.saveTips = _this.configValue["saveTips"];
	});

	this.addConfigItem("pieceRotate", "棋子旋转", "boolean", true, "", function(){
		_this._.pieceRotate = _this.configValue["pieceRotate"];
		_this.setBoardByStep();
	});

	this.addConfigItem("banRepeatLongThreat", "禁止长打", "boolean", true, "", function(){
		_this._.banRepeatLongThreat = _this.configValue["banRepeatLongThreat"];
	});

	this.addConfigItem("banRepeatLongKill", "禁止一将一杀" , "boolean", true, "", function(){
		_this._.banRepeatLongKill = _this.configValue["banRepeatLongKill"];
		_this.repeatLongKillMoveList = _this._.banRepeatLongKill ? _this.getRepeatLongKillMove() : [];
	});

	this.addConfigItem("illegalTips", "违例提示", "boolean", true, "", function(){
		_this._.illegalTips = _this.configValue["illegalTips"];
	});

	this.addConfigItem("playGap", "播放间隔", "select" , 5, "0.1秒:1,0.2秒:2,0.5秒:5,1秒:10,2秒:20,5秒:50", function(){
		_this._.playGap = _this.configValue["playGap"];
	});

	this.addConfigItem("volume", "音效音量", "range", 100, "0,100", function(){
		_this._.volume = _this.configValue["volume"];
	});

	return this;
};

// 添加棋盘选项开关
fn.addConfigItem = function(name, text, type, defaultValue, param, action){
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
			this.configItemM [name].append('<option value="' + _value + '">' + _name + '</option>');
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
fn.setConfigItemValue = function(name, value){
	if (this.configRange[name]) {
		this.configValue[name] = this.configRange[name].min + (this.configRange[name].max - this.configRange[name].min) * value / 100;
		this.configRange[name].bar.css({ left: value });
	}
	else if (this.configSelect[name]) {
		this.configValue[name] = value;

		for (var i = 0; i < this.configSelect[name].item.length; ++i) {
			if ("" + this.configSelect[name].item[i].value === "" + value) {
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
