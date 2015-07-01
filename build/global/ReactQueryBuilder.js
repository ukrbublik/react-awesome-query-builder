(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("immutable"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "immutable"], factory);
	else if(typeof exports === 'object')
		exports["ReactQueryBuilder"] = factory(require("react"), require("immutable"));
	else
		root["ReactQueryBuilder"] = factory(root["React"], root["Immutable"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_12__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequire = __webpack_require__(74)['default'];

	exports.__esModule = true;

	var _componentsQuery = __webpack_require__(60);

	exports.Query = _interopRequire(_componentsQuery);

	var _componentsBuilder = __webpack_require__(54);

	exports.Builder = _interopRequire(_componentsBuilder);

	var _componentsPreview = __webpack_require__(59);

	exports.Preview = _interopRequire(_componentsPreview);

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};

	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	exports.__esModule = true;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$create = __webpack_require__(70)["default"];

	exports["default"] = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }

	  subClass.prototype = _Object$create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) subClass.__proto__ = superClass;
	};

	exports.__esModule = true;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$defineProperty = __webpack_require__(71)["default"];

	exports["default"] = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;

	      _Object$defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();

	exports.__esModule = true;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = shouldPureComponentUpdate;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _shallowEqual = __webpack_require__(119);

	var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

	function shouldPureComponentUpdate(nextProps, nextState) {
	  return !(0, _shallowEqual2['default'])(this.props, nextProps) || !(0, _shallowEqual2['default'])(this.state, nextState);
	}

	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global = typeof self != 'undefined' ? self : Function('return this')()
	  , core   = {}
	  , defineProperty = Object.defineProperty
	  , hasOwnProperty = {}.hasOwnProperty
	  , ceil  = Math.ceil
	  , floor = Math.floor
	  , max   = Math.max
	  , min   = Math.min;
	// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
	var DESC = !!function(){
	  try {
	    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
	  } catch(e){ /* empty */ }
	}();
	var hide = createDefiner(1);
	// 7.1.4 ToInteger
	function toInteger(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	}
	function desc(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	}
	function simpleSet(object, key, value){
	  object[key] = value;
	  return object;
	}
	function createDefiner(bitmap){
	  return DESC ? function(object, key, value){
	    return $.setDesc(object, key, desc(bitmap, value));
	  } : simpleSet;
	}

	function isObject(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	}
	function isFunction(it){
	  return typeof it == 'function';
	}
	function assertDefined(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	}

	var $ = module.exports = __webpack_require__(81)({
	  g: global,
	  core: core,
	  html: global.document && document.documentElement,
	  // http://jsperf.com/core-js-isobject
	  isObject:   isObject,
	  isFunction: isFunction,
	  that: function(){
	    return this;
	  },
	  // 7.1.4 ToInteger
	  toInteger: toInteger,
	  // 7.1.15 ToLength
	  toLength: function(it){
	    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	  },
	  toIndex: function(index, length){
	    index = toInteger(index);
	    return index < 0 ? max(index + length, 0) : min(index, length);
	  },
	  has: function(it, key){
	    return hasOwnProperty.call(it, key);
	  },
	  create:     Object.create,
	  getProto:   Object.getPrototypeOf,
	  DESC:       DESC,
	  desc:       desc,
	  getDesc:    Object.getOwnPropertyDescriptor,
	  setDesc:    defineProperty,
	  setDescs:   Object.defineProperties,
	  getKeys:    Object.keys,
	  getNames:   Object.getOwnPropertyNames,
	  getSymbols: Object.getOwnPropertySymbols,
	  assertDefined: assertDefined,
	  // Dummy, fix for not array-like ES3 string in es5 module
	  ES5Object: Object,
	  toObject: function(it){
	    return $.ES5Object(assertDefined(it));
	  },
	  hide: hide,
	  def: createDefiner(0),
	  set: global.Symbol ? simpleSet : hide,
	  each: [].forEach
	});
	/* eslint-disable no-undef */
	if(typeof __e != 'undefined')__e = core;
	if(typeof __g != 'undefined')__g = global;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(11);

	/**
	 * Converts `value` to an object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  return isObject(value) ? value : Object(value);
	}

	module.exports = toObject;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(36),
	    isLength = __webpack_require__(10),
	    isObjectLike = __webpack_require__(14);

	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};

	module.exports = isArray;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	module.exports = isObject;


/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  if (obj && obj.__esModule) {
	    return obj;
	  } else {
	    var newObj = {};

	    if (obj != null) {
	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
	      }
	    }

	    newObj["default"] = obj;
	    return newObj;
	  }
	};

	exports.__esModule = true;

/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	module.exports = isObjectLike;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(75), __esModule: true };

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(20),
	    isLength = __webpack_require__(10);

	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}

	module.exports = isArrayLike;


/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	var ADD_GROUP = 'ADD_GROUP';
	exports.ADD_GROUP = ADD_GROUP;
	var REMOVE_GROUP = 'REMOVE_GROUP';
	exports.REMOVE_GROUP = REMOVE_GROUP;
	var SET_CONJUNCTION = 'SET_CONJUNCTION';

	exports.SET_CONJUNCTION = SET_CONJUNCTION;
	var ADD_RULE = 'ADD_RULE';
	exports.ADD_RULE = ADD_RULE;
	var REMOVE_RULE = 'REMOVE_RULE';
	exports.REMOVE_RULE = REMOVE_RULE;
	var SET_FIELD = 'SET_FIELD';
	exports.SET_FIELD = SET_FIELD;
	var SET_OPERATOR = 'SET_OPERATOR';
	exports.SET_OPERATOR = SET_OPERATOR;
	var SET_VALUE = 'SET_VALUE';
	exports.SET_VALUE = SET_VALUE;
	var SET_OPERATOR_OPTION = 'SET_OPERATOR_OPTION';
	exports.SET_OPERATOR_OPTION = SET_OPERATOR_OPTION;
	var SET_VALUE_OPTION = 'SET_VALUE_OPTION';

	exports.SET_VALUE_OPTION = SET_VALUE_OPTION;
	var SET_TREE = 'SET_TREE';
	exports.SET_TREE = SET_TREE;

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj, keys) {
	  var target = {};

	  for (var i in obj) {
	    if (keys.indexOf(i) >= 0) continue;
	    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
	    target[i] = obj[i];
	  }

	  return target;
	};

	exports.__esModule = true;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(36),
	    isArrayLike = __webpack_require__(16),
	    isObject = __webpack_require__(11),
	    shimKeys = __webpack_require__(111);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object != 'function' && isArrayLike(object))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};

	module.exports = keys;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(34);

	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');

	module.exports = getLength;


/***/ },
/* 21 */
/***/ function(module, exports) {

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = isIndex;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(16),
	    isObjectLike = __webpack_require__(14);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}

	module.exports = isArguments;


/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports["default"] = function (config) {
	  return {
	    conjunction: config.settings.defaultConjunction
	  };
	};

	module.exports = exports["default"];

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _immutable = __webpack_require__(12);

	var _immutable2 = _interopRequireDefault(_immutable);

	exports['default'] = function (config) {
	  return {
	    value: new _immutable2['default'].List(),
	    operatorOptions: new _immutable2['default'].Map(),
	    valueOptions: new _immutable2['default'].Map()
	  };
	};

	module.exports = exports['default'];

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	exports['default'] = function () {
	  return (
	    // Generate a random GUID http://stackoverflow.com/a/2117523.
	    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	      var r = Math.random() * 16 | 0;
	      var v = c === 'x' ? r : r & 0x3 | 0x8;
	      return v.toString(16);
	    })
	  );
	};

	module.exports = exports['default'];

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(7)
	  , global     = $.g
	  , core       = $.core
	  , isFunction = $.isFunction;
	function ctx(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	}
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	function $def(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , isProto  = type & $def.P
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {}).prototype
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && !isFunction(target[key]))exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp.prototype = C.prototype;
	    }(out);
	    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
	    // export
	    exports[key] = exp;
	    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
	  }
	}
	module.exports = $def;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(87),
	    baseCallback = __webpack_require__(29),
	    baseMap = __webpack_require__(95),
	    isArray = __webpack_require__(9);

	/**
	 * Creates an array of values by running each element in `collection` through
	 * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * If a property name is provided for `iteratee` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `iteratee` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
	 * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
	 * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
	 * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
	 * `sum`, `uniq`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @alias collect
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Array} Returns the new mapped array.
	 * @example
	 *
	 * function timesThree(n) {
	 *   return n * 3;
	 * }
	 *
	 * _.map([1, 2], timesThree);
	 * // => [3, 6]
	 *
	 * _.map({ 'a': 1, 'b': 2 }, timesThree);
	 * // => [3, 6] (iteration order is not guaranteed)
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * // using the `_.property` callback shorthand
	 * _.map(users, 'user');
	 * // => ['barney', 'fred']
	 */
	function map(collection, iteratee, thisArg) {
	  var func = isArray(collection) ? arrayMap : baseMap;
	  iteratee = baseCallback(iteratee, thisArg, 3);
	  return func(collection, iteratee);
	}

	module.exports = map;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(20),
	    isLength = __webpack_require__(10),
	    keys = __webpack_require__(19);

	/**
	 * Gets the size of `collection` by returning its length for array-like
	 * values or the number of own enumerable properties for objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to inspect.
	 * @returns {number} Returns the size of `collection`.
	 * @example
	 *
	 * _.size([1, 2, 3]);
	 * // => 3
	 *
	 * _.size({ 'a': 1, 'b': 2 });
	 * // => 2
	 *
	 * _.size('pebbles');
	 * // => 7
	 */
	function size(collection) {
	  var length = collection ? getLength(collection) : 0;
	  return isLength(length) ? length : keys(collection).length;
	}

	module.exports = size;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(96),
	    baseMatchesProperty = __webpack_require__(97),
	    bindCallback = __webpack_require__(35),
	    identity = __webpack_require__(42),
	    property = __webpack_require__(117);

	/**
	 * The base implementation of `_.callback` which supports specifying the
	 * number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {*} [func=_.identity] The value to convert to a callback.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function baseCallback(func, thisArg, argCount) {
	  var type = typeof func;
	  if (type == 'function') {
	    return thisArg === undefined
	      ? func
	      : bindCallback(func, thisArg, argCount);
	  }
	  if (func == null) {
	    return identity;
	  }
	  if (type == 'object') {
	    return baseMatches(func);
	  }
	  return thisArg === undefined
	    ? property(func)
	    : baseMatchesProperty(func, thisArg);
	}

	module.exports = baseCallback;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(102);

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();

	module.exports = baseFor;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(30),
	    keys = __webpack_require__(19);

	/**
	 * The base implementation of `_.forOwn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return baseFor(object, iteratee, keys);
	}

	module.exports = baseForOwn;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(8);

	/**
	 * The base implementation of `get` without support for string paths
	 * and default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path of the property to get.
	 * @param {string} [pathKey] The key representation of path.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path, pathKey) {
	  if (object == null) {
	    return;
	  }
	  if (pathKey !== undefined && pathKey in toObject(object)) {
	    path = [pathKey];
	  }
	  var index = 0,
	      length = path.length;

	  while (object != null && index < length) {
	    object = object[path[index++]];
	  }
	  return (index && index == length) ? object : undefined;
	}

	module.exports = baseGet;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(93),
	    isObject = __webpack_require__(11),
	    isObjectLike = __webpack_require__(14);

	/**
	 * The base implementation of `_.isEqual` without support for `this` binding
	 * `customizer` functions.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
	}

	module.exports = baseIsEqual;


/***/ },
/* 34 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(42);

	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (thisArg === undefined) {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	    case 5: return function(value, other, key, object, source) {
	      return func.call(thisArg, value, other, key, object, source);
	    };
	  }
	  return function() {
	    return func.apply(thisArg, arguments);
	  };
	}

	module.exports = bindCallback;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(113);

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}

	module.exports = getNative;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(9),
	    toObject = __webpack_require__(8);

	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;

	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  var type = typeof value;
	  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
	    return true;
	  }
	  if (isArray(value)) {
	    return false;
	  }
	  var result = !reIsDeepProp.test(value);
	  return result || (object != null && value in toObject(object));
	}

	module.exports = isKey;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(11);

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}

	module.exports = isStrictComparable;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(100),
	    isArray = __webpack_require__(9);

	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;

	/**
	 * Converts `value` to property path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Array} Returns the property path array.
	 */
	function toPath(value) {
	  if (isArray(value)) {
	    return value;
	  }
	  var result = [];
	  baseToString(value).replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	}

	module.exports = toPath;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(22),
	    isArray = __webpack_require__(9),
	    isIndex = __webpack_require__(21),
	    isLength = __webpack_require__(10),
	    isObject = __webpack_require__(11);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object)) && length) || 0;

	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;

	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = keysIn;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var createObjectMapper = __webpack_require__(103);

	/**
	 * Creates an object with the same keys as `object` and values generated by
	 * running each own enumerable property of `object` through `iteratee`. The
	 * iteratee function is bound to `thisArg` and invoked with three arguments:
	 * (value, key, object).
	 *
	 * If a property name is provided for `iteratee` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `iteratee` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to iterate over.
	 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Object} Returns the new mapped object.
	 * @example
	 *
	 * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
	 *   return n * 3;
	 * });
	 * // => { 'a': 3, 'b': 6 }
	 *
	 * var users = {
	 *   'fred':    { 'user': 'fred',    'age': 40 },
	 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
	 * };
	 *
	 * // using the `_.property` callback shorthand
	 * _.mapValues(users, 'age');
	 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	 */
	var mapValues = createObjectMapper();

	module.exports = mapValues;


