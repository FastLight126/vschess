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
