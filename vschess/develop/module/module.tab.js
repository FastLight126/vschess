// 创建标签
fn.createTab = function(){
	this.tabArea = $('<div class="vschess-tab-area"></div>');
	this.DOM.children(".vschess-tab-area").remove();
	this.DOM.append(this.tabArea);
	this.createComment();
	this.createInfo   ();
	this.createShare  ();
	this.createExport ();
	this.createEdit   ();
	this.createConfig ();
	this.tabTitle = this.tabArea.children(".vschess-tab-title");
	this.tabBody  = this.tabArea.children(".vschess-tab-body" );
	return this;
};

// 显示指定标签
fn.showTab = function(tabName){
	if (!~vs.tabList.indexOf(tabName)) {
		return this;
	}

	this.tabTitle.removeClass("vschess-tab-title-current").filter(".vschess-tab-title-" + tabName).addClass("vschess-tab-title-current");
	this.tabBody .removeClass("vschess-tab-body-current" ).filter(".vschess-tab-body-"  + tabName).addClass("vschess-tab-body-current" );
	return this;
};