/***/ },
/* 42 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ },
/* 43 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = composeMiddleware;

	function composeMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }

	  return middlewares.reduceRight(function (composed, m) {
	    return m(composed);
	  });
	}

	module.exports = exports["default"];

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = composeReducers;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utilsMapValues = __webpack_require__(48);

	var _utilsMapValues2 = _interopRequireDefault(_utilsMapValues);

	var _utilsPick = __webpack_require__(132);

	var _utilsPick2 = _interopRequireDefault(_utilsPick);

	function composeReducers(reducers) {
	  var finalReducers = _utilsPick2['default'](reducers, function (val) {
	    return typeof val === 'function';
	  });

	  return function Composition(atom, action) {
	    if (atom === undefined) atom = {};

	    return _utilsMapValues2['default'](finalReducers, function (store, key) {
	      return store(atom[key], action);
	    });
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 45 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = createStoreShape;

	function createStoreShape(PropTypes) {
	  return PropTypes.shape({
	    subscribe: PropTypes.func.isRequired,
	    dispatch: PropTypes.func.isRequired,
	    getState: PropTypes.func.isRequired
	  });
	}

	module.exports = exports["default"];

/***/ },
/* 46 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = getDisplayName;

	function getDisplayName(Component) {
	  return Component.displayName || Component.name || 'Component';
	}

	module.exports = exports['default'];

/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = isPlainObject;

	function isPlainObject(obj) {
	  return obj ? typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype : false;
	}

	module.exports = exports['default'];

/***/ },
/* 48 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = mapValues;

	function mapValues(obj, fn) {
	  return Object.keys(obj).reduce(function (result, key) {
	    result[key] = fn(obj[key], key);
	    return result;
	  }, {});
	}

	module.exports = exports["default"];

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	var invariant = function(condition, format, a, b, c, d, e, f) {
	  if (false) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error(
	        'Minified exception occurred; use the non-minified dev environment ' +
	        'for the full error message and additional helpful warnings.'
	      );
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(
	        'Invariant Violation: ' +
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(13)['default'];

	exports.__esModule = true;

	var _constants = __webpack_require__(17);

	var constants = _interopRequireWildcard(_constants);

	/**
	 * @param {Immutable.List} path
	 * @param {string} conjunction
	 */
	var setConjunction = function setConjunction(path, conjunction) {
	  return {
	    type: constants.SET_CONJUNCTION,
	    path: path,
	    conjunction: conjunction
	  };
	};
	exports.setConjunction = setConjunction;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(13)['default'];

	exports.__esModule = true;

	var _group2 = __webpack_require__(50);

	var _group = _interopRequireWildcard(_group2);

	exports.group = _group;

	var _rule2 = __webpack_require__(52);

	var _rule = _interopRequireWildcard(_rule2);

	exports.rule = _rule;

	var _tree2 = __webpack_require__(53);

	var _tree = _interopRequireWildcard(_tree2);

	exports.tree = _tree;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(13)['default'];

	exports.__esModule = true;

	var _constants = __webpack_require__(17);

	var constants = _interopRequireWildcard(_constants);

	/**
	 * @param {Immutable.List} path
	 * @param {string} field
	 */
	var setField = function setField(path, field) {
	  return {
	    type: constants.SET_FIELD,
	    path: path,
	    field: field
	  };
	};

	exports.setField = setField;
	/**
	 * @param {Immutable.List} path
	 * @param {string} operator
	 */
	var setOperator = function setOperator(path, operator) {
	  return {
	    type: constants.SET_OPERATOR,
	    path: path,
	    operator: operator
	  };
	};

	exports.setOperator = setOperator;
	/**
	 * @param {Immutable.List} path
	 * @param {integer} delta
	 * @param {*} value
	 */
	var setValue = function setValue(path, delta, value) {
	  return {
	    type: constants.SET_VALUE,
	    path: path,
	    delta: delta,
	    value: value
	  };
	};

	exports.setValue = setValue;
	/**
	 * @param {Immutable.List} path
	 * @param {string} name
	 * @param {*} value
	 */
	var setOperatorOption = function setOperatorOption(path, name, value) {
	  return {
	    type: constants.SET_OPERATOR_OPTION,
	    path: path,
	    name: name,
	    value: value
	  };
	};

	exports.setOperatorOption = setOperatorOption;
	/**
	 * @param {Immutable.List} path
	 * @param {integer} delta
	 * @param {string} name
	 * @param {*} value
	 */
	var setValueOption = function setValueOption(path, delta, name, value) {
	  return {
	    type: constants.SET_VALUE_OPTION,
	    path: path,
	    delta: delta,
	    name: name,
	    value: value
	  };
	};
	exports.setValueOption = setValueOption;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(13)['default'];

	exports.__esModule = true;

	var _constants = __webpack_require__(17);

	var constants = _interopRequireWildcard(_constants);

	/**
	 * @param {Immutable.Map} tree
	 */
	var setTree = function setTree(tree) {
	  return {
	    type: constants.SET_TREE,
	    tree: tree
	  };
	};

	exports.setTree = setTree;
	/**
	 * @param {Immutable.List} path
	 * @param {object} properties
	 */
	var addRule = function addRule(path, properties) {
	  return {
	    type: constants.ADD_RULE,
	    path: path,
	    rule: properties
	  };
	};

	exports.addRule = addRule;
	/**
	 * @param {Immutable.List} path
	 */
	var removeRule = function removeRule(path) {
	  return {
	    type: constants.REMOVE_RULE,
	    path: path
	  };
	};

	exports.removeRule = removeRule;
	/**
	 * @param {Immutable.List} path
	 * @param {object} properties
	 */
	var addGroup = function addGroup(path, properties) {
	  return {
	    type: constants.ADD_GROUP,
	    path: path,
	    group: properties
	  };
	};

	exports.addGroup = addGroup;
	/**
	 * @param {Immutable.List} path
	 */
	var removeGroup = function removeGroup(path) {
	  return {
	    type: constants.REMOVE_GROUP,
	    path: path
	  };
	};
	exports.removeGroup = removeGroup;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(12);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _componentsItem = __webpack_require__(57);

	var _componentsItem2 = _interopRequireDefault(_componentsItem);

	var Builder = (function (_Component) {
	  function Builder() {
	    _classCallCheck(this, Builder);

	    _Component.apply(this, arguments);
	  }

	  _inherits(Builder, _Component);

	  Builder.prototype.render = function render() {
	    var id = this.props.tree.get('id');

	    return _react2['default'].createElement(
	      _componentsItem2['default'],
	      { key: id,
	        id: id,
	        path: _immutable2['default'].List.of(id),
	        type: this.props.tree.get('type'),
	        properties: this.props.tree.get('properties'),
	        config: this.props.config,
	        actions: this.props.actions },
	      this.props.tree.get('children')
	    );
	  };

	  _createClass(Builder, null, [{
	    key: 'propTypes',
	    value: {
	      tree: _react.PropTypes.instanceOf(_immutable2['default'].Map).isRequired,
	      config: _react.PropTypes.object.isRequired
	    },
	    enumerable: true
	  }]);

	  return Builder;
	})(_react.Component);

	exports['default'] = Builder;
	module.exports = exports['default'];

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var Delta = (function (_Component) {
	  function Delta() {
	    _classCallCheck(this, Delta);

	    _Component.apply(this, arguments);

	    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	  }

	  _inherits(Delta, _Component);

	  Delta.prototype.render = function render() {
	    return _react2['default'].createElement(
	      'div',
	      { className: 'widget--delta widget--delta-' + this.props.delta },
	      [_react2['default'].createElement(
	        'div',
	        { key: 'widget', className: 'widget--widget' },
	        this.props.children[0]
	      ), this.props.children[1] ? _react2['default'].createElement(
	        'div',
	        { key: 'options', className: 'widget--options' },
	        this.props.children[1]
	      ) : null]
	    );
	  };

	  _createClass(Delta, null, [{
	    key: 'propTypes',
	    value: {
	      children: _react.PropTypes.arrayOf(_react.PropTypes.element).isRequired,
	      delta: _react.PropTypes.number.isRequired
	    },
	    enumerable: true
	  }]);

	  return Delta;
	})(_react.Component);

	exports['default'] = Delta;
	module.exports = exports['default'];

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _lodashCollectionMap = __webpack_require__(27);

	var _lodashCollectionMap2 = _interopRequireDefault(_lodashCollectionMap);

	var _containersGroupContainer = __webpack_require__(63);

	var _containersGroupContainer2 = _interopRequireDefault(_containersGroupContainer);

	var Group = (function (_Component) {
	  function Group() {
	    _classCallCheck(this, _Group);

	    _Component.apply(this, arguments);

	    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	  }

	  _inherits(Group, _Component);

	  var _Group = Group;

	  _Group.prototype.render = function render() {
	    return _react2['default'].createElement(
	      'div',
	      { className: 'group' },
	      _react2['default'].createElement(
	        'div',
	        { className: 'group--header' },
	        _react2['default'].createElement(
	          'div',
	          { className: 'group--conjunctions' },
	          _lodashCollectionMap2['default'](this.props.conjunctionOptions, function (item, index) {
	            return _react2['default'].createElement(
	              'div',
	              { key: index, className: 'conjunction conjunction--' + index.toUpperCase(), 'data-state': item.checked ? 'active' : 'inactive' },
	              _react2['default'].createElement(
	                'label',
	                { htmlFor: item.id },
	                item.label
	              ),
	              _react2['default'].createElement('input', { id: item.id, type: 'radio', name: item.name, value: index, checked: item.checked, onChange: item.setConjunction })
	            );
	          })
	        ),
	        _react2['default'].createElement(
	          'div',
	          { className: 'group--actions' },
	          this.props.allowFurtherNesting ? _react2['default'].createElement(
	            'button',
	            { className: 'action action--ADD-GROUP', onClick: this.props.addGroup },
	            'Add group'
	          ) : null,
	          _react2['default'].createElement(
	            'button',
	            { className: 'action action--ADD-RULE', onClick: this.props.addRule },
	            'Add rule'
	          ),
	          this.props.allowRemoval ? _react2['default'].createElement(
	            'button',
	            { className: 'action action--DELETE', onClick: this.props.removeSelf },
	            'Delete'
	          ) : null
	        )
	      ),
	      this.props.children ? _react2['default'].createElement(
	        'div',
	        { className: 'group--children' },
	        this.props.children
	      ) : null
	    );
	  };

	  _createClass(_Group, null, [{
	    key: 'propTypes',
	    value: {
	      conjunctionOptions: _react.PropTypes.object.isRequired,
	      addRule: _react.PropTypes.func.isRequired,
	      addGroup: _react.PropTypes.func.isRequired,
	      removeSelf: _react.PropTypes.func.isRequired,
	      allowFurtherNesting: _react.PropTypes.bool.isRequired,
	      allowRemoval: _react.PropTypes.bool.isRequired
	    },
	    enumerable: true
	  }]);

	  Group = _containersGroupContainer2['default'](Group) || Group;
	  return Group;
	})(_react.Component);

	exports['default'] = Group;
	module.exports = exports['default'];

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _extends = __webpack_require__(73)['default'];

	var _objectWithoutProperties = __webpack_require__(18)['default'];

	var _Object$keys = __webpack_require__(72)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(12);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _Rule = __webpack_require__(61);

	var _Rule2 = _interopRequireDefault(_Rule);

	var _Group = __webpack_require__(56);

	var _Group2 = _interopRequireDefault(_Group);

	var typeMap = {
	  rule: function rule(props) {
	    return _react2['default'].createElement(_Rule2['default'], _extends({}, props.properties.toObject(), {
	      id: props.id,
	      path: props.path,
	      actions: props.actions,
	      config: props.config }));
	  },
	  group: function group(props) {
	    return _react2['default'].createElement(
	      _Group2['default'],
	      _extends({}, props.properties.toObject(), {
	        id: props.id,
	        path: props.path,
	        actions: props.actions,
	        config: props.config }),
	      props.children ? props.children.map(function (item) {
	        return _react2['default'].createElement(
	          Item,
	          {
	            key: item.get('id'),
	            id: item.get('id'),
	            path: props.path.push(item.get('id')),
	            type: item.get('type'),
	            properties: item.get('properties'),
	            config: props.config,
	            actions: props.actions },
	          item.get('children')
	        );
	      }).toList() : null
	    );
	  }
	};

	var Item = (function (_Component) {
	  function Item() {
	    _classCallCheck(this, Item);

	    _Component.apply(this, arguments);

	    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	  }

	  _inherits(Item, _Component);

	  Item.prototype.render = function render() {
	    var _props = this.props;
	    var type = _props.type;

	    var props = _objectWithoutProperties(_props, ['type']);

	    return typeMap[type](props);
	  };

	  _createClass(Item, null, [{
	    key: 'propTypes',
	    value: {
	      config: _react.PropTypes.object.isRequired,
	      id: _react.PropTypes.string.isRequired,
	      type: _react.PropTypes.oneOf(_Object$keys(typeMap)).isRequired,
	      path: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
	      properties: _react.PropTypes.instanceOf(_immutable2['default'].Map).isRequired,
	      children: _react.PropTypes.instanceOf(_immutable2['default'].OrderedMap)
	    },
	    enumerable: true
	  }]);

	  return Item;
	})(_react.Component);

	exports['default'] = Item;
	module.exports = exports['default'];

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _containersOperatorContainer = __webpack_require__(64);

	var _containersOperatorContainer2 = _interopRequireDefault(_containersOperatorContainer);

	var Operator = (function (_Component) {
	  function Operator() {
	    _classCallCheck(this, _Operator);

	    _Component.apply(this, arguments);

	    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	  }

	  _inherits(Operator, _Component);

	  var _Operator = Operator;

	  _Operator.prototype.render = function render() {
	    return _react2['default'].createElement(
	      'div',
	      { className: 'rule--operator rule--operator--' + this.props.name.toUpperCase() },
	      this.props.children
	    );
	  };

	  _createClass(_Operator, null, [{
	    key: 'propTypes',
	    value: {
	      name: _react.PropTypes.string.isRequired,
	      children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.element])
	    },
	    enumerable: true
	  }]);

	  Operator = _containersOperatorContainer2['default'](Operator) || Operator;
	  return Operator;
	})(_react.Component);

	exports['default'] = Operator;
	module.exports = exports['default'];

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _utilsQueryString = __webpack_require__(69);

	var _utilsQueryString2 = _interopRequireDefault(_utilsQueryString);

	var Preview = (function (_Component) {
	  function Preview() {
	    _classCallCheck(this, Preview);

	    _Component.apply(this, arguments);

	    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	  }

	  _inherits(Preview, _Component);

	  Preview.prototype.render = function render() {
	    return this.props.children(_utilsQueryString2['default'](this.props.tree, this.props.config));
	  };

	  _createClass(Preview, null, [{
	    key: 'propTypes',
	    value: {
	      config: _react.PropTypes.object.isRequired
	    },
	    enumerable: true
	  }]);

	  return Preview;
	})(_react.Component);

	exports['default'] = Preview;
	module.exports = exports['default'];

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _objectWithoutProperties = __webpack_require__(18)['default'];

	var _Object$assign = __webpack_require__(15)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	var _interopRequireWildcard = __webpack_require__(13)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _storesTree = __webpack_require__(67);

	var _storesTree2 = _interopRequireDefault(_storesTree);

	var _redux = __webpack_require__(127);

	var _reduxReact = __webpack_require__(135);

	var _actions = __webpack_require__(51);

	var actions = _interopRequireWildcard(_actions);

	var Query = (function (_Component) {
	  function Query(props, context) {
	    _classCallCheck(this, Query);

	    _Component.call(this, props, context);

	    var config = {
	      conjunctions: props.conjunctions,
	      fields: props.fields,
	      operators: props.operators,
	      widgets: props.widgets,
	      settings: props.settings
	    };

	    var tree = _storesTree2['default'](config);

	    this.state = {
	      store: _redux.createStore({ tree: tree })
	    };
	  }

	  _inherits(Query, _Component);

	  Query.prototype.render = function render() {
	    var _props = this.props;
	    var conjunctions = _props.conjunctions;
	    var fields = _props.fields;
	    var operators = _props.operators;
	    var widgets = _props.widgets;
	    var settings = _props.settings;
	    var children = _props.children;

	    var props = _objectWithoutProperties(_props, ['conjunctions', 'fields', 'operators', 'widgets', 'settings', 'children']);

	    return _react2['default'].createElement(
	      _reduxReact.Provider,
	      { store: this.state.store },
	      function () {
	        return _react2['default'].createElement(
	          _reduxReact.Connector,
	          { select: function (_ref) {
	              var tree = _ref.tree;
	              return { tree: tree };
	            } },
	          function (_ref2) {
	            var tree = _ref2.tree;
	            var dispatch = _ref2.dispatch;

	            return children({
	              tree: tree,
	              actions: _redux.bindActionCreators(_Object$assign({}, actions.tree, actions.group, actions.rule), dispatch),
	              config: { conjunctions: conjunctions, fields: fields, operators: operators, widgets: widgets, settings: settings }
	            });
	          }
	        );
	      }
	    );
	  };

	  return Query;
	})(_react.Component);

	exports['default'] = Query;
	module.exports = exports['default'];

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _lodashCollectionMap = __webpack_require__(27);

	var _lodashCollectionMap2 = _interopRequireDefault(_lodashCollectionMap);

	var _lodashCollectionSize = __webpack_require__(28);

	var _lodashCollectionSize2 = _interopRequireDefault(_lodashCollectionSize);

	var _containersRuleContainer = __webpack_require__(65);

	var _containersRuleContainer2 = _interopRequireDefault(_containersRuleContainer);

	var Rule = (function (_Component) {
	  function Rule() {
	    _classCallCheck(this, _Rule);

	    _Component.apply(this, arguments);

	    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	  }

	  _inherits(Rule, _Component);

	  var _Rule = Rule;

	  _Rule.prototype.handleFieldSelect = function handleFieldSelect() {
	    var node = _react2['default'].findDOMNode(this.refs.field);
	    this.props.setField(node.value);
	  };

	  _Rule.prototype.handleOperatorSelect = function handleOperatorSelect() {
	    var node = _react2['default'].findDOMNode(this.refs.operator);
	    this.props.setOperator(node.value);
	  };

	  _Rule.prototype.render = function render() {
	    return _react2['default'].createElement(
	      'div',
	      { className: 'rule' },
	      _react2['default'].createElement(
	        'div',
	        { className: 'rule--header' },
	        _react2['default'].createElement(
	          'div',
	          { className: 'rule--actions' },
	          _react2['default'].createElement(
	            'button',
	            { className: 'action action--DELETE', onClick: this.props.removeSelf },
	            'Delete'
	          )
	        )
	      ),
	      _react2['default'].createElement(
	        'div',
	        { className: 'rule--body' },
	        _lodashCollectionSize2['default'](this.props.fieldOptions) ? _react2['default'].createElement(
	          'div',
	          { key: 'field', className: 'rule--field' },
	          _react2['default'].createElement(
	            'label',
	            null,
	            'Field'
	          ),
	          _react2['default'].createElement(
	            'select',
	            { ref: 'field', value: this.props.selectedField, onChange: this.handleFieldSelect.bind(this) },
	            _lodashCollectionMap2['default'](this.props.fieldOptions, function (label, value) {
	              return _react2['default'].createElement(
	                'option',
	                { key: value, value: value },
	                label
	              );
	            })
	          )
	        ) : null,
	        _lodashCollectionSize2['default'](this.props.operatorOptions) ? _react2['default'].createElement(
	          'div',
	          { key: 'operator', className: 'rule--operator' },
	          _react2['default'].createElement(
	            'label',
	            null,
	            'Operator'
	          ),
	          _react2['default'].createElement(
	            'select',
	            { ref: 'operator', value: this.props.selectedOperator, onChange: this.handleOperatorSelect.bind(this) },
	            _lodashCollectionMap2['default'](this.props.operatorOptions, function (label, value) {
	              return _react2['default'].createElement(
	                'option',
	                { key: value, value: value },
	                label
	              );
	            })
	          )
	        ) : null,
	        this.props.children
	      )
	    );
	  };

	  _createClass(_Rule, null, [{
	    key: 'propTypes',
	    value: {
	      fieldOptions: _react.PropTypes.object.isRequired,
	      operatorOptions: _react.PropTypes.object.isRequired,
	      setField: _react.PropTypes.func.isRequired,
	      setOperator: _react.PropTypes.func.isRequired,
	      removeSelf: _react.PropTypes.func.isRequired,
	      selectedField: _react.PropTypes.string,
	      selectedOperator: _react.PropTypes.string
	    },
	    enumerable: true
	  }]);

	  Rule = _containersRuleContainer2['default'](Rule) || Rule;
	  return Rule;
	})(_react.Component);

	exports['default'] = Rule;
	module.exports = exports['default'];

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _containersWidgetContainer = __webpack_require__(66);

	var _containersWidgetContainer2 = _interopRequireDefault(_containersWidgetContainer);

	var Widget = (function (_Component) {
	  function Widget() {
	    _classCallCheck(this, _Widget);

	    _Component.apply(this, arguments);

	    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	  }

	  _inherits(Widget, _Component);

	  var _Widget = Widget;

	  _Widget.prototype.render = function render() {
	    return _react2['default'].createElement(
	      'div',
	      { className: 'rule--widget rule--widget--' + this.props.name.toUpperCase() },
	      this.props.children
	    );
	  };

	  _createClass(_Widget, null, [{
	    key: 'propTypes',
	    value: {
	      name: _react.PropTypes.string.isRequired,
	      children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.element])
	    },
	    enumerable: true
	  }]);

	  Widget = _containersWidgetContainer2['default'](Widget) || Widget;
	  return Widget;
	})(_react.Component);

	exports['default'] = Widget;
	module.exports = exports['default'];

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _lodashObjectMapValues = __webpack_require__(41);

	var _lodashObjectMapValues2 = _interopRequireDefault(_lodashObjectMapValues);

	var _utilsDefaultRuleProperties = __webpack_require__(24);

	var _utilsDefaultRuleProperties2 = _interopRequireDefault(_utilsDefaultRuleProperties);

	var _utilsDefaultGroupProperties = __webpack_require__(23);

	var _utilsDefaultGroupProperties2 = _interopRequireDefault(_utilsDefaultGroupProperties);

	exports['default'] = function (Group) {
	  return (function (_Component) {
	    function GroupContainer() {
	      _classCallCheck(this, GroupContainer);

	      _Component.apply(this, arguments);

	      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	    }

	    _inherits(GroupContainer, _Component);

	    GroupContainer.prototype.setConjunction = function setConjunction(conjunction) {
	      this.props.actions.setConjunction(this.props.path, conjunction);
	    };

	    GroupContainer.prototype.removeSelf = function removeSelf() {
	      this.props.actions.removeGroup(this.props.path);
	    };

	    GroupContainer.prototype.addGroup = function addGroup() {
	      this.props.actions.addGroup(this.props.path, _utilsDefaultGroupProperties2['default'](this.props.config));
	    };

	    GroupContainer.prototype.addRule = function addRule() {
	      this.props.actions.addRule(this.props.path, _utilsDefaultRuleProperties2['default'](this.props.config));
	    };

	    GroupContainer.prototype.render = function render() {
	      var _this = this;

	      var currentNesting = this.props.path.size;
	      var maxNesting = this.props.config.settings.maxNesting;

	      // Don't allow nesting further than the maximum configured depth and don't
	      // allow removal of the root group.
	      var allowFurtherNesting = typeof maxNesting === 'undefined' || currentNesting < maxNesting;
	      var allowRemoval = currentNesting > 1;

	      var conjunctionOptions = _lodashObjectMapValues2['default'](this.props.config.conjunctions, function (item, index) {
	        return {
	          id: 'conjunction-' + _this.props.id + '-' + index,
	          name: 'conjunction[' + _this.props.id + ']',
	          label: item.label,
	          checked: index === _this.props.conjunction,
	          setConjunction: function setConjunction() {
	            return _this.setConjunction.call(_this, index);
	          }
	        };
	      }, this);

	      return _react2['default'].createElement(
	        Group,
	        {
	          id: this.props.id,
	          allowRemoval: allowRemoval,
	          allowFurtherNesting: allowFurtherNesting,
	          conjunctionOptions: conjunctionOptions,
	          removeSelf: this.removeSelf.bind(this),
	          addGroup: this.addGroup.bind(this),
	          addRule: this.addRule.bind(this) },
	        this.props.children
	      );
	    };

	    _createClass(GroupContainer, null, [{
	      key: 'propTypes',
	      value: {
	        config: _react.PropTypes.object.isRequired
	      },
	      enumerable: true
	    }]);

	    return GroupContainer;
	  })(_react.Component);
	};

	module.exports = exports['default'];

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _objectWithoutProperties = __webpack_require__(18)['default'];

	var _Object$assign = __webpack_require__(15)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(12);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	exports['default'] = function (Operator) {
	  return (function (_Component) {
	    function OperatorContainer() {
	      _classCallCheck(this, OperatorContainer);

	      _Component.apply(this, arguments);

	      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	    }

	    _inherits(OperatorContainer, _Component);

	    OperatorContainer.prototype.setOperatorOption = function setOperatorOption(name, value) {
	      this.props.actions.setOperatorOption(this.props.path, name, value);
	    };

	    OperatorContainer.prototype.render = function render() {
	      var _this = this;

	      var operatorDefinitions = this.props.config.operators[this.props.operator];
	      if (typeof operatorDefinitions.options === 'undefined') {
	        return null;
	      }

	      var _operatorDefinitions$options = operatorDefinitions.options;
	      var optionsFactory = _operatorDefinitions$options.factory;

	      var optionsProps = _objectWithoutProperties(_operatorDefinitions$options, ['factory']);

	      return _react2['default'].createElement(
	        Operator,
	        { name: this.props.operator },
	        optionsFactory(_Object$assign({}, optionsProps, {
	          config: this.props.config,
	          field: this.props.field,
	          operator: this.props.operator,
	          options: this.props.options,
	          setOption: function setOption(name, value) {
	            return _this.setOperatorOption.call(_this, name, value);
	          }
	        }))
	      );
	    };

	    _createClass(OperatorContainer, null, [{
	      key: 'propTypes',
	      value: {
	        config: _react.PropTypes.object.isRequired,
	        path: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
	        value: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
	        field: _react.PropTypes.string.isRequired,
	        operator: _react.PropTypes.string.isRequired
	      },
	      enumerable: true
	    }]);

	    return OperatorContainer;
	  })(_react.Component);
	};

	module.exports = exports['default'];

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _Object$assign = __webpack_require__(15)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _lodashCollectionSize = __webpack_require__(28);

	var _lodashCollectionSize2 = _interopRequireDefault(_lodashCollectionSize);

	var _lodashObjectMapValues = __webpack_require__(41);

	var _lodashObjectMapValues2 = _interopRequireDefault(_lodashObjectMapValues);

	var _lodashObjectPick = __webpack_require__(116);

	var _lodashObjectPick2 = _interopRequireDefault(_lodashObjectPick);

	var _Widget = __webpack_require__(62);

	var _Widget2 = _interopRequireDefault(_Widget);

	var _Operator = __webpack_require__(58);

	var _Operator2 = _interopRequireDefault(_Operator);

	exports['default'] = function (Rule) {
	  return (function (_Component) {
	    function RuleContainer() {
	      _classCallCheck(this, RuleContainer);

	      _Component.apply(this, arguments);

	      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	    }

	    _inherits(RuleContainer, _Component);

	    RuleContainer.prototype.removeSelf = function removeSelf() {
	      this.props.actions.removeRule(this.props.path);
	    };

	    RuleContainer.prototype.setField = function setField(field) {
	      this.props.actions.setField(this.props.path, field);
	    };

	    RuleContainer.prototype.setOperator = function setOperator(operator) {
	      this.props.actions.setOperator(this.props.path, operator);
	    };

	    RuleContainer.prototype.render = function render() {
	      var _this = this;

	      var _props$config = this.props.config;
	      var fields = _props$config.fields;
	      var operators = _props$config.operators;

	      var fieldOptions = _lodashObjectMapValues2['default'](fields, function (item) {
	        return item.label;
	      });

	      // Add a special 'empty' option if no field has been selected yet.
	      if (_lodashCollectionSize2['default'](fieldOptions) && typeof this.props.field === 'undefined') {
	        fieldOptions = _Object$assign({}, { ':empty:': 'Select a field' }, fieldOptions);
	      }

	      var operatorOptions = _lodashObjectMapValues2['default'](_lodashObjectPick2['default'](operators, function (item, index) {
	        return _this.props.field && fields[_this.props.field] && fields[_this.props.field].operators.indexOf(index) !== -1;
	      }), function (item) {
	        return item.label;
	      });

	      // Add a special 'empty' option if no operator has been selected yet.
	      if (_lodashCollectionSize2['default'](operatorOptions) && typeof this.props.operator === 'undefined') {
	        operatorOptions = _Object$assign({}, { ':empty:': 'Select an operator' }, operatorOptions);
	      }

	      return _react2['default'].createElement(
	        Rule,
	        {
	          id: this.props.id,
	          removeSelf: this.removeSelf.bind(this),
	          setField: this.setField.bind(this),
	          setOperator: this.setOperator.bind(this),
	          selectedField: this.props.field || ':empty:',
	          selectedOperator: this.props.operator || ':empty:',
	          fieldOptions: fieldOptions,
	          operatorOptions: operatorOptions },
	        typeof this.props.field !== 'undefined' && typeof this.props.operator !== 'undefined' ? [_react2['default'].createElement(_Operator2['default'], {
	          key: 'options',
	          path: this.props.path,
	          field: this.props.field,
	          options: this.props.operatorOptions,
	          operator: this.props.operator,
	          actions: this.props.actions,
	          config: this.props.config }), _react2['default'].createElement(_Widget2['default'], {
	          key: 'values',
	          path: this.props.path,
	          field: this.props.field,
	          value: this.props.value,
	          options: this.props.valueOptions,
	          operator: this.props.operator,
	          actions: this.props.actions,
	          config: this.props.config })] : null
	      );
	    };

	    _createClass(RuleContainer, null, [{
	      key: 'propTypes',
	      value: {
	        config: _react.PropTypes.object.isRequired,
	        operator: _react.PropTypes.string,
	        field: _react.PropTypes.string
	      },
	      enumerable: true
	    }]);

	    return RuleContainer;
	  })(_react.Component);
	};

	module.exports = exports['default'];

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _inherits = __webpack_require__(4)['default'];

	var _createClass = __webpack_require__(5)['default'];

	var _classCallCheck = __webpack_require__(3)['default'];

	var _objectWithoutProperties = __webpack_require__(18)['default'];

	var _Object$assign = __webpack_require__(15)['default'];

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(12);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _reactPureRenderFunction = __webpack_require__(6);

	var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

	var _lodashUtilityRange = __webpack_require__(118);

	var _lodashUtilityRange2 = _interopRequireDefault(_lodashUtilityRange);

	var _Delta = __webpack_require__(55);

	var _Delta2 = _interopRequireDefault(_Delta);

	exports['default'] = function (Widget) {
	  return (function (_Component) {
	    function WidgetContainer() {
	      _classCallCheck(this, WidgetContainer);

	      _Component.apply(this, arguments);

	      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
	    }

	    _inherits(WidgetContainer, _Component);

	    WidgetContainer.prototype.setValue = function setValue(delta, value) {
	      this.props.actions.setValue(this.props.path, delta, value, this.props.config);
	    };

	    WidgetContainer.prototype.setValueOption = function setValueOption(delta, name, value) {
	      this.props.actions.setValueOption(this.props.path, delta, name, value, this.props.config);
	    };

	    WidgetContainer.prototype.renderOptions = function renderOptions(delta) {
	      var _this = this;

	      var operatorDefinitions = this.props.config.operators[this.props.operator];
	      if (typeof operatorDefinitions.valueOptions === 'undefined') {
	        return null;
	      }

	      var _operatorDefinitions$valueOptions = operatorDefinitions.valueOptions;
	      var optionsFactory = _operatorDefinitions$valueOptions.factory;

	      var optionsProps = _objectWithoutProperties(_operatorDefinitions$valueOptions, ['factory']);

	      return optionsFactory(_Object$assign({}, optionsProps, {
	        config: this.props.config,
	        field: this.props.field,
	        operator: this.props.operator,
	        delta: delta,
	        options: this.props.options.get(delta + '', new _immutable2['default'].Map()),
	        setOption: function setOption(name, value) {
	          return _this.setValueOption.call(_this, delta, name, value);
	        }
	      }));
	    };

	    WidgetContainer.prototype.renderWidget = function renderWidget(delta) {
	      var _this2 = this;

	      var fieldDefinition = this.props.config.fields[this.props.field];
	      var _props$config$widgets$fieldDefinition$widget = this.props.config.widgets[fieldDefinition.widget];
	      var widgetFactory = _props$config$widgets$fieldDefinition$widget.factory;

	      var widgetProps = _objectWithoutProperties(_props$config$widgets$fieldDefinition$widget, ['factory']);

	      return widgetFactory(_Object$assign({}, widgetProps, {
	        config: this.props.config,
	        field: this.props.field,
	        operator: this.props.operator,
	        delta: delta,
	        value: this.props.value.get(delta),
	        setValue: function setValue(value) {
	          return _this2.setValue.call(_this2, delta, value);
	        }
	      }));
	    };

	    WidgetContainer.prototype.render = function render() {
	      var _this3 = this;

	      var cardinality = this.props.config.operators[this.props.operator].cardinality || 1;
	      if (cardinality === 0) {
	        return null;
	      }

	      var fieldDefinition = this.props.config.fields[this.props.field];
	      var widgetBehavior = this.props.config.widgets[fieldDefinition.widget].behavior;
	      var _props$config$operators$props$operator = this.props.config.operators[this.props.operator];
	      var optionsFactory = _props$config$operators$props$operator.factory;

	      var operatorDefinition = _objectWithoutProperties(_props$config$operators$props$operator, ['factory']);

	      if (typeof widgetBehavior === 'undefined') {
	        return _react2['default'].createElement(
	          Widget,
	          { name: fieldDefinition.widget },
	          _lodashUtilityRange2['default'](0, cardinality).map(function (delta) {
	            return _react2['default'].createElement(
	              _Delta2['default'],
	              { key: delta, delta: delta },
	              _this3.renderWidget.call(_this3, delta),
	              _this3.renderOptions.call(_this3, delta)
	            );
	          })
	        );
	      }

	      // @todo Implement custom widget behavior rendering.
	      // const widget = widgetFactory({
	      //   definition: widgetDefinition,
	      //   config: this.props.config,
	      //   field: this.props.field,
	      //   cardinality: cardinality,
	      //   value: this.props.value,
	      //   setValue: this.setValue.bind(this)
	      // }, delta => this.props.operator.valueOptions ? this.props.operator.valueOptions.factory({
	      //   definition: this.props.operator,
	      //   config: this.props.config,
	      //   field: this.props.field,
	      //   delta: delta,
	      //   options: this.props.valueOptions.get(delta),
	      //   setOption: (name, value) => this.setValueOption.call(this, delta, name, value)
	      // }) : null);

	      return null;
	    };

	    _createClass(WidgetContainer, null, [{
	      key: 'propTypes',
	      value: {
	        config: _react.PropTypes.object.isRequired,
	        path: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
	        value: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
	        field: _react.PropTypes.string.isRequired,
	        operator: _react.PropTypes.string.isRequired
	      },
	      enumerable: true
	    }]);

	    return WidgetContainer;
	  })(_react.Component);
	};

	module.exports = exports['default'];

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	var _interopRequireWildcard = __webpack_require__(13)['default'];

	exports.__esModule = true;

	var _immutable = __webpack_require__(12);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _utilsDefaultRoot = __webpack_require__(68);

	var _utilsDefaultRoot2 = _interopRequireDefault(_utilsDefaultRoot);

	var _utilsUuid = __webpack_require__(25);

	var _utilsUuid2 = _interopRequireDefault(_utilsUuid);

	var _constants = __webpack_require__(17);

	var constants = _interopRequireWildcard(_constants);

	/**
	 * @param {Immutable.List} path
	 * @param {...string} suffix
	 */
	var expandTreePath = function expandTreePath(path) {
	  for (var _len = arguments.length, suffix = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    suffix[_key - 1] = arguments[_key];
	  }

	  return path.interpose('children').withMutations(function (list) {
	    list.skip(1);
	    list.push.apply(list, suffix);
	    return list;
	  });
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} conjunction
	 */
	var setConjunction = function setConjunction(state, path, conjunction) {
	  return state.setIn(expandTreePath(path, 'properties', 'conjunction'), conjunction);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {Immutable.Map} item
	 */
	var addItem = function addItem(state, path, item) {
	  var _ref;

	  return state.mergeIn(expandTreePath(path, 'children'), new _immutable2['default'].OrderedMap((_ref = {}, _ref[item.get('id')] = item, _ref)));
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 */
	var removeItem = function removeItem(state, path) {
	  return state.deleteIn(expandTreePath(path));
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} field
	 */
	var setField = function setField(state, path, field) {
	  return state.withMutations(function (map) {
	    var expandedPath = expandTreePath(path, 'properties');
	    return map.deleteIn(expandedPath.push('operator')).setIn(expandedPath.push('field'), field).setIn(expandedPath.push('options'), new _immutable2['default'].Map()).setIn(expandedPath.push('value'), new _immutable2['default'].List());
	  });
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} operator
	 */
	var setOperator = function setOperator(state, path, operator) {
	  return state.withMutations(function (map) {
	    return map.setIn(expandTreePath(path, 'properties').push('operator'), operator);
	  });
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {integer} delta
	 * @param {*} value
	 */
	var setValue = function setValue(state, path, delta, value) {
	  return state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), value);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} name
	 * @param {*} value
	 */
	var setOperatorOption = function setOperatorOption(state, path, name, value) {
	  return state.setIn(expandTreePath(path, 'properties', 'operatorOptions', name), value);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} name
	 * @param {*} value
	 */
	var setValueOption = function setValueOption(state, path, delta, name, value) {
	  return state.setIn(expandTreePath(path, 'properties', 'valueOptions', delta + '', name), value);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {object} action
	 */

	exports['default'] = function (config) {
	  return function (state, action) {
	    if (state === undefined) state = _utilsDefaultRoot2['default'](config);

	    switch (action.type) {
	      case constants.SET_TREE:
	        return action.tree;

	      case constants.ADD_GROUP:
	        return addItem(state, action.path, new _immutable2['default'].Map({
	          type: 'group',
	          id: _utilsUuid2['default'](),
	          properties: new _immutable2['default'].Map(action.group)
	        }));

	      case constants.REMOVE_GROUP:
	        return removeItem(state, action.path);

	      case constants.ADD_RULE:
	        return addItem(state, action.path, new _immutable2['default'].Map({
	          type: 'rule',
	          id: _utilsUuid2['default'](),
	          properties: new _immutable2['default'].Map(action.rule)
	        }));

	      case constants.REMOVE_RULE:
	        return removeItem(state, action.path);

	      case constants.SET_CONJUNCTION:
	        return setConjunction(state, action.path, action.conjunction);

	      case constants.SET_FIELD:
	        return setField(state, action.path, action.field);

	      case constants.SET_OPERATOR:
	        return setOperator(state, action.path, action.operator);

	      case constants.SET_VALUE:
	        return setValue(state, action.path, action.delta, action.value);

	      case constants.SET_OPERATOR_OPTION:
	        return setOperatorOption(state, action.path, action.name, action.value);

	      case constants.SET_VALUE_OPTION:
	        return setValueOption(state, action.path, action.delta, action.name, action.value);

	      default:
	        return state;
	    }
	  };
	};

	module.exports = exports['default'];

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(1)['default'];

	exports.__esModule = true;

	var _immutable = __webpack_require__(12);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _uuid = __webpack_require__(25);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _defaultRuleProperties = __webpack_require__(24);

	var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

	var _defaultGroupProperties = __webpack_require__(23);

	var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

	var getChild = function getChild(id, config) {
	  var _ref;

	  return (_ref = {}, _ref[id] = new _immutable2['default'].Map({
	    type: 'rule',
	    id: id,
	    properties: new _immutable2['default'].Map(_defaultRuleProperties2['default'](config))
	  }), _ref);
	};

	exports['default'] = function (config) {
	  return new _immutable2['default'].Map({
	    type: 'group',
	    id: _uuid2['default'](),
	    children: new _immutable2['default'].OrderedMap(getChild(_uuid2['default'](), config)),
	    properties: new _immutable2['default'].Map(_defaultGroupProperties2['default'](config))
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 69 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	var queryStringRecursive = function queryStringRecursive(item, config) {
	  var type = item.get('type');
	  var properties = item.get('properties');
	  var children = item.get('children');

	  if (type === 'rule') {
	    var _ret = (function () {
	      if (!properties.has('field') || !properties.has('operator')) {
	        return {
	          v: undefined
	        };
	      }

	      var field = properties.get('field');
	      var operator = properties.get('operator');

	      var fieldDefinition = config.fields[field];
	      var operatorDefinition = config.operators[operator];

	      var options = properties.get('operatorOptions');
	      var valueOptions = properties.get('valueOptions');
	      var cardinality = operatorDefinition.cardinality || 1;
	      var widget = config.widgets[fieldDefinition.widget];
	      var value = properties.get('value').map(function (currentValue) {
	        return widget.value(currentValue, config);
	      });

	      if (value.size < cardinality) {
	        return {
	          v: undefined
	        };
	      }

	      return {
	        v: operatorDefinition.value(value, field, options, valueOptions, operator, config)
	      };
	    })();

	    if (typeof _ret === 'object') return _ret.v;
	  }

	  if (type === 'group' && children && children.size) {
	    var value = children.map(function (currentChild) {
	      return queryStringRecursive(currentChild, config);
	    }).filter(function (currentChild) {
	      return typeof currentChild !== 'undefined';
	    });

	    if (!value.size) {
	      return undefined;
	    }

	    var conjunction = properties.get('conjunction');
	    var conjunctionDefinition = config.conjunctions[conjunction];
	    return conjunctionDefinition.value(value, conjunction);
	  }

	  return undefined;
	};

	exports['default'] = queryStringRecursive;
	module.exports = exports['default'];

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(76), __esModule: true };

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(77), __esModule: true };

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(78), __esModule: true };

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _Object$assign = __webpack_require__(15)["default"];

	exports["default"] = _Object$assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	exports.__esModule = true;

/***/ },
/* 74 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj["default"] : obj;
	};

	exports.__esModule = true;

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(83);
	module.exports = __webpack_require__(7).core.Object.assign;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	module.exports = function create(P, D){
	  return $.create(P, D);
	};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(84);
	module.exports = __webpack_require__(7).core.Object.keys;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(7)
	  , enumKeys = __webpack_require__(80);
	// 19.1.2.1 Object.assign(target, source, ...)
	/* eslint-disable no-unused-vars */
	module.exports = Object.assign || function assign(target, source){
	/* eslint-enable no-unused-vars */
	  var T = Object($.assertDefined(target))
	    , l = arguments.length
	    , i = 1;
	  while(l > i){
	    var S      = $.ES5Object(arguments[i++])
	      , keys   = enumKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)T[key = keys[j++]] = S[key];
	  }
	  return T;
	};

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(7);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getDesc    = $.getDesc
	    , getSymbols = $.getSymbols;
	  if(getSymbols)$.each.call(getSymbols(it), function(key){
	    if(getDesc(it, key).enumerable)keys.push(key);
	  });
	  return keys;
	};

