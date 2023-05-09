import serializeJs from "serialize-javascript";
import { Utils } from "@react-awesome-query-builder/core";
import mergeWith from "lodash/mergeWith";
import omit from "lodash/omit";

// It's just a test to show ability to serialize an entire config to string and deserialize back

const mergeCustomizerCleanJSX = (_objValue, srcValue, _key, _object, _source, _stack) => {
  const { isDirtyJSX, cleanJSX } = Utils.ConfigUtils;
  if (isDirtyJSX(srcValue)) {
    return cleanJSX(srcValue);
  }
};

export const UNSAFE_serializeConfig = (config) => {
  const sanitizedConfig = mergeWith({}, omit(config, ["ctx"]), mergeCustomizerCleanJSX);
  const strConfig = serializeJs(sanitizedConfig, {
    space: 2,
    unsafe: true,
  });
  if (strConfig.includes("__WEBPACK_IMPORTED_MODULE_")) {
    throw new Error("Serialized config should not have references to modules imported from webpack.");
  }
  return strConfig;
};

export const UNSAFE_deserializeConfig = (strConfig, ctx) => {
  let config = eval("("+strConfig+")");
  config.ctx = ctx;
  return config;
};
