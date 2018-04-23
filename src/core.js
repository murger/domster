/*!
 *	dommy.js
 *	https://github.com/murger/dommy.js
 *
 *	Copyright 2010, 2018 G Mermer
 *	Released under the MIT license
 */

(function (global) {
	'use strict';

	var dommy = function (query, context) {
		if (!(this instanceof dommy)) {
			return new dommy(query, context);
		}

		if (typeof query === 'string') {
			this.set = select(query, context);
		} else if (isElement(query)) {
			this.set = [query];
		} else if (type(query) === 'nodelist') {
			this.set = query;
		} else if (query instanceof dommy) {
			this.set = query.set;
		}

		return this;
	},

	select = function (query, context) {
		var match,
			nodes,
			result = [];

		if (!context) {
			context = global.document;
		} else if (!isElement(context) && !isDocument(context)) {
			context = select(context).get(0);
		}

		// #id
		if (match = /^#([\w\-]+)$/.exec(query)) {
			return (result = context.getElementById(match[1]))
				? [result]
				: [];
		}

		// [1] -> <tag>
		// [2] -> <tag> (if .class specified)
		// [3] -> .class
		match = /^(?:([\w]+)|([\w]+)?\.([\w\-]+))$/.exec(query);

		// only <tag>
		if (match[1]) {
			return context.getElementsByTagName(match[1]);
		}

		nodes = context.getElementsByClassName(match[3]);

		// only .class
		if (!match[2]) {
			return nodes;
		}

		// <tag> & .class
		for (var i = 0, len = nodes.length; i < len; i++) {
			if (nodes[i].nodeName === match[2].toUpperCase()) {
				result.push(nodes[i]);
			}
		}

		return result;
	},

	// ### SHORTCUTS
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,

	// ### HELPERS
	isObj = function (obj) {
		return (typeof obj === 'object');
	},

	isEnum = function (obj) {
		return (type(obj) === 'array' || type(obj) === 'nodelist');
	},

	isElement = function (node) {
		return (node.nodeType === 1);
	},

	isDocument = function (node) {
		return (node.nodeType === 9);
	},

	each = function (obj, fn, context) {
		var i = 0,
			key;

		// Dommy sets
		if (obj instanceof dommy && obj.count()) {
			if (obj.count() === 1) {
				fn.call(new dommy(obj.get(0)), obj.get(0), 0, obj.set);
			} else {
				for (; i < obj.count(); i++) {
					fn.call(new dommy(obj.get(i)), obj.get(i), i, obj.set);
				}
			}

		// Arrays and NodeLists
		} else if (isEnum(obj)) {
			for (; i < obj.length; i++) {
				fn.call(context || obj[i], obj[i], i, obj);
			}

		// Other objects
		} else if (isObj(obj)) {
			for (key in obj) {
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

	hasClass = function (el, className) {
		return (el.classList)
			? el.classList.contains(className)
			: new RegExp("(^|\\s)" + className + "(\\s|$)").test(el.className);
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

		// ### TRAVERSAL
		each: function () {
			var augment = [this];

			push.apply(augment, arguments);
			each.apply(this, augment);

			return this;
		},

		parent: function () {
			if (!this.count()) {
				return;
			}

			return new dommy(this.get(0).parentNode);
		},

		// ### CSS
		hasClass: function (className) {
			var result = true;

			if (!this.count() || !className) {
				return;
			}

			this.each(function (el) {
				if (!hasClass(el, className)) {
					result = false;
				}
			});

			return result;
		},

		addClass: function (className) {
			if (!this.count() || !className) {
				return;
			}

			return this.each(function (el) {
				if (el.classList) {
					el.classList.add(className);
				} else if (!hasClass(el, className)) {
					el.className = [el.className, className].join(' ');
				}
			});
		},

		removeClass: function (className) {
			if (!this.count() || !className) {
				return;
			}

			return this.each(function (el) {
				if (el.classList) {
					el.classList.remove(className);
				} else {
					el.className = el.className
						.replace(new RegExp('\\b' + className+ '\\b', 'g'), '');
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
		}
	});

	if (typeof define === 'function' && define.amd) {
		define(function () { return dommy; });
	} else if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = dommy; // Node.js
		}

		exports.$ = dommy; // CJS 1.1.1
	} else {
		global.$ = dommy;
	}
})(this);