/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = function($){
	  $.FW   = false;
	  $.path = $.core;
	  return $;
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var $ = __webpack_require__(7)
	  , toString = {}.toString
	  , getNames = $.getNames;

	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	function getWindowNames(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	}

	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames($.toObject(it));
	};

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $def = __webpack_require__(26);
	$def($def.S, 'Object', {assign: __webpack_require__(79)});

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var $        = __webpack_require__(7)
	  , $def     = __webpack_require__(26)
	  , isObject = $.isObject
	  , toObject = $.toObject;
	$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
	  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
	, function(KEY, ID){
	  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
	    , forced = 0
	    , method = {};
	  method[KEY] = ID == 0 ? function freeze(it){
	    return isObject(it) ? fn(it) : it;
	  } : ID == 1 ? function seal(it){
	    return isObject(it) ? fn(it) : it;
	  } : ID == 2 ? function preventExtensions(it){
	    return isObject(it) ? fn(it) : it;
	  } : ID == 3 ? function isFrozen(it){
	    return isObject(it) ? fn(it) : true;
	  } : ID == 4 ? function isSealed(it){
	    return isObject(it) ? fn(it) : true;
	  } : ID == 5 ? function isExtensible(it){
	    return isObject(it) ? fn(it) : false;
	  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
	    return fn(toObject(it), key);
	  } : ID == 7 ? function getPrototypeOf(it){
	    return fn(Object($.assertDefined(it)));
	  } : ID == 8 ? function keys(it){
	    return fn(toObject(it));
	  } : __webpack_require__(82).get;
	  try {
	    fn('z');
	  } catch(e){
	    forced = 1;
	  }
	  $def($def.S + $def.F * forced, 'Object', method);
	});

