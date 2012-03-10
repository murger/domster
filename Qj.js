/**
 * Qj v0.1.0-alpha
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
**/

 /**
  * TODO
  *
  * Selector: avoid
  * Core: each, extend
  * Classes: addClass, removeClass, hasClass
  * Attributes: attr
  * CSS: css
  * DOM Traversing: find
  * DOM Manipulation: insert, html
  * EVENTS: bind, unbind, trigger
 **/

(function(window, document) {
	var Qj = function(selector, root) {
		if (!(this instanceof Qj)) {
			return new Qj(selector, root);
		}

		extend(this, query(selector, root));
	},

	_Qj = window.Qj, // Save Qj to restore later if needed
	toString = Object.prototype.toString,
	push = Array.prototype.push,
	hasOwn = Object.prototype.hasOwnProperty,

	query = function(selector, root) {
		root = document.querySelector(root) || document;

		return selector ?
			toArray(root.querySelectorAll(selector)) :
			[];
	},

	toArray = function (list) {
		for (var arr = [], i = list.length >>> 0; i--;) {
			arr[i] = list[i];
		}

		return arr;
	},

	get = Qj.get = function (obj, idx) {
		var i = idx || 0;

		return obj[(i < 0) ? size(obj) + i : i];
	},

	size = Qj.size = function (obj) {
		var count = 0;
		for (var prop in obj) {
			if (hasOwn.call(obj, prop)) {
				count++;
			}
		}

		return count;
	},

	each = Qj.each = function (obj, fn, context) {
		if (type(obj) === 'array') {
			for (var i = 0; i < obj.length; i++) {
				fn.call(context, obj[i], i, obj);
			}
		} else {
			for (var prop in obj) {
				if (hasOwn.call(obj, prop)) {
					fn.call(context, obj[prop], prop, obj);
				}
			}
		}

		return obj;
	},

	extend = Qj.extend = function(targ, src) {
		if (type(src) === 'array') {
			for (var i = 0; i < src.length; i++) {
				if (type(targ) === 'array') {
					targ[targ.length] = src[i];
				} else {
					targ[i] = src[i];
				}
			}
		} else {
			for (var prop in src) {
				targ[prop] = src[prop];
			}
		}

		return targ;
	},

	type = Qj.type = function(obj) {
		return obj == null ?
			String(obj) :
			classTypeMap[toString.call(obj)] || 'object';
	},

	hasClass = Qj.hasClass = function(node, classStr) {
		return node && classStr &&
			!!~(' ' + node.className + ' ').indexOf(' ' + classStr + ' ');
	},

	// Class to type mapping
	classTypeMap = {};

	each('Boolean Number String Function Array Date RegExp Object'.split(' '),
		function(val) {
			classTypeMap['[object ' + val + ']'] = val.toLowerCase();
		}
	);

	// Add core methods to Qj.prototype
	each('size get each extend type'.split(' '), function(val) {
		Qj.prototype[val] = function () {
			var args = [this];
			push.apply(args, arguments);
			return Qj[val].apply(this, args);
		};
	});

	Qj.prototype.hasClass = function(cssClass) {
		for (var node, i = 0; node = this[i]; i++) {
			if (hasClass(node, cssClass)) {
				return true;
			}
		}

		return false;
	};

	// Expose Qj
	window.Qj = Qj;
})(this, this.document);