'use strict';

exports.__esModule = true;

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