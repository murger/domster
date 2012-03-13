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
  * CSS: addClass, removeClass, css
  * DOM Traversing: parent, child
  * DOM Manipulation: insert, remove, attr, html
  * EVENTS: bind, free, trigger
 **/

(function(window, document) {
	/**
	 * Constructor
	**/
	var Qj = function(selector, root) {
		if (!(this instanceof Qj)) {
			return new Qj(selector, root);
		}

		// Selector
		root = document.querySelector(root) || document;
		selector = selector ? root.querySelectorAll(selector) : {};

		delete selector.length;
		return merge(this, selector);
	},

	// Shortcuts, helpers, etc...
	_Qj = window.Qj,
	classTypeMap = [],
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push;

	/**
	 * CORE
	**/
	Qj.prototype.get = function (idx) {
		var i = idx || 0,
			prop = i < 0 ? count(this) + i : i;

		if (hasOwn.call(this, prop)) {
			return merge(Qj(), [this[prop]]);
		}

		return undefined;
	};

	var count = Qj.count = function (obj) {
		var count = 0;

		each(obj, function () {
			count++;
		});

		return count;
	},

	each = Qj.each = function (obj, fn) {
		if (type(obj) === 'array') {
			for (var i = 0; i < obj.length; i++) {
				fn.call(obj[i], obj[i], i, obj);
			}
		} else {
			for (var prop in obj) {
				if (hasOwn.call(obj, prop)) {
					fn.call(obj[prop], obj[prop], prop, obj);
				}
			}
		}

		return obj;
	},

	merge = Qj.merge = function(obj, src) {
		each(src, function (val, key) {
			obj[key] = val;
		});

		return obj;
	},

	extend = Qj.extend = function(obj, src) {
		each(src, function (val, key) {
			if (type(obj) === 'array') {
				obj[obj.length] = val;
			} else if (type(obj) === 'object') {
				while (hasOwn.call(obj, key)) {
					// Increment key for Qj objects, prefix it with _ for others
					key = obj instanceof Qj ? count(obj) : '_' + key;
				}

				obj[key] = val;
			}
		});

		return obj;
	},

	type = Qj.type = function(val) {
		return val == null ?
			String(val) :
			classTypeMap[toString.call(val)] || 'object';
	};

	Qj.now = function () {
		// +new Date() is slow: http://jsperf.com/posix-time
		return (Date.now) ?
			Date.now() :
			new Date.getTime();
	};

	/**
	 * CSS
	**/
	Qj.prototype.hasClass = function(cssClass) {
		var checkClass = function(node, cssClass) {
			return node && cssClass &&
				!!~(' ' + node.className + ' ').indexOf(' ' + cssClass + ' ');
		};

		for (var node, i = 0; node = this[i]; i++) {
			if (!checkClass(node, cssClass)) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Class to type map, utilised by Qj.type()
	**/
	each('Boolean Number String Function Array Date RegExp Object'.split(' '),
		function(val) {
			classTypeMap['[object ' + val + ']'] = val.toLowerCase();
		}
	);

	/**
	 * Add methods to Qj.prototype (Qj object self-apply)
	**/
	each('count each extend'.split(' '), function(method) {
		Qj.prototype[method] = function () {
			var args = [this];

			push.apply(args, arguments);
			return Qj[method].apply(this, args);
		};
	});

	/**
	 * Free up Qj and map it something else
	**/
	Qj.mapAlias = function () {
		if (!_Qj && window.Qj) {
			delete window.Qj;
		} else {
			window.Qj = _Qj;
		}

		return Qj;
	};

	// Version info
	Qj.v = '0.1.0-alpha';

	// Expose Qj
	window.Qj = Qj;
})(this, this.document);