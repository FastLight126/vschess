// 从 V2.4.0 版开始，播放器不再依赖 Zepto/jQuery 框架。
// 模拟 Zepto/jQuery，仅限于播放器内部使用，因为我只模拟了播放器中用到的方法，没用到的方法没有模拟。
var $ = function(selector) {
    return new $.init(selector);
};

$.init = function(selector) {
    this.length = 0;

    if (!selector) {
        return this;
    }

    if (selector instanceof $.init) {
        return selector;
    }

    if (selector.nodeType) {
        this[0] = selector;
        this.length = 1;
        return this;
    }

    if (typeof selector === "object" && typeof selector.length === "number") {
        var list = selector;
    }
    else if (typeof selector === "string") {
        if (~selector.indexOf("<")) {
            var wrap = document.createElement("div"), list = [];
            wrap.innerHTML = selector;

            for (var i = 0; i < wrap.childNodes.length; ++i) {
                wrap.childNodes[i].nodeType === 1 && list.push(wrap.childNodes[i]);
            }
        }
        else {
            var list = Qwery(selector);
        }
    }
    else {
        var list = [];
    }

    this.length = list.length;

    for (var i = 0; i < list.length; ++i) {
        this[i] = list[i];
    }

    return this;
};

$.expand = $.init.prototype;

$.expand.not = function(selector){
    var notList = Qwery(selector);
    var newList = [];

    for (var i = 0; i < this.length; ++i) {
        ~notList.indexOf(this[i]) || newList.push(this[i]);
    }

    return $(newList);
};

$.expand.eq = function(index){
    return this.length ? $(this[index]) : $();
};

$.expand.first = function(){
    return this.length ? $(this[0]) : $();
};

$.expand.last = function(){
    return this.length ? $(this[this.length - 1]) : $();
};

$.expand.clone = function(){
    return this.length ? $(this[0].cloneNode(true)) : $();
};

$.expand.after = function(selector){
    for (var i = 0; i < this.length; ++i) {
        var next   = this[i].nextSibling;
        var parent = this[i].parentNode ;
        var list   = $(selector);

        for (var j = 0; j < list.length; ++j) {
            parent.insertBefore(list[i], next);
        }
    }

    return this;
};

$.expand.addClass = function(className){
    if (!className) {
        return this;
    }

    var addList = $.trim(className).split(/[\s]+/);

    if (this[0] && this[0].classList) {
        for (var i = 0; i < this.length; ++i) {
            for (var j = 0; j < addList.length; ++j) {
                this[i].classList.add(addList[j]);
            }
        }
    }
    else {
        for (var i = 0; i < this.length; ++i) {
            var classNameList = $.trim(this[i].className).split(/[\s]+/);

            for (var j = 0; j < addList.length; ++j) {
                ~classNameList.indexOf(addList[j]) || classNameList.push(addList[j]);
            }

            this[i].className = classNameList.join(" ");
        }
    }

    return this;
};

$.expand.removeClass = function(className){
    if (!className) {
        for (var i = 0; i < this.length; ++i) {
            this[i].className = "";
        }

        return this;
    }

    var removeList = $.trim(className).split(/[\s]+/);

    if (this[0] && this[0].classList) {
        for (var i = 0; i < this.length; ++i) {
            for (var j = 0; j < removeList.length; ++j) {
                this[i].classList.remove(removeList[j]);
            }
        }
    }
    else {
        for (var i = 0; i < this.length; ++i) {
            var classNameList = $.trim(this[i].className).split(/[\s]+/);
            var resultList = [];

            for (var j = 0; j < classNameList.length; ++j) {
                ~removeList.indexOf(classNameList[j]) || resultList.push(classNameList[j]);
            }

            this[i].className = resultList.join(" ");
        }
    }

    return this;
};

$.expand.toggleClass = function(className){
    if (!className) {
        return this;
    }

    var toggleList = $.trim(className).split(/[\s]+/);

    if (this[0] && this[0].classList) {
        for (var i = 0; i < this.length; ++i) {
            for (var j = 0; j < toggleList.length; ++j) {
                this[i].classList.toggle(toggleList[j]);
            }
        }
    }
    else {
        for (var i = 0; i < this.length; ++i) {
            var _this = $(this[i]);

            for (var j = 0; j < toggleList.length; ++j) {
                _this.hasClass(toggleList[j]) ? _this.removeClass(toggleList[j]) : _this.addClass(toggleList[j]);
            }
        }
    }

    return this;
};

