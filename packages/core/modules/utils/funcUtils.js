
import {getFieldConfig, getFuncConfig} from "../utils/configUtils";
import {filterValueSourcesForField} from "../utils/ruleUtils";
import Immutable from "immutable";

// helpers
const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

/**
 * @param {*} value
 * @param {string} valueSrc - 'value' | 'field' | 'func'
 * @param {object} config
 * @return {* | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */
export const completeValue = (value, valueSrc, config) => {
  if (valueSrc == "func")
    return completeFuncValue(value, config);
  else
    return value;
};

/**
 * @param {Immutable.Map} value
 * @param {object} config
 * @return {Immutable.Map | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */
export const completeFuncValue = (value, config) => {
  const _checkFuncValue = (value) => {
    if (!value)
      return undefined;
    const funcKey = value.get("func");
    const funcConfig = funcKey && getFuncConfig(config, funcKey);
    if (!funcConfig)
      return undefined;
    let complValue = value;
    let tmpHasOptional = false;
    for (const argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      const {valueSources, isOptional, defaultValue} = argConfig;
      const filteredValueSources = filterValueSourcesForField(config, valueSources, argConfig);
      const args = complValue.get("args");
      const argDefaultValueSrc = filteredValueSources.length == 1 ? filteredValueSources[0] : undefined;
      const argVal = args ? args.get(argKey) : undefined;
      const argValue = argVal ? argVal.get("value") : undefined;
      const argValueSrc = (argVal ? argVal.get("valueSrc") : undefined) || argDefaultValueSrc;
      if (argValue !== undefined) {
        const completeArgValue = completeValue(argValue, argValueSrc, config);
        if (completeArgValue === undefined) {
          return undefined;
        } else if (completeArgValue !== argValue) {
          complValue = complValue.setIn(["args", argKey, "value"], completeArgValue);
        }
        if (tmpHasOptional) {
          // has gap
          return undefined;
        }
      } else if (defaultValue !== undefined && !isObject(defaultValue)) {
        complValue = complValue.setIn(["args", argKey, "value"], getDefaultArgValue(argConfig));
        complValue = complValue.setIn(["args", argKey, "valueSrc"], "value");
      } else if (isOptional) {
        // optional
        tmpHasOptional = true;
      } else {
        // missing value
        return undefined;
      }
    }
    return complValue;
  };

  return _checkFuncValue(value);
};


/**
 * @param {Immutable.Map} value 
 * @return {array} - [usedFields, badFields]
 */
const getUsedFieldsInFuncValue = (value, config) => {
  let usedFields = [];
  let badFields = [];

  const _traverse = (value) => {
    const args = value && value.get("args");
    if (!args) return;
    for (const arg of args.values()) {
      if (arg.get("valueSrc") == "field") {
        const rightField = arg.get("value");
        if (rightField) {
          const rightFieldDefinition = config ? getFieldConfig(config, rightField) : undefined;
          if (config && !rightFieldDefinition)
            badFields.push(rightField);
          else
            usedFields.push(rightField);
        }
      } else if (arg.get("valueSrc") == "func") {
        _traverse(arg.get("value"));
      }
    }
  };

  _traverse(value);

  return [usedFields, badFields];
};


/**
 * Used @ FuncWidget
 * @param {Immutable.Map} value 
 * @param {string} funcKey 
 * @param {object} config 
 */
export const setFunc = (value, funcKey, config) => {
  const fieldSeparator = config.settings.fieldSeparator;
  value = value || new Immutable.Map();
  if (Array.isArray(funcKey)) {
    // fix for cascader
    funcKey = funcKey.join(fieldSeparator);
  }
  value = value.set("func", funcKey);
  value = value.set("args", new Immutable.Map());

  // defaults
  const funcConfig = funcKey && getFuncConfig(config, funcKey);
  if (funcConfig) {
    for (const argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      const {valueSources, defaultValue} = argConfig;
      const filteredValueSources = filterValueSourcesForField(config, valueSources, argConfig);
      const firstValueSrc = filteredValueSources.length ? filteredValueSources[0] : undefined;
      const defaultValueSrc = defaultValue ? (isObject(defaultValue) && !!defaultValue.func ? "func" : "value") : undefined;
      const argDefaultValueSrc = defaultValueSrc || firstValueSrc;
      if (defaultValue !== undefined) {
        value = value.setIn(["args", argKey, "value"], getDefaultArgValue(argConfig));
      }
      if (argDefaultValueSrc) {
        value = value.setIn(["args", argKey, "valueSrc"], argDefaultValueSrc);
      }
    }
  }

  return value;
};

const getDefaultArgValue = ({defaultValue: value}) => {
  if (isObject(value) && !Immutable.Map.isMap(value) && value.func) {
    return Immutable.fromJS(value, function (k, v) {
      return Immutable.Iterable.isIndexed(v) ? v.toList() : v.toOrderedMap();
    });
  }
  return value;
};

/**
* Used @ FuncWidget
* @param {Immutable.Map} value 
* @param {string} argKey 
* @param {*} argVal 
* @param {object} argConfig 
*/
export const setArgValue = (value, argKey, argVal, argConfig, config) => {
  if (value && value.get("func")) {
    value = value.setIn(["args", argKey, "value"], argVal);

    // set default arg value sorce
    const {valueSources} = argConfig;
    const filteredValueSources = filterValueSourcesForField(config, valueSources, argConfig);
    const argDefaultValueSrc = filteredValueSources.length == 1 ? filteredValueSources[0] : undefined;
    if (argDefaultValueSrc) {
      value = value.setIn(["args", argKey, "valueSrc"], argDefaultValueSrc);
    }
  }
  return value;
};

/**
* Used @ FuncWidget
* @param {Immutable.Map} value 
* @param {string} argKey 
* @param {string} argValSrc 
* @param {object} argConfig 
*/
export const setArgValueSrc = (value, argKey, argValSrc, _argConfig, _config) => {
  if (value && value.get("func")) {
    value = value.setIn(["args", argKey], new Immutable.Map({valueSrc: argValSrc}));
  }
  return value;
};