/***/ },
/* 85 */
/***/ function(module, exports) {

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array ? array.length : 0;
	  return length ? array[length - 1] : undefined;
	}

	module.exports = last;


/***/ },
/* 86 */
/***/ function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);

	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, args[0], rest);
	      case 2: return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}

	module.exports = restParam;


/***/ },
/* 87 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array.length,
	      result = Array(length);

	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}

	module.exports = arrayMap;


/***/ },
/* 88 */
/***/ function(module, exports) {

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	module.exports = arrayPush;


/***/ },
/* 89 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	module.exports = arraySome;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(31),
	    createBaseEach = __webpack_require__(101);

	/**
	 * The base implementation of `_.forEach` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object|string} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);

	module.exports = baseEach;


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(88),
	    isArguments = __webpack_require__(22),
	    isArray = __webpack_require__(9),
	    isArrayLike = __webpack_require__(16),
	    isObjectLike = __webpack_require__(14);

	/**
	 * The base implementation of `_.flatten` with added support for restricting
	 * flattening and specifying the start index.
	 *
	 * @private
	 * @param {Array} array The array to flatten.
	 * @param {boolean} [isDeep] Specify a deep flatten.
	 * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
	 * @param {Array} [result=[]] The initial result value.
	 * @returns {Array} Returns the new flattened array.
	 */
	function baseFlatten(array, isDeep, isStrict, result) {
	  result || (result = []);

	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    var value = array[index];
	    if (isObjectLike(value) && isArrayLike(value) &&
	        (isStrict || isArray(value) || isArguments(value))) {
	      if (isDeep) {
	        // Recursively flatten arrays (susceptible to call stack limits).
	        baseFlatten(value, isDeep, isStrict, result);
	      } else {
	        arrayPush(result, value);
	      }
	    } else if (!isStrict) {
	      result[result.length] = value;
	    }
	  }
	  return result;
	}

	module.exports = baseFlatten;


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(30),
	    keysIn = __webpack_require__(40);

	/**
	 * The base implementation of `_.forIn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForIn(object, iteratee) {
	  return baseFor(object, iteratee, keysIn);
	}

	module.exports = baseForIn;


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var equalArrays = __webpack_require__(104),
	    equalByTag = __webpack_require__(105),
	    equalObjects = __webpack_require__(106),
	    isArray = __webpack_require__(9),
	    isTypedArray = __webpack_require__(114);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;

	  if (!objIsArr) {
	    objTag = objToString.call(object);
	    if (objTag == argsTag) {
	      objTag = objectTag;
	    } else if (objTag != objectTag) {
	      objIsArr = isTypedArray(object);
	    }
	  }
	  if (!othIsArr) {
	    othTag = objToString.call(other);
	    if (othTag == argsTag) {
	      othTag = objectTag;
	    } else if (othTag != objectTag) {
	      othIsArr = isTypedArray(other);
	    }
	  }
	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && !(objIsArr || objIsObj)) {
	    return equalByTag(object, other, objTag);
	  }
	  if (!isLoose) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  // For more information on detecting circular references see https://es5.github.io/#JO.
	  stackA || (stackA = []);
	  stackB || (stackB = []);

	  var length = stackA.length;
	  while (length--) {
	    if (stackA[length] == object) {
	      return stackB[length] == other;
	    }
	  }
	  // Add `object` and `other` to the stack of traversed objects.
	  stackA.push(object);
	  stackB.push(other);

	  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

	  stackA.pop();
	  stackB.pop();

	  return result;
	}

	module.exports = baseIsEqualDeep;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(33),
	    toObject = __webpack_require__(8);

	/**
	 * The base implementation of `_.isMatch` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Array} matchData The propery names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;

	  if (object == null) {
	    return !length;
	  }
	  object = toObject(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];

	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var result = customizer ? customizer(objValue, srcValue, key) : undefined;
	      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	module.exports = baseIsMatch;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(90),
	    isArrayLike = __webpack_require__(16);

	/**
	 * The base implementation of `_.map` without support for callback shorthands
	 * and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var index = -1,
	      result = isArrayLike(collection) ? Array(collection.length) : [];

	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}

	module.exports = baseMap;


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(94),
	    getMatchData = __webpack_require__(107),
	    toObject = __webpack_require__(8);

	/**
	 * The base implementation of `_.matches` which does not clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    var key = matchData[0][0],
	        value = matchData[0][1];

	    return function(object) {
	      if (object == null) {
	        return false;
	      }
	      return object[key] === value && (value !== undefined || (key in toObject(object)));
	    };
	  }
	  return function(object) {
	    return baseIsMatch(object, matchData);
	  };
	}

	module.exports = baseMatches;


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(32),
	    baseIsEqual = __webpack_require__(33),
	    baseSlice = __webpack_require__(99),
	    isArray = __webpack_require__(9),
	    isKey = __webpack_require__(37),
	    isStrictComparable = __webpack_require__(38),
	    last = __webpack_require__(85),
	    toObject = __webpack_require__(8),
	    toPath = __webpack_require__(39);

	/**
	 * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to compare.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  var isArr = isArray(path),
	      isCommon = isKey(path) && isStrictComparable(srcValue),
	      pathKey = (path + '');

	  path = toPath(path);
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    var key = pathKey;
	    object = toObject(object);
	    if ((isArr || !isCommon) && !(key in object)) {
	      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	      if (object == null) {
	        return false;
	      }
	      key = last(path);
	      object = toObject(object);
	    }
	    return object[key] === srcValue
	      ? (srcValue !== undefined || (key in object))
	      : baseIsEqual(srcValue, object[key], undefined, true);
	  };
	}

	module.exports = baseMatchesProperty;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(32),
	    toPath = __webpack_require__(39);

	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function basePropertyDeep(path) {
	  var pathKey = (path + '');
	  path = toPath(path);
	  return function(object) {
	    return baseGet(object, path, pathKey);
	  };
	}

	module.exports = basePropertyDeep;


/***/ },
/* 99 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;

	  start = start == null ? 0 : (+start || 0);
	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = (end === undefined || end > length) ? length : (+end || 0);
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;

	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}

	module.exports = baseSlice;


/***/ },
/* 100 */
/***/ function(module, exports) {

	/**
	 * Converts `value` to a string if it's not one. An empty string is returned
	 * for `null` or `undefined` values.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  return value == null ? '' : (value + '');
	}

	module.exports = baseToString;


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(20),
	    isLength = __webpack_require__(10),
	    toObject = __webpack_require__(8);

	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    var length = collection ? getLength(collection) : 0;
	    if (!isLength(length)) {
	      return eachFunc(collection, iteratee);
	    }
	    var index = fromRight ? length : -1,
	        iterable = toObject(collection);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}

	module.exports = createBaseEach;


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(8);

	/**
	 * Creates a base function for `_.forIn` or `_.forInRight`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var iterable = toObject(object),
	        props = keysFunc(object),
	        length = props.length,
	        index = fromRight ? length : -1;

	    while ((fromRight ? index-- : ++index < length)) {
	      var key = props[index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}

	module.exports = createBaseFor;


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var baseCallback = __webpack_require__(29),
	    baseForOwn = __webpack_require__(31);

	/**
	 * Creates a function for `_.mapKeys` or `_.mapValues`.
	 *
	 * @private
	 * @param {boolean} [isMapKeys] Specify mapping keys instead of values.
	 * @returns {Function} Returns the new map function.
	 */
	function createObjectMapper(isMapKeys) {
	  return function(object, iteratee, thisArg) {
	    var result = {};
	    iteratee = baseCallback(iteratee, thisArg, 3);

	    baseForOwn(object, function(value, key, object) {
	      var mapped = iteratee(value, key, object);
	      key = isMapKeys ? mapped : key;
	      value = isMapKeys ? value : mapped;
	      result[key] = value;
	    });
	    return result;
	  };
	}

	module.exports = createObjectMapper;


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var arraySome = __webpack_require__(89);

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing arrays.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var index = -1,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
	    return false;
	  }
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index],
	        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

	    if (result !== undefined) {
	      if (result) {
	        continue;
	      }
	      return false;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (isLoose) {
	      if (!arraySome(other, function(othValue) {
	            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
	          })) {
	        return false;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = equalArrays;


/***/ },
/* 105 */
/***/ function(module, exports) {

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag) {
	  switch (tag) {
	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	      return +object == +other;

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object)
	        ? other != +other
	        : object == +other;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings primitives and string
	      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	      return object == (other + '');
	  }
	  return false;
	}

	module.exports = equalByTag;


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(19);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isLoose) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  var skipCtor = isLoose;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key],
	        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;

	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
	      return false;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (!skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = equalObjects;


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(38),
	    pairs = __webpack_require__(115);

	/**
	 * Gets the propery names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = pairs(object),
	      length = result.length;

	  while (length--) {
	    result[length][2] = isStrictComparable(result[length][1]);
	  }
	  return result;
	}

	module.exports = getMatchData;


/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(16),
	    isIndex = __webpack_require__(21),
	    isObject = __webpack_require__(11);

	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	      ? (isArrayLike(object) && isIndex(index, object.length))
	      : (type == 'string' && index in object)) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}

	module.exports = isIterateeCall;


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(8);

	/**
	 * A specialized version of `_.pick` which picks `object` properties specified
	 * by `props`.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {string[]} props The property names to pick.
	 * @returns {Object} Returns the new object.
	 */
	function pickByArray(object, props) {
	  object = toObject(object);

	  var index = -1,
	      length = props.length,
	      result = {};

	  while (++index < length) {
	    var key = props[index];
	    if (key in object) {
	      result[key] = object[key];
	    }
	  }
	  return result;
	}

	module.exports = pickByArray;


/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	var baseForIn = __webpack_require__(92);

	/**
	 * A specialized version of `_.pick` which picks `object` properties `predicate`
	 * returns truthy for.
	 *
	 * @private
	 * @param {Object} object The source object.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Object} Returns the new object.
	 */
	function pickByCallback(object, predicate) {
	  var result = {};
	  baseForIn(object, function(value, key, object) {
	    if (predicate(value, key, object)) {
	      result[key] = value;
	    }
	  });
	  return result;
	}

	module.exports = pickByCallback;


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(22),
	    isArray = __webpack_require__(9),
	    isIndex = __webpack_require__(21),
	    isLength = __webpack_require__(10),
	    keysIn = __webpack_require__(40);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;

	  var allowIndexes = !!length && isLength(length) &&
	    (isArray(object) || isArguments(object));

	  var index = -1,
	      result = [];

	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = shimKeys;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(11);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 equivalents which return 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}

	module.exports = isFunction;


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(112),
	    isObjectLike = __webpack_require__(14);

	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}

	module.exports = isNative;