$.expand.hasClass = function(className){
    if (this.length === 0) {
        return false;
    }

    var classNameList = $.trim(this[0].className).split(/[\s]+/);
    return !!~classNameList.indexOf(className);
};

$.expand.html = function(){
    if (arguments.length) {
        for (var i = 0; i < this.length; ++i) {
            this[i].innerHTML = arguments[0];
        }

        return this;
    }
    else {
        return this.length ? this[0].innerHTML : "";
    }
};

$.expand.text = function(){
    if (arguments.length) {
        for (var i = 0; i < this.length; ++i) {
            this[i].innerHTML = "";
            this[i].appendChild(document.createTextNode(arguments[0]));
        }

        return this;
    }
    else {
        if (this.length) {
            var getText = function(elem) {
        		var node, ret = "", i = 0, nodeType = elem.nodeType;

        		if (!nodeType) {
        			while ((node = elem[i++])) {
        				ret += getText(node);
        			}
        		}
                else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        			if (typeof elem.textContent === "string") {
        				return elem.textContent;
        			}
                    else {
        				for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
        					ret += getText(elem);
        				}
        			}
        		}
                else if (nodeType === 3 || nodeType === 4) {
        			return elem.nodeValue;
        		}

        		return ret;
        	};

            var elem = this[0];
            var node, ret = "", i = 0, nodeType = elem.nodeType;

            if (!nodeType) {
                while ((node = elem[i++])) {
                    ret += getText(node);
                }
            }
            else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                if (typeof elem.textContent === "string") {
                    return elem.textContent;
                }
                else {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        ret += getText(elem);
                    }
                }
            }
            else if (nodeType === 3 || nodeType === 4) {
                return elem.nodeValue;
            }

            return ret;
        }
        else {
            return "";
        }
    }
};

$.expand.empty = function(){
    return this.html("");
};

$.expand.attr = function(attr){
    if (arguments.length > 1) {
        for (var i = 0; i < this.length; ++i) {
            this[i].setAttribute(attr, arguments[1]);
        }

        return this;
    }
    else {
        if (typeof attr === "object") {
            for (var i = 0; i < this.length; ++i) {
                for (var j in attr) {
                    this[i].setAttribute(j, attr[j]);
                }
            }

            return this;
        }
        else {
            return this.length ? this[0].getAttribute(attr) : "";
        }
    }
};

$.expand.removeAttr = function(attr){
    for (var i = 0; i < this.length; ++i) {
        this[i].removeAttribute(attr);
    }

    return this;
};

$.expand.data = function(){
    if (arguments.length > 1) {
        return this.attr("data-" + arguments[0], arguments[1]);
    }
    else {
        return this.attr("data-" + arguments[0]);
    }
};

$.expand.children = function(selector){
    var result = [];

    for (var i = 0; i < this.length; ++i) {
        if (typeof selector === "string") {
            var list = Qwery(">" + selector, this[i]);
        }
        else {
            var list = this[i].childNodes;
        }

        for (var j = 0; j < list.length; ++j) {
            list[j].nodeType === 1 && result.push(list[j]);
        }
    }

    return $(result);
};

$.expand.remove = function(){
    for (var i = 0; i < this.length; ++i) {
        this[i].parentNode.removeChild(this[i]);
    }

    return this;
};

$.expand.bind = function(event, func){
    var eventList = event.split(" ");

    for (var i = 0; i < eventList.length; ++i) {
        for (var j = 0; j < this.length; ++j) {
            if (document.addEventListener) {
                this[j].addEventListener(eventList[i], func);
            }
            else {
                this[j].attachEvent(eventList[i], func);
            }
        }
    }

    return this;
};

$.expand.trigger = function(event){
    ~["click", "submit"].indexOf(event) || (event = "click");

    for (var i = 0; i < this.length; ++i) {
        this[i][event]();
    }

    return this;
};

$.expand.append = function(selector){
    for (var i = 0; i < this.length; ++i) {
        var list = $(selector);

        for (var j = 0; j < list.length; ++j) {
            this[i].appendChild(list[j]);
        }
    }

    return this;
};

