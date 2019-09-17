// 创建移动端额外标签按钮
fn.createMobileTag = function () {
    var _this = this;

    this.mobileCloseTab = $('<div class="vschess-mobile-close-tab">棋<br />盘</div>');
    this.DOM.children(".vschess-mobile-close-tab").remove();
    this.DOM.append(this.mobileCloseTab);

    this.mobileCloseTab.bind(this.options.click, function(){
        _this.showTab("board");
    });

    this.mobileShowMoveList = $('<div class="vschess-mobile-show-move-list">着<br />法</div>');
    this.DOM.children(".vschess-mobile-show-move-list").remove();
    this.DOM.append(this.mobileShowMoveList);

    this.mobileShowMoveList.bind(this.options.click, function(){
        _this.showTab("move");
    });

    return this;
};
