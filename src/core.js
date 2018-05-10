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
		} else if (isList(query)) {
			this.set = query;
		} else if (isEl(query)) {
			this.set = [query];
		} else if (query instanceof domster) {
			this.set = query.set;
		}

		return this;
	},

	create = function (tag) {
		return [window.document.createElement(tag)];
	},

	select = function (query, context) {
		var map,
			found,
			set = [];

		if (map = /^([#\.\w]+)\s+([#\.\w]+)$/.exec(query)) {
			return select(map[2], map[1]);
		} else if (!context) {
			context = window.document;
		} else if (!isEl(context) && !isDoc(context)) {
			context = select(context)[0];
		}

		// #id
		if (map = /^#([\w\-]+)$/.exec(query)) {
			return (set = context.getElementById(map[1])) ? [set] : [];
		}

		// [1] -> tag [2] -> tag.class [3] -> .class
		map = /^(?:([\w]+)|([\w]+)?\.([\w\-]+))$/.exec(query);

		if (!map) { return context.querySelectorAll(query); } // fallback
		if (map[1]) { return context.getElementsByTagName(map[1]); } // tag

		found = context.getElementsByClassName(map[3]);

		if (!map[2]) { return found; } // .class

		for (var i = 0, len = found.length; i < len; i++) {
			if (found[i].nodeName === map[2].toUpperCase()) {
				set.push(found[i]);
			}
		}

		return set; // tag.class
	},

	mutate = function (src, iterator, obj) {
		if (!obj.size()) { return; }
		else if (!isEl(src) && !isList(src) && !isSet(src)) { return; }
		else if (isEl(src) || isList(src)) { src = new domster(src); }

		obj.each(function (el) { return iterator(el, src); });
		src.remove();

		return obj;
	},

	transform = function (iterator, obj, group) {
		var set = [],
			group = group || obj;

		group.each(function (el) { return iterator(el, set); });
		obj.set = set;

		return obj;
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

	isEl = function (node) {
		return node && (node.nodeType === 1);
	},

	isDoc = function (node) {
		return node && (node.nodeType === 9);
	},

	isList = function (obj) {
		return obj && (type(obj) === 'nodelist' || type(obj) === 'htmlcollection');
	},

	isStr = function (obj) {
		return obj && type(obj) === 'string';
	},

	isNum = function (obj) {
		return type(obj) === 'number';
	},

	isArray = function (obj) {
		return obj && (type(obj) === 'array');
	},

	isEnum = function (obj) {
		return obj && (isArray(obj) || isList(obj));
	},

	isObj = function (obj) {
		return obj && (typeof obj === 'object');
	},

	each = function (obj, fn, context) {
		if (isSet(obj) && obj.size()) {
			if (obj.size() === 1) {
				fn.call(context || obj.get(0), obj.get(0), 0, obj.set);
			} else {
				for (var i = 0, len = obj.size(); i < len; i++) {
					var fx = fn.call(context || obj.get(i), obj.get(i), i, obj.set);

					if (fx === false) { break; }
					else if (fx === true) { continue; }
				}
			}
		} else if (isEnum(obj)) {
			for (var i = 0, len = obj.length; i < len; i++) {
				var fx = fn.call(context || obj[i], obj[i], i, obj);

				if (fx === false) { break; }
				else if (fx === true) { continue; }
			}
		} else if (isObj(obj)) {
			for (var key in obj) {
				if (hasOwn.call(obj, key)) {
					var fx = fn.call(context || obj[key], obj[key], key, obj);

					if (fx === false) { break; }
					else if (fx === true) { continue; }
				}
			}
		}

		return obj;
	},

	extend = function (obj, src, keep) {
		each(src, function (val, key) {
			if (isEnum(obj)) {
				key = (keep) ? obj.length : key;
			} else if (isObj(obj) || typeof obj === 'function') {
				if (keep && hasOwn.call(obj, key)) { return; }
			}

			obj[key] = val;
		});

		return obj;
	},

	type = function (val) {
		return (val !== null && val !== undefined)
			? typeMap[toString.call(val)] || 'object'
			: String(val);
	},

	types = 'Boolean Number String Function Array Date RegExp NodeList HTMLCollection Object',
	typeMap = [];

	each(types.split(' '), function (val) {
		typeMap['[object ' + val + ']'] = val.toLowerCase();
	});

	// #########################################################################
	// ### UTILITY #############################################################
	// #########################################################################

	extend(domster, {
		fn: domster.prototype,
		extend: extend,
		each: each,
		type: type
	});

	extend(domster.fn, {
		set: [],

		size: function () {
			return this.set.length;
		},

		get: function (idx) {
			if (!this.size() || !isNum(idx)) { return; }

			var x = (idx < 0 && -idx <= this.size())
				? this.size() + idx
				: idx;

			return this.set[x];
		},

		each: function () {
			var augment = [this];

			push.apply(augment, arguments);
			each.apply(this, augment);

			return this;
		},

		// ####### ######     #    #     # ####### ######   #####  #######
		//    #    #     #   # #   #     # #       #     # #     # #
		//    #    #     #  #   #  #     # #       #     # #       #
		//    #    ######  #     # #     # #####   ######   #####  #####
		//    #    #   #   #######  #   #  #       #   #         # #
		//    #    #    #  #     #   # #   #       #    #  #     # #
		//    #    #     # #     #    #    ####### #     #  #####  #######

		is: function (query) {
			if (!this.size()) { return false; }
			else if (!query) { return true; }
			else if (!isEl(query) && !isStr(query)) { return; }

			var result = true;

			this.each(function (el) {
				if (isEl(query) && el !== query) {
					result = false;
				} else if (isStr(query) && !matches.call(el, query)) {
					result = false;
				}
			});

			return result;
		},

		not: function (query) {
			if (!this.size() || !query) { return; }

			return transform(function (el, set) {
				if (!matches.call(el, query)) {
					set.push(el);
				}
			}, this);
		},

		push: function (query) {
			if (!this.size() || !query) { return; }

			var set = slice.call(this.set),
				mark;

			if (isEl(query) || isList(query)) { mark = query; }
			else if (isStr(query)) { mark = slice.call(select(query)); }

			each(mark, function (el) {
				if (!~set.indexOf(el)) { set.push(el); }
			});

			this.set = set;

			return this;
		},

		at: function (idx) {
			if (!this.size() || !isNum(idx)) { return; }

			var mark = this.set,
				x, group;

			return transform(function (el, set) {
				group = slice.call(el.parentNode.children);
				x = (idx < 0 && -idx <= group.length)
					? group.length + idx
					: idx;

				if (group.indexOf(el) === x) {
					set.push(el);
				}
			}, this);
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

		next: function (query) {
			if (!this.size()) { return; }

			return transform(function (el, set) {
				var next = el.nextElementSibling;

				if (next && (!query || matches.call(next, query))) {
					set.push(next);
				}
			}, this);
		},

		prev: function (query) {
			if (!this.size()) { return; }

			return transform(function (el, set) {
				var prev = el.previousElementSibling;

				if (prev && (!query || matches.call(prev, query))) {
					set.push(prev);
				}
			}, this);
		},

		ancestor: function (query) {
			if (!this.size() || !query) { return; }

			return transform(function (el, set) {
				var parent = el.parentNode;

				while (!isDoc(parent)) {
					if (!!~set.indexOf(parent)) {
						break;
					} else if (matches.call(parent, query)) {
						set.push(parent); break;
					} else {
						parent = parent.parentNode;
					}
				}
			}, this);
		},

		parent: function (query) {
			if (!this.size()) { return; }

			return transform(function (el, set) {
				var parent = el.parentNode;

				if (!~set.indexOf(parent) && (!query || matches.call(parent, query))) {
					set.push(parent);
				}
			}, this);
		},

		siblings: function (query) {
			if (!this.size()) { return; }

			var mark = this.set;

			return transform(function (el, set) {
				if (!~mark.indexOf(el) && (!query || matches.call(el, query))) {
					set.push(el);
				}
			}, this, this.parent().children());
		},

		children: function (query) {
			if (!this.size()) { return; }

			return transform(function (el, set) {
				each(el.children, function (child) {
					if (!query || matches.call(child, query)) {
						set.push(child);
					}
				});
			}, this);
		},

		find: function (query) {
			if (!this.size() || !query) { return; }

			return transform(function (el, set) {
				if (el.children.length > 0) {
					extend(set, slice.call(select(query, el)), true);
				}
			}, this);
		},

		filter: function (query) {
			if (!this.size() || !query) { return; }

			return transform(function (el, set) {
				if (matches.call(el, query)) {
					set.push(el);
				}
			}, this);
		},

		// #     # #     # #######    #    ####### #######
		// ##   ## #     #    #      # #      #    #
		// # # # # #     #    #     #   #     #    #
		// #  #  # #     #    #    #     #    #    #####
		// #     # #     #    #    #######    #    #
		// #     # #     #    #    #     #    #    #
		// #     #  #####     #    #     #    #    #######

		before: function (src) {
			return mutate(src, function (el, src) {
				src.each(function (node) {
					el.parentNode.insertBefore(node.cloneNode(true), el);
				});
			}, this);
		},

		after: function (src) {
			return mutate(src, function (el, src) {
				var mark = el.nextSibling;

				src.each(function (node) {
					el.parentNode.insertBefore(node.cloneNode(true), mark);
				});
			}, this);
		},

		append: function (src) {
			return mutate(src, function (el, src) {
				src.each(function (node) {
					el.appendChild(node.cloneNode(true));
				});
			}, this);
		},

		prepend: function (src) {
			return mutate(src, function (el, src) {
				src.each(function (node) {
					el.insertBefore(node.cloneNode(true), el.firstChild);
				});
			}, this);
		},

		replace: function (src) {
			return mutate(src, function (el, src) {
				var mark = el.nextSibling;

				el.parentNode.removeChild(el);
				src.each(function (node) {
					mark.parentNode.insertBefore(node.cloneNode(true), mark);
				});
			}, this);
		},

		clone: function () {
			if (!this.size()) { return; }

			return transform(function (el, set) {
				set.push(el.cloneNode(true));
			}, this);
		},

		remove: function (query) {
			if (!this.size()) { return; }

			var i = this.set.length,
				el;

			while (i--) {
				el = this.set[i];
				if (el.parentNode && (!query || matches.call(el, query))) {
					el.parentNode.removeChild(el);
				}
			}

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

		//  #####  ####### #     # #       #######
		// #     #    #     #   #  #       #
		// #          #      # #   #       #
		//  #####     #       #    #       #####
		//       #    #       #    #       #
		// #     #    #       #    #       #
		//  #####     #       #    ####### #######

		style: function (key, val) {
			if (!this.size() || !key) { return; }

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
				pattern = new RegExp('(^|\\s)' + className + '(\\s|$)');

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

			var pattern = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');

			return this.each(function (el) {
				el.className = (className)
					? el.className.replace(pattern, '')
					: el.className = '';
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

		// ####### #     # ####### #     # #######
		// #       #     # #       ##    #    #
		// #       #     # #       # #   #    #
		// #####   #     # #####   #  #  #    #
		// #        #   #  #       #   # #    #
		// #         # #   #       #    ##    #
		// #######    #    ####### #     #    #

		on: function (type, fn) {
			return this.each(function (el) {
				el.addEventListener(type, fn);
			});
		},

		once: function (type, fn) {
			var fx;

			return this.each(function (el) {
				el.addEventListener(type, fx = function () {
					el.removeEventListener(type, fx);
					fn.apply(this, arguments);
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

	extend(domster.fn, {
		eq: domster.fn.at,
		add: domster.fn.push,
		closest: domster.fn.ancestor,
		replaceWith: domster.fn.replace,
		one: domster.fn.once,
		css: domster.fn.style,
		length: domster.fn.size
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