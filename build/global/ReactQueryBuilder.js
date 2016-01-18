(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("immutable"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "immutable"], factory);
	else if(typeof exports === 'object')
		exports["ReactQueryBuilder"] = factory(require("react"), require("immutable"));
	else
		root["ReactQueryBuilder"] = factory(root["React"], root["Immutable"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_5__) {
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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _Query = __webpack_require__(53);

	Object.defineProperty(exports, 'Query', {
	  enumerable: true,
	  get: function get() {
	    return _Query.default;
	  }
	});

	var _Builder = __webpack_require__(47);

	Object.defineProperty(exports, 'Builder', {
	  enumerable: true,
	  get: function get() {
	    return _Builder.default;
	  }
	});

	var _Preview = __webpack_require__(52);

	Object.defineProperty(exports, 'Preview', {
	  enumerable: true,
	  get: function get() {
	    return _Preview.default;
	  }
	});

	var _widgets = __webpack_require__(63);

	Object.defineProperty(exports, 'TextWidget', {
	  enumerable: true,
	  get: function get() {
	    return _widgets.TextWidget;
	  }
	});
	Object.defineProperty(exports, 'SelectWidget', {
	  enumerable: true,
	  get: function get() {
	    return _widgets.SelectWidget;
	  }
	});
	Object.defineProperty(exports, 'DateWidget', {
	  enumerable: true,
	  get: function get() {
	    return _widgets.DateWidget;
	  }
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = shouldPureComponentUpdate;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _shallowEqual = __webpack_require__(103);

	var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

	function shouldPureComponentUpdate(nextProps, nextState) {
	  return !(0, _shallowEqual2['default'])(this.props, nextProps) || !(0, _shallowEqual2['default'])(this.state, nextState);
	}

	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(7);

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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(30),
	    isLength = __webpack_require__(6),
	    isObjectLike = __webpack_require__(8);

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
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
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
/* 7 */
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
/* 8 */
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(17),
	    isLength = __webpack_require__(6);

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
/* 10 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var ADD_GROUP = exports.ADD_GROUP = 'ADD_GROUP';
	var REMOVE_GROUP = exports.REMOVE_GROUP = 'REMOVE_GROUP';
	var SET_CONJUNCTION = exports.SET_CONJUNCTION = 'SET_CONJUNCTION';

	var ADD_NEW_GROUP = exports.ADD_NEW_GROUP = 'ADD_NEW_GROUP';
	var ADD_RULE = exports.ADD_RULE = 'ADD_RULE';
	var REMOVE_RULE = exports.REMOVE_RULE = 'REMOVE_RULE';
	var SET_FIELD = exports.SET_FIELD = 'SET_FIELD';
	var SET_OPERATOR = exports.SET_OPERATOR = 'SET_OPERATOR';
	var SET_VALUE = exports.SET_VALUE = 'SET_VALUE';
	var SET_OPERATOR_OPTION = exports.SET_OPERATOR_OPTION = 'SET_OPERATOR_OPTION';
	var SET_VALUE_OPTION = exports.SET_VALUE_OPTION = 'SET_VALUE_OPTION';

	var SET_TREE = exports.SET_TREE = 'SET_TREE';

/***/ },
/* 11 */
/***/ function(module, exports) {

	exports = module.exports = stringify
	exports.getSerialize = serializer

	function stringify(obj, replacer, spaces, cycleReplacer) {
	  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
	}

	function serializer(replacer, cycleReplacer) {
	  var stack = [], keys = []

	  if (cycleReplacer == null) cycleReplacer = function(key, value) {
	    if (stack[0] === value) return "[Circular ~]"
	    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
	  }

	  return function(key, value) {
	    if (stack.length > 0) {
	      var thisPos = stack.indexOf(this)
	      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
	      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
	      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
	    }
	    else stack.push(value)

	    return replacer == null ? value : replacer.call(this, key, value)
	  }
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(72),
	    baseCallback = __webpack_require__(23),
	    baseMap = __webpack_require__(80),
	    isArray = __webpack_require__(4);

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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(30),
	    isArrayLike = __webpack_require__(9),
	    isObject = __webpack_require__(7),
	    shimKeys = __webpack_require__(96);

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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.defaultConjunction = undefined;

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var defaultConjunction = exports.defaultConjunction = function defaultConjunction(config) {
	  return config.settings.defaultConjunction || Object.keys(config.conjunctions)[0];
	};

	exports.default = function (config) {
	  return new _immutable2.default.Map({
	    conjunction: defaultConjunction(config)
	  });
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.defaultValueOptions = exports.defaultOperatorOptions = exports.defaultOperator = exports.defaultField = undefined;

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _map = __webpack_require__(12);

	var _map2 = _interopRequireDefault(_map);

	var _range = __webpack_require__(36);

	var _range2 = _interopRequireDefault(_range);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var defaultField = exports.defaultField = function defaultField(config) {
	  return typeof config.settings.defaultField === 'function' ? config.settings.defaultField(config) : config.settings.defaultField || Object.keys(config.fields)[0];
	};

	var defaultOperator = exports.defaultOperator = function defaultOperator(config, field) {
	  return typeof config.settings.defaultOperator === 'function' ? config.settings.defaultOperator(field, config) : config.settings.defaultOperator || config.fields[field].operators[0];
	};

	var defaultOperatorOptions = exports.defaultOperatorOptions = function defaultOperatorOptions(config, operator) {
	  return new _immutable2.default.Map(config.operators[operator].options && config.operators[operator].options.defaults || {});
	};

	var defaultValueOptions = exports.defaultValueOptions = function defaultValueOptions(config, operator) {
	  return new _immutable2.default.List((0, _map2.default)((0, _range2.default)(0, config.operators[operator].cardinality), function () {
	    return new _immutable2.default.Map(config.operators[operator].valueOptions && config.operators[operator].valueOptions.defaults || {});
	  }));
	};

	exports.default = function (config) {
	  var field = defaultField(config, field);
	  var operator = defaultOperator(config, field);

	  return new _immutable2.default.Map({
	    field: field,
	    operator: operator,
	    value: new _immutable2.default.List(),
	    operatorOptions: defaultOperatorOptions(config, operator),
	    valueOptions: defaultValueOptions(config, operator)
	  });
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports.default = function () {
	  return(
	    // Generate a random GUID http://stackoverflow.com/a/2117523.
	    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	      var r = Math.random() * 16 | 0;
	      var v = c === 'x' ? r : r & 0x3 | 0x8;
	      return v.toString(16);
	    })
	  );
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(28);

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
/* 18 */
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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(9),
	    isObjectLike = __webpack_require__(8);

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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var createObjectMapper = __webpack_require__(88);

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
/* 21 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * @param {Immutable.List} path
	 * @param {...string} suffix
	 */

	exports.default = function (path) {
	  for (var _len = arguments.length, suffix = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    suffix[_key - 1] = arguments[_key];
	  }

	  return path.interpose('children1').withMutations(function (list) {
	    list.skip(1);
	    list.push.apply(list, suffix);
	    return list;
	  });
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(17),
	    isLength = __webpack_require__(6),
	    keys = __webpack_require__(13);

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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(81),
	    baseMatchesProperty = __webpack_require__(82),
	    bindCallback = __webpack_require__(29),
	    identity = __webpack_require__(35),
	    property = __webpack_require__(102);

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
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(87);

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
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(24),
	    keys = __webpack_require__(13);

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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(3);

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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(78),
	    isObject = __webpack_require__(7),
	    isObjectLike = __webpack_require__(8);

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
/* 28 */
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(35);

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
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(98);

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
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(4),
	    toObject = __webpack_require__(3);

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
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(7);

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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(85),
	    isArray = __webpack_require__(4);

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
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(19),
	    isArray = __webpack_require__(4),
	    isIndex = __webpack_require__(18),
	    isLength = __webpack_require__(6),
	    isObject = __webpack_require__(7);

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
/* 35 */
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
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var isIterateeCall = __webpack_require__(93);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeCeil = Math.ceil,
	    nativeMax = Math.max;

	/**
	 * Creates an array of numbers (positive and/or negative) progressing from
	 * `start` up to, but not including, `end`. If `end` is not specified it's
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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(1);

	var PropTypes = _require.PropTypes;

	var storeShape = PropTypes.shape({
	  subscribe: PropTypes.func.isRequired,
	  dispatch: PropTypes.func.isRequired,
	  getState: PropTypes.func.isRequired
	});

	module.exports = storeShape;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = createStore;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _utilsIsPlainObject = __webpack_require__(41);

	var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);

	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = {
	  INIT: '@@redux/INIT'
	};

	exports.ActionTypes = ActionTypes;
	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [initialState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */

	function createStore(reducer, initialState) {
	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }

	  var currentReducer = reducer;
	  var currentState = initialState;
	  var listeners = [];
	  var isDispatching = false;

	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }

	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    listeners.push(listener);
	    var isSubscribed = true;

	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }

	      isSubscribed = false;
	      var index = listeners.indexOf(listener);
	      listeners.splice(index, 1);
	    };
	  }

	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!_utilsIsPlainObject2['default'](action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }

	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }

	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }

	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }

	    listeners.slice().forEach(function (listener) {
	      return listener();
	    });
	    return action;
	  }

	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }

	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });

	  return {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  };
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _createStore = __webpack_require__(38);

	var _createStore2 = _interopRequireDefault(_createStore);

	var _utilsCombineReducers = __webpack_require__(112);

	var _utilsCombineReducers2 = _interopRequireDefault(_utilsCombineReducers);

	var _utilsBindActionCreators = __webpack_require__(111);

	var _utilsBindActionCreators2 = _interopRequireDefault(_utilsBindActionCreators);

	var _utilsApplyMiddleware = __webpack_require__(110);

	var _utilsApplyMiddleware2 = _interopRequireDefault(_utilsApplyMiddleware);

	var _utilsCompose = __webpack_require__(40);

	var _utilsCompose2 = _interopRequireDefault(_utilsCompose);

	exports.createStore = _createStore2['default'];
	exports.combineReducers = _utilsCombineReducers2['default'];
	exports.bindActionCreators = _utilsBindActionCreators2['default'];
	exports.applyMiddleware = _utilsApplyMiddleware2['default'];
	exports.compose = _utilsCompose2['default'];

