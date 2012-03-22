/**
 * Qj v0.1.3
 * a light-weight JavaScript framework
 * http://github.com/murger/Qj/
 *
 * Copyright 2012, Gurhan Mermer
 * http://twitter.com/murger/
 *
 * MIT LICENSE
 * http://opensource.org/licenses/mit-license.php
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * TODO
 *
 * CSS: addClass, removeClass, css
 * EVENTS: bind, free, trigger
 * DOM Traversal
 *		Qj(*).parent()
 *		Qj(*).children()
 *		Qj(*).children('#modal')
 *		Qj(*).siblings()
 *		Qj(*).next()
 *		Qj(*).prev()
 *		Qj(*).filter(function (i) { return true; })
 *		-> i(0), i(-1) as first() and last()
 * DOM Manipulation
 *		Qj.create('div', { id: 1, class: ['button'], text 'blah', insertBefore: '.box' })
 *		Qj(*).text('meh.')
 *		Qj(*).attr('title')
 *		Qj(*).attr({ src: 'image.jpg' })
 *		Qj(*).data('price')
 *		Qj(*).data('price', { name: 'bob' })
 *		Qj(*).remove()
 */

(function(window, document) {
	'use strict';

	/**
	 * Selector
	 */
	var Qj = function (selector, root) {
		if (!(this instanceof Qj)) {
			return new Qj(selector, root);
		}

		if (!selector && !root) {
			return this;
		}

		this.nodes = select(selector, root);
	},

	getByClass = (function () {
		if (typeof document.getElementsByClassName === 'function') {
			return document.getElementsByClassName;
		}

		// getElementsByClassName polyfill
		return function (cssClass) {
			var nodes = (this === document)
					? document.body.children
					: this.children,
				push = Array.prototype.push,
				result = [],
				i = 0, j = 0,
				n, c,

				hasChildren = function (node) {
					return (node.children && node.children.length);
				},

				filterNodeByClass = function (node) {
					if (elHasClass(node, cssClass)) {
						push.call(result, node);
					}
				};

			while (n = nodes[i++]) {
				filterNodeByClass(n);

				if (hasChildren(n)) {
					j = 0;

					while (c = n.children[j++]) {
						if (hasChildren(c)) {
							push.call(nodes, c);
						} else {
							filterNodeByClass(c);
						}
					}
				}
			}

			return result;
		};
	})(),

	select = function (selector, root) {
		var root = (root) ? select(root)[0] : document,
			found,
			result = [];

		// ID
		if (found = /^#([\w\-]+)$/.exec(selector)) {
			return (result = root.getElementById(found[1]))
				? [result]
				: [];
		}

		// [1] just tag, [2] tag when class, [3] class
		found = /^(?:([\w]+)|([\w]+)?\.([\w\-]+))$/.exec(selector);

		// Just tag
		if (found[1]) {
			return root.getElementsByTagName(found[1]);
		}

		// Just class
		if (!found[2]) {
			return getByClass.call(root, found[3]);
		}

		// Tag and class
		;

		for (var i = 0, nodes = getByClass.call(root, found[3]); i < nodes.length; i++) {
			if (nodes[i].nodeName === found[2].toUpperCase()) {
				result.push(nodes[i]);
			}
		}

		return result;
	},

	// Shortcuts and helper methods
	_Qj = window.Qj,
	classTypeMap = [],

	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	splice = Array.prototype.splice,

	isObj = function (obj) {
		return (typeof obj === 'object')
	},

	isEnum = function (obj) {
		return (type(obj) === 'array' || isObj(obj));
	},

	isElement = function (node) {
		return (node.nodeType === 1);
	};

	/**
	 * CORE
	 */
	Qj.prototype.nodes = [];

	Qj.prototype.i = function (idx) {
		var i = idx || 0,
			n = (i < 0)
				? this.nodes.length + i
				: i;

		this.nodes = [this.nodes[n]];

		return this;
	};

	Qj.now = function () {
		// +new Date() is slow, see: http://jsperf.com/posix-time
		return (Date.now)
			? Date.now()
			: new Date.getTime();
	};

	var each = Qj.each = function (obj, fn, context) {
		if (type(obj) === 'array' || type(obj) === 'nodelist') {
			for (var i = 0; i < obj.length; i++) {
				fn.call((context ? context : obj[i]), obj[i], i, obj);
			}
		} else if (isObj(obj)) {
			for (var prop in obj) {
				if (hasOwn.call(obj, prop)) {
					fn.call((context ? context : obj[prop]), obj[prop], prop, obj);
				}
			}
		}

		return obj;
	},

	// Qj.merge([], {a:1}) –> converts object to an array
	merge = Qj.merge = function (obj, src) {
		each(src, function (val, key) {
			if (type(obj) === 'array' || type(obj) === 'nodelist') {
				key = obj.length;

				if (obj instanceof Qj) {
					obj.length++;
				}
			} else if (isObj(obj)) {
				if (hasOwn.call(obj, key)) {
					return; // continue
				}
			}

			obj[key] = val;
		});

		return obj;
	},

	type = Qj.type = function (val) {
		return (!val)
			? String(val)
			: classTypeMap[toString.call(val)] || 'object';
	};

	/**
	 * CSS
	 */
	var elHasClass = function (node, cssClass) {
		return !!~(' ' + node.className + ' ').indexOf(' ' + cssClass + ' ');
	};

	Qj.prototype.hasClass = function (cssClass) {
		var result = [];

		each(this.nodes, function (node) {
			result[result.length] = (elHasClass(node, cssClass))
				? true
				: false;
		});

		return (result.length > 1)
			? result
			: result[0];
	};

	/**
	 * Class to type map utilised by Qj.type()
	 */
	each('Boolean Number String Function Array Date RegExp NodeList Object'.split(' '),
		function(val) {
			classTypeMap['[object ' + val + ']'] = val.toLowerCase();
		}
	);

	/**
	 * Add some Qj.methods() to prototype
	 */
	each('each merge'.split(' '), function(method) {
		Qj.prototype[method] = function () {
			var args = [this];

			push.apply(args, arguments);
			return Qj[method].apply(this, args);
		};
	});

	/**
	 * Free up Qj and map it something else
	 */
	Qj.mapAlias = function () {
		if (window.Qj() instanceof Qj) {
			delete window.Qj;
		}

		if (_Qj) {
			window.Qj = _Qj;
			_Qj = false;
		}

		return Qj;
	};

	// Version info
	Qj.v = '0.1.3';

	// Expose Qj
	window.Qj = Qj;

})(this, this.document);