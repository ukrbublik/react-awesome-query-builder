import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFieldRawConfig, getFuncConfig, getFieldParts,
  isFieldDescendantOfField, getFieldId, _getFromConfigCache, _saveToConfigCache,
} from "./configUtils";
import last from "lodash/last";
import {completeFuncValue} from "./funcUtils";

export const selectTypes = [
  "select",
  "multiselect",
  "treeselect",
  "treemultiselect",
];


export const getOperatorsForType = (config, fieldType) => {
  return config.types[fieldType]?.operators || null;
};

export const getOperatorsForField = (config, field) => {
  const fieldConfig = getFieldConfig(config, field);
  const fieldOps = fieldConfig ? fieldConfig.operators : [];
  return fieldOps;
};

export const getFirstOperator = (config, field) => {
  const fieldOps = getOperatorsForField(config, field);
  return fieldOps?.[0] ?? null;
};

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

export const getFieldPartsConfigs = (field, config, parentField = null) => {
  if (!field)
    return null;
  const parentFieldDef = parentField && getFieldRawConfig(config, parentField) || null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = getFieldParts(field, config);
  const isDescendant = isFieldDescendantOfField(field, parentField, config);
  const parentParts = !isDescendant ? [] : getFieldParts(parentField, config);
  return parts
    .slice(parentParts.length)
    .map((_curr, ind, arr) => arr.slice(0, ind+1))
    .map((parts) => ({
      part: [...parentParts, ...parts].join(fieldSeparator),
      key: parts[parts.length - 1]
    }))
    .map(({part, key}) => {
      const cnf = getFieldRawConfig(config, part);
      return {key, cnf};
    })
    .map(({key, cnf}, ind, arr) => {
      const parentCnf = ind > 0 ? arr[ind - 1].cnf : parentFieldDef;
      return [key, cnf, parentCnf];
    });
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

function _getWidgetsAndSrcsForFieldOp (config, field, operator = null, valueSrc = null) {
  let widgets = [];
  let valueSrcs = [];
  if (!field)
    return {widgets, valueSrcs};
  const fieldCacheKey = getFieldId(field);
  const cacheKey = fieldCacheKey ? `${fieldCacheKey}__${operator}__${valueSrc}` : null;
  const cached = _getFromConfigCache(config, "_getWidgetsAndSrcsForFieldOp", cacheKey);
  if (cached)
    return cached;
  const isFuncArg = typeof field === "object" && (!!field.func && !!field.arg || field._isFuncArg);
  const fieldConfig = getFieldConfig(config, field);
  const opConfig = operator ? config.operators[operator] : null;
  
  if (fieldConfig?.widgets) {
    for (const widget in fieldConfig.widgets) {
      const widgetConfig = fieldConfig.widgets[widget];
      if (!config.widgets[widget]) {
        continue;
      }
      const widgetValueSrc = config.widgets[widget].valueSrc || "value";
      let canAdd = true;
      if (widget === "field") {
        canAdd = canAdd && filterValueSourcesForField(config, ["field"], fieldConfig).length > 0;
      }
      if (widget === "func") {
        canAdd = canAdd && filterValueSourcesForField(config, ["func"], fieldConfig).length > 0;
      }
      // If can't check operators, don't add
      // Func args don't have operators
      if (valueSrc === "value" && !widgetConfig.operators && !isFuncArg && field !== "!case_value")
        canAdd = false;
      if (widgetConfig.operators && operator)
        canAdd = canAdd && widgetConfig.operators.indexOf(operator) != -1;
      if (valueSrc && valueSrc != widgetValueSrc && valueSrc !== "const")
        canAdd = false;
      if (opConfig && opConfig.cardinality == 0 && (widgetValueSrc !== "value"))
        canAdd = false;
      if (canAdd) {
        widgets.push(widget);
        let canAddValueSrc = fieldConfig.valueSources?.indexOf(widgetValueSrc) != -1;
        if (opConfig?.valueSources?.indexOf(widgetValueSrc) == -1)
          canAddValueSrc = false;
        if (canAddValueSrc && !valueSrcs.find(v => v == widgetValueSrc))
          valueSrcs.push(widgetValueSrc);
      }
    }
  }

  const widgetWeight = (w) => {
    let wg = 0;
    if (fieldConfig.preferWidgets) {
      if (fieldConfig.preferWidgets.includes(w))
        wg += (10 - fieldConfig.preferWidgets.indexOf(w));
    } else if (w == fieldConfig.mainWidget) {
      wg += 100;
    }
    if (w === "field") {
      wg -= 1;
    }
    if (w === "func") {
      wg -= 2;
    }
    return wg;
  };

  widgets.sort((w1, w2) => (widgetWeight(w2) - widgetWeight(w1)));

  const res = { widgets, valueSrcs };
  _saveToConfigCache(config, "_getWidgetsAndSrcsForFieldOp", cacheKey, res);
  return res;
}

export const getWidgetsForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  return widgets;
};

export const filterValueSourcesForField = (config, valueSrcs, fieldDefinition) => {
  if (!fieldDefinition)
    return valueSrcs;
  let fieldType = fieldDefinition.type ?? fieldDefinition.returnType;
  if (fieldType === "!group") {
    // todo: aggregation can be not only number?
    fieldType = "number";
  }
  // const { _isCaseValue } = fieldDefinition;
  if (!valueSrcs)
    valueSrcs = Object.keys(config.settings.valueSourcesInfo);
  return valueSrcs.filter(vs => {
    let canAdd = true;
    if (vs === "field") {
      if (config.__fieldsCntByType) {
        // tip: LHS field can be used as arg in RHS function
        const minCnt = fieldDefinition._isFuncArg ? 0 : 1;
        canAdd = canAdd && config.__fieldsCntByType[fieldType] > minCnt;
      }
    }
    if (vs === "func") {
      if (fieldDefinition.funcs) {
        canAdd = canAdd && fieldDefinition.funcs.length > 0;
      }
      if (config.__funcsCntByType) {
        canAdd = canAdd && config.__funcsCntByType[fieldType] > 0;
      }
    }
    return canAdd;
  });
};

export const getValueSourcesForFieldOp = (config, field, operator, fieldDefinition = null) => {
  const {valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, null);
  const filteredValueSrcs = filterValueSourcesForField(config, valueSrcs, fieldDefinition);
  return filteredValueSrcs;
};

export const getWidgetForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  let widget = null;
  if (widgets.length)
    widget = widgets[0];
  return widget;
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
