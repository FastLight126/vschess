// 动态加载 CSS，用 Zepto 或 jQuery 方式加载的外部 CSS 在低版本 IE 下不生效，所以使用原生方法
vs.addCSS = function(options, type, href){
	var link = document.createElement("link");
	var head = document.getElementsByTagName("head");
	typeof vs. styleLoadedCallback[options.style ] === "undefined" && (vs. styleLoadedCallback[options.style ] = []);
	typeof vs.layoutLoadedCallback[options.layout] === "undefined" && (vs.layoutLoadedCallback[options.layout] = []);
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", href);

	link.onload = function(){
		if (type === "global") {
			for (var i = 0; i < vs.globalLoadedCallback.length; ++i) {
				typeof vs.globalLoadedCallback[i] === "function" && vs.globalLoadedCallback[i]();
			}

			vs.globalLoaded = true;
		}

		if (type === "style") {
			for (var i = 0; i < vs.styleLoadedCallback[options.style].length; ++i) {
				typeof vs.styleLoadedCallback[options.style][i] === "function" && vs.styleLoadedCallback[options.style][i]();
			}

			vs.styleLoaded[options.style] = true;
		}

		if (type === "layout") {
			for (var i = 0; i < vs.layoutLoadedCallback[options.layout].length; ++i) {
				typeof vs.layoutLoadedCallback[options.layout][i] === "function" && vs.layoutLoadedCallback[options.layout][i]();
			}

			vs.layoutLoaded[options.layout] = true;
		}
	};

	head.length ? head[0].appendChild(link) : document.documentElement.appendChild(link);
	return this;
};

// 初始化程序，加载样式
vs.init = function(options){
	// 全局样式，统一 Web Audio API
	if (!vs.inited) {
		vs.AudioContext = window.AudioContext || window.webkitAudioContext;
		vs.AudioContext = vs.AudioContext ? new vs.AudioContext() : false;
		vs.addCSS(options, 'global', options.globalCSS);
		vs.inited = true;
	}

	// 风格样式
	if (!vs.styleInit[options.style]) {
		vs.addCSS(options, 'style', vs.defaultPath + 'style/' + options.style + "/style.css");
		vs.IE6Compatible_setPieceTransparent(options);
		vs.styleInit[options.style] = true;
	}

	// 布局样式
	if (!vs.layoutInit[options.layout]) {
		vs.addCSS(options, 'layout', vs.defaultPath + 'layout/' + options.layout + "/layout.css");
		vs.layoutInit[options.layout] = true;
	}

	// 音效组件
	if (!vs.soundInit[options.soundStyle]) {
		$.each(vs.soundList, function(index, name){
			var soundName = options.soundStyle + "-" + name;
			var soundId   = "vschess-sound-" + soundName;
			var soundSrc  = options.soundPath ? options.soundPath + name + ".mp3" : vs.defaultPath + 'sound/' + options.soundStyle + '/' + name + ".mp3";
			vs.soundObject[soundName] = function(){};

			// 支持 Web Audio 的浏览器使用 Web Audio API
			if (vs.AudioContext) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", soundSrc, true);
				xhr.responseType = "arraybuffer";

				xhr.onload = function(){
					vs.AudioContext.decodeAudioData(this.response, function(buffer){
						vs.soundObject[soundName] = function(volume){
							var source   = vs.AudioContext.createBufferSource();
							var gainNode = vs.AudioContext.createGain();
							source.buffer = buffer;
							source.connect(vs.AudioContext.destination);
							source.connect(gainNode);
							gainNode.connect(vs.AudioContext.destination);
							gainNode.gain.value = volume / 50 - 1;
							source.start(0);
						};
					});
				};

				xhr.send();
			}

			// 低版本 IE 下利用 Windows Media Player 来实现走子音效
			else if (window.ActiveXObject) {
				var soundHTML = '<object id="' + soundId + '" classid="clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6" style="display:none;">';
				$("body").append(soundHTML + '<param name="url" value="' + soundSrc + '" /><param name="autostart" value="false" /></object>');
				var soundObject = document.getElementById(soundId);

				vs.soundObject[soundName] = function(volume){
					soundObject.settings.volume = volume;
					soundObject.controls.stop();
					soundObject.controls.play();
				};
			}

			// 其他浏览器通过 HTML5 中的 audio 标签来实现走子音效
			else {
				$("body").append('<audio id="' + soundId + '" src="' + soundSrc + '" preload="auto"></audio>');
				var soundObject = document.getElementById(soundId);

				vs.soundObject[soundName] = function(volume){
					soundObject.volume = volume / 100;
					soundObject.pause();
					soundObject.currentTime = 0;
					soundObject.play();
				}
			}
		});

		vs.soundInit[options.soundStyle] = true;
	}

	return this;
};