/***/ },
/* 40 */
/***/ function(module, exports) {

	/**
	 * Composes single-argument functions from right to left.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing functions from right to
	 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
	 */
	"use strict";

	exports.__esModule = true;
	exports["default"] = compose;

	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }

	  return function (arg) {
	    return funcs.reduceRight(function (composed, f) {
	      return f(composed);
	    }, arg);
	  };
	}

	module.exports = exports["default"];

/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = isPlainObject;
	var fnToString = function fnToString(fn) {
	  return Function.prototype.toString.call(fn);
	};
	var objStringValue = fnToString(Object);

	/**
	 * @param {any} obj The object to inspect.
	 * @returns {boolean} True if the argument appears to be a plain object.
	 */

	function isPlainObject(obj) {
	  if (!obj || typeof obj !== 'object') {
	    return false;
	  }

	  var proto = typeof obj.constructor === 'function' ? Object.getPrototypeOf(obj) : Object.prototype;

	  if (proto === null) {
	    return true;
	  }

	  var constructor = proto.constructor;

	  return typeof constructor === 'function' && constructor instanceof constructor && fnToString(constructor) === objStringValue;
	}

	module.exports = exports['default'];

/***/ },
/* 42 */
/***/ function(module, exports) {

	/**
	 * Applies a function to every key-value pair inside an object.
	 *
	 * @param {Object} obj The source object.
	 * @param {Function} fn The mapper function that receives the value and the key.
	 * @returns {Object} A new object that contains the mapped values for the keys.
	 */
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
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setConjunction = undefined;

	var _constants = __webpack_require__(10);

	var constants = _interopRequireWildcard(_constants);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {string} conjunction
	 */
	var setConjunction = exports.setConjunction = function setConjunction(config, path, conjunction) {
	  return {
	    type: constants.SET_CONJUNCTION,
	    path: path,
	    conjunction: conjunction
	  };
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.rule = exports.group = exports.tree = undefined;

	var _tree2 = __webpack_require__(46);

	var _tree = _interopRequireWildcard(_tree2);

	var _group2 = __webpack_require__(43);

	var _group = _interopRequireWildcard(_group2);

	var _rule2 = __webpack_require__(45);

	var _rule = _interopRequireWildcard(_rule2);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	exports.tree = _tree;
	exports.group = _group;
	exports.rule = _rule;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setValueOption = exports.setOperatorOption = exports.setValue = exports.setOperator = exports.setField = undefined;

	var _constants = __webpack_require__(10);

	var constants = _interopRequireWildcard(_constants);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {string} field
	 */
	var setField = exports.setField = function setField(config, path, field) {
	  return {
	    type: constants.SET_FIELD,
	    path: path,
	    field: field,
	    config: config
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {string} operator
	 */
	var setOperator = exports.setOperator = function setOperator(config, path, operator) {
	  return {
	    type: constants.SET_OPERATOR,
	    path: path,
	    operator: operator,
	    config: config
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {integer} delta
	 * @param {*} value
	 */
	var setValue = exports.setValue = function setValue(config, path, delta, value) {
	  return {
	    type: constants.SET_VALUE,
	    path: path,
	    delta: delta,
	    value: value,
	    config: config
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {string} name
	 * @param {*} value
	 */
	var setOperatorOption = exports.setOperatorOption = function setOperatorOption(config, path, name, value) {
	  return {
	    type: constants.SET_OPERATOR_OPTION,
	    path: path,
	    name: name,
	    value: value,
	    config: config
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {integer} delta
	 * @param {string} name
	 * @param {*} value
	 */
	var setValueOption = exports.setValueOption = function setValueOption(config, path, delta, name, value) {
	  return {
	    type: constants.SET_VALUE_OPTION,
	    path: path,
	    delta: delta,
	    name: name,
	    value: value,
	    config: config
	  };
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.removeGroup = exports.removeGroupOld = exports.addGroup = exports.addGroupOld = exports.removeRule = exports.removeRuleOld = exports.addRule = exports.setTree = undefined;

	var _uuid = __webpack_require__(16);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _expandTreePath = __webpack_require__(21);

	var _expandTreePath2 = _interopRequireDefault(_expandTreePath);

	var _defaultRuleProperties = __webpack_require__(15);

	var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

	var _defaultGroupProperties = __webpack_require__(14);

	var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

	var _constants = __webpack_require__(10);

	var constants = _interopRequireWildcard(_constants);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var hasChildren = function hasChildren(tree, path) {
	  return tree.getIn((0, _expandTreePath2.default)(path, 'children1')).size > 0;
	};

	/**
	 * @param {object} config
	 * @param {Immutable.Map} tree
	 */
	var setTree = exports.setTree = function setTree(config, tree) {
	  return {
	    type: constants.SET_TREE,
	    tree: tree
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {object} properties
	 */
	var addRule = exports.addRule = function addRule(config, path, properties) {
	  return {
	    type: constants.ADD_RULE,
	    path: path,
	    id: (0, _uuid2.default)(),
	    properties: (0, _defaultRuleProperties2.default)(config).merge(properties || {})
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 */
	var removeRuleOld = exports.removeRuleOld = function removeRuleOld(config, path) {
	  return function (dispatch, getState) {
	    dispatch({
	      type: constants.REMOVE_RULE,
	      path: path,
	      config: config
	    });

	    var _getState = getState();

	    var tree = _getState.tree;

	    var parentPath = path.slice(0, -1);
	    if (!hasChildren(tree, parentPath)) {
	      dispatch(addRule(config, parentPath));
	    }
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 */
	var removeRule = exports.removeRule = function removeRule(config, path) {
	  return {
	    type: constants.REMOVE_RULE,
	    path: path,
	    config: config
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {object} properties
	 */
	var addGroupOld = exports.addGroupOld = function addGroupOld(config, path, properties) {
	  return function (dispatch) {
	    var groupUuid = (0, _uuid2.default)();

	    dispatch({
	      type: constants.ADD_GROUP,
	      path: path,
	      id: groupUuid,
	      properties: (0, _defaultGroupProperties2.default)(config).merge(properties || {}),
	      config: config
	    });

	    var groupPath = path.push(groupUuid);
	    dispatch(addRule(config, groupPath));
	    dispatch(addRule(config, groupPath));
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {object} properties
	 */
	var addGroup = exports.addGroup = function addGroup(config, path, properties) {
	  return {
	    type: constants.ADD_NEW_GROUP,
	    path: path,
	    properties: (0, _defaultGroupProperties2.default)(config).merge(properties || {}),
	    config: config
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 */
	var removeGroupOld = exports.removeGroupOld = function removeGroupOld(config, path) {
	  return function (dispatch, getState) {
	    dispatch({
	      type: constants.REMOVE_GROUP,
	      path: path,
	      config: config
	    });

	    var _getState2 = getState();

	    var tree = _getState2.tree;

	    var parentPath = path.slice(0, -1);
	    if (!hasChildren(tree, parentPath)) {
	      dispatch(addRule(config, parentPath));
	    }
	  };
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 */
	var removeGroup = exports.removeGroup = function removeGroup(config, path) {
	  return {
	    type: constants.REMOVE_GROUP,
	    path: path,
	    config: config
	  };
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _temp;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _Item = __webpack_require__(50);

	var _Item2 = _interopRequireDefault(_Item);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Builder = (_temp = _class = function (_Component) {
	  _inherits(Builder, _Component);

	  function Builder() {
	    _classCallCheck(this, Builder);

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(Builder).apply(this, arguments));
	  }

	  _createClass(Builder, [{
	    key: 'render',
	    value: function render() {
	      var id = this.props.tree.get('id');

	      return _react2.default.createElement(_Item2.default, { key: id,
	        id: id,
	        path: _immutable2.default.List.of(id),
	        type: this.props.tree.get('type'),
	        properties: this.props.tree.get('properties'),
	        config: this.props.config,
	        actions: this.props.actions,
	        dispatch: this.props.dispatch,
	        children1: this.props.tree.get('children1') });
	    }
	  }]);

	  return Builder;
	}(_react.Component), _class.propTypes = {
	  tree: _react.PropTypes.instanceOf(_immutable2.default.Map).isRequired,
	  config: _react.PropTypes.object.isRequired
	}, _temp);
	exports.default = Builder;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _temp2;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Delta = (_temp2 = _class = function (_Component) {
	  _inherits(Delta, _Component);

	  function Delta() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    _classCallCheck(this, Delta);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Delta)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Delta, [{
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: 'widget--delta widget--delta-' + this.props.delta },
	        [_react2.default.createElement(
	          'div',
	          { key: 'widget', className: 'widget--widget' },
	          this.props.children[0]
	        ), this.props.children[1] ? _react2.default.createElement(
	          'div',
	          { key: 'options', className: 'widget--options' },
	          this.props.children[1]
	        ) : null]
	      );
	    }
	  }]);

	  return Delta;
	}(_react.Component), _class.propTypes = {
	  children: _react.PropTypes.arrayOf(_react.PropTypes.element).isRequired,
	  delta: _react.PropTypes.number.isRequired
	}, _temp2);
	exports.default = Delta;

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _class2, _temp2;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _map = __webpack_require__(12);

	var _map2 = _interopRequireDefault(_map);

	var _GroupContainer = __webpack_require__(56);

	var _GroupContainer2 = _interopRequireDefault(_GroupContainer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Group = (0, _GroupContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
	  _inherits(Group, _Component);

	  function Group() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    _classCallCheck(this, Group);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Group)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Group, [{
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: 'group' },
	        _react2.default.createElement(
	          'div',
	          { className: 'group--header' },
	          _react2.default.createElement(
	            'div',
	            { className: 'group--conjunctions' },
	            (0, _map2.default)(this.props.conjunctionOptions, function (item, index) {
	              return _react2.default.createElement(
	                'div',
	                { key: index, className: 'conjunction conjunction--' + index.toUpperCase(), 'data-state': item.checked ? 'active' : 'inactive' },
	                _react2.default.createElement(
	                  'label',
	                  { htmlFor: item.id },
	                  item.label
	                ),
	                _react2.default.createElement('input', { id: item.id, type: 'radio', name: item.name, value: index, checked: item.checked, onChange: item.setConjunction })
	              );
	            })
	          ),
	          _react2.default.createElement(
	            'div',
	            { className: 'group--actions' },
	            this.props.allowFurtherNesting ? _react2.default.createElement(
	              'button',
	              { className: 'action action--ADD-GROUP', onClick: this.props.addGroup },
	              'Add group'
	            ) : null,
	            _react2.default.createElement(
	              'button',
	              { className: 'action action--ADD-RULE', onClick: this.props.addRule },
	              'Add rule'
	            ),
	            this.props.allowRemoval ? _react2.default.createElement(
	              'button',
	              { className: 'action action--DELETE', onClick: this.props.removeSelf },
	              'Delete'
	            ) : null
	          )
	        ),
	        this.props.children ? _react2.default.createElement(
	          'div',
	          { className: 'group--children' },
	          this.props.children
	        ) : null
	      );
	    }
	  }]);

	  return Group;
	}(_react.Component), _class2.propTypes = {
	  conjunctionOptions: _react.PropTypes.object.isRequired,
	  addRule: _react.PropTypes.func.isRequired,
	  addGroup: _react.PropTypes.func.isRequired,
	  removeSelf: _react.PropTypes.func.isRequired,
	  allowFurtherNesting: _react.PropTypes.bool.isRequired,
	  allowRemoval: _react.PropTypes.bool.isRequired
	}, _temp2)) || _class;

	exports.default = Group;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _temp2;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _Rule = __webpack_require__(54);

	var _Rule2 = _interopRequireDefault(_Rule);

	var _Group = __webpack_require__(49);

	var _Group2 = _interopRequireDefault(_Group);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var typeMap = {
	  rule: function rule(props) {
	    return _react2.default.createElement(_Rule2.default, _extends({}, props.properties.toObject(), {
	      id: props.id,
	      path: props.path,
	      actions: props.actions,
	      config: props.config }));
	  },
	  group: function group(props) {
	    return _react2.default.createElement(
	      _Group2.default,
	      _extends({}, props.properties.toObject(), {
	        id: props.id,
	        path: props.path,
	        actions: props.actions,
	        config: props.config }),
	      props.children1 ? props.children1.map(function (item) {
	        return _react2.default.createElement(Item, {
	          key: item.get('id'),
	          id: item.get('id'),
	          path: props.path.push(item.get('id')),
	          type: item.get('type'),
	          properties: item.get('properties'),
	          config: props.config,
	          actions: props.actions,
	          children1: item.get('children1') });
	      }).toList() : null
	    );
	  }
	};

	var Item = (_temp2 = _class = function (_Component) {
	  _inherits(Item, _Component);

	  function Item() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    _classCallCheck(this, Item);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Item)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Item, [{
	    key: 'render',
	    value: function render() {
	      var _props = this.props;
	      var type = _props.type;

	      var props = _objectWithoutProperties(_props, ['type']);

	      return typeMap[type](props);
	    }
	  }]);

	  return Item;
	}(_react.Component), _class.propTypes = {
	  config: _react.PropTypes.object.isRequired,
	  id: _react.PropTypes.string.isRequired,
	  type: _react.PropTypes.oneOf(Object.keys(typeMap)).isRequired,
	  path: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
	  properties: _react.PropTypes.instanceOf(_immutable2.default.Map).isRequired,
	  children1: _react.PropTypes.instanceOf(_immutable2.default.OrderedMap)
	}, _temp2);
	exports.default = Item;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _class2, _temp2;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _OperatorContainer = __webpack_require__(57);

	var _OperatorContainer2 = _interopRequireDefault(_OperatorContainer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Operator = (0, _OperatorContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
	  _inherits(Operator, _Component);

	  function Operator() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    _classCallCheck(this, Operator);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Operator)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Operator, [{
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: 'rule--operator rule--operator--' + this.props.name.toUpperCase() },
	        this.props.children
	      );
	    }
	  }]);

	  return Operator;
	}(_react.Component), _class2.propTypes = {
	  name: _react.PropTypes.string.isRequired,
	  children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.element])
	}, _temp2)) || _class;

	exports.default = Operator;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _temp2;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _queryString = __webpack_require__(67);

	var _queryString2 = _interopRequireDefault(_queryString);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var stringify = __webpack_require__(11);

	var Preview = (_temp2 = _class = function (_Component) {
	  _inherits(Preview, _Component);

	  function Preview() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    _classCallCheck(this, Preview);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Preview)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Preview, [{
	    key: 'render',
	    value: function render() {
	      return this.props.children((0, _queryString2.default)(this.props.tree, this.props.config));
	    }
	  }]);

	  return Preview;
	}(_react.Component), _class.propTypes = {
	  config: _react.PropTypes.object.isRequired
	}, _temp2);
	exports.default = Preview;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _tree = __webpack_require__(64);

	var _tree2 = _interopRequireDefault(_tree);

	var _redux = __webpack_require__(39);

	var _reactRedux = __webpack_require__(106);

	var _bindActionCreators = __webpack_require__(65);

	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);

	var _actions = __webpack_require__(44);

	var actions = _interopRequireWildcard(_actions);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var stringify = __webpack_require__(11);

	var ConnectedQuery = function (_Component) {
	  _inherits(ConnectedQuery, _Component);

	  function ConnectedQuery() {
	    _classCallCheck(this, ConnectedQuery);

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(ConnectedQuery).apply(this, arguments));
	  }

	  _createClass(ConnectedQuery, [{
	    key: 'render',
	    value: function render() {
	      console.log("In ConnectedQuery:render. state=" + this.props.store.getState().toString() + " props=" + stringify(this.props));
	      console.log("get_children=" + stringify(this.props.get_children));
	      console.log("dispatch=" + stringify(this.props.dispatch));
	      var _props = this.props;
	      var config = _props.config;
	      var tree = _props.tree;
	      var get_children = _props.get_children;
	      var dispatch = _props.dispatch;

	      var props = _objectWithoutProperties(_props, ['config', 'tree', 'get_children', 'dispatch']);

	      return _react2.default.createElement(
	        'div',
	        null,
	        get_children({
	          tree: tree,
	          actions: (0, _bindActionCreators2.default)(_extends({}, actions.tree, actions.group, actions.rule), config, dispatch),
	          config: config,
	          dispatch: dispatch
	        })
	      );
	    }
	  }]);

	  return ConnectedQuery;
	}(_react.Component);

	var QueryContainer = (0, _reactRedux.connect)(function (tree) {
	  console.log("connect:State=" + tree.toString());return { tree: tree };
	})(
	/*                                (dispatch, props) => {
	                                    const { conjunctions, fields, operators, widgets, settings, children } = props;
	                                    const config = { conjunctions, fields, operators, widgets, settings };
	                                    return bindActionCreators({ ...actions.tree, ...actions.group, ...actions.rule }, config, dispatch);
	                                  },*/
	ConnectedQuery);

	var Query = function (_Component2) {
	  _inherits(Query, _Component2);

	  function Query(props, context) {
	    _classCallCheck(this, Query);

	    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Query).call(this, props, context));

	    var config = {
	      conjunctions: props.conjunctions,
	      fields: props.fields,
	      operators: props.operators,
	      widgets: props.widgets,
	      settings: props.settings
	    };

	    var tree = (0, _tree2.default)(config);

	    _this2.state = {
	      store: (0, _redux.createStore)(tree)
	    };
	    console.log("Query:constructor. state=" + stringify(_this2.state.store.getState()));
	    return _this2;
	  }

	  _createClass(Query, [{
	    key: 'render',
	    value: function render() {
	      var _props2 = this.props;
	      var conjunctions = _props2.conjunctions;
	      var fields = _props2.fields;
	      var operators = _props2.operators;
	      var widgets = _props2.widgets;
	      var settings = _props2.settings;
	      var children = _props2.children;
	      var get_children = _props2.get_children;

	      var props = _objectWithoutProperties(_props2, ['conjunctions', 'fields', 'operators', 'widgets', 'settings', 'children', 'get_children']);

	      var config = { conjunctions: conjunctions, fields: fields, operators: operators, widgets: widgets, settings: settings };

	      console.log("In Query:render. state=" + stringify(this.state.store.getState()) + " props=" + stringify(this.props));
	      console.log("children=" + stringify(this.props.children));
	      return _react2.default.createElement(
	        _reactRedux.Provider,
	        { store: this.state.store },
	        _react2.default.createElement(QueryContainer, { store: this.state.store, get_children: get_children, config: config })
	      );
	      return _react2.default.createElement(
	        _reactRedux.Provider,
	        { store: this.state.store },
	        function () {
	          return _react2.default.createElement(
	            _reactRedux.Connector,
	            { select: function select(_ref) {
	                var tree = _ref.tree;
	                return { tree: tree };
	              } },
	            function (_ref2) {
	              var tree = _ref2.tree;
	              var dispatch = _ref2.dispatch;

	              return children({
	                tree: tree,
	                actions: (0, _bindActionCreators2.default)(_extends({}, actions.tree, actions.group, actions.rule), config, dispatch),
	                config: config
	              });
	            }
	          );
	        }
	      );
	    }
	  }]);

	  return Query;
	}(_react.Component);

	exports.default = Query;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _class2, _temp2;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _map = __webpack_require__(12);

	var _map2 = _interopRequireDefault(_map);

	var _size = __webpack_require__(22);

	var _size2 = _interopRequireDefault(_size);

	var _RuleContainer = __webpack_require__(58);

	var _RuleContainer2 = _interopRequireDefault(_RuleContainer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Rule = (0, _RuleContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
	  _inherits(Rule, _Component);

	  function Rule() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    _classCallCheck(this, Rule);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Rule)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Rule, [{
	    key: 'handleFieldSelect',
	    value: function handleFieldSelect() {
	      /*    const node = React.findDOMNode(this.refs.field);
	          this.props.setField(node.value);*/
	    }
	  }, {
	    key: 'handleOperatorSelect',
	    value: function handleOperatorSelect() {
	      /*    const node = React.findDOMNode(this.refs.operator);
	          this.props.setOperator(node.value);*/
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2.default.createElement(
	        'div',
	        { className: 'rule' },
	        _react2.default.createElement(
	          'div',
	          { className: 'rule--header' },
	          _react2.default.createElement(
	            'div',
	            { className: 'rule--actions' },
	            _react2.default.createElement(
	              'button',
	              { className: 'action action--DELETE', onClick: this.props.removeSelf },
	              'Delete'
	            )
	          )
	        ),
	        _react2.default.createElement(
	          'div',
	          { className: 'rule--body' },
	          (0, _size2.default)(this.props.fieldOptions) ? _react2.default.createElement(
	            'div',
	            { key: 'field', className: 'rule--field' },
	            _react2.default.createElement(
	              'label',
	              null,
	              'Field'
	            ),
	            _react2.default.createElement(
	              'select',
	              { value: this.props.selectedField, onChange: this.handleFieldSelect.bind(this) },
	              (0, _map2.default)(this.props.fieldOptions, function (label, value) {
	                return _react2.default.createElement(
	                  'option',
	                  { key: value, value: value },
	                  label
	                );
	              })
	            )
	          ) : null,
	          (0, _size2.default)(this.props.operatorOptions) ? _react2.default.createElement(
	            'div',
	            { key: 'operator', className: 'rule--operator' },
	            _react2.default.createElement(
	              'label',
	              null,
	              'Operator'
	            ),
	            _react2.default.createElement(
	              'select',
	              { ref: 'operator', value: this.props.selectedOperator, onChange: this.handleOperatorSelect.bind(this) },
	              (0, _map2.default)(this.props.operatorOptions, function (label, value) {
	                return _react2.default.createElement(
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
	    }
	  }]);

	  return Rule;
	}(_react.Component), _class2.propTypes = {
	  fieldOptions: _react.PropTypes.object.isRequired,
	  operatorOptions: _react.PropTypes.object.isRequired,
	  setField: _react.PropTypes.func.isRequired,
	  setOperator: _react.PropTypes.func.isRequired,
	  removeSelf: _react.PropTypes.func.isRequired,
	  selectedField: _react.PropTypes.string,
	  selectedOperator: _react.PropTypes.string
	}, _temp2)) || _class;

	exports.default = Rule;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _class2, _temp2;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _WidgetContainer = __webpack_require__(59);

	var _WidgetContainer2 = _interopRequireDefault(_WidgetContainer);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Widget = (0, _WidgetContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
	  _inherits(Widget, _Component);

	  function Widget() {
	    var _Object$getPrototypeO;

	    var _temp, _this, _ret;

	    _classCallCheck(this, Widget);

	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Widget)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	  }

	  _createClass(Widget, [{
	    key: 'render',
	    value: function render() {
	      console.log("In Widget:render");
	      return _react2.default.createElement(
	        'div',
	        { className: 'rule--widget rule--widget--' + this.props.name.toUpperCase() },
	        this.props.children
	      );
	    }
	  }]);

	  return Widget;
	}(_react.Component), _class2.propTypes = {
	  name: _react.PropTypes.string.isRequired,
	  children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.element])
	}, _temp2)) || _class;

	exports.default = Widget;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _mapValues = __webpack_require__(20);

	var _mapValues2 = _interopRequireDefault(_mapValues);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var stringify = __webpack_require__(11);

	exports.default = function (Group) {
	  var _class, _temp2;

	  return _temp2 = _class = function (_Component) {
	    _inherits(GroupContainer, _Component);

	    function GroupContainer() {
	      var _Object$getPrototypeO;

	      var _temp, _this, _ret;

	      _classCallCheck(this, GroupContainer);

	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(GroupContainer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	    }

	    _createClass(GroupContainer, [{
	      key: 'setConjunction',
	      value: function setConjunction(conjunction) {
	        this.props.actions.setConjunction(this.props.path, conjunction);
	      }
	    }, {
	      key: 'removeSelf',
	      value: function removeSelf() {
	        this.props.actions.removeGroup(this.props.path);
	      }
	    }, {
	      key: 'addGroup',
	      value: function addGroup() {
	        console.log("In GroupContainer:addGroup. path=" + stringify(this.props.path) + " actions=" + stringify(this.props.actions));
	        this.props.actions.addGroup(this.props.path);
	      }
	    }, {
	      key: 'addRule',
	      value: function addRule() {
	        console.log("In GroupContainer:addRule. path=" + stringify(this.props.path) + " config=" + stringify(this.props.config));
	        this.props.actions.addRule(this.props.path);
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        var _this2 = this;

	        var currentNesting = this.props.path.size;
	        var maxNesting = this.props.config.settings.maxNesting;

	        // Don't allow nesting further than the maximum configured depth and don't
	        // allow removal of the root group.
	        var allowFurtherNesting = typeof maxNesting === 'undefined' || currentNesting < maxNesting;
	        var allowRemoval = currentNesting > 1;

	        var conjunctionOptions = (0, _mapValues2.default)(this.props.config.conjunctions, function (item, index) {
	          return {
	            id: 'conjunction-' + _this2.props.id + '-' + index,
	            name: 'conjunction[' + _this2.props.id + ']',
	            label: item.label,
	            checked: index === _this2.props.conjunction,
	            setConjunction: function setConjunction() {
	              return _this2.setConjunction.call(_this2, index);
	            }
	          };
	        });

	        return _react2.default.createElement(
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
	      }
	    }]);

	    return GroupContainer;
	  }(_react.Component), _class.propTypes = {
	    config: _react.PropTypes.object.isRequired
	  }, _temp2;
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	exports.default = function (Operator) {
	  var _class, _temp2;

	  return _temp2 = _class = function (_Component) {
	    _inherits(OperatorContainer, _Component);

	    function OperatorContainer() {
	      var _Object$getPrototypeO;

	      var _temp, _this, _ret;

	      _classCallCheck(this, OperatorContainer);

	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(OperatorContainer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	    }

	    _createClass(OperatorContainer, [{
	      key: 'setOperatorOption',
	      value: function setOperatorOption(name, value) {
	        this.props.actions.setOperatorOption(this.props.path, name, value);
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        var _this2 = this;

	        var operatorDefinitions = this.props.config.operators[this.props.operator];
	        if (typeof operatorDefinitions.options === 'undefined') {
	          return null;
	        }

	        var _operatorDefinitions$ = operatorDefinitions.options;
	        var optionsFactory = _operatorDefinitions$.factory;

	        var optionsProps = _objectWithoutProperties(_operatorDefinitions$, ['factory']);

	        return _react2.default.createElement(
	          Operator,
	          { name: this.props.operator },
	          optionsFactory(Object.assign({}, optionsProps, {
	            config: this.props.config,
	            field: this.props.field,
	            operator: this.props.operator,
	            options: this.props.options,
	            setOption: function setOption(name, value) {
	              return _this2.setOperatorOption.call(_this2, name, value);
	            }
	          }))
	        );
	      }
	    }]);

	    return OperatorContainer;
	  }(_react.Component), _class.propTypes = {
	    config: _react.PropTypes.object.isRequired,
	    path: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
	    options: _react.PropTypes.instanceOf(_immutable2.default.Map).isRequired,
	    field: _react.PropTypes.string.isRequired,
	    operator: _react.PropTypes.string.isRequired
	  }, _temp2;
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _size = __webpack_require__(22);

	var _size2 = _interopRequireDefault(_size);

	var _mapValues = __webpack_require__(20);

	var _mapValues2 = _interopRequireDefault(_mapValues);

	var _pick = __webpack_require__(101);

	var _pick2 = _interopRequireDefault(_pick);

	var _Widget = __webpack_require__(55);

	var _Widget2 = _interopRequireDefault(_Widget);

	var _Operator = __webpack_require__(51);

	var _Operator2 = _interopRequireDefault(_Operator);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	exports.default = function (Rule) {
	  var _class, _temp2;

	  return _temp2 = _class = function (_Component) {
	    _inherits(RuleContainer, _Component);

	    function RuleContainer() {
	      var _Object$getPrototypeO;

	      var _temp, _this, _ret;

	      _classCallCheck(this, RuleContainer);

	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(RuleContainer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	    }

	    _createClass(RuleContainer, [{
	      key: 'removeSelf',
	      value: function removeSelf() {
	        this.props.actions.removeRule(this.props.path);
	      }
	    }, {
	      key: 'setField',
	      value: function setField(field) {
	        this.props.actions.setField(this.props.path, field);
	      }
	    }, {
	      key: 'setOperator',
	      value: function setOperator(operator) {
	        this.props.actions.setOperator(this.props.path, operator);
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        var _this2 = this;

	        console.log("In Rule:render");
	        var _props$config = this.props.config;
	        var fields = _props$config.fields;
	        var operators = _props$config.operators;

	        var fieldOptions = (0, _mapValues2.default)(fields, function (item) {
	          return item.label;
	        });

	        // Add a special 'empty' option if no field has been selected yet.
	        if ((0, _size2.default)(fieldOptions) && typeof this.props.field === 'undefined') {
	          fieldOptions = Object.assign({}, { ':empty:': 'Select a field' }, fieldOptions);
	        }

	        var operatorOptions = (0, _mapValues2.default)((0, _pick2.default)(operators, function (item, index) {
	          return _this2.props.field && fields[_this2.props.field] && fields[_this2.props.field].operators.indexOf(index) !== -1;
	        }), function (item) {
	          return item.label;
	        });

	        // Add a special 'empty' option if no operator has been selected yet.
	        if ((0, _size2.default)(operatorOptions) && typeof this.props.operator === 'undefined') {
	          operatorOptions = Object.assign({}, { ':empty:': 'Select an operator' }, operatorOptions);
	        }

	        return _react2.default.createElement(
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
	          typeof this.props.field !== 'undefined' && typeof this.props.operator !== 'undefined' ? [_react2.default.createElement(_Operator2.default, {
	            key: 'options',
	            path: this.props.path,
	            field: this.props.field,
	            options: this.props.operatorOptions,
	            operator: this.props.operator,
	            actions: this.props.actions,
	            config: this.props.config }), _react2.default.createElement(_Widget2.default, {
	            key: 'values',
	            path: this.props.path,
	            field: this.props.field,
	            value: this.props.value,
	            options: this.props.valueOptions,
	            operator: this.props.operator,
	            actions: this.props.actions,
	            config: this.props.config })] : null
	        );
	      }
	    }]);

	    return RuleContainer;
	  }(_react.Component), _class.propTypes = {
	    config: _react.PropTypes.object.isRequired,
	    operator: _react.PropTypes.string,
	    field: _react.PropTypes.string
	  }, _temp2;
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _function = __webpack_require__(2);

	var _function2 = _interopRequireDefault(_function);

	var _range = __webpack_require__(36);

	var _range2 = _interopRequireDefault(_range);

	var _Delta = __webpack_require__(48);

	var _Delta2 = _interopRequireDefault(_Delta);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	exports.default = function (Widget) {
	  var _class, _temp2;

	  return _temp2 = _class = function (_Component) {
	    _inherits(WidgetContainer, _Component);

	    function WidgetContainer() {
	      var _Object$getPrototypeO;

	      var _temp, _this, _ret;

	      _classCallCheck(this, WidgetContainer);

	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(WidgetContainer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
	    }

	    _createClass(WidgetContainer, [{
	      key: 'setValue',
	      value: function setValue(delta, value) {
	        this.props.actions.setValue(this.props.path, delta, value);
	      }
	    }, {
	      key: 'setValueOption',
	      value: function setValueOption(delta, name, value) {
	        this.props.actions.setValueOption(this.props.path, delta, name, value);
	      }
	    }, {
	      key: 'renderOptions',
	      value: function renderOptions(delta) {
	        var _this2 = this;

	        var operatorDefinitions = this.props.config.operators[this.props.operator];
	        if (typeof operatorDefinitions.valueOptions === 'undefined') {
	          return null;
	        }

	        var _operatorDefinitions$ = operatorDefinitions.valueOptions;
	        var optionsFactory = _operatorDefinitions$.factory;

	        var optionsProps = _objectWithoutProperties(_operatorDefinitions$, ['factory']);

	        return optionsFactory(Object.assign({}, optionsProps, {
	          config: this.props.config,
	          field: this.props.field,
	          operator: this.props.operator,
	          delta: delta,
	          options: this.props.options.get(delta + '', new _immutable2.default.Map()),
	          setOption: function setOption(name, value) {
	            return _this2.setValueOption.call(_this2, delta, name, value);
	          }
	        }));
	      }
	    }, {
	      key: 'renderWidget',
	      value: function renderWidget(delta) {
	        var _this3 = this;

	        var fieldDefinition = this.props.config.fields[this.props.field];
	        var _props$config$widgets = this.props.config.widgets[fieldDefinition.widget];
	        var widgetFactory = _props$config$widgets.factory;

	        var widgetProps = _objectWithoutProperties(_props$config$widgets, ['factory']);

	        return widgetFactory(Object.assign({}, widgetProps, {
	          config: this.props.config,
	          field: this.props.field,
	          operator: this.props.operator,
	          delta: delta,
	          value: this.props.value.get(delta),
	          setValue: function setValue(value) {
	            return _this3.setValue.call(_this3, delta, value);
	          }
	        }));
	      }
	    }, {
	      key: 'render',
	      value: function render() {
	        var _this4 = this;

	        console.log("In Widget:render");
	        var fieldDefinition = this.props.config.fields[this.props.field];
	        var operatorDefinition = this.props.config.operators[this.props.operator];
	        if (typeof fieldDefinition === 'undefined' || typeof operatorDefinition === 'undefined') {
	          return null;
	        }

	        var widgetDefinition = this.props.config.widgets[fieldDefinition.widget];
	        if (typeof widgetDefinition === 'undefined') {
	          return null;
	        }

	        var cardinality = operatorDefinition.cardinality || 1;
	        if (cardinality === 0) {
	          return null;
	        }

	        if (typeof widgetBehavior === 'undefined') {
	          console.log("Going to render Widget");
	          return _react2.default.createElement(
	            Widget,
	            { name: fieldDefinition.widget },
	            (0, _range2.default)(0, cardinality).map(function (delta) {
	              return _react2.default.createElement(
	                _Delta2.default,
	                { key: delta, delta: delta },
	                _this4.renderWidget.call(_this4, delta),
	                _this4.renderOptions.call(_this4, delta)
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
	      }
	    }]);

	    return WidgetContainer;
	  }(_react.Component), _class.propTypes = {
	    config: _react.PropTypes.object.isRequired,
	    path: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
	    value: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
	    field: _react.PropTypes.string.isRequired,
	    operator: _react.PropTypes.string.isRequired
	  }, _temp2;
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _temp;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Date = (_temp = _class = function (_Component) {
	  _inherits(Date, _Component);

	  function Date() {
	    _classCallCheck(this, Date);

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(Date).apply(this, arguments));
	  }

	  _createClass(Date, [{
	    key: "handleChange",
	    value: function handleChange() {
	      var node = _react2.default.findDOMNode(this.refs.date);
	      this.props.setValue(node.value);
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return _react2.default.createElement("input", { autoFocus: this.props.delta === 0, type: "month", ref: "date", value: this.props.value, onChange: this.handleChange.bind(this) });
	    }
	  }]);

	  return Date;
	}(_react.Component), _class.propTypes = {
	  setValue: _react.PropTypes.func.isRequired,
	  delta: _react.PropTypes.number.isRequired
	}, _temp);
	exports.default = Date;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _temp;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _map = __webpack_require__(12);

	var _map2 = _interopRequireDefault(_map);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Select = (_temp = _class = function (_Component) {
	  _inherits(Select, _Component);

	  function Select() {
	    _classCallCheck(this, Select);

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(Select).apply(this, arguments));
	  }

	  _createClass(Select, [{
	    key: 'handleChange',
	    value: function handleChange() {
	      var node = _react2.default.findDOMNode(this.refs.select);
	      this.props.setValue(node.value);
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      var fieldDefinition = this.props.config.fields[this.props.field];
	      var options = (0, _map2.default)(fieldDefinition.options, function (label, value) {
	        return _react2.default.createElement(
	          'option',
	          { key: value, value: value },
	          label
	        );
	      });

	      return _react2.default.createElement(
	        'select',
	        { autoFocus: this.props.delta === 0, ref: 'select', value: this.props.value, onChange: this.handleChange.bind(this) },
	        options
	      );
	    }
	  }]);

	  return Select;
	}(_react.Component), _class.propTypes = {
	  setValue: _react.PropTypes.func.isRequired,
	  delta: _react.PropTypes.number.isRequired
	}, _temp);
	exports.default = Select;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _class, _temp;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = undefined;

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Text = (_temp = _class = function (_Component) {
	  _inherits(Text, _Component);

	  function Text() {
	    _classCallCheck(this, Text);

	    return _possibleConstructorReturn(this, Object.getPrototypeOf(Text).apply(this, arguments));
	  }

	  _createClass(Text, [{
	    key: "handleChange",
	    value: function handleChange() {
	      var node = _react2.default.findDOMNode(this.refs.text);
	      this.props.setValue(node.value);
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return _react2.default.createElement("input", { autoFocus: this.props.delta === 0, type: "text", ref: "text", value: this.props.value, onChange: this.handleChange.bind(this) });
	    }
	  }]);

	  return Text;
	}(_react.Component), _class.propTypes = {
	  setValue: _react.PropTypes.func.isRequired,
	  delta: _react.PropTypes.number.isRequired
	}, _temp);
	exports.default = Text;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _Date = __webpack_require__(60);

	Object.defineProperty(exports, 'DateWidget', {
	  enumerable: true,
	  get: function get() {
	    return _Date.default;
	  }
	});

	var _Select = __webpack_require__(61);

	Object.defineProperty(exports, 'SelectWidget', {
	  enumerable: true,
	  get: function get() {
	    return _Select.default;
	  }
	});

	var _Text = __webpack_require__(62);

	Object.defineProperty(exports, 'TextWidget', {
	  enumerable: true,
	  get: function get() {
	    return _Text.default;
	  }
	});

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _expandTreePath = __webpack_require__(21);

	var _expandTreePath2 = _interopRequireDefault(_expandTreePath);

	var _defaultRoot = __webpack_require__(66);

	var _defaultRoot2 = _interopRequireDefault(_defaultRoot);

	var _defaultRuleProperties = __webpack_require__(15);

	var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

	var _constants = __webpack_require__(10);

	var constants = _interopRequireWildcard(_constants);

	var _uuid = __webpack_require__(16);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _defaultGroupProperties = __webpack_require__(14);

	var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var stringify = __webpack_require__(11);

	var hasChildren = function hasChildren(tree, path) {
	  return tree.getIn((0, _expandTreePath2.default)(path, 'children1')).size > 0;
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {object} properties
	 */
	var addNewGroup = function addNewGroup(state, path, properties, config) {
	  console.log("Adding group");
	  var groupUuid = (0, _uuid2.default)();
	  state = addItem(state, path, 'group', groupUuid, (0, _defaultGroupProperties2.default)(config).merge(properties || {}));

	  var groupPath = path.push(groupUuid);
	  // If we don't set the empty map, then the following merge of addItem will create a Map rather than an OrderedMap for some reason
	  state = state.setIn((0, _expandTreePath2.default)(groupPath, 'children1'), new _immutable2.default.OrderedMap());
	  state = addItem(state, groupPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config).merge(properties || {}));
	  state = addItem(state, groupPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config).merge(properties || {}));
	  return state;
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 * @param {object} properties
	 */
	var removeGroup = function removeGroup(state, path, config) {
	  state = removeItem(state, path);

	  var parentPath = path.slice(0, -1);
	  if (!hasChildren(state, parentPath)) {
	    state = addItem(state, parentPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config));
	  }
	  return state;
	};

	/**
	 * @param {object} config
	 * @param {Immutable.List} path
	 */
	var removeRule = function removeRule(state, path, config) {
	  state = removeItem(state, path);

	  var parentPath = path.slice(0, -1);
	  if (!hasChildren(state, parentPath)) {
	    state = addItem(state, parentPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config));
	  }
	  return state;
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} conjunction
	 */
	var setConjunction = function setConjunction(state, path, conjunction) {
	  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'conjunction'), conjunction);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} type
	 * @param {string} id
	 * @param {Immutable.OrderedMap} properties
	 */
	var addItem = function addItem(state, path, type, id, properties) {
	  return state.mergeIn((0, _expandTreePath2.default)(path, 'children1'), new _immutable2.default.OrderedMap(_defineProperty({}, id, new _immutable2.default.Map({ type: type, id: id, properties: properties }))));
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 */
	var removeItem = function removeItem(state, path) {
	  return state.deleteIn((0, _expandTreePath2.default)(path));
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} field
	 */
	var setField = function setField(state, path, field, config) {
	  return state.updateIn((0, _expandTreePath2.default)(path, 'properties'), function (map) {
	    return map.withMutations(function (current) {
	      var currentField = current.get('field');
	      var currentOperator = current.get('operator');
	      var currentValue = current.get('value');

	      // If the newly selected field supports the same operator the rule currently
	      // uses, keep it selected.
	      var operator = config.fields[field].operators.indexOf(currentOperator) !== -1 ? currentOperator : (0, _defaultRuleProperties.defaultOperator)(config, field);

	      var operatorCardinality = config.operators[operator].cardinality || 1;

	      return current.set('field', field).set('operator', operator).set('operatorOptions', (0, _defaultRuleProperties.defaultOperatorOptions)(config, operator)).set('valueOptions', (0, _defaultRuleProperties.defaultValueOptions)(config, operator)).set('value', function (currentWidget, nextWidget) {
	        return currentWidget !== nextWidget ? new _immutable2.default.List() : new _immutable2.default.List(currentValue.take(operatorCardinality));
	      }(config.fields[currentField].widget, config.fields[field].widget));
	    });
	  });
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} operator
	 */
	var setOperator = function setOperator(state, path, operator, config) {
	  return state.updateIn((0, _expandTreePath2.default)(path, 'properties'), function (map) {
	    return map.withMutations(function (current) {
	      var operatorCardinality = config.operators[operator].cardinality || 1;
	      var currentValue = current.get('value', new _immutable2.default.List());
	      var nextValue = new _immutable2.default.List(currentValue.take(operatorCardinality));

	      return current.set('operator', operator).set('operatorOptions', (0, _defaultRuleProperties.defaultOperatorOptions)(config, operator)).set('valueOptions', (0, _defaultRuleProperties.defaultValueOptions)(config, operator)).set('value', nextValue);
	    });
	  });
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {integer} delta
	 * @param {*} value
	 */
	var setValue = function setValue(state, path, delta, value) {
	  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'value', delta + ''), value);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} name
	 * @param {*} value
	 */
	var setOperatorOption = function setOperatorOption(state, path, name, value) {
	  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'operatorOptions', name), value);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {Immutable.List} path
	 * @param {string} name
	 * @param {*} value
	 */
	var setValueOption = function setValueOption(state, path, delta, name, value) {
	  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'valueOptions', delta + '', name), value);
	};

	/**
	 * @param {Immutable.Map} state
	 * @param {object} action
	 */

	exports.default = function (config) {
	  return function () {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _defaultRoot2.default)(config) : arguments[0];
	    var action = arguments[1];

	    switch (action.type) {
	      case constants.SET_TREE:
	        return action.tree;

	      case constants.ADD_NEW_GROUP:
	        console.log("Adding New group");
	        return addNewGroup(state, action.path, action.properties, action.config);

	      case constants.ADD_GROUP:
	        console.log("Adding group");
	        return addItem(state, action.path, 'group', action.id, action.properties);

	      case constants.REMOVE_GROUP:
	        return removeGroup(state, action.path, action.config);
	      //      return removeItem(state, action.path);

	      case constants.ADD_RULE:
	        console.log("Adding rule");
	        return addItem(state, action.path, 'rule', action.id, action.properties);

	      case constants.REMOVE_RULE:
	        return removeRule(state, action.path, action.config);
	      //      return removeItem(state, action.path);

	      case constants.SET_CONJUNCTION:
	        return setConjunction(state, action.path, action.conjunction);

	      case constants.SET_FIELD:
	        return setField(state, action.path, action.field, action.config);

	      case constants.SET_OPERATOR:
	        return setOperator(state, action.path, action.operator, action.config);

	      case constants.SET_VALUE:
	        return setValue(state, action.path, action.delta, action.value);

	      case constants.SET_OPERATOR_OPTION:
	        return setOperatorOption(state, action.path, action.name, action.value);

	      case constants.SET_VALUE_OPTION:
	        return setValueOption(state, action.path, action.delta, action.name, action.value);

	      default:
	        console.log("Returning defaultRoot=" + state);
	        return state;
	    }
	  };
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _mapValues = __webpack_require__(20);

	var _mapValues2 = _interopRequireDefault(_mapValues);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (actionCreators, config, dispatch) {
	  return (0, _mapValues2.default)(actionCreators, function (actionCreator) {
	    return function () {
	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }

	      return dispatch(actionCreator.apply(undefined, [config].concat(args)));
	    };
	  });
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getChild = undefined;

	var _immutable = __webpack_require__(5);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _uuid = __webpack_require__(16);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _defaultRuleProperties = __webpack_require__(15);

	var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

	var _defaultGroupProperties = __webpack_require__(14);

	var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var getChild = exports.getChild = function getChild(id, config) {
	  return _defineProperty({}, id, new _immutable2.default.Map({
	    type: 'rule',
	    id: id,
	    properties: (0, _defaultRuleProperties2.default)(config)
	  }));
	};

	exports.default = function (config) {
	  return new _immutable2.default.Map({
	    type: 'group',
	    id: (0, _uuid2.default)(),
	    children1: new _immutable2.default.OrderedMap(_extends({}, getChild((0, _uuid2.default)(), config), getChild((0, _uuid2.default)(), config))),
	    properties: (0, _defaultGroupProperties2.default)(config)
	  });
	};

/***/ },
/* 67 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var queryStringRecursive = function queryStringRecursive(item, config) {
	  var type = item.get('type');
	  var properties = item.get('properties');
	  var children = item.get('children1');

	  if (type === 'rule') {
	    var _ret = function () {
	      if (typeof properties.get('field') === 'undefined' || typeof properties.get('operator') === 'undefined') {
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
	        return(
	          // Widgets can optionally define a value extraction function. This is useful in cases
	          // where an advanced widget is made up of multiple input fields that need to be composed
	          // when building the query string.
	          typeof widget.value === 'function' ? widget.value(currentValue, config) : currentValue
	        );
	      });

	      if (value.size < cardinality) {
	        return {
	          v: undefined
	        };
	      }

	      return {
	        v: operatorDefinition.value(value, field, options, valueOptions, operator, config)
	      };
	    }();

	    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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

	exports.default = queryStringRecursive;

/***/ },
/* 68 */
/***/ function(module, exports) {

	/**
	 * Copyright 2015, Yahoo! Inc.
	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
	 */
	'use strict';

	var REACT_STATICS = {
	    childContextTypes: true,
	    contextTypes: true,
	    defaultProps: true,
	    displayName: true,
	    getDefaultProps: true,
	    mixins: true,
	    propTypes: true,
	    type: true
	};

	var KNOWN_STATICS = {
	    name: true,
	    length: true,
	    prototype: true,
	    caller: true,
	    arguments: true,
	    arity: true
	};

	module.exports = function hoistNonReactStatics(targetComponent, sourceComponent) {
	    var keys = Object.getOwnPropertyNames(sourceComponent);
	    for (var i=0; i<keys.length; ++i) {
	        if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]]) {
	            targetComponent[keys[i]] = sourceComponent[keys[i]];
	        }
	    }

	    return targetComponent;
	};


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
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
	        format.replace(/%s/g, function() { return args[argIndex++]; })
	      );
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;


