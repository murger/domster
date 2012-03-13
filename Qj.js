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
		result = selector ? root.querySelectorAll(selector) : {};

		delete result.length;
		return (!result) ? this : merge(this, result);
	},

	// Shortcuts, helpers, etc...
	_Qj = window.Qj,
	classTypeMap = [],
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	isEnumerable = function (obj) {
		return (type(obj) === 'array' || typeof obj === 'object');
	};

	/**
	 * CORE
	**/
	Qj.prototype.get = function (idx) {
		var i = idx || 0,
			prop = i < 0 ? count(this) + i : i;

		if (hasOwn.call(this, prop)) {
			return merge(Qj(), [this[prop]]);
		}

		return;
	};

	var count = Qj.count = function (obj) {
		var count = 0;

		each(obj, function () {
			count++;
		});

		return count;
	},

	each = Qj.each = function (obj, fn, context) {
		if (!isEnumerable(obj) || typeof fn !== 'function') {
			throw new TypeError();
		}


		if (type(obj) === 'array') {
			for (var i = 0; i < obj.length; i++) {
				context = (!context) ? obj[i] : context;
				fn.call(context, obj[i], i, obj);
			}
		} else if (typeof obj === 'object') {

			for (var prop in obj) {
				context = (!context) ? obj[prop] : context;
				if (hasOwn.call(obj, prop)) {
					fn.call(context, obj[prop], prop, obj);
				}
			}
		}

		return obj;
	},

	merge = Qj.merge = function(obj, src) {
		if (!isEnumerable(obj)) {
			throw new TypeError();
		}

		each(src, function (val, key) {
			if (type(obj) === 'array') {
				key = obj.length;
			} else if (typeof obj === 'object') {
				if (obj instanceof Qj) {
					key = count(obj);
				} else if (hasOwn.call(obj, key)) {
					return;
				}
			}

			obj[key] = val;
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
		if (type(cssClass) !== 'string') {
			throw new TypeError();
		}

		var hasClass = [],
			classExists = function (node) {
				return !!~(' ' + node.className + ' ').indexOf(' ' + cssClass + ' ');
			}

		each(this, function (node) {
			hasClass[hasClass.length] = (!classExists(node)) ? false : true;
		});

		return hasClass.length > 1 ? hasClass : hasClass[0];
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
	 * Add some Qj.methods() as .methods(), so they can be used with the selector
	**/
	each('count each merge'.split(' '), function(method) {
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