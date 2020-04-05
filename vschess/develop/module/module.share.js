// 创建棋谱分享区域
fn.createShare = function(){
	var _this = this;
    this.shareTitle = $('<div class="vschess-tab-title vschess-tab-title-share">' + this.options.tagName.share + '</div>');
	this.shareArea  = $('<div class="vschess-tab-body vschess-tab-body-share"></div>');
	this.tabArea.children(".vschess-tab-title-share, .vschess-tab-body-share").remove();
	this.tabArea.append(this.shareTitle);
	this.tabArea.append(this.shareArea );
	this.shareTitle.bind(this.options.click, function(){ _this.showTab("share"); });
	this.createShareGenerateButton();
	this.createGifGenerateButton();
	this.createWeixinGenerateButton();
	this.createShareHTML();
	this.createShareUBB();
	this.createShareImage();
	return this;
};

// 创建生成分享信息按钮
fn.createShareGenerateButton = function(){
	var _this = this;
	this.shareGenerateButton = $('<button type="button" class="vschess-button vschess-tab-body-share-generate-button">生成分享代码</button>');
	this.shareGenerateButton.appendTo(this.shareArea);

	this.shareGenerateButton.bind(this.options.click, function(){
		for (var i = 0; i < vs.shareCodeModuleList.length; ++i) {
			_this[vs.shareCodeModuleList[i]].addClass("vschess-tab-body-share-current");
		}

		_this.shareImageTitle.removeClass("vschess-tab-body-image-current");

		if (_this.options.cloudApi && _this.options.cloudApi.saveBookForShare) {
			_this.shareHTMLTextInput.val("正在生成，请稍候。");
			_this.shareUBBTextInput .val("正在生成，请稍候。");
			_this.rebuildExportDhtmlXQ();

			$.ajax({
				url: _this.options.cloudApi.saveBookForShare,
				type: "post",
				data: { book: _this.exportData.DhtmlXQ },
				dataType: "json",
				success: function(response){
					if (response.code === 0) {
						_this.shareUBBTextInput .val("[" + _this.options.ubbTagName + "]" + response.data.id + "[/" + _this.options.ubbTagName + "]");
						_this.shareHTMLTextInput.val('<script src="' + _this.options.cloudApi.HTMLShareJS + '?id=' + response.data.id + '"></script>');
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

// 创建 HTML 分享信息区域
fn.createShareHTML = function(){
	var _this = this;
	this.shareHTMLTitle = $('<div class="vschess-tab-body-share-title">HTML 代码：</div>');
	this.shareHTMLTitle.appendTo(this.shareArea);
	this.shareHTMLTextBox = $('<div class="vschess-tab-body-share-text"></div>');
	this.shareHTMLTextBox.appendTo(this.shareArea);
	this.shareHTMLTextInput = $('<input class="vschess-tab-body-share-text-input" value="请点击“生成分享代码”按钮。" readonly="readonly" />');
	this.shareHTMLTextInput.appendTo(this.shareHTMLTextBox);
	this.shareHTMLTextCopy = $('<button type="button" class="vschess-button vschess-tab-body-share-text-copy">复 制</button>');
	this.shareHTMLTextCopy.appendTo(this.shareHTMLTextBox);

	this.shareHTMLTextCopy.bind(this.options.click, function(){
		_this.copy(_this.shareHTMLTextInput.val(), function(){ _this.showMessage("HTML 代码复制成功，您可以直接网页中粘贴使用！"); });
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
	this.shareUBBTextCopy = $('<button type="button" class="vschess-button vschess-tab-body-share-text-copy">复 制</button>');
	this.shareUBBTextCopy.appendTo(this.shareUBBTextBox);

	this.shareUBBTextCopy.bind(this.options.click, function(){
		_this.copy(_this.shareUBBTextInput.val(), function(){ _this.showMessage("论坛 UBB 代码复制成功，您可以直接在 BBS 论坛中粘贴使用！"); });
	});

	return this;
};

// 创建生成 Gif 图按钮
fn.createGifGenerateButton = function(){
	var _this = this;
	this.gifGenerateButton = $('<button type="button" class="vschess-button vschess-tab-body-image-generate-button">生成 Gif 动画</button>');
	this.gifGenerateButton.appendTo(this.shareArea);

	this.gifGenerateButton.bind(this.options.click, function(){
		if (_this.options.cloudApi && _this.options.cloudApi.gif) {
			for (var i = 0; i < vs.shareCodeModuleList.length; ++i) {
				_this[vs.shareCodeModuleList[i]].removeClass("vschess-tab-body-share-current");
			}

			_this.shareImageTitle.addClass("vschess-tab-body-image-current");
			_this.shareImageTitle.text("正在生成，请稍候。");

			$.ajax({
				url: _this.options.cloudApi.gif,
				type: "post",
				data: { movelist: _this.getMoveList().join(",") },
				dataType: "json",
				success: function(response){
					if (response.code === 0) {
						_this.shareImageTitle.html('<a href="' + response.data.url + '" target="_blank"><img src="' + response.data.url + '" /></a>');
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

// 创建分享图片显示区域
fn.createShareImage = function(){
	var _this = this;
	this.shareImageTitle = $('<div class="vschess-tab-body-image-area"></div>');
	this.shareImageTitle.appendTo(this.shareArea);
	return this;
};

// 创建生成小程序码按钮
fn.createWeixinGenerateButton = function(){
	var _this = this;
	this.weixinGenerateButton = $('<button type="button" class="vschess-button vschess-tab-body-share-generate-button">生成小程序码</button>');
	this.weixinGenerateButton.appendTo(this.shareArea);

	this.weixinGenerateButton.bind(this.options.click, function(){
		for (var i = 0; i < vs.shareCodeModuleList.length; ++i) {
			_this[vs.shareCodeModuleList[i]].removeClass("vschess-tab-body-share-current");
		}

		_this.shareImageTitle.addClass("vschess-tab-body-image-current");

		if (_this.options.cloudApi && _this.options.cloudApi.saveBookForWeixin) {
			_this.shareImageTitle.text("正在生成，请稍候。");
			_this.rebuildExportDhtmlXQ();

			$.ajax({
				url: _this.options.cloudApi.saveBookForWeixin,
				type: "post",
				data: { book: _this.exportData.DhtmlXQ, step: _this.getCurrentStep() },
				dataType: "json",
				success: function(response){
					if (response.code === 0) {
						_this.shareImageTitle.html('<a href="' + response.data.url + '" target="_blank"><img src="' + response.data.url + '" /></a>');
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
