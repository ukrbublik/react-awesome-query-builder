import Immutable from "immutable";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFieldRawConfig, getFuncConfig, getFieldParts,
  isFieldDescendantOfField, _getFromConfigCache, _saveToConfigCache, _getWidgetsAndSrcsForFieldOp, filterValueSourcesForField,
} from "./configUtils";
import {isObject} from "./stuff";
import last from "lodash/last";



export const calculateValueType = (value, valueSrc, config) => {
  let calculatedValueType = null;
  if (value) {
    if (valueSrc === "field") {
      const fieldConfig = getFieldConfig(config, value);
      if (fieldConfig) {
        calculatedValueType = fieldConfig.type;
      }
    } else if (valueSrc === "func") {
      const funcKey = value.get("func");
      if (funcKey) {
        const funcConfig = getFuncConfig(config, funcKey);
        if (funcConfig) {
          calculatedValueType = funcConfig.returnType || funcConfig.type;
        }
      }
    }
  }
  return calculatedValueType;
};

export const getFuncPathLabels = (field, config, parentField = null) => {
  return getFieldPathLabels(field, config, parentField, "funcs", "subfields");
};

export const getFieldPathLabels = (field, config, parentField = null, fieldsKey = "fields", subfieldsKey = "subfields") => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = getFieldParts(field, config);
  const parentParts = getFieldParts(parentField, config);
  const res = parts
    .slice(parentParts.length)
    .map((_curr, ind, arr) => arr.slice(0, ind+1))
    .map((parts) => [...parentParts, ...parts].join(fieldSeparator))
    .map(part => {
      const cnf = getFieldRawConfig(config, part, fieldsKey, subfieldsKey);
      return cnf && cnf.label || last(part.split(fieldSeparator));
    })
    .filter(label => label != null);
  return res;
};

export const getValueLabel = (config, field, operator, delta, valueSrc = null, isSpecialRange = false) => {
  // const isFuncArg = field && typeof field == "object" && !!field.func && !!field.arg;
  // const {showLabels} = config.settings;
  // const fieldConfig = getFieldConfig(config, field);
  const fieldWidgetConfig = getFieldWidgetConfig(config, field, operator, null, valueSrc) || {};
  const mergedOpConfig = getOperatorConfig(config, operator, field) || {};

  const cardinality = isSpecialRange ? 1 : mergedOpConfig.cardinality;
  let ret = null;
  if (cardinality > 1) {
    const valueLabels = fieldWidgetConfig.valueLabels || mergedOpConfig.valueLabels;
    if (valueLabels)
      ret = valueLabels[delta];
    if (ret && typeof ret !== "object") {
      ret = {label: ret, placeholder: ret};
    }
    if (!ret) {
      ret = {
        label: config.settings.valueLabel + " " + (delta+1),
        placeholder: config.settings.valuePlaceholder + " " + (delta+1),
      };
    }
  } else {
    let label = fieldWidgetConfig.valueLabel;
    let placeholder = fieldWidgetConfig.valuePlaceholder;
    // tip: this logic moved to extendFieldConfig(), see comment "label for func arg"
    // if (isFuncArg) {
    //   if (!label)
    //     label = fieldConfig.label || field.arg;
    //   if (!placeholder && !showLabels)
    //     placeholder = fieldConfig.label || field.arg;
    // }

    ret = {
      label: label || config.settings.valueLabel, 
      placeholder: placeholder || config.settings.valuePlaceholder,
    };
  }
  return ret;
};