/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(10),
	    isObjectLike = __webpack_require__(14);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
	}

	module.exports = isTypedArray;


/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(19),
	    toObject = __webpack_require__(8);

	/**
	 * Creates a two dimensional array of the key-value pairs for `object`,
	 * e.g. `[[key1, value1], [key2, value2]]`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the new array of key-value pairs.
	 * @example
	 *
	 * _.pairs({ 'barney': 36, 'fred': 40 });
	 * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
	 */
	function pairs(object) {
	  object = toObject(object);

	  var index = -1,
	      props = keys(object),
	      length = props.length,
	      result = Array(length);

	  while (++index < length) {
	    var key = props[index];
	    result[index] = [key, object[key]];
	  }
	  return result;
	}

	module.exports = pairs;


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(91),
	    bindCallback = __webpack_require__(35),
	    pickByArray = __webpack_require__(109),
	    pickByCallback = __webpack_require__(110),
	    restParam = __webpack_require__(86);

	/**
	 * Creates an object composed of the picked `object` properties. Property
	 * names may be specified as individual arguments or as arrays of property
	 * names. If `predicate` is provided it is invoked for each property of `object`
	 * picking the properties `predicate` returns truthy for. The predicate is
	 * bound to `thisArg` and invoked with three arguments: (value, key, object).
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The source object.
	 * @param {Function|...(string|string[])} [predicate] The function invoked per
	 *  iteration or property names to pick, specified as individual property
	 *  names or arrays of property names.
	 * @param {*} [thisArg] The `this` binding of `predicate`.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * var object = { 'user': 'fred', 'age': 40 };
	 *
	 * _.pick(object, 'user');
	 * // => { 'user': 'fred' }
	 *
	 * _.pick(object, _.isString);
	 * // => { 'user': 'fred' }
	 */
	var pick = restParam(function(object, props) {
	  if (object == null) {
	    return {};
	  }
	  return typeof props[0] == 'function'
	    ? pickByCallback(object, bindCallback(props[0], props[1], 3))
	    : pickByArray(object, baseFlatten(props));
	});

	module.exports = pick;


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(34),
	    basePropertyDeep = __webpack_require__(98),
	    isKey = __webpack_require__(37);

	/**
	 * Creates a function that returns the property value at `path` on a
	 * given object.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': { 'c': 2 } } },
	 *   { 'a': { 'b': { 'c': 1 } } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b.c'));
	 * // => [2, 1]
	 *
	 * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
	}

	module.exports = property;


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var isIterateeCall = __webpack_require__(108);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeCeil = Math.ceil,
	    nativeMax = Math.max;

	/**
	 * Creates an array of numbers (positive and/or negative) progressing from
	 * `start` up to, but not including, `end`. If `end` is not specified it is
	 * set to `start` with `start` then set to `0`. If `end` is less than `start`
	 * a zero-length range is created unless a negative `step` is specified.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {number} [start=0] The start of the range.
	 * @param {number} end The end of the range.
	 * @param {number} [step=1] The value to increment or decrement by.
	 * @returns {Array} Returns the new array of numbers.
	 * @example
	 *
	 * _.range(4);
	 * // => [0, 1, 2, 3]
	 *
	 * _.range(1, 5);
	 * // => [1, 2, 3, 4]
	 *
	 * _.range(0, 20, 5);
	 * // => [0, 5, 10, 15]
	 *
	 * _.range(0, -4, -1);
	 * // => [0, -1, -2, -3]
	 *
	 * _.range(1, 4, 0);
	 * // => [1, 1, 1]
	 *
	 * _.range(0);
	 * // => []
	 */
	function range(start, end, step) {
	  if (step && isIterateeCall(start, end, step)) {
	    end = step = undefined;
	  }
	  start = +start || 0;
	  step = step == null ? 1 : (+step || 0);

	  if (end == null) {
	    end = start;
	    start = 0;
	  } else {
	    end = +end || 0;
	  }
	  // Use `Array(length)` so engines like Chakra and V8 avoid slower modes.
	  // See https://youtu.be/XAqIpGU8ZZk#t=17m25s for more details.
	  var index = -1,
	      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
	      result = Array(length);

	  while (++index < length) {
	    result[index] = start;
	    start += step;
	  }
	  return result;
	}

	module.exports = range;


