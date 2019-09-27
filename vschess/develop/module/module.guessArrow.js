// 创建猜想展示箭头
fn.createGuessArrow = function(){
    this.guessArrowRed   = $('<div class="vschess-guess-arrow vschess-guess-arrow-red"><span class="vschess-guess-arrow-head"></span><span class="vschess-guess-arrow-body"></span></div>');
    this.guessArrowBlack = $('<div class="vschess-guess-arrow vschess-guess-arrow-black"><span class="vschess-guess-arrow-head"></span><span class="vschess-guess-arrow-body"></span></div>');
    this.board.children(".vschess-guess-arrow").remove();
    this.board.append(this.guessArrowRed).append(this.guessArrowBlack);
    return this;
};

// 显示猜想展示箭头
fn.showGuessArrow = function(player, move){
    if (!vs.RegExp().Node.test(move)) {
        return this;
    }

    var arrow     = player === "b" ? this.guessArrowBlack : this.guessArrowRed;
    var from      = vs.turn[this.getTurn() >> 1 ? 3 : 0][vs.i2b[move.substring(0, 2)]];
    var   to      = vs.turn[this.getTurn() >> 1 ? 3 : 0][vs.i2b[move.substring(2, 4)]];
    var fromPiece = this.piece.eq(from);
    var   toPiece = this.piece.eq(to  );
    var  widthP   = fromPiece.width ();
    var heightP   = fromPiece.height();
    var fromX     = fromPiece.position().left +  widthP / 2;
    var   toX     =   toPiece.position().left +  widthP / 2;
    var fromY     = fromPiece.position().top  + heightP / 2;
    var   toY     =   toPiece.position().top  + heightP / 2;
    var centerX   = (fromX + toX) / 2;
    var centerY   = (fromY + toY) / 2;
    var X         = toX - fromX;
    var Y         = toY - fromY;
    var deg       = Math.atan2(Y, X) * 180 / Math.PI + 90;
    var height    = Math.sqrt(X * X + Y * Y);

    while (deg >= 360) { deg -= 360; }
    while (deg <    0) { deg += 360; }

    var degStyle = vs.degToRotateCSS(deg);
    arrow.attr({ style: degStyle }).css({ top: centerY, left: centerX, height: height, marginTop: -height / 2 }).addClass("vschess-guess-arrow-show");
    return this;
};

// 隐藏猜想展示箭头
fn.hideGuessArrow = function(player){
    if (player) {
        var arrow = player === "b" ? this.guessArrowBlack : this.guessArrowRed;
        arrow.removeClass("vschess-guess-arrow-show");
    }
    else {
        this.hideGuessArrow("r").hideGuessArrow("b");
    }

    return this;
};