// can use alias (fieldName)
// even if `parentField` is provided, `field` is still a full path
export const formatFieldName = (field, config, meta, parentField = null, options = {}) => {
  if (!field) return;
  const fieldDef = getFieldConfig(config, field) || {};
  const {fieldSeparator} = config.settings;
  const fieldParts = getFieldParts(field, config);
  let fieldName = Array.isArray(field) ? field.join(fieldSeparator) : field;
  if (options?.useTableName && fieldDef.tableName) { // legacy
    const fieldPartsCopy = [...fieldParts];
    fieldPartsCopy[0] = fieldDef.tableName;
    fieldName = fieldPartsCopy.join(fieldSeparator);
  }
  if (fieldDef.fieldName) {
    fieldName = fieldDef.fieldName;
  }
  if (parentField) {
    const parentFieldDef = getFieldConfig(config, parentField) || {};
    let parentFieldName = parentField;
    if (fieldName.indexOf(parentFieldName + fieldSeparator) == 0) {
      fieldName = fieldName.slice((parentFieldName + fieldSeparator).length);
      // fieldName = "#this." + fieldName; // ? for spel
    } else {
      if (fieldDef.fieldName) {
        // ignore
      } else {
        meta.errors.push(`Can't cut group ${parentFieldName} from field ${fieldName}`);
      }
    }
  }
  return fieldName;
};


/**
 * Used together with keepInputOnChangeFieldSrc
 */
export const isEmptyItem = (item, config) => {
  const type = item.get("type");
  const mode = item.getIn(["properties", "mode"]);
  if (type == "rule_group" && mode == "array") {
    return isEmptyRuleGroupExt(item, config);
  } else if (type == "group" || type == "rule_group") {
    return isEmptyGroup(item, config);
  } else {
    return isEmptyRule(item, config);
  }
};

const isEmptyRuleGroupExt = (item, config) => {
  const children = item.get("children1");
  const properties = item.get("properties");
  return isEmptyRuleGroupExtPropertiesAndChildren(properties.toObject(), children, config);
};

/**
 * Used to remove group ext without confirmation
 * 
 * If group operator is count, children can be empty.
 * If group operator is some/none/all, there should be at least one non-empty (even incomplete) child.
 */
export const isEmptyRuleGroupExtPropertiesAndChildren = (properties, children, config) => {
  const operator = properties.operator;
  const cardinality = config.operators[operator]?.cardinality ?? 1;
  const childrenAreRequired = cardinality == 0; // tip: for group operators some/none/all
  const filledParts = {
    group: !isEmptyRuleProperties(properties, config),
    children: !isEmptyGroupChildren(children, config),
  };
  const hasEnough = filledParts.group && (childrenAreRequired ? filledParts.children : true);
  return !hasEnough;
};

const isEmptyGroup = (group, config) => {
  const children = group.get("children1");
  return isEmptyGroupChildren(children, config);
};

/**
 * Used to remove group without confirmation
 * @returns {boolean} false if there is at least one (even incomplete) child
 */
export const isEmptyGroupChildren = (children, config) => {
  const hasEnough = children?.size > 0 && children.filter(ch => !isEmptyItem(ch, config)).size > 0;
  return !hasEnough;
};

const isEmptyRule = (rule, config) => {
  const properties = rule.get("properties");
  return isEmptyRuleProperties(properties?.toObject() || {}, config);
};

/**
 * Used to remove rule without confirmation
 * @param properties is an Object, but properties (like value) are Immutable
 * @returns {boolean} true if there is no enough data in rule
 */
export const isEmptyRuleProperties = (properties, config) => {
  const liteCheck = true;
  const scoreThreshold = 3;
  const compl = whatRulePropertiesAreCompleted(properties, config, liteCheck);
  const hasEnough = compl.score >= scoreThreshold;
  return !hasEnough;
};

/**
 * Used to validate rule
 * @param properties is an Object, but its properties (like `value`) are Immutable
 * @param liteCheck true can be used to check that rule has enough data to ask confirmation before delete
 * @return {{parts: {field: boolean, operator: boolean, value: boolean}, score: number}}
 */