/***/ },
/* 70 */
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
/* 71 */
/***/ function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;

	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
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
/* 72 */
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
/* 73 */
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
/* 74 */
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
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(25),
	    createBaseEach = __webpack_require__(86);

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
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var arrayPush = __webpack_require__(73),
	    isArguments = __webpack_require__(19),
	    isArray = __webpack_require__(4),
	    isArrayLike = __webpack_require__(9),
	    isObjectLike = __webpack_require__(8);

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
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(24),
	    keysIn = __webpack_require__(34);

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
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	var equalArrays = __webpack_require__(89),
	    equalByTag = __webpack_require__(90),
	    equalObjects = __webpack_require__(91),
	    isArray = __webpack_require__(4),
	    isTypedArray = __webpack_require__(99);

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
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(27),
	    toObject = __webpack_require__(3);

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
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(75),
	    isArrayLike = __webpack_require__(9);

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
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(79),
	    getMatchData = __webpack_require__(92),
	    toObject = __webpack_require__(3);

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
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(26),
	    baseIsEqual = __webpack_require__(27),
	    baseSlice = __webpack_require__(84),
	    isArray = __webpack_require__(4),
	    isKey = __webpack_require__(31),
	    isStrictComparable = __webpack_require__(32),
	    last = __webpack_require__(70),
	    toObject = __webpack_require__(3),
	    toPath = __webpack_require__(33);

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
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(26),
	    toPath = __webpack_require__(33);

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
/* 84 */
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
/* 85 */
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
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(17),
	    isLength = __webpack_require__(6),
	    toObject = __webpack_require__(3);

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
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(3);

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
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	var baseCallback = __webpack_require__(23),
	    baseForOwn = __webpack_require__(25);

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
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var arraySome = __webpack_require__(74);

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
/* 90 */
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
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(13);

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
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(32),
	    pairs = __webpack_require__(100);

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
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(9),
	    isIndex = __webpack_require__(18),
	    isObject = __webpack_require__(7);

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
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(3);

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
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var baseForIn = __webpack_require__(77);

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
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(19),
	    isArray = __webpack_require__(4),
	    isIndex = __webpack_require__(18),
	    isLength = __webpack_require__(6),
	    keysIn = __webpack_require__(34);

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
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(7);

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
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}

	module.exports = isFunction;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(97),
	    isObjectLike = __webpack_require__(8);

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
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(6),
	    isObjectLike = __webpack_require__(8);

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
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(13),
	    toObject = __webpack_require__(3);

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
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var baseFlatten = __webpack_require__(76),
	    bindCallback = __webpack_require__(29),
	    pickByArray = __webpack_require__(94),
	    pickByCallback = __webpack_require__(95),
	    restParam = __webpack_require__(71);

	/**
	 * Creates an object composed of the picked `object` properties. Property
	 * names may be specified as individual arguments or as arrays of property
	 * names. If `predicate` is provided it's invoked for each property of `object`
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
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(28),
	    basePropertyDeep = __webpack_require__(83),
	    isKey = __webpack_require__(31);

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
/* 103 */
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
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _require = __webpack_require__(1);

	var Component = _require.Component;
	var PropTypes = _require.PropTypes;
	var Children = _require.Children;

	var storeShape = __webpack_require__(37);

	var didWarnAboutReceivingStore = false;
	function warnAboutReceivingStore() {
	  if (didWarnAboutReceivingStore) {
	    return;
	  }

	  didWarnAboutReceivingStore = true;
	  console.error( // eslint-disable-line no-console
	  '<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/rackt/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
	}

	var Provider = (function (_Component) {
	  _inherits(Provider, _Component);

	  Provider.prototype.getChildContext = function getChildContext() {
	    return { store: this.store };
	  };

	  function Provider(props, context) {
	    _classCallCheck(this, Provider);

	    var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

	    _this.store = props.store;
	    return _this;
	  }

	  Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	    var store = this.store;
	    var nextStore = nextProps.store;

	    if (store !== nextStore) {
	      warnAboutReceivingStore();
	    }
	  };

	  Provider.prototype.render = function render() {
	    var children = this.props.children;

	    return Children.only(children);
	  };

	  return Provider;
	})(Component);

	Provider.propTypes = {
	  store: storeShape.isRequired,
	  children: PropTypes.element.isRequired
	};
	Provider.childContextTypes = {
	  store: storeShape.isRequired
	};

	module.exports = Provider;

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _require = __webpack_require__(1);

	var Component = _require.Component;
	var createElement = _require.createElement;

	var storeShape = __webpack_require__(37);
	var shallowEqual = __webpack_require__(108);
	var isPlainObject = __webpack_require__(107);
	var wrapActionCreators = __webpack_require__(109);
	var hoistStatics = __webpack_require__(68);
	var invariant = __webpack_require__(69);

	var defaultMapStateToProps = function defaultMapStateToProps(state) {
	  return {};
	}; // eslint-disable-line no-unused-vars
	var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
	  return { dispatch: dispatch };
	};
	var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
	  return _extends({}, parentProps, stateProps, dispatchProps);
	};

	function getDisplayName(WrappedComponent) {
	  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
	}

	// Helps track hot reloading.
	var nextVersion = 0;

	function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
	  var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	  var shouldSubscribe = Boolean(mapStateToProps);
	  var finalMapStateToProps = mapStateToProps || defaultMapStateToProps;
	  var finalMapDispatchToProps = isPlainObject(mapDispatchToProps) ? wrapActionCreators(mapDispatchToProps) : mapDispatchToProps || defaultMapDispatchToProps;
	  var finalMergeProps = mergeProps || defaultMergeProps;
	  var doStatePropsDependOnOwnProps = finalMapStateToProps.length !== 1;
	  var doDispatchPropsDependOnOwnProps = finalMapDispatchToProps.length !== 1;
	  var _options$pure = options.pure;
	  var pure = _options$pure === undefined ? true : _options$pure;
	  var _options$withRef = options.withRef;
	  var withRef = _options$withRef === undefined ? false : _options$withRef;

	  // Helps track hot reloading.

	  var version = nextVersion++;

	  function computeStateProps(store, props) {
	    var state = store.getState();
	    var stateProps = doStatePropsDependOnOwnProps ? finalMapStateToProps(state, props) : finalMapStateToProps(state);

	    invariant(isPlainObject(stateProps), '`mapStateToProps` must return an object. Instead received %s.', stateProps);
	    return stateProps;
	  }

	  function computeDispatchProps(store, props) {
	    var dispatch = store.dispatch;

	    var dispatchProps = doDispatchPropsDependOnOwnProps ? finalMapDispatchToProps(dispatch, props) : finalMapDispatchToProps(dispatch);

	    invariant(isPlainObject(dispatchProps), '`mapDispatchToProps` must return an object. Instead received %s.', dispatchProps);
	    return dispatchProps;
	  }

	  function computeMergedProps(stateProps, dispatchProps, parentProps) {
	    var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
	    invariant(isPlainObject(mergedProps), '`mergeProps` must return an object. Instead received %s.', mergedProps);
	    return mergedProps;
	  }

	  return function wrapWithConnect(WrappedComponent) {
	    var Connect = (function (_Component) {
	      _inherits(Connect, _Component);

	      Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
	        return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
	      };

	      function Connect(props, context) {
	        _classCallCheck(this, Connect);

	        var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

	        _this.version = version;
	        _this.store = props.store || context.store;

	        invariant(_this.store, 'Could not find "store" in either the context or ' + ('props of "' + _this.constructor.displayName + '". ') + 'Either wrap the root component in a <Provider>, ' + ('or explicitly pass "store" as a prop to "' + _this.constructor.displayName + '".'));

	        var storeState = _this.store.getState();
	        _this.state = { storeState: storeState };
	        _this.clearCache();
	        return _this;
	      }

	      Connect.prototype.updateStatePropsIfNeeded = function updateStatePropsIfNeeded() {
	        var nextStateProps = computeStateProps(this.store, this.props);
	        if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
	          return false;
	        }

	        this.stateProps = nextStateProps;
	        return true;
	      };

	      Connect.prototype.updateDispatchPropsIfNeeded = function updateDispatchPropsIfNeeded() {
	        var nextDispatchProps = computeDispatchProps(this.store, this.props);
	        if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
	          return false;
	        }

	        this.dispatchProps = nextDispatchProps;
	        return true;
	      };

	      Connect.prototype.updateMergedProps = function updateMergedProps() {
	        this.mergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);
	      };

	      Connect.prototype.isSubscribed = function isSubscribed() {
	        return typeof this.unsubscribe === 'function';
	      };

	      Connect.prototype.trySubscribe = function trySubscribe() {
	        if (shouldSubscribe && !this.unsubscribe) {
	          this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
	          this.handleChange();
	        }
	      };

	      Connect.prototype.tryUnsubscribe = function tryUnsubscribe() {
	        if (this.unsubscribe) {
	          this.unsubscribe();
	          this.unsubscribe = null;
	        }
	      };

	      Connect.prototype.componentDidMount = function componentDidMount() {
	        this.trySubscribe();
	      };

	      Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	        if (!pure || !shallowEqual(nextProps, this.props)) {
	          this.haveOwnPropsChanged = true;
	        }
	      };

	      Connect.prototype.componentWillUnmount = function componentWillUnmount() {
	        this.tryUnsubscribe();
	        this.clearCache();
	      };

	      Connect.prototype.clearCache = function clearCache() {
	        this.dispatchProps = null;
	        this.stateProps = null;
	        this.mergedProps = null;
	        this.haveOwnPropsChanged = true;
	        this.hasStoreStateChanged = true;
	        this.renderedElement = null;
	      };

	      Connect.prototype.handleChange = function handleChange() {
	        if (!this.unsubscribe) {
	          return;
	        }

	        var prevStoreState = this.state.storeState;
	        var storeState = this.store.getState();

	        if (!pure || prevStoreState !== storeState) {
	          this.hasStoreStateChanged = true;
	          this.setState({ storeState: storeState });
	        }
	      };

	      Connect.prototype.getWrappedInstance = function getWrappedInstance() {
	        invariant(withRef, 'To access the wrapped instance, you need to specify ' + '{ withRef: true } as the fourth argument of the connect() call.');

	        return this.refs.wrappedInstance;
	      };

	      Connect.prototype.render = function render() {
	        var haveOwnPropsChanged = this.haveOwnPropsChanged;
	        var hasStoreStateChanged = this.hasStoreStateChanged;
	        var renderedElement = this.renderedElement;

	        this.haveOwnPropsChanged = false;
	        this.hasStoreStateChanged = false;

	        var shouldUpdateStateProps = true;
	        var shouldUpdateDispatchProps = true;
	        if (pure && renderedElement) {
	          shouldUpdateStateProps = hasStoreStateChanged || haveOwnPropsChanged && doStatePropsDependOnOwnProps;
	          shouldUpdateDispatchProps = haveOwnPropsChanged && doDispatchPropsDependOnOwnProps;
	        }

	        var haveStatePropsChanged = false;
	        var haveDispatchPropsChanged = false;
	        if (shouldUpdateStateProps) {
	          haveStatePropsChanged = this.updateStatePropsIfNeeded();
	        }
	        if (shouldUpdateDispatchProps) {
	          haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
	        }

	        var haveMergedPropsChanged = true;
	        if (haveStatePropsChanged || haveDispatchPropsChanged || haveOwnPropsChanged) {
	          this.updateMergedProps();
	        } else {
	          haveMergedPropsChanged = false;
	        }

	        if (!haveMergedPropsChanged && renderedElement) {
	          return renderedElement;
	        }

	        if (withRef) {
	          this.renderedElement = createElement(WrappedComponent, _extends({}, this.mergedProps, {
	            ref: 'wrappedInstance'
	          }));
	        } else {
	          this.renderedElement = createElement(WrappedComponent, this.mergedProps);
	        }

	        return this.renderedElement;
	      };

	      return Connect;
	    })(Component);

	    Connect.displayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';
	    Connect.WrappedComponent = WrappedComponent;
	    Connect.contextTypes = {
	      store: storeShape
	    };
	    Connect.propTypes = {
	      store: storeShape
	    };

	    if (false) {
	      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
	        if (this.version === version) {
	          return;
	        }

	        // We are hot reloading!
	        this.version = version;
	        this.trySubscribe();
	        this.clearCache();
	      };
	    }

	    return hoistStatics(Connect, WrappedComponent);
	  };
	}

	module.exports = connect;

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Provider = __webpack_require__(104);
	var connect = __webpack_require__(105);

	module.exports = { Provider: Provider, connect: connect };

