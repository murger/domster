/*!
 *	domster
 *	https://github.com/murger/domster
 *
 *	Copyright 2018 Gürhan Mermer
 *	Released under the MIT license
 */

(function (window) {
	'use strict';

	if (!window.document) {
		throw new Error();
	}

	var domster = function (query, context) {
		var match;

		if (!isSet(this)) {
			return new domster(query, context);
		}

		if (match = /^<([\w]+)>$/.exec(query)) {
			this.set = create(match[1]);
		} else if (typeof query === 'string') {
			this.set = select(query, context);
		} else if (type(query) === 'nodelist') {
			this.set = query;
		} else if (isEl(query)) {
			this.set = [query];
		} else if (query instanceof domster) {
			this.set = query.set;
		}

		return this;
	},

	isEl = function (node) {
		return node && (node.nodeType === 1);
	},

	isDoc = function (node) {
		return node && (node.nodeType === 9);
	},

	select = function (query, context) {
		var match,
			nodes,
			set = [];

		// TODO: if query has a space re-write with context

		if (!context) {
			context = window.document;
		} else if (!isEl(context) && !isDoc(context)) {
			context = select(context)[0];
		}

		// #id
		if (match = /^#([\w\-]+)$/.exec(query)) {
			return (set = context.getElementById(match[1]))
				? [set]
				: [];
		}

		// [1] -> tag [2] -> tag.class [3] -> .class [4] -> [attr]
		// /^(?:([\w]+)|([\w]+)?\.?([\w\-]+)?\[?([\w\-]*[\=\w\-]+?)?\]?)$/;
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
				set.push(nodes[i]);
			}
		}

		return set;
	},

	create = function (tag) {
		return [window.document.createElement(tag)];
	},

	// #########################################################################
	// ### SHORTCUTS ###########################################################
	// #########################################################################

	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	concat = Array.prototype.concat,
	slice = Array.prototype.slice,
	push = Array.prototype.push,
	matches = Element.prototype.matches || Element.prototype.msMatchesSelector,

	// #########################################################################
	// ### HELPERS #############################################################
	// #########################################################################

	isSet = function (obj) {
		return (obj instanceof domster);
	},

	isObj = function (obj) {
		return (typeof obj === 'object');
	},

	isEnum = function (obj) {
		return (type(obj) === 'array' || type(obj) === 'nodelist');
	},

	each = function (obj, fn, context) {
		if (isSet(obj) && obj.size()) {
			if (obj.size() === 1) {
				fn.call(context || obj.get(0), obj.get(0), 0, obj.set);
			} else {
				for (var i = 0, len = obj.size(); i < len; i++) {
					fn.call(context || obj.get(i), obj.get(i), i, obj.set)
				}
			}
		} else if (isEnum(obj)) {
			for (var i = 0, len = obj.length; i < len; i++) {
				fn.call(context || obj[i], obj[i], i, obj)
			}
		} else if (isObj(obj)) {
			for (var key in obj) {
				if (hasOwn.call(obj, key)) {
					fn.call(context || obj[key], obj[key], key, obj)
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

	// #########################################################################
	// ### UTILITY #############################################################
	// #########################################################################

	extend(domster, {
		each: each,
		extend: extend,
		type: type
	});

	extend(domster.prototype, {
		set: [],

		get: function (idx) {
			return this.set[idx];
		},

		size: function () {
			return this.set.length;
		},

		each: function () {
			var augment = [this];

			push.apply(augment, arguments);
			each.apply(this, augment);

			return this;
		},

		// #####################################################################
		// ### TRAVERSAL #######################################################
		// #####################################################################

		is: function (query) {
			if (!this.size()) { return false; }
			else if (!query) { return true; }

			var result = true;

			this.each(function (el) {
				if (!matches.call(el, query)) {
					result = false;
				}
			});

			return result;
		},

		has: function (query) {
			if (!this.size() || !query) { return; }

			var result = false;

			this.children().each(function (el) {
				if (matches.call(el, query) || (isEl(query) && el === query)) {
					result = true;
				}
			});

			return result;
		},

		first: function () {
			if (!this.size()) { return; }

			this.set = [this.get(0)];

			return this;
		},

		last: function () {
			var size = this.size();

			if (!size) { return; }

			this.set = [this.get(size - 1)];

			return this;
		},

		find: function (query) {
			if (!this.size() || !query) { return; }

			var set = [];

			this.each(function (el) {
				each(select(query, el), function (ch) {
					if (!~set.indexOf(ch)) {
						set.push(ch);
					}
				});
			});

			this.set = set;

			return this;
		},

		filter: function (query) {
			if (!this.size() || !query) { return; }

			var set = [];

			this.each(function (el) {
				if (matches.call(el, query)) {
					set.push(el);
				}
			});

			this.set = set;

			return this;
		},

		parent: function (query) {
			if (!this.size()) { return; }

			var set = [];

			this.each(function (el) {
				if (!query || matches.call(el.parentNode, query)) {
					if (!~set.indexOf(el.parentNode)) {
						set.push(el.parentNode);
					}
				}
			});

			this.set = set;

			return this;
		},

		children: function (query) {
			if (!this.size()) { return; }

			var set = [];

			this.each(function (el) {
				each(el.children, function (ch) {
					if (!query || matches.call(ch, query)) {
						set.push(ch);
					}
				});
			});

			this.set = set;

			return this;
		},

		siblings: function (query) {
			if (!this.size()) { return; }

			var orig = this.set,
				set = [];

			this.parent().children().each(function (el) {
				if (!~orig.indexOf(el) && (!query || matches.call(el, query))) {
					set.push(el);
				}
			});

			this.set = set;

			return this;
		},

		// #####################################################################
		// ### MUTATION ########################################################
		// #####################################################################

		remove: function (query) {
			if (!this.size()) { return; }

			return this.each(function (el) {
				if (!query || matches.call(el, query)) {
					el.parentNode.removeChild(el);
				}
			});
		},

		clone: function () {
			if (!this.size()) { return; }

			var set = [];

			this.each(function (el) {
				set.push(el.cloneNode(true));
			});

			this.set = set;

			return this;
		},

		append: function (node) {
			var size = this.size(),
				isMany = (size > 1),
				isSet = isSet(node),
				append = function (el, n) {
					return el.appendChild(isMany ? n.cloneNode(true) : n);
				};

			if (!size || (!isEl(node) && !isSet)) { return; }

			this.each(function (el) {
				if (isSet) { node.each(function (n) { append(el, n); }); }
				else { append(el, node); }
			});

			if (isSet && isMany) { node.remove(); }
			else if (isMany) { node.parentNode.removeChild(node); }

			return this;
		},

		prepend: function (node) {
			var size = this.size(),
				isMany = (size > 1),
				isSet = isSet(node),
				prepend = function (el, n) {
					return el.insertBefore(isMany ? n.cloneNode(true) : n,
						el.firstChild);
				};

			if (!size || (!isEl(node) && !isSet)) { return; }

			this.each(function (el) {
				if (isSet) { node.each(function (n) { prepend(el, n); }); }
				else { prepend(el, node); }
			});

			if (isSet && isMany) { node.remove(); }
			else if (isMany) { node.parentNode.removeChild(node); }

			return this;
		},

		empty: function () {
			if (!this.size()) { return; }

			return this.each(function (el) {
				el.innerHTML = '';
			});
		},

		html: function (val) {
			if (!this.size()) { return; }

			if (val) {
				return this.each(function (el) {
					el.innerHTML = val;
				});
			} else {
				return this.get(0).innerHTML;
			}
		},

		text: function (val) {
			if (!this.size()) { return; }

			if (val) {
				return this.each(function (el) {
					el.innerText = val;
				});
			} else {
				return this.get(0).innerText;
			}
		},

		val: function (val) {
			if (!this.size()) { return; }

			if (val) {
				return this.each(function (el) {
					el.value = val;
				});
			} else {
				return this.get(0).value;
			}
		},

		data: function (key, val) {
			if (!this.size() || !key) { return; }

			if (val) {
				return this.each(function (el) {
					el.dataset[key] = val;
				});
			} else {
				return this.get(0).dataset[key];
			}
		},

		attr: function (key, val) {
			if (!this.size() || !key) { return; }

			if (val) {
				return this.each(function (el) {
					el.setAttribute(key, val);
				});
			} else {
				return this.get(0).getAttribute(key);
			}
		},

		removeAttr: function (key) {
			if (!this.size() || !key) { return; }

			return this.each(function (el) {
				el.removeAttribute(key);
			});
		},

		// #####################################################################
		// ### STYLE ###########################################################
		// #####################################################################

		style: function (key, val) {
			if (!this.size() || !key) { return; }

			var el = this.get(0);

			if (type(key) === 'string' && !val) {
				return window.getComputedStyle(el)[key];
			} else if (val) {
				el.style[key] = val;
			} else if (type(key) === 'object') {
				each(key, function (val, prop) {
					el.style[prop] = val;
				});
			}

			return this;
		},

		width: function (val) {
			return (!val)
				? parseInt(this.style('width'))
				: this.style('width', val);
		},

		height: function (val) {
			return (!val)
				? parseInt(this.style('height'))
				: this.style('height', val);
		},

		show: function () {},

		hide: function () {},

		toggle: function () {},

		position: function () {
			if (!this.size()) { return; }

			var el = this.get(0);

			return {
				top: el.offsetTop,
				left: el.offsetLeft
			};
		},

		offset: function () {
			if (!this.size()) { return; }

			var rect = this.get(0).getBoundingClientRect(),
				body = window.document.body;

			return {
				top: rect.top + body.scrollTop,
				left: rect.left + body.scrollLeft
			};
		},

		hasClass: function (className) {
			if (!this.size() || !className) { return; }

			var result = false,
				pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");

			this.each(function (el) {
				if (pattern.test(el.className)) {
					result = true;
				}
			});

			return result;
		},

		addClass: function (className) {
			if (!this.size() || !className) { return; }

			return this.each(function (el) {
				var $el = new domster(el);

				if (!$el.hasClass(className)) {
					el.className = [el.className, className].join(' ');
				}
			});
		},

		removeClass: function (className) {
			if (!this.size()) { return; }

			var pattern = new RegExp('\\b' + className + '\\b', 'g');

			return this.each(function (el) {
				var $el = new domster(el);

				if ($el.hasClass(className)) {
					el.className = el.className.replace(pattern, '');
				} else if (!className) {
					el.className = '';
				}
			});
		},

		toggleClass: function (className) {
			if (!this.size() || !className) { return; }

			return this.each(function (el) {
				var $el = new domster(el);

				if (!$el.hasClass(className)) { $el.addClass(className); }
				else { $el.removeClass(className); }
			});
		},

		// #####################################################################
		// ### EVENTS ##########################################################
		// #####################################################################

		on: function (type, fn) {
			return this.each(function (el) {
				el.addEventListener(type, fn);
			});
		},

		once: function (type, fn) {
			var fx;

			return this.each(function (el) {
				el.addEventListener(type, fx = function () {
					fn(arguments);
					el.removeEventListener(type, fx);
				});
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

	// #########################################################################
	// ### ALIASES #############################################################
	// #########################################################################

	extend(domster.prototype, {
		one: domster.prototype.once,
		css: domster.prototype.style,
		length: domster.prototype.size
	});

	// #########################################################################
	// ### UMD #################################################################
	// #########################################################################

	if (typeof define === 'function' && define.amd) {
		define(function () { return domster; });
	} else if (typeof module === 'object' && module.exports) {
		module.exports = domster;
	} else {
		window.$ = domster;
	}
})(this);