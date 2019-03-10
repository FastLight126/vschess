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

	// 着法朗读
	if (this.getSpeakMove()) {
		var move = this.getMoveNameList()[this.getCurrentStep()];
		// TTS 部分读音有错误，用同音字强行纠正
		move = move.replace(/卒/g, "足");
		move = move.replace(/相/g, "象");
		move = move.replace(/将/g, "酱");
		move = move.replace(/一/g, "医");
		move = move.replace(/１/g, "医");
		this.speakMove(move);
	}
	// 普通音效
	else {
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

		// 禁止长打并且不可变着，按困毙处理
		else if (this.getBanRepeatLongThreat() && this.legalList.length <= this.repeatLongThreatMoveList.length) {
			this.playSound("lose");
		}

		// 播放移动棋子音效
		else {
			this.playSound("move");
		}
	}

	return this;
};

// 朗读着法
fn.speakMove = function(move){
	if (!this.getSound()) {
		return this;
	}

	if (window.SpeechSynthesisUtterance && window.speechSynthesis) {
		var speech    = new SpeechSynthesisUtterance();
		speech.text   = move;
		speech.lang   = "zh-CN";
		speech.volume = this.getVolume() / 100;
		speechSynthesis.speak(speech);
	}
	else if (window.ActiveXObject) {
		vs.TTS || (vs.TTS = new ActiveXObject("Sapi.SpVoice"));
		vs.TTS &&  vs.TTS.Speak(move, 1);
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

// 设置着法朗读状态
fn.setSpeakMove = function(speakMove){
	this._.speakMove = !!speakMove;
	this.setConfigItemValue("speakMove", this._.speakMove);
	return this;
};

// 取得着法朗读状态
fn.getSpeakMove = function(){
	return this._.speakMove;
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
