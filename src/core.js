/*!
 *	dommy.js
 *	https://github.com/murger/dommy.js
 *
 *	Copyright 2010, 2018 G Mermer
 *	Released under the MIT license
 */

(function (window) {
	'use strict';

	if (!window.document) {
		throw new Error();
	}

	var dommy = function (query, context) {
		if (!(this instanceof dommy)) {
			return new dommy(query, context);
		}

		if (typeof query === 'string') {
			this.set = select(query, context);
		} else if (isElement(query)) {
			this.set = [query];
		} else if (type(query) === 'nodelist') {
			this.set = slice.call(query);
		} else if (query instanceof dommy) {
			this.set = query.set;
		}

		return this;
	},

	isElement = function (node) {
		return (node.nodeType === 1);
	},

	isDocument = function (node) {
		return (node.nodeType === 9);
	},

	select = function (query, context) {
		var match,
			nodes,
			set = [];

		if (!context) {
			context = window.document;
		} else if (!isElement(context) && !isDocument(context)) {
			context = select(context).get(0);
		}

		// #id
		if (match = /^#([\w\-]+)$/.exec(query)) {
			return (set = slice.call(context.getElementById(match[1])))
				? [set]
				: [];
		}

		// [1] -> <tag>
		// [2] -> <tag> (if .class specified)
		// [3] -> .class
		match = /^(?:([\w]+)|([\w]+)?\.([\w\-]+))$/.exec(query);

		// only <tag>
		if (match[1]) {
			return slice.call(context.getElementsByTagName(match[1]));
		}

		nodes = slice.call(context.getElementsByClassName(match[3]));

		// only .class
		if (!match[2]) {
			return nodes;
		}

		// <tag> & .class
		for (var i = 0, len = nodes.length; i < len; i++) {
			if (nodes[i].nodeName === match[2].toUpperCase()) {
				set.push(nodes[i]);
			}
		}

		return set;
	},

	// ### SHORTCUTS
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	slice = Array.prototype.slice,
	push = Array.prototype.push,
	matches = Element.prototype.matches || Element.prototype.msMatchesSelector,

	// ### HELPERS
	isObj = function (obj) {
		return (typeof obj === 'object');
	},

	isEnum = function (obj) {
		return (type(obj) === 'array' || type(obj) === 'nodelist');
	},

	each = function (obj, fn, context) {
		if (obj instanceof dommy && obj.count()) {
			if (obj.count() === 1) {
				fn.call(context || new dommy(obj.get(0)),
					obj.get(0), 0, obj.set);
			} else {
				for (var i = 0, len = obj.count(); i < len; i++) {
					fn.call(context || new dommy(obj.get(i)),
						obj.get(i), i, obj.set);
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
	},

	extend = function (obj, src, keep) {
		each(src, function (val, key) {
			if (isEnum(obj)) {
				key = (keep)
					? obj.length // new key
					: key; // overwrite
			} else if (isObj(obj) || typeof obj === 'function') {
				if (keep && hasOwn.call(obj, key)) {
					return; // don't copy
				}
			}

			obj[key] = val;
		});

		return obj;
	},

	types = 'Boolean Number String Function Array Date RegExp NodeList Object',
	typeMap = [],

	type = function (val) {
		return (!val)
			? String(val) // null & undefined
			: typeMap[toString.call(val)] || 'object';
	};

	each(types.split(' '), function(val) {
		typeMap['[object ' + val + ']'] = val.toLowerCase();
	});

	// ### UTILS
	extend(dommy, {
		each: each,
		extend: extend,
		type: type
	});

	extend(dommy.prototype, {
		set: [],

		get: function (idx) {
			return this.set[idx];
		},

		count: function () {
			return this.set.length;
		},

		each: function () {
			var augment = [this];

			push.apply(augment, arguments);
			each.apply(this, augment);

			return this;
		},

		// ### TRAVERSAL
		is: function (query) {
			if (!this.count()) { return false; }
			else if (!query) { return true; }

			var result = false;

			this.each(function (el) {
				if (matches.call(el, query)) {
					result = true;
				}
			});

			return result;
		},

		filter: function (query) {
			if (!this.count() || !query) { return; }

			var set = [];

			this.each(function (el) {
				if (matches.call(el, query)) {
					set.push(el);
				}
			});

			this.set = set;

			return this;
		},

		find: function (query) {
			if (!this.count() || !query) { return; }

			var set = [];

			this.each(function (el) {
				set = set.concat(select(query, el));
			});

			this.set = set;

			return this;
		},

		parent: function (query) {
			if (!this.count()) { return; }

			var set = [];

			this.each(function (el) {
				if (!query || matches.call(el.parentNode, query)) {
					set.push(el.parentNode);
				}
			});

			this.set = set;

			return this;
		},

		children: function (query) {
			if (!this.count()) { return; }

			var set = [];

			this.each(function (el) {
				set = set.concat(slice.call(el.children));
			});

			this.set = set;

			return (query) ? this.filter(query) : this;
		},

		siblings: function (query) {
			if (!this.count()) { return; }

			var node = this.get(0),
				set = [];

			this.parent().children().each(function (el) {
				if (el !== node && (!query || matches.call(el, query))) {
					set.push(el);
				}
			});

			this.set = set;

			return this;
		},

		// ### MANIPULATION
		append: function (node) {
			var count = this.count();

			if (!count) { return; }

			return this.each(function (el) {
				el.appendChild((count > 1) ? node.cloneNode(true) : node);
			});
		},

		prepend: function (node) {
			var count = this.count();

			if (!count) { return; }

			return this.each(function (el) {
				el.insertBefore((count > 1) ? node.cloneNode(true) : node,
					el.firstChild);
			});
		},

		remove: function (query) {
			if (!this.count()) { return; }

			return this.each(function (el) {
				if (!query || matches.call(el, query)) {
					el.parentNode.removeChild(el);
				}
			});
		},

		empty: function () {
			if (!this.count()) { return; }

			return this.each(function (el) {
				el.innerHTML = '';
			});
		},

		html: function (val) {
			if (!this.count()) { return; }

			if (val) {
				return this.each(function (el) {
					el.innerHTML = val;
				});
			} else {
				return this.get(0).innerHTML;
			}
		},

		text: function (val) {
			if (!this.count()) { return; }

			if (val) {
				return this.each(function (el) {
					el.innerText = val;
				});
			} else {
				return this.get(0).innerText;
			}
		},

		attr: function (key, val) {
			if (!this.count() || !key) { return; }

			if (val) {
				return this.each(function (el) {
					el.setAttribute(key, val);
				});
			} else {
				return this.get(0).getAttribute(key);
			}
		},

		val: function () {
			if (!this.count()) { return; }

			return this.get(0).value;
		},

		removeAttr: function (key) {
			if (!this.count() || !key) { return; }

			return this.each(function (el) {
				el.removeAttribute(key);
			});
		},

		// ### CSS
		css: function (key, val) {
			if (!this.count() || !key) { return; }

			var el = this.get(0);

			if (type(key) === 'string' && !val) {
				return getComputedStyle(el)[key];
			} else if (val) {
				el.style[key] = val;
			} else if (type(key) === 'object') {
				each(key, function (val, prop) {
					el.style[prop] = val;
				});
			}

			return this;
		},

		position: function () {
			if (!this.count()) { return; }

			var el = this.get(0);

			return {
				top: el.offsetTop,
				left: el.offsetLeft
			};
		},

		offset: function () {
			if (!this.count()) { return; }

			var rect = this.get(0).getBoundingClientRect();

			return {
				top: rect.top + window.document.body.scrollTop,
				left: rect.left + window.document.body.scrollLeft
			};
		},

		hasClass: function (className) {
			if (!this.count() || !className) { return; }

			var result = true;

			this.each(function (el) {
				result = new RegExp("(^|\\s)" + className + "(\\s|$)")
					.test(el.className);
			});

			return result;
		},

		addClass: function (className) {
			if (!this.count() || !className) { return; }

			return this.each(function (el) {
				if (!this.hasClass(className)) {
					el.className = [el.className, className].join(' ');
				}
			});
		},

		removeClass: function (className) {
			if (!this.count()) { return; }

			return this.each(function (el) {
				if (!className || this.hasClass(className)) {
					el.className = (!className) ? '' : el.className
						.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
				}
			});
		},

		toggleClass: function (className) {
			if (!this.count() || !className) { return; }

			return this.each(function (el) {
				if (!this.hasClass(className)) {
					this.addClass(className);
				} else {
					this.removeClass(className);
				}
			});
		},

		// ### EVENTS
		on: function (type, fn) {
			return this.each(function (el) {
				el.addEventListener(type, fn);
			});
		},

		off: function (type, fn) {
			return this.each(function (el) {
				el.removeEventListener(type, fn);
			});
		},

		trigger: function (type) {
			return this.each(function (el) {
				el.dispatchEvent(new Event(type));
			});
		}
	});

	if (typeof define === 'function' && define.amd) {
		define(function () { return dommy; });
	} else if (typeof module === 'object' && module.exports) {
		module.exports = dommy;
	} else {
		window.$ = dommy;
	}
})(this);