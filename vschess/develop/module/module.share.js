// 创建棋谱分享区域
fn.createShare = function(){
	var _this = this;
	this.shareTitle    = $('<div class="vschess-tab-title vschess-tab-title-share">棋谱分享</div>');
	this.shareArea     = $('<div class="vschess-tab-body vschess-tab-body-share"></div>');
	this.tabArea.children(".vschess-tab-title-share, .vschess-tab-body-share").remove();
	this.tabArea.append(this.shareTitle);
	this.tabArea.append(this.shareArea );
	this.shareTitle.bind(this.options.click, function(){ _this.showTab("share"); });
	this.createShareGenerateButton();
	this.createShareUBB();
	this.createGifGenerateButton();
	this.createGifArea();
	return this;
};

// 创建生成分享信息按钮
fn.createShareGenerateButton = function(){
	var _this = this;
	this.shareGenerateButton = $('<input type="button" class="vschess-button vschess-tab-body-share-generate-button" value="生成分享代码" />');
	this.shareGenerateButton.appendTo(this.shareArea);

	this.shareGenerateButton.bind(this.options.click, function(){
		if (_this.options.cloudApi && _this.options.cloudApi.saveBookForShare) {
			_this.shareUBBTextInput.val("正在生成，请稍候。");
			_this.rebuildExportDhtmlXQ();

			$.ajax({
				url: _this.options.cloudApi.saveBookForShare,
				type: "post",
				data: { book: _this.exportData.DhtmlXQ },
				dataType: "json",
				success: function(response){
					if (response.code === 0) {
						_this.shareUBBTextInput.val("[" + _this.options.ubbTagName + "]" + response.data.id + "[/" + _this.options.ubbTagName + "]");
					}
				},
				error: function(){
					alert("您的浏览器不允许跨域，不能使用此功能。");
				}
			});
		}
	});

	return this;
};

// 创建 UBB 分享信息区域
fn.createShareUBB = function(){
	var _this = this;
	this.shareUBBTitle = $('<div class="vschess-tab-body-share-title">论坛 UBB 代码：</div>');
	this.shareUBBTitle.appendTo(this.shareArea);
	this.shareUBBTextBox = $('<div class="vschess-tab-body-share-text"></div>');
	this.shareUBBTextBox.appendTo(this.shareArea);
	this.shareUBBTextInput = $('<input class="vschess-tab-body-share-text-input" value="请点击“生成分享代码”按钮。" readonly="readonly" />');
	this.shareUBBTextInput.appendTo(this.shareUBBTextBox);
	this.shareUBBTextCopy = $('<input type="button" class="vschess-button vschess-tab-body-share-text-copy" value="复 制" />');
	this.shareUBBTextCopy.appendTo(this.shareUBBTextBox);

	this.shareUBBTextCopy.bind(this.options.click, function(){
		_this.copy(_this.shareUBBTextInput.val(), function(){ _this.showMessage("论坛 UBB 代码复制成功，您可以直接在 BBS 论坛中粘贴使用！"); });
	});

	return this;
};

// 创建生成 Gif 图按钮
fn.createGifGenerateButton = function(){
	var _this = this;
	this.gifGenerateButton = $('<input type="button" class="vschess-button vschess-tab-body-gif-generate-button" value="生成 Gif 动画" />');
	this.gifGenerateButton.appendTo(this.shareArea);

	this.gifGenerateButton.bind(this.options.click, function(){
		if (_this.options.cloudApi && _this.options.cloudApi.gif) {
			_this.gifAreaTitle.text("正在生成，请稍候。");

			$.ajax({
				url: _this.options.cloudApi.gif,
				type: "post",
				data: { movelist: _this.getMoveList().join(",") },
				dataType: "json",
				success: function(response){
					if (response.code === 0) {
						_this.gifAreaTitle.html('<a href="' + response.data.url + '" target="_blank"><img src="' + response.data.url + '" /></a>');
					}
				},
				error: function(){
					alert("您的浏览器不允许跨域，不能使用此功能。");
				}
			});
		}
	});

	return this;
};

// 创建 Gif 图片显示区域
fn.createGifArea = function(){
	var _this = this;
	this.gifAreaTitle = $('<div class="vschess-tab-body-gif-area"></div>');
	this.gifAreaTitle.appendTo(this.shareArea);
	return this;
};
