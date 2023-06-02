
import {getFieldConfig, getFuncConfig, getFuncSignature} from "../utils/configUtils";
import {filterValueSourcesForField, completeValue, selectTypes} from "../utils/ruleUtils";
import {validateValue} from "../utils/validation";
import Immutable from "immutable";

// helpers
const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));


/**
 * @param {Immutable.Map} value
 * @param {object} config
 * @return {Immutable.Map | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */
export const completeFuncValue = (value, config) => {
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
  const oldFuncKey = value.get("func");
  const oldArgs = value.get("args");
  value = value.set("func", funcKey);

  const funcConfig = funcKey && getFuncConfig(config, funcKey);
  const newFuncSignature = funcKey && getFuncSignature(config, funcKey);
  const oldFuncSignature = oldFuncKey && getFuncSignature(config, oldFuncKey);
  const keepArgsKeys = getCompatibleArgsOnFuncChange(oldFuncSignature, newFuncSignature, oldArgs, config);
  if (keepArgsKeys.length) {
    const argsKeys = Object.keys(newFuncSignature.args);
    const deleteArgsKeys = argsKeys.filter(k => !keepArgsKeys.includes(k));
    value = deleteArgsKeys.reduce((value, k) => value.deleteIn(["args", k]), value);
  } else {
    value = value.set("args", new Immutable.Map());
  }

  // defaults
  if (funcConfig) {
    for (const argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      const {valueSources, defaultValue} = argConfig;
      const filteredValueSources = filterValueSourcesForField(config, valueSources, argConfig);
      const firstValueSrc = filteredValueSources.length ? filteredValueSources[0] : undefined;
      const defaultValueSrc = defaultValue ? (isObject(defaultValue) && !!defaultValue.func ? "func" : "value") : undefined;
      const argDefaultValueSrc = defaultValueSrc || firstValueSrc;
      const hasValue = value.getIn(["args", argKey]);
      if (!hasValue) {
        if (defaultValue !== undefined) {
          value = value.setIn(["args", argKey, "value"], getDefaultArgValue(argConfig));
        }
        if (argDefaultValueSrc) {
          value = value.setIn(["args", argKey, "valueSrc"], argDefaultValueSrc);
        }
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

    // set default arg value source
    const valueSrc = value.getIn(["args", argKey, "value"]);
    const {valueSources} = argConfig;
    const filteredValueSources = filterValueSourcesForField(config, valueSources, argConfig);
    let argDefaultValueSrc = filteredValueSources.length == 1 ? filteredValueSources[0] : undefined;
    if (!argDefaultValueSrc && filteredValueSources.includes("value")) {
      argDefaultValueSrc = "value";
    }
    if (!valueSrc && argDefaultValueSrc) {
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

// see getFuncSignature in configUtils
export const getCompatibleArgsOnFuncChange = (s1, s2, argVals, config) => {
  if (s1?.returnType != s2?.returnType)
    return [];
  const checkIndexes = false;
  const keys = Object.keys(s2.args);
  const compatibleKeys = keys.filter((k, i) => {
    const arg2 = s2.args[k];
    const arg1 = s1.args[k];
    const oldInd = Object.keys(s1.args).indexOf(k);
    if (!arg1 && (arg2.defaultValue !== undefined || arg2.isOptional)) {
      return true;
    }
    if (checkIndexes && i !== oldInd) {
      return false;
    }
    if (arg1?.type != arg2.type)
      return false;
    if (selectTypes.includes(arg2.type)) {
      if (!arg1.listValuesType || arg1.listValuesType !== arg2.listValuesType)
        return false;
    }
    if (argVals) {
      const argVal = argVals.get(k);
      const argValue = argVal?.get("value");
      const argValueSrc = argVal?.get("valueSrc");
      if (arg2.valueSources && !arg2.valueSources.includes(argValueSrc))
        return false;
      const leftField = null, operator = null, argDef = arg2, asyncListValues = null, canFix = false, isEndValue = true;
      const [argValidError, _fixedArgVal] = validateValue(
        config, leftField, argDef, operator, argValue, argDef.type, argValueSrc, asyncListValues, canFix, isEndValue, false
      );
      if (argValidError)
        return false;
    }

    return true;
  });
  return compatibleKeys;
};
