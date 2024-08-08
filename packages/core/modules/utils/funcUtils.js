
import {getFieldConfig, getFuncConfig, getFuncSignature, selectTypes} from "../utils/configUtils";
import {getDefaultArgValue, setArgValue, setFuncDefaultArgs, setFuncDefaultArg} from "../utils/ruleUtils";
import {validateValue} from "../utils/validation";
import Immutable from "immutable";


export { setArgValue, setFuncDefaultArgs, setFuncDefaultArg, getDefaultArgValue };


/**
 * @param {Immutable.Map} value 
 * @return {array} - [usedFields, badFields]
 */
// const getUsedFieldsInFuncValue = (value, config) => {
//   let usedFields = [];
//   let badFields = [];

//   const _traverse = (value) => {
//     const args = value && value.get("args");
//     if (!args) return;
//     for (const arg of args.values()) {
//       if (arg.get("valueSrc") == "field") {
//         const rightField = arg.get("value");
//         if (rightField) {
//           const rightFieldDefinition = config ? getFieldConfig(config, rightField) : undefined;
//           if (config && !rightFieldDefinition)
//             badFields.push(rightField);
//           else
//             usedFields.push(rightField);
//         }
//       } else if (arg.get("valueSrc") == "func") {
//         _traverse(arg.get("value"));
//       }
//     }
//   };

//   _traverse(value);

//   return [usedFields, badFields];
// };


/**
 * Used @ FuncWidget
 * @param {Immutable.Map} value 
 * @param {string} funcKey 
 * @param {object} config 
 * @param {boolean} canFixArgs
 */
export const setFunc = (value, funcKey, config, canFixArgs) => {
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
  const keepArgsKeys = getCompatibleArgsOnFuncChange(oldFuncSignature, newFuncSignature, oldArgs, config, canFixArgs);
  if (keepArgsKeys.length) {
    const argsKeys = Object.keys(newFuncSignature.args);
    const deleteArgsKeys = argsKeys.filter(k => !keepArgsKeys.includes(k));
    value = deleteArgsKeys.reduce((value, k) => value.deleteIn(["args", k]), value);
  } else {
    value = value.set("args", new Immutable.Map());
  }

  // defaults
  value = setFuncDefaultArgs(config, value, funcConfig);

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
export const getCompatibleArgsOnFuncChange = (s1, s2, argVals, config, canFixArgs = false) => {
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
      if (argValueSrc && arg2.valueSources && !arg2.valueSources.includes(argValueSrc))
        return false;
      const leftField = null, operator = null, argDef = arg2, asyncListValues = null, isEndValue = true;
      const [_fixedArgVal, argValidErrors] = validateValue(
        config, leftField, argDef, operator, argValue, argDef.type, argValueSrc, asyncListValues, canFixArgs, isEndValue
      );
      if (argValidErrors?.filter(e => !e.fixed)?.length)
        return false;
    }

    return true;
  });
  return compatibleKeys;
};
