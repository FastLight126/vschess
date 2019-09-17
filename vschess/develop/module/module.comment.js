// 创建棋谱注解区域
fn.createComment = function(){
    var _this = this;
    this.commentTitle = $('<div class="vschess-tab-title vschess-tab-title-comment">' + this.options.tagName.comment + '</div>');
	this.commentArea = $('<div class="vschess-tab-body vschess-tab-body-comment"></div>');
	this.commentTextarea = $('<textarea class="vschess-tab-body-comment-textarea"></textarea>').appendTo(this.commentArea);
	this.tabArea.children(".vschess-tab-title-comment, .vschess-tab-body-comment").remove();
	this.tabArea.append(this.commentTitle);
	this.tabArea.append(this.commentArea );
	this.commentTitle.bind(this.options.click, function(){ _this.showTab("comment"); });
	this.commentTextarea.bind("change" , function( ){ _this.editCommentByStep(_this.commentTextarea.val()); });
	this.commentTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode === 13 && _this.commentTextarea.blur(); });
	this.createCommentPlaceholder();
	return this;
};

// 根据局面号填充注释
fn.setCommentByStep = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	this.commentTextarea.val(this.commentList[step]);
	vs.placeholder || (this.commentList[step] ?  this.commentTextareaPlaceholder.hide() : this.commentTextareaPlaceholder.show());
	return this;
};

// 创建棋谱注解区域空白提示
fn.createCommentPlaceholder = function(){
	if (vs.placeholder) {
		this.commentTextarea.attr({ "placeholder": "这里可以填写注解" });
		return this;
	}

	var _this = this, commentMonitor;
	this.commentTextareaPlaceholder = $('<div class="vschess-tab-body-comment-textarea-placeholder">这里可以填写注解</div>');
	this.commentArea.append(this.commentTextareaPlaceholder);
	this.commentTextarea.bind("focus", function(){ commentMonitor = setInterval(function(){ _this.commentTextarea.val() ? _this.commentTextareaPlaceholder.hide() : _this.commentTextareaPlaceholder.show(); }, 20); });
	this.commentTextarea.bind("blur" , function(){ clearInterval(commentMonitor); });
	return this;
};

// 修改当前节点树下指定局面号的注解
fn.editCommentByStep = function(comment, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	this.selectDefault(step).comment = comment;
	this.commentList[step] = comment;
	this.refreshMoveListNode();
	this.setCommentByStep();
	this.rebuildExportAll();
	this.setExportFormat();
	return this;
};
