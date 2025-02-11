/*
 * 微思象棋播放器 V2.6.4
 * https://www.xiaxiangqi.com/
 *
 * Copyright @ 2009-2025 Margin.Top 版权所有
 * https://margin.top/
 *
 * 本程序遵循 LGPL 协议
 * https://www.gnu.org/licenses/lgpl.html
 *
 * 鸣谢列表敬请移步 GitHub 项目主页，排名不分先后
 * https://github.com/FastLight126/vschess
 *
 * 选择器引擎选用 Qwery
 * https://github.com/ded/qwery/
 *
 * 最后修改日期：北京时间 2025年2月11日
 * Tue, 11 Feb 2025 18:08:29 +0800
 */

(function(){

// Qwery 选择器引擎
var Qwery;

(function () {
    var doc = document,
        html = doc.documentElement,
        byClass = 'getElementsByClassName',
        byTag = 'getElementsByTagName',
        qSA = 'querySelectorAll',
        useNativeQSA = 'useNativeQSA',
        tagName = 'tagName',
        nodeType = 'nodeType',
        select,
        id = /#([\w\-]+)/,
        clas = /\.[\w\-]+/g,
        idOnly = /^#([\w\-]+)$/,
        classOnly = /^\.([\w\-]+)$/,
        tagOnly = /^([\w\-]+)$/,
        tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/,
        splittable = /(^|,)\s*[>~+]/,
        normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g,
        splitters = /[\s\>\+\~]/,
        splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/,
        specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g,
        simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/,
        attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/,
        pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/,
        easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source),
        dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g'),
        tokenizr = new RegExp(splitters.source + splittersMore.source),
        chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?');

    var walker = {
        ' ': function (node) { return node && node !== html && node.parentNode; },
        '>': function (node, contestant) { return node && node.parentNode == contestant.parentNode && node.parentNode; },
        '~': function (node) { return node && node.previousSibling; },
        '+': function (node, contestant, p1, p2) { if (!node) return false; return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1; }
    };

    function cache() {
        this.c = {};
    }

    cache.prototype = {
        g: function (k) { return this.c[k] || undefined; },
        s: function (k, v, r) { v = r ? new RegExp(v) : v; return (this.c[k] = v); }
    };

    var classCache = new cache(), cleanCache = new cache(), attrCache = new cache(), tokenCache = new cache();

    function classRegex(c) {
        return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1);
    }

    function each(a, fn) {
        var i = 0, l = a.length;
        for (; i < l; i++) fn(a[i]);
    }

    function flatten(ar) {
        for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i]);
        return r;
    }

    function arrayify(ar) {
        var i = 0, l = ar.length, r = [];
        for (; i < l; i++) r[i] = ar[i];
        return r;
    }

    function previous(n) {
        while (n = n.previousSibling) if (n[nodeType] == 1) break;
        return n;
    }

    function q(query) {
        return query.match(chunker);
    }

    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
        var i, m, k, o, classes;

        if (this[nodeType] !== 1) {
            return false;
        }

        if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) {
            return false;
        }

        if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) {
            return false;
        }

        if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
            for (i = classes.length; i--;) {
                if (!classRegex(classes[i].slice(1)).test(this.className)) {
                    return false;
                }
            }
        }

        if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) {
            return false;
        }

        if (wholeAttribute && !value) {
            o = this.attributes;

            for (k in o) {
                if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
                    return this;
                }
            }
        }

        if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
            return false;
        }

        return this;
    }

    function clean(s) {
        return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'));
    }

    function checkAttr(qualify, actual, val) {
        switch (qualify) {
            case '=' : return actual == val;
            case '^=': return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^'          + clean(val)               , 1));
            case '$=': return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val,                clean(val) + '$'         , 1));
            case '*=': return actual.match(attrCache.g(       val) || attrCache.s(       val,                clean(val)               , 1));
            case '~=': return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1));
            case '|=': return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^'          + clean(val) + '(-|$)'     , 1));
        }

        return 0;
    }

    function _qwery(selector, _root) {
        var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root;
        var tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr));
        var dividedTokens = selector.match(dividers);

        if (!tokens.length) {
            return r;
        }

        token = (tokens = tokens.slice(0)).pop();

        if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) {
            root = byId(_root, m[1]);
        }

        if (!root) {
            return r;
        }

        intr = q(token);
        els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
            function (r) {
                while (root = root.nextSibling) {
                    root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
                }
                return r
            }([]) :
            root[byTag](intr[1] || '*');

        for (i = 0, l = els.length; i < l; i++) {
            if (item = interpret.apply(els[i], intr)) r[r.length] = item;
        }

        if (!tokens.length) {
            return r;
        }

        each(r, function (e) {
            if (ancestorMatch(e, tokens, dividedTokens)) {
                ret[ret.length] = e;
            }
        });

        return ret;
    }

    function is(el, selector, root) {
        if (isNode(selector)) {
            return el == selector;
        }

        if (arrayLike(selector)) {
            return !!~flatten(selector).indexOf(el);
        }

        var selectors = selector.split(','), tokens, dividedTokens;

        while (selector = selectors.pop()) {
            tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr));
            dividedTokens = selector.match(dividers);
            tokens = tokens.slice(0);

            if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
                return true;
            }
        }

        return false;
    }

    function ancestorMatch(el, tokens, dividedTokens, root) {
        var cand;

        function crawl(e, i, p) {
            while (p = walker[dividedTokens[i]](p, e)) {
                if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
                    if (i) {
                        if (cand = crawl(p, i - 1, p)) {
                            return cand;
                        }
                    }
                    else {
                        return p;
                    }
                }
            }
        }

        return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root));
    }

    function isNode(el, t) {
        return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9);
    }

    function uniq(ar) {
        var a = [], i, j;

        o: for (i = 0; i < ar.length; ++i) {
            for (j = 0; j < a.length; ++j) {
                if (a[j] == ar[i]) {
                    continue o;
                }
            }

            a[a.length] = ar[i];
        }

        return a;
    }

    function arrayLike(o) {
        return (typeof o === 'object' && isFinite(o.length));
    }

    function normalizeRoot(root) {
        if (!root) {
            return doc;
        }

        if (typeof root == 'string') {
            return qwery(root)[0];
        }

        if (!root[nodeType] && arrayLike(root)) {
            return root[0];
        }

        return root;
    }

    function byId(root, id, el) {
        return root[nodeType] === 9 ? root.getElementById(id) :
            root.ownerDocument &&
            (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]));
    }

    function qwery(selector, _root) {
        var m, el, root = normalizeRoot(_root);

        if (!root || !selector) {
            return [];
        }

        if (selector === window || isNode(selector)) {
            return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : [];
        }

        if (selector && arrayLike(selector)) {
            return flatten(selector);
        }

        if (m = selector.match(easy)) {
            if (m[1]) {
                return (el = byId(root, m[1])) ? [el] : [];
            }

            if (m[2]) {
                return arrayify(root[byTag](m[2]));
            }

            if (hasByClass && m[3]) {
                return arrayify(root[byClass](m[3]));
            }
        }

        return select(selector, root);
    }

    function collectSelector(root, collector) {
        return function (s) {
            var oid, nid;

            if (splittable.test(s)) {
                if (root[nodeType] !== 9) {
                    if (!(nid = oid = root.getAttribute('id'))) {
                        root.setAttribute('id', nid = '__qwerymeupscotty');
                    }

                    s = '[id="' + nid + '"]' + s;
                    collector(root.parentNode || root, s, true);
                    oid || root.removeAttribute('id');
                }

                return;
            }

            s.length && collector(root, s, false);
        }
    }

    var isAncestor = 'compareDocumentPosition' in html ?
        function (element, container) {
            return (container.compareDocumentPosition(element) & 16) == 16;
        } : 'contains' in html ?
        function (element, container) {
            container = container[nodeType] === 9 || container == window ? html : container;
            return container !== element && container.contains(element);
        } :
        function (element, container) {
            while (element = element.parentNode) if (element === container) return 1;
            return 0;
        },
        getAttr = function () {
            var e = doc.createElement('p');
            return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
                function (e, a) {
                    return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
                    e.getAttribute(a, 2) : e.getAttribute(a);
            } :
            function (e, a) { return e.getAttribute(a); };
        }(),
    hasByClass = !!doc[byClass],
    hasQSA = doc.querySelector && doc[qSA],
    selectQSA = function (selector, root) {
        var result = [], ss, e;

        try {
            if (root[nodeType] === 9 || !splittable.test(selector)) {
                return arrayify(root[qSA](selector));
            }

            each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
                e = ctx[qSA](s);
                if (e.length == 1) {
                    result[result.length] = e.item(0);
                }
                else if (e.length) {
                    result = result.concat(arrayify(e));
                }
            }));

            return ss.length > 1 && result.length > 1 ? uniq(result) : result;
        }
        catch (ex) {}
        return selectNonNative(selector, root);
    },
    selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss;
        selector = selector.replace(normalizr, '$1');

        if (m = selector.match(tagAndOrClass)) {
            r = classRegex(m[2]);
            items = root[byTag](m[1] || '*');

            for (i = 0, l = items.length; i < l; i++) {
                if (r.test(items[i].className)) {
                    result[result.length] = items[i];
                }
            }

            return result;
        }

        each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
            r = _qwery(s, ctx);

            for (i = 0, l = r.length; i < l; i++) {
                if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) {
                    result[result.length] = r[i];
                }
            }
        }));

        return ss.length > 1 && result.length > 1 ? uniq(result) : result;
    },
    configure = function (options) {
        if (typeof options[useNativeQSA] !== 'undefined') {
            select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative;
        }
    };

    configure({ useNativeQSA: true });

    qwery.configure = configure;
    qwery.uniq = uniq;
    qwery.is = is;
    qwery.pseudos = {};

    Qwery = qwery;
})();

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
    this._nextFrame = setTimeout(function(){ _this.nextFrame(); }, vschess.threadTimeout);
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
        this._nextFrame = setTimeout(function(){ _this.nextFrame(); }, vschess.threadTimeout);
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

// 主程序
var vschess = {
	// 当前版本号
	version: "2.6.4",

	// 版本时间戳
	timestamp: "Tue, 11 Feb 2025 18:08:29 +0800",

	// 默认局面，使用 16x16 方式存储数据，虽然浪费空间，但是便于运算，效率较高
	// situation[0] 表示的是当前走棋方，1 为红方，2 为黑方
	// situation[1] 表示的是当前回合数
	// 其余部分 0 表示棋盘外面，1 表示该位置没有棋子
	// 棋子标识采用 16 进制方式计算，如 21 为十六进制的 15，1 表示红方，与 situation[0] 对应，5 表示帅（将）
	// 1:车 2:马 3:相（象） 4:仕（士） 5:帅（将） 6:炮 7:兵（卒）
	situation: [
		1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0,33,34,35,36,37,36,35,34,33, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 1,38, 1, 1, 1, 1, 1,38, 1, 0, 0, 0, 0,
		0, 0, 0,39, 1,39, 1,39, 1,39, 1,39, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0,23, 1,23, 1,23, 1,23, 1,23, 0, 0, 0, 0,
		0, 0, 0, 1,22, 1, 1, 1, 1, 1,22, 1, 0, 0, 0, 0,
		0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		0, 0, 0,17,18,19,20,21,20,19,18,17, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	],

	// 九宫格
	castle: [
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	],

	// 九宫格索引
	castleR: [166, 167, 168, 182, 183, 184, 198, 199, 200], // 帅
	castleB: [ 54,  55,  56,  70,  71,  72,  86,  87,  88], // 将

	// 帅(将)的步长
	kingDelta: [-16, -1, 1, 16],

	// 仕(士)的步长
	advisorDelta: [-17, -15, 15, 17],

	// 马的步长，以帅(将)的步长作为马腿
	knightDelta: [[-33, -31], [-18, 14], [-14, 18], [31, 33]],

	// 被马将军的步长，以仕(士)的步长作为马腿
	knightCheckDelta: [[-33, -18], [-31, -14], [14, 31], [18, 33]],

	// 棋盘转换为局面，就是不同格式之间的映射，下同
	b2s: [
		 51,  52,  53,  54,  55,  56,  57,  58,  59,
		 67,  68,  69,  70,  71,  72,  73,  74,  75,
		 83,  84,  85,  86,  87,  88,  89,  90,  91,
		 99, 100, 101, 102, 103, 104, 105, 106, 107,
		115, 116, 117, 118, 119, 120, 121, 122, 123,
		131, 132, 133, 134, 135, 136, 137, 138, 139,
		147, 148, 149, 150, 151, 152, 153, 154, 155,
		163, 164, 165, 166, 167, 168, 169, 170, 171,
		179, 180, 181, 182, 183, 184, 185, 186, 187,
		195, 196, 197, 198, 199, 200, 201, 202, 203
	],

	// 局面转换为棋盘
	s2b: [
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  1,  2,  3,  4,  5,  6,  7,  8, 0, 0, 0, 0,
		0, 0, 0,  9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 0, 0, 0,
		0, 0, 0, 18, 19, 20, 21, 22, 23, 24, 25, 26, 0, 0, 0, 0,
		0, 0, 0, 27, 28, 29, 30, 31, 32, 33, 34, 35, 0, 0, 0, 0,
		0, 0, 0, 36, 37, 38, 39, 40, 41, 42, 43, 44, 0, 0, 0, 0,
		0, 0, 0, 45, 46, 47, 48, 49, 50, 51, 52, 53, 0, 0, 0, 0,
		0, 0, 0, 54, 55, 56, 57, 58, 59, 60, 61, 62, 0, 0, 0, 0,
		0, 0, 0, 63, 64, 65, 66, 67, 68, 69, 70, 71, 0, 0, 0, 0,
		0, 0, 0, 72, 73, 74, 75, 76, 77, 78, 79, 80, 0, 0, 0, 0,
		0, 0, 0, 81, 82, 83, 84, 85, 86, 87, 88, 89, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0,
		0, 0, 0,  0,  0,  0,  0,  0,  0,  0,  0,  0, 0, 0, 0, 0
	],

	// 棋盘转换为 ICCS
	b2i: [
		"a9", "b9", "c9", "d9", "e9", "f9", "g9", "h9", "i9",
		"a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8", "i8",
		"a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7", "i7",
		"a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6", "i6",
		"a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5", "i5",
		"a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4", "i4",
		"a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3", "i3",
		"a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", "i2",
		"a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1", "i1",
		"a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0", "i0"
	],

	// ICCS 转换为棋盘
	i2b: {
		a9:  0, b9:  1, c9:  2, d9:  3, e9:  4, f9:  5, g9:  6, h9:  7, i9:  8,
		a8:  9, b8: 10, c8: 11, d8: 12, e8: 13, f8: 14, g8: 15, h8: 16, i8: 17,
		a7: 18, b7: 19, c7: 20, d7: 21, e7: 22, f7: 23, g7: 24, h7: 25, i7: 26,
		a6: 27, b6: 28, c6: 29, d6: 30, e6: 31, f6: 32, g6: 33, h6: 34, i6: 35,
		a5: 36, b5: 37, c5: 38, d5: 39, e5: 40, f5: 41, g5: 42, h5: 43, i5: 44,
		a4: 45, b4: 46, c4: 47, d4: 48, e4: 49, f4: 50, g4: 51, h4: 52, i4: 53,
		a3: 54, b3: 55, c3: 56, d3: 57, e3: 58, f3: 59, g3: 60, h3: 61, i3: 62,
		a2: 63, b2: 64, c2: 65, d2: 66, e2: 67, f2: 68, g2: 69, h2: 70, i2: 71,
		a1: 72, b1: 73, c1: 74, d1: 75, e1: 76, f1: 77, g1: 78, h1: 79, i1: 80,
		a0: 81, b0: 82, c0: 83, d0: 84, e0: 85, f0: 86, g0: 87, h0: 88, i0: 89
	},

	// 局面转换为 ICCS
	s2i: [
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0, "a9", "b9", "c9", "d9", "e9", "f9", "g9", "h9", "i9", 0, 0, 0, 0,
		0, 0, 0, "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8", "i8", 0, 0, 0, 0,
		0, 0, 0, "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7", "i7", 0, 0, 0, 0,
		0, 0, 0, "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6", "i6", 0, 0, 0, 0,
		0, 0, 0, "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5", "i5", 0, 0, 0, 0,
		0, 0, 0, "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4", "i4", 0, 0, 0, 0,
		0, 0, 0, "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3", "i3", 0, 0, 0, 0,
		0, 0, 0, "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", "i2", 0, 0, 0, 0,
		0, 0, 0, "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1", "i1", 0, 0, 0, 0,
		0, 0, 0, "a0", "b0", "c0", "d0", "e0", "f0", "g0", "h0", "i0", 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0,
		0, 0, 0,    0,    0,    0,    0,    0,    0,    0,    0,    0, 0, 0, 0, 0
	],

	// ICCS 转换为局面
	i2s: {
		a9:  51, b9:  52, c9:  53, d9:  54, e9:  55, f9:  56, g9:  57, h9:  58, i9:  59,
		a8:  67, b8:  68, c8:  69, d8:  70, e8:  71, f8:  72, g8:  73, h8:  74, i8:  75,
		a7:  83, b7:  84, c7:  85, d7:  86, e7:  87, f7:  88, g7:  89, h7:  90, i7:  91,
		a6:  99, b6: 100, c6: 101, d6: 102, e6: 103, f6: 104, g6: 105, h6: 106, i6: 107,
		a5: 115, b5: 116, c5: 117, d5: 118, e5: 119, f5: 120, g5: 121, h5: 122, i5: 123,
		a4: 131, b4: 132, c4: 133, d4: 134, e4: 135, f4: 136, g4: 137, h4: 138, i4: 139,
		a3: 147, b3: 148, c3: 149, d3: 150, e3: 151, f3: 152, g3: 153, h3: 154, i3: 155,
		a2: 163, b2: 164, c2: 165, d2: 166, e2: 167, f2: 168, g2: 169, h2: 170, i2: 171,
		a1: 179, b1: 180, c1: 181, d1: 182, e1: 183, f1: 184, g1: 185, h1: 186, i1: 187,
		a0: 195, b0: 196, c0: 197, d0: 198, e0: 199, f0: 200, g0: 201, h0: 202, i0: 203
	},

	// 棋子标识转换为 Fen 字符
	n2f: "*****************RNBAKCP*********rnbakcp".split(""),

	// Fen 字符转换为棋子标识
	f2n: { R: 17, N: 18, H: 18, B: 19, E: 19, A: 20, K: 21, C: 22, P: 23, r: 33, n: 34, h: 34, b: 35, e: 35, a: 36, k: 37, c: 38, p: 39, "*": 1 },

	// 棋盘方向映射
	turn: [
		[
			 0,  1,  2,  3,  4,  5,  6,  7,  8,
			 9, 10, 11, 12, 13, 14, 15, 16, 17,
			18, 19, 20, 21, 22, 23, 24, 25, 26,
			27, 28, 29, 30, 31, 32, 33, 34, 35,
			36, 37, 38, 39, 40, 41, 42, 43, 44,
			45, 46, 47, 48, 49, 50, 51, 52, 53,
			54, 55, 56, 57, 58, 59, 60, 61, 62,
			63, 64, 65, 66, 67, 68, 69, 70, 71,
			72, 73, 74, 75, 76, 77, 78, 79, 80,
			81, 82, 83, 84, 85, 86, 87, 88, 89
		],
		[
			 8,  7,  6,  5,  4,  3,  2,  1,  0,
			17, 16, 15, 14, 13, 12, 11, 10,  9,
			26, 25, 24, 23, 22, 21, 20, 19, 18,
			35, 34, 33, 32, 31, 30, 29, 28, 27,
			44, 43, 42, 41, 40, 39, 38, 37, 36,
			53, 52, 51, 50, 49, 48, 47, 46, 45,
			62, 61, 60, 59, 58, 57, 56, 55, 54,
			71, 70, 69, 68, 67, 66, 65, 64, 63,
			80, 79, 78, 77, 76, 75, 74, 73, 72,
			89, 88, 87, 86, 85, 84, 83, 82, 81
		],
		[
			81, 82, 83, 84, 85, 86, 87, 88, 89,
			72, 73, 74, 75, 76, 77, 78, 79, 80,
			63, 64, 65, 66, 67, 68, 69, 70, 71,
			54, 55, 56, 57, 58, 59, 60, 61, 62,
			45, 46, 47, 48, 49, 50, 51, 52, 53,
			36, 37, 38, 39, 40, 41, 42, 43, 44,
			27, 28, 29, 30, 31, 32, 33, 34, 35,
			18, 19, 20, 21, 22, 23, 24, 25, 26,
			 9, 10, 11, 12, 13, 14, 15, 16, 17,
			 0,  1,  2,  3,  4,  5,  6,  7,  8
		],
		[
			89, 88, 87, 86, 85, 84, 83, 82, 81,
			80, 79, 78, 77, 76, 75, 74, 73, 72,
			71, 70, 69, 68, 67, 66, 65, 64, 63,
			62, 61, 60, 59, 58, 57, 56, 55, 54,
			53, 52, 51, 50, 49, 48, 47, 46, 45,
			44, 43, 42, 41, 40, 39, 38, 37, 36,
			35, 34, 33, 32, 31, 30, 29, 28, 27,
			26, 25, 24, 23, 22, 21, 20, 19, 18,
			17, 16, 15, 14, 13, 12, 11, 10,  9,
			 8,  7,  6,  5,  4,  3,  2,  1,  0
		]
	],

	// 已创建棋盘对象列表
	chessList: [],

	// 默认 Fen 串
	defaultFen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",

	// 空白 Fen 串
	blankFen: "9/9/9/9/9/9/9/9/9/9 w - - 0 1",

	// 棋谱信息项目列表
	info: {
		name: {
			title		: "\u68cb\u5c40\u6807\u9898",
			event		: "\u8d5b\u4e8b\u540d\u79f0",
			red			: "\u7ea2\u65b9\u540d\u79f0",
			redteam		: "\u7ea2\u65b9\u56e2\u4f53",
			redname		: "\u7ea2\u65b9\u59d3\u540d",
			redeng		: "\u7ea2\u65b9\u82f1\u6587\u540d",
			redlevel	: "\u7ea2\u65b9\u7b49\u7ea7",
			redrating	: "\u7ea2\u65b9\u7b49\u7ea7\u5206",
			redtime		: "\u7ea2\u65b9\u7528\u65f6",
			black		: "\u9ed1\u65b9\u540d\u79f0",
			blackteam	: "\u9ed1\u65b9\u56e2\u4f53",
			blackname	: "\u9ed1\u65b9\u59d3\u540d",
			blackeng	: "\u9ed1\u65b9\u82f1\u6587\u540d",
			blacklevel	: "\u9ed1\u65b9\u7b49\u7ea7",
			blackrating	: "\u9ed1\u65b9\u7b49\u7ea7\u5206",
			blacktime	: "\u9ed1\u65b9\u7528\u65f6",
			ecco		: "\u5f00\u5c40\u7f16\u53f7",
			open		: "\u5e03\u5c40\u7c7b\u578b",
			variation	: "\u53d8\u4f8b\u7c7b\u578b",
			result		: "\u5bf9\u5c40\u7ed3\u679c",
			remark		: "\u8bc4\u6ce8\u4eba\u5458",
			author		: "\u68cb\u8c31\u4f5c\u8005",
			group		: "\u8d5b\u4e8b\u7ec4\u522b",
			date		: "\u6bd4\u8d5b\u65e5\u671f",
			place		: "\u6bd4\u8d5b\u5730\u70b9",
			round		: "\u6bd4\u8d5b\u8f6e\u6b21",
			table		: "\u6bd4\u8d5b\u53f0\u6b21",
			judge		: "\u6267\u53f0\u88c1\u5224",
			record		: "\u68cb\u8c31\u8bb0\u5f55\u5458"
		},
		pfc: {
			date		: "create-time"
		},
		DhtmlXQ: {},
		DHJHtmlXQ: {
			title		: 10,
			event		: 11,
			date		: 13,
			place		: 14,
			round		: 15,
			table		: 16,
			red			: 17,
			redname		: 18,
			redlevel	: 19,
			redrating	: 20,
			black		: 21,
			blackname	: 22,
			blacklevel	: 23,
			blackrating	: 24,
			result		: 28,
			redtime		: 29,
			blacktime	: 30,
			open		: 36,
			variation	: 37,
			remark		: 40,
			author		: 41,
			record		: 42
		},
		pgn: {
			place		: "Site",
			open		: "Opening",
			ecco		: "ECCO"
		}
	},

	// ECCO 编号目录
	eccoDir: {
		A: "\u5176\u4ed6\u5f00\u5c40 \u4e0a\u4ed5\u5c40 \u8fb9\u9a6c\u5c40 \u8fb9\u70ae\u5c40 \u5de1\u6cb3\u70ae\u5c40 \u8fc7\u6cb3\u70ae\u5c40 \u5175\u5e95\u70ae\u5c40 \u91d1\u94a9\u70ae\u5c40 \u8fb9\u5175\u5c40  \u98de\u76f8\u5c40 \u987a\u76f8\u5c40 \u5217\u76f8\u5c40 \u98de\u76f8\u5bf9\u8fdb\u5de6\u9a6c \u98de\u76f8\u5bf9\u8fdb\u53f3\u9a6c \u98de\u76f8\u8fdb\u4e09\u5175\u5bf9\u8fdb\u53f3\u9a6c \u98de\u76f8\u8fdb\u4e03\u5175\u5bf9\u8fdb\u53f3\u9a6c    \u98de\u76f8\u5bf9\u5de6\u58eb\u89d2\u70ae \u98de\u76f8\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u5de6\u9a6c\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u5de6\u8fb9\u9a6c\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u6a2a\u8f66\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u4e09\u5175\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u8fdb\u4e03\u5175\u5bf9\u53f3\u58eb\u89d2\u70ae \u98de\u76f8\u5bf9\u5de6\u4e2d\u70ae \u98de\u76f8\u8f6c\u5c4f\u98ce\u9a6c\u5bf9\u5de6\u4e2d\u70ae \u98de\u76f8\u5bf9\u53f3\u4e2d\u70ae \u98de\u76f8\u5bf9\u5de6\u8fc7\u5bab\u70ae \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u7ea2\u76f4\u8f66\u5bf9\u9ed1\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u7ea2\u76f4\u8f66\u8fb9\u70ae\u5bf9\u9ed1\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u53f3\u9a6c\u5bf9\u5de6\u8fc7\u5bab\u70ae#\u4e92\u8fdb\u4e03\u5175 \u98de\u76f8\u5bf9\u53f3\u8fc7\u5bab\u70ae \u98de\u76f8\u5bf9\u8fdb\uff17\u5352 \u98de\u76f8\u8fdb\u5de6\u9a6c\u5bf9\u8fdb\uff17\u5352 \u98de\u76f8\u4e92\u8fdb\u4e03\u5175\u5c40 \u98de\u76f8\u5bf9\u8fdb\uff13\u5352 \u8d77\u9a6c\u5c40 \u8d77\u9a6c\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u8fb9\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u4ed5\u89d2\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u8f6c\u4e2d\u70ae\u5bf9\u8fdb\uff17\u5352 \u8d77\u9a6c\u4e92\u8fdb\u4e03\u5175\u5c40     \u4ed5\u89d2\u70ae\u5c40 \u4ed5\u89d2\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u4ed5\u89d2\u70ae\u5bf9\u53f3\u4e2d\u70ae \u4ed5\u89d2\u70ae\u8f6c\u53cd\u5bab\u9a6c\u5bf9\u53f3\u4e2d\u70ae \u4ed5\u89d2\u70ae\u5bf9\u8fdb\uff17\u5352      \u8fc7\u5bab\u70ae\u5c40 \u8fc7\u5bab\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u8fc7\u5bab\u70ae\u5bf9\u6a2a\u8f66 \u8fc7\u5bab\u70ae\u5bf9\u5de6\u4e2d\u70ae \u8fc7\u5bab\u70ae\u76f4\u8f66\u5bf9\u5de6\u4e2d\u70ae \u8fc7\u5bab\u70ae\u76f4\u8f66\u5bf9\u5de6\u4e2d\u70ae\u6a2a\u8f66".split(" "),
		B: "\u4e2d\u70ae\u5c40 \u4e2d\u70ae\u5bf9\u8fdb\u53f3\u9a6c \u4e2d\u70ae\u5bf9\u8fdb\u53f3\u9a6c\u5148\u4e0a\u58eb \u4e2d\u70ae\u5bf9\u9e33\u9e2f\u70ae \u4e2d\u70ae\u5bf9\u53f3\u4e09\u6b65\u864e \u4e2d\u70ae\u5bf9\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u5bf9\u9f9f\u80cc\u70ae \u4e2d\u70ae\u5bf9\u5de6\u70ae\u5c01\u8f66   \u4e2d\u70ae\u5bf9\u5355\u63d0\u9a6c \u4e2d\u70ae\u5bf9\u58eb\u89d2\u70ae\u8f6c\u5355\u63d0\u9a6c \u4e2d\u70ae\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66 \u4e2d\u70ae\u8fdb\u4e03\u5175\u5bf9\u5355\u63d0\u9a6c\u6a2a\u8f66      \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u8fb9\u76f8\u5bf9\u5de6\u4e09\u6b65\u864e\u9a91\u6cb3\u8f66 \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u8fc7\u6cb3\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e \u4e2d\u70ae\u4e24\u5934\u86c7\u5bf9\u5de6\u4e09\u6b65\u864e     \u4e2d\u70ae\u5bf9\u53cd\u5bab\u9a6c\u540e\u8865\u5de6\u9a6c \u4e2d\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u6025\u8fdb\u5de6\u9a6c\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u53cd\u5bab\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516b\u70ae\u5bf9\u53cd\u5bab\u9a6c    \u4e94\u516d\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66\u8fb9\u70ae \u4e94\u516d\u70ae\u5de6\u6b63\u9a6c\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u76f4\u8f66\u8fb9\u70ae\u8fdb\uff17\u5352 \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u53cd\u5bab\u9a6c     \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u5de6\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u5de6\u6a2a\u8f66 \u4e94\u4e03\u70ae\u5bf9\u53cd\u5bab\u9a6c\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c#\u9ed1\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u53cd\u5bab\u9a6c#\u7ea2\u5f03\u53cc\u5175\u5bf9\u9ed1\u53f3\u70ae\u8fc7\u6cb3".split(" "),
		C: "\u4e2d\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175 \u4e2d\u70ae\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175\u5bf9\u9ed1\u53cc\u70ae\u8fc7\u6cb3 \u4e2d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u6a2a\u8f66    \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de1\u6cb3\u70ae \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fb9\u70ae \u4e2d\u70ae\u53f3\u6a2a\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u4e2d\u5175 \u4e2d\u70ae\u5de1\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u4e0d\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u8fdb\u5de6\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u4e09\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u4e03\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e03\u8def\u9a6c\u5bf9\u5c4f\u98ce\u9a6c\u4e24\u5934\u86c7#\u7ea2\u5de6\u6a2a\u8f66\u5151\u53cc\u5175\u5bf9\u9ed1\u9ad8\u53f3\u70ae     \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u4e0a\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u98de\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u53f3\u6a2a\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u53f3\u70ae\u8fc7\u6cb3 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u4e03\u8def\u9a6c\u9ad8\u5de6\u70ae\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u76d8\u6cb3#\u7ea2\u8fb9\u70ae\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4e03\u8def\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae\u4e0a\u53f3\u58eb\u53f3\u76f4\u8f66 \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u4ed5\u89d2\u70ae\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c\u5e73\u70ae\u5151\u8f66#\u7ea2\u8fdb\u4e2d\u5175\u5bf9\u9ed1\u9000\u8fb9\u70ae \u4e94\u516d\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u5de6\u8fb9\u9a6c\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u8fdb\uff17\u5352\u53f3\u76f4\u8f66 \u4e94\u516d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u4e24\u5934\u86c7    \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u9ed1\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u5de6\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u53f3\u70ae\u5de1\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u76f4\u8f66\u53f3\u70ae\u8fc7\u6cb3 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff17\u5352#\u9ed1\u53f3\u70ae\u5de1\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e03\u5175\u5bf9\u5c4f\u98ce\u9a6c  \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff13\u5352 \u4e94\u4e03\u70ae\u5bf9\u5c4f\u98ce\u9a6c\u8fdb\uff13\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u53f3\u8f66\u5de1\u6cb3\u5bf9\u9ed1\u98de\u5de6\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u98de\u53f3\u8c61 \u4e94\u4e03\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c\u8fb9\u5352\u53f3\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u5de6\u6a2a\u8f66\u5bf9\u9ed1\u5151\u8fb9\u5352  \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61\u53f3\u6a2a\u8f66 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u5de6\u8c61\u5de6\u70ae\u5de1\u6cb3 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u9ed1\u98de\u53f3\u8c61 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u5de6\u9a6c\u5916\u76d8\u6cb3 \u4e2d\u70ae\u5de1\u6cb3\u70ae\u7f13\u5f00\u8f66\u5bf9\u5c4f\u98ce\u9a6c\u5de6\u9a6c\u5916\u76d8\u6cb3#\u7ea2\u53f3\u6a2a\u8f66    \u4e94\u516b\u70ae\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u6b63\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u4e0a\u58eb \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u5151\uff17\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5bf9\u9ed1\u8fb9\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5de6\u8fb9\u9a6c\u5e73\u70ae\u538b\u9a6c\u5bf9\u9ed1\u8fb9\u5352 \u4e94\u516b\u70ae\u4e92\u8fdb\u4e09\u5175\u5bf9\u5c4f\u98ce\u9a6c#\u7ea2\u5e73\u70ae\u538b\u9a6c \u4e94\u4e5d\u70ae\u5bf9\u5c4f\u98ce\u9a6c".split(" "),
		D: "\u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u5176\u4ed6 \u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u6a2a\u8f66 \u987a\u70ae\u7f13\u5f00\u8f66\u5bf9\u76f4\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u7f13\u5f00\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u76f4\u8f66 \u987a\u70ae\u6a2a\u8f66\u5bf9\u76f4\u8f66\u5de1\u6cb3     \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u5de6\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u53f3\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u5151\u76f4\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u8fc7\u6cb3\u70ae \u987a\u70ae\u76f4\u8f66\u5bf9\u7f13\u5f00\u8f66#\u9ed1\u8fb9\u70ae     \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5148\u4e0a\u4ed5 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5de6\u8fb9\u9a6c \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u5de1\u6cb3\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fc7\u6cb3\u8f66 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4ed5\u89d2\u70ae \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fdb\u4e09\u5175 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u8fdb\u4e03\u5175 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4e24\u5934\u86c7 \u987a\u70ae\u76f4\u8f66\u5bf9\u6a2a\u8f66#\u7ea2\u4e24\u5934\u86c7\u5bf9\u9ed1\u53cc\u6a2a\u8f66 \u4e2d\u70ae\u4e0d\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u53f3\u9a6c\u76d8\u6cb3 \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u4e03\u8def\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u5de6\u8fb9\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u8fdb\u70ae\u6253\u9a6c \u4e2d\u70ae\u8fdb\u4e09\u5175\u5bf9\u5de6\u70ae\u5c01\u8f66\u8f6c\u5217\u70ae#\u7ea2\u4e24\u5934\u86c7    \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae \u4e2d\u70ae\u8fdb\u4e2d\u5175\u5bf9\u5de6\u4e09\u6b65\u864e\u9a91\u6cb3\u8f66\u8f6c\u5217\u70ae \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae#\u7ea2\u5de6\u76f4\u8f66 \u4e2d\u70ae\u5bf9\u5de6\u4e09\u6b65\u864e\u8f6c\u5217\u70ae#\u7ea2\u4e24\u5934\u86c7       \u4e2d\u70ae\u5bf9\u5217\u70ae \u4e2d\u70ae\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u53f3\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u8fc7\u6cb3\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u5de6\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae \u4e2d\u70ae\u53cc\u76f4\u8f66\u5bf9\u540e\u8865\u5217\u70ae".split(" "),
		E: "\u4ed9\u4eba\u6307\u8def\u5c40 \u4ed9\u4eba\u6307\u8def\u5bf9\u98de\u8c61 \u4ed9\u4eba\u6307\u8def\u8fdb\u53f3\u9a6c\u5bf9\u98de\u8c61 \u4ed9\u4eba\u6307\u8def\u5bf9\u4e2d\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u4ed5\u89d2\u70ae\u6216\u8fc7\u5bab\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u91d1\u94a9\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u8fdb\u53f3\u9a6c \u4ed9\u4eba\u6307\u8def\u4e92\u8fdb\u53f3\u9a6c\u5c40 \u4e24\u5934\u86c7\u5bf9\u8fdb\u53f3\u9a6c \u4e24\u5934\u86c7\u5bf9\u8fdb\u53f3\u9a6c\u8f6c\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u98de\u76f8\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u53f3\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61#\u7ea2\u53f3\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u53f3\u8c61#\u4e92\u8fdb\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u8f6c\u987a\u70ae   \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5148\u4e0a\u4ed5 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u8fdb\u5de6\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u8fdb\u5de6\u9a6c\u5bf9\u9ed1\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u5bf9\u9ed1\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u4e0a\u58eb \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u8fc7\u6cb3 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u9a6c\u76d8\u6cb3\u5bf9\u9ed1\u53f3\u6a2a\u8f66\u8fb9\u5352   \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u9ed1\u8fdb\uff17\u5352 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u9ed1\u8fde\u8fdb\uff17\u5352 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u62d0\u89d2\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb7\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de6\u76f4\u8f66\u53f3\u8fb9\u9a6c\u4e0a\u4ed5\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u5de1\u6cb3\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u53cc\u76f4\u8f66\u53f3\u8fb9\u9a6c\u5bf9\u9ed1\u8fde\u8fdb\uff17\u5352\u53f3\u6a2a\u8f66 \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u53f3\u8fb9\u9a6c \u4ed9\u4eba\u6307\u8def\u8f6c\u5de6\u4e2d\u70ae\u5bf9\u5352\u5e95\u70ae\u98de\u5de6\u8c61#\u7ea2\u70ae\u6253\u4e2d\u5352  \u5bf9\u5175\u5c40 \u5bf9\u5175\u8fdb\u53f3\u9a6c\u5c40 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u98de\u76f8 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u6a2a\u8f66 \u5bf9\u5175\u4e92\u8fdb\u53f3\u9a6c\u5c40#\u7ea2\u8fb9\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae\u5bf9\u53f3\u4e2d\u70ae \u5bf9\u5175\u8f6c\u5175\u5e95\u70ae\u5bf9\u5de6\u4e2d\u70ae".split(" ")
	}
};

// 自身路径
vschess.selfPath = (function(){
	var currentElement = document.documentElement;

	while (currentElement.tagName.toLowerCase() !== "script") {
		currentElement = currentElement.lastChild;
	}

	return currentElement.src;
})();

// 默认路径为本程序的路径
vschess.defaultPath = vschess.selfPath.substring(0, vschess.selfPath.lastIndexOf("/") + 1);

// 涉及页面 DOM 的属性，单独抽出来
$.extend(vschess, {
	// Placeholder 支持情况
	placeholder: "placeholder" in document.createElement("input"),

	// 本地保存支持情况
	localDownload: !!window.Blob && !!window.URL && "download" in document.createElement("a"),

	// 标签列表
	tabList: "board move comment info share export edit config".split(" "),

	// 钩子列表
	callbackList: "beforeClickAnimate afterClickAnimate loadFinish selectPiece unSelectPiece afterStartFen afterAnimate".split(" "),

	// 二进制棋谱扩展名列表
	binaryExt: "ccm xqf cbr".split(" "),

	// 全局样式是否已加载完成的标记
	globalLoaded: false,

	// 全局样式加载完成后的回调
	globalLoadedCallback: [],

	// 声音列表
	soundList: "click bomb eat move check lose illegal".split(" "),

	// 音效组件缓存
	soundObject: {},

	// 风格音效是否已加载的标记，保证每个风格的音效只加载一次
	soundInit: {},

	// 风格样式是否已加载的标记，保证每个风格的样式只加载一次
	styleInit: {},

	// 风格样式是否已加载完成的标记
	styleLoaded: {},

	// 风格样式加载完成后的回调
	styleLoadedCallback: {},

	// 布局样式是否已加载的标记，保证每个布局的样式只加载一次
	layoutInit: {},

	// 布局样式是否已加载完成的标记
	layoutLoaded: {},

	// 布局样式加载完成后的回调
	layoutLoadedCallback: {},

	// 伪线程延时，20 为宜
	threadTimeout: 20,

	// 大棋谱生成东萍和鹏飞格式节点数临界点
	bigBookCritical: 10000,

	// 页面 Device Pixel Ratio
	dpr: window.devicePixelRatio || 1,

	// 编辑局面开始按钮列表
	editStartList: ["editStartButton", "editNodeStartButton", "editBeginButton", "editBlankButton", "editOpenButton"],

	// 编辑局面组件列表
	editModuleList: ["editEndButton", "editCancelButton", "editTips", "editTextarea", "editTextareaPlaceholder", "editPieceArea", "editBoard", "recommendClass", "recommendList", "editEditStartText", "editEditStartRound", "editEditStartPlayer"],

	// 粘贴棋谱组件列表
	editNodeModuleList: ["editNodeEndButton", "editNodeCancelButton", "editNodeTextarea", "editNodeTextareaPlaceholder"],

	// 分享代码组件列表
	shareCodeModuleList: ["shareHTMLTitle", "shareHTMLTextBox", "shareUBBTitle", "shareUBBTextBox"],

	// 状态参数语义化
	code: {
		// 棋子单击事件是否响应状态，0(0x00) 双方不响应，1(0x01) 仅黑方响应，2(0x10) 仅红方响应，3(0x11) 双方响应
		clickResponse: { none: 0, black: 1, red: 2, both: 3 },

		// 棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下，3(0x11) 对角旋转（左右+上下）
		turn: { none: 0, mirror: 1, reverse: 2, round: 3 }
	},

	// 可自动识别的棋谱信息项目列表
	autoInfo: "ecco open variation result".split(" "),

    // 可导出棋谱格式列表
    exportFormatList: {
        PGN_Chinese: "\u4e2d\u6587 PGN \u683c\u5f0f",
        PGN_WXF: "WXF PGN \u683c\u5f0f",
        PGN_ICCS: "ICCS PGN \u683c\u5f0f",
        PengFei: "\u9e4f\u98de PFC \u683c\u5f0f",
        DhtmlXQ: "\u4e1c\u840d DhtmlXQ UBB \u683c\u5f0f",
        XQF: "\u8c61\u68cb\u6f14\u64ad\u5ba4 XQF \u683c\u5f0f",
        DHJHtmlXQ: "\u5e7f\u4e1c\u8c61\u68cb\u7f51 DHJHtmlXQ \u683c\u5f0f",
        ChessDB: "\u4e91\u5e93\u6307\u4ee4\u683c\u5f0f",
        Text: "\u6587\u672c TXT \u683c\u5f0f",
        QQ: "\uff31\uff31 CHE \u683c\u5f0f",
        TextBoard: "\u6587\u5b57\u68cb\u76d8"
    },

	// 必须为起始局面才可以导出的棋谱格式列表
	exportFormatListIfNeedStart: "QQ".split(" ")
});

// 程序默认参数
vschess.defaultOptions = {
	// 中文着法文字
	ChineseChar: {
		Piece	 : "\u8f66\u9a6c\u76f8\u4ed5\u5e05\u70ae\u5175\u8f66\u9a6c\u8c61\u58eb\u5c06\u70ae\u5352",
		Number	 : "\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19",
		PawnIndex: "\u4e00\u4e8c\u4e09\u56db\u4e94\u4e00\u4e8c\u4e09\u56db\u4e94",
		Text	 : "\u524d\u4e2d\u540e\u8fdb\u9000\u5e73"
	}
};

// 涉及页面 DOM 的默认参数，单独抽出来
$.extend(vschess.defaultOptions, {
	// 选择解析器，默认为自动选择
	parseType: "auto",

	// 自定义棋谱
	chessData: false,

	// 默认风格
	style: "default",

	// 默认布局
	layout: "default",

	// 默认全局样式
	globalCSS: vschess.defaultPath + "global.css",

	// 默认棋盘初始化时展示的局面索引
	currentStep: 0,

	// 音效开关
	sound: true,

	// 默认音效
	soundStyle: "default",

	// 默认音量
	volume: 100,

	// 自定义音效路径，空字符串表示程序自动识别，如需自定义请参考官方文档
	soundPath: "",

	// 着法朗读
	speakMove: false,

	// IE6 自定义棋子图片路径，如需自定义请参考官方文档
	IE6Compatible_CustomPieceUrl: false,

	// 默认棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下翻转，3(0x11) 对角旋转
	// 亦可以使用 vschess.code.turn：none 不翻转，mirror 左右翻转，reverse 上下翻转，round 对角旋转
	turn: vschess.code.turn.none,

	// 默认棋子单击事件是否响应状态，0(0x00) 双方不响应，1(0x01) 仅黑方响应，2(0x10) 仅红方响应，3(0x11) 双方响应
	// 亦可以使用 vschess.code.clickResponse：none 双方不响应，black 仅黑方响应，red 仅红方响应，both 双方响应
	clickResponse: vschess.code.clickResponse.both,

	// 默认走子动画时间，单位毫秒
	animationTime: 200,

	// 默认播放间隔时间，单位百毫秒（0.1秒）
	playGap: 5,

	// 默认着法格式
	moveFormat: "chinese",

	// 单击事件名称，兼顾 PC 端和移动端
	click: (function(){
		var UA = navigator.userAgent.toLowerCase(), click = "touchend";
		!~UA.indexOf("android") && !~UA.indexOf("iph") && !~UA.indexOf("ipad") && (click = "click");
		return click;
	})(),

	// 快进快退局面数
	quickStepOffset: 10,

	// 默认展开的标签
	defaultTab: "comment",

	// UBB 分享标签名称
	ubbTagName: "vschess",

	// 走子提示
	moveTips: true,

	// 保存提示
	saveTips: false,

	// 棋子随机旋转
	pieceRotate: false,

	// 禁止重复长打
	banRepeatLongThreat: true,

	// 禁止重复一将一杀
	banRepeatLongKill: false,

	// 违例提示
	illegalTips: true,

	// 起始局面提示信息
	startTips: [
		"\u84dd\u8272\u7684\u7740\u6cd5\u542b\u6709\u53d8\u7740",
		"\u6807\u6709\u661f\u53f7\u7684\u7740\u6cd5\u542b\u6709\u6ce8\u89e3",
		"\u652f\u6301\u4e1c\u840d\u3001\u9e4f\u98de\u7b49\u591a\u79cd\u683c\u5f0f",
		"\u5355\u51fb\u201c\u590d\u5236\u201d\u590d\u5236\u5f53\u524d\u5c40\u9762",
		'<a href="https://www.xiaxiangqi.com/vschess/" target="_blank">\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V' + vschess.version + "</a>",
		'<a href="https://margin.top/" target="_blank">Margin.Top &copy; \u7248\u6743\u6240\u6709</a>'
	],

	// 云服务 API 地址
	cloudApi: {
		gif: "https://www.xiaxiangqi.com/api/cloud/gif",
		startFen: "https://www.xiaxiangqi.com/api/cloud/startfen",
		saveBook: "https://www.xiaxiangqi.com/api/cloud/savebook",
		saveBookForShare: "https://www.xiaxiangqi.com/api/cloud/book/save",
		saveBookForWeixin: "https://www.xiaxiangqi.com/api/cloud/book/weixincode",
		HTMLShareJS: "https://www.xiaxiangqi.com/static/js/share.js"
	},

	// 默认推荐起始局面列表
	recommendList: [
		{ name: "\u5e38\u7528\u5f00\u5c40", fenList: [
			{ name: "\u7a7a\u767d\u68cb\u76d8", fen: "9/9/9/9/9/9/9/9/9/9 w - - 0 1" },
			{ name: "\u53ea\u6709\u5e05\u5c06", fen: "5k3/9/9/9/9/9/9/9/9/3K5 w - - 0 1" },
			{ name: "\u6807\u51c6\u5f00\u5c40", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u5de6\u9a6c", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKABNR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u5de6\u9a6c", fen: "rnbakab1r/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53f3\u9a6c", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKAB1R w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53f3\u9a6c", fen: "r1bakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53cc\u9a6c", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/R1BAKAB1R w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53cc\u9a6c", fen: "r1bakab1r/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53cc\u4ed5", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNB1K1BNR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53cc\u58eb", fen: "rnb1k1bnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u53cc\u76f8", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RN1AKA1NR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u53cc\u8c61", fen: "rn1aka1nr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u4ed5\u76f8", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RN2K2NR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u58eb\u8c61", fen: "rn2k2nr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u4e94\u5175", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u4e94\u5352", fen: "rnbakabnr/9/1c5c1/9/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" },
			{ name: "\u7ea2\u8ba9\u4e5d\u5b50", fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/9/1C5C1/9/RN2K2NR w - - 0 1" },
			{ name: "\u9ed1\u8ba9\u4e5d\u5b50", fen: "rn2k2nr/9/1c5c1/9/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1" }
		]}
    ],

    // 标签名称
    tagName: {
        comment: "\u68cb\u8c31\u6ce8\u89e3",
        info: "\u68cb\u5c40\u4fe1\u606f",
        share: "\u68cb\u8c31\u5206\u4eab",
        export: "\u68cb\u8c31\u5bfc\u51fa",
        edit: "\u68cb\u8c31\u5bfc\u5165",
        config: "\u68cb\u76d8\u9009\u9879"
    }
});

// 默认帮助信息
vschess.defaultOptions.help  = '<h1>\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V' + vschess.version + ' \u5e2e\u52a9\u4fe1\u606f</h1>';
vschess.defaultOptions.help += '<hr />';
vschess.defaultOptions.help += '<h2>1.&ensp;&ensp;\u5355\u51fb\u201c\u64ad\u653e\u201d\u6309\u94ae\uff0c\u53ef\u4ee5\u81ea\u52a8\u64ad\u653e\u68cb\u5c40\uff1b\u64ad\u653e\u8fc7\u7a0b\u4e2d\uff0c\u5355\u51fb\u201c\u6682\u505c\u201d\u6309\u94ae\uff0c\u68cb\u5c40\u505c\u6b62\u81ea\u52a8\u64ad\u653e\u3002</h2>';
vschess.defaultOptions.help += '<h2>2.&ensp;&ensp;\u5355\u51fb\u201c\u524d\u8fdb\u201d\u3001\u201c\u540e\u9000\u201d\u6309\u94ae\uff0c\u6bcf\u6b21\u53d8\u53161\u6b65\uff1b\u5355\u51fb\u201c\u5feb\u8fdb\u201d\u3001\u201c\u5feb\u9000\u201d\u6309\u94ae\uff0c\u6bcf\u6b21\u53d8\u5316#quickStepOffsetRound#\u4e2a\u56de\u5408\uff0c\u5373#quickStepOffset#\u6b65\u3002</h2>';
vschess.defaultOptions.help += '<h2>3.&ensp;&ensp;\u5355\u51fb\u201c\u590d\u5236\u201d\u6309\u94ae\uff0c\u53ef\u4ee5\u590d\u5236\u5f53\u524d\u5c40\u9762\u3002</h2>';
vschess.defaultOptions.help += '<h2>4.&ensp;&ensp;\u590d\u5236\u5c40\u9762\u540e\uff0c\u53ef\u4ee5\u76f4\u63a5\u5728\u4e13\u4e1a\u8c61\u68cb\u8f6f\u4ef6\u4e2d\u7c98\u8d34\u4f7f\u7528\u3002</h2>';
vschess.defaultOptions.help += '<h2>5.&ensp;&ensp;\u5206\u6790\u5c40\u9762\u65f6\uff0c\u5efa\u8bae\u5c06\u5c40\u9762\u590d\u5236\u5230\u4e13\u4e1a\u8c61\u68cb\u8f6f\u4ef6\u4e2d\u8fdb\u884c\u5206\u6790\u3002</h2>';
vschess.defaultOptions.help += '<h2>6.&ensp;&ensp;\u53ef\u4ee5\u76f4\u63a5\u5728\u68cb\u76d8\u4e0a\u8d70\u68cb\uff0c\u4fbf\u4e8e\u5206\u6790\u5c40\u9762\u3002</h2>';
vschess.defaultOptions.help += '<h2>7.&ensp;&ensp;\u5728\u7740\u6cd5\u5217\u8868\u4e2d\u53ef\u4ee5\u8c03\u6574\u53d8\u62db\u987a\u5e8f\u6216\u5220\u9664\u7740\u6cd5\u3002</h2>';
vschess.defaultOptions.help += '<h2>8.&ensp;&ensp;\u6ce8\u91ca\u4fee\u6539\u540e\u76f4\u63a5\u5728\u6ce8\u91ca\u533a\u5916\u9762\u4efb\u610f\u5904\u5355\u51fb\u5373\u53ef\u751f\u6548\u3002</h2>';
vschess.defaultOptions.help += '<h2>9.&ensp;&ensp;\u7f16\u8f91\u5c40\u9762\u4f1a\u5931\u53bb\u5f53\u524d\u68cb\u8c31\uff0c\u8bf7\u6ce8\u610f\u4fdd\u5b58\u3002</h2>';
vschess.defaultOptions.help += '<h2>10.&ensp;\u7f16\u8f91\u5c40\u9762\u6807\u7b7e\u4e2d\uff0c\u53ef\u4ee5\u76f4\u63a5\u6253\u5f00\u7535\u8111\u4e2d\u7684\u68cb\u8c31\uff0c\u4e5f\u53ef\u4ee5\u76f4\u63a5\u5c06\u68cb\u8c31\u6587\u4ef6\u62d6\u62fd\u5230\u672c\u68cb\u76d8\u4e0a\u3002</h2>';
vschess.defaultOptions.help += '<h2>11.&ensp;\u652f\u6301\u4e1c\u840d\u3001\u9e4f\u98de\u3001\u8c61\u68cb\u4e16\u5bb6\u3001\u6807\u51c6PGN\u3001\u4e2d\u56fd\u6e38\u620f\u4e2d\u5fc3\u3001QQ\u8c61\u68cb\u7b49\u683c\u5f0f\uff0c\u5176\u4ed6\u683c\u5f0f\u7a0b\u5e8f\u4e5f\u4f1a\u5c1d\u8bd5\u81ea\u52a8\u8bc6\u522b\u3002</h2>';
vschess.defaultOptions.help += '<h2>12.&ensp;\u68cb\u76d8\u9009\u9879\u4e2d\uff0c\u53ef\u4ee5\u63a7\u5236\u68cb\u76d8\u65b9\u5411\u3001\u64ad\u653e\u901f\u5ea6\u3001\u8d70\u5b50\u58f0\u97f3\u7b49\u3002</h2>';
vschess.defaultOptions.help += '<h2>13.&ensp;\u68cb\u8c31\u5206\u4eab\u529f\u80fd\u751f\u6210\u7684\u8bba\u575b UBB \u4ee3\u7801\uff0c\u53ef\u4ee5\u5728\u652f\u6301\u8be5\u4ee3\u7801\u7684\u8bba\u575b\u4e2d\u4f7f\u7528\u3002<a href="https://www.xiaxiangqi.com/" target="_blank">\u3010\u67e5\u770b\u90fd\u6709\u54ea\u4e9b\u8bba\u575b\u652f\u6301\u8be5\u4ee3\u7801\u3011</a></h2>';
vschess.defaultOptions.help += '<hr />';
vschess.defaultOptions.help += '<h2><a href="https://www.xiaxiangqi.com/vschess/" target="_blank">\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V' + vschess.version + '</a> <a href="https://margin.top/" target="_blank">Margin.Top &copy; \u7248\u6743\u6240\u6709</a></h2>';

// IE6 兼容，棋子 PNG 图片透明，如果需要自定义棋子图片路径，请参考官方文档
vschess.IE6Compatible_setPieceTransparent = function(options){
	if (!window.ActiveXObject || window.XMLHttpRequest || options.IE6Compatible_CustomPieceUrl) {
		return this;
	}

	var cssRule = 'filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled="true", sizingMethod="scale", src="#"); background:none;';
	var sheet = document.createStyleSheet();

	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-S"     , cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/nr.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-s"     , cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/ns.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-R span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rr.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-N span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rn.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-B span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rb.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-A span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/ra.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-K span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rk.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-C span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rc.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-P span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/rp.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-r span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/br.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-n span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bn.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-b span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bb.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-a span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/ba.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-k span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bk.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-c span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bc.png"));
	sheet.addRule(".vschess-style-" + options.style + " .vschess-piece-p span", cssRule.replace("#", vschess.defaultPath + 'style/' + options.style + "/bp.png"));

	return this;
};

// 从二进制原始数据中抽取棋局信息
vschess.binaryToInfo = function(buffer, parseType){
    parseType = parseType || "auto";

    // 象棋演播室 XQF 格式
	if (parseType === "auto" && vschess.subhex(buffer, 0, 2) === '5851' || parseType === "xqf") {
		return vschess.binaryToInfo_XQF(buffer);
	}

    // 象棋桥 CBR 格式
	if (parseType === "auto" && vschess.subhex(buffer, 0, 16) === '4343427269646765205265636f726400' || parseType === "cbr") {
		return vschess.binaryToInfo_CBR(buffer);
	}

    // 未能识别的数据，返回空
	return {};
};

// 将二进制原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vschess.binaryToNode = function(buffer, parseType){
    parseType = parseType || "auto";

    // 象棋演播室 XQF 格式
	if (parseType === "auto" && vschess.subhex(buffer, 0, 2) === '5851' || parseType === "xqf") {
		return vschess.binaryToNode_XQF(buffer);
	}

    // 象棋桥 CBR 格式
	if (parseType === "auto" && vschess.subhex(buffer, 0, 16) === '4343427269646765205265636f726400' || parseType === "cbr") {
		return vschess.binaryToNode_CBR(buffer);
	}

    // 中国游戏中心 CCM 格式
	if (parseType === "auto" && vschess.subhex(buffer, 0, 1) === '01' || parseType === "ccm") {
		return vschess.binaryToNode_CCM(buffer);
	}

    // 未能识别的数据，返回起始局面
	return { fen: vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
};

// 将中国游戏中心 CCM 格式转换为棋谱节点树
vschess.binaryToNode_CCM = function(buffer) {
	var stepList = [];

	for (k = 1; k < buffer.length; k += 7) {
		var fromX = 8 - buffer[k + 2];
		var   toX = 8 - buffer[k + 3];
		var fromY = 9 - buffer[k + 4];
		var   toY = 9 - buffer[k + 5];
		stepList.push(vschess.b2i[fromY * 9 + fromX] + vschess.b2i[toY * 9 + toX]);
	}

	return vschess.stepListToNode(vschess.defaultFen, stepList);
};

// 从象棋桥 CBR 格式中抽取棋局信息
vschess.binaryToInfo_CBR = function(buffer){
    // 不识别的版本
    if (buffer[19] === 0 || buffer[19] > 2) {
        return {};
    }

    // 读取字符串
    var readStr = function(start, length){
        var str = [];

        for (var i = 0; i < length; i += 2) {
            if (buffer[start + i] === 0 && buffer[start + i + 1] === 0) {
                break;
            }

            str.push(vschess.fcc(buffer[start + i + 1] << 8 | buffer[start + i]));
        }

        return str.join('');
    };

    // V1 版本
    if (buffer[19] === 1) {

    }
    // V2 版本
    else {
        return {
            // 各个软件的字段都不一样
            // 下面注释掉的是象棋桥专属字段，标准 PGN 格式不含这些字段
            // 如需启用这些字段，需要扩展 vschess.info.name 字段列表，并且处理好信息修改界面
            // scriptfile : readStr(  52, 128),
            // path       : readStr( 308, 256),
            // from       : readStr( 564,  64),
            // eventclass : readStr( 628,  64),
            // timerule   : readStr(1012,  64),
            // remarkmail : readStr(1716,  64),
            // authormail : readStr(1844,  64),
            // createtime : readStr(1908,  40),
            // modifytime : readStr(1972,  40),
            // type       : buffer[2040],
            // property   : readStr(2044,  32),
            // finishtype : readStr(2080,  32),
            title      : readStr( 180, 128),
            event      : readStr( 692,  64),
            round      : readStr( 756,  64),
            group      : readStr( 820,  32),
            table      : readStr( 852,  32),
            date       : readStr( 884,  64),
            place      : readStr( 948,  64),
            red        : readStr(1076,  64),
            redteam    : readStr(1140,  64),
            redtime    : readStr(1204,  64),
            redrating  : readStr(1268,  32),
            black      : readStr(1300,  64),
            blackteam  : readStr(1364,  64),
            blacktime  : readStr(1428,  64),
            blackrating: readStr(1492,  32),
            judge      : readStr(1524,  64),
            record     : readStr(1588,  64),
            remark     : readStr(1652,  64),
            author     : readStr(1780,  64),
            result     : ["*", "1-0", "0-1", "1/2-1/2"][buffer[2076] > 3 ? 0 : buffer[2076]]
        };
    }
};

// 将象棋桥 CBR 格式转换为棋谱节点树
vschess.binaryToNode_CBR = function(buffer) {
    // 不识别的版本
    if (buffer[19] === 0 || buffer[19] > 2) {
        return { fen: vschess.defaultFen, comment: '', next: [], defaultIndex: 0 };
    }

    var board = [];

    // 默认 V2 版本
    var fenStartPos = 2120;
    var playerPos = 2112;
    var roundPos = 2116;

    // V1 版本
    if (buffer[19] === 1) {
        fenStartPos = 1880;
        playerPos = 1872;
        roundPos = 1876;
    }

    for (var i = 0; i < 90; ++i) {
        board.push(vschess.n2f[buffer[i + fenStartPos]]);
    }

    var fen = vschess.arrayToFen(board) + " " + (buffer[playerPos] === 2 ? "b" : "w") + " - - 0 " + (buffer[roundPos + 1] << 8 | buffer[roundPos]);

    // 生成节点树
    var node = { fen: fen, comment: '', next: [], defaultIndex: 0 };
    return node;
};

// 从原始数据中抽取棋局信息
vschess.dataToInfo = function(chessData, parseType){
	chessData = vschess.replaceNbsp(chessData);
	var replaceQuote = chessData.replace(/\'/g, '"');
	parseType = parseType || "auto";

	// 标准节点树格式，即鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("n version") || parseType === "pfc") {
		return vschess.dataToInfo_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return vschess.dataToInfo_DhtmlXQ(chessData);
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~replaceQuote.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return vschess.dataToInfo_DHJHtmlXQ(chessData);
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~replaceQuote.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return vschess.dataToInfo_PGN(chessData);
	}

	// PlayOK 格式
	if (parseType === "auto" && ~chessData.indexOf("START{") || parseType === "playok") {
		return vschess.dataToInfo_PlayOK(chessData);
	}

	// 未能识别的数据，返回空
	return {};
};

// 从鹏飞象棋 PFC 格式中抽取棋局信息
vschess.dataToInfo_PFC = function(chessData){
	chessData = chessData.replace("<!--", "").replace("-->", "").replace(/<\?xml(.*)\?>/, "");
	chessData = chessData.replace(/<n/ig, "<div").replace(/\/>/ig, "></div>").replace(/<\/n>/ig, "</div>");
	var node  = $($.trim(chessData)), result = {};

	for (var i in vschess.info.name) {
		node.attr(i) && (result[i] = vschess.stripTags(node.attr(i)));
	}

	return result;
};

// 从标准 PGN 格式中抽取棋局信息
vschess.dataToInfo_PGN = function(chessData){
	// 识别模式 A
	var resultA = {}, original = {};
	var lines = chessData.split("\n");

	for (var i = 0; i < lines.length; ++i) {
		var l = $.trim(lines[i]);
		var start = l.    indexOf("[");
		var end   = l.lastIndexOf("]");

		if (~start && ~end) {
			var info  = l.substring(start + 1, end);
			var name  = info.split(/[\s]/)[0];
			var value = $.trim(info.replace(name, ""));
			var quotA = value.charAt(0               ) === "'" || value.charAt(0               ) === '"';
			var quotB = value.charAt(value.length - 1) === "'" || value.charAt(value.length - 1) === '"';
			quotA && (value = value.substring(1                  ));
			quotB && (value = value.substring(0, value.length - 1));
			original[name] = value;
		}
	}

	for (var i in vschess.info.name) {
		var name = vschess.info.pgn[i] || vschess.fieldNameToCamel(i);
		original[name] && (resultA[i] = vschess.stripTags(original[name]));
	}

	// 识别模式 B
	var resultB = {};

	for (var i in vschess.info.name) {
		var startTag = "[" + (vschess.info.pgn[i] || vschess.fieldNameToCamel(i));
		var startPos = chessData.indexOf(startTag);

		if (~startPos) {
			var value = chessData.substring(startPos + startTag.length + 2, chessData.indexOf("]", startPos) - 1);
			value && (resultB[i] = vschess.stripTags(value));
		}
	}

	// AB 结果集合并
	for (var i in resultB) {
		(!resultA[i] || resultB[i].length > resultA[i].length) && (resultA[i] = resultB[i]);
	}

	return resultA;
};

// 从 PlayOK 格式中抽取棋局信息
vschess.dataToInfo_PlayOK = function(chessData){
	var result = {};
	var lines = chessData.split("\n");

	for (var i = 0; i < lines.length; ++i) {
		var line = $.trim(lines[i]);

		if (line.indexOf("RED") === 0) {
			var RED = line.split(";");
			result.red = $.trim(RED[0].replace("RED", ""));
			result.redrating = RED[1];
		}
		else if (line.indexOf("BLACK") === 0) {
			var BLACK = line.split(";");
			result.black = $.trim(BLACK[0].replace("BLACK", ""));
			result.blackrating = BLACK[1];
		}
		else if (line.indexOf("RESULT") === 0) {
			result.result = $.trim(line.replace("RESULT", ""));
		}
		else if (line.indexOf("DATE") === 0) {
			result.date = $.trim(line.replace("DATE", "")).split(" ")[0];
		}
		else if (line.indexOf("BLACK") === 0) {
			var EVENT = line.split(";");
			result.event = $.trim(EVENT[0].replace("EVENT", ""));
			result.group = EVENT[1];
		}
	}

	return result;
};

// 从东萍象棋 DhtmlXQ 格式中抽取棋局信息
vschess.dataToInfo_DhtmlXQ = function(chessData){
	var eachLine = chessData.split("[DhtmlXQ");
	var small = [];

	for (var i = 0; i < eachLine.length; ++i) {
		~eachLine[i].indexOf("_comment") || ~eachLine[i].indexOf("_move") || small.push(eachLine[i]);
	}

	chessData = small.join("[DhtmlXQ");
	var result = {};

	for (var i in vschess.info.name) {
		var startTag = "[DhtmlXQ_" + (vschess.info.DhtmlXQ[i] || i) + "]";
		var startPos = chessData.indexOf(startTag);

		if (~startPos) {
			var value = chessData.substring(startPos + startTag.length, chessData.indexOf("[/DhtmlXQ_", startPos));
			value && (result[i] = vschess.stripTags(value));
		}
	}

	result.result = vschess.dataText(result.result, "result");
	return result;
};

// 从广东象棋网打虎将 DHJHtmlXQ 格式中抽取棋局信息
vschess.dataToInfo_DHJHtmlXQ = function(chessData){
	for (var i in vschess.info.DHJHtmlXQ) {
		chessData = chessData.replace(RegExp("DHJHtmlXQ_" + vschess.info.DHJHtmlXQ[i], "g"), "DhtmlXQ_" + i);
	}

	return vschess.dataToInfo_DhtmlXQ(chessData);
};

// 检查原始数据中是否包含棋谱
vschess.isDataHasBook = function(chessData, parseType){
	chessData = vschess.replaceNbsp(chessData);
	var match, RegExp = vschess.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~chessData.indexOf("n version") || parseType === "pfc") {
		return true;
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return true;
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return true;
	}

	// QQ新中国象棋格式
	if (parseType === "auto" && RegExp.QQNew.test(chessData) || parseType === "qqnew") {
		return true;
	}

	// 象棋世家格式
	if (parseType === "auto" && RegExp.ShiJia.test(chessData) || parseType === "shijia") {
		return true;
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return true;
	}

	// PlayOK 格式
	if (parseType === "auto" && ~chessData.indexOf("START{") || parseType === "playok") {
		return true;
	}

	// 发现着法，尝试识别
	if (RegExp.Chinese.test(chessData)) {
		return true;
	}

	if (RegExp.WXF.test(chessData)) {
		return true;
	}

	if (RegExp.ICCS.test(chessData)) {
		return true;
	}

	if (RegExp.Node.test(chessData)) {
		return true;
	}

	if (RegExp.FenMini.exec(chessData)) {
		return true;
	}

	return false;
};

// 将原始数据转换为棋谱节点树，这里的变招都是节点，变招的切换即为默认节点的切换
vschess.dataToNode = function(chessData, parseType){
	var match, RegExp = vschess.RegExp();
	parseType = parseType || "auto";

	// 鹏飞象棋 PFC 格式
	if (parseType === "auto" && ~chessData.indexOf("n version") || parseType === "pfc") {
		return vschess.dataToNode_PFC(chessData);
	}

	// 东萍象棋 DhtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DhtmlXQ") || parseType === "DhtmlXQ") {
		return vschess.dataToNode_DhtmlXQ(chessData);
	}

	// 打虎将 DHJHtmlXQ 格式
	if (parseType === "auto" && ~chessData.indexOf("[DHJHtmlXQ") || parseType === "DHJHtmlXQ") {
		return vschess.dataToNode_DHJHtmlXQ(chessData);
	}

	// QQ新中国象棋格式
	if (parseType === "auto" && RegExp.QQNew.test(chessData) || parseType === "qqnew") {
		return vschess.dataToNode_QQNew(chessData);
	}

	// 象棋世家格式
	if (parseType === "auto" && RegExp.ShiJia.test(chessData) || parseType === "shijia") {
		return vschess.dataToNode_ShiJia(chessData);
	}

	// 标准 PGN 格式
	if (parseType === "auto" && ~chessData.indexOf('[Game "Chinese Chess"]') || parseType === "pgn") {
		return vschess.dataToNode_PGN(chessData);
	}

	// PlayOK 格式
	if (parseType === "auto" && ~chessData.indexOf("START{") || parseType === "playok") {
		return vschess.dataToNode_PlayOK(chessData);
	}

	// 中国游戏中心 CCM 格式
	if (parseType === "auto" && vschess.cca(chessData) === 1 || parseType === "ccm") {
		return vschess.dataToNode_CCM(chessData);
	}

	// 发现着法，尝试识别
	if (RegExp.Chinese.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"]' + chessData);
	}

	if (RegExp.WXF.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "WXF"]' + chessData);
	}

	if (RegExp.ICCS.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "ICCS"]' + chessData);
	}

	// 简易坐标格式兼容，将简易坐标转换为 ICCS 格式，然后直接调用 ICCS 转换器转换，其实 PGN 格式并没有此种着法格式。
	if (RegExp.Node.test(chessData)) {
		return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "Node"]' + chessData);
	}

	// 长 Fen 串
	if (match = RegExp.FenLong.exec(chessData)) {
		return { fen: match[0], comment: "", next: [], defaultIndex: 0 };
	}

	// 短 Fen 串
	if (match = RegExp.FenShort.exec(chessData)) {
		return { fen: match[0] + " - - 0 1", comment: "", next: [], defaultIndex: 0 };
	}

	// 迷你 Fen 串
	if (match = RegExp.FenMini.exec(chessData)) {
		return { fen: match[0] + " w - - 0 1", comment: "", next: [], defaultIndex: 0 };
	}

	// 未能识别的数据，返回起始局面
	return { fen: vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
};

// 将鹏飞象棋 PFC 格式转换为棋谱节点树
vschess.dataToNode_PFC = function(chessData){
	if (~chessData.indexOf("[pfchessrecord]")) {
		var start = chessData.indexOf("<!--");
		var end   = chessData.indexOf("-->");
		chessData = chessData.substring(start + 4, end).replace(/<\?xml(.*)\?>/, "");
	}
	else {
		chessData = chessData.replace("<!--", "").replace("-->", "").replace(/<\?xml(.*)\?>/, "");
	}

	chessData  = chessData.replace(/<n/ig, "<div").replace(/\/>/ig, "></div>").replace(/<\/n>/ig, "</div>");
	var node   = $($.trim(chessData));
	var result = { fen: node.attr("m"), comment: node.attr("c") || "", next: [], defaultIndex: 0 };

	function insertNext(node, target){
		node.children("div").each(function(index){
			var each = $(this);
			var insert = { move: each.attr("m"), comment: each.attr("c") || "", next: [], defaultIndex: 0 };
			each.attr("default") && (target.defaultIndex = index);
			target.next.push(insert);
			insertNext(each, insert);
		});
	}

	insertNext(node, result);
	return result;
};

// 将标准 PGN 格式转换为棋谱节点树
vschess.dataToNode_PGN = function(chessData){
	var originalChessData = chessData, RegExp = vschess.RegExp();

	// 识别着法格式
	if (~chessData.indexOf('[Format "Node"]')) {
		var format = "node";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "ICCS"]')) {
		var format = "iccs";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else if (~chessData.indexOf('[Format "WXF"]')) {
		var format = "wxf";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/1\-0([\S\s]*)/g, "").replace(/0\-1([\S\s]*)/g, "")
			.replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}
	else {
		var format = "chinese";
		chessData = chessData
			.replace(/\[(.*)\]/g, "").replace(/\((.*)\)/g, "").replace(/[0-9]+\./g, "").replace(/1\-0([\S\s]*)/g, "")
			.replace(/0\-1([\S\s]*)/g, "").replace(/1\/2\-1\/2([\S\s]*)/g, "");
	}

	// 抽取注释
	var RegExp_PGN_Comment = /\{([^\{\}]*)\}/, RegExp_PGN_Comment_Result, commentList = [];

	while (RegExp_PGN_Comment_Result = RegExp_PGN_Comment.exec(chessData)) {
		commentList.push(RegExp_PGN_Comment_Result[1]);
		chessData = chessData.replace(RegExp_PGN_Comment, "COMMENT");
	}

	// 映射着法和对应的注释
	var dataSplitByMove = [], commentListByStep = [];

	switch (format) {
		case "node": dataSplitByMove = chessData.split(RegExp.Node	 ); break;
		case "iccs": dataSplitByMove = chessData.split(RegExp.ICCS	 ); break;
		case "wxf" : dataSplitByMove = chessData.split(RegExp.WXF	 ); break;
		default    : dataSplitByMove = chessData.split(RegExp.Chinese); break;
	}

	for (var i = 0, j = 0; i < dataSplitByMove.length; ++i) {
		~dataSplitByMove[i].indexOf("COMMENT") && (commentListByStep[i] = commentList[j++]);
	}

	// 抽取起始 Fen 串
	var match, startFen, noFenData;

	if (match = RegExp.FenLong.exec(originalChessData)) {
		startFen  = match[0];
		noFenData = chessData.replace(RegExp.FenMini, "");
	}
	else if (match = RegExp.FenShort.exec(originalChessData)) {
		startFen = match[0] + " - - 0 1";
		noFenData = chessData.replace(RegExp.FenMini, "");
	}
	else if (match = RegExp.FenMini.exec(originalChessData)) {
		startFen = match[0] + " w - - 0 1";
		noFenData = chessData.replace(RegExp.FenMini, "");
	}
	else {
		startFen = vschess.defaultFen;
		noFenData = chessData;
	}

	// 抽取着法
	var moveList = [];

	if (format === "node") {
		while (match = RegExp.Node.exec(noFenData)) {
			moveList.push(vschess.Node2ICCS_NoFen(match[0]));
		}
	}
	else if (format === "iccs") {
		while (match = RegExp.ICCS.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}
	else if (format === "wxf") {
		while (match = RegExp.WXF.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}
	else {
		while (match = RegExp.Chinese.exec(noFenData)) {
			moveList.push(match[0]);
		}
	}

	// 生成节点树
	var stepList = vschess.stepList2nodeList(moveList, startFen);

	// 交换先后手，用于纠正 Fen 串的先后手错误和自动识别迷你 Fen 串的先后手
	var fenChangePlayer = vschess.fenChangePlayer(startFen);
	var stepListM = vschess.stepList2nodeList(moveList, fenChangePlayer);

	if (stepListM.length > stepList.length) {
		startFen = fenChangePlayer;
		stepList = stepListM;
	}

	function makeBranch(list, target, b, i){
		var step = list.shift();
		var next = { move: step, comment: commentListByStep[i] || "", next: [], defaultIndex: 0 };
		target.next.push(next);
		list.length && makeBranch(list, next, b, i + 1);
	}

	var result = { fen: stepList.shift(), comment: commentListByStep[0] || "", next: [], defaultIndex: 0 };
	stepList.length && makeBranch(stepList, result, 0, 1);
	return result;
};

// 将 PlayOK 格式转换为棋谱节点树
vschess.dataToNode_PlayOK = function(chessData){
	var start = chessData.indexOf("{");
	var end   = chessData.indexOf("}");
	return vschess.dataToNode_PGN('[Game "Chinese Chess"][Format "WXF"]' + chessData.substring(start + 1, end));
};

// 将东萍象棋 DhtmlXQ 格式转换为棋谱节点树
vschess.dataToNode_DhtmlXQ = function(chessData, onlyFen){
	var DhtmlXQ_Comment	 = {};
	var DhtmlXQ_Change	 = [];
	var DhtmlXQ_Start	 = "";
	var DhtmlXQ_MoveList = "";
	var DhtmlXQ_Fen		 = "";
	var DhtmlXQ_EachLine = chessData.split("[DhtmlXQ");

	for (var i = 0; i < DhtmlXQ_EachLine.length; ++i) {
		var l = "[DhtmlXQ" + DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_comment")) {
			var start	  = l.indexOf("]");
			var commentId = l.substring(16, start);
			~commentId.indexOf("_") || (commentId = "0_" + commentId);
			DhtmlXQ_Comment[commentId] = l.substring(start + 1, l.indexOf("[/DhtmlXQ_")).replace(/\|\|/g, "\n").replace(/\\u([0-9a-zA-Z]{4})/g, function(){ return vschess.fcc(parseInt(arguments[1], 16)); });
		}
		else if (~l.indexOf("[DhtmlXQ_binit")) {
			DhtmlXQ_Start = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_"));
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			DhtmlXQ_MoveList = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_"));
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start	 = l.indexOf("]");
			var changeId = l.substring(14, start);
			DhtmlXQ_Change.push({ id: changeId, change: l.substring(start + 1, l.indexOf("[/DhtmlXQ_")) });
		}
		else if (~l.indexOf("[DhtmlXQ_fen")) {
			DhtmlXQ_Fen = l.substring(l.indexOf("[DhtmlXQ_fen") + 13, l.indexOf("[/DhtmlXQ_"));
		}
	}

	// Fen 串优先
	if (DhtmlXQ_Fen) {
		var DhtmlXQ_ToFenFinal = DhtmlXQ_Fen;
	}
	// 抽取起始局面，生成起始 Fen 串
	else {
		if (DhtmlXQ_Start) {
			var DhtmlXQ_ToFen = new Array(91).join("*").split(""), DhtmlXQ_ToFenFinal = [];
			var DhtmlXQ_ToFenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp";

			for (var i = 0; i < 32; ++i) {
				var move = DhtmlXQ_Start.substring(i * 2, i * 2 + 2).split("");
				DhtmlXQ_ToFen[+move[0] + move[1] * 9] = DhtmlXQ_ToFenPiece.charAt(i);
			}

			DhtmlXQ_ToFenFinal = vschess.arrayToFen(DhtmlXQ_ToFen);
		}
		else {
			var DhtmlXQ_ToFenFinal = vschess.defaultFen.split(" ")[0];
			var DhtmlXQ_ToFen = vschess.fenToArray(DhtmlXQ_ToFenFinal);
		}

		if (DhtmlXQ_MoveList) {
			var firstMovePos = DhtmlXQ_MoveList.substring(0, 2).split("");
			DhtmlXQ_ToFenFinal += vschess.cca(DhtmlXQ_ToFen[+firstMovePos[0] + firstMovePos[1] * 9]) > 96 ? " b - - 0 1" : " w - - 0 1";
		}
		else {
			var checkW = DhtmlXQ_ToFenFinal + " w - - 0 1";
			var checkB = DhtmlXQ_ToFenFinal + " b - - 0 1";
			DhtmlXQ_ToFenFinal = vschess.checkFen(checkB).length < vschess.checkFen(checkW).length ? checkB : checkW;
		}
	}

	if (onlyFen) {
		return DhtmlXQ_ToFenFinal;
	}

	var branchHashTable = {};

	// DhtmlXQ 着法列表转换为 node 节点列表
	function DhtmlXQ_MoveToMove(s){
		var moveList = [];

		while (s.length) {
			var move = s.slice(-4).split("");
			moveList.push(vschess.fcc(+move[0] + 97) + (9 - move[1]) + vschess.fcc(+move[2] + 97) + (9 - move[3]));
			s = s.slice(0, -4);
		}

		return moveList;
	}

	// 根据 node 节点列表创建分支
	function makeBranch(list, target, b, i){
		var next = { move: list.pop(), comment: DhtmlXQ_Comment[b + "_" + i] || "", next: [], defaultIndex: 0 };
		branchHashTable[b + "_" + ++i] = next;
		target.next.push(next);
		list.length && makeBranch(list, next, b, i);
	}

	// 生成主分支
	var result   = { fen: DhtmlXQ_ToFenFinal, comment: DhtmlXQ_Comment["0_0"] || "", next: [], defaultIndex: 0 };
	var moveList = DhtmlXQ_MoveToMove(DhtmlXQ_MoveList);
	branchHashTable["0_1"] = result;
	moveList.length && makeBranch(moveList, result, 0, 1);

	// 生成变着分支
	var undoList = [];

	for (var i = 0; i < DhtmlXQ_Change.length; ++i) {
		var line   = DhtmlXQ_Change[i];
		var id     = line.id.split("_");
		var target = branchHashTable[id[0] + "_" + id[1]];

		if (target) {
			var moveList = DhtmlXQ_MoveToMove(line.change);
			moveList.length && makeBranch(moveList, target, id[2], id[1]);
			undoList.length = 0;
		}
		else {
			if (~undoList.indexOf(line.id)) {
				break;
			}
			else {
				DhtmlXQ_Change.push(line   );
				undoList      .push(line.id);
			}
		}
	}

	return result;
};

// 将广东象棋网打虎将 DHJHtmlXQ 格式转换为棋谱节点树
vschess.dataToNode_DHJHtmlXQ = function(chessData){
	chessData = chessData.replace(/DHJHtmlXQ/g, "DhtmlXQ");
	chessData = chessData.replace(/DhtmlXQ_31/g, "DhtmlXQ_fen");
	chessData = chessData.replace(/DhtmlXQ_32/g, "DhtmlXQ_startPlayer");
	chessData = chessData.replace(/DhtmlXQ_33/g, "DhtmlXQ_startStep");
	chessData = chessData.replace(/DhtmlXQ_34/g, "DhtmlXQ_movelist");
	chessData = chessData.replace(/game_comment_/g, "DhtmlXQ_comment");
	chessData = chessData.replace(/comment_/g, "DhtmlXQ_comment");

	if (~chessData.indexOf("[DhtmlXQ_startPlayer")) {
		var start = chessData.indexOf("[DhtmlXQ_startPlayer");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var begin = chessData.substring(start + 21, end);
		begin = +begin === 1 ? "b" : "w";
	}
	else {
		var begin = "w";
	}

	if (~chessData.indexOf("[DhtmlXQ_startStep")) {
		var start = chessData.indexOf("[DhtmlXQ_startStep");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var step  = chessData.substring(start + 19, end);
		step = begin === "w" ? Math.floor(step / 2) + 1 : Math.ceil(step / 2) + 1;
	}
	else {
		var step = 1;
	}

	if (~chessData.indexOf("[DhtmlXQ_fen")) {
		var start = chessData.indexOf("[DhtmlXQ_fen");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var fen   = chessData.substring(start + 13, end);

		if (fen) {
			fen = vschess.arrayToFen(fen.split("")) + " " + begin + " - - 0 " + step;
		}
		else {
			fen = vschess.defaultFen;
		}

		chessData = chessData.replace(chessData.substring(start, end + 14), "[DhtmlXQ_fen]" + fen + "[/DhtmlXQ_fen]");
	}

	if (~chessData.indexOf("[DhtmlXQ_movelist")) {
		var start = chessData.indexOf("[DhtmlXQ_movelist");
		var end   = chessData.indexOf("[/DhtmlXQ_", start);
		var moves = chessData.substring(start + 18, end);

		var moveSplit = moves.split("");

		for (var i = 1; i < moveSplit.length; i += 2) {
			moveSplit[i] = 9 - moveSplit[i];
		}

		moves = moveSplit.join("");
		chessData = chessData.replace(chessData.substring(start, end + 19), "[DhtmlXQ_movelist]" + moves + "[/DhtmlXQ_movelist]");
	}

	return vschess.dataToNode_DhtmlXQ(chessData);
};

// 将 QQ 新中国象棋格式转换为棋谱节点树
vschess.dataToNode_QQNew = function(chessData) {
	var match, stepList = [];
	var RegExp = vschess.RegExp();

	while (match = RegExp.QQNew.exec(chessData)) {
		stepList.push(vschess.fcc(105 - match[2]) + match[1] + vschess.fcc(105 - match[4]) + match[3]);
	}

	return vschess.stepListToNode(vschess.defaultFen, stepList);
};

// 将象棋世家格式转换为棋谱节点树
vschess.dataToNode_ShiJia = function(chessData, onlyFen) {
	var RegExp_Fen  = /([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)(?:[\s]+)\+([BbRr])/g;
	var RegExp_Move = /([0-9][a-zA-Z]-[0-9][a-zA-Z])/g;
	var match = RegExp_Fen.exec(chessData), stepList = [];

	if (match) {
		var chessman  = "*PPPPPCCNNRRBBAAKpppppccnnrrbbaak";
		var situation = vschess.fenToSituation(vschess.blankFen);
		situation[0]  = match[33].toUpperCase() === "B" ? 2 : 1;

		for (var i = 1; i < 33; ++i) {
			situation[match[i] - 1] = vschess.f2n[chessman.charAt(i)];
		}

		var fen = vschess.situationToFen(situation);
	}
	else {
		var fen = vschess.defaultFen;
	}

	if (onlyFen) {
		return fen;
	}

	while (match = RegExp_Move.exec(chessData)) {
		var move = match[1].toUpperCase().split("");
		stepList.push(vschess.fcc(+move[0] + 97) + (vschess.cca(move[1]) - 65) + vschess.fcc(+move[3] + 97) + (vschess.cca(move[4]) - 65));
	}

	return vschess.stepListToNode(fen, stepList);
};

// 将着法列表转换为棋谱节点树
vschess.stepListToNode = function(fen, stepList){
	function makeBranch(list, target, b, i){
		var step = list.shift();
		var next = { move: step, comment: "", next: [], defaultIndex: 0 };
		target.next.push(next);
		list.length && makeBranch(list, next, b, i + 1);
	}

	var result = { fen: fen || vschess.defaultFen, comment: "", next: [], defaultIndex: 0 };
	stepList.length && makeBranch(stepList, result, 0, 1);
	return result;
};

// 将整数限制在一个特定的范围内
vschess.limit = function(num, min, max, defaultValue){
	typeof num === "undefined" && typeof defaultValue !== "undefined" && (num = defaultValue);
	vschess.isNumber(min) || (min = -Infinity);
	vschess.isNumber(max) || (max =  Infinity);
	vschess.isNumber(num) || (num =         0);
	num < min && (num = min);
	num > max && (num = max);
	return +num;
};

// 获得一个指定范围的随机数
vschess.rand = function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
};

// 正则表达式，使用时都是新的，避免出现 lastIndex 冲突
vschess.RegExp = function(){
	return {
		// Fen 串识别正则表达式
		FenLong	: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr][\s]-[\s]-[\s][0-9]+[\s][0-9]+/,
		FenShort: /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}[\s][wbr]/,
		FenMini : /(?:[RNHBEAKCPrnhbeakcp1-9]{1,9}\/){9}[RNHBEAKCPrnhbeakcp1-9]{1,9}/,

		// 通用棋步识别正则表达式
		Chinese	: /[\u8f66\u8eca\u4fe5\u9a6c\u99ac\u508c\u76f8\u8c61\u4ed5\u58eb\u5e05\u5e25\u5c06\u5c07\u70ae\u5305\u7832\u5175\u5352\u524d\u4e2d\u540e\u5f8c\u4e00\u4e8c\u4e09\u56db\u4e94\u58f9\u8d30\u53c1\u8086\u4f0d\uff11\uff12\uff13\uff14\uff151-5][\u8f66\u8eca\u4fe5\u9a6c\u99ac\u508c\u76f8\u8c61\u4ed5\u58eb\u70ae\u5305\u7832\u5175\u5352\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u634c\u7396\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff191-9][\u8fdb\u9032\u9000\u5e73][\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u634c\u7396\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff191-9]/g,
		Node	: /[A-Ia-i][0-9][A-Ia-i][0-9]/g,
		ICCS	: /[A-Ia-i][0-9]-[A-Ia-i][0-9]/g,
		WXF		: /[RNHBEAKCPrnhbeakcp\+\-1-5][RNHBEAKCPrnhbeakcpd1-9\+\-\.][\+\-\.][1-9]/g,

		// 自动识别棋谱格式正则表达式
		QQNew	: /(?:[0-9]+) 32 (?:[0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+) 0 (?:[0-9]+) 0/g,
		ShiJia	: /Moves(.*)Ends(.*)CommentsEnd/g,

		// 特殊兵东萍表示法
		Pawn	: /[\+\-2][1-9][\+\-\.][1-9]/
	};
};

// Fen 串是否为红方
vschess.fenIsR = function(fen){
	return !vschess.fenIsB(fen);
};

// Fen 串是否为黑方
vschess.fenIsB = function(fen){
	return fen.split(" ")[1].toLowerCase() === "b";
};

// Fen 串改变走棋方
vschess.fenChangePlayer = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var fenSplit = fen.split(" ");
	fenSplit[1]  = vschess.fenIsB(fen) ? "w" : "b";
	return fenSplit.join(" ");
};

// Fen 串转换为局面
vschess.fenToSituation = function(fen){
	var fenSplit  = fen.split(" ");
	var situation = vschess.situation.slice(0);
	var currentPiece = 0;
	var pieceEach = vschess.fenToArray(fen);
	situation[0] = vschess.fenIsB(fen) ? 2 : 1;
	situation[1] = vschess.limit(fenSplit[5], 1, Infinity);

	for (var i = 51; i < 204; ++i) {
		situation[i] && (situation[i] = vschess.f2n[pieceEach[currentPiece++]]);
	}

	return situation;
};

// 局面转换为 Fen 串
vschess.situationToFen = function(situation){
	var fen = [];

	for (var i = 51; i < 204; ++i) {
		situation[i] && fen.push(vschess.n2f[situation[i]]);
	}

	fen = vschess.arrayToFen(fen);
	return fen + (situation[0] === 1 ? " w - - 0 " : " b - - 0 ") + situation[1];
};

// 翻转 FEN 串
vschess.turnFen = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var fenSplit = fen        .split(" ");
	var lines    = fenSplit[0].split("/");

	for (var i = 0; i < 10; ++i) {
		lines[i] = lines[i].split("").reverse().join("");
	}

	fenSplit[0] = lines.join("/");
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	return fenSplit.join(" ");
};

// 旋转 FEN 串
vschess.roundFen = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var fenSplit = fen        .split(" ");
	fenSplit[0]  = fenSplit[0].split("").reverse().join("");
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	return fenSplit.join(" ");
};

// 翻转节点 ICCS 着法
vschess.turnMove = function(move){
	move = move.split("");
	move[0] = vschess.fcc(202 - vschess.cca(move[0]));
	move[2] = vschess.fcc(202 - vschess.cca(move[2]));
	return move.join("");
};

// 旋转节点 ICCS 着法
vschess.roundMove = function(move){
	move = move.split("");
	move[0] = vschess.fcc(202 - vschess.cca(move[0]));
	move[2] = vschess.fcc(202 - vschess.cca(move[2]));
	move[1] = 9 - move[1];
	move[3] = 9 - move[3];
	return move.join("");
};

// 翻转 WXF 着法，不可用于特殊兵
vschess.turnWXF = function(oldMove){
	// isMBA: is Middle Before After
	var moveSplit = oldMove.split(""), isMBA = ~"+-.".indexOf(moveSplit[1]);

	// NBA: 不是你想象中的 NBA，而是马相仕（马象士）
	if (~"NBA".indexOf(moveSplit[0]) || moveSplit[2] === ".") {
		if (isMBA) {
			return oldMove.substring(0, 3) + (10 - moveSplit[3]);
		}

		return moveSplit[0] + (10 - moveSplit[1]) + moveSplit[2] + (10 - moveSplit[3]);
	}

	if (isMBA) {
		return oldMove;
	}

	return moveSplit[0] + (10 - moveSplit[1]) + oldMove.substring(2, 4);
};

// 统计局面中棋子数量
vschess.countPieceLength = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

	for (var i = 51, count = 0; i < 204; ++i) {
		situation[i] > 1 && ++count;
	}

	return count;
};

// 根据前后 Fen 串计算着法
vschess.compareFen = function(fromFen, toFen, format){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fromFen) || (fromFen = vschess.defaultFen);
	RegExp.FenShort.test(  toFen) || (  toFen = vschess.defaultFen);

	var from = 0, to = 0;

	var fromSituation = vschess.fenToSituation(fromFen);
	var   toSituation = vschess.fenToSituation(  toFen);

	for (var i = 51; i < 204; ++i) {
		if (fromSituation[i] !== toSituation[i]) {
			if (fromSituation[i] > 1 && toSituation[i] === 1) {
				from = i;
			}
			else {
				to = i;
			}
		}
	}

	if (from && to) {
		var move = vschess.s2i[from] + vschess.s2i[to];

		switch (format) {
			case "node": return move;
			case "iccs": return vschess.Node2ICCS_NoFen(move);
			case "wxf" : return vschess.Node2WXF    (move, fromFen).move;
			default    : return vschess.Node2Chinese(move, fromFen).move;
		}
	}

	switch (format) {
		case "node": return "none";
		case "iccs": return "Error";
		case "wxf" : return "None";
		default    : return "\u65e0\u6548\u7740\u6cd5";
	}
};

// Fen 串移动一枚棋子
vschess.fenMovePiece = function(fen, move){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var situation = vschess.fenToSituation(fen);
	var src = vschess.i2s[move.substring(0, 2)];
	var dst = vschess.i2s[move.substring(2, 4)];
	situation[dst] = situation[src];
	situation[src] = 1;
	situation[0]   = 3    - situation[0];
	situation[0] === 1 && ++situation[1];
	return vschess.situationToFen(situation);
};

// Fen 串颠倒红黑
vschess.invertFen = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var fenSplit = fen.split(" ");
	fenSplit[1]  = vschess.fenIsB(fen) ? "w" : "b";
	fenSplit.length <= 2 && (fenSplit.push("- - 0 1"));
	var eachPiece = fenSplit[0].split("");

	for (var i = 0; i < eachPiece.length; ++i) {
		eachPiece[i] = vschess.cca(eachPiece[i]) > 96 ? eachPiece[i].toUpperCase() : eachPiece[i].toLowerCase();
	}

	fenSplit[0] = eachPiece.join("");
	return fenSplit.join(" ");
};

// 获取棋局信息显示文本
vschess.showText = function(showText, item){
	var map = {
		result: { "*": "", "1-0": "\u7ea2\u80dc", "0-1": "\u9ed1\u80dc", "1/2-1/2": "\u548c\u68cb" }
	};

	return map[item] && map[item][showText] || showText;
};

// 获取棋局信息数据文本
vschess.dataText = function(dataText, item){
	var map = {
		result: {
			"\u7ea2\u80dc": "1-0", "\u7ea2\u5148\u80dc": "1-0", "\u9ed1\u8d1f": "1-0",
			"\u7ea2\u8d1f": "0-1", "\u7ea2\u5148\u8d1f": "0-1", "\u9ed1\u80dc": "0-1", "0-1": "0-1",
			"\u7ea2\u548c": "1/2-1/2", "\u7ea2\u5148\u548c": "1/2-1/2", "\u548c\u68cb": "1/2-1/2", "\u548c": "1/2-1/2",
			"1-0": "1-0", "0-1": "0-1", "1/2-1/2": "1/2-1/2",
			__default__: "*"
		}
	};

	return map[item] && (map[item][dataText] || map[item].__default__) || dataText;
};

// PGN 字段驼峰化
vschess.fieldNameToCamel = function(fieldName){
	var key = fieldName || "";
	var keySplit = key.split("");

	if (key.length > 3 && key.substring(0, 3) === "red") {
		keySplit[0] = "R";
		keySplit[3] = keySplit[3].toUpperCase();
	}
	else if (key.length > 5 && key.substring(0, 5) === "black") {
		keySplit[0] = "B";
		keySplit[5] = keySplit[5].toUpperCase();
	}
	else {
		keySplit[0] = keySplit[0].toUpperCase();
	}

	return keySplit.join("");
};

// GUID 生成器
vschess.guid = function(){
	var guid = "";

	for (var i = 0; i < 32; ++i) {
		guid += Math.floor(Math.random() * 16).toString(16);
		~[7, 11, 15, 19].indexOf(i) && (guid += "-");
	}

	return guid;
};

// String.fromCharCode 别名
vschess.fcc = function(code){
	return String.fromCharCode(code);
};

// String.charCodeAt 别名
vschess.cca = function(word){
	return word.charCodeAt(0);
};

// 左右填充
vschess.strpad = function(str, length, pad, direction){
	str = str || "" ; str += "";
	pad = pad || " "; pad += "";
	length = vschess.limit(length, 0, Infinity, 0);

	if (length > str.length) {
		if (direction === "left" || direction === "l") {
			return new Array(length - str.length + 1).join(pad) + str;
		}
		else if (direction === "right" || direction === "r") {
			return str + new Array(length - str.length + 1).join(pad);
		}
		else {
			return new Array(Math.floor((length - str.length) / 2) + 1).join(pad) + str + new Array(Math.ceil((length - str.length) / 2) + 1).join(pad);
		}
	}
	else {
		return str;
	}
};

// 判断字符串是否为数字
vschess.isNumber = function(str){
	return !isNaN(+str);
};

// 拆分 Fen 串
vschess.fenToArray = function(fen){
	return fen.split(" ")[0]
		.replace(/H/g, "N")
		.replace(/E/g, "B")
		.replace(/h/g, "n")
		.replace(/e/g, "b")
		.replace(/1/g, "*")
		.replace(/2/g, "**")
		.replace(/3/g, "***")
		.replace(/4/g, "****")
		.replace(/5/g, "*****")
		.replace(/6/g, "******")
		.replace(/7/g, "*******")
		.replace(/8/g, "********")
		.replace(/9/g, "*********")
		.replace(/\//g,"").split("");
};

// 合并 Fen 串
vschess.arrayToFen = function(array){
	var tempArr = [], blank = 0;

	for (var i = 0; i < 90; ++i) {
		if (array[i] === "*") {
			++blank;
		}
		else {
			blank && tempArr.push(blank);
			blank = 0;
			tempArr.push(array[i]);
		}

		if (i % 9 === 8) {
			blank && tempArr.push(blank);
			blank = 0;
			tempArr.push("/");
		}
	}

	--tempArr.length;
	return tempArr.join("");
};

// 取得指定弧度值旋转 CSS 样式
vschess.degToRotateCSS = function(deg){
	if (window.ActiveXObject) {
		var css = "filter:progid:DXImageTransform.Microsoft.Matrix(SizingMethod=sMethod,M11=#M11,M12=#M12,M21=#M21,M22=#M22)";
		var rad =  Math.PI * deg / 180;
		var M11 =  Math.cos(deg);
		var M12 = -Math.sin(deg);
		var M21 =  Math.sin(deg);
		var M22 =  Math.cos(deg);
		return css.replace("#M11", M11).replace("#M12", M12).replace("#M21", M21).replace("#M22", M22);
	}
	else {
		var css = "";
		css +=         "transform:rotate(" + deg + "deg);";
		css +=      "-o-transform:rotate(" + deg + "deg);";
		css +=     "-ms-transform:rotate(" + deg + "deg);";
		css +=    "-moz-transform:rotate(" + deg + "deg);";
		css += "-webkit-transform:rotate(" + deg + "deg);";
		return css;
	}
};

// 文字棋盘
vschess.textBoard = function(fen, options) {
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	typeof options === "undefined" && (options = vschess.defaultOptions);

	function piece(f){
		var pieceId = vschess.f2n[f];

		if (pieceId > 32) {
			return "[" + options.ChineseChar.Piece[(pieceId & 15) + 6] + "]";
		}

		if (pieceId > 16) {
			return "(" + options.ChineseChar.Piece[(pieceId & 15) - 1] + ")";
		}

		return "----";
	}

	var isB = vschess.fenIsB(fen);
	var board = vschess.fenToArray(fen);
	var text = [isB ? "\u9ed1\u65b9 \u8d70\u68cb\u65b9\n\n" : "\u9ed1\u65b9\n\n"];

	var boardText = [
		" \u250c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u2510 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u203b-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2524 ",
		" \u251c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u252c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u251c-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u203b-", "-\u253c-", "-\u253c-", "-\u253c-", "-\u2524 ",
		" \u2514-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2534-", "-\u2518 "
	];

	var insertLine = ["",
		"\n \u2502  \u2502  \u2502  \u2502\uff3c\u2502\uff0f\u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502\uff0f\u2502\uff3c\u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502    \u695a  \u6cb3          \u6c49  \u754c    \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502\uff3c\u2502\uff0f\u2502  \u2502  \u2502  \u2502 \n",
		"\n \u2502  \u2502  \u2502  \u2502\uff0f\u2502\uff3c\u2502  \u2502  \u2502  \u2502 \n"
	];

	for (var i = 0; i < 90; ++i) {
		i % 9 === 0 && text.push(insertLine[i / 9]);
		text.push(board[i] === "*" ? boardText[i] : piece(board[i]));
	}

	text.push(isB ? "\n\n\u7ea2\u65b9" : "\n\n\u7ea2\u65b9 \u8d70\u68cb\u65b9");
	return text.join("").replace(/--/g, "\u2500");
};

// 字符串清除标签
vschess.stripTags = function(str){
	return $('<div>' + str + '</div>').text();
};

// 时间格式统一
vschess.dateFormat = function(date){
	if (/^([0-9]{8})$/.test(date)) {
		return date.substring(0, 4) + "-" + date.substring(4, 6) + "-" + date.substring(6, 8);
	}

	return date;
};

// 替换不间断空格
vschess.replaceNbsp = function(str){
	return str.replace(new RegExp(vschess.fcc(160), "g"), " ");
};

// 长 Fen 串变短 Fen 串
vschess.shortFen = function(fen){
	return fen.split(' ')[0] + ' ' + fen.split(' ')[1];
};

// 从二进制原始数据中抽取指定字节 16 进制字符串
vschess.subhex = function(hex, start, length){
    var str = [];

    for (var i = 0; i < length; ++i) {
        hex[start + i] < 16 && str.push('0');
        str.push(hex[start + i].toString(16).toLowerCase());
    }

    return str.join('');
};

// GBK 转 UTF-8 编码表
vschess.GBK2UTF8Charset = (function(){
	// 压缩编码表，原表见 function.iconv.v1.js，+200 后 64 进制保存为字符串，减小文件大小
	var charset = "4Xa4Xc03a4Xn4Xq4Xv4XD03a4XH4XK4XN4XS0394XV4XX4XZ4X>4Y44Y803a4Yc4Ye4Yi4Yp4Yt4Yv4Yy0394YG03b4YL0394YO03d4YW4YY03h4Z703e4Zf4Zi0374Zo4Zu0394Zx4ZA03a4ZH4ZO4ZT03a4ZY4Z<03b4<403a4<g4<k4<n0394<q4<y03a4<E4<G4<K0394<N4<R03a4<V4<Y4>003a4>44>64>84>a03e4>j0394>q03c4>A0394>F4>H4>M0394>Q03a4>V4>X4>Z4>>50150350603c50c03950f03d50q50s50u50F03950K50M50O03950R03950V03950Z50>03b51551803a51d03a51i51k51m51o51q03951t03951w03a51A51C03951F03902751I51P51R51U03c51<03g52803a52e03b52j03a52q03c52x52z52E52G52I03952L52P03952U52W52Y03b53153303a53703j03753j53m53o03953r53t03a53z53B03953E53G03a53L53P53T03i54354554703b54c03a54h03a54l54o03c54u03b54z54B03f54K03d54R03g55003a55403955903b55e03955h03b55m03s55I55K55O03955R03c55X03e56402756503p56o03d56v03a56z03i56M03b56T03b56Y56<03c57403h57g03757h03957k03d57r03l57G03A58a58f58i58k58m03a58q03958v03a58z58B03c58H03958K03958N03958T58W59259603959b03959e03959i03959m03b59r03959w59y59B03a59F59H59K03c59R03959Y5a003a5a60395a903a5ad5ag5ai5al0395ao5aq03d0275aw03a5aA5aC0395aG0395aJ03d5aQ5aS5aV0395aY5a>5b65bc0395bh5bj0395bn0395br03a5bA5bC0395bF03a5bJ03a5bO5bQ5bT5bV0395bY0395c45c65cc03d5cj5cm0395cq0395ct5cv0390375cx03a5cB5cD0395cG03a5cK5cM5cP03b5cU0395cX03h5d65d85db03c5dh03e5dp0395ds03e5dA5dI03b5dS03a5dY03h5e803a5ec03a5eg5ei5ek03b5ep5er03a5ev5ex03d5eE03b5eJ03i5eV03f5f303a5f903b5ff5fh03b5fm0275fp03b5fw5fz0395fC0395fG5fI0395fL03a5fP03a5fT03h5g40395g85ga5gc5ge5gj03a5go5gs5gw0395gz5gB5gJ5gM5gO5gQ0395gW5g<5h15h303b5h80395hb5hf0395hi5hm0390375ho03c5hu0395hx5hz0395hC5hE0395hI5hL5hO03b5hT03e5h>03b5i403a5i85ib03c5im03a5iq0395it5iy5iA03a5iF0395iL5iY5j25j603a5ja5jd5jf5jj5js5jw03a5jA5jG5jI0395jO5jU5jX5j<0395k25k55k75k90395kc0395kf5kh5kk03b5kp5ky5kB03c5kH5kJ5kL5kN03f5kY5l10395l60395l95lb5ld5lf03b5ll5lp5lr5lv0395lA5lC03b0275lG5lJ5lS5lU5lW5lZ03a5m10395m45m65mb5md5mi0395mu5mw5mz5mE03c5mP0395mT03a5mY03d5n35n65n85na03b5ng5ni03c5nq0395nt03d5nA03b5nF5nJ0390375nM0395nP5nR5nW5nY03a5o003b5o55o85oa5od5of0395oj03c5op03b5ov03c5oB03b5oG0395oM0395oP5oT03d5p10395p55p75pd0395pk03a5po5pq0395pt03a5py0395pC5pE03e5pM03g5pW5pY5p<5q05q25q45q703c5qe03a5qi0395qm03a5qt5qv03c5qC5qE5qG5qL5qN5qR0395qU0395qY5q<5r003c5r75ra03b0275re0395ri0395rl5ro03f5rx0395rA0395rE03a5rJ0395rM03b5rS03a5rX5rZ5r>0395s25s403a5s803j5sn03c5st0395sy0395sB03c0375sH5sJ03a5sR03b5sW03b5s>03b5t503f5tf03e5to03a5ts03m5tI03i5tU03e5u003b5u503k5uj03g5ut0395uw0395uA5uH5uJ03d5uQ5uS0395uW0395u<03a5v30395v803a5vd5vf5vj03e0275vq03h5vB0395vE03a5vI03b5vP5vV0395vY03c5w40395w75w95wb03b5wg0395wj5wq03c5ww0395wG0395wJ5wL5wQ5wS5wU03a5wY0395x003a5x503b0375x95xf03b5xl03c5xs03e5xA03b5xJ5xM5xO5xQ5xT03a5xX5xZ03a5y103g5yc03e5yk0395yo0395yr5yu0395yz0395yC5yF03a5yJ03f5yS5yU03b5yZ03a5z30395z60395z95zb03a5zg03a5zk5zm03a5zq03a5zu03a5zy03b5zD5zG0395zJ03c5zP03c5zV03b5z<03f0275A603d5Ad03e5Am03a5Aq0395At03a5Ax03c5AD03d5AK03c5AR03o5B75Ba5Bc5Be03a5Bi03a0375Bl03c5Bs03c5Bz03a5BE03f5BO03p5C503b5Ca03a5Ce03i5Cq03a5Cu03l5CJ03d5CR5CT5CV0395CY0395C>0395D203f5Db5Dd0395Dg03c5Dm5Do03b5Dv0395Dz5DB0395DE03b5DK5DM5DQ5DU5DW0395DZ0395E30275E503b5Eb5Ed0395Ei5Ek0395Eo5Eq0395Ex5Ez03c5EF5EH0395EK03k5EZ5E>5F203a5F603a5Fd5Fh5Fj0395Fm03b5Fs0395Fw5Fy03b5FD03b5FK0375FL5FQ0395FU0395FX03d5G25G40395G703e5Gf03a5Gk03b5Gt0395Gx5Gz5GC03c5GI5GK0395GN03a5GR03j5H25H403a5H85Ha5Hi0395Hl03b5Hq5Hs03b5Hx03a5HB0395HF0395HI5HK03a5HO03e5HX5HZ5H>03c5I503a5I903c5If0395Ij03h5Iu03b5Iz03d0275IF5IH03b5IM0395IP03g5J00395J303b5J803p5Jr03e5JA03l5JP0390375JR03c5JY5J<0395K103c5K70395Kb03d5Ki0395Kl03c5Kr5Kt5Kv5Kx03a5KB03a5KG5KI0395KL0395KO5KQ03c5KW03u5Li03j5Lw03x5LX5LZ0395M003f5M903e0275Mg03f5Mq5Mu5MC5ME0395ML0395MP5MR03a5MW5MY5M<03b5N30395N60395Na5Ne5Ni5Nl0395No03a5Ns5Nu5ND5NL03a5NQ03b5NV0395N>5O203a5O80395Ob5Og03b5Ol03a0375Op5Os03g5OE5OG0395OK0395ON03c5OT5OV03e5P50395P85Pa0395Pd5Pf0395Pj03b5Po5Pq0395Pv5Px5Pz5PC03b5PH5PK5PM03b5PR03b5PW0395PZ03a5Qb0395Qe0395Qk0395Qq03a5Qu03a5Qy03b5QD5QG5QI5QL03e5QU5QW03e5R303b5R85Rb03c5Rh03a5Rm0395Rq0395Rt5RB03c5RI03c0275RO5RS03a5RW5RY5R<5S103b5S65S85Sa0395Sd03d5Sk03d5Sr03d5Sy03e5SG0395SL5SN5SP0395SS0395SV03h5T403c0375T95Tc0395Tg03d5Tn03c5Tt5Tv03b5TA0395TD03c5TJ5TM5TO03a5TT03c5TZ03f5U703f5Ug0395Ul03i5Ux0395UA5UC03i5UO5UR0395UU03b5UZ03k5Vb03t5Vy03a5VC03a0275VF03t5W003k5We03e5Wm03k5WA5WD0395WH0395WO5WQ0390375WU5WZ0395X003c5X70395Xc5Xf5Xh03a5Xl0395Xq0395Xv5XC03f5XM03c5XT0395XW03c5Y10395Y603b5Yb5Ye03d5Yl03e5Yu03c5YA0395YD0395YH03m5YZ5Y>5Z15Z65Z903a5Zd5Zg0395Zk03a5Zq5Zw5Zz5ZB5ZF03b5ZM03c5ZS03c5ZY5<203b5<703e0275<e03a5<j03d5<s0395<v03b5<A03j5<N5<P03g5<Z5>00395>303a5>d03a5>h5>k03a5>o5>q5>s5>u5>x0395>A03a5>F03b0375>M5>P0395>S5>U5>W03e60360503a60903m60p60s60x03b60C03a60H60J60L03960P60S03960W60Y03a61061261503a61b61e61l03a61p61r03961u61y03961B03b61G03d61N61P03961T03d61<62003b62603c62f03962i03962m62r03a62y03a62C03962G03962J03962M03962Q62T03962W03a62<03963103963463f02763g03963j03963o03963r63v03963y63C03963G03a63Q03a63U03c63<03c64503964864c03e64k64m03964p64r03964u03a64z03964C03b64J03964S64V03964Y03964>65665803765903965d03b65i03965m03b65r65t65v03a65A65C65F03965I03965L65N03965S65U65X65Z03a66103966503f66f03a66k03c66q03a66u03966x66z66C66F03c66O66V03966Z66>03967303c67a03b67f67i03a67o03c67u03b67z03b67F03967J67M03a67Q03q68803e02768f68h68j68l68n03968q03a68u03e68C03b68H03b68N03e68V03b68<69003q69k03969n03c69t03769u03e69C03g69O03969R03h6a003d6a703a6ab03c6ah6ak03c6ar6at03o6aL03l6a<03g6b803d6bf6bh6br0396bx6bA03a6bE6bH6bK03b6bP6bR6bT03b6bZ0396c003c6ca6cc03a6ci0276cn0396ct03a6cx0396cA03e6cI0396cM6cV0396cY0396c>0396d20396d56d903a6dd03b6dj03d6ds6dx6dA03a6dH6dK0396dN0396dR03b6dW03a6d<03a6e26e66e80390376eb6ej6en6ep6et6eB0396eE0396eI6eO0396eU6eW6eZ6f003b6f86fb03b6fi03b6fn0396fq03b6fv03a6fA6fK0396fN6fQ03a6fU0396fX03d6g30396g603b6gc6gf0396gi6gp03b6gu03f6gE6gI03a6gM6gO03a6gT0396gW03b6h00396h403b6h96hb03b6hj6hl6hp6hr03a6hv6hx03e6hF6hI6hK6hP6hT6hV0396hZ0396i16i36i56i70390276i903a6id6if0396ii03a6ip6ir03a6iv03e6iD6iG6iI03c6iP0396iS03b6iX6iZ6i>6j103b6j66jb0396je03c6jl0396jp0396jt03d6jB6jD6jG03a0376jJ6jL03a6jP6jS03d6jZ03c6k30396k66k86ka0396kh6kj03e6kr6kt03a6kx03c6kD03f6kM6kO03a6kS03h6l303e6lb6le6lg03g6lr0396lv0396ly03b6lD03c6lJ03b6lO0396lT6lV03b6l<6m16m36m503a6m96mb0396me03e6mn6mp6mr03b6mx0390276mz03a6mD03a6mH6mJ6mL03w6n903f6ni03f6nr03c6nx03g0376nG03a6nK03c6nQ0396nU03b6n>6o26o40396o803c6oe0396oi0396ol0396oo6oq03a6ov0396oy6oA6oD03a6oI0396oL03b6oR03a6oV6oX6oZ0396p003m6pg03a6pl03a6pq6ps03a6pw6py6pB0396pE6pG0396pK6pM6pO6pQ6pS6pV03f6q20396q603a6qa6qf03b6ql6qo0396qr03a6qw03f6qF6qH0396qO0390276qW03b6r00396r303c6r96rc0396rf03a6rj6rl6ro03a6ru03a6ry03a6rC6rF03b6rK6rN03b6rS6rU6rW0396r>03c6s56s70396sa6sc03e6sl0396so0396sw0376sx6sz03b6sE6sG0396sJ6sL6sN03c6sV03a6sZ6t00396t303a6t703a6tb6td0396tg03b6tl03b6tq03b6tw03c6tC03g6tN03c6tT03c6tZ03b6u203b6u703x6uy6uC03f6uL0396uO03d6uV6uZ0396v06v20396v56v903a0276vc03b6vk6vm0396vp03a6vu6vw03a6vA6vC6vE03d6vL6vN6vS6vU6vW0396v<03b6w30396w60396w96wc0396wf6wi0396wl6wq6ws0396wv03c6wB6wG03a6wK0396wP0396wS6wV6wY6w<0376x003b6x56x86xa0396xd0396xg6xi6xk03b6xp03b6xu6xx6xz6xD03a6xI6xK6xN6xQ6xS6xV0396xY6y103f6ya6yd03h6yt03a6yz6yD6yF6yH0396yK03a6yO0396yR0396yW6yZ03f6z66z903b6ze6zl6zo6zq6zs0396zw03c6zC03a6zG03e6zP03e6zY03a6A20396A76Af6Aj6Al6An6Aq6Au03d0276AA03b6AO6AQ03f6AZ6B003g6Ba6Bc6Bf03f6Bo03a6Bs03a6Bw03h6BH03a6BN03b6BS6BV0396BY6B<03a0376C103e6C96Cb03d6Ci6Ck6Cm03b6Cr0396Cu0396Cx6Cz03c6CF0396CI03h6CT6CW03a6C<03a6D36D503b6Da03a6De03c6Dk6Dn6Dp6Dr03j6DF03a6DJ03f6DS0396DV03a6DZ03b6E203a6E66E80396Eb03o6Et0396Ew0396Ez0396ED0276EF0396EI0396EL03b6EQ0396ET0396EW03c6F20396F503a6F96Fb6Fd6Fi03a6Fm03d6Fu0396Fx0396FB03h6FN0396FQ6FS03a6FW0396FZ0396G003a6G40390376G603a6Ga03f6Gj6Gl6Gn6Gp03a6Gt03d6GA03a6GF03j6GS03b6GX03h6H66H803h6Hj03j6Hx03d6HE6HG03d6HN6HP03b6HU6HW03a6H<03e6I703c6Id0396Ig03f6Ip03e6Iy0276IA03c6IG03a6IK03i6IW03e6J20396J503a6J903a6Jd03g6Jn6Jq03c6Jw03f6JF03d0376JL0396JO6JR04W6LJ0396LM03e0276LT03a6LX03b6M06M303a6M703b6Mc0396Mg6Mi0396Ml03j6My03f6MM0396MP03l6N26N503b6Nd6Ng0376Nk6Nm03b6Ns0396Nv03a6NA03c6NG03f6NP03f6N<6O003e6O86Ob0396Oe03c6Ok6Om6Oo0396Ow6Oy6OA03c6OG03f6OQ03a6OU03a6OY6O<03a6P203a6P603e6Pg03c6Pm6Pq6Pv6PA03a6PE6PH6PJ6PP03a6PV6PX6P<0396Q103b6Q60396Qb03a6Qg6Qj03c6Qp03a6Qu6Qw0276Qx0396QG0396QJ03a6QP03c6QV6QX6QZ6Q>0396R203a6R70396Rc6Rf6Ri0396Rl0396Rp0396Rt03b6Ry6RA03a6RE6RG6RM6RQ6RT0396RY03b6S26S803b6Se03a6Sj6Sl03a6Sp0396Sw0376Sx0396SA0396SD6SI6SK0396SN6SQ0396SW6SY6T16T70396Ta0396Td0396Tg03a6Tl6Tn03a6Tr03b6Tw6TA0396TD03d6TK6TM0396TQ0396TT0396TY6T<03a6U26U70396Ua6Uc6Uh6Uk6Uo6Ut03b6Uz6UB6UD6UF0396UI0396UL0396UP03a6UU03b6UZ0396V103a6V503c6Vb0396Ve0396Vi0396Vl6Vn0396Vq6Vu03c6VA6VG6VJ6VQ0396VU0396VX0396V<0396W103d6W903a6Wg03a0276Wl03b6Wq03b6Wv6Wy03a6WD6WG0396WJ6WL03b6WR6WT0396WW6WY03a6X06X26X503f6Xe03b6Xj6Xn6Xq0396Xt6Xw0396Xz0396XC0396XG6XK03a6XO6XQ6XS6XU0396XX6XZ0376X<0396Y16Y303f6Yd03f6Yn03b6Yt6Yv6Yx0396YA03a6YE03i6YQ0396YT03m6Z803a6Zc6Zf0396Zi03c6Zp03e6Zx03a6ZB0396ZE0396ZH0396ZK6ZM0396ZP03b6ZU6ZX6ZZ6<00396<46<603a6<b03b6<g03a6<k03a6<o6<q6<u6<w0396<z03a6<H6<L6<O03d0276<U03b6<Z03b6>203f6>b03a6>f0396>i03c6>o03a6>u03h6>F03a6>J03b6>Q6>S6>U6>W6>Y0396>>03e70703b03770b03a70g03a70k70m03h70x03a70B70D03a70H03a70L03d70T03a70X70Z03a71171371503e71d03a71i03971n03k71B03b71G03c71M03i71Y03971>03972203d72972b03d72i03e72r03i72D72G03b02772K03f72U03E73q03f73A03e73I03e03773P03h73<03a74203p74l03974o03l74D03j74S74V03b74>75103a75575903b75e03a75j03a75n03a75r75v03975y03975C03k75U75W75Y03a76276603976c03b76h76j03k76y02776A03a76E03b76J76O76S76U03e77077203a77603i77j03c77p03977s77v77z03i77L03f77W03a03777Z77>03l78e03b78j78l78n03k78B78D03c78J78N03c78T03a78Y03b79179303979603d79d03c79j03b79o03b79t03a79y03c79F03e79N03a79R03d79Y79<03a7a203g7ac03h7an03c0277au03h7aF03b7aK7aM03d7aT03h7b203j7bf03r0377bz0397bC03h7bN7bP7bR03a7bW03a7c27c47c67c803e7ch03a7cm03b7cr03a7cv0397cy7cA7cC7cE7cH03a7cM7cO03b7cU0397cX0397c<03a7d303a7da0397dd03c7dk7dm7do0397dr03j7dE03j7dS7dV03a7dZ7e203e7ed03a7eh03b7en7ep7er03b7ew7ey03900C33803a05>0eh0ef05M33b33d23sg0C23u23K23w03923A03933s03933g03f33u03933o03905V06v06>2b<2bL0392bp2bn2bO2bN2bg2b>2by2dJ2bJ2bE2fq2dx2bP2bS2cF2ck2cg2c52bB2cE2cS0392cI0392bC2bZ2bY2sa2s805U23W03927bf>c05Ig2E03923U05L27u2re2rd2qj2qn2qm2qf2qe2pF2pE2pX2pW24329q29o03929r33r00C28U03h0322lg03r2kY03r2kE03h0363bE03h03628E03j00Af>903ag2Jf>d04wg2H00C34904q00r35F04t00u0hp03o0hH03e0300hV03o0ib03e031fXZ039fY1039fY7039fY5039fY903b036fY3039fX>039fXV037fXX03900t0jo03d0j90ju03x02V0jU03d0kp0j<03x01W0ei0390ex23r23t23J23Z27d27h29u03b2bt2bD2bH2cq2cK0392e72oo03H2p903e0372pg03f2pr03a2q40392qG03b2rh2dt33q33B03902Z07906F0am06E07r06N07z06M07P06R0ao06Q08l06X0aq06W08P0720as0710au0aw0ay0aA07406O0cp03708c08g0370cF03437d03I01O33F03g3dH3hm0393hA03a3hF3ic3im3ip0393itfXUg2Gg2I03727F3bV03723o03537435z03937503933e35B039fYh03hfYs03bfYx03g037fYG03cfYM03b02X33f02X2n804j01U7eA0397eD7eG03d7eO0397eZ0397f17f503b7fa7fc03d7fj03a7fn03b7fs7fw03a7fD0397fH0397fK03a7fR7fT0397fW0397fZ0397g203b7g803g0377gh03b7gm0397gp7gr03b7gw03f7gF03i7gS7gU03900F7gW03j7h703c7hd0397hg7hi7hk0397hn0397hq03b7hv03b7hA03a7hE0397hH03d7hO7hQ0397hV7hY03a7i00397i403b7i97ib03c0377ij0397im7iq03e7iy03b7iD7iF03b7iK7iM7iO03a7iS03b7iX03c00F7j003i7jc7jf0397jj03b7jp03g7jA03d7jH0397jL7jN7jP7jR7jT7jV0397j>03c7k503b7ka03j0377km03e7ku7kw7kB7kE03k7kS0397kV03c7l003a00F7l303a7l77la7lc03a7lg03a7lk0397ln7lp03i7lB7lD03f7lO03n7m303k0377mg03h7mr03g7mB7mD7mF7mJ7mL03e7mU03a00F7mX7mZ7n003e7n803b7nd03f7nm7no7nq7ns03b7nz7nB0397nE03c7nK0397nO7nS7nY7n<7o17o40397o77o903b7oe0397oh0397ol7oo03b7ot03b0377oB03f7oL03a7oP03e7oX7oZ03a7p203c7p803a7pc0397pf00F7pg03a7pk03a7po7pr7pt7pw7pz0397pC7pG7pK03c7pR7p<0397q20397q703a7qe7qj0397qm03b7qr7qv7qx0397qA0397qD03a7qJ7qN7qQ03b7qW0397qZ03b7r20397r50397ra7rc7re0390377rg0397rj7rl03a7rp03b7ru7ry7rA03a7rF7rH7rL0397rQ7rS0397rV0397r<0397s103a7s57s90397sc00F7sd03e7sm03d7st7sv03c7sB7sD03b7sI03e7sQ03a7sU03f7t10397t47t703a7tb7td7th0397tk0397tn0397tq7ts0397tv0397ty0390377tA03f7tJ03g7tT0397tX7tZ03h7u80397ub5oi9s75yb6fM5mm5nh5m87tp7sk8o47yS8d67Bl7bV9tw9xl6PM5Nh5326fh6tv5S08726Ag85S6ra7um5b16ou79Q82V8Bc55W5EJ6ai71X8dR6gk6cq5iR5jL7Le58P7pI5WY6es8Wj9w<6di83x5wB9w080G7c07t56yn7t66ke50U8TJ6eA7Hv6pp7iR6jQ6cX8bQ9B96x77cg6cS6ek4>Y7mH5gi5dC7<i95K5XS6Be6FA8987<p6Cq7Cd8tk9op55l8PI8eC86C5fd8Dq5cJ0277uc7uf7uh7uj0397ur7ut7ux0397uA03a7uE03c7uK03f7uU7uX7uZ03a7v20397v57v70397va0397vd0397vi7vk7vm03i7vz03b7vF7vH03a7vL7vO0390377vQ7vS7vU03c7w17w37w503a7wa7wc03a7wg03f7wq03f7wA8pc9v152B5zF9EV5NB6dV6dJ6tY8R19Rl7be6wT7Bp65W5gp5fv91g86k8TB9lF53l7eg5Df66P77x8BP5Es8eT6vQ7LM5TN7<>7nR6SZ8YK930944a036Os97x7Ls6147BL8mu8o56Ot6Ox6Ou5X95Zf7r19qR6oB5>i62d91D5C98aa9579sz9xR9217>u8TQ6c95275iw5gC91M03991P94l6zf60O89w8AM9Su69j5bP7rO60Q6pk72q6<M5O66kg58Z59U6yc4Xx7Gh9F475X0277wB03b7wI7wL7wN0397wR03j7x203a7x903a7xe03d7xn0397xr03j7xF7xH0397xK7xM7xP7xR03a7xV0397xY7x<03c0377y47y67y803k7ym03g7yw03a7yB03c7yI7qd5Y<7i38iE6lR6eM9lZ6SG5gy5eb6jn9ma7Ns4>T5Xz8b<87u89i6XI6Si9IX6gt5gA5n28AJ5yE4Xl5Xb6MJ7Q796M63u6mK7fA8C96wo6cl8TG7wQ8XN9af60N8iA8nF9Do5ia8tt6Nj66R66M7578el8bV4<r6RL8qn6ml7Sx6H56v18gh5ht7Mu51L59k6Uj5Qa8YR6iq5ih8fQ8f<6yJ7BY6k55OD5Rs5WS8OL6ee6yY8R26j86i28wh9Fj8Pv7>E9mW4ZL9ro9BI6rk7fu0277yK7yM7yO7yT03b7yY0397y>7z103b7zb03d7zi0397zm03a7zr7zt7zx7zz7zC7zE03a7zI7zM7zO0397zS0397zV03a7zZ0397A57A77A903b7Ae7Ag03b7Al7An7Ap7Ar0397Aw03a0377Az0397AC03j7AT03f7B003b7B503e5w25PB5Y09p755785E5ha6oC7od5nV53F8Vd6dc9lC6vB5rW70S5WG5jZ75q90K6cT6lI6hH61371g96Y8aH91U5Pw6sM62V6Rh9sg8V98AQ6lp7GU5ym6Ix6bo5kg4Yw7Hj66N71c8Oy6d793C9Jj7GI5jb7qY6f95fx6QE92D5>z9IU843a1751g5Q28UI82d6pJ76558d59W8sP5Tf5NE6e598Q7oY8Xk7HE6797N14<f7>07xd4Xp8aR5bB5b26IV5hM8Zf9nc9un6<99sI6Ey0277Bc03a7Bg7Bi0397Bn0397Bq7Bs03a7Bx7BB0397BE7BG7BI7BK7BM03f7BZ03b7C203b7C70397Ca03a7Ce03a7Ck03b7Cp03a7Cu03a7Cy03h0377CI03b7CN03a7CR03c7CX7CZ0397D00397D303d7Da03a7De03e7A855M7yv6jo8GK5Dc6iH5WB7J76E54>E8c15pw4XW7pS7Jv5YG5Zi9qT5bz5k175i6g<9nI5xa6rJ6E799f5nf6WX7ZT8zG6bX7<U7pZ8fM7C99uk91C68g7m>8Ol6MI5c28Uo6LF84O8kV5uV5fe4<m4Xz5ap7Rv99j7Pf52b8Z77OF7JA6kL5Ts55Q87e7r97S16WQ82E6wp5Mw5P07Cj6lS6jr6hO6fP9nx6jR9267Ms7rN6cr5DL5ke6N155H6bY5XK6Ne4<H8T>8Bj61d93S0277Dl03d7Ds03h7DD03c7DJ03m7DZ03c7E57E77Ea03b7Ef7Ei03g7Es0397Ew0397EF7EH0377EI7EK7EN03b7ES7EU03e7F17F303c7Fa0397Fe03b7Fj03b7Fo03a63E8456ed4Y15gt9706i086e6qK6PS50e66S6WF8OC6018uj60r6fF58y8gF6AH5b86gH8Yg53q5Rz7E>5P45bU7I366494r7uv61>61v7tc8YQ74T7t37Mh7xO5aX95r5zI50m6<Y92O6ok7Lz7ec6VI82D5KF6dZ5Zt5vU8la7LQ5XB5>D93q7>s9BE6ha6<f7Bw7615909wz5xP7nZ50b7o05Zv66K5EE6W86O77Bh5j49ut5aj5b96hh5ji9lr8Pb8Wk7c17BD8w<92R8Pl5iE0277Fr03e7Fz03j7FM03i7FY03c7G47G77Ga7Gc0397Gf0397Gi7Gk7Gm03a7Gr0397Gu0397Gx03d7GE03a7GJ7GM7GO0377GQ7GS7GV03e7H10397H47H60397H97Hc0397Hf03b7Hk7Hn03c7Ht0397Hw0397Hz0394X97uT5iS9lh9A<9>m9nR5Ny8NG4XG4XA59Q8kH6aa5dM6zj51v64P5a36TC58A6du6pv9sF8Qe93v7qw9757wH6Oq7di7eQ8P35zZ7x18Uk6wA9o885y5ZK6XF5Fq7KT7yR9o36NZ6pR7>m5ze58p9rD5P15BN5jM8YW6oK9B75uI9lB7v69496hf5me5Dy5E25xz8ZW6vZ8X28bZ5c966U5zt8v65SM9Yd52c9BB8O15HJ64<5hc6d494n97a9F764N83k58783X5Ps9EZ6TV4Zk0277HB7HD7HF0397HI03m7HY03a7I07I27I67I803d7If03h7Iq03c7Iw03o0377IN03e7IV03a7IZ7J303b7Ja7Jd7Jf7Jh03b7Jm03a7Jr0397Jx03a7JC7JF0398TU5ip80y7Mn4>o4Yn9r86St7io8qN5Xe7oO8336Hi7z69lq7Y95aF76K5il92s8fb8TN7dT9ER6Sz5wi8dX6q185O6c79rW5FM4>78O77<26o68iW9wC5oF9CC85J5fO8P55jE8625ZD6S08U18dQ98y5jN6Pz5be7Z>5wD77y6R67Rh5Ej4>563767I7RO4XU5P96xP8va5SU9nj9Cm7pT77593G59T7>B8O55Eh5aI50z5jK5DP6o>85I5MZ6c<6ea91o5Yd6PD7LK4>n52w6vl0277JH0397JL7JN03a7JS03c7JY03i7K803i7Kk03h7Kv0397Ky03b7KF0397KI7KL03d7KS7KU03b0377KY03c7L30397L67L803a7Ld7Lf7Lh7Lk03a7Lo7Lq0397Lu03a7Ly7LA0397LD7LF03a7LL7LN7LR6US6VO7Fn8BV5>v7nP6dy91d52T9aA6pL87T88p5ZA88o8UY5cT8Fe8Uj5Dl55d4<w9rA7b<8918TD5Ok8NH9sc5Ff7>y5lo5s<5rm8OJ6o16Fa9lx7uu6Zh5YW7nw6we6yp7L785B8U<67D7Ge6oG8UH59g5by9lG80085z7ZW5Rv6XT6wE7Ox7tj9Kw89n81s7St6jC9oo7I75ki5mJ6Mk6j96bg9Y586X7px5cW9wN8kz6A48uI9r99ts9mQ4XO5jc7<x6A18WD83t6uY5Zy8210277LT0397LW7LY03b7M17M37M57M703d7Me7Mg7Mi7Ml0397Mr7Mt7Mv7Mx7MA7MC0397MF7MH03i7MT0397MX0397M<7N07N27N40397N77N903b7Ne03e7Nm0390377Np03a7Nu7Nw03b7NC03a7NH03a7NS03a7NW0397NZ03a7O103f7Oa03a5ya8476Bv5WJ6o35dD64Ra1y51z8ZQ58Q5NP5>r5WN6QC6eV8TF58V9lN5f66RD8eD7ev5xG6xc8TR5DD91A8if5lt7Nl4>U6S55MI5Gp9>r5iI8ui9JM8P>85F6od9B65v29uf5bS7mA5co5OF6fa8Da4Yu6eo63O6D258X5Nw59E8Ga7NF9Fe80o66T74k8TT58h5Z793z7kU8Gc5vR7Ad60qa1D9r290M9M48OF7t06Aa6yA8WO8TZ5c591i6<y6Cl9nd96R5v56xA8D192f5mg0277Od7Og03b7Ol03b7Oq7Os03c7Oz0397OC03a7OG03a7OL03a7OP03a7OT0397OW03c7P003b7P57P703f7Pg03a7Pl0397Po03d7Pv03a0377Py03c7PE03d7PM0397PP03k7Q103d7Qa9K05MN6U>6PK4ZJ5NX9Jf98H69M95T9yN5jP6VZ5Oq5b55pi80t82U6m46gl6qV6a665l77i6Qv6Qh5DT6wR8bO5Ct5tm8QO6OP96B5F583v5i>6UN5kZ5pB8g>8in6A07G65lk50t5jg7uq8Rh9ra6RX6W08UP8Do9YI8U25s79<p7qt61g7eE64M5n44ZM6HO8AF64q90U5mc76w8t19Y76TO5Nn5>w7ZG5ph51T7fY5k45hy53x5jm5l44Ym6357ky5C<8kP86F8wY7eo7Si6Yu0277Qb03h7Qm03I7QZ03d7R603h0377Rg7Ri03e7Rr0397Ru7Rx03a7RE0397RH7RK03b7RP03a7RT0397RY03c7S20395>L8sm5nQ6dI4Zq6RO6b>8dV5mv5gm7g66<p7o35bq5fu8OB6Go61i6386WS5wn6LG7hT6Ar92w7>r6gG65H5nI7qO8QG77t6VH5NK5Z38gq68k9<c7D28wv7PL7tf5aU66<78k6sb5Yk64l8Pm74U6fJ91h62564G8us5uC6O965s68L5gh66E6sK8U77H54>y76N6Qf8NX8OW7<w8gI6rn5Iy9Ma6Up6W>8Q96U34>x74P8h>6bu66p9vl8TL7F05b35w65z26w27p07I57GT7Nt0277S70397Sa03a7Se7Sh7Sj7Sm03e7Sw7Sy0397SB0397SF03e7SN03d7SU03f7T10397T403l7Tj03d0377Tp03m7TF7TH03b7TM03a7TQ03a7TU03e85k9EJ9317288NJ9XF5GQ7<N7>h5jh6x96Cw91p7Ql9ue5ii63J7q66QW5gX5Kh7ZL6fI5aE87i5WV8mD6d85985MH4>m7ER5ca6606Um5Oc5Oa8NF8NU6qG62k9sd5Fr7<L7ZO5rh6x>5E150X5N<5dE8gy9Bi8U67nW9m654f7I44<>6x<9J65K96N47up5wy5Pu7M29qY78m59485N8cU5F07>c8fL6C86yQ7BV7A>6eH6gF7N852R5cO5an8go6Gz9cY8WZ8TV8G99nS7NR4<<0277T>03<7UT03f0377V003E54J8bU5cp9ET6Xo6Zd6VL5>256Z5GA5Pe6Ue6QD7pe8lj6AM5Eu8NW5fE98V9sl8oh6Dq7D977K86<4ZI96i6Uf9Jc5Hf5u46jd9mU7yP51J87y7eF8Gq9F27>Y7<C5d76ox98Z91791b5iP7Ju6iR6hJ7te7H08Av9r<6bO5dP8da6As6wU6g>7wP7KR6T97<r8GH5Go6bq8qh8dJ7ok53D4<j7pJ8OP5Qi5X67Mj6pI9ap4<i6TJ8ED7TL9nK4<d8PM92z9wX6sj7F992p76Q6V00277Vx03k7VL03e7VT03O0377Wy03E5Q55dW8ge58G8fm7wz6s<9S04ZQ66i7S67RX7<n4Zt8MK6sT9Bg9wx5Bb6oQ9oA61c7qh9wu7KD7KC5a875T7Jw6iO7I<7ZE7hu9yR4Yd7504YB98q5hN6op6qL8b48bd5lm5PV7py9xE6ew7ex7q55Qd9J18ii5Q85l87yN4Y66RS84y6eq6gS5WM58>8WB8XC9nT52V5iJ66L75Q5cL6go9Yb5HD53K7v>5g>7<G6ld6nP6dh6hw53s7bZ8Gh59X8O87<B5wf8ik9lL59z5jz5T30277X30460377Y27Y403c7Ya03c7Yg03t52i7KH6Uy96F9Jn5p85lu5gF5lT5>86iN6E>5aT68M5bi5zO5ew5wm7zl7vj5Z>68>7SE6cz6dv4ZG75t83b6e>76I9wE5w>8ez6yT6CZ7Ct9Bv7Gp5CX5lX5iT6XY58j5c35NG8P685T5ob5xK64X5wp5jR7J264o5Ms6hL6dE5iH6cH5Of6xT5mR7JD8eK98>5Zr8CI5E05xS6fm8WM86T5wv7M>51N62P5O56M65fF7Mo7ea6Ae7z77v<6q>59Z4Zn7us5S77JJ8kZ5Em9M95580277YC03H7Zb03v7ZA03a0377ZS7ZY7<30397<u7<I7<Q7>17>i7>o7>C7>>80180303e80b80e03h80q0399Fg67L6Zb5wI6re6ge5uU6eQ6cN5<r9rs5xb6eh5pf8vF88i91H5oK8hV6wJ8Uu8mB5IO6zn6eK7OS9rp58U71A8PU6j58Gg6aq7>e76a6<J7jd6Fs7f45<i96m6vv6UO6gC5dX7cG83950Q5GJ98O76x6VB5eq4Yo9u>9oR8p67Ci7TT57F5xq6ma85j7R36SO6CV6EC59>5hw6BM7d99<m7OV7f07G36>r7je6wm9ak9RI7E48hh8gs5jn6zv4Y55hh5dV7A65he5bN55g51j52o02780u80x80z03b80E80H03c80P03a80T03980X80Z03b81203b81703981a03f81j81l81n03c81t03c81z03981E81G03981J03981M03e81V03781X03c82203982682882a03a82e03b82j82l82n03c82u03982x03d82G0397qG7Kj7Rq6RJ9t<5dz7lb5mN52N84s8hW92C9oU5<h63A6VD5Xw6oz8809n664j7647<b7RS5ah6B97RV8cT4XI91e9an6t64ZS8Pd6lN84i56y7pv7am5OJ92570K4Ze6la9oH5<u6px5bv8Ca76g5dH7fm7jX6xv7C>9vu4XY9639SC6Wj5az8U95jB6em7hW8iV9u<a1c9mb4><81y5ak74Z9sZ5RR9Be5iK4<I6ZA7jh6FY7AP9Fn7ox5bw7rI6U96yX58Ra1x84j5lx7M47K702782I82L03982O03b82T82W82Y03e83503a83a83f03b83m03983p83r83y03983B03a83F83H03983P03d83W83Y84103984484684803984c03984f03a84m03b84r84t03a03784x84z03l84P03d84W03j9te5xc6eG9sf6F45Hc6ja7Or6>n9sj8dK5gG9Bd5Zo75h6hX5gI8sn9R99Zr7Bk9vW8WT8Ua9Z770C7Fc60t9se6bS9IY5jt9mB51H6qd5QJ5QF7>t8sp6PT61j7hf6<I7>75SK6fz5MO6<K5gZ4YV6hE7oJ6dF90S4>K4<p6RK7Z<8O28jB8y280v9439nH7NN9JF8D08k56Tz9Je7<A5Fg9<37hz7z98ta9IQ9Ja5rz5jv5yj4YU9ZK5gu92g87h7xq9Fq8uS6<F8nr6v468G6>P02785685903985d85g85i85l03d85s03985v85x85C85H85K03a85Q85U85X85Z03986003986386d86f03c86n03e86w86D03986G03986K86S86Z86>87187387603b87b03a87f03987j03787k87t87v87x87z03a87D03k87R03987U87X03a87>88103c8878PN8dq8fP7uW6Pr62x8i57fP8fd9ny6Oz7yz9me5gT8fa59q5Y58Rk8U04Yg7hP6xy6Bd98<9vh78I6RF7vh5Jq9o96On81m6rL5Oo5G15Jy9qM9q>4<Q8jk8lx6JQ7uD9nU7fz6BK5MD7vT99y9wF7SA92>8PA5>J7QX7Gw8Gd6Sk8vA5Oe5Ya6Ch7vE7<Z59t58l5eh5HN7>d9wG8ev6in7xc8qo7Gq6Y25Zx5Fx8np74R6Pp6e77u76on65T9r56rm8xD9XH9mR5jl5l58PQ6l002788803d88f88h88l03a88q88u03a88z03c88F03b88K88M88O03a88T88W03988Z03b89989b03c89h89j03b89o89q03d89x03989C03c89I03903789L89N89P03f89Y03d8a403b8ac0398af03a8aj8al03e6l18rp6HF89A7CM6kN9Ms6e16vP8hP5BM9<w6RP6>E5OC9sk8Pj7cD6yo6ef7cF4ZN5Ge6Ol5Br6tS5Yt5eD68t6vM7uS7wK7cL7Ie6f75mO5ko9lE95H5HA7ZX6Pu4Yb5E<83o5Eg5gv7n>9u65ui6fE87p6549r16Wu5kG9F959d5KN8755FS9vr53O6SJ5Q46eD50E5g789393e6<28nP6eg5YY7C66lZ6h362Z5Hw9979XD5Q76gn84a5N55oS9oi9ol6Vd65M6yE7eC5aB5N90278as03m8aI03a8aM0398aP8aS03c8aZ03d8b58b78bb8bf03c8bm0398bp8br8bt03d8bB8bE8bI03b8bN8bS8bW8c28c40398c70378c803b8cd0398cg8ci8ck03a8co03f8cx8cz03b8cE03f8cN6eL6SC7cz6cR9lS7<587r6Ur59A5>c5EY5dO63q5EX6tu8so7pD6fO6aK7ST8P25mK6LL9XJ6NY8qt5kt54<6RI5oO8VY7bQ5Xt63t7j<6el6hq7ck61w6Yb6U66n870w7uw7Co7v47os5bI5iz4Yr5ZC6q983O86u6dz5le5bM75S8Bl8Wp6SF5l086y5z18CY8Us9sO98l50N6Rz5p>7ue7zU6dM77171m60R8mQ6Cy7B47O>89M6vj9Yn6gL7BU5wT7zq9w16d16dP5dg7jZ6Ov0278cO03b8cV8cZ03b8d30398d80398db8dd03a8dh8dk8do8dr03b8dy0398dC8dE8dG0398dL8dW8dZ0398e203a8e70398ea0398ed0398eh8eo8eu8ex0398eB8eG8eL03b8eQ03a8eU8eW0398eZ0398f00378f28f403c8fi0398fl8fo8fq0398fu8fw0398fB03h8fN0398fS8fU8fW8f>8g38g55oI8867pW7tS5g17qC5735Q98MQ7Of54n7cf9Jv9Cw6>a7mG7EM6lf7xJ6f49Bp8TP5m984w4Yq5wO8f18jl5YX5aR7m<8Oc5Qn5wF6T49Bf5Ie7zY9Mc92P7Rt5cu6cp9n24<e8he8kF8iN8lW5ys6vY5vb6sS6UK8PV6uB73p6vD6M26zu6by5G34Xb5ac6>e6yq6Rn58<6Cj5Ef6ML7oK5Tm87oa0o6qv7Eg7E99Jp8U>5Ra4YC4>95jT5Ep7zk5sM6Ps92c5>b6R56SH8NP6ho0278g60398g90398gc0398gg8gi03c8gr8gt03c8gB8gG8gU03e8h10398h603e8hf0398hi03b8hn03a8hs03b8hx0398hB8hD8hF03e8hQ03a0378hT8hZ8i38i60398ia03a8ie8ig0398ij8il0398io03b8it8iv8ix03a8iC8iG03a8iK03a8iP03a64U6U57cZ6cK9lm9md5gb9297N64<D8PK4Z69<s9lV9lX5cl70A94H6Ud8PY5zp5Uk6LE6Mh6xO5kz88s81k5Bx8n>6026dG6If9o16oW65c6AJ7xL4Ys51M5WL9xw6lQ82w5SR52n7Jl5bf8fc4Xs63T7Jb9lK51Z4ZW7GK7jY5eI8e16mq7G55OB6R99wq9136PG5465h76Xd6mm6sY6PU66d9A>8O>5Ze7k47I>7Gj4Xw95V7jb6Qa5uy98j6Sd8Vj5g28ue6uW8ZT5Qg9IV6XE0278iS0398iX03c8j203a8j603a8ja8jd8jf03b8jo8jq03d8jx03a8jC03d8jN03f8jW03d8k103a8k603f8kf03a0378ki03e8kq03c8kw8kB03b8kG8kI03c8kO8kS03a8kW8kY8k>8l18l30395iu5H<a1j8VH5i35vg9BL6wb99z6Sh58M7qi6eX7dQ5c05dB80275s7s05gY9Yi6F>7AS9u88Cx81I77<7ab59h6yr7mI5CI6nw5t>8NN9E<6cU7<t67176R5CQ4<94<262l9yL4>38NI5bb5Fi7ZP6cs4<l6qJ6bm8g08mh8gH8xl79s6Z<5O17<q59v6ih6ys85h8g18zt57q5N25Fa91V4YX6QB58J8DJ90T9rS8oi7kC9no9qU6VK8eJ5>V6lq6Tq8jM88S9Sb5AC8Uz4Xh5i90278l503c8lb03b8li8ll8ln03f8lw8ly0398lB03b8lG03k8lU0398lX8lZ03a8m30398m68m88ma0398md03b8mj0398mm0398mq8ms0398mv0378mw03c8mC8mF0398mI8mL03c8mR03a8mV03i8n50398n803a4>C6oH6Ap5qr4XL6js9Jy6cP5Ka7kD8cW6VN6CS56L8hm7za6w85c16Rx7ZV5635oJ78C7Mz6sq7ii8eP6wh5QV5bE7958AP9qO9st6md8UF89X5pc6Qt6cf7>S5Bq4>I5oe8Un6sk4Xi5Py8CX6BG6gm7Hl76L8dl5f29y<5Pp5mM95Z7<l5EG8Ui8uf8bk0398UK6kc5Pc68p6Vh7E68O67z>7nX5l35008ZP6WV5HE7<d7EC6Rg5NF5I<7ny86668m6Xv5CU7nD7nJ7cW5gf7<X0278nb03g8nl03b8nq8ns03a8nw0398nz03b8nE8nG03g8nR03h8o603c8oc03b8oj03i0378ov0398oy03b8oD03c8oJ03a8oN03g8oX8oZ03b8p40398p703a7v97uz5cN86A5vH5Xg5DV7eS6q56Z78Ov5Q08sV5g97yX6f66q<4<89CD8t85NC8Oe5iW7yG5175Qm9I<5Gj5>n7E25CP4Xu6z74Zj6eR8Jr93B5e76rT5qA5sQ93a4<t51l9ai9EU6Pn5Xa64b5NI8Ge8Ot6n<6cj9Fu5Ng5P76hg5nS5iv7rK5958nQ6xG6BX6Ni6dq91r5is8bq6Wp7pn4YK8Um5MU79D8pT6tp6ux80W8v89<l9>E5QC6vT92U6zp6wD6bl7Ku5Bd5Z<6oU6>V0278pa0398pe8pg03e8po03i8pB03e8pJ03a8pN8pP03a8pV03d8q08q203e8qa03e8qi03c8qp0390378qs8qu03d8qB03e8qJ03b8qO03m64t5b>83l6ks8AU7nN5Xd6zr6eY9vA5ik7c58P96PY7wF7Hm5jS7xQ9B28bA8OY7At6vs7696pT6lt5r<63B7G95j04XB6N385e5P25qH5uz5025049EW5WX6x684063a9Ba9395Nj8O48OZ6jA8cw6mC5r58en98J52v7TE93D7RD56X5Ap6ZT5O78Oh85b9908lA7Nv8t59tj9tn7<J9Kr7Bm5R97Iv94a9tL7ED5Mx6gD7Lj8mp6BR5ne7>N7jo7TG9n96c85Ak4<u5Nb5F15As0278r10398r403a8r803c8re03i8rq03b8rv03n8rM8rO03l8s103a8s503b0378s903j8sq0398st03c8sz03a8sD03a8sH03f7gR6fC8Yj8Xn86m8es6dQ5iU6SU98C5DO6396QU5wl6ki8TO7rP6<N5wz6J87qU70R8PR8Pg5wK6OT8Bq7BX6hG5j175R6QI5Aw6jO5za6CE89z5no7Su53w8<26Wk8VD76P6hn6Vz6<s7<K8jc6Ab93b6Ww9s<8NM5Ev7d18qI8967q48Ji6BT5cs8XG9np6io9Bw8Yc5p450r6v75tn66t6Vt5cb5Qh5DN6X35AP7nU7nA64Q8bs88e6fp6wF92G7w28WX8TY9m95Xu5hd5jQ76b0278sR8sT0398sW03e8tb03e8tm03c8ts8tu03d8tC03c8tJ0398tP8tR0398tW0398t>03a8u303c8u903a8ud8ug8uk0398uq0398ut03a8uy8uA0378uB8uE03b8uJ03b8uO03a8uT8uZ03a8v203b8v78v98vc03a8vj0398vm03b8vs8vu6Q85<>54A4ZR5ZR6g28cf93y6Ao98S7xX5jk9mA60I7KJ6A<6gd7Mq7<D7qz54>6dt5DY93n5b07Gb7J95v661q93s6Va5QE5vD5jo58s6Yl5uG6hM9Br8978vt8DO9385jC5QT8a86eu6cw87V9XZ9s89IS9J46DR5FJ6er5o66fu5mf8ux6U45Hb7mK8BA6MO5Du8Qk5>T6Z67hN9B54Y076>5Nk7Bv6g56sy7tu66j5Nz5Ih4Xf88t6QO7hj4ZF6xh80p6186r26vz62w5Fc5H90278vx8vz8vB8vD0398vI8vK03a8vO03b8vT0398vW0398vZ0398w003a8w40398w803e8wi0398wl8wn03b8ws03a8ww8wy03d8wF0398wK03f8wT8wV03a8wZ0378w>03b8x703a8xc8xe0398xh0398xk8xm03c8xs03a8xw03e8xE03c5Wl61S5gV9yK92B6Ad5uY5nT66D4Y270l7<Y8ef8jm5Gs4>D4>O5Q67ZQ6vO8ny5kX7on86b5pa9Mn50l6XR8Pr5Ph68U5gP7rD6XN8ti6pf9r37<15k37HX7Ti9qS5qF8297mS6fB8vv6VF7JB6bp6pF5gL6iF6Rb5WP5kA9lM4Yk6QF8OQ5Qj6qE8dA6BL5k65jY6Oj6MK4Zs6ga5gg8bC4>l51S5wC6bi9v66sI7cN5f75dF65D8OT6rs79x6xo8F77Aq7z56sU5s35k09nF7d20278xJ03a8xN0398xS8xU03a8xY8x<03b8y30398y60398y903c8yf03a8yk03c8ys03e8yA03b8yF03b8yK03b8yP03a8yT03h0378z203b8z703b8zc03d8zj03f8zs8zv03b8zA03c8zH7H864T5Xk65h89B5Dt66A79c76T6ZO6Qo7d86Jc8BR5XR4YE5JX5pA9mH6Tv7T39tx6bn7<e7xm8t65fH9vC91u6tf5SF51E7eR4Xj5hK5Dn5jr6h89nM58g4<x9RA7ZI5m08TI8As8b>9qW6Vm5>K5Kk6s69sN7hU7fS5i78929Fd81F5NO9s>9so7<77v05hG9o<9Fx7NV8Ec6Yw4YF82s7EJ8OK66X5ml4ZP9B15W>6IF56n5jp8QF8jL7AB9vc5ci5mS5tH9n86Vg5NZ6We6sr0278zI03l8zX03d8A20398A503a8A903a8Ae03d8Am03d8At0398Aw8Ay03e8AK0398AO8AR8AT8AV8AX03b8B003a0378B30398B88Bb8Be0398Bh0398Bk8Bm03b8Br03a8Bv03c8BB03c8BH8BJ03d5Pn5MB6zF85u5p07Lp6og6Es4Zz6Mf8wm9xj5gn6fD6k295O6pA8698Po59x6BU5h08z16ag6Sc6T38PG5Qp8pO8dT9nk6LH91z6pU63362b52F8Ad6rD88J7fN67258Y5bp5xj60G95G8Ak99q5Z06wn63L5Gr58c5a<8705fg6R19uc79i4>p52S81C6w55qd9ng7G88Bu7<H5BD6bk9v88sy5rw9B361o8O08mc98v5ix6qR5Zn7oA64I7US5J77<O7<R90N5pL5NH65Q6qj7hc0278BQ8BS03a8BW03c8C003b8C503b8Cb0398Cf0398Ci03b8Cn03a8Cr8Cu0398Cy03c8CE0398CK0398CN03e8CW8CZ03a8D20398D58D703a8Db03d0378Dh8Dj03c8Dp8Ds03c8DA03c8DG03a8DK03b8DQ03b8DV03a8DZ8D>93h7sH7vN7<y9wY8pz5MK7IY9uO8A85ej79n61O6qQ8OG5P39IT5WF6Nh6Qz8NR8NT93i92d5hj6e49XK9XR5k84XP8e57cx8tA5Tu8Ax6VT9ud5mp4Zy8N<77h5m59rh76D6X17uo4XJ7zs8vq5RN5<<8H89BA9rm75m6S75Ec6hN7w48Al6>s8cX5zU7at5hk7zy9u95n960K77U5NY8Py9Jk6Nb5DS9XT7GL6wM6cQ50T7pF81i6Tj9rX6PL4<U7qq5936z>70695888U5Fu7k<0278E003g8Ea0398Ed03w8EE03d8EL03r8F40378F50398F88Fa8Fc0398Ff03y6kf5PL94J7Jp8PH5Gy5lQ8b88gT8F98386DU5sm83<7b>9am59<4YD9AZ6hu4Xy5i<6uX88j5DA6VW4X85D15g36iu9mV51B4>i8AH9Bo5D>94v7H34<O86U7pp6Ra5NA5GM60B6Dd8t953y5WW4Yx7yH4<J8d26dp6rr95p5R14<76118ae94085c7pP4ZK8Cs67n6Od62e4Yh7ui6ZG8OH8NS8Pi8Op5>a83482k7<m8fZ8gP5uE6N>9yX9rY5H35jD9m<6WP5Od9ES5Q15>t9to0278FG03C8Gb8Gl8Gr03a8Gv03a8Gz8GB8GD03b8GI8GL03b8GQ03a8GU03a8GY03e0378H303c8H903d8Hg03t5gU8eV6HV5IY9YU5Zs7>M8i18jI0398gL8wf92m8UG7ug60V9Bu7AQ6rE5mD6eJ50H8ab7qg5<09ul8Xi8v15ln6SX6Vk6Q06575ef7nM5Z54>w65E62L5PI7nV95S9m87e16S16Y098h6vh5ij5iX50p9ah8OV5ig5Z492a6WI4Zm7ua6Fe8sC67y8be50x52C9469R467h6XB6Xs9td4Zg5HV9uM4Xm5R77G15Nf8OR8257hh5yD8dj9695j994f5q35SO61F67g6LW7eV85W8Jh0278HC03D8I703g8Ih03t0378ID03x8J203e6UY5Or8Ct9Bc8QP9IR9XX6Xi59I58b5xH8B95hD6iY91t5uR5kw5ve7g76Zo7>w92A8ep68763M9sG6uU7ZK8Vi8Wb9lJ5RX7RI6vg65K9rd83w4Zp96L5f89sM58992o8oY98B6st9yZ5Mt5fB7A06wa6A55mh7565NU91559l5vM5lV6nq6ta8UC8Ub87n8kQ94R7SD5b78r36xH6qN71F8tI8Z95sO93E7ta74<7aJ8TH6eN5bx6T58U463m5BC69m6v68UE6cm5pX6XH6vR90L0278J903f8Jj03f8Js03S0378Kb03E9mF9r07vM6zd6FM5lj4Yl7608Og6kw6pj5Nd7Jc5425OM7y36OF8J17Rw6S67un6pN91v5TR5Qt8s06zg5gE6bw7Kx6Yz7>56HD7KE60U6>X5>E6hk6VM6wu4Xg5Xo8TK4<v8687rY9tA6ez6rR6d66S48UZ78L80N58e85f5iQ94S6dw5mW8uU91x83d9nv8nv92x6Ux7il6pD7vD7nc7zL8b38TC9lg51K6xt7q18Oi9vf6fT9of9rZ8m06fH7w96197eU4Zh63s6oY6eT6MH6o70278KI03G8Lg03z0378LI0398LL03C5XL7qf96p8O98dB6xB6nT5jV8vw7yJ85G87a6Q94Yj7<f84k7uY6Dl6Nu6cL54451c5w86ff6MG8W65iO6qM7<062v6fy6h>8aX03980S5XA5Sx5b<6t27GN7Hy8TM75x7qs6<C6S37Jq4XR7ud62E9lD8A>7<g7Gl8679al4<W4>v8bD5kM5WC6TW8Ok7RJ90Y85w5Xy5lq7tV5Nx6s49JI7iE6zO8uz6vV7fO8P08Oz93o7L176z78S6ec7xN5rV4Y38kv6yV5dN8u88TS9n07Mp0278Me03D8ML03c8MR03x0378Nf03w8NQ8NV8O38Of8Oo8OO8Ph8PC50n6SM7EB9J36dr7bO6f54Xr7zu90Q6lU8Uy7Oe6AN5Zc8Cd5Fe6lC5CS7d<6Dm9nJ9358Uw5wE7>88Pe5ae6gh6ex5gr6Ak7jG8f998k5oc7w87546Ui5915lM8Uc5H76<j6Wc5MA7TP4<s7R56<r5Mo8aO6Xl5Mv9Lb6Ct8XO5Nv7>46437ZZ9618UU5En6il7GD8VX5gq6qn7Eu8Od9s37<c9m37Za5rY99h6v880O5Pi94Z6rM5WK50o6yC54y50A5wo5ZL0228Q003g8Qa03b8Qg8Qi0398Ql03f8Qu03b8Qz03d8QH03e8QQ03e8QY03b8R303e8Rb0398Re0390378Rg8Rj8Rl03e8Rt03a8Rx03s4Zl4Xk5884Xo5>75gd4Xt4Zw4XC9LW5MQ5sN4XM7G24Y75ft4Yf5DR7c35gS6Po5uD86I9Fv6Or7x69>v4X<4ZD9>o4YA4YN4Zr8dg5Mz5oQ5rn4<c5hl5hB5hH5hJ5hS9wJ8UB5fy5iZ5fK5fS5g68UA5gK5gH5ba5bg5bm5bR5bX5c70395ck5cC5cF5cA8lT5d55da5d95do5dr59a80s4<34<b4<h4<a4<M4<F4<P4<C4>z4<X4>G50I4<Z4>J4>L4>h4>P50C50L6o050y50B0278RS0460378SR03E50D50v4>W50550<50Y51p51h51b51n51651351O51451Q51s52K52M52O52d52y52H52A52p52D53053N54k52X53Q53n53S53R53653A53k53J53M55654b54t54g54m54Q55355J55L55N56256u57e56R56Q56K56S57f57j4<B6Q550w50J52ma1E6Qe7QY58S5X59<h9Fw5995Ds5f15fl8Hf5fo5aP5Dx58t4ZE58u4ZX8AS8BI4ZZ87s8Cq7F85LY8zb82059P59V5a55a40278Tm03m8TE8Up0398Uv8UD8UJ8UM03a8UQ8US0398UV0398V003g8Va0398Ve03b8Vk03c8Vq0398Vt03h8VE0390378VG8VI03k8VW8V<0398W18W38W58W803a8Wd8Wf03b8Wl8Wo8Wq03a5af59u59G59J8NE8NK0398NO8NY0398N>8Oa0398Oj8On8Om8Oq03a8Ou8Ow0398OA8OD0398OI8OM0398OS8OU8OX8O<8P18P48P70398Pa8Pc8Pf8Pk8Pn8Pp0398Ps03a8Px8Pz8Pw8PB8PD03a8PJ8PL8PO0398PS0398PW0398PZ0395gN5h29rB9rG9rF9rV9rO9s59s49sa9sh9ss9sD9sL9sQ9sW9sY9tg9tl9tv9tU95v95z95B95x95Q95F95Y95X95<9620278Wt8Ww0398WA8WE03a8WJ03a8WN8WR0398WU03a8WY8W<8X48X603e8Xe03a8Xj8Xl0398Xo03b8Xt03f8XE0398XI03c8XP8XR8XU8XW03a8X<03a8Y30398Y60378Y78Yb8Yd0398Yk03c8Yr03d8Yy03j8YL0398YO0398YS8YV96095U96n96d96696o96c96f96r96K96G96A96v96z96P96T97697c97G97C97H97V97T98198b98e5bl5Ea5dG5dQ0395e65n75eo5eu5eU5iD7aS7yl5<Y5aZ5b49LT5h<5>97oy5WT5wk5xN5xF5B65C45Cd5Cp5vN5vQ5vO5vX5w15vS0395wA5w35wa5wN5xd5wP5xe5x45x35wM5wR5w<5wX5xR5xI5xk5xW5yn5xL5xY5xr5xE5yt5yw5yy5yx5yq5y05yY5yT5z05yI5yB0278YX8YZ8Y>03c8Z50398Z88Za03a8Ze8Zg03e8Zp03a8Zt03e8ZB8ZD03j8ZR0398ZU0398ZX03e8<303f0378<b03i8<n03t5zj5zl5z55yR5z85zC5zx5Ac5zE5AJ5AQ5B95Bh5By5B89FM9>x6b78d18d58d78dn8di8dM8dc8dm8dp8dv8dx8dP8e08e68dU8eg8ei8eH8dw8d>8dS8ej0398e98dN8dY8dF8dO8dD8ec8em8dI8eF8fh8e>8eI8fn8ff8eA8eY8eq8ew8fk8f38er8fp8fy8fe8fs0398eE8et8fA8gp8gz0398fg8hq8g48fY8fV8hz8gC8fT8gn8gf8gb8gD8g88fv8gE8fR8g28fX8gK8gJ0278<J0460378>I03E8gM8fz8gN8gQ8gO8gR0398hU8h08hX0398hE8hO8hr8hA8hd8h48h<8hN8h58i08h38hw8hC8hM8i28i48i98j98iJ8iw5zf8jw8jj8iB8j58iu8jA8k08jp8je8is8iD8jn8jb8j00398iO8id8i88jK8iU8iF8kA8kp8ky8kx8kX8lf0398l28lh8l08k48ke8kN8k<8lk8lm8jV8kR8m98ml8mo8mK8m58mr8mi8m78m28mE8lF8m18lY8lv8mJ8mH8nk7nl8o08mU8o18nD8o202790d03E90O91891k91q91B91E03a91I03b91O91Q03b91W03b91>03992203a92703992b92e03792h03c92n92q92u03992y92E03992H92L92Q92T92V03992Y03a93203a93603993f03993k93m93r93t93w8ou8o38n78n48ox8og8oM8oI8oC8p27xG8ob8oW8p38pI8pM8pf8pn8p18pS8pA8pd8q18p>8pU8qr8q98qA8r78rL8rd8rN8ru8s45>65>g5E45E983>5Et5Ey5Ew5fn5PG5PJ5PQ5PY6ck6cO6dD6e36ei6ey6ev6eS6fG6e<6g16gj6gb6hR6i<6gV6h26hm6hY6gR6hQ6hi6gN6hS6i46iW6j06iE6j76ic6iC6im6kq6ie6i66kd6k96jj6jz6jE6jk6jK6jF6kC6lc6kR6lu02793x93A93H03a93L03d93U03c93>94103994594703994b94d03994g03c94m94s03a94x03994A03d94I94K03994N03b94T03c94<03e95695903795c03b95h03995k03c95q95s95u95w95y95A95C03a95I03995L03a95P95R95W95>9640399670396l26l>0396lx6m26m86mo6mv6mI6mG6nh6nJ6nS5>j62q7nx5>p5gD5iV5j55iN5iM5j35jq5ju5je5kj5kq03a5ku5kb5jF5kv5kx5jH5jW5la5ls5k>5kV5kI5ly0395lc5k<5kK5lB5mo5lR5ma5lY5mq5lL5lK5mr0395kW5lH5mt5m35m75mk5mx0395mA5lN0395lI5mB5mn5mC5nz5mL5nE5n55ns5mX5nG0395nn5np5nL5nO5oL5pn5pZ5oh5oR5o95ot5o75oo5o402796a03996e96g03996j03a96q96s03a96w03a96C03a96H03a96N03996Q96S96U03b96Z03a97103b97703a97b97d03r97y03a03797B97D03a97I03i97U97W03e98203g98c5n>5ou5oZ03a5nX5nU5oA5pj5qq5pb5pV5q15pg5p95pD5p65qu5pp5p35qD5q50395ps5px5qO5q>5qh5rD5qp5qP0395qs5qK5qB5qc5qT5qJ5qW0395qk0395qM5qZ5qI91s5rC5rg5rk5r95rI5rH5r65r85rL5rR5sw5s15sv5rQ5sl5sG5sx5sA5sk5ss5te5sI5sV5sP5t30395td5tr5tT5us5uv5uB5uF5uZ5uP5v15v75vc5vi5vh5vA5Xn5Xx5Xs5Xp5XV5Y303902798d98f03998p98r03b98w03998z03998D03998K03a98P98R98X99203a99803c99e99g99i99m03999r03e99A03d99I03d99P03999U03b99<03b9a30379a403i9ag9aj9ao9aq03h9aB03g5X>5Yc5Ys5Yz5YC5YF5Rk5R25Rl5Ro5Ru5Rg5Rw0395Rp5Ry5RA5RZ5RG5S55RQ5RP5RV5RH5S95R>5Sc5Sq5SI5Sj5SJ5Ta0395TL5TK5TS5TI5TC5Te5Tz5Uw5U65TY5U55UQ5Uz5UT5UB5UP5Uj5Ui5UN5UY5Va5Vx5VB8QX5V>5Wd60X60>61a61f61h61k61t61x61A61M61R61Z6248AG60F7dR7dU7dY7d>0397eb7e97em7el7eq7eM7eT7eN7eW7eY7e>7f97eX7fb7f20279aK0460379bJ03E7f37fv7fr7fF7fi7fC7fB7ft7fG7g17fJ7fQ7g07fV7go7gl7gv7gE7gQ7gT7h68bz5DJ9CL5DI5Da9EH9EL03d9EY9E>9F59F89Fc9Ff9Fi9Fl9Fo0399Fr03a5Z85Zp5Zj5Zu5ZJ5ZE5<15ZZ5<65ZX8Ur5<q5<p5<z5<M5<O8a262c62h62u62n63b62S63c62F62I63663d03962O62R63063x63Z63K63z63n63l63N63P63i64763F65003965365264a0279ce03R9cZ03o0379de03f9dn03w64O65565u65y65R65B65b65q65k65z66Q66365V66B66w66e66y65Y67E67K67t67H66Y67867m67P68i68Z69Q69s69L69>6as6aZ62B9tX9qN9qP9qV9qX9qZ0399r49r69rb0399re9rg9ri03b9rn9rq9rt03a9rx0394XQ7c76bt6PZ6Qs6QA6Qi6RH6Rd6Ro6Rs6Rk6QM0396QY6Q<6Re6RN6So6Ss6RR6S>0396SV6Sv6RW6SE6Su6T26SP6SS6RV6Sr6ST6T60279dM03d9dT03w9eh03D0379eN03E6U16TL6Tk6Ub6Ug6Tf6Tc6Tx6Tm6TP6Ul6TS6TZ6Ty6Un6Uq6Us6TX6Vp6UT6VC6VE6UC6Vr0396UA6UE6V46UH6Xy6Wf6Wd6WC6Xm6W76WE6Xp6WK6WB6Wx6Xu6VP6Xk6VS6XP6YS6Ym6YP6ZW6YD6Ze6Yr0396XW6XJ6Yc6<D6ZV6Zw6<E6>R6<G6ZJ6ZL6<56<36Z>6<v6ZY6<n6Zn6<a6ZD70G70e0396>I6>t6>16>T6><70j70Y6>O6>h6>N71h71l71k71070W71471272p0279fi03X9g703i0379gi03D9gP72h71L72171<72a72F72S72C72E72T73y73H73z74173Z74n74C5N85Nc5Nt5Nr5NJ5O07nT9JC6jY5OI5OS8DU5OU8Yf8Lf91<92r92t92J92S92I92N92K92X92M93d93c93j93K93p93l93u93F93Z03993R93T94c94p03994o94M94w94G94z6u194Y95595a95g95b95j60o60v60u60w5Q35lP5Qo5Qx5MV5QH5QK8245>O5>N5>R8cY6049M35QS5F95Fb5Fl5FN0395FH0279gQ03G9ho03z0379hQ03B9ij03a5Fv5Gi5FP5FC5FI5Gq5FW5FT5Gv5G65Hd0395GB5Hg5GH5Gw5H15Hk5Hh5HW5HY5Hp5HH5Hr5I85IL5Ii5It5I45IG5IZ86Q5JO5Jz5I>5J25K65KP5JW5Kq5Ks5K05KE5KH5KV5Ku5KK5Kw5KA5Lh5Lv5Lu5LW5L>5M85Pt5PA5My5MJ5MX5Mp5Mr5MG9IZ9I>0399J29J79J59J80399Jd9Jg9Ji9Jo9Jq0399Ju9Jw9Jz03a9JD0399JG0399JJ9JL7ZD7ZF7ZH7ZJ7ZM0390279im03f9iv03<0379jm03E7ZR7ZU7<67<803a7<h7<j0397<o7<s7<v7<z7<E0397<M7<P7<S0397<V0397>l7<<7>20397>67>903a7>f0397>j0397>n7>p0397>v7>x7>A7>z7>D7>F03e7>O03b7>T03c7>Z5Z27p75Wz7o695t7hm7hp7hS7hG7hD7in7ia7ip7h>7hX7i87ih7ig7iJ7ix9B47ji7iN7iL7iC7i27iW7jn7jO7kz7jK7jJ7jM7jU7jS7jQ0279jT03m9k703P9kQ03b0379kU03s9lp9lu9lw9mf9mn9mr0399my9mK9n39nA9nE7jz7jy7k97kA7kv7kt7kx7k>7kR7l67lA7lm7l80397lf7lj7lC7lM0397lo7lL7mq7m29yO03a6wk6wr6wC6wg6wN6xJ6xf6wO6wX6xw6xL6wZ6xM6xC6xR6xj6w>6x46yU6zh6yw6zi6yN6xU6zk6yx6xZ6yy6xX6yB6z86yb6y06yG6zm6y96z56zW0396AE0396Am6AG6Ac6AI6Bb6zB6At6AK6A96AL6A86A66Ai6Ah6zN6BZ6Bn6AY6A>6Br6AP6Ca6ES6D46DD0396D10279nL9nX9o59ob9og9oj9ot9oy9oE9oS9oY0399o>03f9p803O0379pP03E6DI6CU6Dj6D96Ev6CH6Do6EV6E16EE6Ea6EB6Fc6EP6F86Fw6F06DY6Gk6Ff0396Gm6Fh6EK6EH6F16Fz6FL6G36FP6FR6Gs6FV6G96Gi6GD6Ft6GE6Fl6H76HT6GR6Hv0396IJ6GW6Ic6I66JE6Io6Iz6HZ6Jm6J16I56HM6Iw6J46Jp6Jo6JN6Jv6JP7f>7gq6N90396Nf6Nc6Nq0396Nl6Ny0396NF6NO90P90R90V03a90Z03991090>91103991491691903991c91f91j0279qk03z9qQ9r79rf9rr9rw9rz9rC9rE9rH03e9rP03a9rT0399r>03b9s69s99sb9si9sm0399sp03a9su0390379sw03a9sA03a9sE9sH9sJ0399sP9sR03c9sX9t003k9tf9th03991l03a91w91y8<m6bj6bv6bz6bD6bG6bF6bJ6bI6bQ8aL7mT7mY7n77nn7np7nr6nY6qS03a6ri6rx6wW6rb6rt6r875d6u>6rB6rY6rV6r<6rZ83e6sD6ss6s96sn6su6sF6sv6s>6tc6tk6tL6tB6u66uz0396uK6uN8TW0398T<8U38U58U88Ud0398Ug0398Uf8Ul8Ut8Ux8Gf8Gi03a8Gm03b7cS7dD7cB7cK7cT7d60397dc7dj7dl7dn7dq6fg6fW6hU0279tk9tm9tp03a9tt0399ty0399tB03h9tM03f9tV0399tY0399t>0399u20399u79ua0399ug9ui0399uo0399ur0399uu03h9uF03e9uP0379uQ03a9uU03a9uY0399v09v203b9v79va0399vd9vi03a9vo03a9vs0399vv03c9vB9vD0396k76mw83c6OO6OX6P56OZ6P16Pd6Pf6Pe6Pl6Pt6Pw03a6PF6PN6PI6PO6PW6nZ6ot6oP7cl7cq7cu7bU8sG5bu85D85A85r8646vi86585V85P85R85Y85>86L03b86z86a86c86x86l86v6vo86B86P86V86Y86R87l03986W8746vt87q8Qy87<87C87Q87w87W88g88k88r88Y88x03988V88E88N89403988R88L5Al5JZ89g89a89p6<t89H89O8ak6vK8ai8a30279vF03g9vP0399vS0399vV9vX03c9w203b9w703q9ws0399wv0399wy9wA0399wD9wH0399wK03a9wO03f0379wW9wZ9w>03c9x503f9xe03c9xk9xm03a9xr9xt03a9xx03c8a989K6LI6L>6M16Mb6Me6Mx9Cp03a9Ct9Cx0396NX6086Oa8GX6poa0p6pr6q46qe6qc6qb6qk6qm6qq6qu75875A75u75B76376875>75P75V76M76i77o77r77u77T77V78X78A78M78d78W78i79079279w79X79Z79M79E7aE7as7aL7b17bB7bM74Q77w78K7a16c66c56cb6cg0397E37E87Ee7Eh7Ez0397Er7Ey7EG7Ev7EE7ET7EL7F27Fd7Fi7Fy7FL7FX62p62o0279xC0399xF0399xI03e9xQ9xS9xU0399xX9xZ03S0379yI0399yM9yS03c9yY9y>03v64464B64y64L64964x64H65P67e67l68B69N69B6aj6ap6be8588576Rr6S<6X47y<7z07z87zh7zv0397zp6pP7zR7zA0397A103a7zD7A47zJ7zQ7zH7zN7Am7AR7Au0397zK7Ao7Af7Ak7AO7Bz7Br7By7Bf7BA7BF7BH7BW7C17BJ7Cs7Cx7Ch7CQ7CW7Dd7CY7Dr7DI7DC7DYa1z9>19>30397uV7vc7vl7v17vf0397vy7vG7vx7vR7vK7vZ7w07wo0397wf7wb7wy7wM0279zn0460379Am03E7wG7wJ7x77xl7x57x87xk7xp7xD0397xU7xZ7y57o27o87om7oj7og7oz7oW7p17pb80w80F80D8Ig80M80Y80V8118198167ul7uJ8zW9ld03a9lj9li9lk0399ln0399ls9lv9lt9ly03a9lH0399lP9lO9lR9lQ9lT0399lW9lY9l<03c9m40399m79mc9mg03e9mo03a9mt03a9mx9mw9mz9mC03a9mG9mI0399mL0399mO0279AT03d9Bj9Bm9Bq9Bt9Bx9BH9BM03J9Cn0399Cs9Cu0399Cz03a9CE03c0379CJ0399CN03C9mN9mP9mS0399mX03a9m>9n19n40399n79nb9na9ne0399nh0399nl03a9nq03c9nw9nz9nB03a9nG9nO0399nN9nQ9nV0399nY9n<03a9o49o60399oa9nZ9oc03a9oh9ok9om0399oq03a9ou03b9oz9oC0399oB9oF0399oI03g9oT9oV03a9o27yL7yQ9uh7Gt7GR7GH7GP7He5Uf7Hb7Ha7HC7Hs0279Dg03c9Dm0399Dp03A9DT03y0379Ei03h9Eu03k9EI9EK9EX9F00399F39F69Fa0399Fh7I17H>7Ip9<n9FJ7IU7tg7tm7tr7tx7tI7mC7mE7nQ9XE9XG9XM03c9XW9XV9X<9Y09X>9Y10399Y69Y90399Yc9Ye03b9Yj0399Ym9Yp9Yt9Yv9Yy03a9YC9YH9YK03e9YV9YR9YX7pq7ps7pu7pE7pB7pQ7pH7pX0397q07qc7pV7pU7qb7qa7qu7ql7qH7qM7qK7qI7qP7qL7rb7qV7r47r77ro7r87rd7rk7rv7ri7rJ7rw7rt7rx0279Fk9Fm9Fy03i9FK0399FN03T0379Gx03E7rz7s47rG7rE7s87rR7rU7s77rZ7sb7s67rX7sl7sC7ss7sA7su7sP7sT82i7KK7J00397J87Je7Jg7Jt7JK7JE7JQ7JM7JR7JX8AI8AN8AW8B58B78Ba8BG8Ce8B>8C48Ch8CG8Cm8CH8CJ8CV8Dy8D48CM8D68CU8DF8Dx8Dr8Dz8Di8DY8DP8D<8E98EK8F37pj86J7tW7tY7yA83q83s83u83A83E83G83J03a83N83M83V83j83Z84b84e84l84q84N84V8Fb9B09B89Bb0279H20460379I103E9Bh9Bk0399Bn9Bs9By0399BC0399BF0399BJ0398sl8ss8sQ8sS8t78t28t48t38tM8tl8tj8tQ8tB8tL8tH8tO8tr8tN8t<8uc8tZ8um8tU8u28tV8tT8uh8un8tY8uN8uV0398uR8uX8uo8vr8uC8uY8uD8uw8up8vb8vf8v08vg8vi8vl8vh8vH8w38vC8vJ8vS8vy8w68wg8vY8vV8vN8v>8w78xa8vG8x50398x38wE8wU8wk8wS8xj8wr8wH8x48wI8wx8wJ8xr8xT8xM8yq0279Iy03p9IW9Jb9Jh9Jl0399Js0399Jx9JK9JN03e9JW03b9K19K39K503a9Kb0399Ke03c9Kl03b9Kq9Ks03b9Kx03b0379KB0399KE9KG03b9KL03b9KQ9KS9KU03g9L29L403e9Lc03a8ye8xg8xd8xR8xv8xb8xP8yJ8xQ8xZ8xX8yj8yr8y58yp8y88yi8yz8yO8yE8yS8zu8zr8z68zi8zz8zF8A18A47><80a80c0398bo7L27L57Lg7Lb0397Lt7Li7LP7Ln7Mf7M07LO7Lx7LS7LV7LE7LJ7LI7LX7M67LC7Mw7My7Md7MZ7Mk7MB7ME7MS7N37MG7MW7MV7No7NK0397O07NQ7NB7NM7Nd7NO7NA7NG7NP7NY7Op7O97Ok7OB7Oy7OJ0397OO7Pk7P67P47Pn7Pu7Pj0279Lf9Lh03d9Lo03a9Ls03i9LE03a9LI03i9LU0399LX03f9M503b9Me9Mi03a9Mm9Mo9Mq0399Mt03d0379Mz03E7PD7PO7PK7Q07Q97Q88b68b90398bc8aQ8Ac8bF03a8bR8bT8bM8bP8c08c38bX0398c68cc8ch8cj8cn8cy8cD8cM8B68Bd8Bg8Cw8CD8EC81B81D81L81T03981W7R46oh7Rp7RB7RA7RC7RG7RW7S40397S97Sf7Sk0397Sg7Sd7Sv7SM8cS6tM82782m82t82J82F82K82N82S82X7T07U>7VK7VS7Yf7Zz9<09ZY8UX8Vc8Vs8Vp8VV8UL8UR8Qf8Qh98i98o98m03998I0279N40460379O303E98G98F98U98N98T99503998W98Y99199k99d99o99l99p99G03999O99R03a99Z99Y9a28Qt9Z68W08WP8Xd8Yx8YN8VZ8W78W48W28Wc8Wu0398Wy8WC8Wm0398Wz8We8WQ8W>0398WH8X18X38WI8Xh8X58Xs8XB8XD8XQ8XS8XH8XT8Y28Y88Y18XZ8Y58XV8Yh8Y90398Yp0398Yi8YU8Y<8Z48YT8YY8Zd8Zn8Zs8Zo8ZA8ZC8R08Ra8Ri8Rd8Rw8Rs6pz8Gu8GC8Gy8GA0279OA0460379Pz03E8GJ8GP8GT8I68LK9wr9uN9uX9uT9ve9v99vg9vn9vm9vO9vR9vU9w6a18a1ba1d03da1k9>69>j9>l9u19u40399um9uq7y79uE9dm9dS9eg9g69gO9ii9hn9k69kP9R79Ra9Rd03b7HH9Rj9Rm9Ro03a9Rs0399Ry0399RC03d9RJ03c9RP9RR0399RU03f9S203b9Sc03b9Si0390279Q40460379R39R50399R89Rb0399Rh0399Rk9Rn9Rr9Ru03b9RB9RO9RQ9RT9S19S603c9Sg0399Sp0399Sy0399SE0399Sk03c9Sr03a9Sv03a9SA0399SD9SG9x49xd9xp0399xs9xT9xP9xH9xW9xY9JV9JU9J>9Yw9J<9K29K49K99K89Kd9Ka9Kj0399Kp9Md9Mb9Mf9Mh9Mg9Ml9Mp9CM9Dl9DS9Et9Es9KD9KF9KK9KT9KP9L39KR9L19Lg9Ln9Lr9LD9LH9<50397Y39Za9Zf0399Zj9Zq9iu9ZB9ZD9<z03a9<E9<D9<G9<N9<L9<J9<O9<T9>G9>Q9>Ta019>>a05039a0c0279SH0460379TG03E00F9Ub0460379Va03E00F9VH0460379WG03E00F9Xb03z9XI9XL9XS9XU9XY9Y30399Y89Yl9Yo9Yq03a9Yu9Yx9YB9YD03b9YJ9YS0399YW9YY03h9Z80379Z99Zb03b9Zh0399Zk03d9Zs03g9ZC9ZE03d9ZL03b00F9ZP03g9ZZ03a9<10399<49<703c9<d03b9<i03a9<o9<q0399<t03a9<x0399<C9<F9<H0399<K9<M9<P03b9<U03g9>29>59>703e0379>e03c9>k9>n9>p0399>s03a9>w9>y03d9>F9>H03g9>R0399>U03900F9>W03ca00a02a04a0703ca0d03ia0q03K037a1103da19039a1l03ja1A03aa1F03cfDQfF1fFtfGLfGV00FfHk03bfHpfHr039fHwfHD03afHH039fHL03a";

	var n642dec = function(n64){
		var char = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ<>";
		var result = 0;
	
		for (var i = 0; i < n64.length; ++i) {
			result = result * 64 + char.indexOf(n64[i]);
		}
	
		return result;
	};
	
	var result = [];

	for (var i = 0; i < charset.length; i += 3) {
		var k = n642dec(charset.substring(i, i + 3)) - 200;

		// 编码中断部分，用负数代表中断长度
		if (k < 0) {
			result.length -= k;
		}
		// 正式编码中，164为最小值，而连续编码长度最长的为114，所以不冲突，小于164的即为连续编码
		else if (k < 164) {
			for (var j = 0; j < k; ++j) {
				result.push(result[result.length - 1] + 1);
			}
		}
		// 连续编码初始值，是几就是几
		else {
			result.push(k);
		}
	}

	return result;
})();

// UTF-8 转 GBK 编码表
vschess.UTF82GBKCharset = (function(){
	var result = [];

	for (var i in vschess.GBK2UTF8Charset) {
		result[vschess.GBK2UTF8Charset[+i]] = +i;
	}

	return result;
})();

// GBK 转 UTF-8
vschess.GBK2UTF8 = function(array){
	var result = [];

	for (var i = 0; i < array.length; ) {
		var k = array[i];

		if (k < 128) {
			result.push(vschess.fcc(k));
			++i;
		}
		else if (k === 128) {
			result.push("\u20ac");
			++i;
		}
		else {
			result.push(vschess.fcc(vschess.GBK2UTF8Charset[(k << 8 | array[i + 1]) - 33088]));
			i += 2;
		}
	}

	return result.join("");
};

// ArrayBuffer 转换为 UTF-8 字符串
vschess.UTF8 = function(array){
	var result = [];

	for (var i = 0; i < array.length; ++i) {
		if (array[i] < 16) {
			result.push("%0", array[i].toString(16));
		}
		else {
			result.push("%" , array[i].toString(16));
		}
	}

	try {
		return decodeURIComponent(result.join(""));
	}
	catch (e) {
		return ""; 
	}
};

// 检测是否为 UTF-8 编码
vschess.detectUTF8 = function(array){
	for (var i = 0; i < array.length; ) {
		var k = array[i];

		if (k < 128 || k === 255) {
			++i;
		}
		else {
			var length = k.toString(2).indexOf("0");

			for (var j = 1; j < length; ++j) {
				if (array[i + j] >> 6 !== 2) {
					return false;
				}
			}

			i += length;
		}
	}

	return true;
};

// 将 ArrayBuffer 转换为 UTF-8 字符串
vschess.iconv2UTF8 = function(array){
	return vschess.detectUTF8(array) ? vschess.UTF8(array) : vschess.GBK2UTF8(array);
};

// 将 UTF-8 字符串转换为 GBK ArrayBuffer
vschess.iconv2GBK = function(str){
	var array = str.split(""), result = [];

	for (var i = 0; i < array.length; ++i) {
		var code = vschess.cca(array[i]);

		if (code < 128) {
			result.push(code);
		}
		else if (array[i] === "\u20ac") {
			result.push(128);
		}
		else {
			var GBKCode = vschess.UTF82GBKCharset[code] + 33088;
			result.push(GBKCode >>   8);
			result.push(GBKCode  & 255);
		}
	}

	return result;
};

// 简单合并，不做处理
vschess.join = function(array){
	var result = [];

	for (var i = 0; i < array.length; ++i) {
		result.push(vschess.fcc(array[i]));
	}

	return result.join("");
};

// 动态加载 CSS，用 Zepto 或 jQuery 方式加载的外部 CSS 在低版本 IE 下不生效，所以使用原生方法
vschess.addCSS = function(options, type, href){
	var link = document.createElement("link");
	var head = document.getElementsByTagName("head");
	typeof vschess. styleLoadedCallback[options.style ] === "undefined" && (vschess. styleLoadedCallback[options.style ] = []);
	typeof vschess.layoutLoadedCallback[options.layout] === "undefined" && (vschess.layoutLoadedCallback[options.layout] = []);
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", href);

	link.onload = function(){
		if (type === "global") {
			for (var i = 0; i < vschess.globalLoadedCallback.length; ++i) {
				typeof vschess.globalLoadedCallback[i] === "function" && vschess.globalLoadedCallback[i]();
			}

			vschess.globalLoaded = true;
		}

		if (type === "style") {
			for (var i = 0; i < vschess.styleLoadedCallback[options.style].length; ++i) {
				typeof vschess.styleLoadedCallback[options.style][i] === "function" && vschess.styleLoadedCallback[options.style][i]();
			}

			vschess.styleLoaded[options.style] = true;
		}

		if (type === "layout") {
			for (var i = 0; i < vschess.layoutLoadedCallback[options.layout].length; ++i) {
				typeof vschess.layoutLoadedCallback[options.layout][i] === "function" && vschess.layoutLoadedCallback[options.layout][i]();
			}

			vschess.layoutLoaded[options.layout] = true;
		}
	};

	head.length ? head[0].appendChild(link) : document.documentElement.appendChild(link);
	return this;
};

// 初始化程序，加载样式
vschess.init = function(options){
	// 全局样式，统一 Web Audio API
	if (!vschess.inited) {
		vschess.AudioContext = window.AudioContext || window.webkitAudioContext;
		vschess.AudioContext = vschess.AudioContext ? new vschess.AudioContext() : false;
		vschess.addCSS(options, 'global', options.globalCSS);
		vschess.inited = true;
	}

	// 风格样式
	if (!vschess.styleInit[options.style]) {
		vschess.addCSS(options, 'style', vschess.defaultPath + 'style/' + options.style + "/style.css");
		vschess.IE6Compatible_setPieceTransparent(options);
		vschess.styleInit[options.style] = true;
	}

	// 布局样式
	if (!vschess.layoutInit[options.layout]) {
		vschess.addCSS(options, 'layout', vschess.defaultPath + 'layout/' + options.layout + "/layout.css");
		vschess.layoutInit[options.layout] = true;
	}

	// 音效组件
	if (!vschess.soundInit[options.soundStyle]) {
		$.each(vschess.soundList, function(index, name){
			var soundName = options.soundStyle + "-" + name;
			var soundId   = "vschess-sound-" + soundName;
			var soundSrc  = options.soundPath ? options.soundPath + name + ".mp3" : vschess.defaultPath + 'sound/' + options.soundStyle + '/' + name + ".mp3";
			vschess.soundObject[soundName] = function(){};

			// 支持 Web Audio 的浏览器使用 Web Audio API
			if (vschess.AudioContext) {
				var xhr = new XMLHttpRequest();
				xhr.open("GET", soundSrc, true);
				xhr.responseType = "arraybuffer";

				xhr.onload = function(){
					vschess.AudioContext.decodeAudioData(this.response, function(buffer){
						vschess.soundObject[soundName] = function(volume){
							var source   = vschess.AudioContext.createBufferSource();
							var gainNode = vschess.AudioContext.createGain();
							source.buffer = buffer;
							source.connect(vschess.AudioContext.destination);
							source.connect(gainNode);
							gainNode.connect(vschess.AudioContext.destination);
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

				vschess.soundObject[soundName] = function(volume){
					soundObject.settings.volume = volume;
					soundObject.controls.stop();
					soundObject.controls.play();
				};
			}

			// 其他浏览器通过 HTML5 中的 audio 标签来实现走子音效
			else {
				$("body").append('<audio id="' + soundId + '" src="' + soundSrc + '" preload="auto"></audio>');
				var soundObject = document.getElementById(soundId);

				vschess.soundObject[soundName] = function(volume){
					soundObject.volume = volume / 100;
					soundObject.pause();
					soundObject.currentTime = 0;
					soundObject.play();
				}
			}
		});

		vschess.soundInit[options.soundStyle] = true;
	}

	return this;
};

// 查找连杀着法
vschess.findKill = function (situation, maxDeep = Infinity) {
  if (typeof situation === "string") {
    var RegExp = vschess.RegExp();
    RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
  }

  var checkedFen = {};
  var root = { situation: situation, parent: null, key: vschess.ZobristKey(vschess.situationToFen(situation)), next: [], player: 1, score: 0, deep: 1 };
  var checkQueue = [root];

  main: while (checkQueue.length) {
    var checkTask = checkQueue.shift();

    if (checkedFen[checkTask.key]) {
      continue;
    }

    checkedFen[checkTask.key] = 1;
    var legalList = vschess.legalList(checkTask.situation);
    var nextList = legalList;

    if (checkTask.player) {
      nextList = [];

      for (var i = 0; i < legalList.length; ++i) {
        var movedSituation = checkTask.situation.slice(0);
        movedSituation[legalList[i][1]] = movedSituation[legalList[i][0]];
        movedSituation[legalList[i][0]] = 1;
        movedSituation[0] = 3 - movedSituation[0];
        (vschess.checkThreat(movedSituation) || !vschess.hasLegalMove(movedSituation)) && nextList.push(legalList[i]);
      }
    }

    if (nextList.length) {
      for (var i = 0; i < nextList.length; ++i) {
        var movedSituation = checkTask.situation.slice(0);
        movedSituation[nextList[i][1]] = movedSituation[nextList[i][0]];
        movedSituation[nextList[i][0]] = 1;
        movedSituation[0] = 3 - movedSituation[0];
        var movedFen = vschess.situationToFen(movedSituation);
        var movedZobristKey = vschess.ZobristKey(movedFen);

        if ((!checkTask.player || !checkedFen[movedZobristKey]) && checkTask.deep < maxDeep) {
          var next = { situation: movedSituation, parent: checkTask, key: movedZobristKey, next: [], player: 1 - checkTask.player, score: 0, deep: checkTask.deep + 1 };
          checkTask.next.push(next);
          checkQueue.push(next);
        }
      }
    }
    else {
      checkTask.score = checkTask.player ? -31999 : 31999;
      var parent = checkTask.parent;

      while (parent) {
        if (parent.player) {
          var maxScore = -Infinity;
          var hasZero = false;
          var hasScore = false;

          for (var i = 0; i < parent.next.length; ++i) {
            var score = parent.next[i].score;

            if (score > 0) {
              maxScore = score;
              hasScore = true;
              break;
            }
            else if (score < 0) {
              if (score > maxScore) {
                maxScore = score;
              }
            }
            else {
              hasZero = true;
            }
          }

          if (hasScore || !hasZero) {
            parent.score = maxScore + (maxScore > 0 ? -1 : 1);
            parent = parent.parent;
          }
          else {
            parent = null;
          }
        }
        else {
          var minScore = Infinity;
          var hasZero = false;

          for (var i = 0; i < parent.next.length; ++i) {
            var score = parent.next[i].score;

            if (score === 0) {
              hasZero = true;
              break;
            }

            if (score < minScore) {
              minScore = score;
            }
          }

          if (hasZero) {
            parent = null;
          } else {
            parent.score = minScore + (minScore > 0 ? -1 : 1);
            parent = parent.parent;
          }
        }

        // if (parent && !parent.parent) {
        //   break main;
        // }
        if (parent) {
          // break main;
          console.log(parent.deep);
        }
      }
    }
  }

  var maxIndex = -1;

  for (var i = 0; i < root.next.length; ++i) {
    var currentScore = maxIndex === -1 ? -Infinity : root.next[maxIndex].score;

    if (root.next[i].score > 0 && root.next[i].score > currentScore) {
      maxIndex = i;
      break;
    }
  }

  if (maxIndex === -1) {
    return null;
  }
  else {
    var fenA = vschess.situationToFen(root.situation);
    var fenB = vschess.situationToFen(root.next[maxIndex].situation);
    return { move: vschess.compareFen(fenA, fenB, 'node'), score: root.next[maxIndex].score };
  }
};

// 将军检查器
vschess.checkThreat = function(situation){
    if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

    situation = situation.slice(0);
	var kingIndex = 0;
	var player = situation[0];
	var enermy = 3 - player;

	// 寻找帅、将
	if (player === 1) {
		for (var i = 0; !kingIndex && i < 9; ++i) {
			situation[vschess.castleR[i]] === 21 && (kingIndex = vschess.castleR[i]);
		}
	}
	else {
		for (var i = 0; !kingIndex && i < 9; ++i) {
			situation[vschess.castleB[i]] === 37 && (kingIndex = vschess.castleB[i]);
		}
	}

	// 车、将、帅
	for (var k = 0; k < 4; ++k) {
		for (var i = kingIndex + vschess.kingDelta[k]; situation[i]; i += vschess.kingDelta[k]) {
			if (situation[i] > 1) {
				if (((situation[i] & 15) === 1 || (situation[i] & 15) === 5) && situation[i] >> 4 === enermy) {
					return true;
				}

				break;
			}
		}
	}

	// 马
	for (var i = 0; i < 4; ++i) {
		if (situation[kingIndex + vschess.advisorDelta[i]] === 1) {
			var piece = situation[kingIndex + vschess.knightCheckDelta[i][0]];

			if ((piece & 15) === 2 && piece >> 4 === enermy) {
				return true;
			}

			var piece = situation[kingIndex + vschess.knightCheckDelta[i][1]];

			if ((piece & 15) === 2 && piece >> 4 === enermy) {
				return true;
			}
		}
	}

	// 炮
	for (var k = 0; k < 4; ++k) {
		var barbette = false;

		for (var i = kingIndex + vschess.kingDelta[k]; situation[i]; i += vschess.kingDelta[k]) {
			if (barbette) {
				if (situation[i] > 1) {
					if ((situation[i] & 15) === 6 && situation[i] >> 4 === enermy) {
						return true;
					}

					break;
				}
			}
			else {
				situation[i] > 1 && (barbette = true);
			}
		}
	}

	// 兵、卒
	if ((situation[kingIndex + 1] & 15) === 7 && situation[kingIndex + 1] >> 4 === enermy) {
		return true;
	}

	if ((situation[kingIndex - 1] & 15) === 7 && situation[kingIndex - 1] >> 4 === enermy) {
		return true;
	}

	if (player === 1) {
		if ((situation[kingIndex - 16] & 15) === 7 && situation[kingIndex - 16] >> 4 === 2) {
			return true;
		}
	}
	else {
		if ((situation[kingIndex + 16] & 15) === 7 && situation[kingIndex + 16] >> 4 === 1) {
			return true;
		}
	}

	return false;
};

// 检查局面是否有合法着法（未被将杀或困毙）
vschess.hasLegalMove = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

	var player = situation[0];
	var enermy = 3 - player;

	function checkMove(src, dst) {
		var s  = situation.slice(0);
		s[dst] = s[src];
		s[src] = 1;
		return !vschess.checkThreat(s);
	}

	// 棋盘搜索边界
	for (var i = 51; i < 204; ++i) {
		if (situation[i] >> 4 !== player) {
			continue;
		}

		var piece = situation[i] & 15;

		// 车
		if (piece === 1) {
			for (var k = 0; k < 4; ++k) {
				for (var j = i + vschess.kingDelta[k]; situation[j]; j += vschess.kingDelta[k]) {
					if (situation[j] === 1) {
						if (checkMove(i, j)) return true;
						continue;
					}

					if (situation[j] >> 4 === enermy && checkMove(i, j)) return true;
					break;
				}
			}
		}

		// 马
		else if (piece === 2) {
			for (var j = 0; j < 4; ++j) {
				if (situation[i + vschess.kingDelta[j]] === 1) {
					var targetIndex0 = i + vschess.knightDelta[j][0];
					var targetIndex1 = i + vschess.knightDelta[j][1];
					if (situation[targetIndex0] && situation[targetIndex0] >> 4 !== player && checkMove(i, targetIndex0)) return true;
					if (situation[targetIndex1] && situation[targetIndex1] >> 4 !== player && checkMove(i, targetIndex1)) return true;
				}
			}
		}

		// 相、象
		else if (piece === 3) {
			// 红方相
			if (player === 1) {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vschess.advisorDelta[j]] === 1) {
						var targetIndex = i + (vschess.advisorDelta[j] << 1);
						if (situation[targetIndex] >> 4 !== player && targetIndex > 127 && checkMove(i, targetIndex)) return true;
					}
				}
			}

			// 黑方象
			else {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vschess.advisorDelta[j]] === 1) {
						var targetIndex = i + (vschess.advisorDelta[j] << 1);
						if (situation[targetIndex] >> 4 !== player && targetIndex < 127 && checkMove(i, targetIndex)) return true;
					}
				}
			}
		}

		// 仕、士
		else if (piece === 4) {
			for (var j = 0; j < 4; ++j) {
				var targetIndex = i + vschess.advisorDelta[j];
				if (vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkMove(i, targetIndex)) return true;
			}
		}

		// 帅、将
		else if (piece === 5) {
			for (var k = 0; k < 4; ++k) {
				var targetIndex = i + vschess.kingDelta[k];
				if (vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkMove(i, targetIndex)) return true;
			}
		}

		// 炮
		else if (piece === 6) {
			for (var k = 0; k < 4; ++k) {
				var barbette = false;

				for (var j = i + vschess.kingDelta[k]; situation[j]; j += vschess.kingDelta[k]) {
					if (barbette) {
						if (situation[j] === 1) {
							continue;
						}

						if (situation[j] >> 4 === enermy && checkMove(i, j)) return true;
						break;
					}
					else {
						if (situation[j] === 1) {
							if (checkMove(i, j)) return true;
						}
						else {
							barbette = true;
						}
					}
				}
			}
		}

		// 兵、卒
		else  {
			// 红方兵
			if (player === 1) {
				if (situation[i - 16] && situation[i - 16] >> 4 !== 1 &&			checkMove(i, i - 16)) return true;
				if (situation[i +  1] && situation[i +  1] >> 4 !== 1 && i < 128 &&	checkMove(i, i +  1)) return true;
				if (situation[i -  1] && situation[i -  1] >> 4 !== 1 && i < 128 &&	checkMove(i, i -  1)) return true;
			}

			// 黑方卒
			else {
				if (situation[i + 16] && situation[i + 16] >> 4 !== 2 &&			checkMove(i, i + 16)) return true;
				if (situation[i -  1] && situation[i -  1] >> 4 !== 2 && i > 127 &&	checkMove(i, i -  1)) return true;
				if (situation[i +  1] && situation[i +  1] >> 4 !== 2 && i > 127 &&	checkMove(i, i +  1)) return true;
			}
		}
	}

	return false;
};

// 着法生成器（索引模式）
vschess.legalList = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

	var legalList = [];
	var player = situation[0];
	var enermy = 3 - player;

	function checkPush(step) {
		var s = situation.slice(0);
		s[step[1]] = s[step[0]];
		s[step[0]] = 1;
		vschess.checkThreat(s) || legalList.push(step);
	}

	// 棋盘搜索边界
	for (var i = 51; i < 204; ++i) {
		if (situation[i] >> 4 !== player) {
			continue;
		}

		var piece = situation[i] & 15;

		// 车
		if (piece === 1) {
			for (var k = 0; k < 4; ++k) {
				for (var j = i + vschess.kingDelta[k]; situation[j]; j += vschess.kingDelta[k]) {
					if (situation[j] === 1) {
						checkPush([i, j]);
						continue;
					}

					situation[j] >> 4 === enermy && checkPush([i, j]);
					break;
				}
			}
		}

		// 马
		else if (piece === 2) {
			for (var j = 0; j < 4; ++j) {
				if (situation[i + vschess.kingDelta[j]] === 1) {
					var targetIndex0 = i + vschess.knightDelta[j][0];
					var targetIndex1 = i + vschess.knightDelta[j][1];
					situation[targetIndex0] && situation[targetIndex0] >> 4 !== player && checkPush([i, targetIndex0]);
					situation[targetIndex1] && situation[targetIndex1] >> 4 !== player && checkPush([i, targetIndex1]);
				}
			}
		}

		// 相、象
		else if (piece === 3) {
			// 红方相
			if (player === 1) {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vschess.advisorDelta[j]] === 1) {
						var targetIndex = i + (vschess.advisorDelta[j] << 1);
						situation[targetIndex] >> 4 !== player && targetIndex > 127 && checkPush([i, targetIndex]);
					}
				}
			}

			// 黑方象
			else {
				for (var j = 0; j < 4; ++j) {
					if (situation[i + vschess.advisorDelta[j]] === 1) {
						var targetIndex = i + (vschess.advisorDelta[j] << 1);
						situation[targetIndex] >> 4 !== player && targetIndex < 127 && checkPush([i, targetIndex]);
					}
				}
			}
		}

		// 仕、士
		else if (piece === 4) {
			for (var j = 0; j < 4; ++j) {
				var targetIndex = i + vschess.advisorDelta[j];
				vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkPush([i, targetIndex]);
			}
		}

		// 帅、将
		else if (piece === 5) {
			for (var k = 0; k < 4; ++k) {
				var targetIndex = i + vschess.kingDelta[k];
				vschess.castle[targetIndex] && situation[targetIndex] >> 4 !== player && checkPush([i, targetIndex]);
			}
		}

		// 炮
		else if (piece === 6) {
			for (var k = 0; k < 4; ++k) {
				var barbette = false;

				for (var j = i + vschess.kingDelta[k]; situation[j]; j += vschess.kingDelta[k]) {
					if (barbette) {
						if (situation[j] === 1) {
							continue;
						}

						situation[j] >> 4 === enermy && checkPush([i, j]);
						break;
					}
					else {
						situation[j] === 1 ? checkPush([i, j]) : barbette = true;
					}
				}
			}
		}

		// 兵、卒
		else  {
			// 红方兵
			if (player === 1) {
				situation[i - 16] && situation[i - 16] >> 4 !== 1 &&			checkPush([i, i - 16]);
				situation[i +  1] && situation[i +  1] >> 4 !== 1 && i < 128 &&	checkPush([i, i +  1]);
				situation[i -  1] && situation[i -  1] >> 4 !== 1 && i < 128 &&	checkPush([i, i -  1]);
			}

			// 黑方卒
			else {
				situation[i + 16] && situation[i + 16] >> 4 !== 2 &&			checkPush([i, i + 16]);
				situation[i -  1] && situation[i -  1] >> 4 !== 2 && i > 127 &&	checkPush([i, i -  1]);
				situation[i +  1] && situation[i +  1] >> 4 !== 2 && i > 127 &&	checkPush([i, i +  1]);
			}
		}
	}

	return legalList;
};

// 着法生成器（坐标模式）
vschess.legalMoveList = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

	var legalList = vschess.legalList(situation), result = [];

	for (var i = 0; i < legalList.length; ++i) {
		result.push(vschess.s2i[legalList[i][0]] + vschess.s2i[legalList[i][1]]);
	}

	return result;
};

// Fen 串合法性检查，返回错误列表，列表长度为 0 表示没有错误
vschess.checkFen = function(fen){
	var RegExp = vschess.RegExp();

	if (!RegExp.FenShort.test(fen)) {
		return ["Fen \u4e32\u4e0d\u5408\u6cd5"];
	}

	var errorList = [], board = vschess.fenToArray(fen), Kk = false;
	var total = { R: 0, N: 0, B: 0, A: 0, K: 0, C: 0, P: 0, r: 0, n: 0, b: 0, a: 0, k: 0, c: 0, p: 0, "*": 0 };

	function push(error){
		~errorList.indexOf(error) || errorList.push(error);
	}

	for (var i = 0; i < 90; ++i) {
		board[i] === "K" && !~[ 66, 67, 68, 75, 76, 77, 84, 85, 86 ].indexOf(i    )  && push("\u7ea2\u65b9\u5e05\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "k" && !~[  3,  4,  5, 12, 13, 14, 21, 22, 23 ].indexOf(i    )  && push("\u9ed1\u65b9\u5c06\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "B" && !~[     47, 51, 63, 67, 71, 83, 87     ].indexOf(i    )  && push("\u7ea2\u65b9\u76f8\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "b" && !~[      2,  6, 18, 22, 26, 38, 42     ].indexOf(i    )  && push("\u9ed1\u65b9\u8c61\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "A" && !~[         66, 68, 76, 84, 86         ].indexOf(i    )  && push("\u7ea2\u65b9\u4ed5\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "a" && !~[          3,  5, 13, 21, 23         ].indexOf(i    )  && push("\u9ed1\u65b9\u58eb\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "P" && (i >= 63 || i >= 45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("\u7ea2\u65b9\u5175\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");
		board[i] === "p" && (i <  27 || i <  45 && !~[0, 2, 4, 6, 8].indexOf(i % 9)) && push("\u9ed1\u65b9\u5352\u7684\u4f4d\u7f6e\u4e0d\u7b26\u5408\u89c4\u5219");

		++total[board[i]];

		if (board[i] === "K") {
			for (var j = i - 9; j > 0; j -= 9) {
				if (board[j] !== "*") {
					board[j] === "k" && (Kk = true) && push("\u5e05\u5c06\u9762\u5bf9\u9762\u4e86");
					break;
				}
			}
		}
	}

	board[45] === "P" && board[54] === "P" && push("\u7ea2\u65b9\u4e5d\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[47] === "P" && board[56] === "P" && push("\u7ea2\u65b9\u4e03\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[49] === "P" && board[58] === "P" && push("\u7ea2\u65b9\u4e94\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[51] === "P" && board[60] === "P" && push("\u7ea2\u65b9\u4e09\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[53] === "P" && board[62] === "P" && push("\u7ea2\u65b9\u4e00\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5175");
	board[27] === "p" && board[36] === "p" && push("\u9ed1\u65b9\uff11\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[29] === "p" && board[38] === "p" && push("\u9ed1\u65b9\uff13\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[31] === "p" && board[40] === "p" && push("\u9ed1\u65b9\uff15\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[33] === "p" && board[42] === "p" && push("\u9ed1\u65b9\uff17\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");
	board[35] === "p" && board[44] === "p" && push("\u9ed1\u65b9\uff19\u8def\u51fa\u73b0\u672a\u8fc7\u6cb3\u7684\u91cd\u53e0\u5352");

	total.R > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.R + "\u4e2a\u8f66\uff0c\u591a\u4e86" + (total.R - 2) + "\u4e2a");
	total.r > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.r + "\u4e2a\u8f66\uff0c\u591a\u4e86" + (total.r - 2) + "\u4e2a");
	total.N > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.N + "\u4e2a\u9a6c\uff0c\u591a\u4e86" + (total.N - 2) + "\u4e2a");
	total.n > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.n + "\u4e2a\u9a6c\uff0c\u591a\u4e86" + (total.n - 2) + "\u4e2a");
	total.B > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.B + "\u4e2a\u76f8\uff0c\u591a\u4e86" + (total.B - 2) + "\u4e2a");
	total.b > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.b + "\u4e2a\u8c61\uff0c\u591a\u4e86" + (total.b - 2) + "\u4e2a");
	total.A > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.A + "\u4e2a\u4ed5\uff0c\u591a\u4e86" + (total.A - 2) + "\u4e2a");
	total.a > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.a + "\u4e2a\u58eb\uff0c\u591a\u4e86" + (total.a - 2) + "\u4e2a");
	total.C > 2 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.C + "\u4e2a\u70ae\uff0c\u591a\u4e86" + (total.C - 2) + "\u4e2a");
	total.c > 2 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.c + "\u4e2a\u70ae\uff0c\u591a\u4e86" + (total.c - 2) + "\u4e2a");
	total.P > 5 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.P + "\u4e2a\u5175\uff0c\u591a\u4e86" + (total.P - 5) + "\u4e2a");
	total.p > 5 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.p + "\u4e2a\u5352\uff0c\u591a\u4e86" + (total.p - 5) + "\u4e2a");
	total.K > 1 && push("\u7ea2\u65b9\u51fa\u73b0\u4e86" + total.K + "\u4e2a\u5e05\uff0c\u591a\u4e86" + (total.K - 1) + "\u4e2a");
	total.k > 1 && push("\u9ed1\u65b9\u51fa\u73b0\u4e86" + total.k + "\u4e2a\u5c06\uff0c\u591a\u4e86" + (total.k - 1) + "\u4e2a");
	total.K < 1 && push("\u7ea2\u65b9\u5fc5\u987b\u6709\u4e00\u4e2a\u5e05");
	total.k < 1 && push("\u9ed1\u65b9\u5fc5\u987b\u6709\u4e00\u4e2a\u5c06");

	if (!Kk) {
		if (vschess.checkThreat(fen) && vschess.checkThreat(vschess.fenChangePlayer(fen))) {
			push("\u7ea2\u9ed1\u53cc\u65b9\u540c\u65f6\u88ab\u5c06\u519b");
		}
		else if (vschess.checkThreat(vschess.fenChangePlayer(fen))) {
			fen.split(" ")[1] === "b" ? push("\u8f6e\u5230\u9ed1\u65b9\u8d70\u68cb\uff0c\u4f46\u6b64\u65f6\u7ea2\u65b9\u6b63\u5728\u88ab\u5c06\u519b") : push("\u8f6e\u5230\u7ea2\u65b9\u8d70\u68cb\uff0c\u4f46\u6b64\u65f6\u9ed1\u65b9\u6b63\u5728\u88ab\u5c06\u519b");
		}
	}

	return errorList;
};

// 杀棋着法生成器
vschess.killMove = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var legalList = vschess.legalMoveList(fen);
	var result    = [];

	for (var i = 0; i < legalList.length; ++i) {
		var movedFen = vschess.fenMovePiece(fen, legalList[i]);

		if (vschess.checkThreat(movedFen) && vschess.legalList(movedFen).length === 0) {
			result.push(legalList[i]);
		}
	}

	return result;
};

// 是否有杀棋着法
vschess.hasKillMove = function(situation){
	if (typeof situation === "string") {
		var RegExp = vschess.RegExp();
		RegExp.FenShort.test(situation) && (situation = vschess.fenToSituation(situation));
	}

	var legalList = vschess.legalList(situation);

	for (var i = 0; i < legalList.length; ++i) {
		var movedSituation = situation.slice(0);
		movedSituation[legalList[i][1]] = movedSituation[legalList[i][0]];
		movedSituation[legalList[i][0]] = 1;
		movedSituation[0] = 3 - movedSituation[0];

		if (vschess.checkThreat(movedSituation) && !vschess.hasLegalMove(movedSituation)) {
			return true;
		}
	}

	return false;
};

// 叫杀检查器
vschess.checkKill = function(fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	return vschess.checkThreat(fen) ? false : vschess.hasKillMove(vschess.fenChangePlayer(fen));
};

// 计算长打着法
vschess.repeatLongThreatMove = function(moveList){
	if (moveList.length < 13) {
		return [];
	}

	var fenList = [moveList[0]];

	for (var i = 1; i < moveList.length; ++i) {
		fenList.push(vschess.fenMovePiece(fenList[i - 1], moveList[i]))
	}

	var threatFenList = {};

	for (var i = fenList.length - 2; i >= 0; i -= 2) {
		if (vschess.checkThreat(fenList[i])) {
			if (vschess.checkThreat(fenList[i + 1])) {
				break;
			}

			var shortFen = fenList[i].split(" ", 2).join(" ");
			shortFen in threatFenList ? ++threatFenList[shortFen] : (threatFenList[shortFen] = 1);
		}
		else {
			break;
		}
	}

	if (fenList.length - i < 14) {
		return [];
	}

	var lastFen		= fenList[fenList.length - 1];
	var legalList	= vschess.legalMoveList(lastFen);
	var banMoveList	= [];
	var canMoveList	= [];

	for (var i = 0; i < legalList.length; ++i) {
		var move     = legalList[i];
		var movedFen = vschess.fenMovePiece(lastFen, move).split(" ", 2).join(" ");
		threatFenList[movedFen] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
	}

	return banMoveList;
};

// 计算一将一杀着法
vschess.repeatLongKillMove = function(moveList){
	if (moveList.length < 13 || vschess.repeatLongThreatMove(moveList)) {
		return [];
	}

	var fenList = [moveList[0]];

	for (var i = 1; i < moveList.length; ++i) {
		fenList.push(vschess.fenMovePiece(fenList[i - 1], moveList[i]))
	}

	var killFenList = {};

	for (var i = fenList.length - 2; i >= 0; i -= 2) {
		if (vschess.checkThreat(fenList[i])) {
			var shortFen = fenList[i].split(" ", 2).join(" ");
			shortFen in killFenList ? ++killFenList[shortFen] : (killFenList[shortFen] = 1);
		}
		else if (vschess.checkKill(fenList[i])) {
			"kill" in killFenList ? ++killFenList["kill"] : (killFenList["kill"] = 1);
		}
		else {
			break;
		}
	}

	var lastFen		= fenList[fenList.length - 1];
	var legalList	= vschess.legalMoveList(lastFen);
	var banMoveList	= [];
	var canMoveList	= [];

	if (fenList.length - i < 14) {
		return [];
	}

	for (var i = 0; i < legalList.length; ++i) {
		var move     = legalList[i];
		var movedFen = vschess.fenMovePiece(lastFen, move).split(" ", 2).join(" ");

		if (vschess.checkKill(movedFen)) {
			killFenList["kill"] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
		}
		else {
			killFenList[movedFen] >= 3 ? banMoveList.push(move) : canMoveList.push(move);
		}
	}

	return canMoveList.length ? banMoveList : [];
};

// 创建象棋组件，兼容两种创建模式：实例模式和方法模式
vschess.load = function(selector, options){
	// 实例模式下，每次运行时都只会为指定选择器中第一个未创建棋盘的 DOM 元素创建棋盘，若该选择器下有多个 DOM 元素，则需要多次运行
	// 实例模式使用举例：var chess = new vschess.load(".vschess");，返回一个棋盘对象
	if (this instanceof vschess.load) {
		var _this = this;
		this.options = $.extend(true, {}, vschess.defaultOptions, options);
		this._ = { nodeLength: 0 };
		vschess.init(this.options);
		this.originalDOM = $(selector).not(".vschess-loaded, .vschess-original-dom").first();
		this.DOM = this.originalDOM.clone();
		this.originalDOM.after(this.DOM).addClass("vschess-original-dom");
		this.createLoading(selector);

		var waitCSS = setInterval(function(){
			if (vschess.globalLoaded && vschess.layoutLoaded[_this.options.layout] && vschess.styleLoaded[_this.options.style]) {
				clearInterval(waitCSS);
				_this.createBoard();
				_this.initData();
				typeof _this["callback_loadFinish"] === "function" && _this["callback_loadFinish"]();
			}
		}, vschess.threadTimeout);

		return this;
	}

	// 方法模式下，只需运行一次，便可为该选择器下所有元素创建棋盘
	// 方法模式使用举例：var chess = vschess.load(".vschess");，返回一个包含所有棋盘对象的数组
	// 该数组可以直接调用属于每个棋盘的方法，程序将自动为所有棋盘应用此方法
	// 例如：chess.setBoardByStep(3);，将所有棋盘设置为第四个局面（越界自动修正），返回包含所有棋盘的数组，即数组本身
	// 再如：chess.isR(5);，检查所有棋盘的 index 为 5 的棋子是否为红方棋子，返回 [true, false, ......]，返回的数组长度即为棋盘数量
	else {
		var chessList = [];

		$(selector).not(".vschess-loaded, .vschess-original-dom").each(function(){
			chessList.push(new vschess.load(this, options));
		});

		$.each(vschess.load.prototype, function(name){
			chessList[name] = function(){
				var result = [];

				for (var i = 0; i < this.length; ++i) {
					result.push(vschess.load.prototype[name].apply(this[i], arguments));
				}

				name === "toString" && (result = result.toString());
				return result;
			};
		});

		return chessList;
	}
};

// 创建棋盘界面
vschess.load.prototype.createBoard = function(){
	var _this = this;
	this.DOM.children(".vschess-loading").remove();
	this.bindDrag();

	// 标题
	this.title = $('<div class="vschess-title"></div>');
	this.DOM.append(this.title);

	// 棋盘
	this.board = $('<div class="vschess-board"></div>');
	this.DOM.append(this.board);
	this.board.append(new Array(91).join('<div class="vschess-piece"><span></span></div>'));
	this.piece = this.board.children(".vschess-piece");
	this.board.append('<div class="vschess-piece-animate"><span></span></div>');
	this.animatePiece = this.board.children(".vschess-piece-animate");
	this.pieceClick();
	this.initPieceRotateDeg();

	// 其他组件
    this.createLocalDownloadLink();
    this.createChangeSelectList();
    this.createMoveSelectList();
    this.createCopyTextarea();
    this.createColumnIndex();
    this.createControlBar();
    this.createMessageBox();
    this.createGuessArrow();
    this.createFormatBar();
    this.createMobileTag();
    this.createTab();
    this.interval = { time: 0, tag: 0, run: setInterval(function(){ _this.intervalCallback(); }, 100) };
    this.chessId  = vschess.chessList.length;

	window.addEventListener("resize", function(){ _this.resetDPR(); }, false);
	vschess.chessList.push(this);
	return this;
};

// 填充初始数据
vschess.load.prototype.initData = function(){
	this.refreshColumnIndex();
	this.setSaved(true);
    this.showTab(this.options.defaultTab);
	this.initCallback();
	this.initArguments();
	this.initStart();
	return this;
};

// 初始化参数
vschess.load.prototype.initArguments = function(){
	this.setBanRepeatLongThreat	(this.options.banRepeatLongThreat	);
	this.setBanRepeatLongKill	(this.options.banRepeatLongKill		);
	this.setQuickStepOffset		(this.options.quickStepOffset		);
	this.setClickResponse		(this.options.clickResponse			);
	this.setAnimationTime		(this.options.animationTime			);
	this.setPieceRotate			(this.options.pieceRotate			);
	this.setIllegalTips			(this.options.illegalTips			);
	this.setMoveFormat			(this.options.moveFormat			);
	this.setSpeakMove			(this.options.speakMove				);
	this.setMoveTips			(this.options.moveTips				);
	this.setSaveTips			(this.options.saveTips				);
	this.setPlayGap				(this.options.playGap				);
	this.setVolume				(this.options.volume				);
	this.setSound				(this.options.sound					);
	return this;
};

// 创建加载界面
vschess.load.prototype.createLoading = function(selector){
	this.chessData = this.options.chessData === false ? this.DOM.html() : this.options.chessData;
	this.DOM.html('<div class="vschess-loading">\u68cb\u76d8\u52a0\u8f7d\u4e2d\uff0c\u8bf7\u7a0d\u5019\u3002</div>');
	this.DOM.addClass("vschess-loaded vschess-style-" + this.options.style + " vschess-layout-" + this.options.layout);
	this.DOM.attr("data-vschess-dpr", vschess.dpr);
	return this;
};

// 初始化起始局面
vschess.load.prototype.initStart = function(){
	this.setNode(vschess.dataToNode(this.chessData, this.options.parseType));
	this.rebuildSituation();
	this.setTurn		 (this.options.turn);
	this.setBoardByStep	 (this.options.currentStep);
	this.setExportFormat ("PGN_Chinese");
	return this;
};

// 初始化回调列表
vschess.load.prototype.initCallback = function(){
	for (var i = 0; i < vschess.callbackList.length; ++i) {
		this["callback_" + vschess.callbackList[i]] = this.options[vschess.callbackList[i]] || function(){};
	}

	return this;
};

// 自动播放组件
vschess.load.prototype.intervalCallback = function(){
	if (!this.interval.time || ++this.interval.tag % this.interval.time) {
		return false;
	}

	var _this = this;
	this.animateToNext(this.getAnimationTime(), function(){ _this.getCurrentStep() >= _this.lastSituationIndex() && _this.pause(); });
	this.interval.tag = 0;
	return this;
};

// 卸载棋盘，即将对应的 DOM 恢复原状
vschess.load.prototype.unload = function(){
	this.DOM.remove();
	this.originalDOM.removeClass("vschess-original-dom");
	window.removeEventListener("resize", this.resetDPR, false);
	return this;
};

// 创建列号
vschess.load.prototype.createColumnIndex = function(){
	var columnText = this.options.ChineseChar.Number.split("");
	this.columnIndexR = $('<div class="vschess-column-index"></div>');
	this.columnIndexB = $('<div class="vschess-column-index"></div>');
	this.DOM.append(this.columnIndexR);
	this.DOM.append(this.columnIndexB);

	for (var i = 0; i < 9; ++i) {
		this.columnIndexR.append('<div class="vschess-column-index-item">' + columnText[i    ] + '</div>');
		this.columnIndexB.append('<div class="vschess-column-index-item">' + columnText[i + 9] + '</div>');
	}

	return this;
};

// 重置 DPR
vschess.load.prototype.resetDPR = function(){
	vschess.dpr = window.devicePixelRatio || 1;
	$(this.DOM).attr("data-vschess-dpr", vschess.dpr);
	return this;
};

// 中文着法转换为节点 ICCS
vschess.Chinese2Node = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);

	if (!RegExp.Chinese.test(move)) {
		return { move: "none", movedFen: vschess.defaultFen };
	}

	var cStr = "\u8f66\u8eca\u4fe5\u9a6c\u99ac\u508c\u76f8\u8c61\u4ed5\u58eb\u5e05\u5e25\u5c06\u5c07\u70ae\u5305\u7832\u5175\u5352\u524d\u8fdb\u9032\u540e\u5f8c\u9000\u5e73\u4e2d\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u58f9\u8d30\u53c1\u8086\u4f0d\u9646\u67d2\u634c\u7396\uff11\uff12\uff13\uff14\uff15\uff16\uff17\uff18\uff19123456789";
	var eStr = "RRRNNNBBAAKKKKCCCPP+++---..123456789123456789123456789123456789";
	var moveSplit = move.split("");

	for (var i = 0; i < 4; ++i) {
		moveSplit[i] = eStr.charAt(cStr.indexOf(moveSplit[i]));
	}

	return vschess.WXF2Node(moveSplit.join(""), fen);
};

// WXF 着法转换为节点 ICCS
vschess.WXF2Node = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);

	if (!RegExp.WXF.test(move)) {
		return { move: "none", movedFen: vschess.defaultFen };
	}

	move = move
		.replace(/^([RNHBEAKCPrnhbeakcp])([\+\-\.])/g, "$2$1")
		.replace(/^([Pp])[Aa]/g, "1$1").replace(/^([Pp])[Bb]/g, "2$1").replace(/^([Pp])[Cc]/g, "3$1")
		.replace(/^([Pp])[Dd]/g, "4$1").replace(/^([Pp])[Ee]/g, "5$1").replace(/^([Pp])[\.]/g, ".$1");

	var from = 0, to = 0;

	// 黑方旋转处理
	if (fen.split(" ")[1] === "b") {
		var situation = vschess.fenToSituation(vschess.roundFen(fen));
		var moveSplit = move.toLowerCase().split("");
		var player    = 2, N = 34, B = 35, A = 36, P = 39;
	}
	// 红方直接处理
	else {
		var situation = vschess.fenToSituation(fen);
		var moveSplit = move.toUpperCase().split("");
		var player    = 1, N = 18, B = 19, A = 20, P = 23;
	}

	// 前
	if (moveSplit[0] === "+") {
		// 特殊兵卒东萍表示法
		if (vschess.isNumber(moveSplit[1])) {
			for (var i = 60 - moveSplit[1]; i < 204 && !from; i += 16) {
				situation[i] === P && (from = i);
			}
		}
		// 兵卒
		else if (moveSplit[1].toUpperCase() === "P") {
			for (i = 51; i < 60 && !from; ++i) {
				for (var j = i, pList = []; j < 204; j += 16) {
					situation[j] === P && pList.push(j);
				}

				pList.length > 1 && (from = pList[0]);
			}
		}
		// 车马相象仕士帅将炮
		else {
			for (var i = 51; i < 204 && !from; ++i) {
				situation[i] === vschess.f2n[moveSplit[1]] && (from = i);
			}
		}
	}
	// 后
	else if (moveSplit[0] === "-") {
		// 特殊兵卒东萍表示法
		if (vschess.isNumber(moveSplit[1])) {
			for (var i = 204 - moveSplit[1]; i > 50 && !from; i -= 16) {
				situation[i] === P && (from = i);
			}
		}
		// 兵卒
		else if (moveSplit[1].toUpperCase() === "P") {
			for (i = 51; i < 60 && !from; ++i) {
				for (var j = i, pList = []; j < 204; j += 16) {
					situation[j] === P && pList.push(j);
				}

				pList.length > 1 && (from = pList.pop());
			}
		}
		// 车马相象仕士帅将炮
		else {
			for (var i = 203; i > 50 && !from; --i) {
				situation[i] === vschess.f2n[moveSplit[1]] && (from = i);
			}
		}
	}
	// 中
	else if (moveSplit[0] === ".") {
		for (i = 51; i < 60 && !from; ++i) {
			for (var j = i, pList = []; j < 204; j += 16) {
				situation[j] === P && pList.push(j);
			}

			pList.length > 2 && (from = pList[1]);
		}
	}
	// 车马相象仕士帅将炮兵卒
	else if (isNaN(moveSplit[0])) {
		for (var i = 60 - moveSplit[1]; i < 204 && !from; i += 16) {
			situation[i] === vschess.f2n[moveSplit[0]] && (from = i);
		}
	}
	// 特殊兵卒象棋巫师表示法
	else {
		for (var i = 59, pList = []; i > 50; --i) {
			for (var j = i, pColList = []; j < 204; j += 16) {
				situation[j] === P && pColList.push(j);
			}

			pColList.length > 1 && (pList = pList.concat(pColList));
		}

		from = pList[moveSplit[0] - 1];
	}

	// 马
	if (situation[from] === N) {
		if (moveSplit[2] === "+") {
			switch (moveSplit[3] - 12 + from % 16) {
				case -1: to = from - 31; break;
				case -2: to = from - 14; break;
				case  1: to = from - 33; break;
				case  2: to = from - 18; break;
			}
		}
		else {
			switch (moveSplit[3] - 12 + from % 16) {
				case -1: to = from + 33; break;
				case -2: to = from + 18; break;
				case  1: to = from + 31; break;
				case  2: to = from + 14; break;
			}
		}
	}
	// 相象
	else if (situation[from] === B) {
		switch (moveSplit[2] + moveSplit[3]) {
			case "+1": to = 171; from && (from = 201); break;
			case "-1": to = 171; from && (from = 137); break;
			case "+9": to = 163; from && (from = 197); break;
			case "-9": to = 163; from && (from = 133); break;
			case "+3": to = 137; from && (from = from === 167 ? 167 : 171); break;
			case "-3": to = 201; from && (from = from === 167 ? 167 : 171); break;
			case "+7": to = 133; from && (from = from === 167 ? 167 : 163); break;
			case "-7": to = 197; from && (from = from === 167 ? 167 : 163); break;
			case "+5": to = 167; from &&  from < 195 && (from += 64); break;
			case "-5": to = 167; from &&  from > 139 && (from -= 64); break;
		}
	}
	// 仕士
	else if (situation[from] === A) {
		switch (moveSplit[2] + moveSplit[3]) {
			case "+4": to = 168; from && (from = 183); break;
			case "-4": to = 200; from && (from = 183); break;
			case "+6": to = 166; from && (from = 183); break;
			case "-6": to = 198; from && (from = 183); break;
			case "+5": to = 183; from &&  from < 195 && (from += 32); break;
			case "-5": to = 183; from &&  from > 171 && (from -= 32); break;
		}
	}
	// 车帅将炮兵卒
	else {
		if (moveSplit[2] === "+") {
			to = from - moveSplit[3] * 16;
		}
		else if (moveSplit[2] === "-") {
			to = from + moveSplit[3] * 16;
		}
		else {
			to = from + 12 - from % 16 - moveSplit[3];
		}
	}

	if (from && to) {
		situation[to  ]   = situation[from];
		situation[from]   = 1;
		situation[0   ]   = 3    - situation[0];
		situation[0   ] === 1 && ++situation[1];

		if (player === 1) {
			return { move: vschess.s2i[from] + vschess.s2i[to], movedFen: vschess.situationToFen(situation) };
		}
		else {
			return { move: vschess.roundMove(vschess.s2i[from] + vschess.s2i[to]), movedFen: vschess.roundFen(vschess.situationToFen(situation)) };
		}
	}
	else {
		return { move: "none", movedFen: vschess.defaultFen };
	}
};

// ICCS 着法转换为节点 ICCS
vschess.ICCS2Node = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);

	if (!RegExp.ICCS.test(move)) {
		return { move: "none", movedFen: vschess.defaultFen };
	}

	var situation = vschess.fenToSituation(fen);
	var step = move.toLowerCase().split("-");
	situation[vschess.i2s[step[1]]] = situation[vschess.i2s[step[0]]];
	situation[vschess.i2s[step[0]]] = 1;
	situation[0]   = 3    - situation[0];
	situation[0] === 1 && ++situation[1];
	return { move: step[0] + step[1], movedFen: vschess.situationToFen(situation) };
};

// ICCS 着法转换为节点 ICCS（无 Fen 串）
vschess.ICCS2Node_NoFen = function(move){
	return RegExp.ICCS.test(move) ? move.replace("-", "").toLowerCase() : "none";
};

// 着法列表转换为节点 ICCS 列表，列表第一个元素为起始局面 Fen 串
vschess.stepList2nodeList = function(moveList, fen){
	var RegExp = vschess.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		fen      = moveList.shift( );
	}
	else {
		RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	}

	var result = [fen], converter, currentFen = fen, stepData;

	if (moveList.length) {
		if (RegExp.ICCS.test(moveList[0])) {
			converter = vschess.ICCS2Node;
		}
		else if (RegExp.WXF.test(moveList[0])) {
			converter = vschess.WXF2Node;
		}
		else {
			converter = vschess.Chinese2Node;
		}

		for (var i = 0; i < moveList.length; ++i) {
			var legalList = vschess.legalMoveList(currentFen);
			stepData = converter(moveList[i], currentFen);

			if (~legalList.indexOf(stepData.move)) {
				currentFen = stepData.movedFen;
				result.push(stepData.move);
			}
			else {
				var exchangeMove = moveList[i].substring(3, 5) + "-" + moveList[i].substring(0, 2);
				stepData = converter(exchangeMove, currentFen);

				if (~legalList.indexOf(stepData.move)) {
					currentFen = stepData.movedFen;
					result.push(stepData.move);
				}
				else {
					break;
				}
			}
		}
	}

	return result;
};

// 将着法列表转换为标准象棋 PGN 格式
vschess.moveListToData_PGN = function(moveList, startFen, commentList, infoList, result){
	var RegExp = vschess.RegExp();

	if (moveList[0] && moveList[0].length > 4 && RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		startFen = moveList.shift( );
	}
	else {
		RegExp.FenShort.test(startFen) || (startFen = vschess.defaultFen);
	}

	var isWXF  = RegExp.WXF .test(moveList[0]);
	var isICCS = RegExp.ICCS.test(moveList[0]);
	var startFenSplit =  startFen.split(" ");
	var startRound    = +startFenSplit[5] || 1;
	var pgnText = ['[Game "Chinese Chess"]\n'];

	for (var i in infoList) {
		pgnText.push("[", vschess.info.pgn[i] || vschess.fieldNameToCamel(i), ' "', infoList[i], '"]\n');
	}

	startFen === vschess.defaultFen || pgnText.push('[FEN "', startFen, '"]\n');
	!isICCS ? !isWXF ? null : pgnText.push('[Format "WXF"]\n') : pgnText.push('[Format "ICCS"]\n');
	pgnText.push(commentList[0] ? "{" + commentList[0] + "}\n" : "");

	if (startFenSplit[1] === "b") {
		for (var i = 0; i < moveList.length; ++i) {
			if (i === 0) {
				var round = startRound;
				round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
				pgnText.push(round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026 " : ". .... " : ". ..... ", moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "", "\n");
			}
			else {
				var round = (i + 1) / 2 + startRound;
				round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
				i % 2 && pgnText.push(round, ". ");
				pgnText.push(moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "");
				commentList[i + 1] && i % 2 && i !== moveList.length - 1 && pgnText.push("\n", round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026" : ". ...." : ". .....");
				pgnText.push(i % 2 ? " " : "\n");
			}
		}
	}
	else {
		for (var i = 0; i < moveList.length; ++i) {
			var round = i / 2 + startRound;
			round = round < 100 ? round < 10 ? "  " + round : " " + round : round;
			i % 2 || pgnText.push(round, ". ");
			pgnText.push(moveList[i], commentList[i + 1] ? "\n{" + commentList[i + 1] + "}" : "");
			commentList[i + 1] && !(i % 2) && i !== moveList.length - 1 && pgnText.push("\n", round, !isICCS ? !isWXF ? ". \u2026\u2026\u2026\u2026" : ". ...." : ". .....");
			pgnText.push(i % 2 ? "\n" : " ");
		}
	}

	pgnText = $.trim(pgnText.join(""));

	if (pgnText.split("").pop() === "}") {
		pgnText += "\n " + result;
	}
	else {
		(startFenSplit[1] === "b") === !!(moveList.length % 2) && (pgnText += "\n");
		pgnText += " " + result;
	}

	return pgnText;
};

// 将着法列表转换为文本 TXT 格式
vschess.moveListToText = function(moveList, startFen, commentList, infoList, result){
	var RegExp = vschess.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		startFen = moveList.shift();
	}
	else {
		RegExp.FenShort.test(startFen) || (startFen = vschess.defaultFen);
	}

	var startFenSplit =  startFen.split(" ");
	var startRound    = +startFenSplit[5] || 1;
	var text = ["\u4e2d\u56fd\u8c61\u68cb\u5bf9\u5c40\u8bb0\u5f55\n"];

	for (var i in infoList) {
		text.push(vschess.info.name[i], "\uff1a", vschess.showText(infoList[i], i), "\n");
	}

	startFen === vschess.defaultFen || text.push("\u5f00\u5c40 Fen \u4e32\uff1a", startFen, "\n");
	text.push(commentList[0] ? "\uff08" + commentList[0] + "\uff09\n" : "");

	if (startFenSplit[1] === "b") {
		for (var i = 0; i < moveList.length; ++i) {
			if (i === 0) {
				var round = startRound;
				round = vschess.strpad(round, Math.ceil((moveList.length + 1) / 2).toString().length, " ", "left");
				text.push(round, ". \u2026\u2026\u2026\u2026 ", moveList[i], commentList[i + 1] ? "\n\uff08" + commentList[i + 1] + "\uff09" : "", "\n");
			}
			else {
				var round = (i + 1) / 2 + startRound;
				round = vschess.strpad(round, Math.ceil((moveList.length + 1) / 2).toString().length, " ", "left");
				i % 2 && text.push(round, ". ");
				text.push(moveList[i], commentList[i + 1] ? "\n\uff08" + commentList[i + 1] + "\uff09" : "");
				commentList[i + 1] && i % 2 && i != moveList.length - 1 && text.push("\n", round, ". \u2026\u2026\u2026\u2026");
				text.push(i % 2 ? " " : "\n");
			}
		}
	}
	else {
		for (var i = 0; i < moveList.length; ++i) {
			var round = i / 2 + startRound;
			round = vschess.strpad(round, Math.ceil(moveList.length / 2).toString().length, " ", "left");
			i % 2 || text.push(round, ". ");
			text.push(moveList[i], commentList[i + 1] ? "\n\uff08" + commentList[i + 1] + "\uff09" : "");
			commentList[i + 1] && !(i % 2) && i != moveList.length - 1 && text.push("\n", round, ". \u2026\u2026\u2026\u2026");
			text.push(i % 2 ? "\n" : " ");
		}
	}

	text = $.trim(text.join(""));
	var resultStr = vschess.showText(result, "result");

	if (resultStr) {
		if (text.split("").pop() === "\uff09") {
			text += "\n" + resultStr;
		}
		else {
			(startFenSplit[1] === "b") === !!(moveList.length % 2) && (text += "\n");
			text += resultStr;
		}
	}

	return text;
};

// 将棋谱节点树转换为东萍象棋 DhtmlXQ 格式
vschess.nodeToData_DhtmlXQ = function(nodeData, infoList, isMirror){
	var DhtmlXQ_binit = [99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];
	var DhtmlXQ   = ["[DhtmlXQ]"];
	var fenSplit  = nodeData.fen.split(" ");
	var pieceEach = fenSplit[0]
		.replace(/1/g,"*")
		.replace(/2/g,"**")
		.replace(/3/g,"***")
		.replace(/4/g,"****")
		.replace(/5/g,"*****")
		.replace(/6/g,"******")
		.replace(/7/g,"*******")
		.replace(/8/g,"********")
		.replace(/9/g,"*********")
		.replace(/\//g,"").split("");

	for (var i in infoList) {
		DhtmlXQ.push('[DhtmlXQ_' + (vschess.info.DhtmlXQ[i] || i) + ']' + vschess.showText(infoList[i], i) + '[/DhtmlXQ_' + (vschess.info.DhtmlXQ[i] || i) + ']');
	}

	for (var i = 0; i < 90; ++i) {
		var position = i % 9 * 10 + Math.floor(i / 9);
		position < 10 && (position = "0" + position);

		switch (pieceEach[i]) {
			case "K": DhtmlXQ_binit[ 4] = position; break;
			case "k": DhtmlXQ_binit[20] = position; break;
			case "R": DhtmlXQ_binit[ 0] === 99 ? DhtmlXQ_binit[ 0] = position : DhtmlXQ_binit[ 8] = position; break;
			case "N": DhtmlXQ_binit[ 1] === 99 ? DhtmlXQ_binit[ 1] = position : DhtmlXQ_binit[ 7] = position; break;
			case "B": DhtmlXQ_binit[ 2] === 99 ? DhtmlXQ_binit[ 2] = position : DhtmlXQ_binit[ 6] = position; break;
			case "A": DhtmlXQ_binit[ 3] === 99 ? DhtmlXQ_binit[ 3] = position : DhtmlXQ_binit[ 5] = position; break;
			case "C": DhtmlXQ_binit[ 9] === 99 ? DhtmlXQ_binit[ 9] = position : DhtmlXQ_binit[10] = position; break;
			case "r": DhtmlXQ_binit[16] === 99 ? DhtmlXQ_binit[16] = position : DhtmlXQ_binit[24] = position; break;
			case "n": DhtmlXQ_binit[17] === 99 ? DhtmlXQ_binit[17] = position : DhtmlXQ_binit[23] = position; break;
			case "b": DhtmlXQ_binit[18] === 99 ? DhtmlXQ_binit[18] = position : DhtmlXQ_binit[22] = position; break;
			case "a": DhtmlXQ_binit[19] === 99 ? DhtmlXQ_binit[19] = position : DhtmlXQ_binit[21] = position; break;
			case "c": DhtmlXQ_binit[25] === 99 ? DhtmlXQ_binit[25] = position : DhtmlXQ_binit[26] = position; break;
			case "P": {
				for (var j = 11; j < 16; ++j) {
					if (DhtmlXQ_binit[j] === 99) {
						DhtmlXQ_binit[j] = position;
						break;
					}
				}

				break;
			}
			case "p": {
				for (var j = 27; j < 32; ++j) {
					if (DhtmlXQ_binit[j] === 99) {
						DhtmlXQ_binit[j] = position;
						break;
					}
				}

				break;
			}
		}
	}

	DhtmlXQ.push("[DhtmlXQ_fen]"   + nodeData.fen           + "[/DhtmlXQ_fen]"  );
	DhtmlXQ.push("[DhtmlXQ_binit]" + DhtmlXQ_binit.join("") + "[/DhtmlXQ_binit]");
	var branchList = [], parentIndexList = [], parentStepsList = [], resultList = [], commentResult = [], branchIndex = 0;

	function makeBranch(){
		var step = 1;
		var node = branchList.pop();
		var parentIndex  = parentIndexList.pop();
		var parentSteps  = parentStepsList.pop();
		var branchResult = ["[DhtmlXQ_move_", parentIndex, "_", parentSteps, "_", branchIndex, "]"];
		var moveSplit    = node.move.split("");
		moveSplit[0] 	 = vschess.cca(moveSplit[0]) - 97;
		moveSplit[2] 	 = vschess.cca(moveSplit[2]) - 97;
		moveSplit[1] 	 = 9 - moveSplit[1];
		moveSplit[3] 	 = 9 - moveSplit[3];
		branchResult.push(moveSplit.join(""));
		node.comment && commentResult.push(["[DhtmlXQ_comment", branchIndex, "_", parentSteps, "]", node.comment.replace(/\n/g, "||"), "[/DhtmlXQ_comment", branchIndex, "_", parentSteps, "]"].join(""));

		while (node.next.length) {
			for (var i = node.next.length - 1; i >= 0; --i) {
				if (i !== node.defaultIndex) {
					branchList.push(node.next[i]);
					parentIndexList.push(branchIndex);
					parentStepsList.push(parentSteps + step);
				}
			}

			node = node.next[node.defaultIndex];
			moveSplit = node.move.split("");
			moveSplit[0] = moveSplit[0].charCodeAt(0) - 97;
			moveSplit[2] = moveSplit[2].charCodeAt(0) - 97;
			moveSplit[1] = 9 - moveSplit[1];
			moveSplit[3] = 9 - moveSplit[3];
			branchResult.push(moveSplit.join(""));
			node.comment && commentResult.push(["[DhtmlXQ_comment", branchIndex, "_", parentSteps + step, "]", node.comment.replace(/\n/g, "||"), "[/DhtmlXQ_comment", branchIndex, "_", parentSteps + step, "]"].join(""));
			++step;
		}

		branchResult.push("[/DhtmlXQ_move_", parentIndex, "_", parentSteps, "_", branchIndex, "]");
		resultList.push(branchResult.join(""));
		++branchIndex;
		branchList.length && makeBranch();
	}

	for (var i = nodeData.next.length - 1; i >= 0; --i) {
		if (i !== nodeData.defaultIndex) {
			branchList.push(nodeData.next[i]);
			parentIndexList.push(0);
			parentStepsList.push(1);
		}
	}

	nodeData.next.length && branchList.push(nodeData.next[nodeData.defaultIndex]);
	parentIndexList.push(0);
	parentStepsList.push(1);
	nodeData.comment && commentResult.push(["[DhtmlXQ_comment0]", nodeData.comment.replace(/\n/g, "||"), "[/DhtmlXQ_comment0]"].join(""));
	branchList.length && makeBranch();
	resultList.length && DhtmlXQ.push(resultList.join("\n").replace("[DhtmlXQ_move_0_1_0]", "[DhtmlXQ_movelist]").replace("[/DhtmlXQ_move_0_1_0]", "[/DhtmlXQ_movelist]"));
	commentResult.length && DhtmlXQ.push(commentResult.join("\n").replace(/DhtmlXQ_comment0_/g, "DhtmlXQ_comment"));
	DhtmlXQ.push("[/DhtmlXQ]");
	return isMirror ? vschess.turn_DhtmlXQ(DhtmlXQ.join("\n")) : DhtmlXQ.join("\n");
};

// 翻转东萍象棋 DhtmlXQ 格式
vschess.turn_DhtmlXQ = function(chessData){
	var DhtmlXQ_EachLine = chessData.split("\n");

	for (var i = 0; i < DhtmlXQ_EachLine.length; ++i) {
		var l = DhtmlXQ_EachLine[i];

		if (~l.indexOf("[DhtmlXQ_binit")) {
			var startSplit = l.substring(l.indexOf("[DhtmlXQ_binit") + 15, l.indexOf("[/DhtmlXQ_")).split("");

			for (var j = 0; j < startSplit.length; j += 2) {
				startSplit[j] < 9 && (startSplit[j] = 8 - startSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_binit]" + startSplit.join("") + "[/DhtmlXQ_binit]";
		}
		else if (~l.indexOf("[DhtmlXQ_movelist")) {
			var moveSplit = l.substring(l.indexOf("[DhtmlXQ_movelist") + 18, l.indexOf("[/DhtmlXQ_")).split("");

			for (var j = 0; j < moveSplit.length; j += 2) {
				moveSplit[j] < 9 && (moveSplit[j] = 8 - moveSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_movelist]" + moveSplit.join("") + "[/DhtmlXQ_movelist]";
		}
		else if (~l.indexOf("[DhtmlXQ_move_")) {
			var start		= l.indexOf("]");
			var changeId	= l.substring(14, start);
			var changeSplit = l.substring(start + 1, l.indexOf("[/DhtmlXQ_")).split("");

			for (var j = 0; j < changeSplit.length; j += 2) {
				changeSplit[j] < 9 && (changeSplit[j] = 8 - changeSplit[j]);
			}

			DhtmlXQ_EachLine[i] = "[DhtmlXQ_move_" + changeId + "]" + changeSplit.join("") + "[/DhtmlXQ_move_" + changeId + "]";
		}
	}

	return DhtmlXQ_EachLine.join("\n");
};

// 将棋谱节点树转换为广东象棋网打虎将 DHJHtmlXQ 格式
vschess.nodeToData_DHJHtmlXQ = function(nodeData, infoList, isMirror){
	var DHJHtmlXQ = [];
	var isB   =  nodeData.fen.split(" ")[1] === "b";
	var round = +nodeData.fen.split(" ")[5];
	DHJHtmlXQ[31] = vschess.fenToArray(nodeData.fen).join("");
	DHJHtmlXQ[32] = isB ? 1 : 0;
	DHJHtmlXQ[33] = round * 2 - isB ? 1 : 2;

	var nextList = nodeData.next, moveList = [], commentList = [nodeData.comment], step = 0;

	while (nextList.length) {
		var moveSplit = nextList[0].move.split("");
		moveList   .push(vschess.cca(moveSplit[0]) - 97, moveSplit[1], vschess.cca(moveSplit[2]) - 97, moveSplit[3]);
		commentList.push(nextList[0].comment);
		nextList = nextList[0].next;
	}

	DHJHtmlXQ[34] = moveList.join("");

	for (var i in vschess.info.DHJHtmlXQ) {
		if (infoList[i]) {
			DHJHtmlXQ[vschess.info.DHJHtmlXQ[i]] = infoList[i];
		}
	}

	var result = ["[DHJHtmlXQ]"];

	for (var i = 0; i < DHJHtmlXQ.length; ++i) {
		if (typeof DHJHtmlXQ[i] !== "undefined") {
			result.push("[DHJHtmlXQ_" + i + "]" + DHJHtmlXQ[i] + "[/DHJHtmlXQ_" + i + "]");
		}
	}

	for (var i = 0; i < commentList.length; ++i) {
		if (commentList[i].length) {
			result.push("[game_comment_0_" + i + "]" + commentList[i] + "[/comment_0_" + i + "]");
		}
	}

	result.push("[/DHJHtmlXQ]");
	return isMirror ? vschess.turn_DHJHtmlXQ(result.join("\n")) : result.join("\n");
};

// 翻转广东象棋网打虎将 DHJHtmlXQ 格式
vschess.turn_DHJHtmlXQ = function(chessData){
	var DHJHtmlXQ_EachLine = chessData.split("\n");

	for (var i = 0; i < DHJHtmlXQ_EachLine.length; ++i) {
		var l = DHJHtmlXQ_EachLine[i];

		if (~l.indexOf("[DHJHtmlXQ_31")) {
			var startSplit = l.substring(l.indexOf("[DHJHtmlXQ_31") + 14, l.indexOf("[/DHJHtmlXQ_")).split("");
			startSplit = vschess.fenToArray(vschess.turnFen(vschess.arrayToFen(startSplit)));
			DHJHtmlXQ_EachLine[i] = "[DHJHtmlXQ_31]" + startSplit.join("") + "[/DHJHtmlXQ_31]";
		}
		else if (~l.indexOf("[DHJHtmlXQ_34")) {
			var moveSplit = l.substring(l.indexOf("[DHJHtmlXQ_34") + 14, l.indexOf("[/DHJHtmlXQ_")).split("");

			for (var j = 0; j < moveSplit.length; j += 2) {
				moveSplit[j] < 9 && (moveSplit[j] = 8 - moveSplit[j]);
			}

			DHJHtmlXQ_EachLine[i] = "[DHJHtmlXQ_34]" + moveSplit.join("") + "[/DHJHtmlXQ_34]";
		}
	}

	return DHJHtmlXQ_EachLine.join("\n");
};

// 将棋谱节点树转换为鹏飞象棋 PFC 格式
vschess.nodeToData_PengFei = function(nodeData, infoList, result, isMirror){
	function getXmlByNode(nodeData, isDefault){
		var xmlData = ['<n m="', isMirror ? vschess.turnMove(nodeData.move) : nodeData.move, '" c="', nodeData.comment.replace(/\"/g, "&quot;"), '"'];
		isDefault && xmlData.push(' default="true"');
		xmlData.push(">");

		for (var i = 0; i < nodeData.next.length; ++i) {
			xmlData.push(getXmlByNode(nodeData.next[i], nodeData.defaultIndex === i));
		}

		xmlData.push('</n>');
		return xmlData.join("");
	}

	var xmlData = ['<?xml version="1.0" encoding="utf-8"?><n version="2" win="' + result + '" m="', isMirror ? vschess.turnFen(nodeData.fen) : nodeData.fen, '" c="', nodeData.comment.replace(/\"/g, "&quot;"), '"'];

	for (var i in infoList) {
		xmlData.push(" ", vschess.info.pfc[i] || i, '="', infoList[i].replace(/\"/g, "&quot;"), '"');
	}

	xmlData.push(">");

	for (var i = 0; i < nodeData.next.length; ++i) {
		xmlData.push(getXmlByNode(nodeData.next[i], nodeData.defaultIndex === i));
	}

	xmlData.push("</n>");
	return xmlData.join("").replace(/\"><\/n>/g, '" />');
};

// 翻转鹏飞象棋 PFC 格式
vschess.turn_PengFei = function(chessData){
	chessData = chessData.split('m="');
	var end = chessData[1].indexOf('"');
	chessData[1] = vschess.turnFen(chessData[1].substring(0, end)) + chessData[1].substring(end);

	for (i = 2; i < chessData.length; ++i) {
		chessData[i] = vschess.turnMove(chessData[i].substring(0, 4)) + chessData[i].substring(4);
	}

	return chessData.join('m="');
};

// 将着法列表转换为 QQ 象棋 CHE 格式
vschess.moveListToData_QQ = function(moveList, isMirror){
	var result = ["1 ", moveList.length, " "], srcCol, dstCol, src;

	var board = [
		 8,  6,  4,  2,  0,  1,  3,  5,  7,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		 0, 10,  0,  0,  0,  0,  0,  9,  0,
		15,  0, 14,  0, 13,  0, 12,  0, 11,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		27,  0, 28,  0, 29,  0, 30,  0, 31,
		 0, 25,  0,  0,  0,  0,  0, 26,  0,
		 0,  0,  0,  0,  0,  0,  0,  0,  0,
		23, 21, 19, 17, 16, 18, 20, 22, 24
	];

	for (var i = 0; i < moveList.length; ++i) {
		var moveSplit = moveList[i].split("");
		var from = vschess.i2b[moveList[i].substring(0, 2)];
		var to   = vschess.i2b[moveList[i].substring(2, 4)];
		srcCol = isMirror ? vschess.cca(moveSplit[0]) - 97 : 105 - vschess.cca(moveSplit[0]);
		dstCol = isMirror ? vschess.cca(moveSplit[2]) - 97 : 105 - vschess.cca(moveSplit[2]);
		result.push(board[from], " 32 ", 1 - i % 2, " ", moveSplit[1], " ", srcCol, " ", moveSplit[3], " ", dstCol, " 0 ", i + 1, " 0 ");
		board[to] = board[from];
	}

	return result.join("");
};

// 节点 ICCS 转换为中文着法（兼容 WXF 着法转换为中文着法，直接返回结果字符串）
vschess.Node2Chinese = function(move, fen, options){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	typeof options === "undefined" && (options = vschess.defaultOptions);
	var w2i = [{ "+": 0, ".": 1, "-": 2 }, { "+": 3, "-": 4, ".": 5 }];
	var isB = fen.split(" ")[1] === "b", result = "";
	var isWXFMove = ~"+-.".indexOf(move.charAt(2));

	if (isWXFMove) {
		var wxfSplit = move.replace(/^([RNHBEAKCP])([\+\-])/g, "$2$1").replace("Pa", "1P").replace("Pb", "2P").replace("Pc", "3P").replace("Pd", "4P").replace("Pe", "5P").replace(/^P\./, ".P").split("");
	}
	else {
		var wxfData  = vschess.Node2WXF(move, fen);

		if (wxfData.move === "None") {
			return { move: "\u65e0\u6548\u7740\u6cd5", movedFen: vschess.defaultFen };
		}
		else {
			var wxfSplit = wxfData.move.replace(/^([RNHBEAKCP])([\+\-])/g, "$2$1").replace("Pa", "1P").replace("Pb", "2P").replace("Pc", "3P").replace("Pd", "4P").replace("Pe", "5P").replace(/^P\./, ".P").split("");
		}
	}

	// 将 WXF 格式转换为中文格式，看起来眼晕@_@？（这里你用不着看懂，想看懂得可以去看官方文档，那里有这一段的最原始代码。）
	result += vschess.cca(wxfSplit[0]) > 47 ? isNaN(wxfSplit[0]) ? options.ChineseChar.Piece.charAt((vschess.f2n[wxfSplit[0]] & 15) + (isB ? 6 : -1)) : options.ChineseChar.PawnIndex.charAt(wxfSplit[0] - (isB ? -4 : 1)) : options.ChineseChar.Text.charAt(w2i[0][wxfSplit[0]]);
	result += isNaN(wxfSplit[1]) ? options.ChineseChar.Piece.charAt((vschess.f2n[wxfSplit[1]] & 15) - (isB ? -6 : 1)) : options.ChineseChar.Number.charAt(wxfSplit[1] - (isB ? -8 : 1));
	result += options.ChineseChar.Text.charAt(w2i[1][wxfSplit[2]]) + options.ChineseChar.Number.charAt(wxfSplit[3] - (isB ? -8 : 1));

	if (isWXFMove) {
		return result;
	}

	return { move: result, movedFen: wxfData.movedFen };
};

// 节点 ICCS 转换为 WXF 着法
vschess.Node2WXF = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var isB = fen.split(" ")[1] === "b";
	move = move.toLowerCase();

	// 黑方旋转处理
	if (isB) {
		var step	  = vschess.roundMove(move);
		var situation = vschess.fenToSituation(vschess.roundFen(fen));
	}
	// 红方直接处理
	else {
		var step	  = move;
		var situation = vschess.fenToSituation(fen);
	}

	var from	= vschess.i2s[step.substring(0, 2)];
	var to		= vschess.i2s[step.substring(2, 4)];

	if (situation[from] < 16) {
		return { move: "None", movedFen: vschess.defaultFen };
	}

	var fromCol	= 12 - from % 16;
	var toCol	= 12 - to   % 16;
	var piece   = situation[from] & 15;
	var result	= "";

	// 相象仕士
	if (piece === 3 || piece === 4) {
		result = vschess.n2f[piece | 16] + fromCol;
	}
	// 兵卒
	else if (piece === 7) {
		for (var i = 60 - fromCol, pLength = 0; i < 204; i += 16) {
			situation[i] === situation[from] && ++pLength;
		}

		if (pLength === 1) {
			result = "P" + fromCol;
		}
		else {
			for (var i = 59, pList = []; i > 50; --i) {
				for (var j = i, pColList = []; j < 204; j += 16) {
					situation[j] === situation[from] && pColList.push(j);
				}

				pColList.length > 1 && (pList = pList.concat(pColList));
			}

			if (pList.length === 2) {
				result = "P" + "+-" .charAt(pList.indexOf(from));
			}
			else if (pList.length === 3) {
				result = "P" + "+.-".charAt(pList.indexOf(from));
			}
			else {
				result = "P" + vschess.fcc(pList.indexOf(from) + 97);
			}
		}
	}
	// 车马帅将炮
	else {
		for (var i = from + 16; i < 204 && !result; i += 16) {
			situation[i] === situation[from] && (result = vschess.n2f[piece | 16] + "+");
		}

		for (var i = from - 16; i >  50 && !result; i -= 16) {
			situation[i] === situation[from] && (result = vschess.n2f[piece | 16] + "-");
		}

		result || (result = vschess.n2f[piece | 16] + fromCol);
	}

	// 马相象仕士
	if (piece === 2 || piece === 3 || piece === 4) {
		result += (from > to ? "+" : "-") + toCol;
	}
	// 车帅将炮兵卒
	else {
		var offset = to - from;

		if (Math.abs(offset) > 15) {
			result += (offset > 0 ? "-" : "+") + Math.abs(offset >> 4);
		}
		else {
			result += "." + toCol;
		}
	}

	if (result) {
		situation[to  ]   = situation[from];
		situation[from]   = 1;
		situation[0   ]   = 3    - situation[0];
		situation[0   ] === 1 && ++situation[1];
		return { move: result, movedFen: isB ? vschess.roundFen(vschess.situationToFen(situation)) : vschess.situationToFen(situation) };
	}

	return { move: "None", movedFen: vschess.defaultFen };
};

// 节点 ICCS 转换为 ICCS 着法
vschess.Node2ICCS = function(move, fen){
	var RegExp = vschess.RegExp();
	RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	var situation = vschess.fenToSituation(fen);
	situation[vschess.i2s[move.substring(2, 4)]] = situation[vschess.i2s[move.substring(0, 2)]];
	situation[vschess.i2s[move.substring(0, 2)]] = 1;
	situation[0]   = 3  -   situation[0];
	situation[0] === 1 && ++situation[1];
	return { move: move.toUpperCase().substring(0, 2) + "-" + move.toUpperCase().substring(2, 4), movedFen: vschess.situationToFen(situation) };
};

// 节点 ICCS 转换为 ICCS 着法（无 Fen 串）
vschess.Node2ICCS_NoFen = function(move){
	return move.toUpperCase().substring(0, 2) + "-" + move.toUpperCase().substring(2, 4);
};

// 节点 ICCS 列表转换为着法列表，列表第一个元素为起始局面 Fen 串
vschess.nodeList2moveList = function(moveList, fen, format, options, mirror){
	var RegExp = vschess.RegExp();

	if (RegExp.FenShort.test(moveList[0])) {
		moveList = moveList.slice(0);
		fen      = moveList.shift( );
	}
	else {
		RegExp.FenShort.test(fen) || (fen = vschess.defaultFen);
	}

	mirror && (fen = vschess.turnFen(fen));
	var result = [fen], currentFen = fen, stepData, move;

	switch (format) {
		case "iccs": var converter = vschess.Node2ICCS   ; break;
		case  "wxf": var converter = vschess.Node2WXF    ; break;
		default    : var converter = vschess.Node2Chinese; break;
	}

	for (var i = 0; i < moveList.length; ++i) {
		move = mirror ? vschess.turnMove(moveList[i]) : moveList[i];
		stepData = converter(move, currentFen, options);
		currentFen = stepData.movedFen;

		if (stepData.move === "None" || stepData.move === "\u65e0\u6548\u7740\u6cd5") {
			break;
		}

		result.push(stepData.move);
	}

	return result;
};

// 节点树抽取当前节点 ICCS 列表
vschess.nodeToNodeList = function(node){
	var currentNode = node;
	var fen = currentNode.fen;
	var result = [fen];

	while (currentNode.next.length) {
		var defaultIndex = currentNode.defaultIndex || 0;
		currentNode = currentNode.next[defaultIndex];
		result.push(currentNode.move);
	}

	return result;
};

// WXF 着法字符串转换为 ECCO 开局编号及类型
vschess.WXF2ECCO = function(wxfList){
	wxfList = wxfList && wxfList.length ? wxfList.slice(0) : [vschess.defaultFen];

	if (wxfList[0].length > 4 && wxfList.shift().split(" ", 2).join(" ") !== vschess.defaultFen.split(" ", 2).join(" ")) {
		return { ecco: "A00", opening: "\u6b8b\u5c40", variation: "" };
	}

	wxfList.length > 20 && (wxfList.length = 20);

	if (wxfList.length && wxfList[0].substring(1, 2) > 5) {
		for (var i = 0; i < wxfList.length; ++i) {
			wxfList[i] = vschess.turnWXF(wxfList[i]);
		}
	}

	var wxfList80 = wxfList.join("");
	wxfList80.length < 80 && (wxfList80 += new Array(81 - wxfList80.length).join(" "));
	var index = vschess.WXF2ECCOIndex(wxfList80);
	var ecco  = vschess.ECCOIndex2Name(index).split("#");
	return { ecco: index, opening: ecco[0], variation: ecco[1] || "" };
};

// WXF 着法字符串转换为 ECCO 开局编号
vschess.WXF2ECCOIndex = function(wxf){
	wxf = wxf ? wxf.toUpperCase() : "";
	var moveList = [], tempStr = wxf.substring(0, 80);

	while (tempStr) {
		moveList.push([tempStr.substring(0, 4), tempStr.substring(4, 8)]);
		tempStr = tempStr.substring(8);
	}

	return EccoXxx();

	function S(move, delta) {
		delta = (delta || 0) * 4;
		return wxf.substring(delta, delta + move.length) === move;
	}

	function U(move){
		var R = [], B = [], tempStr = move;

		while (tempStr) {
			tempStr && R.push(tempStr.substring(0, 4));
			tempStr = tempStr.substring(4);
			tempStr && B.push(tempStr.substring(0, 4));
			tempStr = tempStr.substring(4);
		}

		var RN = R.join(""), BN = B.join("");

		for (var i = 0; i < R.length; ++i) {
			if (!~RN.indexOf(moveList[i][0])) return false;
			RN = RN.replace(moveList[i][0], "");
		}

		for (var i = 0; i < B.length; ++i) {
			if (!~BN.indexOf(moveList[i][1])) return false;
			BN = BN.replace(moveList[i][1], "");
		}

		return !RN && !BN;
	}

	function SR(round) { return round * 2 - 2; }
	function SB(round) { return round * 2 - 1; }

	function B5x() {
		var i, bIsB54 = true;

		for (i = 1; i < 5; ++i) {
			switch (moveList[i][0]) {
				case "N2+3": case "N8+9": case "R1.2": case "P3+1": break;
				default    : bIsB54 = false; break;
			}
		}

		for (i = 1; i < 4; ++i) {
			switch (moveList[i][1]) {
				case "N8+7": case "C8.6": case "P3+1": break;
				default    : bIsB54 = false; break;
			}
		}

		if (bIsB54) {
			if (S("B7+5C8.7R1.2R9.8C2+4", SB(5))) {
				if (S("P7+1P3+1P3+1", SR(8))) return "B56";
				return "B55";
			}

			return "B54";
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][1]) {
					case "B7+5": case "B3+5": case "N8+7": case "C8.6": case "P7+1": case "P3+1": break;
					case "R1.2": return "B53";
					case "R9+1": return "B52";
					case "R9.8": return "B51";
					default    : return "B50";
				}
			}

			return "B50";
		}
	}

	function sandwich() {
		var i, bRedN7 = false, bRedN9 = false, bRedC6 = false;

		if (S("P7+1C8.6N8+7", SR(2))) {
			return "B32";
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][1]) {
					case "N8+7":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][0]) {
								case "N8+9": bRedN9 = true; break;
								case "N8+7": bRedN7 = true; break;
								case "C8.6": bRedC6 = true; break;
								case "N2+3": case "R1.2": case "P3+1": case "P7+1": break;
								case "R1+1": if (!bRedC6) return "B34"; break;
								case "R2+6": if (!bRedC6) return "B33"; break;
								case "C8.7": return B5x();
								case "C8+4": return "B36";
								case "C8+2": return "B35";
								default:
									if (bRedC6) {
										if (S("N2+3C8.6R1.2N8+7", SR(2))) {
											if (bRedN7) {
												if (moveList[3][0] === "C8.6" && moveList[3][1] === "R1.2") {
													if (moveList[4][1] === "C2.1") {
														if (moveList[5][1] === "P7+1")  return "B44";
														return "B43";
													}

													return "B42";
												}

												return "B41";
											}

											if (bRedN9) return "B45";
											return "B40";
										}

										return "B40";
									}

									return "B31";
							}
						}

						return "B30";
					case "B7+5": case "B3+5": case "C8.6": case "P7+1": case "P3+1": break;
					default    : return "B30";
				}
			}

			return "B30";
		}
	}

	function C5x() {
		var i, bIsC52 = true, bIsC55 = true;

		for (i = 1; i < 5; ++i) {
			switch (moveList[i][0]) {
				case "N2+3": case "R1.2": case "C8.6": break;
				case "N8+9": bIsC55 = false; break;
				case "R2+6": bIsC52 = false; break;
				default    : bIsC52 = bIsC55 = false; break;
			}
		}

		for (i = 1; i < 4; ++i) {
			switch (moveList[i][1]) {
				case "N2+3": case "N8+7": case "R9.8": case "P7+1": break;
				default    : bIsC52 = bIsC55 = false; break;
			}
		}

		if (bIsC52) {
			if (S("R1.2R9.8", SB(5))) {
				if (moveList[5][1] === "C2+4") return "C53";
				return "C52";
			}

			return "C51";
		}
		else if (bIsC55) {
			switch (moveList[4][1]) {
				case "P3+1": return "C56";
				case "R1.2": return "C55";
				default    : return "C54";
			}
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][0]) {
					case "N2+3": case "R1.2": case "C8.6": case "P3+1": case "P7+1": break;
					case "R2+6": return "C54";
					case "N8+9": return "C51";
					default    : return "C50";
				}
			}

			return "C50";
		}
	}

	function C8x() {
		var i, bIsC85 = true, bBlackB7 = false;

		for (i = 1; i < 5; ++i) {
			switch (moveList[i][0]) {
				case "N2+3": case "N8+7": case "C8+2": case "P7+1": break;
				default    : bIsC85 = false;
			}
		}

		for (i = 1; i < 4; ++i) {
			switch (moveList[i][1]) {
				case "N8+7": case "N2+3": case "R9.8": case "P7+1": break;
				default    : bIsC85 = false; break;
			}
		}

		if (bIsC85 && moveList[4][1] === "N7+8") {
			if (moveList[5][0] === "N7+6" && moveList[6][0] === "R1+1") return "C86";
			return "C85";
		}
		else {
			for (i = 1; i < 10; ++i) {
				switch (moveList[i][1]) {
					case "B7+5": bBlackB7 = true; break;
					case "B3+5": return "C84";
					case "P7+1": case "P3+1": break;
					case "N8+7": case "N2+3": case "R9.8": break;
					case "C8+2": if (bBlackB7) return "C83"; return "C80";
					case "R1+1": if (bBlackB7) return "C82"; return "C80";
					default    : if (bBlackB7) return "C81"; return "C80";
				}
			}

			return "C80";
		}
	}

	function C9x() {
		for (var i = 1; i < 10; ++i) {
			switch (moveList[i][0]) {
				case "P3+1":
					for (i = 1; i < 10; ++i) {
						switch (moveList[i][1]) {
							case "P3+1":
								for (i = 1; i < 10; ++i) {
									switch (moveList[i][0]) {
										case "N8+9":
											switch (moveList[4][1]) {
												case "B7+5": case "B3+5":
													switch (moveList[5][1]) {
														case "P1+1": if (moveList[6][0] === "C8.7") return "C97"; return "C96";
														case "A6+5": case "A4+5": return "C94";
														case "P7+1": return "C95";
														default    : return "C93";
													}
												case "P1+1": if (moveList[6][0] === "C8.7") return "C97"; return "C96";
												case "A6+5": case "A4+5": return "C94";
												case "P7+1": return "C95";
												default    : return "C93";
											}
										case "N2+3": case "R1.2": case "C8+4": case "P3+1": break;
										case "C8.7": return "C98";
										case "N8+7": return "C92";
										default    : return "C91";
									}
								}

								return "C91";
							case "N8+7": case "N2+3": case "R9.8": break;
							default    : return "C90";
						}
					}

					return "C90";
				case "N2+3": case "N8+7": case "N8+9": case "R1.2": case "R2+6": case "C8+4": break;
				default    : return "C90";
			}
		}

		return "C90";
	}

	function screen() {
		var i, bRedN7, bRedN9, bRedR6, bBlackC8, bBlackC2, bBlackP3;
		bRedN7 = bRedN9 = bRedR6 = bBlackC8 = bBlackC2 = bBlackP3 = false;

		if (U("C2.5N8+7N2+3R9.8R1.2P7+1R2+6N2+3N8+7P3+1")) {
			if (moveList[5][0] === "R9+1") {
				if (S("C2+1R2-2B3+5", SB(6))) {
					switch (moveList[7][0]) {
						case "P3+1": if (moveList[8][0] === "P7+1") return "C25"; return "C23";
						case "P7+1": if (moveList[8][0] === "P7+1") return "C25"; return "C24";
						default    : return "C22";
					}
				}

				return "C21";
			}

			return "C20";
		}
		else if (U("C2.5N8+7N2+3R9.8R1.2P7+1R2+6N2+3P7+1")) {
			switch (moveList[4][1]) {
				case "N7+6":
					if (moveList[5][0] === "N8+7") {
						if (moveList[5][1] === "B3+5") {
							switch (moveList[6][0]) {
								case "C8.9": return "C39";
								case "C8+1": return "C38";
								default    : return "C37";
							}
						}

						return "C36";
					}

					return "C35";
				case "C8.9":
					if (S("R2.3C9-1", SR(6))) {
						switch (moveList[6][0]) {
							case "N8+7":
								if (moveList[6][1] === "A4+5") {
									switch (moveList[7][0]) {
										case "C8.9": if (moveList[7][1] === "R1.2" || moveList[8][1] === "R1.2") return "C46"; return "C45";
										case "N7+6": return "C44";
										default    : return "C43";
									}
								}

								return "C42";
							case "P5+1": return "C49";
							case "C8.6": return "C48";
							case "N8+9": return "C47";
							default    : return "C41";
						}
					}

					return "C40";
				case "B7+5": case "B3+5": return "C32";
				case "A6+5": case "A4+5": return "C31";
				case "C2+4": return "C34";
				case "R1+1": return "C33";
				default    : return "C30";
			}
		}
		else if (U("C2.5N8+7N2+3R9.8R1.2P7+1N8+9N2+3C8.7")) {
			switch (moveList[4][1]) {
				case "R1.2":
					if (moveList[5][0] === "R9.8") {
						switch (moveList[5][1]) {
							case "C2+4": return "C66";
							case "C2+2": return "C65";
							case "C8+4": return "C64";
							default    : return "C63";
						}
					}

					return "C62";
				case "C2+2": return "C67";
				default    : return "C61";
			}
		}
		else if (U("C2.5N8+7N2+3R9.8R1.2N2+3P3+1P3+1N8+9P1+1C8.7N3+2")) {
			if (moveList[6][0] === "R9+1") {
				switch (moveList[6][1]) {
					case "B7+5":
						switch (moveList[7][0]) {
							case "R2+4": return "C76";
							case "N3+4": return "C75";
							default    : return "C74";
						}
					case "P1+1": return "C78";
					case "B3+5": return "C77";
					default    : return "C73";
				}
			}

			return "C72";
		}
		else {
			for (i = 1; i < 9; ++i) {
				switch (moveList[i][0]) {
					case "R2+4":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][0]) {
								case "N2+3": case "R1.2": case "R2+4": case "P3+1": case "P7+1": break;
								case "N8+7": case "N8+9": return "C16";
								default    : return "C15";
							}
						}
					case "R1+1":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][0]) {
								case "N2+3": case "N8+7": case "R1+1": case "R1.4": case "R1.6": case "P3+1": case "P7+1": break;
								case "P5+1": return "C14";
								case "C8.9": return "C13";
								case "C8+2": return "C12";
								case "N7+6": return "C11";
								default    : return "C10";
							}
						}

						return "C10";
					case "C8.7":
						for (i = 1; i < 10; ++i) {
							switch (moveList[i][1]) {
								case "P7+1":
									for (i = 1; i < 10; ++i) {
										switch (moveList[i][0]) {
											case "N2+3": case "N8+9": case "R1.2": case "R2+6": case "C8.7": break;
											case "P7+1": return "C68";
											default    : return "C60";
										}
									}

									return "C60";
								case "P3+1": bBlackP3 = true; break;
								case "N3+2": return "C71";
								case "N2+3": case "N8+7": case "R9.8": break;
								default    : if (bBlackP3) return "C70"; return "C60";
							}
						}
					case "N2+3": case "R1.2": case "P3+1": case "P7+1": break;
					case "N8+9": bRedN9 = true; break;
					case "N8+7": bRedN7 = true; break;
					case "R2+6": bRedR6 = true; break;
					case "C8+4": return C9x();
					case "C8+2": return C8x();
					case "C8.6": return C5x();
					case "C8.9": return "C99";
					default:
						if (bRedR6) {
							for (i = 1; i < 10; ++i) {
								switch (moveList[i][0]) {
									case "N2+3": case "R1.2": case "R2+6": case "P3+1": case "P7+1": break;
									case "N8+9": return "C19";
									case "N8+7": return "C18";
									default    : return "C17";
								}
							}

							return "C17";
						}
						else if (bRedN7) {
							for (i = 1; i < 10; ++i) {
								switch (moveList[i][0]) {
									case "P5+1":
										for (i = 1; i < 10; ++i) {
											switch (moveList[i][1]) {
												case "N2+3": case "N8+7": case "R9.8": case "P7+1": case "P3+1": break;
												case "C8+4": if (bBlackC2) return "C04"; bBlackC8 = true; break;
												case "C2+4": if (bBlackC8) return "C04"; bBlackC2 = true; break;
												default    : return "C03";
											}
										}

										return "C03";
									case "N2+3": case "N8+7": case "R1.2": case "P3+1": case "P7+1": break;
									case "N7+6": return "C02";
									default    : return "C01";
								}
							}

							return "C01";
						}
						else if (bRedN9) {
							for (i = 1; i < 10; ++i) {
								switch (moveList[i][0]) {
									case "N2+3": case "N8+9": case "R1.2": case "P3+1": case "P7+1": break;
									case "R9+1": return "C06";
									default    : return "C05";
								}
							}

							return "C05";
						}

						return "C00";
				}
			}

			return "C00";
		}
	}

	function Bxx() {
		switch (moveList[1][1]) {
			case "R9+1":
				if (moveList[1][0] === "N2+3" && S("R1.2R9.4", SR(3))) {
					switch (moveList[3][0]) {
						case "P7+1": return "B14";
						case "C8+2": return "B13";
						default    : return "B12";
					}
				}

				return "B10";
			case "C8.6":
				switch (moveList[2][1]) {
					case "N8+9": case "R9+1": return "B11";
					default    : return sandwich();
				}
			case "P3+1": case "P7+1":
				switch (moveList[2][1]) {
					case "A6+5": case "A4+5": return "B02";
					case "C8.6": return sandwich();
					case "N8+7": return screen();
					case "R9+2": return "B03";
					default    : return "B01";
				}
			case "N8+7": return screen();
			case "N8+9": return "B10";
			case "C2.1": return "B04";
			default: return "B01";
		}
	}

	function Cxx() {
		function CxxClassify() {
			var i, bBlackCx = 0;

			for (i = 1; i < 10; i++) {
				switch(moveList[i][1]) {
					case "R9.8": case "R8+5": case "P7+1": case "P3+1": break;
					case "N2+3": if (bBlackCx) return bBlackCx; return 7;
					case "R9+1": if (bBlackCx) return bBlackCx; return 6;
					case "C8+4": bBlackCx = 2; break;
					case "C8.9": bBlackCx = 1; break;
					case "C2.5": return 5 - bBlackCx;
					default    : return bBlackCx;
				}
			}

			return 0;
		}

		var i, bRedR2, bRedR8, bRedP3, bRedP7;
		bRedR2 = bRedR8 = bRedP3 = bRedP7 = false;

		switch (CxxClassify()) {
			case 1:
				for (i = 1; i < 10; ++i) {
					switch (moveList[i][0]) {
						case "B7+9": if (moveList[i - 1][1] === "R8+5") return "B21"; return "B20";
						case "P3+1": if (bRedP7) return "B25"; bRedP3 = true; break;
						case "P7+1": if (bRedP3) return "B25"; bRedP7 = true; break;
						case "N2+3": case "N8+7": break;
						case "C8+4": return "B24";
						case "C8+2": return "B23";
						case "R1+1": return "B22";
						default    : return "B20";
					}
				}

				return "B20";
			case 3:
				if (S("N2+3R9.8R1.2C8+4P3+1C2.5", SR(2))) {
					switch (moveList[4][0]) {
						case "P7+1": return "D36";
						case "C8+5": return "D35";
						case "N8+9": return "D34";
						case "N8+7": return "D33";
						case "N3+4": return "D32";
						default    : return "D31";
					}
				}

				return "D30";
			case 4:
				for (i = 1; i < 10; ++i) {
					switch (moveList[i][0]) {
						case "P5+1": if (moveList[i - 1][1] === "R8+5" && moveList[i][1] === "C2.5") return "D41"; return "D40";
						case "P3+1": if (bRedP7) return "D43"; bRedP3 = true; break;
						case "P7+1": if (bRedP3) return "D43"; bRedP7 = true; break;
						case "N2+3": case "N8+7": break;
						case "R9.8": return "D42";
						default    : return "D40";
					}
				}

				return "D40";
			case 5:
				for (i = 1; i < 10; ++i) {
					switch (moveList[i][0]) {
						case "R2+6": return "D53";
						case "N2+3": case "N8+7": case "P3+1": case "P7+1": break;
						case "R1.2": if (bRedR8) return "D55"; bRedR2 = true; break;
						case "R9.8": if (bRedR2) return "D55"; bRedR8 = true; break;
						default    : if (bRedR2) return "D52"; if (bRedR8) return "D54"; return "D51";
					}
				}

				return "D50";
			case  7: return screen();
			case  2: return "B07";
			case  6: return "B06";
			default: return "B05";
		}
	}

	function D1x() {
		for (var i = 2; i < 10; ++i) {
			switch (moveList[i][1]) {
				case "N2+3": case "P7+1": case "P3+1": break;
				case "C2.1": return "D15";
				case "C2+4": return "D14";
				case "R9.8": return "D13";
				case "R1+1": return "D12";
				case "R9+1": return "D11";
				default    : return "D10";
			}
		}

		return "D10";
	}

	function D2x() {
		var i, bRedP3 = false, bRedP7 = false;

		for (i = 3; i < 10; ++i) {
			switch (moveList[i][0]) {
				case "A4+5": case "A6+5": return "D21";
				case "N8+9": return "D22";
				case "R2+4": return "D23";
				case "R2+6": return "D24";
				case "C8.6": return "D25";
				case "P3+1":
					if (bRedP7) {
						for (i = 3; i < 10; ++i) {
							switch (moveList[i][1]) {
								case "N2+3": case "R9.4": break;
								case "R1+1": return "D29";
								default    : return "D28";
							}
						}

						return "D28";
					}

					bRedP3 = true;
					break;
				case "P7+1":
					if (bRedP3) {
						for (i = 3; i < 10; ++i) {
							switch (moveList[i][1]) {
								case "N2+3": case "R9.4": break;
								case "R1+1": return "D29";
								default    : return "D28";
							}
						}

						return "D28";
					}

					bRedP7 = true;
					break;
				case "N8+7": break;
				default    : if (bRedP3) return "D26"; if (bRedP7) return "D27"; return "D20";
			}
		}

		return "D20";
	}

	function Dxx() {
		switch (moveList[1][0]) {
			case "N2+3":
				switch (moveList[1][1]) {
					case "N8+7":
						switch (moveList[2][0]) {
							case "R1.2": if (moveList[2][1] === "R9+1") return D2x(); return D1x();
							case "R1+1":
								if (moveList[2][1] === "R9.8") {
									if (moveList[3][1] === "R8+4") return "D05";
									return "D04";
								}

								return "D03";
							default:
								switch (moveList[2][1]) {
									case "R9.8": return "D02";
									case "R9+1": return "D01";
									default    : return "D00";
								}
						}
					case "R9+1": if (S("R1.2N8+7", SR(3))) return D2x(); return "D01";
					default: return "D00";
				}
			case "R1+1":
				if (S("R9.8N8+7", SB(2))) {
					if (moveList[2][1] === "R8+4") return "D05";
					return "D04";
				}

				return "D03";
			default: return "D00";
		}
	}

	function EccoXxx() {
		function isA28() {
			var i, bRedN3 = false, bRedN7 = false;

			for (i = 1; i < 10; ++i) {
				switch (moveList[i][0]) {
					case "N2+3": if (bRedN7) return true; bRedN3 = true; break;
					case "N8+7": if (bRedN3) return true; bRedN7 = true; break;
					case "R1.2": case "P3+1": case "P7+1": break;
					default    : return false;
				}
			}

			return false;
		}

		function isA53() {
			var i, bRedN3 = false, bRedN7 = false;

			for (i = 1; i < 10; ++i) {
				switch (moveList[i][0]) {
					case "N2+3": if (bRedN7) return true; bRedN3 = true; break;
					case "N8+7": if (bRedN3) return true; bRedN7 = true; break;
					case "R9.8": case "P3+1": case "P7+1": break;
					default    : return false;
				}
			}

			return false;
		}

		switch (moveList[0][0]) {
			case "B3+5":
				switch (moveList[0][1]) {
					case "N2+3":
						switch (moveList[1][0]) {
							case "P7+1": return "A16";
							case "P3+1": return "A15";
							default    : return "A14";
						}
					case "C2.4":
						switch (moveList[1][0]) {
							case "P7+1": return "A26";
							case "P3+1": return "A25";
							case "R9+1": return "A24";
							case "N8+9": return "A23";
							case "N8+7": return "A22";
							default    : return "A21";
						}
					case "C8.4":
						if (moveList[1][0] === "N2+3") {
							if (S("N8+7R1.2P7+1", SB(2))) {
								switch (moveList[3][0]) {
									case "P7+1": return "A34";
									case "C2.1": return "A33";
									default    : return "A32";
								}
							}

							return "A31";
						}

						return "A30";
					case "P7+1":
						switch (moveList[1][0]) {
							case "P7+1": return "A38";
							case "N8+7": return "A37";
							default    : return "A36";
						}
					case "C8.5": if (isA28()) return "A28"; return "A27";
					case "P3+1": return "A39";
					case "C2.6": return "A35";
					case "C2.5": return "A29";
					case "C8.6": return "A20";
					case "N8+7": return "A13";
					case "B3+5": return "A12";
					case "B7+5": return "A11";
					default    : return "A10";
				}
			case "N2+3":
				if (moveList[0][1] === "P7+1") {
					switch (moveList[1][0]) {
						case "P7+1": return "A45";
						case "C8.5": return "A44";
						case "C8.6": return "A43";
						case "C2.1": return "A42";
						default    : return "A41";
					}
				}

				return "A40";
			case "C2.4":
				switch (moveList[0][1]) {
					case "C2.5": if (isA53()) return "A53"; return "A52";
					case "P7+1": return "A54";
					case "N8+7": return "A51";
					default    : return "A50";
				}
			case "C2.5":
				switch (moveList[0][1]) {
					case "C8.5": return Dxx();
					case "N8+7": return Cxx();
					case "N2+3": return Bxx();
					case "C2.5": return "D50";
					default    : return "B00";
				}
			case "C2.6":
				switch (moveList[0][1]) {
					case "C8.5":
						if (moveList[1][0] === "N2+3" && moveList[2][0] === "R1.2") {
							if (moveList[1][1] === "N8+7" && moveList[2][1] === "R9+1") return "A65";
							if (moveList[1][1] === "R9+1" && moveList[2][1] === "N8+7") return "A65";
							return "A64";
						}

						return "A63";
					case "R9+1": return "A62";
					case "N8+7": return "A61";
					default    : return "A60";
				}
			case "P3+1":
				switch (moveList[0][1]) {
					case "C8.7":
						switch (moveList[1][0]) {
							case "C8.5":
								switch (moveList[1][1]) {
									case "B3+5":
										if (moveList[2][0] === "N2+1") {
											if (moveList[2][1] === "N8+9") return "E16";
											return "E15";
										}

										return "E14";
									case "B7+5":
										switch (moveList[2][0]) {
											case "N8+7":
												switch (moveList[2][1]) {
													case "R1+1":
														if (S("R9.8R1.8N2+3N8+6", SR(4))) {
															if (S("C2.1N2+1N3+4", SR(6))) {
																switch (moveList[6][1]) {
																	case "P1+1": return "E27";
																	case "R8+6": return "E26";
																	case "A6+5": return "E25";
																	default    : return "E24";
																}
															}

															return "E24";
														}

														return "E23";
													case "P7+1":
														if (S("N2+1P7+1", SR(4)) || S("R9.8P7+1", SR(4))) {
															if (moveList[4][0] === "N2+1" || moveList[4][0] === "R9.8") {
																switch (moveList[4][1]) {
																	case "R1+1":
																		switch (moveList[5][0]) {
																			case "R1.2": return "E36";
																			case "R8+4": return "E35";
																			case "A4+5": return "E34";
																			default    : return "E33";
																		}
																	case "N8+6": return "E32";
																	default    : return "E31";
																}
															}

															return "E31";
														}

														return "E30";
													default: return "E22";
												}
											case "C5+4": return "E38";
											case "N2+1": return "E37";
											case "A4+5": return "E21";
											default    : return "E20";
										}
									case "C2.5": return "E17";
									default    : return "E13";
								}
							case "B7+5": case "B3+5": return "E11";
							case "C2.5": return "E12";
							default    : return "E10";
						}
					case "N2+3":
						switch (moveList[1][0]) {
							case "N2+3":
								if (moveList[1][1] === "P3+1") {
									switch (moveList[2][0]) {
										case "B3+5": case "B7+5": return "E43";
										case "C2.1": return "E45";
										case "R1+1": return "E44";
										default    : return "E42";
									}
								}

								return "E07";
							case "P7+1": if (moveList[1][1] === "C8.7") return "E09"; return "E08";
							default    : return "E06";
						}
					case "P3+1":
						switch (moveList[1][0]) {
							case "N2+3":
								if (moveList[1][1] === "N2+3") {
									switch (moveList[2][0]) {
										case "B3+5": case "B7+5": return "E43";
										case "C2.1": return "E45";
										case "R1+1": return "E44";
										default    : return "E42";
									}
								}

								return "E41";
							case "C8.7":
								switch (moveList[1][1]) {
									case "C8.5": return "E48";
									case "C2.5": return "E47";
									default    : return "E46";
								}
							default: return "E40";
						}
					case "B7+5": case "B3+5": if (moveList[1][0] === "N2+3") return "E02"; return "E01";
					case "C8.6": case "C8.4": case "C2.6": case "C2.4": return "E04";
					case "C8.5": case "C2.5": return "E03";
					case "C2.7": return "E05";
					default    : return "E00";
				}
			case "P1+1": return "A08";
			case "C2.7": return "A07";
			case "C2.3": return "A06";
			case "C2+4": return "A05";
			case "C2+2": return "A04";
			case "C2.1": return "A03";
			case "N2+1": return "A02";
			case "A4+5": return "A01";
			default    : return "A00";
		}
	}
};

// ECCO 编号转换为开局类型
vschess.ECCOIndex2Name = function(index){
	var k =  index.substring(0, 1);
	var i = +index.substring(1, 3);
	return vschess.eccoDir[k][i] ? vschess.eccoDir[k][i] : vschess.eccoDir.A[0];
};

// 象棋演播室 XQF 格式文件头读取
vschess.XQF_Header = function(buffer){
    var S = function(start, length){
        return Array.from(buffer.slice(start, start + length));
    };

    var K = function(start, length){
        var array = buffer.slice(start, start + length).reverse(), sum = 0;

        for (var i = 0; i < array.length; ++i) {
            sum += array[i] * Math.pow(256, i);
        }

        return sum;
    };

    return {
        Version       : buffer[ 2], // 版本号
        KeyMask       : buffer[ 3], // 加密掩码
        KeyOr         : S(  8,  4), // Or密钥
        KeySum        : buffer[12], // 加密的钥匙和
        KeyXYp        : buffer[13], // 棋子布局位置钥匙
        KeyXYf        : buffer[14], // 棋谱起点钥匙
        KeyXYt        : buffer[15], // 棋谱终点钥匙
        QiziXY        : S( 16, 32), // 32个棋子的原始位置
        PlayStepNo    : K( 48,  2), // 棋谱文件的开始步数
        WhoPlay       : buffer[50], // 该谁下
        PlayResult    : buffer[51], // 最终结果
        PlayNodes     : S( 52,  4), // 本棋谱一共记录了多少步
        PTreePos      : S( 56,  4), // 对弈树在文件中的起始位置
        Type          : buffer[64], // 对局类型(全,开,中,残等)
        Title         : S( 81, buffer[ 80]), // 标题
        MatchName     : S(209, buffer[208]), // 比赛名称
        MatchTime     : S(273, buffer[272]), // 比赛时间
        MatchAddr     : S(289, buffer[288]), // 比赛地点
        RedPlayer     : S(305, buffer[304]), // 红方姓名
        BlkPlayer     : S(321, buffer[320]), // 黑方姓名
        TimeRule      : S(337, buffer[336]), // 用时规则
        RedTime       : S(401, buffer[400]), // 红方用时
        BlkTime       : S(417, buffer[416]), // 黑方用时
        RMKWriter     : S(465, buffer[464]), // 棋谱评论员
        Author        : S(481, buffer[480])  // 文件作者
    };
};

// 象棋演播室 XQF 格式密钥计算
vschess.XQF_Key = function(header) {
    var key = {
        F32: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        XYp: 0,
        XYf: 0,
        XYt: 0,
        RMK: 0
    };

    if (header.Version <= 10) {
        return key;
    }

    key.XYp = (header.KeyXYp *       header.KeyXYp  *    54 + 221) * header.KeyXYp &   255;
    key.XYf = (header.KeyXYf *       header.KeyXYf  *    54 + 221) *    key.   XYp &   255;
    key.XYt = (header.KeyXYt *       header.KeyXYt  *    54 + 221) *    key.   XYf &   255;
    key.RMK = (header.KeySum * 256 + header.KeyXYp) % 32000 + 767                  & 65535;

    var FKey = [
        header.KeySum & header.KeyMask | header.KeyOr[0],
        header.KeyXYp & header.KeyMask | header.KeyOr[1],
        header.KeyXYf & header.KeyMask | header.KeyOr[2],
        header.KeyXYt & header.KeyMask | header.KeyOr[3]
    ];

    for (var i = 0; i < 32; ++i) {
        key.F32[i] = FKey[i % 4] & "[(C) Copyright Mr. Dong Shiwei.]".charCodeAt(i);
    }

    return key;
};

// 从象棋演播室 XQF 格式中抽取棋局信息
vschess.binaryToInfo_XQF = function(buffer){
    var header = vschess.XQF_Header(buffer), r = {};

    header.Title    .length && (r.title     = vschess.GBK2UTF8(header.Title    ));
    header.MatchName.length && (r.event     = vschess.GBK2UTF8(header.MatchName));
    header.MatchTime.length && (r.date      = vschess.GBK2UTF8(header.MatchTime));
    header.MatchAddr.length && (r.place     = vschess.GBK2UTF8(header.MatchAddr));
    header.RedPlayer.length && (r.redname   = vschess.GBK2UTF8(header.RedPlayer));
    header.BlkPlayer.length && (r.blackname = vschess.GBK2UTF8(header.BlkPlayer));
    header.RedTime  .length && (r.redtime   = vschess.GBK2UTF8(header.RedTime  ));
    header.BlkTime  .length && (r.blacktime = vschess.GBK2UTF8(header.BlkTime  ));
    header.RMKWriter.length && (r.remark    = vschess.GBK2UTF8(header.RMKWriter));
    header.Author   .length && (r.author    = vschess.GBK2UTF8(header.Author   ));
    header.TimeRule .length && (r.timerule  = vschess.GBK2UTF8(header.TimeRule ));

    switch (header.PlayResult) {
        case  1: r.result = "1-0"; break;
        case  2: r.result = "0-1"; break;
        case  3: r.result = "1/2-1/2"; break;
        default: r.result = "*"; break;
    }

    return r;
};

// 将象棋演播室 XQF 格式转换为棋谱节点树
vschess.binaryToNode_XQF = function(buffer) {
    var XQF_Header = vschess.XQF_Header(buffer    );
    var XQF_Key    = vschess.XQF_Key   (XQF_Header);

    // 计算开局 Fen 串
    var fenArray = new Array(91).join("*").split("");
    var fenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp";

    for (var i = 0; i < 32; ++i) {
        if (XQF_Header.Version > 10) {
            var pieceKey = XQF_Key.XYp + i + 1 & 31;
            var piecePos = XQF_Header.QiziXY[i] - XQF_Key.XYp & 255;
        }
        else {
            var pieceKey = i;
            var piecePos = XQF_Header.QiziXY[i];
        }

        if (piecePos < 90) {
            var X = Math.floor(piecePos / 10);
            var Y = 9 - piecePos % 10;
            fenArray[Y * 9 + X] = fenPiece.charAt(pieceKey);
        }
    }

    fen  = vschess.arrayToFen(fenArray);
    fen +=  XQF_Header.WhoPlay === 1 ? " b - - 0 " : " w - - 0 ";
    fen += (XQF_Header.PlayStepNo >> 1) || 1;

    // 解密数据
    if (XQF_Header.Version > 10) {
        var decode = [];

        for (var i = 1024; i < buffer.length; ++i) {
            decode.push(buffer[i] - XQF_Key.F32[i % 32] & 255);
        }
    }
    else {
        var decode = Array.from(buffer.slice(1024));
    }

    // 求和函数
    var K = function(start, length){
        var array = decode.slice(start, start + length), sum = 0;

        for (var i = 0; i < array.length; ++i) {
            sum += array[i] * Math.pow(256, i);
        }

        return sum;
    };

    // 生成节点树
    var node = { fen: fen, comment: comment, next: [], defaultIndex: 0 };
    var parent = node, changeNode = [];

    for (var pos = 0; pos < decode.length;) {
        // 着法计算
        var Pf = decode[pos    ] - 24 - XQF_Key.XYf & 255;
        var Pt = decode[pos + 1] - 32 - XQF_Key.XYt & 255;
        var Xf = Math.floor(Pf / 10);
        var Xt = Math.floor(Pt / 10);
        var Yf = 9 - Pf % 10;
        var Yt = 9 - Pt % 10;

        // 注释提取
        if (XQF_Header.Version > 10) {
            if (decode[pos + 2] & 32) {
                var commentLen = K(pos + 4, 4) - XQF_Key.RMK;
                var comment = vschess.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
                var nextOffset = commentLen + 8;
            }
            else {
                var comment = "";
                var nextOffset = 4;
            }
        }
        else {
            var commentLen = K(pos + 4, 4);
            var comment = vschess.GBK2UTF8(decode.slice(pos + 8, pos + 8 + commentLen));
            var nextOffset = commentLen + 8;
        }

        // 生成节点树
        if (pos) {
            var move = vschess.b2i[Yf * 9 + Xf] + vschess.b2i[Yt * 9 + Xt];
            var step = { move: move, comment: comment, next: [], defaultIndex: 0 };
            parent.next.push(step);

            var hasNext   = decode[pos + 2] & (XQF_Header.Version > 10 ? 128 : 240);
            var hasChange = decode[pos + 2] & (XQF_Header.Version > 10 ?  64 :  15);

            if (hasNext) {
                hasChange && changeNode.push(parent);
                parent = step;
            }
            else {
                hasChange || (parent = changeNode.pop());
            }
        }
        else {
            node.comment = comment;
        }

        // 指针往前走
        pos += nextOffset;
    }

    // 增强兼容性
    if (node.next.length) {
        var fenArray = vschess.fenToArray(node.fen);
        var fenSplit = node.fen.split(" ");
        var position = vschess.i2b[node.next[0].move.substring(0, 2)];

        if (fenArray[position].toUpperCase() === fenArray[position]) {
            fenSplit[1] = "w";
        }
        else {
            fenSplit[1] = "b";
        }

        node.fen = fenSplit.join(" ");
    }

    return node;
};

// 象棋演播室 XQF 格式写入头部信息的函数
vschess.XQF_writeHeader = function(buffer, Version, KeyMask, KeyOr, KeySum, KeyXYp, KeyXYf, KeyXYt, key, node, chessInfo, mirror){
    // 文件标识
    buffer[0] = 88;
    buffer[1] = 81;
    buffer[2] = Version;
    buffer[3] = KeyMask;

    // KeyOr值
    buffer[8] = KeyOr[0];
    buffer[9] = KeyOr[1];
    buffer[10] = KeyOr[2];
    buffer[11] = KeyOr[3];

    // KeySum和KeyXY值
    buffer[12] = KeySum;
    buffer[13] = KeyXYp;
    buffer[14] = KeyXYf;
    buffer[15] = KeyXYt;

    // 处理 FEN 串，生成 QiziXY 数组
    var fenArray = vschess.fenToArray(mirror ? vschess.turnFen(node.fen) : node.fen);
    var fenPiece = "RNBAKABNRCCPPPPPrnbakabnrccppppp".split("");
    var piecePositions = {};

    for (var i = 0; i < fenArray.length; i++) {
        var piece = fenArray[i];
        var index = fenPiece.indexOf(piece);

        if (~index) {
            var x = i % 9;
            var y = 9 - Math.floor(i / 9);
            var XY = x * 10 + y;
            piecePositions[index] = XY;
            fenPiece[index] = "x";
        }
    }

    // 写入 QiziXY 数组
    for (var i = 0; i < 32; i++) {
        var piecePos = piecePositions[(i + 1) % 32];

        if (typeof piecePos === "undefined") {
            piecePos = 90 + vschess.rand(0, 154);
        }

        buffer[16 + i] = piecePos;
    }

    // 设置 WhoPlay
    buffer[50] = node.fen.split(" ")[1] === 'b' ? 1 : 0;

    // 设置 GameResult
    switch (chessInfo.result) {
        case "1-0": buffer[51] = 1; break;
        case "0-1": buffer[51] = 2; break;
        case "1/2-1/2": buffer[51] = 3; break;
        default: buffer[51] = 0; break;
    }

    var fillText = function(start, text, maxLength){
	    var GBKArray = new Uint8Array(vschess.iconv2GBK(text));
        buffer[start] = Math.min(GBKArray.length, maxLength) & 255;

        for (var i = 0; i < GBKArray.length && i < maxLength; ++i) {
            buffer[start + 1 + i] = GBKArray[i];
        }
    };

    fillText( 80, chessInfo.title     || "", 128);
    fillText(208, chessInfo.event     || "",  64);
    fillText(272, chessInfo.date      || "",  16);
    fillText(288, chessInfo.place     || "",  16);
    fillText(304, chessInfo.redname   || "",  16);
    fillText(320, chessInfo.blackname || "",  16);
    fillText(400, chessInfo.redtime   || "",  16);
    fillText(416, chessInfo.blacktime || "",  16);
    fillText(464, chessInfo.remark    || "",  16);
    fillText(480, chessInfo.author    || "",  16);
};

// 象棋演播室 XQF 格式处理节点的函数
vschess.XQF_processNode = function(node, haveNextSibling, moves, key, mirror){
    // 处理当前节点
    var moveData = [];
    var flag = 0;
    var encodePf, encodePt;

    if (node.move) {
        // 处理着法
        var move = mirror ? vschess.turnMove(node.move) : node.move;
        var from = vschess.i2b[move.substring(0, 2)];
        var to = vschess.i2b[move.substring(2, 4)];

        var Xf = from % 9;
        var Yf = 9 - Math.floor(from / 9);
        var Xt = to % 9;
        var Yt = 9 - Math.floor(to / 9);

        var Pf = Xf * 10 + Yf;
        var Pt = Xt * 10 + Yt;

        // 加密 Pf 和 Pt
        encodePf = (Pf + 24 + key.XYf) & 255;
        encodePt = (Pt + 32 + key.XYt) & 255;
    } else {
        // 根节点
        encodePf = 88;
        encodePt = 81;
    }

    // 设置标志位
    var hasComment = node.comment && node.comment.length > 0;

    if (node.next && node.next.length > 0) {
        flag |= 128; // 有后续着法
    }

    if (haveNextSibling) {
        flag |= 64; // 有变着
    }

    if (hasComment) {
        flag |= 32; // 有注释
    }

    // 组装着法数据
    moveData.push(encodePf);
    moveData.push(encodePt);
    moveData.push(flag);
    moveData.push(0); // 保留字节

    if (hasComment) {
        // 处理注释
        var commentBytes = vschess.iconv2GBK(node.comment);
        var commentLen = commentBytes.length + key.RMK;

        // 添加注释长度
        moveData.push(commentLen       & 255);
        moveData.push(commentLen >>  8 & 255);
        moveData.push(commentLen >> 16 & 255);
        moveData.push(commentLen >> 24 & 255);

        // 添加注释内容
        for (var i = 0; i < commentBytes.length; ++i) {
            moveData.push(commentBytes[i]);
        }
    }

    // 加密着法数据
    var pos = moves.length + 1024;

    for (var i = 0; i < moveData.length; ++i) {
        var keyByte = key.F32[pos % 32];
        var b = (moveData[i] + keyByte) & 255;
        moves.push(b);
        ++pos;
    }

    // 递归处理子节点
    if (node.next) {
        for (var i = 0; i < node.next.length; ++i) {
            var haveNextSibling = i < node.next.length - 1;
            vschess.XQF_processNode(node.next[i], haveNextSibling, moves, key, mirror);
        }
    }
};

// 将棋谱节点树转换为象棋演播室 XQF 格式
vschess.nodeToBinary_XQF = function(node, chessInfo, mirror){
    // 设置版本号和密钥相关参数
    var Version = 18;
    var KeyMask = vschess.rand(1, 255);
    var KeyOr = [vschess.rand(0, 255), vschess.rand(0, 255), vschess.rand(0, 255)];
    KeyOr[3] = 256 - KeyOr[0] - KeyOr[1] - KeyOr[2] & 255;

    var KeySum = 0;
    var KeyXYp = 0;
    var KeyXYf = 0;
    var KeyXYt = 0;

    // 计算密钥
    var key = vschess.XQF_Key({
        KeySum: KeySum,
        KeyXYp: KeyXYp,
        KeyXYf: KeyXYf,
        KeyXYt: KeyXYt,
        KeyMask: KeyMask,
        KeyOr: KeyOr
    });

    // 头部信息
    var buffer = new Uint8Array(1024);
    buffer.fill(0, 0, 1024);
    vschess.XQF_writeHeader(buffer, Version, KeyMask, KeyOr, KeySum, KeyXYp, KeyXYf, KeyXYt, key, node, chessInfo, mirror);

    // 处理节点树
    var moves = [];
    vschess.XQF_processNode(node, false, moves, key, mirror);

    // 最终棋谱
    var finalBuffer = new Uint8Array(1024 + moves.length);
    finalBuffer.set(buffer, 0);
    finalBuffer.set(moves, 1024);
    return finalBuffer;
};

// Zobrist 编码表
vschess.ZobristTable = (function () {
    var table = [66, '02010d007b4765f9', '171880531b8d5860', '957a1458a42becec', 6, 'd4a088b2e2591ccb', 'f9260f515c7bec95', '54051e52de03c1b2', 6, 'bb8cb47e59282224', '2d67375e4ccd7677', 'abba445d0e5e56a6', 69, 'ee8344c1e19954c4', 1, 'c448cf344c71909f', 7, 'c44047e6f7a8ff33', 7, '1603571cdc91c8de', 1, '9331def3087dff1e', 50, '64bf6640836f6037', 3, '2548d6fbdc1f80aa', 11, '21825ec968846814', 3, '06f79b8c40333b69', 3, '752be6837f80f5d4', 11, '3d85ff2aa5a61469', 3, '0cd680125ea617ed', 2, 'a5dff339327e7078', 'ab400c1dfe73b366', '5cf50f5d2b5c7d0b', '1c23c7a2e0de9575', '9310bfd66b61b5d1', '25489c041d6b07f6', '0c54ea7b8eb75e36', 'aa206c84fce12cdc', '603c2e6f4abef76e', 'a7950be44ce5c030', 'bf19f45cbe7877d3', '690b31994f8258da', '20f1dcb78c3ca5ee', 'f9b677558d274c3c', '35155a33f117aa34', '0463f288d157c25a', '4c8440eb5956efbc', '7debb4777a74e13f', '3b89fe2c397d1e0e', '79c03729d4807dc2', '76640b24d075993b', 'cc3030cd961231c8', 'f33f066ef548ba59', 'e650f745d76565e1', '4e7045d3c7a72acf', '2ae92f5d43121c73', '8c11d8cbf6e4a584', '3d8e6e8510a0a07e', '57242239dabe7fbd', 'df24cee742476222', '132143633cb53b74', '85ecc54bb9aa82e7', 'd2b73d12226ee596', 'f5e0f118147d9c5a', '60ebe31c90919002', '6182d88ac7fb104a', '7ffaa7b53bcd7d2d', 'f01fa550ea050e8d', 'dd3a7a97c727f8c5', '202ff086161c35a2', '63098f64c3519be0', '8b6b9080fcee6e2c', '8e64f0e0bad3b0ff', 'fdd124fbd9f47baa', 'fc9a8120eac4f4de', 'bdaf0ed0fd9f5909', 'f474564301c7213b', 'cc5a0abdd7671398', '0ceed4d537de1343', '58e79783d661be84', '82f9b58a523eeebd', '25f38588e5c2e805', '0e855f5ce0f874eb', 'e53d644bd96dfdcd', 'dc13773e39d2983e', 'd4cbd4f4f016a510', 'ec00ceb009762a51', 'bc18717e5f315789', '44e0fbc21a20374e', '77553337365a10a0', '46cbe73bf081f5ef', '879d223238fb8588', '2ed76c189342fce4', 'ad1836b1bd44ae3a', '2cb78f5a79a68d95', '9173fc9659e5c5e5', '538f503fd8ec25e5', 'e557d988a0f0b5fc', 'dbd9b79f0ddbc770', '197539f52e6a1483', 'af5546fdeefdbb80', '7a5ccee4a4b0bb30', 'f135393105f16da9', '7cb14577c1c96493', '29c08567b365d088', 'f65e476829855207', '2bb66190b0589d8b', '334afbeab5fde105', '06be417fb2f4d2c6', '579274d2719cb915', 'a849635cef43c8fe', '896a95118af5d879', '541aad61b2715a13', 'ebbba8eb36c6e5b0', 'aeb7fdd53512efe0', 'be6eabe388fbd437', '39d468522c9a1578', '59be957699b964fc', 'c7e10451f916c4c7', '9aa1b47ef1a7cddb', '0528606a6938c6f8', 'ca8a26e21869ea39', '58af39057db7692a', 'd7c175677159d07a', '854c2f005e2b90b1', 'dfdee7c57f42e59d', '6d6cd4aa8fc3284a', '15e714de3f2e60bf', 'bdb8cbb3422ce24b', '35e628d027f9981f', '77eaf786de54a30c', 'b7d723a05c7364eb', '2a4ea8bccab707f3', '529f0276deccc6df', 'c20d1474776fc285', 'f3262f5b88cbc9d3', '41486c06694d6583', '87c1db3f8a5fb573', 'f5a587a5c5b2043c', 'd7f2157e386b33f1', '2053c57ef8051a8d', '123616777af47fdd', 'd2b6bd9bbb110690', '5a242d096ee6306c', 'c30eca7eb20b31fe', 'b9350cddcb9a222f', '4743806c451489e0', '38b686616cbe95bb', '5510ef7c6ae03b73', 'd8ca5e88067d4205', 'a73a67157a66bea9', 'dc556d97bade0680', '285fcc5c81c07deb', '0d0dafceb059b98d', '63c97ba69693b7c2', 'db91fd578c381f9d', '99f174c7989c764a', 'a6a176457885ae59', '27a7b9734c0bb489', 'f6465fa4d905bb07', '214522e4393870ad', 'b463885664b813dc', '295218d708b04e88', '8aca5a337c579b7e', '1b89446e2ed73df8', '1cb65ced9de73ed5', '4ae4e0ad8ace67ae', '65213fc823013c8e', '1b6c45c466676be9', '9058254aac43b254', 'a73b15ef0d298557', '6a52e2f2e8274433', '15a42be5d8a526e4', 'c78dac6d791d037f', '6eed5739325c478a', 'c1054f9959ccb8b9', 'dd33addd43ce65c8', '0be6e3a219c1d87f', 'e768a7e3ed454bf2', '755a0d2ed90d9fb4', '1ecf834debf6a312', '136bb9b0d8daa7b5', 'bb8b44627c57b5fd', '7b067e5f34d777d5', 'b313f1fd14337904', 'e1a4a6da4d03cd2d', 'f0190bfc79ec283b', '05589d19c0a0a143', 'b89bed2df7007a8e', '83cf1ae2e97778ec', 'b4dd761623f66ff1', 'b0f607aa96f29280', 'e9f9e364f5549663', 'a00aa8dc87541658', 'cc00e8b64b51f0f1', 'dd8d3e21055d32cd', 'bc122aa51ddbc945', '0a4480148e3a87be', '06a06a7d3621a8c4', 'f65e21280296e5da', 'a0ca51f33c7a9d55', 'b547e19fbcf21922', '35caeb4c4722a4be', 'df9dc0388188808a', 'c0f609ee9a2a9027', 'b2879d8f7799de34', 'ecff7f1ae697a35b', 'e6dae6b82f8ebae0', 'd9fa6c8906fa93f1', '358c13397d9c7209', 'a7e99ca0834575eb', '2872a3e753893af0', '85f5d2fa9d3491dd', 'd501ae14f28e9b02', 'bc4856ff58678145', 'c1bbc557f7e4b967', 'f8994976f7111e32', 'da380e3058d58a66', '51bde09c572cd41c', '0fcfda00a2df7582', '78fa613231dab129', '454fbd346706e28f', '6fededeaf06c2a7c', 'fa681fad3c63d436', '99eb68c5cf1229fa', '2b1ce20b9f018221', '83373a5a2f1e120f', 'c44066ec845cdd9c', '0b79baa4ce38dcde', '70026e9382805605', '0e100ea5adb68272', '971e938a1d90ff77', 'e32ed01d314b227a', '147df51df231631b', '8801c04653b12f00', '714b6fd7487cdfaf', '493daa3229d74f30', '67b74d0281aeaa6d', 'a67c5bbfb3abac0c', '035c54358954bd7c', '74d61070ac52a463', '6dde8a787103d6ce', 'c82ef638075bd765', '63aeeae23bf85195', 'b5116be9af6fd846', '8889b1897387dce4', '07e0a5df0abd7bda', '9241ba7af22f8c09', 'b821659be01100e1', '087f12ace6a913f1', '2cc154384890cf2e', '332212fd0d4c93b0', '1ad3986a5eceabe5', '42cde963f0153516', '71809460427bc207', 'b7d6144f90015e15', 'd0140299117f3504', '4114b95f6e3cab17', '60ac28dcd62a4913', '0f296a2620172cd8', '04e31164c35e4f15', 'e466c33a2b4de535', '5c6d64a8002c13a0', 'dd066e73f4df1124', '4dff95b959371d49', 'fd9d55ff33ac5c45', '16b318d74e485bd3', 'a518062f2c0ccefa', 'd370f45ac2dba449', 'b8655a77918b7aed', '23a7bd7c80ad5a0a', 'eb849fa8a71305a5', '8f8793d12dfe840a', '7d4d49d1973b14e3', '836ee4a0f1693d56', '6741d42b00c3c409', 'd0a54661e926d116', '68f9fa3fe742cd3e', 'ee04be4df06e52d1', '2a1d652db6466c28', '0b5005e765c8a126', '3af7e4d59e46cbc4', '2737469dac0a7f91', '2f02708242092a01', 'a8cdf652345ff5ef', 'fb5eb1c305ef2b18', '822e768eb6d0f2b3', '0584b80f51416c9a', '39973817a390d296', 'c2b47076deea9063', 'd0d3a22e8b43e0a0', '2dbdcc72f2c0c73f', '4cb9b1b8637d9a4d', '0b2c99130ded34f9', '247681315a7c78f2', '0680cb501629e2e6', 'd810f1f4c5df4862', 'b62be7d66825e997', '3e3e69f9beb821de', '241f00d917a2522c', '70233bdbc8a3cd53', 'bef9c72d97d3358a', '06c9113cd1d3c725', '1de455ab8c7d850f', '2a04cbd36215d78d', 'e4df38bb6f501356', 'dfda3cdfcca10fee', 'c1139c7bf1d6b9d1', '2e4b812a51be9ce2', '1751f3760596a859', 'bc48755ea10b322a', '13749255773c21c8', 'fbcfd042255a9d89', 'd311a2f86decc442', 'a6b03b285ffef093', '9e481e985bf9bb42', '0c504fe712c8855e', '5567ab7ef06c29b9', '4f064b289b11f7f4', '5bf1466a1abf73fc', '2198da99798a20ec', '64e98c05a5e6c094', '46a771f3dff7de19', '0f5e138349460def', '8f495b2af499f1d7', '7d2c3c49a1b964f2', '74004a1cad2b4573', 'ec907668d770ae92', '25662b041d21618a', '80dac3f052ce2487', '75f42374fa78fca0', '2c882fee641ac3d0', '9c249ea4db410203', 'fbc4b652bf58b471', '3ec3f7e58325818e', '7a69e92045e9181f', 'bbc86efb9a305ddf', 'bd0075f17f04379d', '70a7d3114b38adce', '50da4d9da706d05f', '677e1761b95b0763', 'f1a71474deaafda8', '34e9a39a852f1916', '5fdc168d9d2d5873', '208044f7adb25109', '910e48f65bed86c9', 1, '6234cb83811aaf35', 1, 'b75b3a16b9dcfe11', 1, 'a62f3a5e37361b0b', 1, '37a7de5f54b2f6be', '5b4a46be7664697c', 1, '8a7ee39e70e45c72', 1, 'faf9b526a2e49055', 1, '775449c8b6a66ad5', 1, '9ccc4e653037370b', 30, '9c69702b27269ea0', 'd081c17c4335e389', '534905ef8d860369', 6, 'b7f433c21183711a', '0e9ba058fb67e701', 'f25b8f9bd234a650', 6, '659703ea7bf6d335', 'df20971f4f15896b', '34c4cc39dc2540e6', 69, '5a912193aa89f7b4', 1, '06f970f53a8599a0', 7, '6f064bce2cd50c74', 7, 'b3271f3807c1475a', 1, 'aeb2034152ce0c01', 68, '028d8dd17e7d5272', 3, 'd217f6c8f2dcec1a', 11, '8fff55d26b87f7ef', 3, 'd7143b758ea86f2c', 3, 'bcfb76ba7e946df7', 11, '6e85ab3fe77b980a', 3, '3aa6d2d969dcdfa1', 47, '6fbe86fb2f51ff7a', 'a74722d0a49e02de', '7592c54797a4da0a', '9dc7f91f8b7da86a', '6c7bef750341e9b5', '162dd072e0e3787a', 'bdaaeca5d174ed26', '3dea97632f5f7126', '0dd707d3d3bb657f', 'd54f7bfebea90a3d', '27f19f19d2717316', 'dac56a5b50656e71', '81f00d38b1594ee5', 'f67cfcf79b851f77', '52c4615c0093825f', 'c301e36df36e680f', '705e1e54abf7d645', 'f09926b9f55c81b3', 'de6de46a59a83cd5', '5a5e094da95f82c1', '31b8d66ae62bfc9b', '0cee700e60839431', '2a8ec2a02f1cc99b', '481ffc438b7daaa4', '0bb429df90cef779', 'fa989ccd422e87a9', 'fee01738cc30c80b', '326a27b396abd9b0', 'bffe7620299c2868', 'ec11f75d1b08347b', '2585c01fed5396be', 'e273ab9831ecd6df', '7d7be20119bb97e1', 'c2a8d7b69a6e6c28', 'c1b6ed0ffe81be56', 'caffb96dde233093', 'ef1c539f9d30427a', 'e72c5c5551f930d4', '2b3de5e93f2be746', '17a0987ac3c0653e', 'e2f5a6586af9293f', '517c2e7d5c078aef', '6b0ed47de1452c22', 'fe7da6edef0f078c', '3ed43dc626403a9a', '9ae45043add1c820', '552958c207e9cf0e', '62721996f8e65773', 'ce5174bd8f5f8ea1', '0de6f8aabc6765fa', '942c1cb043bceee7', '125d6b909e6c82ac', '975963c9cb96d4cb', '1dc1d8ff5cb53cac', '26aa74052a4d7ad1', 'a01f124a7f7fac5e', 'd8ab7cbccca788b4', '5dd31516e3683219', '242193a82b7bc58b', 'c0ff6aa2aad4e923', '3253c01a7b1cf04b', 'ca5ee2961d758bd5', '46b498263eceb496', '5fded798dd7f79f7', '791f1de2636e784f', 'daaf0082a5021001', 'dd88224462b00f16', 'f787a7b9e89a63af', '68d1dd6bfbeae93a', '22f8e11618ae7ac4', '774aabd4a7ab16ab', '8620949856f81764', '12798a048363c441', '4623228e3d0778a8', 'bd0a10df9aa4e38d', '51fb319467ae954a', '5d03789917478f65', '0be6e534da38b907', '1c9c1d4f5899fd1c', 'c98155980ed5738d', 'a8020802c4bea165', '1afaa49d1117879c', 'ac0cfd625c3d1974', 'be11889afc60aacd', 'd6dee8e56c7a74a5', '1e86f14f16289ae8', '33ea2135c9998ca1', '79d4576124777797', 'c20f8782413344fe', '79dce062c4cf2625', '8152a14f454a5125', '7ee6c15beeba3eec', '3624650aededfe35', '16d72743790ea00a', '19fb10721229ec81', '85b1aceb6a41611d', 'df524520064efa06', '677aaa8b5d222d66', '130f0e9ac2271108', '2ecc0acd207a9858', 'ac7803cb23f3a28b', 'ea48f53d74c4a58e', '431e7d5c8a69c486', '11890aabe8c8ad06', 'ae09a61387f214ac', '7c33bd4baa305554', '334bb3febce49b68', 'c70ad3c513c63193', '54953487341b542f', '7fa576e8e070fc2c', '90401c5f98a95bf9', '0d25ed973d7b8ce2', 'cb09fd1fb002d3bd', '7ba0863e1d849e2b', '4ca22a556600c773', '3f6df49cc12ce3c1', '738d31dc605ee312', 'f27deaf2e887bb19', '8860b0694e63a65a', '962ef558bdabe56a', '7e307f71209b9b8f', 'e0bfc7f6cdbd8364', '8c321f42cd134833', 'a00500f82c987528', '8b7ddfa8d0798372', 'f36a6dfdbfde1193', 'dede80d5373d22c3', '43838810d69fd1dc', '3a02c5df95fd2717', 'a4a856f899bf833f', '67f4ceaabafdd1f8', '54e1be0a1158779b', 'ce0b65bf10ef9877', '4ac045f452e94bbc', '18fe7d967f50b061', 'b8970343b2d85018', '64cf7bb3889695bc', 'cb70b27c29edf774', 'ae2078cc0e7ed6e3', '02fb0c044be718b6', '7c3b0e8c25ad3b7d', '18ac41058e1f50a7', '6e21b9e1da39f220', 'b02d9a63e8e30a0a', '790fcda30f14c748', '50ee1335c25bff43', '8df5d284dfedee37', '71532e198c0eb9ab', '832cc61cf7be441a', '8431dfd16e0e5d33', 'ce26f2f74f5ff23b', '1e36d36389caa05e', '9063d6730be1105b', 'e638bda968cf9bbe', 'c771048bd8a021fa', 'dad72421848e3455', '3823689faf46ef08', 'daebe25de0e823e2', '042187f1df14f055', '4b02678ef80956f9', '453c53fbfe998478', '8e95702144b82c60', 'c489e75b4e054027', '3cd217b9feb7a7a9', '0321e049527f5402', 'f99ba6ac4c9ceaac', 'afa2b9809ce8bb0b', '82ce0815e5fbe2bc', 'dc0dca97eb94ade6', '29168abcf745e0af', '5f3e461c04f38e68', '0903890e45d25671', '4472aad46e94e05b', '61ab4ec37a9108b4', 'c3ee971e1827e088', 'ebc32b8dfc648fd1', 'a062d075d09d0c81', 'c0603bad959a4b46', 'a5527848fc0c9b83', 'e862cb609b417dff', 'e45f36a8b694ab45', '9b24fe28320004df', '3642811b09588ef4', 'd788dc4fef59972f', '0a3a96442083b501', '227c1734a268afe3', '290e5437196ae2ba', 'ef952aacba3f4f69', '6ccfb906c6257385', 'b1e139e09a1e5be6', '6f3d0afd812024e4', '3678d3ac8ec5fe3e', '468f22a9a2b46aab', '7975967539fdfd49', '3a3560dc389ae61e', '6c99f906b7b4a36e', '2963c8e15bab0750', 'ce24f1b554416568', '1474da2902df8dfd', 'd4cb5b4555abd17c', '4093dd219148d1ea', '523ffe88f02e2717', '9a859ef4595b5d94', 'fba7de89b355e9d7', 'cbe4a7e7ea74bd42', 'b40dade54c85679d', '3d02faa4c31f0f0e', 'e46a08f72b35ebf6', '8a4185b3c3d5c92f', '9f38656156f1e1ed', '065d806b601df2e5', '382c64ead6812c9e', 'db0eb3157eb4a9a8', 'bad5f2966684a8fc', '99af45facd4bb152', '6cbd9df2bcabd086', 'f0993e0f9e9c3f7f', 'faf9230d5e7020c7', '8cd41f2333f1277b', '73d2955f527964c5', '283480d1dc743465', '940dbc679f722e6b', '759c7a9d40dc74a0', 'c80d7af3e01cf9b0', '4831360b9ff3911b', '10624b8841b04184', 'b93412265eedd34e', '659bdbee52978d0a', 'bab1cb0366d793a9', '3d6fc272f1588226', '93b07778dae82b37', '52afa557f6939375', '7a94983330b73a38', '93c1c1ad49228f5b', '05ad91c65a2dea33', '581b9be28d61520b', '798ca01a3b55be4e', 'c435d385a46fa6c1', '39b884e6fe73365e', '826a84511f118d67', '94ce8ff134e42dfe', 'a4594eaa7c79e0ab', '2f5bb7e4d9863113', 'aeeaf37ed6f1c0f8', '65c19736a87c9488', '2e6bd6cd9cbc783d', 'dcc129a42217657f', 'fff0a2971827d4c9', 'ee17ca08aa888c93', 'ad004364a1267202', '5a1858dc3a625f09', 'c872bc0fbf8a5350', 'c912a9b717f8ac80', '751f6d26cd92a88e', 'a1c66600137b590b', 'ddde94adae44c793', '3602893cc5fb9465', '53fbbac7f4883a94', 'dc93e87d60d1e284', 'bc365eda830fbb94', '5c0331dabeba9a60', '31a4f7c4765f42b9', '1816fcc720964226', '5af18278f263302e', 'e8408c7fb70f04ef', 'e6e00de18a92af6e', '5ac1d7c694ea9384', '5720bbd6e17f27ca', 'c0bfda4838c0a0cd', '8891314377c5c1ce', 27, '2a2ed5c026b5bc48', 1, 'c92e7b76eed97a04', 1, 'cab996739436a28c', 1, '051b2091d03357a3', 1, '18f95d4c5c8b3d6d', '664c7f4f1b4d68b0', 1, '15b1e5b3a106b873', 1, '25b4b0ce175ca086', 1, '53c20718b90a909d', 1, 'ae6c7b25d0282cc9', 'b4461d12225a6c64', '3c572019f2ee97c4', '42f349edbae36833', '0e05cf63c06ad4f3', 'af450ff674bc724a', 'f48c5b768b6d4e16', 'c2678c86dfca1b17', 'c6b1c2bd370e3d15', 'aa7e82db85741ca1', 'ee83d46e93993392', '8fa7b0500890b4b7', 'bd70197c26dfc8f9', '607ae95a948a095b', '19c4a4058799ec55', 'c5a9fc21e5df09c0', 'b84aab0833ab7396', '76c6586a1d825cbb', 'f59bf07bafbce6c0', 'bbf5cd196fe639a6', '3e1079e27b02dffb', 'a76cec86758c2bb9', 'b5616951a3210279', '4895fc655659c663', '10b487b086474df6', '5af2a8975c049bde', 'bfdefe754304b65e', '45b88c628f6ddc35', '02140517e93e594e', 'f90b46d491978b57', '8af75603e59942a8', 'f8c3ff97b4a6bbfe', '0222dbce5a80eb73', '696fc14aaddf5091', '002eab000050eaf6', '9ce095f19a33943d', '80509f3e3a14154b', 'a6dec4bf6abd9c76', '30f9b73ada41ced5', '8be437bb6bd7f13c', '4dd52d0a7130f1da', '21dd6c4a48b349bf', '4d075b28be81b1ab', '2015abdd10265d21', '2e57d1809f4e64da', '7c68260b225bc190'];
    var zobristTable = [];

    for (var i = 0; i < table.length; ++i) {
        if (typeof table[i] === "number") {
            zobristTable.length += table[i];
        }
        else {
            var nums = [];

            for (var j = 0; j < 16; ++j) {
                nums.push(parseInt(table[i][j], 16));
            }

            zobristTable.push(nums);
        }
    }

    return zobristTable;
})();

// Zobrist 棋子编号
vschess.ZobristPiece = { R: 4, N: 3, B: 2, A: 1, K: 0, C: 5, P: 6, r: 11, n: 10, b: 9, a: 8, k: 7, c: 12, p: 13 };

// Zobrist 局面码-红方 a0ce2af90c452f58
vschess.ZobristRed = [10, 0, 12, 14, 2, 10, 15, 9, 0, 12, 4, 5, 2, 15, 5, 8];

// Zobrist 局面码-黑方 0000000000000000
vschess.ZobristBlack = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// 计算 ZobristKey
vschess.ZobristKey = function (fen) {
    var fenArray = vschess.fenToArray(fen);
    var zobristKey = vschess.fenIsB(fen) ? vschess.ZobristBlack.slice(0) : vschess.ZobristRed.slice(0);

    for (var i = 0; i < 90; ++i) {
        if (fenArray[i] === '*') {
            continue;
        }

        var K = vschess.ZobristPiece[fenArray[i]] * 90 + i;

        for (var j = 0; j < 16; ++j) {
            zobristKey[j] ^= vschess.ZobristTable[K][j];
        }
    }

    for (var i = 0; i < 16; ++i) {
        zobristKey[i] = zobristKey[i].toString(16);
    }

    return zobristKey.join('');
};

// 检查指定局面号下指定位置是否为红方棋子
vschess.load.prototype.isR = function(index, step){
	step  = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 === 1;
};

// 检查指定局面号下指定位置是否为黑方棋子
vschess.load.prototype.isB = function(index, step){
	step  = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 === 2;
};

// 检查指定局面号下指定位置是否无棋子
vschess.load.prototype.isN = function(index, step){
	step  = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] === 1;
};

// 检查指定局面号下指定位置是否为己方棋子
vschess.load.prototype.isPlayer = function(index, step){
	step  = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 === this.situationList[step][0];
};

// 检查指定局面号下指定位置是否为敌方棋子
vschess.load.prototype.isEnermy = function(index, step){
	step  = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	index = vschess.turn[this.getTurn()][vschess.limit(index, 0, 89)];
	return this.situationList[step][vschess.b2s[index]] >> 4 === 3 - this.situationList[step][0];
};

// 获取指定起始棋子的所有合法目标坐标
vschess.load.prototype.getLegalByStartPieceIndex = function(startIndex){
	startIndex = vschess.b2s[vschess.turn[this.getTurn()][vschess.limit(startIndex, 0, 89)]];
	var legalList = [];

	for (var i = 0; i < this.legalList.length; ++i) {
		var targetIndex = vschess.turn[this.getTurn()][vschess.s2b[this.legalList[i][1]]];
		this.legalList[i][0] === startIndex && legalList.push(targetIndex);
	}

	return legalList;
};

// 将棋盘上的棋子移除，-1 表示动画棋子
vschess.load.prototype.clearPiece = function(index){
	var className =  "vschess-piece-R vschess-piece-N vschess-piece-B vschess-piece-A vschess-piece-K vschess-piece-C vschess-piece-P";
	className	 += " vschess-piece-r vschess-piece-n vschess-piece-b vschess-piece-a vschess-piece-k vschess-piece-c vschess-piece-p";

	if (typeof index === "undefined") {
		this.piece.removeClass(className);
	}
	else if (~index) {
		this.piece.eq(vschess.limit(index, 0, 89)).removeClass(className);
	}
	else {
		this.animatePiece.removeClass(className);
	}

	return this;
};

// 将棋盘上的选择状态移除，-1 表示动画棋子
vschess.load.prototype.clearSelect = function(index){
	if (typeof index === "undefined") {
		this.piece.removeClass("vschess-piece-S vschess-piece-s");
		this.setCurrentSelect(-1);
	}
	else if (~index) {
		this.piece.eq(vschess.limit(index, 0, 89)).removeClass("vschess-piece-S vschess-piece-s");
	}
	else {
		this.animatePiece.removeClass("vschess-piece-S vschess-piece-s");
	}

	return this;
};

// 将棋盘上的棋子及选择状态移除，-1 表示动画棋子
vschess.load.prototype.clearBoard = function(index){
	this.clearPiece(index);
	this.clearSelect(index);
	return this;
};

// 创建棋谱注解区域
vschess.load.prototype.createComment = function(){
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
vschess.load.prototype.setCommentByStep = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	this.commentTextarea.val(this.commentList[step]);
	vschess.placeholder || (this.commentList[step] ?  this.commentTextareaPlaceholder.hide() : this.commentTextareaPlaceholder.show());
	return this;
};

// 创建棋谱注解区域空白提示
vschess.load.prototype.createCommentPlaceholder = function(){
	if (vschess.placeholder) {
		this.commentTextarea.attr({ "placeholder": "\u8fd9\u91cc\u53ef\u4ee5\u586b\u5199\u6ce8\u89e3" });
		return this;
	}

	var _this = this, commentMonitor;
	this.commentTextareaPlaceholder = $('<div class="vschess-tab-body-comment-textarea-placeholder">\u8fd9\u91cc\u53ef\u4ee5\u586b\u5199\u6ce8\u89e3</div>');
	this.commentArea.append(this.commentTextareaPlaceholder);
	this.commentTextarea.bind("focus", function(){ commentMonitor = setInterval(function(){ _this.commentTextarea.val() ? _this.commentTextareaPlaceholder.hide() : _this.commentTextareaPlaceholder.show(); }, 20); });
	this.commentTextarea.bind("blur" , function(){ clearInterval(commentMonitor); });
	return this;
};

// 修改当前节点树下指定局面号的注解
vschess.load.prototype.editCommentByStep = function(comment, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	this.selectDefault(step).comment = comment;
	this.commentList[step] = comment;
	this.refreshMoveListNode();
	this.setCommentByStep();
	this.rebuildExportAll();
	this.setExportFormat();
	return this;
};

// 创建棋盘选项区域
vschess.load.prototype.createConfig = function(){
	var _this = this;
    this.configTitle = $('<div class="vschess-tab-title vschess-tab-title-config">' + this.options.tagName.config + '</div>');
	this.configArea  = $('<div class="vschess-tab-body vschess-tab-body-config"></div>');
	this.tabArea.children(".vschess-tab-title-config, .vschess-tab-body-config").remove();
	this.tabArea.append(this.configTitle);
	this.tabArea.append(this.configArea );
	this.configTitle.bind(this.options.click, function(){ _this.showTab("config"); });
	this.createConfigSwitch();
	return this;
};

// 创建棋盘选项开关列表
vschess.load.prototype.createConfigSwitch = function(){
	var _this = this;
	this.configSwitchList = $('<ul class="vschess-tab-body-config-list"></ul>');
	this.configArea.append(this.configSwitchList);
	this.configItem   = {};
	this.configItemM  = {};
	this.configValue  = {};
	this.configRange  = {};
	this.configSelect = {};

	this.addConfigItem("turnX", "\u5de6\u53f3\u7ffb\u8f6c", "boolean", true, "", function(){
		_this.setTurn(_this.configValue["turnY"] * 2 + _this.configValue["turnX"], 1);
	});

	this.addConfigItem("turnY", "\u4e0a\u4e0b\u7ffb\u8f6c", "boolean", true, "", function(){
		_this.setTurn(_this.configValue["turnY"] * 2 + _this.configValue["turnX"], 1);
	});

	this.addConfigItem("moveTips", "\u8d70\u5b50\u63d0\u793a", "boolean", true, "", function(){
		_this._.moveTips = _this.configValue["moveTips"];
	});

	this.addConfigItem("sound", "\u8d70\u5b50\u97f3\u6548", "boolean", true, "", function(){
		_this._.sound = _this.configValue["sound"];
	});

	this.addConfigItem("speakMove", "\u7740\u6cd5\u6717\u8bfb", "boolean", false, "", function(){
		_this._.speakMove = _this.configValue["speakMove"];
	});

	this.addConfigItem("saveTips", "\u4fdd\u5b58\u63d0\u793a", "boolean", true, "", function(){
		_this._.saveTips = _this.configValue["saveTips"];
	});

	this.addConfigItem("pieceRotate", "\u68cb\u5b50\u65cb\u8f6c", "boolean", true, "", function(){
		_this._.pieceRotate = _this.configValue["pieceRotate"];
		_this.setBoardByStep();
	});

	this.addConfigItem("banRepeatLongThreat", "\u7981\u6b62\u957f\u6253", "boolean", true, "", function(){
		_this._.banRepeatLongThreat = _this.configValue["banRepeatLongThreat"];
	});

	this.addConfigItem("banRepeatLongKill", "\u7981\u6b62\u4e00\u5c06\u4e00\u6740" , "boolean", true, "", function(){
		_this._.banRepeatLongKill = _this.configValue["banRepeatLongKill"];
		_this.repeatLongKillMoveList = _this._.banRepeatLongKill ? _this.getRepeatLongKillMove() : [];
	});

	this.addConfigItem("illegalTips", "\u8fdd\u4f8b\u63d0\u793a", "boolean", true, "", function(){
		_this._.illegalTips = _this.configValue["illegalTips"];
	});

	this.addConfigItem("playGap", "\u64ad\u653e\u95f4\u9694", "select" , 5, "0.1\u79d2:1,0.2\u79d2:2,0.5\u79d2:5,1\u79d2:10,2\u79d2:20,5\u79d2:50", function(){
		_this._.playGap = _this.configValue["playGap"];
	});

	this.addConfigItem("volume", "\u97f3\u6548\u97f3\u91cf", "range", 100, "0,100", function(){
		_this._.volume = _this.configValue["volume"];
	});

	return this;
};

// 添加棋盘选项开关
vschess.load.prototype.addConfigItem = function(name, text, type, defaultValue, param, action){
	var _this = this;
	this.configItem [name] = $('<li class="vschess-tab-body-config-item vschess-tab-body-config-item-' + name + '">' + text + '</li>');
	this.configValue[name] = defaultValue;

	if (type === "boolean") {
		this.configItemM[name] = $('<div class="vschess-tab-body-config-item-boolean"><span></span></div>');
		this.configItemM[name].bind(this.options.click, function(){ _this.setConfigItemValue(name, !_this.configValue[name]); typeof action === "function" && action(); });
		this.configValue[name] || this.configItemM[name].addClass("vschess-tab-body-config-item-boolean-false");
	}
	else if (type === "select") {
		var selectList = param.split(",");
		this.configSelect[name] = { item: [] };
		this.configItemM [name] = $('<select class="vschess-tab-body-config-item-select"></select>');

		for (var i = 0; i < selectList.length; ++i) {
			var _name  = selectList[i].split(":")[0];
			var _value = selectList[i].split(":")[1];
			this.configSelect[name].item.push({ name: _name, value: _value });
			this.configItemM [name].append('<option value="' + _value + '">' + _name + '</option>');
		}

		this.configItemM[name].bind("change", function(){ _this.setConfigItemValue(name, this.value); typeof action === "function" && action(); });
	}
	else if (type === "range") {
		var min = +param.split(",")[0];
		var max = +param.split(",")[1];
		var startX = 0, drag = false;
		var k = (defaultValue - min) * 100 / (max - min);

		this.configItemM[name] = $('<div class="vschess-tab-body-config-item-range"></div>');
		this.configRange[name] = { bar: $('<div class="vschess-tab-body-config-item-range-bar"></div>'), k: k, min: min, max: max };
		this.configItemM[name].append(this.configRange[name].bar);
		this.configRange[name].bar.css({ left: k });

		this.configRange[name].bar.bind("mousedown touchstart", function(e){
			startX = e.type === "mousedown" ? e.pageX : e.touches[0].pageX;
			drag = true;
		});

		$(document).bind("mousemove touchmove", function(e){
			if (!drag) {
				return true;
			}

			var X = e.type === "mousemove" ? e.pageX : e.touches[0].pageX;
			var deltaX = X - startX;
			var K = _this.configRange[name].k + deltaX;
			K > 100 && (K = 100);
			K <   0 && (K =   0);
			_this.configRange[name].bar.css({ left: K });
			_this.setConfigItemValue(name, K);
			typeof action === "function" && action();
			return false;
		});

		$(document).bind("mouseup touchend", function(e){
			if (!drag) {
				return true;
			}

			var X = e.type === "mouseup" ? e.pageX : e.changedTouches[0].pageX;
			var deltaX = X - startX;
			var K = _this.configRange[name].k + deltaX;
			K > 100 && (K = 100);
			K <   0 && (K =   0);
			_this.configRange[name].k = K;
			_this.configRange[name].bar.css({ left: K });
			_this.setConfigItemValue(name, K);
			typeof action === "function" && action();
			drag = false;
		});
	}

	this.configItem [name].append(this.configItemM[name]);
	this.configSwitchList .append(this.configItem[name]);
	return this;
};

// 设置棋盘选项开关
vschess.load.prototype.setConfigItemValue = function(name, value){
	if (this.configRange[name]) {
		this.configValue[name] = this.configRange[name].min + (this.configRange[name].max - this.configRange[name].min) * value / 100;
		this.configRange[name].bar.css({ left: value });
	}
	else if (this.configSelect[name]) {
		this.configValue[name] = value;

		for (var i = 0; i < this.configSelect[name].item.length; ++i) {
			if ("" + this.configSelect[name].item[i].value === "" + value) {
				this.configItemM[name][0].selectedIndex = i;
				break;
			}
		}
	}
	else {
		this.configValue[name] = value;
		this.configValue[name] ? this.configItemM[name].removeClass("vschess-tab-body-config-item-boolean-false") : this.configItemM[name].addClass("vschess-tab-body-config-item-boolean-false");
	}

	return this;
};

// 播放控制器
vschess.load.prototype.createControlBar = function(){
	var _this = this;
	this.controlBar = $('<div class="vschess-control-bar"></div>');
	this.controlBarButton = {
		first: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-first">\u5f00 \u5c40</button>'),
		prevQ: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-prevQ">\u5feb \u9000</button>'),
		prev : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-prev" >\u540e \u9000</button>'),
		play : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-play" >\u64ad \u653e</button>'),
		pause: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-pause">\u6682 \u505c</button>'),
		next : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-next" >\u524d \u8fdb</button>'),
		nextQ: $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-nextQ">\u5feb \u8fdb</button>'),
		last : $('<button type="button" class="vschess-button vschess-control-bar-button vschess-control-bar-last" >\u7ec8 \u5c40</button>')
	};

	this.controlBarButton.first.bind(this.options.click, function(){ _this.pause(false).setBoardByStep(0); });
	this.controlBarButton.last .bind(this.options.click, function(){ _this.pause(false).setBoardByStep(_this.lastSituationIndex()); });
	this.controlBarButton.prev .bind(this.options.click, function(){ _this.pause(false).setBoardByOffset(-1); });
	this.controlBarButton.next .bind(this.options.click, function(){ _this.pause(false).animateToNext(); });
	this.controlBarButton.prevQ.bind(this.options.click, function(){ _this.pause(false).setBoardByOffset(-_this.getQuickStepOffset()); });
	this.controlBarButton.nextQ.bind(this.options.click, function(){ _this.pause(false).setBoardByOffset( _this.getQuickStepOffset()); });
	this.controlBarButton.play .bind(this.options.click, function(){ _this.lastSituationIndex() && _this.play(); });
	this.controlBarButton.pause.bind(this.options.click, function(){ _this.pause(); });

	for (var i in this.controlBarButton) {
		this.controlBar.append(this.controlBarButton[i]);
	}

	this.controlBarButton.play.addClass("vschess-control-bar-button-current");
	this.DOM.append(this.controlBar);
	return this;
};

// 自动播放
vschess.load.prototype.play = function(){
	this.getCurrentStep() >= this.lastSituationIndex() && this.setBoardByStep(0);
	this.interval.time = this.getPlayGap();
	this.controlBarButton.play .removeClass("vschess-control-bar-button-current");
	this.controlBarButton.pause.   addClass("vschess-control-bar-button-current");
	return this;
};

// 暂停播放
vschess.load.prototype.pause = function(playSound){
	this.interval.time = 0;
	this.controlBarButton.pause.removeClass("vschess-control-bar-button-current");
	this.controlBarButton.play .   addClass("vschess-control-bar-button-current");
	this.animating && this.stopAnimate(playSound);
	return this;
};

// 格式控制器
vschess.load.prototype.createFormatBar = function(){
	var _this = this;
	this.formatBar = $('<form method="post" action="' + this.options.cloudApi.saveBook + '" class="vschess-format-bar"></form>');

	switch (this.getMoveFormat()) {
		case "wxf"		: var formarButton = "WXF"	; break;
		case "iccs"		: var formarButton = "ICCS"	; break;
		case "chinese"	: var formarButton = "\u4e2d \u6587"; break;
	}

	this.formatBarButton = {
		copy		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-copy"   >\u590d \u5236</button>'),
		format		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-format" >\u683c \u5f0f</button>'),
		help		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-help"   >\u5e2e \u52a9</button>'),
		save		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-save"   >\u4fdd \u5b58</button>'),
		chinese		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-chinese">\u4e2d \u6587</button>'),
		wxf			: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-wxf"    >WXF</button>'),
		iccs		: $('<button type="button" class="vschess-button vschess-format-bar-button vschess-format-bar-iccs"   >ICCS</button>'),
		saveFormat	: $('<input  type="hidden" class="vschess-format-bar-save-format"   name="format" value="DhtmlXQ" />'),
		saveInput	: $('<input  type="hidden" class="vschess-format-bar-save-input"    name="data" />'),
		saveFilename: $('<input  type="hidden" class="vschess-format-bar-save-filename" name="filename" />')
	};

	this.formatBarButton.format.bind(this.options.click, function(){
		_this.formatBarButton.chinese.toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .toggleClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .toggleClass("vschess-format-bar-button-change");
	});

	this.formatBarButton.help.bind(this.options.click, function(){
		_this.showHelpArea();
	});

	this.formatBarButton.save.bind(this.options.click, function(){
		_this.rebuildExportDhtmlXQ();
		_this.setSaved(true);

		if (vschess.localDownload) {
			var UTF8Text = _this.exportData.DhtmlXQ.replace(/\n/g, "\r\n").replace(/\r\r/g, "\r");
			_this.localDownload((_this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb") + ".txt", UTF8Text, { type: "text/plain" });
		}
		else {
			_this.formatBarButton.saveInput   .val(_this.exportData.DhtmlXQ);
			_this.formatBarButton.saveFilename.val(_this.chessInfo .title  );
			_this.formatBar.trigger("submit");
		}
	});

	this.formatBarButton.chinese.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("chinese").refreshMoveListNode();
	});

	this.formatBarButton.wxf.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("wxf").refreshMoveListNode();
	});

	this.formatBarButton.iccs.bind(this.options.click, function(){
		_this.formatBarButton.chinese.removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.wxf    .removeClass("vschess-format-bar-button-change");
		_this.formatBarButton.iccs   .removeClass("vschess-format-bar-button-change");
		_this.setMoveFormat("iccs").refreshMoveListNode();
	});

	for (var i in this.formatBarButton) {
		this.formatBar.append(this.formatBarButton[i]);
	}

	this.formatBarButton.copy.bind(this.options.click, function(){
		_this.copy(_this.getCurrentFen(), function(){ _this.showMessage("\u5c40\u9762\u590d\u5236\u6210\u529f\uff0c\u60a8\u53ef\u4ee5\u76f4\u63a5\u5728\u8c61\u68cb\u8f6f\u4ef6\u4e2d\u7c98\u8d34\u4f7f\u7528\uff01"); });
	});

	this.DOM.append(this.formatBar);
	return this;
};

// 设置快进快退偏移量
vschess.load.prototype.setQuickStepOffset = function(quickStepOffset){
	this._.quickStepOffset = vschess.limit(quickStepOffset, 1, Infinity);
	this.refreshHelp();
	return this;
};

// 取得快进快退偏移量
vschess.load.prototype.getQuickStepOffset = function(){
	return this._.quickStepOffset;
};

// 设置自动播放时间间隔
vschess.load.prototype.setPlayGap = function(playGap){
	this._.playGap = vschess.limit(playGap, 1, Infinity);
	this.setConfigItemValue("playGap", this._.playGap);
	this.interval && this.interval.time && (this.interval.time = this.getPlayGap());
	return this;
};

// 取得自动播放时间间隔
vschess.load.prototype.getPlayGap = function(){
	return this._.playGap;
};

// 创建复制用文本框
vschess.load.prototype.createCopyTextarea = function(){
	this.copyTextarea = $('<textarea class="vschess-copy" readonly="readonly"></textarea>').appendTo(this.DOM);
	return this;
};

// 复制字符串
vschess.load.prototype.copy = function(str, success){
	typeof success !== "function" && (success = function(){});

	if (document.execCommand && document.queryCommandSupported && document.queryCommandSupported('copy')) {
		this.copyTextarea.val(str);
		this.copyTextarea[0].select();
		this.copyTextarea[0].setSelectionRange(0, str.length);

		if (document.execCommand("copy")) {
			success();
		}
		else {
			prompt("\u8bf7\u6309 Ctrl+C \u590d\u5236\uff1a", str);
		}
	}
	else if (window.clipboardData) {
		if (window.clipboardData.setData("Text", str)) {
			success();
		}
		else {
			prompt("\u8bf7\u6309 Ctrl+C \u590d\u5236\uff1a", str);
		}
	}
	else {
		prompt("\u8bf7\u6309 Ctrl+C \u590d\u5236\uff1a", str);
	}

	return this;
};

// 创建信息提示框
vschess.load.prototype.createMessageBox = function(){
	this.messageBox = $('<div class="vschess-message-box"></div>');
	this.DOM.append(this.messageBox);
	return this;
};

// 显示提示框
vschess.load.prototype.showMessage = function(msg){
	var _this = this;
	this.messageBox.text(msg).addClass("vschess-message-box-show");
	setTimeout(function(){ _this.messageBox.removeClass("vschess-message-box-show"); }, 1500);
	return this;
};

// 取得当前节点树路径下局面数量
vschess.load.prototype.getSituationListLength = function(){
	return this.situationList ? this.situationList.length : 0;
};

// 取得当前节点树路径下最后局面的索引号
vschess.load.prototype.lastSituationIndex = function(){
	return this.situationList ? this.situationList.length - 1 : 0
};

// 取得当前节点树路径下的所有 Fen 串
vschess.load.prototype.getFenList = function(){
	if (!this.getTurnForMove()) {
		return this.fenList.slice(0);
	}

	var result = [];

	for (var i = 0; i < this.fenList.length; ++i) {
		result.push(vschess.turnFen(this.fenList[i]));
	}

	return result;
};

// 取得当前节点树路径下的所有节点 ICCS 着法，[0] 为初始 Fen 串
vschess.load.prototype.getMoveList = function(){
	if (!this.getTurnForMove()) {
		return this.moveList.slice(0);
	}

	var result = [];

	for (var i = 0; i < this.moveList.length; ++i) {
		if (i === 0) {
			result.push(vschess.turnFen(this.moveList[i]));
		}
		else {
			result.push(vschess.turnMove(this.moveList[i]));
		}
	}

	return result;
};

// 取得指定局面号 Fen 串
vschess.load.prototype.getFenByStep = function(step){
	return this.getFenList()[vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
};

// 取得指定局面号节点 ICCS 着法，step 为 0 时返回初始 Fen 串
vschess.load.prototype.getMoveByStep = function(step){
	return this.moveList[vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())];
};

// 取得当前 Fen 串
vschess.load.prototype.getCurrentFen = function(){
	return this.getFenByStep(this.getCurrentStep());
};

// 取得初始 Fen 串
vschess.load.prototype.getStartFen = function(){
	return this.getFenByStep(0);
};

// 取得当前节点 ICCS 着法，起始局面为初始 Fen 串
vschess.load.prototype.getCurrentMove = function(){
	return this.getMoveByStep(this.getCurrentStep());
};

// 取得指定局面号着法是否为吃子着法
vschess.load.prototype.getEatStatusByStep = function(step){
	return this.eatStatus[vschess.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep())];
};

// 取得 UCCI 着法列表
vschess.load.prototype.getUCCIList = function(step){
	step = vschess.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep());
	var startIndex = 0, result = [];

	for (var i = step; i >= 0 && !startIndex; --i) {
		this.eatStatus[i] && (startIndex = i);
	}

	result.push(this.getFenList()[startIndex]);
	result = result.concat(this.getMoveList().slice(startIndex + 1, step + 1));
	return result;
};

// 取得 UCCI 局面列表
vschess.load.prototype.getUCCIFenList = function(step){
	step = vschess.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep());
    var startIndex = 0;

	for (var i = step; i >= 0 && !startIndex; --i) {
		this.eatStatus[i] && (startIndex = i);
	}

	return this.getFenList().slice(startIndex, step + 1);
};

// 取得重复长打着法（棋规判负）
vschess.load.prototype.getRepeatLongThreatMove = function(){
	return vschess.repeatLongThreatMove(this.getUCCIList());
};

// 取得重复一将一杀着法（中国棋规判负）
vschess.load.prototype.getRepeatLongKillMove = function(){
	return vschess.repeatLongKillMove(this.getUCCIList());
};

// 根据局面号取得节点
vschess.load.prototype.getNodeByStep = function(step){
	step = vschess.limit(step, 0, this.eatStatus.length - 1, this.getCurrentStep());
	return this.nodeList[step];
};

// 创建编辑局面区域
vschess.load.prototype.createEdit = function(){
	var _this = this;
    this.editTitle = $('<div class="vschess-tab-title vschess-tab-title-edit">' + this.options.tagName.edit + '</div>');
	this.editArea  = $('<div class="vschess-tab-body vschess-tab-body-edit"></div>');
	this.tabArea.children(".vschess-tab-title-edit, .vschess-tab-body-edit").remove();
	this.tabArea.append(this.editTitle);
	this.tabArea.append(this.editArea );
	this.editTitle.bind(this.options.click, function(){ _this.showTab("edit"); });
	this.recommendStartList = this.options.recommendList;
	this.editNodeTextarea   = { val: function(){ return ""; } };
	this.createEditStartButton();
	this.createNodeStartButton();
	this.createEditOtherButton();
	this.showEditStartButton  ();

	if (this.options.cloudApi && this.options.cloudApi.startFen) {
		$.ajax({
			url: this.options.cloudApi.startFen,
			dataType: "jsonp",
			success: function(data){
				typeof data === "string" && (data = $.parseJSON(data));

				if (data.code === 0) {
					_this.recommendStartList = _this.options.recommendList.concat(data.data);
				}
				else {
				}

				typeof _this.callback_afterStartFen === "function" && _this.callback_afterStartFen();
			}
		});
	}

	return this;
};

// 创建编辑局面区域非即时加载组件
vschess.load.prototype.createEditOtherItem = function(){
	if (this._.fenEditorCreated) {
		return this;
	}

	this._.fenEditorCreated = true;
	this.createEditEndButton();
	this.createEditCancelButton();
	this.createEditTextarea();
	this.createEditPlaceholder();
	this.createEditPieceArea();
	this.createEditStartRound();
	this.createEditStartPlayer();
	this.createEditBoard();
	this.createRecommendList();
	this.createNodeEndButton();
	this.createNodeCancelButton();
	this.createNodeEditTextarea();
	this.createNodeEditPlaceholder();
	return this;
};

// 显示编辑开始按钮
vschess.load.prototype.showEditStartButton = function(){
	for (var i = 0; i < vschess.editStartList.length; ++i) {
		if (this[vschess.editStartList[i]] && typeof this[vschess.editStartList[i]].addClass === "function") {
			this[vschess.editStartList[i]].addClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 隐藏编辑开始按钮
vschess.load.prototype.hideEditStartButton = function(){
	for (var i = 0; i < vschess.editStartList.length; ++i) {
		if (this[vschess.editStartList[i]] && typeof this[vschess.editStartList[i]].removeClass === "function") {
			this[vschess.editStartList[i]].removeClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 显示编辑局面组件
vschess.load.prototype.showEditModule = function(){
	for (var i = 0; i < vschess.editModuleList.length; ++i) {
		if (this[vschess.editModuleList[i]] && typeof this[vschess.editModuleList[i]].addClass === "function") {
			this[vschess.editModuleList[i]].addClass("vschess-tab-body-edit-current");
		}
	}

    this.DOM.addClass("vschess-edit-mode");
	return this;
};

// 隐藏编辑局面组件
vschess.load.prototype.hideEditModule = function(){
	for (var i = 0; i < vschess.editModuleList.length; ++i) {
		if (this[vschess.editModuleList[i]] && typeof this[vschess.editModuleList[i]].removeClass === "function") {
			this[vschess.editModuleList[i]].removeClass("vschess-tab-body-edit-current");
		}
	}

    this.DOM.removeClass("vschess-edit-mode");
	return this;
};

// 显示粘贴棋谱组件
vschess.load.prototype.showNodeEditModule = function(){
	for (var i = 0; i < vschess.editNodeModuleList.length; ++i) {
		if (this[vschess.editNodeModuleList[i]] && typeof this[vschess.editNodeModuleList[i]].addClass === "function") {
			this[vschess.editNodeModuleList[i]].addClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 隐藏粘贴棋谱组件
vschess.load.prototype.hideNodeEditModule = function(){
	for (var i = 0; i < vschess.editNodeModuleList.length; ++i) {
		if (this[vschess.editNodeModuleList[i]] && typeof this[vschess.editNodeModuleList[i]].removeClass === "function") {
			this[vschess.editNodeModuleList[i]].removeClass("vschess-tab-body-edit-current");
		}
	}

	return this;
};

// 创建编辑局面区域开始编辑按钮
vschess.load.prototype.createEditStartButton = function(){
	var _this = this;
	this.editStartButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-start-button">\u7f16\u8f91\u5c40\u9762</button>');
	this.editStartButton.appendTo(this.editArea);
	this.editStartButton.bind(this.options.click, function(){ _this.showEditBoard(); });
	return this;
};

// 显示编辑局面界面
vschess.load.prototype.showEditBoard = function(){
	this.showTab("edit");
	this.createEditOtherItem();
	this.pause(false);
	this.fillInRecommendList(0);
	this.hideEditStartButton();
	this.hideNodeEditModule();
	this.showEditModule();
	this.fillEditBoardByFen(this.getFenByStep(this.getCurrentStep()));
	this.fillInRecommendList(this.recommendClass[0].selectedIndex);
	this.editSelectedIndex = -99;
	this.dragPiece = null;
	return this;
};

// 创建编辑局面区域结束编辑按钮
vschess.load.prototype.createEditEndButton = function(){
	var _this = this;
	this.editEndButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-end-button">\u786e \u5b9a</button>');
	this.editEndButton.appendTo(this.editArea);

	this.editEndButton.bind(this.options.click, function(){
		if (!_this.confirm("\u786e\u5b9a\u4f7f\u7528\u65b0\u7684\u5c40\u9762\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
			return false;
		}

		var fen				= vschess.situationToFen(_this.editSituation);
		var fenRound		= vschess.roundFen(fen);
		var errorList		= vschess.checkFen(fen);
		var errorListRound	= vschess.checkFen(fenRound);
		var turn = 0;

		if (errorList.length > errorListRound.length) {
			errorList = errorListRound;
			fen = fenRound;
			turn = 3;
		}

		if (errorList.length > 1) {
			var errorMsg = ["\u5f53\u524d\u5c40\u9762\u51fa\u73b0\u4e0b\u5217\u9519\u8bef\uff1a\n"];

			for (var i = 0; i < errorList.length; ++i) {
				errorMsg.push(i + 1, ".", errorList[i], i === errorList.length - 1 ? "\u3002" : "\uff1b\n");
			}

			alert(errorMsg.join(""));
		}
		else if (errorList.length > 0) {
			alert(errorList[0] + "\u3002");
		}
		else {
			_this.hideNodeEditModule();
			_this.hideEditModule();
			_this.showEditStartButton();
			_this.editTextarea.val("");
			_this.setNode({ fen: fen, comment: "", next: [], defaultIndex: 0 });
			_this.rebuildSituation();
			_this.setBoardByStep(0);
			_this.refreshMoveSelectListNode();
			_this.chessInfo = {};
			_this.insertInfoByCurrent();
			_this.refreshInfoEditor();
			_this.rebuildExportAll();
			_this.setExportFormat();
			_this.setTurn(turn);
			_this.setSaved(true);
		}
	});

	return this;
};

// 创建编辑局面区域取消编辑按钮
vschess.load.prototype.createEditCancelButton = function(){
	var _this = this;
	this.editCancelButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-cancel-button">\u53d6 \u6d88</button>');
	this.editCancelButton.appendTo(this.editArea);

	this.editCancelButton.bind(this.options.click, function(){
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
	});

	return this;
};

// 创建编辑局面区域输入框
vschess.load.prototype.createEditTextarea = function(){
	var _this = this;
	var UA = navigator.userAgent.toLowerCase(), contextMenu = "\u957f\u6309";
	!~UA.indexOf("android") && !~UA.indexOf("iph") && !~UA.indexOf("ipad") && (contextMenu = "\u53f3\u952e\u5355\u51fb");
	this.editTipsText = "\u70b9\u51fb\u53f3\u4fa7\u7684\u68cb\u5b50\u53ef\u5c06\u5176\u653e\u7f6e\u5728\u68cb\u76d8\u4e0a\uff0c" + contextMenu + "\u68cb\u76d8\u4e0a\u7684\u68cb\u5b50\u53ef\u4ee5\u5c06\u5176\u79fb\u9664\u3002";
	this.editTips = $('<input class="vschess-tab-body-edit-tips" value="' + this.editTipsText + '" readonly="readonly" />').appendTo(this.DOM);
	this.editTextarea = $('<textarea class="vschess-tab-body-edit-textarea"></textarea>').appendTo(this.editArea);

	this.editTextarea.bind("change" , function(){
		_this.fillEditBoardByText($(this).val());
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	this.editTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode === 13 && _this.editTextarea.blur(); });
	return this;
};

// 创建编辑局面区域空白提示
vschess.load.prototype.createEditPlaceholder = function(){
	var placeholderText = "\u8bf7\u5c06\u5c40\u9762\u4ee3\u7801\u7c98\u8d34\u5230\u8fd9\u91cc\uff0c\u652f\u6301\u6807\u51c6FEN\u3001\u4e1c\u840d\u8c61\u68cb\u3001\u8c61\u68cb\u4e16\u5bb6\u7b49\u683c\u5f0f\uff0c\u5176\u4ed6\u683c\u5f0f\u7a0b\u5e8f\u4f1a\u5c1d\u8bd5\u8fdb\u884c\u8bc6\u522b\u3002";

	if (vschess.placeholder) {
		this.editTextarea.attr({ "placeholder": placeholderText });
		this.editTextareaPlaceholder = $();
		return this;
	}

	var _this = this, editMonitor;
	this.editTextareaPlaceholder = $('<div class="vschess-tab-body-edit-textarea-placeholder">' + placeholderText + "</div>");
	this.editArea.append(this.editTextareaPlaceholder);
	this.editTextarea.bind("focus", function(){ editMonitor = setInterval(function(){ _this.editTextarea.val() ? _this.editTextareaPlaceholder.hide() : _this.editTextareaPlaceholder.show(); }, 20); });
	this.editTextarea.bind("blur" , function(){ clearInterval(editMonitor); });
	return this;
};

// 创建编辑局面区域棋子容器
vschess.load.prototype.createEditPieceArea = function(){
	var _this = this;
	var editPieceNameList = "RNBAKCP rnbakcp*";
	this.editPieceArea = $('<div class="vschess-tab-body-edit-area"></div>');
	this.editArea.append(this.editPieceArea);
	this.editPieceList = {};

	for (var i = 0; i < editPieceNameList.length; ++i) {
		var k = editPieceNameList.charAt(i);

		if (k === " ") {
			this.editPieceArea.append('<div class="vschess-piece-disabled"></div>');
		}
		else if (k === "*") {
			this.editPieceList[k] = $('<div class="vschess-piece vschess-piece-X" draggable="true"><span></span></div>');
			this.editPieceList[k].appendTo(this.editPieceArea);
		}
		else {
			this.editPieceList[k] = $('<div class="vschess-piece vschess-piece-' + k + '" draggable="true"><span></span></div>');
			this.editPieceList[k].appendTo(this.editPieceArea);
		}
	}

	this.editPieceArea.bind("dragover", function(e){
		e.preventDefault();
		return true;
	});

	this.editPieceArea.bind("drop", function(e){
		_this.editRemovePiece(_this.dragPiece);
		_this.fillEditBoard();
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	$.each(this.editPieceList, function(i){
		var currentIndex = -vschess.f2n[i];

		this.bind(_this.options.click, function(e){
			_this.editRemoveSelect();

			if (_this.editSelectedIndex === -99) {
				$(this).addClass("vschess-piece-s");
				_this.editSelectedIndex = currentIndex;
			}
			else {
				if (_this.editSelectedIndex === currentIndex) {
					_this.editSelectedIndex = -99;
				}
				else {
					$(this).addClass("vschess-piece-s");
					_this.editSelectedIndex = currentIndex;
				}
			}
		});

		this.bind("selectstart", function(e) {
			e.preventDefault();
			return false;
		});

		this.bind("dragstart", function(e){
			e.dataTransfer.setData("text", e.target.innerHTML);
			_this.dragPiece = currentIndex;
			_this.editRemoveSelect();
			_this.editSelectedIndex = -99;
		});

		this.bind("drop", function(e) {
			e.stopPropagation();
			e.preventDefault();
			_this.editRemovePiece(_this.dragPiece);
			_this.fillEditBoard();
			var currentFen = vschess.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
			return false;
		});
	});

	return this;
};

// 创建编辑局面区域开始回合数编辑框
vschess.load.prototype.createEditStartRound = function(){
	var _this = this;
	this.editEditStartText = $('<div class="vschess-tab-body-edit-start-text">\u56de\u5408\uff1a</div>');
	this.editEditStartText.appendTo(this.editArea);
	this.editEditStartRound = $('<input type="number" class="vschess-tab-body-edit-start-round" />');
	this.editEditStartRound.appendTo(this.editArea);

	this.editEditStartRound.bind("change", function(){
		_this.editSituation[1] = vschess.limit($(this).val(), 1, Infinity, 1);
		_this.fillEditBoard();
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	return this;
};

// 创建编辑局面区域先行走子方选项
vschess.load.prototype.createEditStartPlayer = function(){
	var _this = this;
	this.editEditStartPlayer = $('<div class="vschess-tab-body-edit-start-player"><span></span></div>');
	this.editEditStartPlayer.appendTo(this.editArea);

	this.editEditStartPlayer.bind(this.options.click, function(){
		_this.editSituation[0] = 3 - _this.editSituation[0];
		_this.fillEditBoard();
		var currentFen = vschess.situationToFen(_this.editSituation);
		_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
	});

	return this;
};

// 创建编辑局面专用棋盘
vschess.load.prototype.createEditBoard = function(){
	var _this = this;
	this.editBoard = $('<div class="vschess-board-edit"></div>');
	this.DOM.append(this.editBoard);
	this.editBoard.append(new Array(91).join('<div class="vschess-piece"><span></span></div>'));
	this.editPiece = this.editBoard.children(".vschess-piece");

	this.editPiece.each(function(i){
		$(this).bind(_this.options.click, function(){
			_this.editRemoveSelect();

			if (_this.editSelectedIndex === -99) {
				if (_this.editSituation[vschess.b2s[i]] > 1) {
					_this.editSelectedIndex = i;
					$(this).addClass("vschess-piece-s");
				}
			}
			else {
				_this.editSelectedIndex === i || _this.editMovePiece(_this.editSelectedIndex, i);
				_this.editSelectedIndex = -99;
			}

			_this.fillEditBoard(true);
			var currentFen = vschess.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
		});

		$(this).bind("contextmenu", function(e){
			e.preventDefault();
			_this.editRemovePiece(i);
			_this.fillEditBoard();
			var currentFen = vschess.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
			return false;
		});

		$(this).bind("selectstart", function(e) {
			e.preventDefault();
			return false;
		});

		$(this).bind("dragstart", function(e){
			e.dataTransfer.setData("text", e.target.innerHTML);
			_this.dragPiece = i;
			_this.editRemoveSelect();
			_this.editSelectedIndex = -99;
		});

		$(this).bind("dragover", function(e){
			e.preventDefault();
			return true;
		});

		$(this).bind("drop", function(e){
			e.stopPropagation();
			e.preventDefault();

			if (_this.dragPiece !== i) {
				if (e.ctrlKey) {
					_this.editSituation[vschess.b2s[i]] = _this.editSituation[vschess.b2s[_this.dragPiece]];
				}
				else {
					_this.editMovePiece(_this.dragPiece, i);
				}
			}

			_this.fillEditBoard();
			var currentFen = vschess.situationToFen(_this.editSituation);
			_this.editTips.val(currentFen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : currentFen);
		});
	});

	return this;
};

// 编辑器移动一枚棋子
vschess.load.prototype.editMovePiece = function(from, to){
	if (from >= 0) {
		this.editSituation[vschess.b2s[to]] = this.editSituation[vschess.b2s[from]];
		this.editRemovePiece(from);
	}
	else if (from > -99) {
		this.editSituation[vschess.b2s[to]] = -from;
	}

	return this;
};

// 编辑器移除一枚棋子
vschess.load.prototype.editRemovePiece = function(i){
	i >= 0 && (this.editSituation[vschess.b2s[i]] = 1);
	return this;
};

// 编辑器移除选中状态
vschess.load.prototype.editRemoveSelect = function(){
	$.each(this.editPieceList, function(){ $(this).removeClass("vschess-piece-s"); });
	this.editPiece.removeClass("vschess-piece-s");
	return this;
};

// 创建推荐开局列表（云服务）
vschess.load.prototype.createRecommendList = function(){
	var _this = this;
	this.recommendClass = $('<select class="vschess-recommend-class"></select>');
	this.recommendList  = $('<ul class="vschess-recommend-list"></ul>');
	this.DOM.append(this.recommendClass);
	this.DOM.append(this.recommendList );
	this.recommendClass.bind("change", function(){ _this.fillInRecommendList(this.selectedIndex); });
	this.fillInRecommendClass();
	return this;
};

// 填充推荐开局分类列表
vschess.load.prototype.fillInRecommendClass = function(){
	this.recommendStartClassItem = [];

	for (var i = 0; i < this.recommendStartList.length; ++i) {
		var classItem = $(['<option value="', i, '">', this.recommendStartList[i].name, '</option>'].join("")).appendTo(this.recommendClass);
		this.recommendStartClassItem.push(classItem);
	}

	return this;
};

// 填充推荐开局列表
vschess.load.prototype.fillInRecommendList = function(classId){
	var _this = this;
	this.recommendList.empty();
	var list = this.recommendStartList[classId].fenList;

	for (var i = 0; i < list.length; ++i) {
		var recommendStart = $(['<li class="vschess-recommend-list-fen" data-fen="', list[i].fen, '"><span>', i + 1, '.</span>', list[i].name, '</li>'].join(""));
		this.recommendList.append(recommendStart);

		recommendStart.bind(this.options.click, function(){
			var fen = $(this).data("fen");
			_this.fillEditBoardByFen(fen);
			_this.editTips.val(fen.split(" ")[0] === vschess.blankFen.split(" ")[0] ? _this.editTipsText : fen);
		});
	}

	return this;
};

// 尝试识别文本棋谱
vschess.load.prototype.fillEditBoardByText = function(chessData){
	var RegExp = vschess.RegExp(), RegExp_Match, fen = vschess.blankFen;

	if (~chessData.indexOf("[DhtmlXQ]")) {
		fen = vschess.dataToNode_DhtmlXQ(chessData, true);
	}
	else if (RegExp_Match = RegExp.ShiJia.exec(chessData)) {
		fen = vschess.dataToNode_ShiJia(chessData, true);
	}
	else if (RegExp_Match = RegExp.FenLong.exec(chessData)) {
		fen = RegExp_Match[0];
	}
	else if (RegExp_Match = RegExp.FenShort.exec(chessData)) {
		fen = RegExp_Match[0] + " - - 0 1";
	}
	else if (RegExp_Match = RegExp.FenMini.exec(chessData)) {
		fen = RegExp_Match[0] + " w - - 0 1";
	}

	return this.fillEditBoardByFen(fen);
};

// 将 Fen 串导入局面编辑区
vschess.load.prototype.fillEditBoardByFen = function(fen){
	(this.getTurn() >> 1) && (fen = vschess.roundFen(fen));
	this.editSituation = vschess.fenToSituation(fen);
	this.fillEditBoard();
	return this;
};

// 将当前编辑局面展示到视图中
vschess.load.prototype.fillEditBoard = function(ignoreSelect){
	var selected = this.editPiece.filter(".vschess-piece-s");
	this.editPiece.removeClass().addClass("vschess-piece").removeAttr("draggable");
	ignoreSelect && selected.addClass("vschess-piece-s");
	this.editEditStartRound.val(this.editSituation[1]);
	this.editEditStartPlayer.removeClass("vschess-tab-body-edit-start-player-black");
	this.editSituation[0] === 2 && this.editEditStartPlayer.addClass("vschess-tab-body-edit-start-player-black");

	for (var i = 51; i < 204; ++i) {
		this.editSituation[i] > 1 && this.editPiece.eq(vschess.s2b[i]).addClass("vschess-piece-" + vschess.n2f[this.editSituation[i]]).attr({ draggable: true });
	}

	return this;
};

// 创建粘贴棋谱区域开始编辑按钮
vschess.load.prototype.createNodeStartButton = function(){
	var _this = this;
	this.editNodeStartButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-node-start-button">\u7c98\u8d34\u68cb\u8c31</button>');
	this.editNodeStartButton.appendTo(this.editArea);

	this.editNodeStartButton.bind(this.options.click, function(){
		_this.createEditOtherItem();
		_this.pause(false);
		_this.hideEditModule();
		_this.hideEditStartButton();
		_this.showNodeEditModule();
	});

	return this;
};

// 创建粘贴棋谱区域完成编辑按钮
vschess.load.prototype.createNodeEndButton = function(){
	var _this = this;
	this.editNodeEndButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-node-end-button">\u786e \u5b9a</button>');
	this.editNodeEndButton.appendTo(this.editArea);

	this.editNodeEndButton.bind(this.options.click, function(){
		if (!_this.confirm("\u786e\u5b9a\u4f7f\u7528\u65b0\u7684\u68cb\u8c31\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
			return false;
		}

		var chessData = _this.editNodeTextarea.val();
		_this.editNodeTextarea.val("");
		_this.setBoardByStep(0);
		_this.setNode(vschess.dataToNode(chessData));
		_this.rebuildSituation().refreshMoveSelectListNode().setBoardByStep(0);
		_this.chessInfo = vschess.dataToInfo(chessData);
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
		_this.setSaved(true);
	});

	return this;
};

// 创建粘贴棋谱区域取消编辑按钮
vschess.load.prototype.createNodeCancelButton = function(){
	var _this = this;
	this.editNodeCancelButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-node-cancel-button">\u53d6 \u6d88</button>');
	this.editNodeCancelButton.appendTo(this.editArea);

	this.editNodeCancelButton.bind(this.options.click, function(){
		_this.hideNodeEditModule();
		_this.hideEditModule();
		_this.showEditStartButton();
	});

	return this;
};

// 创建粘贴棋谱区域输入框
vschess.load.prototype.createNodeEditTextarea = function(){
	var _this = this;
	this.editNodeTextarea = $('<textarea class="vschess-tab-body-edit-node-textarea"></textarea>').appendTo(this.editArea);
	this.editNodeTextarea.bind("keydown", function(e){ e.ctrlKey && e.keyCode === 13 && _this.editNodeTextarea.blur(); });
	return this;
};

// 创建粘贴棋谱区域空白提示
vschess.load.prototype.createNodeEditPlaceholder = function(){
	var placeholderText = "\u8bf7\u5c06\u68cb\u8c31\u4ee3\u7801\u7c98\u8d34\u5230\u8fd9\u91cc\uff0c\u6216\u8005\u76f4\u63a5\u5c06\u68cb\u8c31\u6587\u4ef6\u62d6\u62fd\u5230\u68cb\u76d8\u4e0a\u3002\u652f\u6301\u6807\u51c6PGN\u3001\u4e1c\u840d\u8c61\u68cb DhtmlXQ\u3001\u9e4f\u98de\u8c61\u68cb PFC\u3001\u8c61\u68cb\u4e16\u5bb6\u3001QQ \u65b0\u4e2d\u56fd\u8c61\u68cb\u7b49\u683c\u5f0f\uff0c\u5176\u4ed6\u683c\u5f0f\u7a0b\u5e8f\u4f1a\u5c1d\u8bd5\u8fdb\u884c\u8bc6\u522b\u3002";

	if (vschess.placeholder) {
		this.editNodeTextarea.attr({ "placeholder": placeholderText });
		this.editNodeTextareaPlaceholder = $();
		return this;
	}

	var _this = this, editMonitor;
	this.editNodeTextareaPlaceholder = $('<div class="vschess-tab-body-edit-node-textarea-placeholder">' + placeholderText + "</div>");
	this.editArea.append(this.editNodeTextareaPlaceholder);
	this.editNodeTextarea.bind("focus", function(){ editMonitor = setInterval(function(){ _this.editNodeTextarea.val() ? _this.editNodeTextareaPlaceholder.hide() : _this.editNodeTextareaPlaceholder.show(); }, 20); });
	this.editNodeTextarea.bind("blur" , function(){ clearInterval(editMonitor); });
	return this;
};

// 创建其他按钮
vschess.load.prototype.createEditOtherButton = function(){
	var _this = this;

	// 打开棋谱按钮
	var buttonId = "vschess-tab-body-edit-open-button-" + vschess.guid();
	this.editOpenButton = $('<label for="' + buttonId + '" class="vschess-button vschess-tab-body-edit-open-button">\u6253\u5f00\u68cb\u8c31</label>');
	this.editOpenButton.appendTo(this.editArea);
	this.editOpenFile = $('<input type="file" class="vschess-tab-body-edit-open-file" id="' + buttonId + '" />');
	this.editOpenFile.appendTo(this.editArea);

	this.editOpenFile.bind("change", function(){
		if (typeof FileReader === "function") {
			if (this.files.length) {
				var file = this.files[0];
				var ext = file.name.split(".").pop().toLowerCase();
				var reader = new FileReader();
				reader.readAsArrayBuffer(file);
				reader.onload = function(){
					if (!_this.confirm("\u786e\u5b9a\u6253\u5f00\u8be5\u68cb\u8c31\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
						return false;
					}

					var RegExp    = vschess.RegExp();
					var fileData  = new Uint8Array(this.result);
					var chessData = vschess.join(fileData);

					if (~vschess.binaryExt.indexOf(ext)) {
						var chessNode = vschess.binaryToNode(fileData);
						var chessInfo = vschess.binaryToInfo(fileData);
					}
					else {
						!RegExp.ShiJia.test(chessData) && (chessData = vschess.iconv2UTF8(fileData));
						var chessNode = vschess.dataToNode(chessData);
						var chessInfo = vschess.dataToInfo(chessData);
					}

					_this.setBoardByStep(0);
					_this.setNode(chessNode);
					_this.rebuildSituation();
					_this.refreshMoveSelectListNode();
					_this.setBoardByStep(0);
					_this.chessInfo = chessInfo;
					_this.insertInfoByCurrent();
					_this.refreshInfoEditor();
					_this.rebuildExportAll();
					_this.setExportFormat();
					_this.editNodeTextarea.val("");
					_this.hideNodeEditModule();
					_this.hideEditModule();
					_this.showEditStartButton();
					_this.setSaved(true);
				}
			}
		}
		else {
			alert("\u5bf9\u4e0d\u8d77\uff0c\u8be5\u6d4f\u89c8\u5668\u4e0d\u652f\u6301\u6253\u5f00\u68cb\u8c31\u3002");
		}

		this.value = "";
	});

	// 重新开局按钮
	this.editBeginButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-begin-button">\u91cd\u65b0\u5f00\u5c40</button>');
	this.editBeginButton.appendTo(this.editArea);

	this.editBeginButton.bind(this.options.click, function(){
		if (!_this.confirm("\u786e\u5b9a\u91cd\u65b0\u5f00\u5c40\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
			return false;
		}

		_this.setNode({ fen: vschess.defaultFen, comment: "", next: [], defaultIndex: 0 });
		_this.rebuildSituation();
        _this.setBoardByStep(0);
		_this.refreshMoveSelectListNode();
		_this.chessInfo = {};
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
		_this.setTurn(0);
		_this.setSaved(true);
	});

	// 清空棋盘按钮
	this.editBlankButton = $('<button type="button" class="vschess-button vschess-tab-body-edit-blank-button">\u6e05\u7a7a\u68cb\u76d8</button>');
	this.editBlankButton.appendTo(this.editArea);

	this.editBlankButton.bind(this.options.click, function(){
		_this.createEditOtherItem();
		_this.pause(false);
		_this.fillInRecommendList(0);
		_this.hideEditStartButton();
		_this.hideNodeEditModule();
		_this.showEditModule();
		_this.fillEditBoardByFen(vschess.blankFen);
		_this.editSelectedIndex = -99;
		_this.dragPiece = null;
	});

	return this;
};

// 绑定拖拽棋谱事件
vschess.load.prototype.bindDrag = function(){
	var _this = this;

	this.DOM.bind("dragover", function(e){
		e.preventDefault();
	});

	this.DOM.bind("drop", function(e){
		e.preventDefault();

		if (e.dataTransfer && e.dataTransfer.files.length) {
			var file = e.dataTransfer.files[0];
			var ext = file.name.split(".").pop().toLowerCase();
			var reader = new FileReader();
			reader.readAsArrayBuffer(file);
			reader.onload = function(){
				if (!_this.confirm("\u786e\u5b9a\u4f7f\u7528\u65b0\u7684\u68cb\u8c31\u5417\uff1f\u5f53\u524d\u68cb\u8c31\u4f1a\u4e22\u5931\uff01")) {
					return false;
				}

				var RegExp    = vschess.RegExp();
				var fileData  = new Uint8Array(this.result);
				var chessData = vschess.join(fileData);

				if (~vschess.binaryExt.indexOf(ext)) {
					var chessNode = vschess.binaryToNode(fileData);
					var chessInfo = vschess.binaryToInfo(fileData);
				}
				else {
					!RegExp.ShiJia.test(chessData) && (chessData = vschess.iconv2UTF8(fileData));
					var chessNode = vschess.dataToNode(chessData);
					var chessInfo = vschess.dataToInfo(chessData);
				}

				_this.setBoardByStep(0);
				_this.setNode(chessNode);
				_this.rebuildSituation();
				_this.refreshMoveSelectListNode();
				_this.setBoardByStep(0);
				_this.chessInfo = chessInfo;
				_this.insertInfoByCurrent();
				_this.refreshInfoEditor();
				_this.rebuildExportAll();
				_this.setExportFormat();
				_this.editNodeTextarea.val("");
				_this.hideNodeEditModule();
				_this.hideEditModule();
				_this.showEditStartButton();
				_this.setSaved(true);
				_this.hideHelpArea();
				_this.hideInfoEditor();
			}
		}
	});

	return this;
};

// 确认提示框
vschess.load.prototype.confirm = function(str){
	if (this.getSaveTips() && !this.getSaved()) {
		return confirm(str);
	}
	else {
		return true;
	}
};

// 设置保存状态
vschess.load.prototype.setSaved = function(status){
	this._.saved = !!status;
	return this;
};

// 取得保存状态
vschess.load.prototype.getSaved = function(){
	return this._.saved;
};

// 设置保存提示状态
vschess.load.prototype.setSaveTips = function(status){
	this._.saveTips = !!status;
	this.setConfigItemValue("saveTips", this._.saveTips);
	return this;
};

// 取得保存提示状态
vschess.load.prototype.getSaveTips = function(){
	return this._.saveTips;
};

// 创建导出棋谱区域
vschess.load.prototype.createExport = function(){
	var _this = this;
    this.exportTitle = $('<div class="vschess-tab-title vschess-tab-title-export">' + this.options.tagName.export + '</div>');
	this.exportArea     = $('<form method="post" action="' + this.options.cloudApi.saveBook + '" class="vschess-tab-body vschess-tab-body-export"></form>');
	this.exportTextarea = $('<textarea class="vschess-tab-body-export-textarea" readonly="readonly" name="data"></textarea>').appendTo(this.exportArea);
	this.exportFormat   = $('<select class="vschess-tab-body-export-format"   name="format"></select>').appendTo(this.exportArea);
	this.exportFilename = $('<input  class="vschess-tab-body-export-filename" name="filename" type="hidden" />').appendTo(this.exportArea);
	this.exportGenerate = $('<button type="button" class="vschess-button vschess-tab-body-export-generate">\u751f\u6210\u68cb\u8c31</button>').appendTo(this.exportArea);
	this.exportCopy     = $('<button type="button" class="vschess-button vschess-tab-body-export-copy     vschess-tab-body-export-current">\u590d\u5236</button>').appendTo(this.exportArea);
	this.exportDownload = $('<button type="button" class="vschess-button vschess-tab-body-export-download vschess-tab-body-export-current">\u4fdd\u5b58</button>').appendTo(this.exportArea);
	this.exportData     = {};
	this.tabArea.children(".vschess-tab-title-export, .vschess-tab-body-export").remove();
	this.tabArea.append(this.exportTitle);
	this.tabArea.append(this.exportArea );
	this.exportTitle.bind(this.options.click, function(){ _this.showTab("export"); });
	this.createExportList();
	return this;
};

// 创建导出格式列表
vschess.load.prototype.createExportList = function(){
	var _this = this, generating = false;
	this.exportFormatOptions = {};

	for (var i in vschess.exportFormatList) {
		this.exportFormatOptions[i] = $('<option value="' + i + '">' + vschess.exportFormatList[i] + '</option>');
		this.exportFormatOptions[i].addClass("vschess-tab-body-export-format-options");
		this.exportFormatOptions[i].addClass("vschess-tab-body-export-format-options-" + i);
		this.exportFormat.append(this.exportFormatOptions[i]);
	}

	this.exportFormat.bind("change", function(){
		if (_this.getNodeLength() >= vschess.bigBookCritical && (this.value === "PengFei" || this.value === "DhtmlXQ")) {
			_this.exportDownload.removeClass("vschess-tab-body-export-current");
			_this.exportCopy    .removeClass("vschess-tab-body-export-current");
			_this.exportGenerate.   addClass("vschess-tab-body-export-current");
			_this.setExportFormat(this.value, "");
		}
		else {
			_this.exportGenerate.removeClass("vschess-tab-body-export-current");
			_this.exportCopy    .   addClass("vschess-tab-body-export-current");
			_this.exportDownload.   addClass("vschess-tab-body-export-current");
			_this.setExportFormat(this.value);
		}
	});

	this.exportGenerate.bind(this.options.click, function(){
		if (generating) {
			return false;
		}

		generating = true;
		_this.exportTextarea.val("\u6b63\u5728\u751f\u6210\u68cb\u8c31\uff0c\u8bf7\u7a0d\u5019\u3002");

		setTimeout(function(){
			switch (_this.exportFormat.val()) {
				case "PengFei": _this.rebuildExportPengFei(); _this.setExportFormat("PengFei", true); break;
				default       : _this.rebuildExportDhtmlXQ(); _this.setExportFormat("DhtmlXQ", true); break;
			}

			_this.exportGenerate.removeClass("vschess-tab-body-export-current");
			_this.exportDownload.   addClass("vschess-tab-body-export-current");
			_this.exportCopy    .   addClass("vschess-tab-body-export-current");
			generating = false;
		}, vschess.threadTimeout);
	});

	this.exportCopy.bind(this.options.click, function(){
		_this.copy(_this.exportTextarea.val(), function(){ _this.showMessage("\u68cb\u8c31\u590d\u5236\u6210\u529f\uff0c\u60a8\u53ef\u4ee5\u76f4\u63a5\u7c98\u8d34\u4f7f\u7528\uff01"); });
	});

	this.exportDownload.bind(this.options.click, function(){
		if (vschess.localDownload) {
			var UTF8Text = _this.exportTextarea.val().replace(/\n/g, "\r\n").replace(/\r\r/g, "\r");
			var GBKArray = new Uint8Array(vschess.iconv2GBK(UTF8Text));
			var exportFormat = _this.exportFormat.val();
			var fileName = _this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb";

			if (exportFormat.indexOf("PGN") === 0) {
				_this.localDownload(fileName + ".pgn", GBKArray, { type: "application/octet-stream" });
			}
			else if (exportFormat.indexOf("QQ") === 0) {
				_this.localDownload(fileName + ".che", GBKArray, { type: "application/octet-stream" });
			}
			else if (exportFormat === "PengFei") {
				_this.localDownload(fileName + ".pfc", UTF8Text, { type: "application/octet-stream" });
			}
			else if (exportFormat === "XQF") {
				_this.localDownload(fileName + ".xqf", vschess.nodeToBinary_XQF(_this.node, _this.chessInfo, _this.getTurnForMove()), { type: "application/octet-stream" });
			}
			else {
				_this.localDownload(fileName + ".txt", UTF8Text, { type: "text/plain" });
			}
		}
		else {
			_this.exportArea.trigger("submit");
		}
	});

	return this;
};

// 取得当前导出格式
vschess.load.prototype.getExportFormat = function(){
	return this._.exportFormat || "DhtmlXQ";
};

// 设置当前导出格式
vschess.load.prototype.setExportFormat = function(format, force){
	format = format || this.getExportFormat();
	this._.exportFormat = vschess.exportFormatList[format] ? format : this.getExportFormat();
	this.exportTextarea.removeClass().addClass("vschess-tab-body-export-textarea vschess-tab-body-export-textarea-format-" + format);
	this.exportFilename.val(this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb");

	this.exportGenerate.removeClass("vschess-tab-body-export-current");
	this.exportCopy    .removeClass("vschess-tab-body-export-current vschess-tab-body-export-only-save");
	this.exportDownload.removeClass("vschess-tab-body-export-current vschess-tab-body-export-only-save");

	if (format === "TextBoard") {
		this.exportCopy    .addClass("vschess-tab-body-export-current");
		this.exportDownload.addClass("vschess-tab-body-export-current");
		this.exportTextarea.val(vschess.textBoard(this.getCurrentFen(), this.options));
	}
    else if (format === "ChessDB") {
        this.exportCopy    .addClass("vschess-tab-body-export-current");
        this.exportDownload.addClass("vschess-tab-body-export-current");

        // 从开局开始
        var list = this.getMoveList();
        var fen = list.shift().split(" ").slice(0, 2).join(" ");
        var longData = list.length ? fen + " moves " + list.join(" ") : fen;

        // 从吃子开始
        var list = this.getUCCIList();
        var fen = list.shift().split(" ").slice(0, 2).join(" ");
        var shortData = list.length ? fen + " moves " + list.join(" ") : fen;

        this.exportTextarea.val("\u4ece\u5f00\u5c40\u5f00\u59cb\uff1a\n" + longData + "\n\n\u4ece\u5403\u5b50\u5f00\u59cb\uff1a\n" + shortData);
    }
	else if (~["PengFei", "DhtmlXQ"].indexOf(format) && !force && this.getNodeLength() >= vschess.bigBookCritical) {
		// 大棋谱需要加参数才同步
		this.exportGenerate.addClass("vschess-tab-body-export-current");
		this.exportTextarea.val("\u8bf7\u70b9\u51fb\u201c\u751f\u6210\u201d\u6309\u94ae\u751f\u6210\u68cb\u8c31\u3002");
    }
	else if (format === "XQF") {
		// XQF 格式是二进制棋谱，隐藏复制按钮
		this.exportCopy    .addClass("vschess-tab-body-export-current vschess-tab-body-export-only-save");
		this.exportDownload.addClass("vschess-tab-body-export-current vschess-tab-body-export-only-save");
		this.exportTextarea.val("\u8bf7\u70b9\u51fb\u4e0a\u9762\u7684\u201c\u4fdd\u5b58\u201d\u6309\u94ae\u4fdd\u5b58\u68cb\u8c31\u3002");
	}
	else {
		this.exportCopy    .addClass("vschess-tab-body-export-current");
		this.exportDownload.addClass("vschess-tab-body-export-current");
		this.exportTextarea.val(this.exportData[this.getExportFormat() + (this.getTurnForMove() ? "M" : "")]);
	}

	return this;
};

// 重建所有棋谱
vschess.load.prototype.rebuildExportAll = function(all){
	this.rebuildExportPGN();
	this.rebuildExportText();
	this.rebuildExportQQ();
    this.rebuildExportDHJHtmlXQ();

	// 大棋谱生成东萍 DhtmlXQ 格式和鹏飞 PFC 格式比较拖性能
	(this.getNodeLength() < vschess.bigBookCritical || all) && this.rebuildExportPengFei();
	(this.getNodeLength() < vschess.bigBookCritical || all) && this.rebuildExportDhtmlXQ();

	this.hideExportFormatIfNeedStart();
	return this;
};

// 重建 PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN = function(){
	this.rebuildExportPGN_Chinese();
	this.rebuildExportPGN_WXF    ();
	this.rebuildExportPGN_ICCS   ();
	return this;
};

// 重建中文 PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN_Chinese = function(){
	var moveList  = this.moveNameList.Chinese .slice(0);
	var moveListM = this.moveNameList.ChineseM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_Chinese  = vschess.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_ChineseM = vschess.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 WXF PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN_WXF = function(){
	var moveList  = this.moveNameList.WXF .slice(0);
	var moveListM = this.moveNameList.WXFM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_WXF  = vschess.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_WXFM = vschess.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 ICCS PGN 格式棋谱
vschess.load.prototype.rebuildExportPGN_ICCS = function(){
	var moveList  = this.moveNameList.ICCS .slice(0);
	var moveListM = this.moveNameList.ICCSM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.PGN_ICCS  = vschess.moveListToData_PGN(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.PGN_ICCSM = vschess.moveListToData_PGN(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建文本 TXT 格式棋谱
vschess.load.prototype.rebuildExportText = function(){
	var moveList  = this.moveNameList.Chinese .slice(0);
	var moveListM = this.moveNameList.ChineseM.slice(0);
	var startFen  = moveList .shift();
	var startFenM = moveListM.shift();
	this.exportData.Text  = vschess.moveListToText(moveList , startFen , this.commentList, this.chessInfo, this.getResultByCurrent());
	this.exportData.TextM = vschess.moveListToText(moveListM, startFenM, this.commentList, this.chessInfo, this.getResultByCurrent());
	return this;
};

// 重建 QQ 象棋 CHE 格式棋谱
vschess.load.prototype.rebuildExportQQ = function(){
	var moveList = this.moveList.slice(1);
	this.exportData.QQ  = vschess.moveListToData_QQ(moveList      );
	this.exportData.QQM = vschess.moveListToData_QQ(moveList, true);
	return this;
};

// 重建鹏飞 PFC 格式棋谱
vschess.load.prototype.rebuildExportPengFei = function(){
	this.exportData.PengFei  = vschess.nodeToData_PengFei(this.node, this.chessInfo, this.getResultByCurrent());
	this.exportData.PengFeiM = vschess.turn_PengFei(this.exportData.PengFei);
	return this;
};

// 重建东萍 DhtmlXQ 格式棋谱
vschess.load.prototype.rebuildExportDhtmlXQ = function(){
	this.exportData.DhtmlXQ  = vschess.nodeToData_DhtmlXQ(this.node, this.chessInfo);
	this.exportData.DhtmlXQM = vschess.turn_DhtmlXQ(this.exportData.DhtmlXQ);
	return this;
};

// 重建广东象棋网 DHJHtmlXQ 格式棋谱
vschess.load.prototype.rebuildExportDHJHtmlXQ = function(){
	this.exportData.DHJHtmlXQ  = vschess.nodeToData_DHJHtmlXQ(this.node, this.chessInfo);
	this.exportData.DHJHtmlXQM = vschess.turn_DHJHtmlXQ(this.exportData.DHJHtmlXQ);
	return this;
};

// 非标准起始局面隐藏掉部分不支持的导出格式
vschess.load.prototype.hideExportFormatIfNeedStart = function(){
	if (this.getFenByStep(0).split(" ", 2).join(" ") === vschess.defaultFen.split(" ", 2).join(" ")) {
		for (var i in vschess.exportFormatList) {
			this.exportFormatOptions[i][0].style.display = "block";
		}
	}
	else {
		for (var i = 0; i < vschess.exportFormatListIfNeedStart.length; ++i) {
			this.exportFormatOptions[vschess.exportFormatListIfNeedStart[i]][0].style.display = "none";
		}
	}

	return this;
};

// 创建猜想展示箭头
vschess.load.prototype.createGuessArrow = function(){
    this.guessArrowRed   = $('<div class="vschess-guess-arrow vschess-guess-arrow-red"><span class="vschess-guess-arrow-head"></span><span class="vschess-guess-arrow-body"></span></div>');
    this.guessArrowBlack = $('<div class="vschess-guess-arrow vschess-guess-arrow-black"><span class="vschess-guess-arrow-head"></span><span class="vschess-guess-arrow-body"></span></div>');
    this.board.children(".vschess-guess-arrow").remove();
    this.board.append(this.guessArrowRed).append(this.guessArrowBlack);
    return this;
};

// 显示猜想展示箭头
vschess.load.prototype.showGuessArrow = function(player, move){
    if (!vschess.RegExp().Node.test(move)) {
        return this;
    }

    var arrow     = player === "b" ? this.guessArrowBlack : this.guessArrowRed;
    var from      = vschess.turn[this.getTurn() >> 1 ? 3 : 0][vschess.i2b[move.substring(0, 2)]];
    var   to      = vschess.turn[this.getTurn() >> 1 ? 3 : 0][vschess.i2b[move.substring(2, 4)]];
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

    var degStyle = vschess.degToRotateCSS(deg);
    arrow.attr({ style: degStyle }).css({ top: centerY, left: centerX, height: height, marginTop: -height / 2 }).addClass("vschess-guess-arrow-show");
    return this;
};

// 隐藏猜想展示箭头
vschess.load.prototype.hideGuessArrow = function(player){
    if (player) {
        var arrow = player === "b" ? this.guessArrowBlack : this.guessArrowRed;
        arrow.removeClass("vschess-guess-arrow-show");
    }
    else {
        this.hideGuessArrow("r").hideGuessArrow("b");
    }

    return this;
};

// 创建帮助区域
vschess.load.prototype.createHelp = function(){
	if (this._.helpAreaCreated) {
		return this;
	}

	this._.helpAreaCreated = true;
	var _this = this;
	var helpDetail = this.options.help.replace(/#quickStepOffsetRound#/g, this._.quickStepOffset / 2).replace(/#quickStepOffset#/g, this._.quickStepOffset);
	this.helpArea = $('<div class="vschess-help-area"></div>');
	this.helpArea.html('<div class="vschess-help-area-detail">' + helpDetail + '</div>');
	this.DOM.append(this.helpArea);
	this.helpAreaClose = $('<button type="button" class="vschess-button vschess-help-close">\u5173 \u95ed</button>');
	this.helpAreaClose.bind(this.options.click, function(){ _this.hideHelpArea(); });
	this.helpArea.append(this.helpAreaClose);
	return this;
};

// 刷新帮助信息
vschess.load.prototype.refreshHelp = function(){
	if (!this._.helpAreaCreated) {
		return this;
	}

	var helpDetail = this.options.help.replace(/#quickStepOffsetRound#/g, this._.quickStepOffset / 2).replace(/#quickStepOffset#/g, this._.quickStepOffset);
	this.helpArea.children(".vschess-help-area-detail").html(helpDetail);
	return this;
};

// 显示帮助区域
vschess.load.prototype.showHelpArea = function(){
	this.createHelp();
	this.helpArea.addClass("vschess-help-show");
	return this;
};

// 隐藏帮助区域
vschess.load.prototype.hideHelpArea = function(){
	if (!this._.helpAreaCreated) {
		return this;
	}

	this.helpArea.removeClass("vschess-help-show");
	return this;
};

// 创建棋局信息区域
vschess.load.prototype.createInfo = function(){
	var _this = this;
  this.infoTitle = $('<div class="vschess-tab-title vschess-tab-title-info">' + this.options.tagName.info + '</div>');
	this.infoArea  = $('<div class="vschess-tab-body vschess-tab-body-info"></div>');
	this.tabArea.children(".vschess-tab-title-info, .vschess-tab-body-info").remove();
	this.tabArea.append(this.infoTitle);
	this.tabArea.append(this.infoArea );
	this.infoTitle.bind(this.options.click, function(){ _this.showTab("info"); });
	this.createInfoList();
	return this;
};

// 创建棋局信息列表
vschess.load.prototype.createInfoList = function(){
	var _this = this;
	this.chessInfo = vschess.dataToInfo(this.chessData, this.options.parseType);
	this.setChessTitle(this.chessInfo && this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb");
	this.infoList = $('<ul class="vschess-tab-body-info-list"></ul>');
	this.infoArea.append(this.infoList);
	this.insertInfoByCurrent();
	this.infoEdit  = $('<button type="button" class="vschess-button vschess-tab-body-info-edit" >\u7f16 \u8f91</button>');
	this.infoEmpty = $('<button type="button" class="vschess-button vschess-tab-body-info-empty">\u6e05 \u7a7a</button>');
	this.infoArea.append(this.infoEdit );
	this.infoArea.append(this.infoEmpty);
	this.infoEdit.bind(this.options.click, function(){ _this.showInfoEditor(); });

	this.infoEmpty.bind(this.options.click, function(){
		if (!confirm("\u786e\u5b9a\u8981\u6e05\u7a7a\u6240\u6709\u4fe1\u606f\u5417\uff1f")) {
			return false;
		}

		_this.chessInfo = {};
		_this.insertInfoByCurrent();
		_this.refreshInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
	});

	return this;
};

// 填充当前棋谱信息
vschess.load.prototype.insertInfoByCurrent = function(){
	this.infoItem = {};
	this.infoList.empty();

	for (var i in this.chessInfo) {
		this.infoItem[i] = $('<li class="vschess-tab-body-info-item">' + vschess.info.name[i] + '\uff1a' + vschess.showText(this.chessInfo[i], i) + '</li>');
		this.infoList.append(this.infoItem[i]);
	}

	return this;
};

// 创建棋局信息编辑器
vschess.load.prototype.createInfoEditor = function(){
	if (this._.infoEditorCreated) {
		return this;
	}

	var _this = this;
	this._.infoEditorCreated = true;
	this.infoEditorArea = $('<div class="vschess-info-editor-area"></div>');
	this.infoEditorList = $('<ul class="vschess-info-editor-list"></ul>');
	this.infoEditorArea.append(this.infoEditorList);
	this.infoEditorItem = {};
	this.infoEditorItemName  = {};
	this.infoEditorItemValue = {};
	this.infoEditorItemAuto  = {};
	this.DOM.append(this.infoEditorArea);

	for (var i in vschess.info.name) {
		this.infoEditorItem     [i] = $('<li class="vschess-info-editor-item vschess-info-editor-item-' + i + '"></li>');
		this.infoEditorItemName [i] = $('<div class="vschess-info-editor-item-name vschess-info-editor-item-name-' + i + '">' + vschess.info.name[i] + '\uff1a</div></li>');
		this.infoEditorItemValue[i] = $('<input type="' + (i === "date" ? "date" : "text") + '" class="vschess-info-editor-item-value vschess-info-editor-item-value-' + i + '" />');
		this.infoEditorItem     [i].append(this.infoEditorItemName [i]);
		this.infoEditorItem     [i].append(this.infoEditorItemValue[i]);
		this.infoEditorList        .append(this.infoEditorItem     [i]);

		if (i === "result") {
			var radio_name = "vschess-info-editor-item-value-result-radio-name-" + vschess.guid();
			var r_randomId = "vschess-info-editor-item-value-result-label-id-r-" + vschess.guid();
			var b_randomId = "vschess-info-editor-item-value-result-label-id-b-" + vschess.guid();
			var d_randomId = "vschess-info-editor-item-value-result-label-id-d-" + vschess.guid();
			var u_randomId = "vschess-info-editor-item-value-result-label-id-u-" + vschess.guid();

			this.infoEditorItemValueResult = {
				r_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-r" for="' + r_randomId + '">\u7ea2\u80dc</label>'),
				b_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-b" for="' + b_randomId + '">\u9ed1\u80dc</label>'),
				d_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-d" for="' + d_randomId + '">\u548c\u68cb</label>'),
				u_label: $('<label class="vschess-info-editor-item-value-result-label vschess-info-editor-item-value-result-label-u" for="' + u_randomId + '">\u672a\u77e5</label>'),
				r_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-r" id="' + r_randomId + '" />'),
				b_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-b" id="' + b_randomId + '" />'),
				d_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-d" id="' + d_randomId + '" />'),
				u_radio: $('<input type="radio" name="' + radio_name + '" class="vschess-info-editor-item-value-result-radio vschess-info-editor-item-value-result-radio-u" id="' + u_randomId + '" />')
			};

			this.infoEditorItem.result.append(this.infoEditorItemValueResult.r_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.r_label);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.b_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.b_label);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.d_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.d_label);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.u_radio);
			this.infoEditorItem.result.append(this.infoEditorItemValueResult.u_label);
		}

		if (~vschess.autoInfo.indexOf(i)) {
			this.infoEditorItemAuto[i] = $('<button type="button" class="vschess-button vschess-info-editor-item-auto vschess-info-editor-item-auto-' + i + '" alt="\u6839\u636e\u5f53\u524d\u5206\u652f\u81ea\u52a8\u8bc6\u522b' + vschess.info.name[i] + '" title="\u6839\u636e\u5f53\u524d\u5206\u652f\u81ea\u52a8\u8bc6\u522b' + vschess.info.name[i] + '">\u8bc6 \u522b</button>');
			this.infoEditorItem    [i].append(this.infoEditorItemAuto[i]);
		}
	}

	this.setInfoEditorItemValueResult(this.infoEditorItemValue.result.val());
	this.infoEditorOK     = $('<button type="button" class="vschess-button vschess-info-editor-ok"    >\u786e \u5b9a</button>');
	this.infoEditorEmpty  = $('<button type="button" class="vschess-button vschess-info-editor-empty" >\u6e05 \u7a7a</button>');
	this.infoEditorCancel = $('<button type="button" class="vschess-button vschess-info-editor-cancel">\u53d6 \u6d88</button>');

	this.infoEditorOK.bind(this.options.click, function(){
		_this.chessInfo = _this.getInfoFromEditor();
		_this.setChessTitle(_this.chessInfo && _this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb");
		_this.insertInfoByCurrent();
		_this.hideInfoEditor();
		_this.rebuildExportAll();
		_this.setExportFormat();
	});

	this.infoEditorEmpty.bind(this.options.click, function(){
		if (!confirm("\u786e\u5b9a\u8981\u6e05\u7a7a\u6240\u6709\u4fe1\u606f\u5417\uff1f")) {
			return false;
		}

		for (var i in vschess.info.name) {
			_this.infoEditorItemValue[i].val("");
		}
	});

	this.infoEditorCancel.bind(this.options.click, function(){ _this.hideInfoEditor(); });
	this.infoEditorArea.append(this.infoEditorOK    );
	this.infoEditorArea.append(this.infoEditorEmpty );
	this.infoEditorArea.append(this.infoEditorCancel);
	this.infoEditorItemAuto.ecco          .bind(this.options.click, function(){ _this.infoEditorItemValue.ecco     .val(vschess.WXF2ECCO(_this.moveNameList.WXF).ecco     ); });
	this.infoEditorItemAuto.open          .bind(this.options.click, function(){ _this.infoEditorItemValue.open     .val(vschess.WXF2ECCO(_this.moveNameList.WXF).opening  ); });
	this.infoEditorItemAuto.variation     .bind(this.options.click, function(){ _this.infoEditorItemValue.variation.val(vschess.WXF2ECCO(_this.moveNameList.WXF).variation); });
	this.infoEditorItemValueResult.r_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("1-0"    ); });
	this.infoEditorItemValueResult.b_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("0-1"    ); });
	this.infoEditorItemValueResult.d_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("1/2-1/2"); });
	this.infoEditorItemValueResult.u_radio.bind(this.options.click, function(){ _this.infoEditorItemValue.result   .val("*"      ); });

	this.infoEditorItemAuto.result.bind(this.options.click, function(){
		var result = _this.getAutoResultByCurrent();
		_this.infoEditorItemValue.result.val(result);
		_this.setInfoEditorItemValueResult(result);
	});

	return this.refreshInfoEditor();
};

// 刷新棋局信息编辑器
vschess.load.prototype.refreshInfoEditor = function(){
	this.createInfoEditor();

	for (var i in vschess.info.name) {
		if (i === "result") {
			var result = vschess.dataText(this.chessInfo[i] || "", i);
			this.infoEditorItemValue.result.val(result);
			this.setInfoEditorItemValueResult(result);
		}
		else if (i === "date") {
			this.infoEditorItemValue[i].val(vschess.dateFormat(this.chessInfo[i] || "", i));
		}
		else {
			this.infoEditorItemValue[i].val(vschess.dataText(this.chessInfo[i] || "", i));
		}
	}

	return this.setChessTitle(this.chessInfo && this.chessInfo.title || "\u4e2d\u56fd\u8c61\u68cb");
};

// 根据结果设置选择结果单选按钮
vschess.load.prototype.setInfoEditorItemValueResult = function(result){
	this.createInfoEditor();

	switch (result) {
		case     "1-0": this.infoEditorItemValueResult.r_radio.attr("checked", "checked"); break;
		case     "0-1": this.infoEditorItemValueResult.b_radio.attr("checked", "checked"); break;
		case "1/2-1/2": this.infoEditorItemValueResult.d_radio.attr("checked", "checked"); break;
		default       : this.infoEditorItemValueResult.u_radio.attr("checked", "checked"); break;
	}

	return this;
};

// 设置棋盘标题
vschess.load.prototype.setChessTitle = function(title){
	this.title.text(title);
	return this;
};

// 显示棋局信息编辑器
vschess.load.prototype.showInfoEditor = function(){
	this.createInfoEditor();
	this.infoEditorArea.addClass("vschess-info-editor-show");
	return this;
};

// 隐藏棋局信息编辑器
vschess.load.prototype.hideInfoEditor = function(){
	if (!this._.infoEditorCreated) {
		return this;
	}

	this.infoEditorArea.removeClass("vschess-info-editor-show");
	return this;
};

// 从编辑器中获取最新棋谱信息数据
vschess.load.prototype.getInfoFromEditor = function(){
	var newInfo = {};

	for (var i in vschess.info.name) {
		var value = this.infoEditorItemValue[i].val();
		value && (newInfo[i] = value);
	}

	return newInfo;
};

// 获取当前对弈结果
vschess.load.prototype.getResultByCurrent = function(){
	if (this._.editCreated) {
		return this.infoEditorItemValue.result.val() || this.getAutoResultByCurrent();
	}

	return this.getAutoResultByCurrent();
};

// 自动识别当前分支的对弈结果
vschess.load.prototype.getAutoResultByCurrent = function(){
	var legalLength = this.legalList ? this.legalList.length : 0;
	var repeatLongThreatLength = this.repeatLongThreatMoveList ? this.repeatLongThreatMoveList.length : 0;
	var lastSituation = this.situationList[this.lastSituationIndex()];

	if (this.getBanRepeatLongThreat() && legalLength <= repeatLongThreatLength) {
		return lastSituation[0] === 1 ? "0-1" : "1-0";
	}

	return !vschess.hasLegalMove(lastSituation) ? lastSituation[0] === 1 ? "0-1" : "1-0" : "*";
};

// 创建本地保存链接标签
vschess.load.prototype.createLocalDownloadLink = function(){
	this.localDownloadLink = $('<a class="vschess-local-download-link"></a>').appendTo(this.DOM);
	return this;
};

// 本地保存
vschess.load.prototype.localDownload = function(filename, filedata, param){
	if (!vschess.localDownload) {
		return this;
	}

	param = $.extend({ type: "text/plain" }, param);
	var blob = new Blob([filedata], param);
	this.localDownloadLink.attr({ download: filename, href: URL.createObjectURL(blob) }).trigger("click");
	return this;
};

// 创建移动端额外标签按钮
vschess.load.prototype.createMobileTag = function () {
    var _this = this;

    this.mobileCloseTab = $('<div class="vschess-mobile-close-tab">\u68cb<br />\u76d8</div>');
    this.DOM.children(".vschess-mobile-close-tab").remove();
    this.DOM.append(this.mobileCloseTab);

    this.mobileCloseTab.bind(this.options.click, function(){
        _this.showTab("board");
    });

    this.mobileShowMoveList = $('<div class="vschess-mobile-show-move-list">\u7740<br />\u6cd5</div>');
    this.DOM.children(".vschess-mobile-show-move-list").remove();
    this.DOM.append(this.mobileShowMoveList);

    this.mobileShowMoveList.bind(this.options.click, function(){
        _this.showTab("move");
    });

    return this;
};

// 着法选择列表
vschess.load.prototype.createMoveSelectList = function(){
	this.DOM.children(".vschess-move-select-list").remove();
	this.moveSelectList = $('<ul class="vschess-move-select-list"></ul>');
	this.DOM.append(this.moveSelectList);
	return this;
};

// 刷新着法选择列表内所有着法
vschess.load.prototype.refreshMoveSelectListNode = function(){
	var _this = this;
	var startRound = this.situationList[0][1];
	var selectListNode = ['<li class="vschess-move-select-node-begin">===== \u68cb\u5c40\u5f00\u59cb' + (this.commentList[0] ? "*" : "") + ' =====</li>'];

	switch (this.getMoveFormat()) {
		case "iccs": var moveList = this.getTurnForMove() ? this.moveNameList.   ICCSM.slice(0) : this.moveNameList.   ICCS.slice(0); break;
		case "wxf" : var moveList = this.getTurnForMove() ? this.moveNameList.    WXFM.slice(0) : this.moveNameList.    WXF.slice(0); break;
		default    : var moveList = this.getTurnForMove() ? this.moveNameList.ChineseM.slice(0) : this.moveNameList.Chinese.slice(0); break;
	}

	this.situationList[0][0] === 1 ? moveList.shift() : moveList[0] = "";

	if (this.situationList[0][0] === 1 || this.situationList[0][0] === 2 && moveList.length > 1) {
		for (var i = 0; i < moveList.length; ++i) {
			i % 2 || selectListNode.push('<li class="vschess-move-select-node-round">', startRound++, '.</li>');
			selectListNode.push('<li class="vschess-move-select-node-', moveList[i] ? "move" : "blank", '">');
			selectListNode.push(moveList[i], this.commentList[!!moveList[0] + i] && moveList[i] ? "*" : "", '</li>');
		}
	}

	this.moveSelectList.html(selectListNode.join(""));
	this.moveSelectListSteps = this.moveSelectList.children().not(".vschess-move-select-node-round, .vschess-move-select-node-blank");

	this.moveSelectListSteps.each(function(index){
		var each = $(this);
		index && _this.changeLengthList[index - 1] > 1 && each.addClass("vschess-move-select-node-change");
		each.bind(_this.options.click, function(){ _this.setBoardByStep(index); });
	});

	return this.refreshMoveSelectListNodeColor();
};

// 着法列表着色
vschess.load.prototype.refreshMoveSelectListNodeColor = function(){
	this.moveSelectListSteps || this.refreshMoveListNode();
	this.moveSelectListSteps.removeClass("vschess-move-select-node-lose vschess-move-select-node-threat vschess-move-select-node-normal");

	var legalLength = this.legalList ? this.legalList.length : 0;
	var repeatLongThreatLength = this.repeatLongThreatMoveList ? this.repeatLongThreatMoveList.length : 0;

	if (legalLength === 0) {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-lose");
	}
	else if (vschess.checkThreat(this.situationList[this.getCurrentStep()])) {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-threat");
	}
	else if (this.getBanRepeatLongThreat() && legalLength <= repeatLongThreatLength) {
			this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-lose");
	}
	else {
		this.moveSelectListSteps.eq(this.getCurrentStep()).addClass("vschess-move-select-node-normal");
	}

	this.setMoveLeaveHide();
	return this;
};

// 避免当前着法进入滚动区域外
vschess.load.prototype.setMoveLeaveHide = function(){
	var bottomLine           = this.moveSelectList.height() - this.moveSelectListSteps.first().height();
	var currentTop           = this.moveSelectListSteps.eq(this.getCurrentStep()).position().top;
	var currentScrollTop     = this.moveSelectList.scrollTop();
	currentTop > bottomLine	&& this.moveSelectList.scrollTop(currentScrollTop + currentTop - bottomLine	);
	currentTop < 0			&& this.moveSelectList.scrollTop(currentScrollTop + currentTop				);
	return this;
};

// 变招选择列表
vschess.load.prototype.createChangeSelectList = function(){
	this.DOM.children(".vschess-change-select-title, .vschess-change-select-list").remove();
	this.changeSelectTitle = $('<div class="vschess-change-select-title"></div>');
	this.changeSelectList  = $('<ul class="vschess-change-select-list"></ul>');
	this.DOM.append(this.changeSelectTitle);
	this.DOM.append(this.changeSelectList);
	return this;
};

// 刷新变招选择列表内所有着法
vschess.load.prototype.refreshChangeSelectListNode = function(){
	if (this.getCurrentStep() <= 0) {
		this.changeSelectTitle.text("\u63d0\u793a\u4fe1\u606f");
		this.changeSelectList.empty();

		for (var i = 0; i < this.options.startTips.length; ++i) {
			this.changeSelectList.append('<li class="vschess-change-select-tips">' + this.options.startTips[i] + '</li>');
		}

		return this;
	}

	var _this = this;
	var selectListNode = [];
	var parentNode = this.selectDefault(this.getCurrentStep() - 1);
	var changeList  = parentNode.next;
	var currentNodeIndex = this.currentNodeList[this.getCurrentStep()];

	switch (this.getMoveFormat()) {
		case "iccs": var converter = vschess.Node2ICCS	; break;
		case "wxf" : var converter = vschess.Node2WXF	; break;
		default    : var converter = vschess.Node2Chinese; break;
	}

	for (var i = 0; i < changeList.length; ++i) {
		var changeMove	= this.getTurnForMove() ? vschess.turnMove(changeList[i].move) : changeList[i].move;
		var prevFen		= this.getFenByStep(this.getCurrentStep() - 1);

		selectListNode.push('<li class="vschess-change-select-node">');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-move">');
		selectListNode.push(converter(changeMove, prevFen, this.options).move, changeList[i].comment ? "*" : "", '</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-up">\u4e0a\u79fb</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-down">\u4e0b\u79fb</span>');
		selectListNode.push('<span class="vschess-change-select-node-text vschess-change-select-node-delete">\u5220\u9664</span>');
		selectListNode.push('</li>');
	}

	this.changeSelectTitle.text("\u53d8\u62db\u5217\u8868");
	this.changeSelectList.html(selectListNode.join(""));
	this.changeSelectListChanges = this.changeSelectList.children();
	this.changeSelectListChanges.first().addClass("vschess-change-select-node-first");
	this.changeSelectListChanges.last ().addClass("vschess-change-select-node-last" );

	this.changeSelectListChanges.each(function(index){
		var each = $(this);
		var move = changeList[index].move;
		index === currentNodeIndex && each.addClass("vschess-change-select-node-current");
		each.hasClass("vschess-change-select-node-current") && each.hasClass("vschess-change-select-node-first") && each.addClass("vschess-change-select-node-current-and-first");
		each.hasClass("vschess-change-select-node-current") && each.hasClass("vschess-change-select-node-last" ) && each.addClass("vschess-change-select-node-current-and-last" );

		each.bind(_this.options.click, function(){
			_this.setMoveDefaultAtNode(move, _this.getCurrentStep() - 1 ) && _this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-up").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (index <= 0) {
				return false;
			}

			var prevTarget = changeList[index - 1];
			changeList[index - 1] = changeList[index];
			changeList[index    ] = prevTarget;

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = index - 1;
			}
			else if (parentNode.defaultIndex === index - 1) {
				parentNode.defaultIndex = index;
			}

			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-down").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (index >= changeList.length - 1) {
				return false;
			}

			var prevTarget = changeList[index + 1];
			changeList[index + 1] = changeList[index];
			changeList[index    ] = prevTarget;

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = index + 1;
			}
			else if (parentNode.defaultIndex === index + 1) {
				parentNode.defaultIndex = index;
			}

			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode();
		});

		each.children(".vschess-change-select-node-delete").bind(_this.options.click, function(e){
			e.stopPropagation();

			if (!confirm("\u786e\u5b9a\u8981\u5220\u9664\u8be5\u7740\u6cd5\u5417\uff1f\u8be5\u7740\u6cd5\u53ca\u4e4b\u540e\u7684\u6240\u6709\u7740\u6cd5\u90fd\u5c06\u88ab\u5220\u9664\uff01")) {
				return false;
			}

			for (var i = index; i < changeList.length; ++i) {
				changeList[i] = changeList[i + 1];
			}

			if (parentNode.defaultIndex === index) {
				parentNode.defaultIndex = 0;
			}
			else if (parentNode.defaultIndex > index) {
				--parentNode.defaultIndex;
			}

			--changeList.length;
			_this.rebuildSituation().refreshBoard().refreshMoveSelectListNode().refreshNodeLength();
		});
	});

	this.setChangeLeaveHide();
	return this;
};

// 避免当前变招进入滚动区域外
vschess.load.prototype.setChangeLeaveHide = function(){
	var bottomLine           = this.changeSelectList.height() - this.changeSelectListChanges.first().height();
	var currentTop           = this.changeSelectListChanges.eq(this.currentNodeList[this.getCurrentStep()]).position().top;
	var currentScrollTop     = this.changeSelectList.scrollTop();
	currentTop > bottomLine	&& this.changeSelectList.scrollTop(currentScrollTop + currentTop - bottomLine);
	currentTop < 0			&& this.changeSelectList.scrollTop(currentScrollTop + currentTop			 );
	return this;
};

// 刷新着法列表及变招列表
vschess.load.prototype.refreshMoveListNode = function(){
	return this.refreshMoveSelectListNode().refreshChangeSelectListNode();
};

// 设置当前着法列表格式
vschess.load.prototype.setMoveFormat = function(format){
	switch (format) {
		case "iccs": this._.moveFormat = "iccs"		; break;
		case "wxf" : this._.moveFormat = "wxf"		; break;
		default    : this._.moveFormat = "chinese"	; break;
	}

	return this;
};

// 取得当前着法列表格式
vschess.load.prototype.getMoveFormat = function(){
	return this._.moveFormat;
};

// 移动一枚棋子
vschess.load.prototype.movePieceByPieceIndex = function(from, to, animationTime, callback, callbackIllegal){
	// 动画过程中，直接跳过
	if (this.animating) {
		return this;
	}

	if (typeof animationTime === "function") {
		callbackIllegal = callback;
		callback = animationTime;
		animationTime = 0;
	}

	from = vschess.limit(from, 0, 89);
	to   = vschess.limit(to  , 0, 89);
	animationTime = vschess.limit(animationTime, 0, Infinity);

	var From = vschess.b2i[vschess.turn[this.getTurn()][from]];
	var To   = vschess.b2i[vschess.turn[this.getTurn()][to  ]];
	var Move = From + To;

	// 着法不合法，不移动棋子
	var isBanRepeatLongThreat = this.getBanRepeatLongThreat() && ~this.repeatLongThreatMoveList.indexOf(Move);
	var isBanRepeatLongKill   = this.getBanRepeatLongKill  () && ~this.repeatLongKillMoveList  .indexOf(Move);

	if (!~this.legalMoveList.indexOf(Move) || isBanRepeatLongThreat || isBanRepeatLongKill) {
		typeof callbackIllegal === "function" && callbackIllegal();
		return this;
	}

	// 动画过渡，即动画时间大于 100，100毫秒以下效果很差，直接屏蔽
	if (animationTime >= 100) {
		var _this = this;
		this.animating = true;
		this.clearSelect();
		this.clearSelect(-1);
		this.clearPiece(from);
		this.clearPiece(-1);
		this.setSelectByPieceIndex(from);
		this.setSelectByPieceIndex(-1);

		var ua = navigator.userAgent.toLowerCase();
		var isIE6 = ~ua.indexOf("msie 6");
		var isIE7 = ~ua.indexOf("msie 7");
		var isIE8 = ~ua.indexOf("msie 8");

		// 低版本 IE 模式下，使用 js 的动画效果
		if (isIE6 || isIE7 || isIE8) {
			var _playSound = true;
			var finishHandlerRunned = false;

			var finishHandler = function(){
				_this.setMoveDefaultAtNode(Move) && _this.rebuildSituation().refreshMoveSelectListNode();
				_this.setBoardByOffset(1);
				_this.setSelectByStep();
				_this.animatePiece.hide();
				_playSound && _this.playSoundBySituation();
				_this.animating = false;
				finishHandlerRunned = true;

				_this.pieceRotateDeg[to]   = _this.pieceRotateDeg[from];
				_this.pieceRotateDeg[from] = Math.random() * 360;
				_this.getPieceRotate() ? _this.loadPieceRotate() : _this.clearPieceRotate();

				typeof _this.callback_afterAnimate === "function" && _this.callback_afterAnimate();
				typeof callback === "function" && callback();
			};

			var sIndex = vschess.b2s[vschess.turn[this.getTurn()][from]];
			var piece  = this.situationList[this.getCurrentStep()][sIndex];

			this.getPieceRotate() ? this.animatePiece.children("span").attr({ style: vschess.degToRotateCSS(this.pieceRotateDeg[from]) }) : this.animatePiece.children("span").removeAttr("style");

			this.animatePiece.addClass("vschess-piece-" + vschess.n2f[piece]).css({
				top : this.piece.eq(from).position().top,
				left: this.piece.eq(from).position().left
			}).show().animate({
				top : this.piece.eq(to).position().top,
				left: this.piece.eq(to).position().left
			}, animationTime, finishHandler);

			this.stopAnimate = function(playSound){
				typeof playSound !== "undefined" && (_playSound = playSound);
				_this.animatePiece.stop();
			};

			setTimeout(function(){ finishHandlerRunned || finishHandler(); }, animationTime + 500);
		}

		// 其他浏览器使用原生 CSS3 动画效果
		else {
			var finishHandlerRunned = false;

			var finishHandler = function(playSound){
				var _playSound = true;
				typeof playSound !== "undefined" && (_playSound = playSound);

				_this.setMoveDefaultAtNode(Move) && _this.rebuildSituation().refreshMoveSelectListNode();
				_this.setBoardByOffset(1);
				_this.setSelectByStep();
				_this.animatePiece.hide().css({ "-webkit-transition": "0ms", "-moz-transition": "0ms", "-ms-transition": "0ms", "-o-transition": "0ms", "transition": "0ms" });
				_playSound && _this.playSoundBySituation();
				_this.animating = false;

				setTimeout(function(){
					_this.animatePiece.hide().css({
						"-webkit-transform": "translate3d(0px, 0px, 0px)",
						   "-moz-transform": "translate3d(0px, 0px, 0px)",
							"-ms-transform": "translate3d(0px, 0px, 0px)",
						     "-o-transform": "translate3d(0px, 0px, 0px)",
						        "transform": "translate3d(0px, 0px, 0px)"
					});
				}, vschess.threadTimeout);

				var Evt = _this.animatePiece[0];
				Evt.removeEventListener("webkitTransitionEnd", finishHandler);
				Evt.removeEventListener(   "mozTransitionEnd", finishHandler);
				Evt.removeEventListener(    "msTransitionEnd", finishHandler);
				Evt.removeEventListener(     "oTransitionEnd", finishHandler);
				Evt.removeEventListener(      "transitionend", finishHandler);

				finishHandlerRunned = true;

				_this.pieceRotateDeg[to]   = _this.pieceRotateDeg[from];
				_this.pieceRotateDeg[from] = Math.random() * 360;
				_this.getPieceRotate() ? _this.loadPieceRotate() : _this.clearPieceRotate();

				typeof _this.callback_afterAnimate === "function" && _this.callback_afterAnimate();
				typeof callback === "function" && callback();
			};

			var deltaX = this.piece.eq(to).position().left - this.piece.eq(from).position().left;
			var deltaY = this.piece.eq(to).position().top  - this.piece.eq(from).position().top;
			var sIndex = vschess.b2s[vschess.turn[this.getTurn()][from]];
			var piece  = this.situationList[this.getCurrentStep()][sIndex];

			this.getPieceRotate() ? this.animatePiece.children("span").attr({ style: vschess.degToRotateCSS(this.pieceRotateDeg[from]) }) : this.animatePiece.children("span").removeAttr("style");

			var Evt = this.animatePiece.addClass("vschess-piece-" + vschess.n2f[piece]).css({
				top : this.piece.eq(from).position().top,
				left: this.piece.eq(from).position().left,
				"-webkit-transition": animationTime + "ms",
				   "-moz-transition": animationTime + "ms",
					"-ms-transition": animationTime + "ms",
				     "-o-transition": animationTime + "ms",
				        "transition": animationTime + "ms"
			}).show()[0];

			Evt.addEventListener("webkitTransitionEnd", finishHandler);
			Evt.addEventListener(   "mozTransitionEnd", finishHandler);
			Evt.addEventListener(    "msTransitionEnd", finishHandler);
			Evt.addEventListener(     "oTransitionEnd", finishHandler);
			Evt.addEventListener(      "transitionend", finishHandler);

			setTimeout(function(){
				_this.animatePiece.css({
					"-webkit-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					   "-moz-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
						"-ms-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					     "-o-transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)",
					        "transform": "translate3d(" + deltaX + "px, " + deltaY + "px, 0px)"
				});
			}, vschess.threadTimeout);

			this.stopAnimate = finishHandler;
			setTimeout(function(){ finishHandlerRunned || finishHandler(); }, animationTime + 500);
		}
	}

	// 无动画过渡，即动画时间为 0
	else {
		this.stopAnimate = function(){};
		this.setMoveDefaultAtNode(Move) && this.rebuildSituation().refreshMoveSelectListNode();
		this.setBoardByOffset(1);
		this.setSelectByStep();
		this.playSoundBySituation();
		typeof this.callback_afterAnimate === "function" && this.callback_afterAnimate();
		typeof callback === "function" && callback();
	}

	return this;
};

// 根据节点 ICCS 移动一枚棋子
vschess.load.prototype.movePieceByNode = function(move, animationTime, callback, callbackIllegal){
	this.getTurnForMove() && (move = vschess.turnMove(move));
	var from = vschess.turn[this.getTurn()][vschess.i2b[move.substring(0, 2)]];
	var to   = vschess.turn[this.getTurn()][vschess.i2b[move.substring(2, 4)]];
	return this.movePieceByPieceIndex(from, to, animationTime, callback, callbackIllegal);
};

// 根据中文着法移动一枚棋子
vschess.load.prototype.movePieceByChinese = function(move, animationTime, callback, callbackIllegal){
	return this.movePieceByNode(vschess.Chinese2Node(move, this.getCurrentFen()).move, animationTime, callback, callbackIllegal);
};

// 根据 WXF 着法移动一枚棋子
vschess.load.prototype.movePieceByWXF = function(move, animationTime, callback, callbackIllegal){
	return this.movePieceByNode(vschess.WXF2Node(move, this.getCurrentFen()).move, animationTime, callback, callbackIllegal);
};

// 以动画方式过渡到下一个局面
vschess.load.prototype.animateToNext = function(animationTime, callback){
	if (this.animating || this.getCurrentStep() >= this.lastSituationIndex()) {
		return this;
	}

	var from = vschess.turn[this.getTurn()][vschess.i2b[this.getMoveByStep(this.getCurrentStep() + 1).substring(0, 2)]];
	var to   = vschess.turn[this.getTurn()][vschess.i2b[this.getMoveByStep(this.getCurrentStep() + 1).substring(2, 4)]];
	this.movePieceByPieceIndex(from, to, vschess.limit(animationTime, 0, Infinity), callback);
	return this;
};

// 设置动画时间
vschess.load.prototype.setAnimationTime = function(animationTime){
	this._.animationTime = vschess.limit(animationTime, 0, Infinity);
	return this;
};

// 取得动画时间
vschess.load.prototype.getAnimationTime = function(animationTime){
	return this._.animationTime >= this._.playGap * 100 ? this._.playGap * 50 : this._.animationTime;
};

// 设置禁止重复长打状态
vschess.load.prototype.setBanRepeatLongThreat = function(banRepeatLongThreat){
	this._.banRepeatLongThreat = !!banRepeatLongThreat;
	this.setConfigItemValue("banRepeatLongThreat", this._.banRepeatLongThreat);
	return this;
};

// 取得禁止重复长打状态
vschess.load.prototype.getBanRepeatLongThreat = function(){
	return this._.banRepeatLongThreat;
};

// 设置禁止重复一将一杀状态
vschess.load.prototype.setBanRepeatLongKill = function(banRepeatLongKill){
	this._.banRepeatLongKill = !!banRepeatLongKill;
	this.setConfigItemValue("banRepeatLongKill", this._.banRepeatLongKill);
	return this;
};

// 取得禁止重复一将一杀状态
vschess.load.prototype.getBanRepeatLongKill = function(){
	return this._.banRepeatLongKill;
};

// 设置违例提示状态
vschess.load.prototype.setIllegalTips = function(illegalTips){
	this._.illegalTips = !!illegalTips;
	this.setConfigItemValue("illegalTips", this._.illegalTips);
	return this;
};

// 取得违例提示状态
vschess.load.prototype.getIllegalTips = function(){
	return this._.illegalTips;
};

// 重建所有局面，一般用于变招切换和节点发生变化
vschess.load.prototype.rebuildSituation = function(){
	this.situationList = [vschess.fenToSituation(this.node.fen)];
	this.fenList   = [this.node.fen];
	this.moveList  = [this.node.fen];
	this.eatStatus = [false];
	this.commentList = [this.node.comment || ""];
	this.changeLengthList = [ ];
	this.currentNodeList  = [0];
	this.nodeList = [this.node];

	var turnFen = vschess.turnFen(this.node.fen);

	this.moveNameList = {
		WXF		: [this.node.fen], WXFM		: [turnFen],
		ICCS	: [this.node.fen], ICCSM	: [turnFen],
		Chinese	: [this.node.fen], ChineseM	: [turnFen]
	};

	for (var currentNode = this.node; currentNode.next.length; ) {
		this.changeLengthList.push(currentNode.next.length );
		this.currentNodeList .push(currentNode.defaultIndex);
		currentNode = currentNode.next[currentNode.defaultIndex];
		this.nodeList.push(currentNode);

		var from = vschess.i2s[currentNode.move.substring(0, 2)];
		var to   = vschess.i2s[currentNode.move.substring(2, 4)];
		var lastSituation = this.situationList[this.lastSituationIndex()].slice(0);
		var prevFen = vschess.situationToFen(lastSituation);
		var prevPieceCount = vschess.countPieceLength(lastSituation);

		lastSituation[to  ] = lastSituation[from];
		lastSituation[from] = 1;
		lastSituation[0]    = 3  -   lastSituation[0];
		lastSituation[0]  === 1 && ++lastSituation[1];

		this.eatStatus		.push(vschess.countPieceLength(lastSituation) !== prevPieceCount);
		this.moveList		.push(currentNode.move);
		this.commentList	.push(currentNode.comment || "");
		this.situationList	.push(lastSituation);
		this.fenList		.push(vschess.situationToFen(lastSituation));

		var wxf  = vschess.Node2WXF(currentNode.move, prevFen).move;
		var wxfM = wxf.charCodeAt(1) > 96 ? vschess.Node2WXF(vschess.turnMove(currentNode.move), vschess.turnFen(prevFen)).move : vschess.turnWXF(wxf);

		this.moveNameList.   ICCS .push(vschess.Node2ICCS_NoFen(			   currentNode.move ));
		this.moveNameList.   ICCSM.push(vschess.Node2ICCS_NoFen(vschess.turnMove(currentNode.move)));
		this.moveNameList.    WXF .push(wxf );
		this.moveNameList.    WXFM.push(wxfM);
		this.moveNameList.Chinese .push(vschess.Node2Chinese(wxf , prevFen, this.options));
		this.moveNameList.ChineseM.push(vschess.Node2Chinese(wxfM, prevFen, this.options));
	}

	return this.rebuildExportAll().setExportFormat();
};

// 选择指定默认节点
vschess.load.prototype.selectDefault = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var currentNode = this.node;

	for (var i = 0; i < step; ++i) {
		currentNode = currentNode.next[currentNode.defaultIndex];
	}

	return currentNode;
};

// 节点内是否含有指定着法
vschess.load.prototype.hasMoveAtNode = function(move, step){
	var nextList = this.selectDefault(vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep())).next;

	for (var i = 0; i < nextList.length; ++i) {
		if (nextList[i].move === move) {
			return true;
		}
	}

	return false;
};

// 节点增加着法
vschess.load.prototype.addNodeByMoveName = function(move, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (!this.hasMoveAtNode(move, step)) {
		this.selectDefault(step).next.push({ move: move, comment: "", next: [], defaultIndex: 0 });
		++this._.nodeLength;
	}

	return this;
};

// 将节点内指定着法设为默认着法，并返回节点是否发生变化
vschess.load.prototype.setMoveDefaultAtNode = function(move, step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var currentNode = this.selectDefault(step);

	if (currentNode.next.length && currentNode.next[currentNode.defaultIndex].move === move) {
		return false;
	}

	for (var i = 0; i < currentNode.next.length; ++i) {
		if (currentNode.next[i].move === move) {
			currentNode.defaultIndex = i;
			this.setSaved(false);
			return true;
		}
	}

	this.addNodeByMoveName(move, step);
	currentNode.defaultIndex = currentNode.next.length - 1;
	this.setSaved(false);
	return true;
};

// 取得着法列表
vschess.load.prototype.getMoveNameList = function(format, isMirror){
	typeof isMirror === "undefined" && (isMirror = this.getTurnForMove());

	switch (format) {
		case  "wxf": return isMirror ? this.moveNameList.    WXFM.slice(0) : this.moveNameList.    WXF.slice(0);
		case "iccs": return isMirror ? this.moveNameList.   ICCSM.slice(0) : this.moveNameList.   ICCS.slice(0);
		default    : return isMirror ? this.moveNameList.ChineseM.slice(0) : this.moveNameList.Chinese.slice(0);
	}

	return this;
};

// 刷新节点数
vschess.load.prototype.refreshNodeLength = function(){
	var total = 1;

	function countNode(node){
		total += node.next.length;

		for (var i = 0; i < node.next.length; ++i) {
			countNode(node.next[i]);
		}
	}

	countNode(this.node);
	this._.nodeLength = total;
	return this;
};

// 取得节点数
vschess.load.prototype.getNodeLength = function(){
	return this._.nodeLength;
};

// 设置当前节点树
vschess.load.prototype.setNode = function(node){
	this.node = node;
	this.refreshNodeLength();
	return this;
};

// 棋子单击事件绑定
vschess.load.prototype.pieceClick = function(){
	var _this = this;

	this.piece.each(function(index){
		$(this).bind(_this.options.click, function(){
			// 是本方棋子，切换选中状态
			if (_this.isPlayer(index)) {
				if (_this.getClickResponse() > 1 && _this.isR(index) || (_this.getClickResponse() & 1) && _this.isB(index)) {
					_this.toggleSelectByPieceIndex(index);
					_this.playSound("click");
				}
			}

			// 不是本方棋子，即为走子目标或空白点
			else {
				// 违例提示
				if (_this.getIllegalTips()) {
					var From = vschess.b2i[vschess.turn[_this.getTurn()][_this.getCurrentSelect()]];
					var To   = vschess.b2i[vschess.turn[_this.getTurn()][index]];
					var Move = From + To;

					if (_this.getBanRepeatLongThreat() && ~_this.repeatLongThreatMoveList.indexOf(Move)) {
						alert("\u7981\u6b62\u91cd\u590d\u957f\u6253\uff01");
					}

					if (_this.getBanRepeatLongKill() && ~_this.repeatLongKillMoveList.indexOf(Move)) {
						alert("\u7981\u6b62\u91cd\u590d\u4e00\u5c06\u4e00\u6740\uff01");
					}
				}

				// 合法着法，移动棋子
				if (_this.getLegalByPieceIndex(_this.getCurrentSelect(), index)) {
					_this.callback_beforeClickAnimate();
					_this.movePieceByPieceIndex(_this.getCurrentSelect(), index, _this.getAnimationTime(), function(){ _this.callback_afterClickAnimate(); });
				}

				// 不合法着法，播放非法着法音效
				else if (~_this.getCurrentSelect()) {
					_this.playSound("illegal");
				}
			}
		});
	});

	return this;
};

// 设置单击响应状态
vschess.load.prototype.setClickResponse = function(clickResponse){
	this._.clickResponse = vschess.limit(clickResponse, 0, 3);
	return this;
};

// 取得单击相应状态
vschess.load.prototype.getClickResponse = function(){
	return this._.clickResponse;
};

// 设置走子提示状态
vschess.load.prototype.setMoveTips = function(moveTips){
	this._.moveTips = !!moveTips;
	this.setConfigItemValue("moveTips", this._.moveTips);
	return this;
};

// 取得走子提示状态
vschess.load.prototype.getMoveTips = function(){
	return this._.moveTips;
};

// 设置指定棋子合法目标格状态，-1 表示动画棋子
vschess.load.prototype.setLegalByPieceIndex = function(index){
	index = vschess.limit(index, -1, 89);
	~index ? this.piece.eq(index).addClass("vschess-piece-S") : this.animatePiece.addClass("vschess-piece-S");
	return this;
};

// 获取指定棋子合法目标格状态
vschess.load.prototype.getLegalByPieceIndex = function(startIndex, targetIndex){
	 startIndex		= vschess.limit( startIndex, 0, 89, this.getCurrentSelect());
	targetIndex		= vschess.limit(targetIndex, 0, 89, this.getCurrentSelect());
	var  startPos	= vschess.b2i[vschess.turn[this.getTurn()][vschess.limit( startIndex, 0, 89)]];
	var targetPos	= vschess.b2i[vschess.turn[this.getTurn()][vschess.limit(targetIndex, 0, 89)]];
	var move		= startPos + targetPos;

	if (this.getBanRepeatLongThreat() && ~this.repeatLongThreatMoveList.indexOf(move)) {
		return false;
	}

	if (this.getBanRepeatLongKill() && ~this.repeatLongKillMoveList.indexOf(move)) {
		return false;
	}

	return !!~this.legalMoveList.indexOf(startPos + targetPos);
};

// 设置指定棋子选中状态，-1 表示动画棋子
vschess.load.prototype.setSelectByPieceIndex = function(index){
	index = vschess.limit(index, -1, 89);
	~index ? this.setCurrentSelect(index).piece.eq(index).addClass("vschess-piece-s") : this.animatePiece.addClass("vschess-piece-s");
	return this;
};

// 获取指定棋子选中状态
vschess.load.prototype.getSelectByPieceIndex = function(index){
	return this.piece.eq(vschess.limit(index, 0, 89)).hasClass("vschess-piece-s");
};

// 设置合法目标格提示状态
vschess.load.prototype.setLegalTargetByStartIndex = function(index){
	index = vschess.limit(index, 0, 89);
	var _this = this;
	this.piece.each(function(pieceIndex){ _this.getLegalByPieceIndex(index, pieceIndex) && _this.setLegalByPieceIndex(pieceIndex); });
	return this;
};

// 切换棋子选中状态
vschess.load.prototype.toggleSelectByPieceIndex = function(index){
	index = vschess.limit(index, 0, 89);

	if (this.piece.eq(index).hasClass("vschess-piece-s")) {
		this.clearSelect();
		this.callback_unSelectPiece();
	}
	else {
		this.clearSelect();
		this.setSelectByPieceIndex(index);
		this.getMoveTips() && this.setLegalTargetByStartIndex(index);
		this.callback_selectPiece();
	}

	return this;
};

// 根据局面为起始点及目标点棋子添加方框
vschess.load.prototype.setSelectByStep = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (step <= 0) {
		return this;
	}

	var from = vschess.i2s[this.getMoveByStep(step).substring(0, 2)];
	var to   = vschess.i2s[this.getMoveByStep(step).substring(2, 4)];
	var currentSelect = this.getCurrentSelect();
	this.setSelectByPieceIndex(vschess.turn[this.getTurn()][vschess.s2b[from]]);
	this.setSelectByPieceIndex(vschess.turn[this.getTurn()][vschess.s2b[to  ]]);
	this.setCurrentSelect(currentSelect);
	return this;
};

// 设置当前选中的棋子编号，-1 表示没有被选中的棋子
vschess.load.prototype.setCurrentSelect = function(currentSelect){
	this._.currentSelect = vschess.limit(currentSelect, -1, 89, -1);
	return this;
};

// 取得当前选中的棋子编号，-1 表示没有被选中的棋子
vschess.load.prototype.getCurrentSelect = function(){
	return this._.currentSelect;
};

// 创建棋谱分享区域
vschess.load.prototype.createShare = function(){
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
vschess.load.prototype.createShareGenerateButton = function(){
	var _this = this;
	this.shareGenerateButton = $('<button type="button" class="vschess-button vschess-tab-body-share-generate-button">\u751f\u6210\u5206\u4eab\u4ee3\u7801</button>');
	this.shareGenerateButton.appendTo(this.shareArea);

	this.shareGenerateButton.bind(this.options.click, function(){
		for (var i = 0; i < vschess.shareCodeModuleList.length; ++i) {
			_this[vschess.shareCodeModuleList[i]].addClass("vschess-tab-body-share-current");
		}

		_this.shareImageTitle.removeClass("vschess-tab-body-image-current");

		if (_this.options.cloudApi && _this.options.cloudApi.saveBookForShare) {
			_this.shareHTMLTextInput.val("\u6b63\u5728\u751f\u6210\uff0c\u8bf7\u7a0d\u5019\u3002");
			_this.shareUBBTextInput .val("\u6b63\u5728\u751f\u6210\uff0c\u8bf7\u7a0d\u5019\u3002");
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
					alert("\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u5141\u8bb8\u8de8\u57df\uff0c\u4e0d\u80fd\u4f7f\u7528\u6b64\u529f\u80fd\u3002");
				}
			});
		}
	});

	return this;
};

// 创建 HTML 分享信息区域
vschess.load.prototype.createShareHTML = function(){
	var _this = this;
	this.shareHTMLTitle = $('<div class="vschess-tab-body-share-title">HTML \u4ee3\u7801\uff1a</div>');
	this.shareHTMLTitle.appendTo(this.shareArea);
	this.shareHTMLTextBox = $('<div class="vschess-tab-body-share-text"></div>');
	this.shareHTMLTextBox.appendTo(this.shareArea);
	this.shareHTMLTextInput = $('<input class="vschess-tab-body-share-text-input" value="\u8bf7\u70b9\u51fb\u201c\u751f\u6210\u5206\u4eab\u4ee3\u7801\u201d\u6309\u94ae\u3002" readonly="readonly" />');
	this.shareHTMLTextInput.appendTo(this.shareHTMLTextBox);
	this.shareHTMLTextCopy = $('<button type="button" class="vschess-button vschess-tab-body-share-text-copy">\u590d \u5236</button>');
	this.shareHTMLTextCopy.appendTo(this.shareHTMLTextBox);

	this.shareHTMLTextCopy.bind(this.options.click, function(){
		_this.copy(_this.shareHTMLTextInput.val(), function(){ _this.showMessage("HTML \u4ee3\u7801\u590d\u5236\u6210\u529f\uff0c\u60a8\u53ef\u4ee5\u76f4\u63a5\u7f51\u9875\u4e2d\u7c98\u8d34\u4f7f\u7528\uff01"); });
	});

	return this;
};

// 创建 UBB 分享信息区域
vschess.load.prototype.createShareUBB = function(){
	var _this = this;
	this.shareUBBTitle = $('<div class="vschess-tab-body-share-title">\u8bba\u575b UBB \u4ee3\u7801\uff1a</div>');
	this.shareUBBTitle.appendTo(this.shareArea);
	this.shareUBBTextBox = $('<div class="vschess-tab-body-share-text"></div>');
	this.shareUBBTextBox.appendTo(this.shareArea);
	this.shareUBBTextInput = $('<input class="vschess-tab-body-share-text-input" value="\u8bf7\u70b9\u51fb\u201c\u751f\u6210\u5206\u4eab\u4ee3\u7801\u201d\u6309\u94ae\u3002" readonly="readonly" />');
	this.shareUBBTextInput.appendTo(this.shareUBBTextBox);
	this.shareUBBTextCopy = $('<button type="button" class="vschess-button vschess-tab-body-share-text-copy">\u590d \u5236</button>');
	this.shareUBBTextCopy.appendTo(this.shareUBBTextBox);

	this.shareUBBTextCopy.bind(this.options.click, function(){
		_this.copy(_this.shareUBBTextInput.val(), function(){ _this.showMessage("\u8bba\u575b UBB \u4ee3\u7801\u590d\u5236\u6210\u529f\uff0c\u60a8\u53ef\u4ee5\u76f4\u63a5\u5728 BBS \u8bba\u575b\u4e2d\u7c98\u8d34\u4f7f\u7528\uff01"); });
	});

	return this;
};

// 创建生成 Gif 图按钮
vschess.load.prototype.createGifGenerateButton = function(){
	var _this = this;
	this.gifGenerateButton = $('<button type="button" class="vschess-button vschess-tab-body-image-generate-button">\u751f\u6210 Gif \u52a8\u753b</button>');
	this.gifGenerateButton.appendTo(this.shareArea);

	this.gifGenerateButton.bind(this.options.click, function(){
		if (_this.options.cloudApi && _this.options.cloudApi.gif) {
			for (var i = 0; i < vschess.shareCodeModuleList.length; ++i) {
				_this[vschess.shareCodeModuleList[i]].removeClass("vschess-tab-body-share-current");
			}

			_this.shareImageTitle.addClass("vschess-tab-body-image-current");
			_this.shareImageTitle.text("\u6b63\u5728\u751f\u6210\uff0c\u8bf7\u7a0d\u5019\u3002");

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
					alert("\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u5141\u8bb8\u8de8\u57df\uff0c\u4e0d\u80fd\u4f7f\u7528\u6b64\u529f\u80fd\u3002");
				}
			});
		}
	});

	return this;
};

// 创建分享图片显示区域
vschess.load.prototype.createShareImage = function(){
	var _this = this;
	this.shareImageTitle = $('<div class="vschess-tab-body-image-area"></div>');
	this.shareImageTitle.appendTo(this.shareArea);
	return this;
};

// 创建生成小程序码按钮
vschess.load.prototype.createWeixinGenerateButton = function(){
	var _this = this;
	this.weixinGenerateButton = $('<button type="button" class="vschess-button vschess-tab-body-share-generate-button">\u751f\u6210\u5c0f\u7a0b\u5e8f\u7801</button>');
	this.weixinGenerateButton.appendTo(this.shareArea);

	this.weixinGenerateButton.bind(this.options.click, function(){
		for (var i = 0; i < vschess.shareCodeModuleList.length; ++i) {
			_this[vschess.shareCodeModuleList[i]].removeClass("vschess-tab-body-share-current");
		}

		_this.shareImageTitle.addClass("vschess-tab-body-image-current");

		if (_this.options.cloudApi && _this.options.cloudApi.saveBookForWeixin) {
			_this.shareImageTitle.text("\u6b63\u5728\u751f\u6210\uff0c\u8bf7\u7a0d\u5019\u3002");
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
					alert("\u60a8\u7684\u6d4f\u89c8\u5668\u4e0d\u5141\u8bb8\u8de8\u57df\uff0c\u4e0d\u80fd\u4f7f\u7528\u6b64\u529f\u80fd\u3002");
				}
			});
		}
	});

	return this;
};

// 显示指定索引号的局面，负值表示从最后一个局面向前
vschess.load.prototype.setBoardByStep = function(step, indexUnChange){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());
	var _this = this;
	this._.currentStep = vschess.limit(step, 0, this.lastSituationIndex());
	this.clearBoard(  );
	this.clearBoard(-1);
	this.animating = false;

	this.piece.each(function(index){
		var piece = _this.situationList[_this.getCurrentStep()][vschess.b2s[vschess.turn[_this.getTurn()][index]]];
		piece > 1 && $(this).addClass("vschess-piece-" + vschess.n2f[piece]);
	});

	this.getPieceRotate() ? this.loadPieceRotate() : this.clearPieceRotate();

	// 从 setTurn 方法过来的无需更新合法列表，提高执行速度
	if (!indexUnChange) {
		this.legalList     = vschess.legalList    (this.situationList[this.getCurrentStep()]);
		this.legalMoveList = vschess.legalMoveList(this.situationList[this.getCurrentStep()]);
		this.repeatLongThreatMoveList = this.getBanRepeatLongThreat() ? this.getRepeatLongThreatMove() : [];
		this.repeatLongKillMoveList   = this.getBanRepeatLongKill  () ? this.getRepeatLongKillMove  () : [];
	}

	this.setSelectByStep();
	this.refreshMoveSelectListNodeColor();
	this.refreshChangeSelectListNode();
	this.setCommentByStep();
    this.getExportFormat() === "TextBoard" && this.setExportFormat("TextBoard");
    this.getExportFormat() === "ChessDB"   && this.setExportFormat("ChessDB"  );
	return this;
};

// 显示指定步数后的局面，正数向后，负数向前，默认为下一步
vschess.load.prototype.setBoardByOffset = function(offset){
	return this.setBoardByStep(vschess.limit(this.getCurrentStep() + vschess.limit(offset, -Infinity, Infinity, 1), 0, this.lastSituationIndex()));
};

// 刷新棋盘，一般用于设置棋盘方向之后
vschess.load.prototype.refreshBoard = function(indexUnChange){
	return this.setBoardByStep(this.getCurrentStep(), indexUnChange).refreshMoveListNode();
};

// 设置棋盘方向，0(0x00) 不翻转，1(0x01) 左右翻转，2(0x10) 上下翻转，3(0x11) 上下翻转 + 左右翻转
vschess.load.prototype.setTurn = function(turn){
	this._.turn = vschess.limit(turn, 0, 3, 0);
	arguments[1] || this.setConfigItemValue("turnX", !!(turn & 1));
	arguments[1] || this.setConfigItemValue("turnY",    turn > 1 );
	return this.refreshBoard(true).setExportFormat().refreshColumnIndex();
};

// 取得棋盘方向
vschess.load.prototype.getTurn = function(){
	return this._.turn;
};

// 取得棋盘着法翻转状态
vschess.load.prototype.getTurnForMove = function(){
	return this.getTurn() >> 1 !== (this.getTurn() & 1);
};

// 取得当前局面号
vschess.load.prototype.getCurrentStep = function(){
	return this._.currentStep;
};

// 取得当前走棋方，1 为红方，2 为黑方
vschess.load.prototype.getCurrentPlayer = function(){
	return this.situationList[this.getCurrentStep()][0];
};

// 刷新列号
vschess.load.prototype.refreshColumnIndex = function(turn){
	this.columnIndexR.removeClass("vschess-column-index-a vschess-column-index-b");
	this.columnIndexB.removeClass("vschess-column-index-a vschess-column-index-b");

	if (vschess.limit(turn, 0, 3, this.getTurn()) > 1) {
		this.columnIndexR.addClass("vschess-column-index-a");
		this.columnIndexB.addClass("vschess-column-index-b");
	}
	else {
		this.columnIndexR.addClass("vschess-column-index-b");
		this.columnIndexB.addClass("vschess-column-index-a");
	}

	return this;
};

// 设置棋子随机旋转状态
vschess.load.prototype.setPieceRotate = function(status){
	this._.pieceRotate = !!status;
	return this.setConfigItemValue("pieceRotate", this._.pieceRotate);
};

// 取得棋子随机旋转状态
vschess.load.prototype.getPieceRotate = function(){
	return this._.pieceRotate;
};

// 初始化棋子旋转角度
vschess.load.prototype.initPieceRotateDeg = function(){
	this.pieceRotateDeg = [];

	for (var i = 0; i < 90; ++i) {
		this.pieceRotateDeg.push(Math.random() * 360);
	}

	return this;
};

// 设置棋子旋转
vschess.load.prototype.loadPieceRotate = function(){
	var _this = this;

	this.piece.children("span").each(function(k){
		$(this).attr({ style: vschess.degToRotateCSS(_this.pieceRotateDeg[k]) });
	});

	return this;
};

// 移除棋子旋转
vschess.load.prototype.clearPieceRotate = function(){
	this.piece.children("span").removeAttr("style");
	return this;
};

// 音效播放组件
vschess.load.prototype.playSound = function(name){
	this.getSound() && vschess.soundObject[this.options.soundStyle + "-" + name](this.getVolume());
	return this;
};

// 根据局面播放音效
vschess.load.prototype.playSoundBySituation = function(step){
	step = vschess.limit(step, 0, this.lastSituationIndex(), this.getCurrentStep());

	if (step <= 0) {
		return this;
	}

	// 着法朗读
	if (this.getSpeakMove()) {
		var move = this.getMoveNameList()[this.getCurrentStep()];
		// TTS 部分读音有错误，用同音字强行纠正
		move = move.replace(/\u5352/g, "\u8db3");
		move = move.replace(/\u76f8/g, "\u8c61");
		move = move.replace(/\u5c06/g, "\u9171");
		move = move.replace(/\u4e00/g, "\u533b");
		move = move.replace(/\uff11/g, "\u533b");
		this.speakMove(move);
	}
	// 普通音效
	else {
		var fromPiece = this.situationList[step - 1][vschess.i2s[this.getMoveByStep(step).substring(0, 2)]];
		var   toPiece = this.situationList[step - 1][vschess.i2s[this.getMoveByStep(step).substring(2, 4)]];

		// 播放将杀音效
		if (this.legalList.length === 0) {
			this.playSound("lose");
		}

		// 播放将军音效
		else if (vschess.checkThreat(this.situationList[this.getCurrentStep()])) {
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
vschess.load.prototype.speakMove = function(move){
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
		vschess.TTS || (vschess.TTS = new ActiveXObject("Sapi.SpVoice"));
		vschess.TTS &&  vschess.TTS.Speak(move, 1);
	}

	return this;
};

// 设置音效状态
vschess.load.prototype.setSound = function(sound){
	this._.sound = !!sound;
	this.setConfigItemValue("sound", this._.sound);
	return this;
};

// 取得音效状态
vschess.load.prototype.getSound = function(){
	return this._.sound;
};

// 设置着法朗读状态
vschess.load.prototype.setSpeakMove = function(speakMove){
	this._.speakMove = !!speakMove;
	this.setConfigItemValue("speakMove", this._.speakMove);
	return this;
};

// 取得着法朗读状态
vschess.load.prototype.getSpeakMove = function(){
	return this._.speakMove;
};

// 设置音量大小
vschess.load.prototype.setVolume = function(volume){
	this._.volume = vschess.limit(volume, 0, 100);
	this.setConfigItemValue("volume", this._.volume);
	return this;
};

// 获取音量大小
vschess.load.prototype.getVolume = function(){
	return this._.volume;
};

// 创建标签
vschess.load.prototype.createTab = function(){
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
vschess.load.prototype.showTab = function(tabName){
	if (!~vschess.tabList.indexOf(tabName)) {
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

// 棋盘对象转换为字符串信息
vschess.load.prototype.toString = function(){
	return this.getCurrentFen();
};

// 程序转换为字符串信息
vschess.toString = function(){
	return "\u5fae\u601d\u8c61\u68cb\u64ad\u653e\u5668 V" + vschess.version + " https://www.xiaxiangqi.com/vschess/ Copyright \u00a9 2009-2025 Margin.Top \u7248\u6743\u6240\u6709";
};

// 将 vschess 提升为全局变量，这样外部脚本就可以调用了
typeof window.vschess === "undefined" && (window.vschess = vschess);

})();