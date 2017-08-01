'use strict';

exports.__esModule = true;

var _mapValues = require('lodash/mapValues');

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