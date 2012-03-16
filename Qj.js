/**
 * Qj v0.1.2-alpha
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
 * DOM Traversing: parent, next, prev, filter?
 * DOM Manipulation:
 *		Qj.add({ id: 1, text 'blah', insertAfter: Qj('.box') }),
 *		Qj(*).modify({ id: 2 }),
 *		Qj(*).remove(),
 *		Qj(*).attr({ data-price: '5' }),
 *		Qj(*).attr('data-price')
 *		Qj(*).data('price')
 *		Qj(*).text('Lorem ipsum...') (createTextNode)
 * EVENTS: bind, free, trigger
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

		// Qj() will be handled as an array-like object
		this.length = 0;

		// Speed up .i() merge
		if (!selector && !root) {
			return this;
		}

		// Omitting root?
		var parent = (root)
			? document.querySelector(root)
			: document;

		// If parent's not found, there can't be a result
		var result = (parent)
			? parent.querySelectorAll(selector)
			: false;

		return (!result) ? this : merge(this, result);
	},

	// Shortcuts and helpers methods
	_Qj = window.Qj,
	classTypeMap = [],

	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,

	isObj = function (obj) {
		return (typeof obj === 'object')
	},

	isEnum = function (obj) {
		return (type(obj) === 'array' || isObj(obj));
	};

	/**
	 * CORE
	 */
	Qj.prototype.i = function (idx) {
		var i = idx || 0,
			prop = (i < 0)
				? this.length + i
				: i;

		if (hasOwn.call(this, prop)) {
			return merge(Qj(), [this[prop]]);
		}

		return;
	};

	var each = Qj.each = function (obj, fn, context) {
		if (!isEnum(obj) || typeof fn !== 'function') {
			throw new TypeError();
		}

		if (type(obj) === 'array' || obj instanceof Qj) {
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
		if (!isEnum(obj)) {
			throw new TypeError();
		}

		each(src, function (val, key) {
			if (type(obj) === 'array' || obj instanceof Qj && !isNaN(key)) {
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
		return val == null ?
			String(val) :
			classTypeMap[toString.call(val)] || 'object';
	};

	Qj.now = function () {
		// +new Date() is slow, see: http://jsperf.com/posix-time
		return (Date.now) ?
			Date.now() :
			new Date.getTime();
	};

	/**
	 * CSS
	 */
	Qj.prototype.hasClass = function (cssClass) {
		if (type(cssClass) !== 'string') {
			throw new TypeError();
		}

		var result = [],
			classExists = function (node) {
				return !!~(' ' + node.className + ' ').indexOf(' ' + cssClass + ' ');
			}

		each(this, function (node) {
			result[result.length] = (!classExists(node)) ? false : true;
		});

		return result.length > 1 ? result : result[0];
	};

	/**
	 * Class to type map utilised by Qj.type()
	 */
	each('Boolean Number String Function Array Date RegExp Object'.split(' '),
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
	Qj.v = '0.1.2-alpha';

	// Expose Qj
	window.Qj = Qj;

})(this, this.document);