$.expand.each = function(func){
    for (var i = 0; i < this.length; ++i) {
        func.call(this[i], i, this[i]);
    }

    return this;
};

$.expand.appendTo = function(selector){
    for (var i = 0; i < this.length; ++i) {
        var list = $(selector);

        for (var j = 0; j < list.length; ++j) {
            list[i].appendChild(this[i]);
        }
    }

    return this;
};

$.expand.css = function(config){
    for (var i = 0; i < this.length; ++i) {
        for (var j in config) {
            var key = j;
            var value = config[j];

            key = key.replace(/-webkit-t/g, "webkitT");
            key = key.replace(   /-moz-t/g,    "mozT");
            key = key.replace(    /-ms-t/g,     "msT");
            key = key.replace(     /-o-t/g,      "oT");

            ~"height width top right bottom left marginTop marginRight marginBottom marginLeft paddingTop paddingRight paddingBottom paddingLeft".split(" ").indexOf(j) && !isNaN(+config[j]) && (value += "px");

            this[i].style[key] = value;
        }
    }

    return this;
};

$.expand.filter = function(selector){
    var filterList = $.trim(selector.replace(/\./g, "")).split(/[\s]+/);
    var result = [];

    for (var i = 0; i < this.length; ++i) {
        var classNameList = $.trim(this[i].className).split(/[\s]+/);

        for (var j = 0; j < classNameList.length; ++j) {
            if (~filterList.indexOf(classNameList[j])) {
                result.push(this[i]);
                break;
            }
        }
    }

    return $(result);
};

$.expand.val = function(){
    if (arguments.length) {
        for (var i = 0; i < this.length; ++i) {
            this[i].value = arguments[0];
        }

        return this;
    }
    else {
        return this.length ? this[0].value : "";
    }
};

$.expand.height = function(){
    if (arguments.length) {
        for (var i = 0; i < this.length; ++i) {
            this[i].style.height = arguments[0] + "px";
        }

        return this;
    }
    else {
        return this.length ? this[0].offsetHeight : 0;
    }
};

$.expand.width = function(){
    if (arguments.length) {
        for (var i = 0; i < this.length; ++i) {
            this[i].style.width = arguments[0] + "px";
        }

        return this;
    }
    else {
        return this.length ? this[0].offsetWidth : 0;
    }
};

$.expand.scrollTop = function(){
    if (arguments.length) {
        for (var i = 0; i < this.length; ++i) {
            this[i].scrollTop = arguments[0];
        }

        return this;
    }
    else {
        return this.length ? this[0].scrollTop : 0;
    }
};

$.expand.scrollLeft = function(){
    if (arguments.length) {
        for (var i = 0; i < this.length; ++i) {
            this[i].scrollLeft = arguments[0];
        }

        return this;
    }
    else {
        return this.length ? this[0].scrollLeft : 0;
    }
};

$.expand.position = function(){
    if (!this.length) {
        return { top: 0, left: 0 };
    }

    var   selfPosition = this[0]           .getBoundingClientRect();
    var parentPosition = this[0].parentNode.getBoundingClientRect();
    var sl =   selfPosition.left;
    var st =   selfPosition.top ;
    var pl = parentPosition.left;
    var pt = parentPosition.top ;
    return { top: st - pt, left: sl - pl };
};

$.expand.show = function(){
    for (var i = 0; i < this.length; ++i) {
        this[i].style.display = "block";
    }

    return this;
};

$.expand.hide = function(){
    for (var i = 0; i < this.length; ++i) {
        this[i].style.display = "none";
    }

    return this;
};

$.expand.animate = function(config, time, callback){
    this._config   = config;
    this._time     = time;
    this._callback = callback;
    this._start    = new Date().getTime();
    this._param    = [];

    for (var i = 0; i < this.length; ++i) {
        this._param[i] = $(this[i]).position();
    }

    var _this = this;
    this._nextFrame = setTimeout(function(){ _this.nextFrame(); }, vs.threadTimeout);
    return this;
};

