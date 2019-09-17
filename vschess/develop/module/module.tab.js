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

    this.tabTitle.removeClass("vschess-tab-title-current");
    this.tabBody.removeClass("vschess-tab-body-current");
    this.mobileCloseTab.removeClass("vschess-mobile-close-tab-current");
    this.mobileShowMoveList.removeClass("vschess-mobile-show-move-list-current");
    this.moveSelectList.removeClass("vschess-move-select-list-current");
    this.changeSelectTitle.removeClass("vschess-change-select-title-current");
    this.changeSelectList.removeClass("vschess-change-select-list-current");
    //this.formatBar.removeClass("vschess-format-bar-current");

    if (tabName === "board") {
        this.mobileCloseTab.addClass("vschess-mobile-close-tab-current");
    }
    else if (tabName === "move") {
        this.mobileShowMoveList.addClass("vschess-mobile-show-move-list-current");
        this.moveSelectList.addClass("vschess-move-select-list-current");
        this.changeSelectTitle.addClass("vschess-change-select-title-current");
        this.changeSelectList.addClass("vschess-change-select-list-current");
        //this.formatBar.addClass("vschess-format-bar-current");
    }
    else {
        this.tabTitle.filter(".vschess-tab-title-" + tabName).addClass("vschess-tab-title-current");
        this.tabBody .filter(".vschess-tab-body-"  + tabName).addClass("vschess-tab-body-current" );
    }

	return this;
};