/***/ },
/* 107 */
/***/ function(module, exports) {

	'use strict';

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	var fnToString = function fnToString(fn) {
	  return Function.prototype.toString.call(fn);
	};

	/**
	 * @param {any} obj The object to inspect.
	 * @returns {boolean} True if the argument appears to be a plain object.
	 */
	function isPlainObject(obj) {
	  if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
	    return false;
	  }

	  var proto = typeof obj.constructor === 'function' ? Object.getPrototypeOf(obj) : Object.prototype;

	  if (proto === null) {
	    return true;
	  }

	  var constructor = proto.constructor;

	  return typeof constructor === 'function' && constructor instanceof constructor && fnToString(constructor) === fnToString(Object);
	}

	module.exports = isPlainObject;

/***/ },
/* 108 */
/***/ function(module, exports) {

	"use strict";

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

	module.exports = shallowEqual;

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _redux = __webpack_require__(39);

	function wrapActionCreators(actionCreators) {
	  return function (dispatch) {
	    return (0, _redux.bindActionCreators)(actionCreators, dispatch);
	  };
	}

	module.exports = wrapActionCreators;

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	exports['default'] = applyMiddleware;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _compose = __webpack_require__(40);

	var _compose2 = _interopRequireDefault(_compose);

	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */

	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }

	  return function (next) {
	    return function (reducer, initialState) {
	      var store = next(reducer, initialState);
	      var _dispatch = store.dispatch;
	      var chain = [];

	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);

	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = bindActionCreators;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _mapValues = __webpack_require__(42);

	var _mapValues2 = _interopRequireDefault(_mapValues);

	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}

	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */

	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }

	  if (typeof actionCreators !== 'object' || actionCreators === null || actionCreators === undefined) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }

	  return _mapValues2['default'](actionCreators, function (actionCreator) {
	    return bindActionCreator(actionCreator, dispatch);
	  });
	}

	module.exports = exports['default'];

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = combineReducers;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _createStore = __webpack_require__(38);

	var _isPlainObject = __webpack_require__(41);

	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

	var _mapValues = __webpack_require__(42);

	var _mapValues2 = _interopRequireDefault(_mapValues);

	var _pick = __webpack_require__(113);

	var _pick2 = _interopRequireDefault(_pick);

	/* eslint-disable no-console */

	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

	  return 'Reducer "' + key + '" returned undefined handling ' + actionName + '. ' + 'To ignore an action, you must explicitly return the previous state.';
	}

	function getUnexpectedStateKeyWarningMessage(inputState, outputState, action) {
	  var reducerKeys = Object.keys(outputState);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'initialState argument passed to createStore' : 'previous state received by the reducer';

	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }

	  if (!_isPlainObject2['default'](inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }

	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return reducerKeys.indexOf(key) < 0;
	  });

	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}

	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });

	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }

	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}

	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */

	function combineReducers(reducers) {
	  var finalReducers = _pick2['default'](reducers, function (val) {
	    return typeof val === 'function';
	  });
	  var sanityError;

	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }

	  var defaultState = _mapValues2['default'](finalReducers, function () {
	    return undefined;
	  });

	  return function combination(state, action) {
	    if (state === undefined) state = defaultState;

	    if (sanityError) {
	      throw sanityError;
	    }

	    var hasChanged = false;
	    var finalState = _mapValues2['default'](finalReducers, function (reducer, key) {
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	      return nextStateForKey;
	    });

	    if (false) {
	      var warningMessage = getUnexpectedStateKeyWarningMessage(state, finalState, action);
	      if (warningMessage) {
	        console.error(warningMessage);
	      }
	    }

	    return hasChanged ? finalState : state;
	  };
	}

	module.exports = exports['default'];

/***/ },
/* 113 */
/***/ function(module, exports) {

	/**
	 * Picks key-value pairs from an object where values satisfy a predicate.
	 *
	 * @param {Object} obj The object to pick from.
	 * @param {Function} fn The predicate the values must satisfy to be copied.
	 * @returns {Object} The object with the values that satisfied the predicate.
	 */
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

/***/ }
/******/ ])
});
;