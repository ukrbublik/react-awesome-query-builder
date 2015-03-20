(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("immutable"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "immutable"], factory);
	else if(typeof exports === 'object')
		exports["ReactQueryBuilder"] = factory(require("react"), require("immutable"));
	else
		root["ReactQueryBuilder"] = factory(root["React"], root["Immutable"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_12__) {
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

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var Builder = _interopRequire(__webpack_require__(1));

	var TextWidget = _interopRequire(__webpack_require__(2));

	var SelectWidget = _interopRequire(__webpack_require__(3));

	var TreeStore = _interopRequire(__webpack_require__(4));

	var Dispatcher = _interopRequire(__webpack_require__(5));

	var GroupConstants = _interopRequire(__webpack_require__(6));

	var RuleConstants = _interopRequire(__webpack_require__(7));

	var GroupActions = _interopRequire(__webpack_require__(8));

	var RuleActions = _interopRequire(__webpack_require__(9));

	var getQueryString = _interopRequire(__webpack_require__(10));

	module.exports = {
	  Builder: Builder,
	  TreeStore: TreeStore,
	  Dispatcher: Dispatcher,
	  GroupConstants: GroupConstants,
	  RuleConstants: RuleConstants,
	  GroupActions: GroupActions,
	  RuleActions: RuleActions,
	  TextWidget: TextWidget,
	  SelectWidget: SelectWidget,
	  getQueryString: getQueryString
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = _interopRequire(__webpack_require__(11));

	var Immutable = _interopRequire(__webpack_require__(12));

	var Item = _interopRequire(__webpack_require__(13));

	var TreeStore = _interopRequire(__webpack_require__(4));

	var Builder = (function (_React$Component) {
	  function Builder(props) {
	    _classCallCheck(this, Builder);

	    _get(Object.getPrototypeOf(Builder.prototype), "constructor", this).call(this, props);

	    this.state = {
	      tree: TreeStore.getTree()
	    };
	  }

	  _inherits(Builder, _React$Component);

	  _createClass(Builder, {
	    componentDidMount: {
	      value: function componentDidMount() {
	        TreeStore.addChangeListener(this.handleChange.bind(this));
	      }
	    },
	    componentWillUnmount: {
	      value: function componentWillUnmount() {
	        TreeStore.removeChangeListener(this.handleChange.bind(this));
	      }
	    },
	    handleChange: {
	      value: function handleChange() {
	        this.setState({
	          tree: TreeStore.getTree()
	        });
	      }
	    },
	    render: {
	      value: function render() {
	        if (!this.state.tree) {
	          return null;
	        }

	        var props = {
	          id: this.state.tree.get("id"),
	          children: this.state.tree.get("children"),
	          ancestors: new Immutable.List(),
	          type: this.state.tree.get("type"),
	          properties: this.state.tree.get("properties"),
	          config: this.props.config
	        };

	        return React.createElement(
	          "div",
	          { className: "query-builder" },
	          React.createElement(Item, _extends({ key: props.id }, props))
	        );
	      }
	    }
	  });

	  return Builder;
	})(React.Component);

	Builder.propTypes = {
	  config: React.PropTypes.object.isRequired
	};

	module.exports = Builder;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = _interopRequire(__webpack_require__(11));

	var Text = (function (_React$Component) {
	  function Text() {
	    _classCallCheck(this, Text);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Text, _React$Component);

	  _createClass(Text, {
	    handleChange: {
	      value: function handleChange() {
	        var node = React.findDOMNode(this.refs.text);
	        this.props.setValue(node.value);
	      }
	    },
	    render: {
	      value: function render() {
	        return React.createElement("input", { type: "textfield", ref: "text", value: this.props.value, onChange: this.handleChange.bind(this) });
	      }
	    }
	  });

	  return Text;
	})(React.Component);

	module.exports = Text;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = _interopRequire(__webpack_require__(11));

	var map = _interopRequire(__webpack_require__(19));

	var Text = (function (_React$Component) {
	  function Text() {
	    _classCallCheck(this, Text);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Text, _React$Component);

	  _createClass(Text, {
	    handleChange: {
	      value: function handleChange() {
	        var node = React.findDOMNode(this.refs.select);
	        this.props.setValue(node.value);
	      }
	    },
	    render: {
	      value: function render() {
	        var options = map(this.props.field.options, function (label, value) {
	          return React.createElement(
	            "option",
	            { key: value, value: value },
	            label
	          );
	        });

	        return React.createElement(
	          "select",
	          { ref: "select", value: this.props.value, onChange: this.handleChange.bind(this) },
	          options
	        );
	      }
	    }
	  });

	  return Text;
	})(React.Component);

	module.exports = Text;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

	var EventEmitter = __webpack_require__(14).EventEmitter;

	var Immutable = _interopRequire(__webpack_require__(12));

	var Dispatcher = _interopRequire(__webpack_require__(5));

	var GroupConstants = _interopRequire(__webpack_require__(6));

	var RuleConstants = _interopRequire(__webpack_require__(7));

	var assign = _interopRequire(__webpack_require__(16));

	var uuid = function uuid() {
	  // Generate a random GUID http://stackoverflow.com/a/2117523.
	  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0,
	        v = c == "x" ? r : r & 3 | 8;
	    return v.toString(16);
	  });
	};

	var rules = Immutable.Map({
	  type: "group",
	  id: uuid(),
	  children: new Immutable.OrderedMap(),
	  properties: Immutable.Map({
	    conjunction: "and"
	  })
	});

	/**
	 * @param {string} id
	 * @param {Immutable.List} path
	 */
	var findItemInTree = (function (_findItemInTree) {
	  var _findItemInTreeWrapper = function findItemInTree(_x, _x2) {
	    return _findItemInTree.apply(this, arguments);
	  };

	  _findItemInTreeWrapper.toString = function () {
	    return _findItemInTree.toString();
	  };

	  return _findItemInTreeWrapper;
	})(function (id, path) {
	  var _this = this;

	  path = path || new Immutable.List();
	  if (rules.getIn(path.push("id")) == id) {
	    return path;
	  }

	  if (rules.hasIn(path, "children")) {
	    path = path.push("children");
	    var children = rules.getIn(path);

	    if (children && children.size) {
	      var _ret = (function () {
	        var result = undefined;
	        children.forEach(function (item, key) {
	          result = findItemInTree(id, path.push(key));
	          return typeof result === "undefined";
	        }, _this);

	        return {
	          v: result
	        };
	      })();

	      if (typeof _ret === "object") return _ret.v;
	    }
	  }

	  return undefined;
	});

	/**
	 * @param {Immutable.List} path
	 * @param {...string} suffix
	 */
	var expandTreePath = function expandTreePath(path, suffix) {
	  var _arguments = arguments;

	  return path.interpose("children").withMutations(function (list) {
	    list.skip(1);
	    list.push.apply(list, Array.prototype.slice.call(_arguments, 1));
	    return list;
	  });
	};

	/**
	 * @param {Immutable.List} path
	 * @param {string} conjunction
	 */
	var setConjunction = function setConjunction(path, conjunction) {
	  rules = rules.setIn(expandTreePath(path, "properties", "conjunction"), conjunction);
	};

	/**
	 * @param {Immutable.List} path
	 * @param {Immutable.Map} item
	 */
	var addItem = function addItem(path, item) {
	  rules = rules.mergeIn(expandTreePath(path, "children"), new Immutable.OrderedMap(_defineProperty({}, item.get("id"), item)));
	};

	/**
	 * @param {Immutable.List} path
	 */
	var removeItem = function removeItem(path) {
	  rules = rules.deleteIn(expandTreePath(path));
	};

	/**
	 * @param {Immutable.List} path
	 * @param {string} field
	 */
	var setField = function setField(path, field) {
	  rules = rules.deleteIn(expandTreePath(path, "properties", "operator")).setIn(expandTreePath(path, "properties", "field"), field).setIn(expandTreePath(path, "properties", "options"), new Immutable.Map()).setIn(expandTreePath(path, "properties", "value"), new Immutable.List());
	};

	/**
	 * @param {Immutable.List} path
	 * @param {string} operator
	 */
	var setOperator = function setOperator(path, operator) {
	  rules = rules.setIn(expandTreePath(path, "properties", "operator"), operator).setIn(expandTreePath(path, "properties", "options"), new Immutable.Map()).setIn(expandTreePath(path, "properties", "value"), new Immutable.List());
	};

	/**
	 * @param {Immutable.List} path
	 * @param {integer} delta
	 * @param {*} value
	 */
	var setFilterDeltaValue = function setFilterDeltaValue(path, delta, value) {
	  rules = rules.setIn(expandTreePath(path, "properties", "value", delta + ""), value);
	};

	/**
	 * @param {Immutable.List} path
	 * @param {string} name
	 * @param {*} value
	 */
	var setOperatorOption = function setOperatorOption(path, name, value) {
	  rules = rules.setIn(expandTreePath(path, "properties", "options", name), value);
	};

	var TreeStore = assign({}, EventEmitter.prototype, {
	  getTree: function getTree() {
	    return rules;
	  },

	  /**
	   * @param {function} callback
	   */
	  addChangeListener: function addChangeListener(callback) {
	    this.on("change", callback);
	  },

	  /**
	   * @param {function} callback
	   */
	  removeChangeListener: function removeChangeListener(callback) {
	    this.removeListener("change", callback);
	  }
	});

	Dispatcher.register(function (action) {
	  switch (action.actionType) {
	    case GroupConstants.SET_CONJUNCTION:
	      setConjunction(action.path, action.conjunction);
	      TreeStore.emit("change");
	      break;

	    case GroupConstants.ADD_GROUP:
	      addItem(action.path, Immutable.Map({
	        type: "group",
	        id: uuid(),
	        properties: Immutable.Map(action.group)
	      }));

	      TreeStore.emit("change");
	      break;

	    case GroupConstants.REMOVE_GROUP:
	      removeItem(action.path);
	      TreeStore.emit("change");
	      break;

	    case RuleConstants.ADD_RULE:
	      addItem(action.path, Immutable.Map({
	        type: "rule",
	        id: uuid(),
	        properties: Immutable.Map(action.rule)
	      }));

	      TreeStore.emit("change");
	      break;

	    case RuleConstants.REMOVE_RULE:
	      removeItem(action.path);
	      TreeStore.emit("change");
	      break;

	    case RuleConstants.SET_FIELD:
	      setField(action.path, action.field);
	      TreeStore.emit("change");
	      break;

	    case RuleConstants.SET_OPERATOR:
	      setOperator(action.path, action.operator);
	      TreeStore.emit("change");
	      break;

	    case RuleConstants.SET_DELTA_VALUE:
	      setFilterDeltaValue(action.path, action.delta, action.value);
	      TreeStore.emit("change");
	      break;

	    case RuleConstants.SET_OPTION:
	      setOperatorOption(action.path, action.name, action.value);
	      TreeStore.emit("change");
	      break;
	  }
	});

	module.exports = TreeStore;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var Dispatcher = __webpack_require__(15).Dispatcher;

	module.exports = new Dispatcher();

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var keyMirror = _interopRequire(__webpack_require__(20));

	module.exports = keyMirror({
	  ADD_GROUP: null,
	  REMOVE_GROUP: null,
	  SET_CONJUNCTION: null
	});

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var keyMirror = _interopRequire(__webpack_require__(20));

	module.exports = keyMirror({
	  ADD_RULE: null,
	  REMOVE_RULE: null,
	  SET_FIELD: null,
	  SET_OPERATOR: null,
	  SET_OPTION: null,
	  SET_DELTA_VALUE: null
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var React = _interopRequire(__webpack_require__(11));

	var Dispatcher = _interopRequire(__webpack_require__(5));

	var GroupConstants = _interopRequire(__webpack_require__(6));

	var Immutable = _interopRequire(__webpack_require__(12));

	module.exports = {

	  /**
	   * @param {Immutable.List} path
	   * @param {object} properties
	   * @param {object} config
	   */
	  addGroup: function addGroup(path, properties, config) {
	    Dispatcher.dispatch({
	      actionType: GroupConstants.ADD_GROUP,
	      path: path,
	      group: properties
	    });
	  },

	  /**
	   * @param {Immutable.List} path
	   */
	  removeGroup: function removeGroup(path) {
	    Dispatcher.dispatch({
	      actionType: GroupConstants.REMOVE_GROUP,
	      path: path
	    });
	  },

	  /**
	   * @param {Immutable.List} path
	   * @param {string} conjunction
	   */
	  setConjunction: function setConjunction(path, conjunction) {
	    Dispatcher.dispatch({
	      actionType: GroupConstants.SET_CONJUNCTION,
	      path: path,
	      conjunction: conjunction
	    });
	  }

	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var React = _interopRequire(__webpack_require__(11));

	var Dispatcher = _interopRequire(__webpack_require__(5));

	var RuleConstants = _interopRequire(__webpack_require__(7));

	var Immutable = _interopRequire(__webpack_require__(12));

	module.exports = {

	  /**
	   * @param {Immutable.List} path
	   * @param {object} properties
	   * @param {object} config
	   */
	  addRule: function addRule(path, properties, config) {
	    Dispatcher.dispatch({
	      actionType: RuleConstants.ADD_RULE,
	      path: path,
	      rule: properties
	    });
	  },

	  /**
	   * @param {Immutable.List} path
	   */
	  removeRule: function removeRule(path) {
	    Dispatcher.dispatch({
	      actionType: RuleConstants.REMOVE_RULE,
	      path: path
	    });
	  },

	  /**
	   * @param {Immutable.List} path
	   * @param {string} field
	   */
	  setField: function setField(path, field) {
	    Dispatcher.dispatch({
	      actionType: RuleConstants.SET_FIELD,
	      path: path,
	      field: field
	    });
	  },

	  /**
	   * @param {Immutable.List} path
	   * @param {string} operator
	   */
	  setOperator: function setOperator(path, operator) {
	    Dispatcher.dispatch({
	      actionType: RuleConstants.SET_OPERATOR,
	      path: path,
	      operator: operator
	    });
	  },

	  /**
	   * @param {Immutable.List} path
	   * @param {integer} delta
	   * @param {*} value
	   */
	  setDeltaValue: function setDeltaValue(path, delta, value) {
	    Dispatcher.dispatch({
	      actionType: RuleConstants.SET_DELTA_VALUE,
	      path: path,
	      delta: delta,
	      value: value
	    });
	  },

	  /**
	   * @param {Immutable.List} path
	   * @param {string} name
	   * @param {*} value
	   */
	  setOption: function setOption(path, name, value) {
	    Dispatcher.dispatch({
	      actionType: RuleConstants.SET_OPTION,
	      path: path,
	      name: name,
	      value: value
	    });
	  }

	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var getQueryStringRecursive = (function (_getQueryStringRecursive) {
	  var _getQueryStringRecursiveWrapper = function getQueryStringRecursive(_x, _x2) {
	    return _getQueryStringRecursive.apply(this, arguments);
	  };

	  _getQueryStringRecursiveWrapper.toString = function () {
	    return _getQueryStringRecursive.toString();
	  };

	  return _getQueryStringRecursiveWrapper;
	})(function (item, config) {
	  var type = item.get("type");
	  var properties = item.get("properties");
	  var children = item.get("children");

	  if (type == "rule") {
	    var _ret = (function () {
	      if (!properties.has("field") || !properties.has("operator")) {
	        return {
	          v: undefined
	        };
	      }

	      var value = properties.get("value");
	      var field = config.fields[properties.get("field")];
	      var operator = config.operators[properties.get("operator")];
	      var options = properties.get("options");

	      if ((operator.cardinality || 1) !== 0) {
	        (function () {
	          var widget = config.widgets[field.widget];

	          value = value.map(function (value, key) {
	            return widget.value(value, config);
	          });
	        })();
	      }

	      return {
	        v: operator.value(value, field, options, operator, config)
	      };
	    })();

	    if (typeof _ret === "object") return _ret.v;
	  }

	  if (type == "group" && children && children.size) {
	    var values = children.map(function (item, key) {
	      return getQueryStringRecursive(item, config);
	    });
	    values = values.filter(function (value) {
	      return typeof value !== "undefined";
	    });

	    var conjunction = properties.get("conjunction");
	    conjunction = config.conjunctions[conjunction];
	    return conjunction.value(values, conjunction);
	  }

	  return undefined;
	});

	module.exports = function (item, config) {
	  return getQueryStringRecursive(item, config);
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_12__;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = _interopRequire(__webpack_require__(11));

	var Immutable = _interopRequire(__webpack_require__(12));

	var Rule = _interopRequire(__webpack_require__(17));

	var Group = _interopRequire(__webpack_require__(18));

	var assign = _interopRequire(__webpack_require__(16));

	var types = {
	  group: Group,
	  rule: Rule
	};

	var Item = (function (_React$Component) {
	  function Item(props) {
	    _classCallCheck(this, Item);

	    _get(Object.getPrototypeOf(Item.prototype), "constructor", this).call(this, props);

	    this.state = {
	      path: props.ancestors.push(props.id)
	    };
	  }

	  _inherits(Item, _React$Component);

	  _createClass(Item, {
	    componentWillReceiveProps: {
	      value: function componentWillReceiveProps(nextProps) {
	        if (!Immutable.is(this.props.ancestors, nextProps.ancestors)) {
	          this.setState({
	            path: this.props.ancestors.push(this.props.id)
	          });
	        }
	      }
	    },
	    render: {
	      value: function render() {
	        var children = this.props.children ? this.props.children.map(function (item) {
	          var props = {
	            config: this.props.config,
	            ancestors: this.state.path,
	            id: item.get("id"),
	            children: item.get("children"),
	            type: item.get("type"),
	            properties: item.get("properties")
	          };

	          return React.createElement(Item, _extends({ key: props.id }, props));
	        }, this).toList() : null;

	        var component = types[this.props.type];
	        var props = assign({}, this.props.properties.toObject(), {
	          config: this.props.config,
	          id: this.props.id,
	          path: this.state.path,
	          children: children
	        });

	        return React.createElement(component, props);
	      }
	    }
	  });

	  return Item;
	})(React.Component);

	Item.propTypes = {
	  config: React.PropTypes.object.isRequired,
	  id: React.PropTypes.string.isRequired,
	  type: React.PropTypes.string.isRequired,
	  ancestors: React.PropTypes.instanceOf(Immutable.List).isRequired,
	  properties: React.PropTypes.instanceOf(Immutable.Map).isRequired,
	  children: React.PropTypes.instanceOf(Immutable.OrderedMap)
	};

	module.exports = Item;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	"use strict";

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function (n) {
	  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function (type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events) this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === "error") {
	    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError("Uncaught, unspecified \"error\" event.");
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler)) return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        len = arguments.length;
	        args = new Array(len - 1);
	        for (i = 1; i < len; i++) args[i - 1] = arguments[i];
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++) args[i - 1] = arguments[i];

	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++) listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function (type, listener) {
	  var m;

	  if (!isFunction(listener)) throw TypeError("listener must be a function");

	  if (!this._events) this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener) this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    var m;
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error("(node) warning: possible EventEmitter memory " + "leak detected. %d listeners added. " + "Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
	      if (typeof console.trace === "function") {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function (type, listener) {
	  if (!isFunction(listener)) throw TypeError("listener must be a function");

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function (type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener)) throw TypeError("listener must be a function");

	  if (!this._events || !this._events[type]) return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener || isFunction(list.listener) && list.listener === listener) {
	    delete this._events[type];
	    if (this._events.removeListener) this.emit("removeListener", type, listener);
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0) return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener) this.emit("removeListener", type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function (type) {
	  var key, listeners;

	  if (!this._events) return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === "removeListener") continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners("removeListener");
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else {
	    // LIFO order
	    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function (type) {
	  var ret;
	  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.listenerCount = function (emitter, type) {
	  var ret;
	  if (!emitter._events || !emitter._events[type]) ret = 0;else if (isFunction(emitter._events[type])) ret = 1;else ret = emitter._events[type].length;
	  return ret;
	};

	function isFunction(arg) {
	  return typeof arg === "function";
	}

	function isNumber(arg) {
	  return typeof arg === "number";
	}

	function isObject(arg) {
	  return typeof arg === "object" && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */

	"use strict";

	module.exports.Dispatcher = __webpack_require__(21);

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Object.assign
	 */

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

	"use strict";

	function assign(target, sources) {
	  if (target == null) {
	    throw new TypeError("Object.assign target cannot be null or undefined");
	  }

	  var to = Object(target);
	  var hasOwnProperty = Object.prototype.hasOwnProperty;

	  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
	    var nextSource = arguments[nextIndex];
	    if (nextSource == null) {
	      continue;
	    }

	    var from = Object(nextSource);

	    // We don't currently support accessors nor proxies. Therefore this
	    // copy cannot throw. If we ever supported this then we must handle
	    // exceptions and side-effects. We don't support symbols so they won't
	    // be transferred.

	    for (var key in from) {
	      if (hasOwnProperty.call(from, key)) {
	        to[key] = from[key];
	      }
	    }
	  }

	  return to;
	}

	module.exports = assign;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var React = _interopRequire(__webpack_require__(11));

	var Immutable = _interopRequire(__webpack_require__(12));

	var RuleActions = _interopRequire(__webpack_require__(9));

	var Values = _interopRequire(__webpack_require__(22));

	var Options = _interopRequire(__webpack_require__(23));

	var assign = _interopRequire(__webpack_require__(16));

	var map = _interopRequire(__webpack_require__(19));

	var filter = _interopRequire(__webpack_require__(24));

	var Rule = (function (_React$Component) {
	  function Rule() {
	    _classCallCheck(this, Rule);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Rule, _React$Component);

	  _createClass(Rule, {
	    removeRule: {
	      value: function removeRule() {
	        RuleActions.removeRule(this.props.path);
	      }
	    },
	    handleFieldSelect: {
	      value: function handleFieldSelect() {
	        var node = React.findDOMNode(this.refs.field);
	        RuleActions.setField(this.props.path, node.value);
	      }
	    },
	    handleOperatorSelect: {
	      value: function handleOperatorSelect() {
	        var node = React.findDOMNode(this.refs.operator);
	        RuleActions.setOperator(this.props.path, node.value);
	      }
	    },
	    render: {
	      value: function render() {
	        var body = [];

	        var fields = this.props.config.fields;
	        var field = this.props.field && fields[this.props.field] || undefined;

	        var operators = {};
	        for (var id in this.props.config.operators) {
	          if (this.props.config.operators.hasOwnProperty(id)) {
	            if (field && field.operators.indexOf(id) !== -1) {
	              operators[id] = this.props.config.operators[id];
	            }
	          }
	        }

	        var operator = field && this.props.operator && operators[this.props.operator] || undefined;

	        if (Object.keys(fields).length) {
	          var options = map(fields, function (item, index) {
	            return React.createElement(
	              "option",
	              { key: index, value: index },
	              item.label
	            );
	          });

	          if (typeof field === "undefined") {
	            options.unshift(React.createElement("option", { key: ":empty:", value: ":empty:" }));
	          }

	          body.push(React.createElement(
	            "div",
	            { key: "field", className: "rule--field" },
	            React.createElement(
	              "label",
	              null,
	              "Field"
	            ),
	            React.createElement(
	              "select",
	              { ref: "field", value: this.props.field || ":empty:", onChange: this.handleFieldSelect.bind(this) },
	              options
	            )
	          ));
	        }

	        if (Object.keys(operators).length) {
	          var options = map(operators, function (item, index) {
	            return React.createElement(
	              "option",
	              { key: index, value: index },
	              item.label
	            );
	          });

	          if (typeof operator === "undefined") {
	            options.unshift(React.createElement("option", { key: ":empty:", value: ":empty:" }));
	          }

	          body.push(React.createElement(
	            "div",
	            { key: "operator", className: "rule--operator" },
	            React.createElement(
	              "label",
	              null,
	              "Operator"
	            ),
	            React.createElement(
	              "select",
	              { ref: "operator", value: this.props.operator || ":empty:", onChange: this.handleOperatorSelect.bind(this) },
	              options
	            )
	          ));
	        }

	        if (field && operator) {
	          var widget = typeof field.widget === "string" ? this.props.config.widgets[field.widget] : field.widget;
	          var cardinality = operator.cardinality || 1;

	          var props = {
	            config: this.props.config,
	            path: this.props.path,
	            id: this.props.id,
	            field: field
	          };

	          body.push(React.createElement(Options, _extends({ key: "options" }, props, { options: this.props.options, operator: operator })));
	          body.push(React.createElement(Values, _extends({ key: "values" }, props, { value: this.props.value, cardinality: cardinality, widget: widget })));
	        }

	        return React.createElement(
	          "div",
	          { className: "rule" },
	          React.createElement(
	            "div",
	            { className: "rule--header" },
	            React.createElement(
	              "div",
	              { className: "rule--actions" },
	              React.createElement(
	                "a",
	                { href: "#", className: "action action--DELETE", onClick: this.removeRule.bind(this) },
	                "Delete"
	              )
	            )
	          ),
	          React.createElement(
	            "div",
	            { className: "rule--body" },
	            body
	          )
	        );
	      }
	    }
	  });

	  return Rule;
	})(React.Component);

	Rule.propTypes = {
	  config: React.PropTypes.object.isRequired,
	  id: React.PropTypes.string.isRequired,
	  path: React.PropTypes.instanceOf(Immutable.List).isRequired
	};

	module.exports = Rule;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = _interopRequire(__webpack_require__(11));

	var Immutable = _interopRequire(__webpack_require__(12));

	var GroupActions = _interopRequire(__webpack_require__(8));

	var RuleActions = _interopRequire(__webpack_require__(9));

	var map = _interopRequire(__webpack_require__(19));

	var Group = (function (_React$Component) {
	  function Group() {
	    _classCallCheck(this, Group);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Group, _React$Component);

	  _createClass(Group, {
	    setConjunction: {
	      value: function setConjunction(event) {
	        GroupActions.setConjunction(this.props.path, event.target.value, this.props.config);
	      }
	    },
	    addGroup: {
	      value: function addGroup() {
	        GroupActions.addGroup(this.props.path, {
	          conjunction: this.props.config.defaults.conjunction
	        }, this.props.config);
	      }
	    },
	    removeGroup: {
	      value: function removeGroup() {
	        GroupActions.removeGroup(this.props.path, this.props.config);
	      }
	    },
	    addRule: {
	      value: function addRule() {
	        RuleActions.addRule(this.props.path, {
	          value: new Immutable.List(),
	          options: new Immutable.Map()
	        }, this.props.config);
	      }
	    },
	    render: {
	      value: function render() {
	        var name = "conjunction[" + this.props.id + "]";
	        var conjunctions = map(this.props.config.conjunctions, function (item, index) {
	          var checked = index == this.props.conjunction;
	          var state = checked ? "active" : "inactive";
	          var id = "conjunction-" + this.props.id + "-" + index;

	          return React.createElement(
	            "div",
	            { key: index, className: "conjunction conjunction--" + index.toUpperCase(), "data-state": state },
	            React.createElement(
	              "label",
	              { htmlFor: id },
	              item.label
	            ),
	            React.createElement("input", { id: id, type: "radio", name: name, value: index, checked: checked, onChange: this.setConjunction.bind(this) })
	          );
	        }, this);

	        return React.createElement(
	          "div",
	          { className: "group" },
	          React.createElement(
	            "div",
	            { className: "group--header" },
	            React.createElement(
	              "div",
	              { className: "group--conjunctions" },
	              conjunctions
	            ),
	            React.createElement(
	              "div",
	              { className: "group--actions" },
	              React.createElement(
	                "a",
	                { href: "#", className: "action action--ADD-GROUP", onClick: this.addGroup.bind(this) },
	                "Add group"
	              ),
	              React.createElement(
	                "a",
	                { href: "#", className: "action action--ADD-RULE", onClick: this.addRule.bind(this) },
	                "Add rule"
	              ),
	              React.createElement(
	                "a",
	                { href: "#", className: "action action--DELETE", onClick: this.removeGroup.bind(this) },
	                "Delete"
	              )
	            )
	          ),
	          React.createElement(
	            "div",
	            { className: "group--children" },
	            this.props.children
	          )
	        );
	      }
	    }
	  });

	  return Group;
	})(React.Component);

	Group.propTypes = {
	  config: React.PropTypes.object.isRequired,
	  id: React.PropTypes.string.isRequired,
	  path: React.PropTypes.instanceOf(Immutable.List).isRequired
	};

	module.exports = Group;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var arrayMap = __webpack_require__(25),
	    baseCallback = __webpack_require__(26),
	    baseMap = __webpack_require__(27),
	    isArray = __webpack_require__(28);

	/**
	 * Creates an array of values by running each element in `collection` through
	 * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
	 * arguments; (value, index|key, collection).
	 *
	 * If a property name is provided for `predicate` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `predicate` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * Many lodash methods are guarded to work as interatees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`, `drop`,
	 * `dropRight`, `fill`, `flatten`, `invert`, `max`, `min`, `parseInt`, `slice`,
	 * `sortBy`, `take`, `takeRight`, `template`, `trim`, `trimLeft`, `trimRight`,
	 * `trunc`, `random`, `range`, `sample`, `uniq`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @alias collect
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	 *  per iteration.
	 *  create a `_.property` or `_.matches` style callback respectively.
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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule keyMirror
	 * @typechecks static-only
	 */

	"use strict";

	var invariant = __webpack_require__(29);

	/**
	 * Constructs an enumeration with keys equal to their value.
	 *
	 * For example:
	 *
	 *   var COLORS = keyMirror({blue: null, red: null});
	 *   var myColor = COLORS.blue;
	 *   var isColorValid = !!COLORS[myColor];
	 *
	 * The last line could not be performed if the values of the generated enum were
	 * not equal to their keys.
	 *
	 *   Input:  {key1: val1, key2: val2}
	 *   Output: {key1: key1, key2: key2}
	 *
	 * @param {object} obj
	 * @return {object}
	 */
	var keyMirror = function keyMirror(obj) {
	  var ret = {};
	  var key;
	  false ? invariant(obj instanceof Object && !Array.isArray(obj), "keyMirror(...): Argument must be an object.") : invariant(obj instanceof Object && !Array.isArray(obj));
	  for (key in obj) {
	    if (!obj.hasOwnProperty(key)) {
	      continue;
	    }
	    ret[key] = key;
	  }
	  return ret;
	};

	module.exports = keyMirror;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Dispatcher
	 * @typechecks
	 */

	"use strict";

	var invariant = __webpack_require__(32);

	var _lastID = 1;
	var _prefix = "ID_";

	/**
	 * Dispatcher is used to broadcast payloads to registered callbacks. This is
	 * different from generic pub-sub systems in two ways:
	 *
	 *   1) Callbacks are not subscribed to particular events. Every payload is
	 *      dispatched to every registered callback.
	 *   2) Callbacks can be deferred in whole or part until other callbacks have
	 *      been executed.
	 *
	 * For example, consider this hypothetical flight destination form, which
	 * selects a default city when a country is selected:
	 *
	 *   var flightDispatcher = new Dispatcher();
	 *
	 *   // Keeps track of which country is selected
	 *   var CountryStore = {country: null};
	 *
	 *   // Keeps track of which city is selected
	 *   var CityStore = {city: null};
	 *
	 *   // Keeps track of the base flight price of the selected city
	 *   var FlightPriceStore = {price: null}
	 *
	 * When a user changes the selected city, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'city-update',
	 *     selectedCity: 'paris'
	 *   });
	 *
	 * This payload is digested by `CityStore`:
	 *
	 *   flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'city-update') {
	 *       CityStore.city = payload.selectedCity;
	 *     }
	 *   });
	 *
	 * When the user selects a country, we dispatch the payload:
	 *
	 *   flightDispatcher.dispatch({
	 *     actionType: 'country-update',
	 *     selectedCountry: 'australia'
	 *   });
	 *
	 * This payload is digested by both stores:
	 *
	 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       CountryStore.country = payload.selectedCountry;
	 *     }
	 *   });
	 *
	 * When the callback to update `CountryStore` is registered, we save a reference
	 * to the returned token. Using this token with `waitFor()`, we can guarantee
	 * that `CountryStore` is updated before the callback that updates `CityStore`
	 * needs to query its data.
	 *
	 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
	 *     if (payload.actionType === 'country-update') {
	 *       // `CountryStore.country` may not be updated.
	 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
	 *       // `CountryStore.country` is now guaranteed to be updated.
	 *
	 *       // Select the default city for the new country
	 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
	 *     }
	 *   });
	 *
	 * The usage of `waitFor()` can be chained, for example:
	 *
	 *   FlightPriceStore.dispatchToken =
	 *     flightDispatcher.register(function(payload) {
	 *       switch (payload.actionType) {
	 *         case 'country-update':
	 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
	 *           FlightPriceStore.price =
	 *             getFlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *
	 *         case 'city-update':
	 *           FlightPriceStore.price =
	 *             FlightPriceStore(CountryStore.country, CityStore.city);
	 *           break;
	 *     }
	 *   });
	 *
	 * The `country-update` payload will be guaranteed to invoke the stores'
	 * registered callbacks in order: `CountryStore`, `CityStore`, then
	 * `FlightPriceStore`.
	 */

	function Dispatcher() {
	  this.$Dispatcher_callbacks = {};
	  this.$Dispatcher_isPending = {};
	  this.$Dispatcher_isHandled = {};
	  this.$Dispatcher_isDispatching = false;
	  this.$Dispatcher_pendingPayload = null;
	}

	/**
	 * Registers a callback to be invoked with every dispatched payload. Returns
	 * a token that can be used with `waitFor()`.
	 *
	 * @param {function} callback
	 * @return {string}
	 */
	Dispatcher.prototype.register = function (callback) {
	  var id = _prefix + _lastID++;
	  this.$Dispatcher_callbacks[id] = callback;
	  return id;
	};

	/**
	 * Removes a callback based on its token.
	 *
	 * @param {string} id
	 */
	Dispatcher.prototype.unregister = function (id) {
	  invariant(this.$Dispatcher_callbacks[id], "Dispatcher.unregister(...): `%s` does not map to a registered callback.", id);
	  delete this.$Dispatcher_callbacks[id];
	};

	/**
	 * Waits for the callbacks specified to be invoked before continuing execution
	 * of the current callback. This method should only be used by a callback in
	 * response to a dispatched payload.
	 *
	 * @param {array<string>} ids
	 */
	Dispatcher.prototype.waitFor = function (ids) {
	  invariant(this.$Dispatcher_isDispatching, "Dispatcher.waitFor(...): Must be invoked while dispatching.");
	  for (var ii = 0; ii < ids.length; ii++) {
	    var id = ids[ii];
	    if (this.$Dispatcher_isPending[id]) {
	      invariant(this.$Dispatcher_isHandled[id], "Dispatcher.waitFor(...): Circular dependency detected while " + "waiting for `%s`.", id);
	      continue;
	    }
	    invariant(this.$Dispatcher_callbacks[id], "Dispatcher.waitFor(...): `%s` does not map to a registered callback.", id);
	    this.$Dispatcher_invokeCallback(id);
	  }
	};

	/**
	 * Dispatches a payload to all registered callbacks.
	 *
	 * @param {object} payload
	 */
	Dispatcher.prototype.dispatch = function (payload) {
	  invariant(!this.$Dispatcher_isDispatching, "Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.");
	  this.$Dispatcher_startDispatching(payload);
	  try {
	    for (var id in this.$Dispatcher_callbacks) {
	      if (this.$Dispatcher_isPending[id]) {
	        continue;
	      }
	      this.$Dispatcher_invokeCallback(id);
	    }
	  } finally {
	    this.$Dispatcher_stopDispatching();
	  }
	};

	/**
	 * Is this Dispatcher currently dispatching.
	 *
	 * @return {boolean}
	 */
	Dispatcher.prototype.isDispatching = function () {
	  return this.$Dispatcher_isDispatching;
	};

	/**
	 * Call the callback stored with the given id. Also do some internal
	 * bookkeeping.
	 *
	 * @param {string} id
	 * @internal
	 */
	Dispatcher.prototype.$Dispatcher_invokeCallback = function (id) {
	  this.$Dispatcher_isPending[id] = true;
	  this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
	  this.$Dispatcher_isHandled[id] = true;
	};

	/**
	 * Set up bookkeeping needed when dispatching.
	 *
	 * @param {object} payload
	 * @internal
	 */
	Dispatcher.prototype.$Dispatcher_startDispatching = function (payload) {
	  for (var id in this.$Dispatcher_callbacks) {
	    this.$Dispatcher_isPending[id] = false;
	    this.$Dispatcher_isHandled[id] = false;
	  }
	  this.$Dispatcher_pendingPayload = payload;
	  this.$Dispatcher_isDispatching = true;
	};

	/**
	 * Clear bookkeeping used for dispatching.
	 *
	 * @internal
	 */
	Dispatcher.prototype.$Dispatcher_stopDispatching = function () {
	  this.$Dispatcher_pendingPayload = null;
	  this.$Dispatcher_isDispatching = false;
	};

	module.exports = Dispatcher;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = _interopRequire(__webpack_require__(11));

	var Immutable = _interopRequire(__webpack_require__(12));

	var RuleActions = _interopRequire(__webpack_require__(9));

	var Values = (function (_React$Component) {
	  function Values() {
	    _classCallCheck(this, Values);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Values, _React$Component);

	  _createClass(Values, {
	    render: {
	      value: function render() {
	        var _this = this;

	        if (this.props.cardinality === 0) {
	          return null;
	        }

	        var name = this.props.widget.name.toUpperCase();
	        if (typeof this.props.widget.behavior === "undefined") {
	          var widgets = [];

	          for (var delta = 0; delta < this.props.cardinality; delta++) {
	            (function (delta) {
	              var widget = React.createElement(_this.props.widget.component, {
	                key: delta,
	                definition: _this.props.widget,
	                field: _this.props.field,
	                delta: delta,
	                value: _this.props.value[delta],
	                setValue: function (value) {
	                  return RuleActions.setDeltaValue(_this.props.path, delta, value, _this.props.config);
	                }
	              });

	              widgets.push(React.createElement(
	                "div",
	                { key: delta, className: "widget widget--" + name },
	                widget
	              ));
	            })(delta);
	          }

	          return React.createElement(
	            "div",
	            { className: "filter--values" },
	            widgets
	          );
	        }

	        var widget = React.createElement(this.props.widget.component, {
	          definition: this.props.widget,
	          field: this.props.field,
	          cardinality: this.props.cardinality,
	          value: this.props.value,
	          setDeltaValue: function (delta, value) {
	            return RuleActions.setDeltaValue(_this.props.path, delta, value, _this.props.config);
	          }
	        });

	        return React.createElement(
	          "div",
	          { className: "filter--values" },
	          React.createElement(
	            "div",
	            { className: "widget widget--" + name },
	            widget
	          )
	        );
	      }
	    }
	  });

	  return Values;
	})(React.Component);

	Values.propTypes = {
	  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
	  value: React.PropTypes.instanceOf(Immutable.List).isRequired,
	  config: React.PropTypes.object.isRequired,
	  field: React.PropTypes.object.isRequired,
	  cardinality: React.PropTypes.number.isRequired,
	  widget: React.PropTypes.object.isRequired
	};

	module.exports = Values;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var React = _interopRequire(__webpack_require__(11));

	var Immutable = _interopRequire(__webpack_require__(12));

	var RuleActions = _interopRequire(__webpack_require__(9));

	var Options = (function (_React$Component) {
	  function Options() {
	    _classCallCheck(this, Options);

	    if (_React$Component != null) {
	      _React$Component.apply(this, arguments);
	    }
	  }

	  _inherits(Options, _React$Component);

	  _createClass(Options, {
	    render: {
	      value: function render() {
	        var _this = this;

	        if (!this.props.operator.options || !this.props.operator.options.component) {
	          return null;
	        }

	        var options = React.createElement(this.props.operator.options.component, {
	          definition: this.props.operator,
	          field: this.props.field,
	          options: this.props.options,
	          setOption: function (name, value) {
	            return RuleActions.setOption(_this.props.path, name, value, _this.props.config);
	          }
	        });

	        return React.createElement(
	          "div",
	          { className: "filter--options" },
	          options
	        );
	      }
	    }
	  });

	  return Options;
	})(React.Component);

	Options.propTypes = {
	  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
	  options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
	  config: React.PropTypes.object.isRequired,
	  field: React.PropTypes.object.isRequired,
	  operator: React.PropTypes.object.isRequired
	};

	module.exports = Options;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var arrayFilter = __webpack_require__(30),
	    baseCallback = __webpack_require__(26),
	    baseFilter = __webpack_require__(31),
	    isArray = __webpack_require__(28);

	/**
	 * Iterates over elements of `collection`, returning an array of all elements
	 * `predicate` returns truthy for. The predicate is bound to `thisArg` and
	 * invoked with three arguments; (value, index|key, collection).
	 *
	 * If a property name is provided for `predicate` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `predicate` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @alias select
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function|Object|string} [predicate=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `predicate`.
	 * @returns {Array} Returns the new filtered array.
	 * @example
	 *
	 * _.filter([4, 5, 6], function(n) {
	 *   return n % 2 == 0;
	 * });
	 * // => [4, 6]
	 *
	 * var users = [
	 *   { 'user': 'barney', 'age': 36, 'active': true },
	 *   { 'user': 'fred',   'age': 40, 'active': false }
	 * ];
	 *
	 * // using the `_.matches` callback shorthand
	 * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
	 * // => ['barney']
	 *
	 * // using the `_.matchesProperty` callback shorthand
	 * _.pluck(_.filter(users, 'active', false), 'user');
	 * // => ['fred']
	 *
	 * // using the `_.property` callback shorthand
	 * _.pluck(_.filter(users, 'active'), 'user');
	 * // => ['barney']
	 */
	function filter(collection, predicate, thisArg) {
	  var func = isArray(collection) ? arrayFilter : baseFilter;
	  predicate = baseCallback(predicate, thisArg, 3);
	  return func(collection, predicate);
	}

	module.exports = filter;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A specialized version of `_.map` for arrays without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	"use strict";

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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseMatches = __webpack_require__(33),
	    baseMatchesProperty = __webpack_require__(34),
	    baseProperty = __webpack_require__(35),
	    bindCallback = __webpack_require__(36),
	    identity = __webpack_require__(37),
	    isBindable = __webpack_require__(38);

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
	  if (type == "function") {
	    return typeof thisArg != "undefined" && isBindable(func) ? bindCallback(func, thisArg, argCount) : func;
	  }
	  if (func == null) {
	    return identity;
	  }
	  if (type == "object") {
	    return baseMatches(func);
	  }
	  return typeof thisArg == "undefined" ? baseProperty(func + "") : baseMatchesProperty(func + "", thisArg);
	}

	module.exports = baseCallback;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseEach = __webpack_require__(39);

	/**
	 * The base implementation of `_.map` without support for callback shorthands
	 * or `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var result = [];
	  baseEach(collection, function (value, key, collection) {
	    result.push(iteratee(value, key, collection));
	  });
	  return result;
	}

	module.exports = baseMap;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isLength = __webpack_require__(40),
	    isNative = __webpack_require__(41),
	    isObjectLike = __webpack_require__(42);

	/** `Object#toString` result references. */
	var arrayTag = "[object Array]";

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

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
	var isArray = nativeIsArray || function (value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag || false;
	};

	module.exports = isArray;

/***/ },
/* 29 */
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

	"use strict";

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

	var invariant = function invariant(condition, format, a, b, c, d, e, f) {
	  if (false) {
	    if (format === undefined) {
	      throw new Error("invariant requires an error message argument");
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error("Minified exception occurred; use the non-minified dev environment " + "for the full error message and additional helpful warnings.");
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error("Invariant Violation: " + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A specialized version of `_.filter` for arrays without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	"use strict";

	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array.length,
	      resIndex = -1,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[++resIndex] = value;
	    }
	  }
	  return result;
	}

	module.exports = arrayFilter;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseEach = __webpack_require__(39);

	/**
	 * The base implementation of `_.filter` without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function baseFilter(collection, predicate) {
	  var result = [];
	  baseEach(collection, function (value, index, collection) {
	    if (predicate(value, index, collection)) {
	      result.push(value);
	    }
	  });
	  return result;
	}

	module.exports = baseFilter;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	"use strict";

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

	var invariant = function invariant(condition, format, a, b, c, d, e, f) {
	  if (false) {
	    if (format === undefined) {
	      throw new Error("invariant requires an error message argument");
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error("Minified exception occurred; use the non-minified dev environment " + "for the full error message and additional helpful warnings.");
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error("Invariant Violation: " + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};

	module.exports = invariant;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseIsMatch = __webpack_require__(45),
	    isStrictComparable = __webpack_require__(44),
	    keys = __webpack_require__(46);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.matches` which does not clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatches(source) {
	  var props = keys(source),
	      length = props.length;

	  if (length == 1) {
	    var key = props[0],
	        value = source[key];

	    if (isStrictComparable(value)) {
	      return function (object) {
	        return object != null && object[key] === value && hasOwnProperty.call(object, key);
	      };
	    }
	  }
	  var values = Array(length),
	      strictCompareFlags = Array(length);

	  while (length--) {
	    value = source[props[length]];
	    values[length] = value;
	    strictCompareFlags[length] = isStrictComparable(value);
	  }
	  return function (object) {
	    return baseIsMatch(object, props, values, strictCompareFlags);
	  };
	}

	module.exports = baseMatches;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseIsEqual = __webpack_require__(43),
	    isStrictComparable = __webpack_require__(44);

	/**
	 * The base implementation of `_.matchesProperty` which does not coerce `key`
	 * to a string.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} value The value to compare.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatchesProperty(key, value) {
	  if (isStrictComparable(value)) {
	    return function (object) {
	      return object != null && object[key] === value;
	    };
	  }
	  return function (object) {
	    return object != null && baseIsEqual(value, object[key], null, true);
	  };
	}

	module.exports = baseMatchesProperty;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * The base implementation of `_.property` which does not coerce `key` to a string.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	"use strict";

	function baseProperty(key) {
	  return function (object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var identity = __webpack_require__(37);

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
	  if (typeof func != "function") {
	    return identity;
	  }
	  if (typeof thisArg == "undefined") {
	    return func;
	  }
	  switch (argCount) {
	    case 1:
	      return function (value) {
	        return func.call(thisArg, value);
	      };
	    case 3:
	      return function (value, index, collection) {
	        return func.call(thisArg, value, index, collection);
	      };
	    case 4:
	      return function (accumulator, value, index, collection) {
	        return func.call(thisArg, accumulator, value, index, collection);
	      };
	    case 5:
	      return function (value, other, key, object, source) {
	        return func.call(thisArg, value, other, key, object, source);
	      };
	  }
	  return function () {
	    return func.apply(thisArg, arguments);
	  };
	}

	module.exports = bindCallback;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

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
	"use strict";

	function identity(value) {
	  return value;
	}

	module.exports = identity;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseSetData = __webpack_require__(47),
	    isNative = __webpack_require__(41),
	    support = __webpack_require__(48);

	/** Used to detect named functions. */
	var reFuncName = /^\s*function[ \n\r\t]+\w/;

	/** Used to detect functions containing a `this` reference. */
	var reThis = /\bthis\b/;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/**
	 * Checks if `func` is eligible for `this` binding.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is eligible, else `false`.
	 */
	function isBindable(func) {
	  var result = !(support.funcNames ? func.name : support.funcDecomp);

	  if (!result) {
	    var source = fnToString.call(func);
	    if (!support.funcNames) {
	      result = !reFuncName.test(source);
	    }
	    if (!result) {
	      // Check if `func` references the `this` keyword and store the result.
	      result = reThis.test(source) || isNative(func);
	      baseSetData(func, result);
	    }
	  }
	  return result;
	}

	module.exports = isBindable;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseForOwn = __webpack_require__(49),
	    isLength = __webpack_require__(40),
	    toObject = __webpack_require__(50);

	/**
	 * The base implementation of `_.forEach` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object|string} Returns `collection`.
	 */
	function baseEach(collection, iteratee) {
	  var length = collection ? collection.length : 0;
	  if (!isLength(length)) {
	    return baseForOwn(collection, iteratee);
	  }
	  var index = -1,
	      iterable = toObject(collection);

	  while (++index < length) {
	    if (iteratee(iterable[index], index, iterable) === false) {
	      break;
	    }
	  }
	  return collection;
	}

	module.exports = baseEach;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Used as the maximum length of an array-like value.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * for more details.
	 */
	"use strict";

	var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on ES `ToLength`. See the
	 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
	 * for more details.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var escapeRegExp = __webpack_require__(51),
	    isObjectLike = __webpack_require__(42);

	/** `Object#toString` result references. */
	var funcTag = "[object Function]";

	/** Used to detect host constructors (Safari > 5). */
	var reHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reNative = RegExp("^" + escapeRegExp(objToString).replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");

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
	  if (objToString.call(value) == funcTag) {
	    return reNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reHostCtor.test(value) || false;
	}

	module.exports = isNative;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	"use strict";

	function isObjectLike(value) {
	  return value && typeof value == "object" || false;
	}

	module.exports = isObjectLike;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseIsEqualDeep = __webpack_require__(52);

	/**
	 * The base implementation of `_.isEqual` without support for `this` binding
	 * `customizer` functions.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, isWhere, stackA, stackB) {
	  // Exit early for identical values.
	  if (value === other) {
	    // Treat `+0` vs. `-0` as not equal.
	    return value !== 0 || 1 / value == 1 / other;
	  }
	  var valType = typeof value,
	      othType = typeof other;

	  // Exit early for unlike primitive values.
	  if (valType != "function" && valType != "object" && othType != "function" && othType != "object" || value == null || other == null) {
	    // Return `false` unless both values are `NaN`.
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isWhere, stackA, stackB);
	}

	module.exports = baseIsEqual;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isObject = __webpack_require__(53);

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && (value === 0 ? 1 / value > 0 : !isObject(value));
	}

	module.exports = isStrictComparable;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseIsEqual = __webpack_require__(43);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.isMatch` without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Array} props The source property names to match.
	 * @param {Array} values The source values to match.
	 * @param {Array} strictCompareFlags Strict comparison flags for source values.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, props, values, strictCompareFlags, customizer) {
	  var length = props.length;
	  if (object == null) {
	    return !length;
	  }
	  var index = -1,
	      noCustomizer = !customizer;

	  while (++index < length) {
	    if (noCustomizer && strictCompareFlags[index] ? values[index] !== object[props[index]] : !hasOwnProperty.call(object, props[index])) {
	      return false;
	    }
	  }
	  index = -1;
	  while (++index < length) {
	    var key = props[index];
	    if (noCustomizer && strictCompareFlags[index]) {
	      var result = hasOwnProperty.call(object, key);
	    } else {
	      var objValue = object[key],
	          srcValue = values[index];

	      result = customizer ? customizer(objValue, srcValue, key) : undefined;
	      if (typeof result == "undefined") {
	        result = baseIsEqual(srcValue, objValue, customizer, true);
	      }
	    }
	    if (!result) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = baseIsMatch;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isLength = __webpack_require__(40),
	    isNative = __webpack_require__(41),
	    isObject = __webpack_require__(53),
	    shimKeys = __webpack_require__(55);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to inspect.
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
	var keys = !nativeKeys ? shimKeys : function (object) {
	  if (object) {
	    var Ctor = object.constructor,
	        length = object.length;
	  }
	  if (typeof Ctor == "function" && Ctor.prototype === object || typeof object != "function" && (length && isLength(length))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};

	module.exports = keys;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var identity = __webpack_require__(37),
	    metaMap = __webpack_require__(54);

	/**
	 * The base implementation of `setData` without support for hot loop detection.
	 *
	 * @private
	 * @param {Function} func The function to associate metadata with.
	 * @param {*} data The metadata.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetData = !metaMap ? identity : function (func, data) {
	  metaMap.set(func, data);
	  return func;
	};

	module.exports = baseSetData;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	var isNative = __webpack_require__(41);

	/** Used to detect functions containing a `this` reference. */
	var reThis = /\bthis\b/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to detect DOM support. */
	var document = (document = global.window) && document.document;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * An object environment feature flags.
	 *
	 * @static
	 * @memberOf _
	 * @type Object
	 */
	var support = {};

	(function (x) {

	  /**
	   * Detect if functions can be decompiled by `Function#toString`
	   * (all but Firefox OS certified apps, older Opera mobile browsers, and
	   * the PlayStation 3; forced `false` for Windows 8 apps).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function () {
	    return this;
	  });

	  /**
	   * Detect if `Function#name` is supported (all but IE).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.funcNames = typeof Function.name == "string";

	  /**
	   * Detect if the DOM is supported.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  try {
	    support.dom = document.createDocumentFragment().nodeType === 11;
	  } catch (e) {
	    support.dom = false;
	  }

	  /**
	   * Detect if `arguments` object indexes are non-enumerable.
	   *
	   * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
	   * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
	   * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
	   * checks for indexes that exceed their function's formal parameters with
	   * associated values of `0`.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  try {
	    support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
	  } catch (e) {
	    support.nonEnumArgs = true;
	  }
	})(0, 0);

	module.exports = support;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseFor = __webpack_require__(56),
	    keys = __webpack_require__(46);

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
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isObject = __webpack_require__(53);

	/**
	 * Converts `value` to an object if it is not one.
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
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var baseToString = __webpack_require__(57);

	/**
	 * Used to match `RegExp` special characters.
	 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
	 * for more details.
	 */
	var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
	    reHasRegExpChars = RegExp(reRegExpChars.source);

	/**
	 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
	 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
	 *
	 * @static
	 * @memberOf _
	 * @category String
	 * @param {string} [string=''] The string to escape.
	 * @returns {string} Returns the escaped string.
	 * @example
	 *
	 * _.escapeRegExp('[lodash](https://lodash.com/)');
	 * // => '\[lodash\]\(https://lodash\.com/\)'
	 */
	function escapeRegExp(string) {
	  string = baseToString(string);
	  return string && reHasRegExpChars.test(string) ? string.replace(reRegExpChars, "\\$&") : string;
	}

	module.exports = escapeRegExp;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var equalArrays = __webpack_require__(58),
	    equalByTag = __webpack_require__(59),
	    equalObjects = __webpack_require__(60),
	    isArray = __webpack_require__(28),
	    isTypedArray = __webpack_require__(61);

	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]",
	    arrayTag = "[object Array]",
	    objectTag = "[object Object]";

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
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
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, isWhere, stackA, stackB) {
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
	  var valWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"),
	      othWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");

	  if (valWrapped || othWrapped) {
	    return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isWhere, stackA, stackB);
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

	  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isWhere, stackA, stackB);

	  stackA.pop();
	  stackB.pop();

	  return result;
	}

	module.exports = baseIsEqualDeep;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Checks if `value` is the language type of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
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
	"use strict";

	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return type == "function" || value && type == "object" || false;
	}

	module.exports = isObject;

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	var isNative = __webpack_require__(41);

	/** Native method references. */
	var WeakMap = isNative(WeakMap = global.WeakMap) && WeakMap;

	/** Used to store function metadata. */
	var metaMap = WeakMap && new WeakMap();

	module.exports = metaMap;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isArguments = __webpack_require__(62),
	    isArray = __webpack_require__(28),
	    isIndex = __webpack_require__(63),
	    isLength = __webpack_require__(40),
	    keysIn = __webpack_require__(64),
	    support = __webpack_require__(48);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;

	  var allowIndexes = length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object));

	  var index = -1,
	      result = [];

	  while (++index < propsLength) {
	    var key = props[index];
	    if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = shimKeys;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var toObject = __webpack_require__(50);

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iterator functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	function baseFor(object, iteratee, keysFunc) {
	  var index = -1,
	      iterable = toObject(object),
	      props = keysFunc(object),
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    if (iteratee(iterable[key], key, iterable) === false) {
	      break;
	    }
	  }
	  return object;
	}

	module.exports = baseFor;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Converts `value` to a string if it is not one. An empty string is returned
	 * for `null` or `undefined` values.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	"use strict";

	function baseToString(value) {
	  if (typeof value == "string") {
	    return value;
	  }
	  return value == null ? "" : value + "";
	}

	module.exports = baseToString;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing arrays.
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	"use strict";

	function equalArrays(array, other, equalFunc, customizer, isWhere, stackA, stackB) {
	  var index = -1,
	      arrLength = array.length,
	      othLength = other.length,
	      result = true;

	  if (arrLength != othLength && !(isWhere && othLength > arrLength)) {
	    return false;
	  }
	  // Deep compare the contents, ignoring non-numeric properties.
	  while (result && ++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    result = undefined;
	    if (customizer) {
	      result = isWhere ? customizer(othValue, arrValue, index) : customizer(arrValue, othValue, index);
	    }
	    if (typeof result == "undefined") {
	      // Recursively compare arrays (susceptible to call stack limits).
	      if (isWhere) {
	        var othIndex = othLength;
	        while (othIndex--) {
	          othValue = other[othIndex];
	          result = arrValue && arrValue === othValue || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);
	          if (result) {
	            break;
	          }
	        }
	      } else {
	        result = arrValue && arrValue === othValue || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);
	      }
	    }
	  }
	  return !!result;
	}

	module.exports = equalArrays;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/** `Object#toString` result references. */
	"use strict";

	var boolTag = "[object Boolean]",
	    dateTag = "[object Date]",
	    errorTag = "[object Error]",
	    numberTag = "[object Number]",
	    regexpTag = "[object RegExp]",
	    stringTag = "[object String]";

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} value The object to compare.
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
	      return object != +object ? other != +other
	      // But, treat `-0` vs. `+0` as not equal.
	      : object == 0 ? 1 / object == 1 / other : object == +other;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings primitives and string
	      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	      return object == other + "";
	  }
	  return false;
	}

	module.exports = equalByTag;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var keys = __webpack_require__(46);

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
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, isWhere, stackA, stackB) {
	  var objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isWhere) {
	    return false;
	  }
	  var hasCtor,
	      index = -1;

	  while (++index < objLength) {
	    var key = objProps[index],
	        result = hasOwnProperty.call(other, key);

	    if (result) {
	      var objValue = object[key],
	          othValue = other[key];

	      result = undefined;
	      if (customizer) {
	        result = isWhere ? customizer(othValue, objValue, key) : customizer(objValue, othValue, key);
	      }
	      if (typeof result == "undefined") {
	        // Recursively compare objects (susceptible to call stack limits).
	        result = objValue && objValue === othValue || equalFunc(objValue, othValue, customizer, isWhere, stackA, stackB);
	      }
	    }
	    if (!result) {
	      return false;
	    }
	    hasCtor || (hasCtor = key == "constructor");
	  }
	  if (!hasCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = equalObjects;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isLength = __webpack_require__(40),
	    isObjectLike = __webpack_require__(42);

	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]",
	    arrayTag = "[object Array]",
	    boolTag = "[object Boolean]",
	    dateTag = "[object Date]",
	    errorTag = "[object Error]",
	    funcTag = "[object Function]",
	    mapTag = "[object Map]",
	    numberTag = "[object Number]",
	    objectTag = "[object Object]",
	    regexpTag = "[object RegExp]",
	    setTag = "[object Set]",
	    stringTag = "[object String]",
	    weakMapTag = "[object WeakMap]";

	var arrayBufferTag = "[object ArrayBuffer]",
	    float32Tag = "[object Float32Array]",
	    float64Tag = "[object Float64Array]",
	    int8Tag = "[object Int8Array]",
	    int16Tag = "[object Int16Array]",
	    int32Tag = "[object Int32Array]",
	    uint8Tag = "[object Uint8Array]",
	    uint8ClampedTag = "[object Uint8ClampedArray]",
	    uint16Tag = "[object Uint16Array]",
	    uint32Tag = "[object Uint32Array]";

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
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
	    return isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)] || false;
	}

	module.exports = isTypedArray;

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isLength = __webpack_require__(40),
	    isObjectLike = __webpack_require__(42);

	/** `Object#toString` result references. */
	var argsTag = "[object Arguments]";

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

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
	  var length = isObjectLike(value) ? value.length : undefined;
	  return isLength(length) && objToString.call(value) == argsTag || false;
	}

	module.exports = isArguments;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Used as the maximum length of an array-like value.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * for more details.
	 */
	"use strict";

	var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = +value;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = isIndex;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var isArguments = __webpack_require__(62),
	    isArray = __webpack_require__(28),
	    isIndex = __webpack_require__(63),
	    isLength = __webpack_require__(40),
	    isObject = __webpack_require__(53),
	    support = __webpack_require__(48);

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
	 * @param {Object} object The object to inspect.
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
	  length = length && isLength(length) && (isArray(object) || support.nonEnumArgs && isArguments(object)) && length || 0;

	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == "function" && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;

	  while (++index < length) {
	    result[index] = index + "";
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) && !(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = keysIn;

/***/ }
/******/ ])
});
;