$.expand.nextFrame = function(){
    var time = new Date().getTime();
    var deltaTime = time - this._start;
    var deltaPercent = deltaTime / this._time;

    if (deltaTime >= this._time) {
        this.stop();
    }
    else {
        for (var i = 0; i < this.length; ++i) {
            var targetTop  = this._param[i].top  + (this._config.top  - this._param[i].top ) * deltaPercent;
            var targetLeft = this._param[i].left + (this._config.left - this._param[i].left) * deltaPercent;
            this[i].style.top  = targetTop  + "px";
            this[i].style.left = targetLeft + "px";
        }

        var _this = this;
        this._nextFrame = setTimeout(function(){ _this.nextFrame(); }, vs.threadTimeout);
    }

    return this;
};

$.expand.stop = function(){
    clearTimeout(this._nextFrame);

    for (var i = 0; i < this.length; ++i) {
        this[i].style.top  = this._config.top  + "px";
        this[i].style.left = this._config.left + "px";
    }

    typeof this._callback === "function" && this._callback();
    delete this._config;
    delete this._time;
    delete this._callback;
    delete this._start;
    delete this._param;
    delete this._nextFrame;
    return this;
};

$.extend = function(){
    var arg = arguments;

    if (arg[0] === true) {
        if (typeof arg[1] !== "object") {
            return {};
        }

        for (var i = 2; i < arg.length; ++i) {
            if (typeof arg[i] !== "object") {
                continue;
            }

            for (var j in arg[i]) {
                if (typeof arg[1][j] === "object" && typeof arg[i][j] === "object") {
                    $.extend(true, arg[1][j], arg[i][j]);
                }
                else {
                    arg[1][j] = arg[i][j];
                }
            }
        }

        return arg[1];
    }
    else {
        if (typeof arg[0] !== "object") {
            return {};
        }

        for (var i = 1; i < arg.length; ++i) {
            if (typeof arg[i] === "object") {
                for (var j in arg[i]) {
                    arg[0][j] = arg[i][j];
                }
            }
        }

        return arg[0];
    }
};

$.each = function(arr, func){
    for (var i in arr) {
        func.call(arr[i], i, arr[i]);
    }

    return this;
};

$.trim = function(str){
    return (str || "").replace(/^\s+|\s+$/gm, "");
};

$.uniqid = 0;

$.ajax = function(config){
    var cfg = { url: "", type: "POST", data: {}, dataType: "json" };
    cfg = $.extend(true, {}, cfg, config);
    typeof cfg.success === "function" || (cfg.success = function(){});
    typeof cfg.error   === "function" || (cfg.error   = function(){});

    if (cfg.dataType === "jsonp") {
        var callbackName = "vschess_callback_" + new Date().getTime() + "_" + $.uniqid++;
        var tag  = document.createElement("script");
        var mask = ~cfg.url.indexOf("?") ? "&" : "?";
        tag.src  =  cfg.url + mask + "callback=" + callbackName + "&" + new Date().getTime();

        window[callbackName] = function(response){
            cfg.success(response);
            delete window[callbackName];
            document.getElementsByTagName("body")[0].removeChild(tag);
        };

        document.getElementsByTagName("body")[0].appendChild(tag);
    }
    else {
        var xhrs = [
            function(){ return new XMLHttpRequest(); },
            function(){ return new ActiveXObject("Microsoft.XMLHTTP" ); },
            function(){ return new ActiveXObject("MSXML2.XMLHTTP.3.0"); },
            function(){ return new ActiveXObject("MSXML2.XMLHTTP"    ); }
        ];

        var xhr = false;

        for (var i = 0; i < xhrs.length; ++i) {
            try {
                xhr = xhrs[i]();
                break;
            }
            catch (e) {
            }
        }

        if (!xhr) {
            cfg.error();
            return false;
        }

        xhr.open(cfg.type.toUpperCase(), cfg.url);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        var data = [];

        for (var i in cfg.data) {
            data.push(i + "=" + encodeURIComponent(cfg.data[i]));
        }

        xhr.send(data.join("&"));

        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (typeof xhr.responseText === "string" && cfg.dataType === "json") {
                    cfg.success($.parseJSON(xhr.responseText));
                }
                else {
                    cfg.success(xhr.responseText);
                }
            }
        };
    }

    return true;
};

$.parseJSON = function(json){
    if (JSON && typeof JSON.parse === "function") {
        return JSON.parse(json);
    }
    else {
        return eval("(" + json + ")");
    }
};
