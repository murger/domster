(function (window, document) {
	'use strict';

	/**
	 * CONSTRUCTOR
	 */
	var nomad = function (selector, root) {
		if (!(this instanceof nomad)) {
			return new nomad(selector, root);
		}

		if (selector) {
			this.nodes = select(selector, root);
		}
	},

	/**
	 * SHORTCUTS
	 */
	_$ = window.$,
	guid = Math.random() * 9e17,
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	trim = String.prototype.trim,

	/**
	 * getElementsByClassName POLYFILL (for IE8)
	 */
	getElementsByClassName =
		(typeof document.getElementsByClassName === 'function')

		// Use native
		? function (cssClass) {
			return this.getElementsByClassName(cssClass);
		}

		// Use polyfill
		: function (cssClass) {
			var i, j,
				node, child,
				result = [],

				hasChildren = function (node) {
					return !!node.children.length;
				},

				pickByClassName = function (node) {
					if (hasClass(node, cssClass)) {
						result.push(node);
					}
				},

				collection = (this === document)
					? document.body.children
					: this.children;

			for (i = 0; node = collection[i]; i++) {
				pickByClassName(node);

				if (hasChildren(node)) {
					for (j = 0; child = node.children[j]; j++) {
						if (hasChildren(child)) {
							push.call(collection, child);
						} else {
							pickByClassName(child);
						}
					}
				}
			}

			return result;
		},

	/**
	 * SELECTOR
	 */
	select = function (selector, root) {
		root = (root)
			? select(root)[0]
			: document;

		if (!root) {
			throw new Error();
		}

		var found,
			result = [];

		// #id
		if (found = /^#([\w\-]+)$/.exec(selector)) {
			return (result = root.getElementById(found[1]))
				? [result]
				: [];
		}

		// [1] -> <tag>
		// [2] -> <tag> (if .class specified)
		// [3] -> .class
		found = /^(?:([\w]+)|([\w]+)?\.([\w\-]+))$/.exec(selector);

		// only <tag>
		if (found[1]) {
			return root.getElementsByTagName(found[1]);
		}

		var nodes = getElementsByClassName.call(root, found[3]);

		// only .class
		if (!found[2]) {
			return nodes;
		}

		// <tag> & .class
		var i, len;

		for (i = 0, len = nodes.length; i < len; i++) {
			if (nodes[i].nodeName === found[2].toUpperCase()) {
				result.push(nodes[i]);
			}
		}

		return result;
	},

	/**
	 * HELPERS
	 */
	isObj = function (obj) {
		return (typeof obj === 'object');
	},

	isEnum = function (obj) {
		return (type(obj) === 'array' || type(obj) === 'nodelist');
	},

	isElement = function (node) {
		return (node.nodeType === 1);
	},

	hasClass = function (node, cssClass) {
		return !!~(' ' + node.className + ' ').indexOf(' ' + cssClass + ' ');
	},

	each = function (obj, fn, context) {
		if (obj instanceof nomad) {
			if (obj.nodes.length) {
				obj = obj.nodes;
			} else {
				return obj;
			}
		}

		if (isEnum(obj)) {
			for (var i = 0; i < obj.length; i++) {
				context || (context = obj[i]);
				fn.call(context, obj[i], i, obj);
			}

		} else if (isObj(obj)) {
			for (var prop in obj) {
				if (hasOwn.call(obj, prop)) {
					context || (context = obj[prop]);
					fn.call(context, obj[prop], prop, obj);
				}
			}
		}

		return obj;
	},

	extend = function (obj, src, keep) {
		each(src, function (val, key) {
			if (isEnum(obj)) {
				key = (keep)
					? obj.length	// new key
					: key;			// overwrite

			// typeof nomad === function
			} else if (isObj(obj) || typeof obj === 'function') {
				if (keep && hasOwn.call(obj, key)) {
					return; // don't copy
				}
			}

			obj[key] = val;
		});

		return obj;
	},

	type = function (val) {
		return (!val)
			? String(val) // null & undefined
			: classTypeMap[toString.call(val)] || 'object';
	},

	// Map classes to lowercase type identifiers
	classTypeMap = [],
	types = 'Boolean Number String Function Array Date RegExp NodeList Object';

	each(types.split(' '), function(val) {
		classTypeMap['[object ' + val + ']'] = val.toLowerCase();
	});

	/**
	 * UTILS
	 */
	extend(nomad, {
		each: each,
		extend: extend,
		type: type,
		trim: (trim)
			? function (string) {
				return trim.call(string);
			}

			: function (string) {
				trim = /\S/.test('\xA0')
					? /^[\s\xA0]+|[\s\xA0]+$/g
					: /^\s+|\s+$/g;

				return string.replace(trim, '');
			},

		now: function () {
			// '+new Date()' is slow, see: http://jsperf.com/posix-time
			return (Date.now)
				? Date.now()
				: new Date().getTime();
		},

		remap: function () {
			if (window.$() instanceof this) {
				delete window.$;
			}

			if (_$) {
				window.$ = _$;
				_$ = undefined;
			}

			return this;
		}
	});

	/**
	 * DOM TRAVERSAL
	 */
	extend(nomad.prototype, {
		nodes: [],

		count: function () {
			return (this.nodes && this.nodes.length)
				? this.nodes.length
				: 0;
		},

		eq: function (idx) {
			var i = idx || 0,
				n = (i < 0)
					? this.nodes.length + i
					: i;

			this.nodes = [this.nodes[n]];

			return this;
		},

		each: function () {
			// augment 'this' as the first argument
			var a = [this];
			push.apply(a, arguments);

			return each.apply(this, a);
		}
	});

	/**
	 * DOM EVENTS
	 */
	extend(nomad.prototype, {
		bind: (document.addEventListener)
			? function (type, fn) {
				this.each(function (node) {
					node.nomad = {
						events: {}
					};

					node.nomad.events[type] = [fn];
					node.addEventListener(type, fn, false);
				});

				return this;
			}

			// IE
			: function (type, fn) {
				var fx;

				fx = fn[guid] || (fn[guid] = function (e) {
					e.preventDefault = function () { this.returnValue = false; };
					e.stopPropagation = function () { this.cancelBubble = true; };

					fn.call(this.nodes[0], e);
				});

				this.each(function (node) {
					node.attachEvent('on' + type, fx);
				});

				return this;
			},

		// TODO: treat node.nomad.events[type] as an array
		free: (document.removeEventListener)
			? function (type, fn) {
				this.each(function (node) {
					if (!fn) {
						fn = node.nomad.events[type];
						delete node.nomad.events[type];
					}

					node.removeEventListener(type, fn, false);
				});

				return this;
			}

			// IE
			: function (type, fn) {
				this.each(function (node) {
					node.detachEvent('on' + type, fn[guid] || fn);
				});

				return this;
			}
	});

	/**
	 * CSS
	 */
	extend(nomad.prototype, {
		hasClass: function (cssClass) {
			if (!this.nodes.length || !cssClass) {
				return;
			}

			return hasClass(this.nodes[0], cssClass)
		}
	});

	/**
	 * VERSIONING & EXPOSURE
	 */
	nomad.v = '0.1.4';
	window.$ = nomad;

})(this, this.document);