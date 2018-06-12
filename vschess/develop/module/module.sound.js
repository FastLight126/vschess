// 音效播放组件
fn.playSound = function(name){
	this.getSound() && vs.soundObject[this.options.soundStyle + "-" + name](this.getVolume());
	return this;
};

// 根据局面播放音效
fn.playSoundBySituation = function(step){
	step = vs.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (step <= 0) {
		return this;
	}

	var fromPiece = this.situationList[step - 1][vs.i2s[this.getMoveByStep(step).substring(0, 2)]];
	var   toPiece = this.situationList[step - 1][vs.i2s[this.getMoveByStep(step).substring(2, 4)]];

	// 播放将杀音效
	if (this.legalList.length === 0) {
		this.playSound("lose");
	}

	// 播放将军音效
	else if (vs.checkThreat(this.situationList[this.getCurrentStep()])) {
		this.playSound("check");
	}

	// 播放炮吃子、普通吃子音效
	else if (toPiece > 1) {
		(fromPiece & 15) === 6 ? this.playSound("bomb") : this.playSound("eat");
	}

	// 播放移动棋子音效
	else {
		this.playSound("move");
	}

	return this;
};

// 设置音效状态
fn.setSound = function(sound){
	this._.sound = !!sound;
	this.setConfigItemValue("sound", this._.sound);
	return this;
};

// 取得音效状态
fn.getSound = function(){
	return this._.sound;
};

// 设置音量大小
fn.setVolume = function(volume){
	this._.volume = vs.limit(volume, 0, 100);
	this.setConfigItemValue("volume", this._.volume);
	return this;
};

// 获取音量大小
fn.getVolume = function(){
	return this._.volume;
};
