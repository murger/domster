(function (window, document) {
	'use strict';

	// ### CONSTRUCTOR
	var dommy = function (query, context) {
		var nodes;

		if (!(this instanceof dommy)) {
			return new dommy(query, context);
		}

		if (typeof query === 'string') {
			nodes = select(query, context);
			extend(this, nodes);
			this.length = nodes.length;
		} else if (isElement(query)) {
			this[0] = query;
			this.length = 1;
		}

		return this;
	},

	// ### SELECTOR
	select = function (query, context) {
		var match,
			nodes,
			result = [];

		if (!context) {
			context = document;
		} else if (!isElement(context)) {
			context = select(context)[0];
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

	each = function (obj, fn, context) {
		var isDommy = (obj instanceof dommy);

		if (isDommy && !obj.length) {
			return obj;
		}

		if (isEnum(obj) || isDommy) {
			for (var i = 0; i < obj.length; i++) {
				fn.call(context || obj[i], obj[i], i, obj);
			}
		} else if (isObj(obj)) {
			for (var i in obj) {
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

	hasClass = function (node, className) {
		return (node.classList)
			? node.classList.contains(className)
			: new RegExp("(^|\\s)" + className + "(\\s|$)").test(node.className);
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
		// ### TRAVERSAL
		each: function () {
			var self = [this];

			push.apply(self, arguments);
			each.apply(this, self);

			return this;
		},

		parent: function () {
			if (!this.length) {
				return;
			}

			return this[0].parentNode && dommy(this[0].parentNode);
		},

		// ### CSS
		hasClass: function (className) {
			var result = true;

			if (!this.length || !className) {
				return;
			}

			this.each(function (node) {
				result = hasClass(node, className);
			});

			return result;
		},

		addClass: function (className) {
			if (!this.length || !className) {
				return;
			}

			return this.each(function (node) {
				if (node.classList) {
					node.classList.add(className);
				} else if (!hasClass(node, className)) {
					node.className = [node.className, className].join(' ');
				}
			});
		},

		removeClass: function (className) {
			if (!this.length || !className) {
				return;
			}

			return this.each(function (node) {
				if (node.classList) {
					node.classList.remove(className);
				} else {
					node.className = node.className
						.replace(new RegExp('\\b' + className+ '\\b', 'g'), '');
				}
			});
		},

		// ### EVENTS
		on: function (type, fn) {
			return this.each(function (node) {
				node.addEventListener(type, fn);
			});
		},

		off: function (type, fn) {
			return this.each(function (node) {
				node.removeEventListener(type, fn);
			});
		}
	});

	dommy.v = '0.2.0';
	window.$ = dommy;

})(this, this.document);