/***/ },
/* 119 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = shallowEqual;

	function shallowEqual(objA, objB) {
	  if (objA === objB) {
	    return true;
	  }

	  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
	    return false;
	  }

	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);

	  if (keysA.length !== keysB.length) {
	    return false;
	  }

	  // Test for A's keys different from B.
	  var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
	  for (var i = 0; i < keysA.length; i++) {
	    if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
	      return false;
	    }
	  }

	  return true;
	}

	module.exports = exports['default'];

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _invariant = __webpack_require__(49);

	var _invariant2 = _interopRequireDefault(_invariant);

	var _utilsIsPlainObject = __webpack_require__(47);

	var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);

	var Store = (function () {
	  function Store(reducer, initialState) {
	    _classCallCheck(this, Store);

	    _invariant2['default'](typeof reducer === 'function', 'Expected the reducer to be a function.');

	    this.state = initialState;
	    this.listeners = [];
	    this.replaceReducer(reducer);
	  }

	  Store.prototype.getReducer = function getReducer() {
	    return this.reducer;
	  };

	  Store.prototype.replaceReducer = function replaceReducer(nextReducer) {
	    this.reducer = nextReducer;
	    this.dispatch({ type: '@@INIT' });
	  };

	  Store.prototype.dispatch = function dispatch(action) {
	    _invariant2['default'](_utilsIsPlainObject2['default'](action), 'Actions must be plain objects. Use custom middleware for async actions.');

	    var reducer = this.reducer;

	    this.state = reducer(this.state, action);
	    this.listeners.forEach(function (listener) {
	      return listener();
	    });
	    return action;
	  };

	  Store.prototype.getState = function getState() {
	    return this.state;
	  };

	  Store.prototype.subscribe = function subscribe(listener) {
	    var listeners = this.listeners;

	    listeners.push(listener);

	    return function unsubscribe() {
	      var index = listeners.indexOf(listener);
	      listeners.splice(index, 1);
	    };
	  };

	  return Store;
	})();

	exports['default'] = Store;
	module.exports = exports['default'];

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = createAll;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _createProvider = __webpack_require__(125);

	var _createProvider2 = _interopRequireDefault(_createProvider);

	var _createProvideDecorator = __webpack_require__(124);

	var _createProvideDecorator2 = _interopRequireDefault(_createProvideDecorator);

	var _createConnector = __webpack_require__(123);

	var _createConnector2 = _interopRequireDefault(_createConnector);

	var _createConnectDecorator = __webpack_require__(122);

	var _createConnectDecorator2 = _interopRequireDefault(_createConnectDecorator);

	function createAll(React) {
	  // Wrapper components
	  var Provider = _createProvider2['default'](React);
	  var Connector = _createConnector2['default'](React);

	  // Higher-order components (decorators)
	  var provide = _createProvideDecorator2['default'](React, Provider);
	  var connect = _createConnectDecorator2['default'](React, Connector);

	  return { Provider: Provider, Connector: Connector, provide: provide, connect: connect };
	}

	module.exports = exports['default'];

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	exports['default'] = createConnectDecorator;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _utilsGetDisplayName = __webpack_require__(46);

	var _utilsGetDisplayName2 = _interopRequireDefault(_utilsGetDisplayName);

	var _utilsShallowEqualScalar = __webpack_require__(134);

	var _utilsShallowEqualScalar2 = _interopRequireDefault(_utilsShallowEqualScalar);

	function createConnectDecorator(React, Connector) {
	  var Component = React.Component;

	  return function connect(select) {
	    return function (DecoratedComponent) {
	      return (function (_Component) {
	        function ConnectorDecorator() {
	          _classCallCheck(this, ConnectorDecorator);

	          _Component.apply(this, arguments);
	        }

	        _inherits(ConnectorDecorator, _Component);

	        ConnectorDecorator.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps) {
	          return !_utilsShallowEqualScalar2['default'](this.props, nextProps);
	        };

	        ConnectorDecorator.prototype.render = function render() {
	          var _this = this;

	          return React.createElement(
	            Connector,
	            { select: function (state) {
	                return select(state, _this.props);
	              } },
	            function (stuff) {
	              return React.createElement(DecoratedComponent, _extends({}, stuff, _this.props));
	            }
	          );
	        };

	        _createClass(ConnectorDecorator, null, [{
	          key: 'displayName',
	          value: 'Connector(' + _utilsGetDisplayName2['default'](DecoratedComponent) + ')',
	          enumerable: true
	        }, {
	          key: 'DecoratedComponent',
	          value: DecoratedComponent,
	          enumerable: true
	        }]);

	        return ConnectorDecorator;
	      })(Component);
	    };
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	exports['default'] = createConnector;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _utilsCreateStoreShape = __webpack_require__(45);

	var _utilsCreateStoreShape2 = _interopRequireDefault(_utilsCreateStoreShape);

	var _utilsIdentity = __webpack_require__(131);

	var _utilsIdentity2 = _interopRequireDefault(_utilsIdentity);

	var _utilsShallowEqual = __webpack_require__(133);

	var _utilsShallowEqual2 = _interopRequireDefault(_utilsShallowEqual);

	var _utilsIsPlainObject = __webpack_require__(47);

	var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);

	var _invariant = __webpack_require__(49);

	var _invariant2 = _interopRequireDefault(_invariant);

	function createConnector(React) {
	  var Component = React.Component;
	  var PropTypes = React.PropTypes;

	  var storeShape = _utilsCreateStoreShape2['default'](PropTypes);

	  return (function (_Component) {
	    function Connector(props, context) {
	      _classCallCheck(this, Connector);

	      _Component.call(this, props, context);
	      this.state = this.selectState(props, context);
	    }

	    _inherits(Connector, _Component);

	    Connector.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
	      return !this.isSliceEqual(this.state.slice, nextState.slice) || !_utilsShallowEqual2['default'](this.props, nextProps);
	    };

	    Connector.prototype.isSliceEqual = function isSliceEqual(slice, nextSlice) {
	      var isRefEqual = slice === nextSlice;
	      if (isRefEqual) {
	        return true;
	      } else if (typeof slice !== 'object' || typeof nextSlice !== 'object') {
	        return isRefEqual;
	      }
	      return _utilsShallowEqual2['default'](slice, nextSlice);
	    };

	    Connector.prototype.componentDidMount = function componentDidMount() {
	      this.unsubscribe = this.context.store.subscribe(this.handleChange.bind(this));
	    };

	    Connector.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	      if (nextProps.select !== this.props.select) {
	        // Force the state slice recalculation
	        this.handleChange(nextProps);
	      }
	    };

	    Connector.prototype.componentWillUnmount = function componentWillUnmount() {
	      this.unsubscribe();
	    };

	    Connector.prototype.handleChange = function handleChange() {
	      var props = arguments[0] === undefined ? this.props : arguments[0];

	      var nextState = this.selectState(props, this.context);
	      this.setState(nextState);
	    };

	    Connector.prototype.selectState = function selectState(props, context) {
	      var state = context.store.getState();
	      var slice = props.select(state);

	      _invariant2['default'](_utilsIsPlainObject2['default'](slice), 'The return value of `select` prop must be an object. Instead received %s.', slice);

	      return { slice: slice };
	    };

	    Connector.prototype.render = function render() {
	      var children = this.props.children;
	      var slice = this.state.slice;
	      var dispatch = this.context.store.dispatch;

	      return children(_extends({ dispatch: dispatch }, slice));
	    };

	    _createClass(Connector, null, [{
	      key: 'contextTypes',
	      value: {
	        store: storeShape.isRequired
	      },
	      enumerable: true
	    }, {
	      key: 'propTypes',
	      value: {
	        children: PropTypes.func.isRequired,
	        select: PropTypes.func.isRequired
	      },
	      enumerable: true
	    }, {
	      key: 'defaultProps',
	      value: {
	        select: _utilsIdentity2['default']
	      },
	      enumerable: true
	    }]);

	    return Connector;
	  })(Component);
	}

	module.exports = exports['default'];

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	exports['default'] = createProvideDecorator;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _utilsGetDisplayName = __webpack_require__(46);

	var _utilsGetDisplayName2 = _interopRequireDefault(_utilsGetDisplayName);

	function createProvideDecorator(React, Provider) {
	  var Component = React.Component;

	  return function provide(store) {
	    return function (DecoratedComponent) {
	      return (function (_Component) {
	        function ProviderDecorator() {
	          _classCallCheck(this, ProviderDecorator);

	          _Component.apply(this, arguments);
	        }

	        _inherits(ProviderDecorator, _Component);

	        ProviderDecorator.prototype.render = function render() {
	          var _this = this;

	          return React.createElement(
	            Provider,
	            { store: store },
	            function () {
	              return React.createElement(DecoratedComponent, _this.props);
	            }
	          );
	        };

	        _createClass(ProviderDecorator, null, [{
	          key: 'displayName',
	          value: 'Provider(' + _utilsGetDisplayName2['default'](DecoratedComponent) + ')',
	          enumerable: true
	        }, {
	          key: 'DecoratedComponent',
	          value: DecoratedComponent,
	          enumerable: true
	        }]);

	        return ProviderDecorator;
	      })(Component);
	    };
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	exports['default'] = createProvider;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var _utilsCreateStoreShape = __webpack_require__(45);

	var _utilsCreateStoreShape2 = _interopRequireDefault(_utilsCreateStoreShape);

	function createProvider(React) {
	  var Component = React.Component;
	  var PropTypes = React.PropTypes;

	  var storeShape = _utilsCreateStoreShape2['default'](PropTypes);

	  return (function (_Component) {
	    function Provider(props, context) {
	      _classCallCheck(this, Provider);

	      _Component.call(this, props, context);
	      this.state = { store: props.store };
	    }

	    _inherits(Provider, _Component);

	    Provider.prototype.getChildContext = function getChildContext() {
	      return { store: this.state.store };
	    };

	    Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	      var store = this.state.store;
	      var nextStore = nextProps.store;

	      if (store !== nextStore) {
	        var nextReducer = nextStore.getReducer();
	        store.replaceReducer(nextReducer);
	      }
	    };

	    Provider.prototype.render = function render() {
	      var children = this.props.children;

	      return children();
	    };

	    _createClass(Provider, null, [{
	      key: 'childContextTypes',
	      value: {
	        store: storeShape.isRequired
	      },
	      enumerable: true
	    }, {
	      key: 'propTypes',
	      value: {
	        children: PropTypes.func.isRequired
	      },
	      enumerable: true
	    }]);

	    return Provider;
	  })(Component);
	}

	module.exports = exports['default'];

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = createStore;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Store = __webpack_require__(120);

	var _Store2 = _interopRequireDefault(_Store);

	var _utilsComposeReducers = __webpack_require__(44);

	var _utilsComposeReducers2 = _interopRequireDefault(_utilsComposeReducers);

	var _utilsComposeMiddleware = __webpack_require__(43);

	var _utilsComposeMiddleware2 = _interopRequireDefault(_utilsComposeMiddleware);

	var _middlewareThunk = __webpack_require__(128);

	var _middlewareThunk2 = _interopRequireDefault(_middlewareThunk);

	var defaultMiddlewares = function defaultMiddlewares(_ref) {
	  var dispatch = _ref.dispatch;
	  var getState = _ref.getState;
	  return [_middlewareThunk2['default']({ dispatch: dispatch, getState: getState })];
	};

	function createStore(reducer, initialState) {
	  var middlewares = arguments[2] === undefined ? defaultMiddlewares : arguments[2];

	  var finalReducer = typeof reducer === 'function' ? reducer : _utilsComposeReducers2['default'](reducer);

	  var store = new _Store2['default'](finalReducer, initialState);
	  var getState = store.getState.bind(store);

	  var rawDispatch = store.dispatch.bind(store);
	  var cookedDispatch = null;

	  function dispatch(action) {
	    return cookedDispatch(action);
	  }

	  var finalMiddlewares = typeof middlewares === 'function' ? middlewares({ dispatch: dispatch, getState: getState }) : middlewares;

	  cookedDispatch = _utilsComposeMiddleware2['default'].apply(undefined, finalMiddlewares.concat([rawDispatch]));

	  return {
	    dispatch: cookedDispatch,
	    subscribe: store.subscribe.bind(store),
	    getState: store.getState.bind(store),
	    getReducer: store.getReducer.bind(store),
	    replaceReducer: store.replaceReducer.bind(store)
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	// Core
	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _createStore = __webpack_require__(126);

	var _createStore2 = _interopRequireDefault(_createStore);

	// Utilities

	var _utilsComposeMiddleware = __webpack_require__(43);

	var _utilsComposeMiddleware2 = _interopRequireDefault(_utilsComposeMiddleware);

	var _utilsComposeReducers = __webpack_require__(44);

	var _utilsComposeReducers2 = _interopRequireDefault(_utilsComposeReducers);

	var _utilsBindActionCreators = __webpack_require__(130);

	var _utilsBindActionCreators2 = _interopRequireDefault(_utilsBindActionCreators);

	exports.createStore = _createStore2['default'];
	exports.composeMiddleware = _utilsComposeMiddleware2['default'];
	exports.composeReducers = _utilsComposeReducers2['default'];
	exports.bindActionCreators = _utilsBindActionCreators2['default'];

/***/ },
/* 128 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = thunkMiddleware;

	function thunkMiddleware(_ref) {
	  var dispatch = _ref.dispatch;
	  var getState = _ref.getState;

	  return function (next) {
	    return function (action) {
	      return typeof action === 'function' ? action(dispatch, getState) : next(action);
	    };
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _componentsCreateAll = __webpack_require__(121);

	var _componentsCreateAll2 = _interopRequireDefault(_componentsCreateAll);

	var _createAll = _componentsCreateAll2['default'](_react2['default']);

	var Provider = _createAll.Provider;
	var Connector = _createAll.Connector;
	var provide = _createAll.provide;
	var connect = _createAll.connect;
	exports.Provider = Provider;
	exports.Connector = Connector;
	exports.provide = provide;
	exports.connect = connect;

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = bindActionCreators;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utilsMapValues = __webpack_require__(48);

	var _utilsMapValues2 = _interopRequireDefault(_utilsMapValues);

	function bindActionCreators(actionCreators, dispatch) {
	  return _utilsMapValues2['default'](actionCreators, function (actionCreator) {
	    return function () {
	      return dispatch(actionCreator.apply(undefined, arguments));
	    };
	  });
	}

	module.exports = exports['default'];

/***/ },
/* 131 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = identity;

	function identity(value) {
	  return value;
	}

	module.exports = exports["default"];

/***/ },
/* 132 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = pick;

	function pick(obj, fn) {
	  return Object.keys(obj).reduce(function (result, key) {
	    if (fn(obj[key])) {
	      result[key] = obj[key];
	    }
	    return result;
	  }, {});
	}

	module.exports = exports["default"];

/***/ },
/* 133 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;
	exports["default"] = shallowEqual;

	function shallowEqual(objA, objB) {
	  if (objA === objB) {
	    return true;
	  }

	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);

	  if (keysA.length !== keysB.length) {
	    return false;
	  }

	  // Test for A's keys different from B.
	  var hasOwn = Object.prototype.hasOwnProperty;
	  for (var i = 0; i < keysA.length; i++) {
	    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
	      return false;
	    }
	  }

	  return true;
	}

	module.exports = exports["default"];

/***/ },
/* 134 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = shallowEqualScalar;

	function shallowEqualScalar(objA, objB) {
	  if (objA === objB) {
	    return true;
	  }

	  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
	    return false;
	  }

	  var keysA = Object.keys(objA);
	  var keysB = Object.keys(objB);

	  if (keysA.length !== keysB.length) {
	    return false;
	  }

	  // Test for A's keys different from B.
	  var hasOwn = Object.prototype.hasOwnProperty;
	  for (var i = 0; i < keysA.length; i++) {
	    if (!hasOwn.call(objB, keysA[i])) {
	      return false;
	    }

	    var valA = objA[keysA[i]];
	    var valB = objB[keysA[i]];

	    if (valA !== valB || typeof valA === 'object' || typeof valB === 'object') {
	      return false;
	    }
	  }

	  return true;
	}

	module.exports = exports['default'];

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

	var _libReact = __webpack_require__(129);

	_defaults(exports, _interopRequireWildcard(_libReact));

/***/ }
/******/ ])
});
;