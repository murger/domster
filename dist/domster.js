(function(window) {
    "use strict";
    if (!window.document) {
        throw new Error();
    }
    var domster = function(query, context) {
        if (!(this instanceof domster)) {
            return new domster(query, context);
        }
        if (typeof query === "string") {
            this.set = select(query, context);
        } else if (type(query) === "nodelist") {
            this.set = query;
        } else if (isElement(query)) {
            this.set = [ query ];
        } else if (query instanceof domster) {
            this.set = query.set;
        }
        return this;
    }, isElement = function(node) {
        return node.nodeType === 1;
    }, isDocument = function(node) {
        return node.nodeType === 9;
    }, select = function(query, context) {
        var match, nodes, set = [];
        if (!context) {
            context = window.document;
        } else if (!isElement(context) && !isDocument(context)) {
            context = select(context).get(0);
        }
        if (match = /^#([\w\-]+)$/.exec(query)) {
            return (set = context.getElementById(match[1])) ? [ set ] : [];
        }
        match = /^(?:([\w]+)|([\w]+)?\.([\w\-]+))$/.exec(query);
        if (match[1]) {
            return context.getElementsByTagName(match[1]);
        }
        nodes = context.getElementsByClassName(match[3]);
        if (!match[2]) {
            return nodes;
        }
        for (var i = 0, len = nodes.length; i < len; i++) {
            if (nodes[i].nodeName === match[2].toUpperCase()) {
                set.push(nodes[i]);
            }
        }
        return set;
    }, toString = Object.prototype.toString, hasOwn = Object.prototype.hasOwnProperty, concat = Array.prototype.concat, slice = Array.prototype.slice, push = Array.prototype.push, matches = Element.prototype.matches || Element.prototype.msMatchesSelector, isObj = function(obj) {
        return typeof obj === "object";
    }, isEnum = function(obj) {
        return type(obj) === "array" || type(obj) === "nodelist";
    }, each = function(obj, fn, context) {
        if (obj instanceof domster && obj.count()) {
            if (obj.count() === 1) {
                fn.call(context || new domster(obj.get(0)), obj.get(0), 0, obj.set);
            } else {
                for (var i = 0, len = obj.count(); i < len; i++) {
                    fn.call(context || new domster(obj.get(i)), obj.get(i), i, obj.set);
                }
            }
        } else if (isEnum(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                fn.call(context || obj[i], obj[i], i, obj);
            }
        } else if (isObj(obj)) {
            for (var key in obj) {
                if (hasOwn.call(obj, key)) {
                    fn.call(context || obj[key], obj[key], key, obj);
                }
            }
        }
        return obj;
    }, extend = function(obj, src, keep) {
        each(src, function(val, key) {
            if (isEnum(obj)) {
                key = keep ? obj.length : key;
            } else if (isObj(obj) || typeof obj === "function") {
                if (keep && hasOwn.call(obj, key)) {
                    return;
                }
            }
            obj[key] = val;
        });
        return obj;
    }, types = "Boolean Number String Function Array Date RegExp NodeList Object", typeMap = [], type = function(val) {
        return !val ? String(val) : typeMap[toString.call(val)] || "object";
    };
    each(types.split(" "), function(val) {
        typeMap["[object " + val + "]"] = val.toLowerCase();
    });
    extend(domster, {
        each: each,
        extend: extend,
        type: type
    });
    extend(domster.prototype, {
        set: [],
        get: function(idx) {
            return this.set[idx];
        },
        count: function() {
            return this.set.length;
        },
        each: function() {
            var augment = [ this ];
            push.apply(augment, arguments);
            each.apply(this, augment);
            return this;
        },
        is: function(query) {
            if (!this.count()) {
                return false;
            } else if (!query) {
                return true;
            }
            var result = false;
            this.each(function(el) {
                if (matches.call(el, query)) {
                    result = true;
                }
            });
            return result;
        },
        first: function() {
            if (!this.count()) {
                return;
            }
            this.set = [ this.get(0) ];
            return this;
        },
        last: function() {
            var count = this.count();
            if (!count) {
                return;
            }
            this.set = [ this.get(count - 1) ];
            return this;
        },
        find: function(query) {
            if (!this.count() || !query) {
                return;
            }
            var set = [];
            this.each(function(el) {
                set = set.concat(slice.call(select(query, el)));
            });
            this.set = set;
            return this;
        },
        filter: function(query) {
            if (!this.count() || !query) {
                return;
            }
            var set = [];
            this.each(function(el) {
                if (matches.call(el, query)) {
                    set.push(el);
                }
            });
            this.set = set;
            return this;
        },
        parent: function(query) {
            if (!this.count()) {
                return;
            }
            var set = [];
            this.each(function(el) {
                if (!query || matches.call(el.parentNode, query)) {
                    set.push(el.parentNode);
                }
            });
            this.set = set;
            return this;
        },
        children: function(query) {
            if (!this.count()) {
                return;
            }
            var set = [];
            this.each(function(el) {
                set = set.concat(slice.call(el.children));
            });
            this.set = set;
            return query ? this.filter(query) : this;
        },
        siblings: function(query) {
            if (!this.count()) {
                return;
            }
            var node = this.get(0), set = [];
            this.parent().children().each(function(el) {
                if (el !== node && (!query || matches.call(el, query))) {
                    set.push(el);
                }
            });
            this.set = set;
            return this;
        },
        empty: function() {
            if (!this.count()) {
                return;
            }
            return this.each(function(el) {
                el.innerHTML = "";
            });
        },
        remove: function(query) {
            if (!this.count()) {
                return;
            }
            return this.each(function(el) {
                if (!query || matches.call(el, query)) {
                    el.parentNode.removeChild(el);
                }
            });
        },
        append: function(node) {
            var count = this.count();
            if (!count) {
                return;
            }
            this.each(function(el) {
                el.appendChild(count > 1 ? node.cloneNode(true) : node);
            });
            if (count > 1) {
                node.parentNode.removeChild(node);
            }
            return this;
        },
        prepend: function(node) {
            var count = this.count();
            if (!count) {
                return;
            }
            this.each(function(el) {
                el.insertBefore(count > 1 ? node.cloneNode(true) : node, el.firstChild);
            });
            if (count > 1) {
                node.parentNode.removeChild(node);
            }
            return this;
        },
        clone: function() {
            if (!this.count()) {
                return;
            }
            var set = [];
            this.each(function(el) {
                set.push(el.cloneNode(true));
            });
            this.set = set;
            return this;
        },
        html: function(val) {
            if (!this.count()) {
                return;
            }
            if (val) {
                return this.each(function(el) {
                    el.innerHTML = val;
                });
            } else {
                return this.get(0).innerHTML;
            }
        },
        text: function(val) {
            if (!this.count()) {
                return;
            }
            if (val) {
                return this.each(function(el) {
                    el.innerText = val;
                });
            } else {
                return this.get(0).innerText;
            }
        },
        val: function(val) {
            if (!this.count()) {
                return;
            }
            if (val) {
                return this.each(function(el) {
                    el.value = val;
                });
            } else {
                return this.get(0).value;
            }
        },
        data: function(key, val) {
            if (!this.count() || !key) {
                return;
            }
            if (val) {
                return this.each(function(el) {
                    el.dataset[key] = val;
                });
            } else {
                return this.get(0).dataset[key];
            }
        },
        attr: function(key, val) {
            if (!this.count() || !key) {
                return;
            }
            if (val) {
                return this.each(function(el) {
                    el.setAttribute(key, val);
                });
            } else {
                return this.get(0).getAttribute(key);
            }
        },
        removeAttr: function(key) {
            if (!this.count() || !key) {
                return;
            }
            return this.each(function(el) {
                el.removeAttribute(key);
            });
        },
        css: function(key, val) {
            if (!this.count() || !key) {
                return;
            }
            var el = this.get(0);
            if (type(key) === "string" && !val) {
                return getComputedStyle(el)[key];
            } else if (val) {
                el.style[key] = val;
            } else if (type(key) === "object") {
                each(key, function(val, prop) {
                    el.style[prop] = val;
                });
            }
            return this;
        },
        show: function() {},
        hide: function() {},
        toggle: function() {},
        position: function() {
            if (!this.count()) {
                return;
            }
            var el = this.get(0);
            return {
                top: el.offsetTop,
                left: el.offsetLeft
            };
        },
        offset: function() {
            if (!this.count()) {
                return;
            }
            var rect = this.get(0).getBoundingClientRect(), body = window.document.body;
            return {
                top: rect.top + body.scrollTop,
                left: rect.left + body.scrollLeft
            };
        },
        hasClass: function(className) {
            if (!this.count() || !className) {
                return;
            }
            var result = false, pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
            this.each(function(el) {
                if (pattern.test(el.className)) {
                    result = true;
                }
            });
            return result;
        },
        addClass: function(className) {
            if (!this.count() || !className) {
                return;
            }
            return this.each(function(el) {
                if (!this.hasClass(className)) {
                    el.className = [ el.className, className ].join(" ");
                }
            });
        },
        removeClass: function(className) {
            if (!this.count()) {
                return;
            }
            var pattern = new RegExp("\\b" + className + "\\b", "g");
            return this.each(function(el) {
                if (this.hasClass(className)) {
                    el.className = el.className.replace(pattern, "");
                } else if (!className) {
                    el.className = "";
                }
            });
        },
        toggleClass: function(className) {
            if (!this.count() || !className) {
                return;
            }
            return this.each(function(el) {
                if (!this.hasClass(className)) {
                    this.addClass(className);
                } else {
                    this.removeClass(className);
                }
            });
        },
        on: function(type, fn) {
            return this.each(function(el) {
                el.addEventListener(type, fn);
            });
        },
        once: function(type, fn) {
            var fx;
            return this.each(function(el) {
                el.addEventListener(type, fx = function() {
                    fn(arguments);
                    el.removeEventListener(type, fx);
                });
            });
        },
        off: function(type, fn) {
            return this.each(function(el) {
                el.removeEventListener(type, fn);
            });
        },
        trigger: function(type) {
            return this.each(function(el) {
                el.dispatchEvent(new Event(type));
            });
        }
    });
    if (typeof define === "function" && define.amd) {
        define(function() {
            return domster;
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = domster;
    } else {
        window.$ = domster;
    }
})(this);