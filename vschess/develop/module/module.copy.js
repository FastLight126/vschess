// 创建复制用文本框
fn.createCopyTextarea = function(){
	this.copyTextarea = $('<textarea class="vschess-copy" readonly="readonly"></textarea>').appendTo(this.DOM);
	return this;
};

// 复制字符串
fn.copy = function(str, success){
	typeof success !== "function" && (success = function(){});

	if (document.execCommand && document.queryCommandSupported && document.queryCommandSupported('copy')) {
		this.copyTextarea.val(str);
		this.copyTextarea[0].select();
		this.copyTextarea[0].setSelectionRange(0, str.length);

		if (document.execCommand("copy")) {
			success();
		}
		else {
			prompt("请按 Ctrl+C 复制：", str);
		}
	}
	else if (window.clipboardData) {
		if (window.clipboardData.setData("Text", str)) {
			success();
		}
		else {
			prompt("请按 Ctrl+C 复制：", str);
		}
	}
	else {
		prompt("请按 Ctrl+C 复制：", str);
	}

	return this;
};

// 创建信息提示框
fn.createMessageBox = function(){
	this.messageBox = $('<div class="vschess-message-box"></div>');
	this.DOM.append(this.messageBox);
	return this;
};

// 显示提示框
fn.showMessage = function(msg){
	var _this = this;
	this.messageBox.text(msg).addClass("vschess-message-box-show");
	setTimeout(function(){ _this.messageBox.removeClass("vschess-message-box-show"); }, 1500);
	return this;
};