export const whatRulePropertiesAreCompleted = ({
  field, fieldSrc, fieldType,
  operator,
  value, valueSrc, valueType,
}, config, liteCheck = false) => {
  const cardinality = config.operators[operator]?.cardinality ?? 1;
  const valueSrcs = valueSrc?.get ? valueSrc.toJS() : valueSrc;

  // tip: for liteCheck==true `score` should equal 3 if both LHS and RHS are at least partially filled
  const res = { parts: {}, score: 0 };
  res.parts.field = liteCheck ? (field != null) : isCompletedValue(field, fieldSrc, config);
  res.parts.operator = !!operator;
  res.parts.value = value?.filter((val, delta) => 
    isCompletedValue(val, valueSrcs?.[delta], config, liteCheck)
  )?.size >= (liteCheck ? Math.min(cardinality, 1) : cardinality);
  res.score = Object.keys(res.parts).filter(k => !!res.parts[k]).length;

  if (liteCheck && res.score < 3) {
    // Boost score to confirm deletion:
    // - if RHS is empty, but LHS is a completed function
    // - if LHS is empty (only fieldType is set), but there is a completed function in RHS
    const deepCheck = true;
    if (!res.parts.value && fieldSrc === "func" && isCompletedValue(field, fieldSrc, config, false, deepCheck)) {
      res.score++;
    }
    if (!res.parts.field) {
      value?.map((val, delta) => {
        if (valueSrcs?.[delta] === "func" && isCompletedValue(val, valueSrcs?.[delta], config, false, deepCheck)) {
          res.score++;
        }
      });
    }
  }

  return res;
};

const isCompletedValue = (value, valueSrc, config, liteCheck = false, deepCheck = true) => {
  if (!liteCheck && valueSrc == "func" && value) {
    const funcKey = value.get?.("func");
    const funcConfig = getFuncConfig(config, funcKey);
    if (funcConfig) {
      const args = value.get("args");
      for (const argKey in funcConfig.args) {
        const argConfig = funcConfig.args[argKey];
        const argVal = args ? args.get(argKey) : undefined;
        // const argDef = getFieldConfig(config, argConfig);
        const argValue = argVal ? argVal.get("value") : undefined;
        const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
        if (argValue == undefined && argConfig?.defaultValue === undefined && !argConfig?.isOptional) {
          // arg is not completed
          return false;
        }
        if (argValue != undefined) {
          if (!isCompletedValue(argValue, argValueSrc, config, deepCheck ? liteCheck : true)) {
            // arg is complex and is not completed
            return false;
          }
        }
      }
      // all args are completed
      return true;
    }
  }
  return value != undefined;
};

/**
 * @param {*} value
 * @param {'value'|'field'|'func'} valueSrc
 * @param {object} config
 * @return {* | undefined}  undefined if func value is not complete (missing required arg vals); can return completed value != value
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
    const filteredValueSources = filterValueSourcesForField(config, valueSources, null, argConfig);
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

// item - Immutable
export const getOneChildOrDescendant = (item) => {
  const children = item.get("children1");
  if (children?.size == 1) {
    const child = children.first();
    const childType = child.get("type");
    if (childType === "group") {
      return getOneChildOrDescendant(child);
    }
    return child;
  }
  return null;
};


/////  Func utils


export const getDefaultArgValue = ({defaultValue: value}) => {
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
    const valueSrc = value.getIn(["args", argKey, "valueSrc"]);
    const {valueSources} = argConfig;
    const filteredValueSources = filterValueSourcesForField(config, valueSources, null, argConfig);
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

export const setFuncDefaultArgs = (config, funcValue, funcConfig) => {
  if (funcConfig) {
    for (const argKey in funcConfig.args) {
      funcValue = setFuncDefaultArg(config, funcValue, funcConfig, argKey);
    }
  }
  return funcValue;
};

export const setFuncDefaultArg = (config, funcValue, funcConfig, argKey) => {
  const argConfig = funcConfig.args[argKey];
  const {valueSources, defaultValue} = argConfig;
  const filteredValueSources = filterValueSourcesForField(config, valueSources, null, argConfig);
  const firstValueSrc = filteredValueSources.length ? filteredValueSources[0] : undefined;
  const defaultValueSrc = defaultValue ? (isObject(defaultValue) && !!defaultValue.func ? "func" : "value") : undefined;
  const argDefaultValueSrc = defaultValueSrc || firstValueSrc;
  const hasValue = funcValue.getIn(["args", argKey]);
  if (!hasValue) {
    if (defaultValue !== undefined) {
      funcValue = funcValue.setIn(["args", argKey, "value"], getDefaultArgValue(argConfig));
    }
    if (argDefaultValueSrc) {
      funcValue = funcValue.setIn(["args", argKey, "valueSrc"], argDefaultValueSrc);
    }
  }
  return funcValue;
};
