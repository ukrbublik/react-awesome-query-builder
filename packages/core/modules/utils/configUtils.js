import pick from "lodash/pick";
import {widgetDefKeysToOmit, omit} from "./stuff";

export const _widgetDefKeysToOmit = widgetDefKeysToOmit; // for ui

export const configKeys = ["conjunctions", "fields", "types", "operators", "widgets", "settings", "funcs", "ctx"];

export const selectTypes = [
  "select",
  "multiselect",
  "treeselect",
  "treemultiselect",
];

export function* iterateFuncs(config) {
  yield* _iterateFields(config, config.funcs || {}, []);
}

export function* iterateFields(config) {
  yield* _iterateFields(config, config.fields || {}, []);
}

function* _iterateFields(config, subfields, path, subfieldsKey = "subfields") {
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  for (const fieldKey in subfields) {
    const fieldConfig = subfields[fieldKey];
    if (fieldConfig[subfieldsKey]) {
      yield* _iterateFields(config, fieldConfig[subfieldsKey], [...path, fieldKey], subfieldsKey);
    } else {
      yield [
        [...path, fieldKey].join(fieldSeparator),
        fieldConfig
      ];
    }
  }
}

export const getFieldRawConfig = (config, field, fieldsKey = "fields", subfieldsKey = "subfields") => {
  if (!field)
    return null;
  if (field === "!case_value") {
    return config?.settings?.caseValueField;
  }
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  const parts = getFieldParts(field, config);
  const targetFields = config[fieldsKey];
  if (!targetFields)
    return null;

  let fields = targetFields;
  let fieldConfig = null;
  let path = [];
  for (let i = 0 ; i < parts.length ; i++) {
    const part = parts[i];
    path.push(part);
    const pathKey = path.join(fieldSeparator);
    fieldConfig = fields[pathKey];
    if (i < parts.length-1) {
      if (fieldConfig && fieldConfig[subfieldsKey]) {
        fields = fieldConfig[subfieldsKey];
        path = [];
      } else {
        fieldConfig = null;
      }
    }
  }

  return fieldConfig;
};


// if `field` is alias (fieldName), convert to original full path
export const normalizeField = (config, field, parentField = null) => {
  // tip: if parentField is present, field is not full path
  const fieldSeparator = config.settings.fieldSeparator;
  const path = [
    parentField,
    ...field.split(fieldSeparator)
  ].filter(f => f != null);
  const findStr = field;
  const normalizedPath = config.__fieldNames[findStr]?.find?.(({inGroup}) => {
    if (inGroup)
      return parentField?.startsWith(inGroup);
    return true;
  })?.fullPath;
  return (normalizedPath || path).join(fieldSeparator);
};

export const getFuncSignature = (config, func) => {
  if (!func)
    return null;
  const funcConfig = getFieldRawConfig(config, func, "funcs", "subfields");
  if (!funcConfig)
    return null;
  const {
    returnType,
    args,
  } = funcConfig;
  const argsSignature = Object.fromEntries(Object.entries(args || {}).map(([k, v]) => {
    const argSignature = pick(v, [
      "type",
      "valueSources",
      "defaultValue",
      "fieldSettings",
      // "asyncListValues", // not supported
      "isOptional",
      // to get proper caching key
      "_funcKey",
      "_argKey",
      "_isFuncArg",
    ]);
    return [k, argSignature];
  }));
  const signature = {
    returnType,
    args: argsSignature,
  };
  return signature;
};

export const getFuncConfig = (config, func) => {
  if (!func)
    return null;
  const funcConfig = getFieldRawConfig(config, func, "funcs", "subfields");
  if (!funcConfig)
    return null; //throw new Error("Can't find func " + func + ", please check your config");
  return funcConfig;
};

export const getFuncArgConfig = (config, funcKey, argKey) => {
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig)
    return null; //throw new Error(`Can't find func ${funcKey}, please check your config`);
  const argConfig = funcConfig.args && funcConfig.args[argKey] || null;
  if (!argConfig)
    return null; //throw new Error(`Can't find arg ${argKey} for func ${funcKey}, please check your config`);
  return argConfig;
};

export const isFieldDescendantOfField = (field, parentField, config = null) => {
  if (!parentField) return false;
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  const path = getFieldPath(field, config);
  const parentPath = getFieldPath(parentField, config);
  return path.startsWith(parentPath + fieldSeparator);
};

export const getFieldPath = (field, config = null) => {
  if (typeof field === "string")
    return field;
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  return getFieldParts(field, config).join(fieldSeparator);
};

export const getFieldParts = (field, config = null) => {
  if (!field)
    return [];
  if (Array.isArray(field))
    return field;
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  if (field?.func) {
    return Array.isArray(field.func) ? field.func : field.func.split(fieldSeparator);
  }
  if (field?.get?.("func")) { // immutable
    return field?.get?.("func").split(fieldSeparator);
  }
  return field?.split?.(fieldSeparator) || [];
};

export const getFieldPathParts = (field, config, onlyKeys = false) => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = getFieldParts(field, config);
  if (onlyKeys)
    return parts;
  else
    return parts
      .map((_curr, ind, arr) => arr.slice(0, ind+1))
      .map((parts) => parts.join(fieldSeparator));
};

export const getFieldId = (field) => {
  if (typeof field === "string" || Array.isArray(field)) {
    return `field:${getFieldPath(field)}`;
  }
  if (typeof field === "object" && field) {
    if (field._funcKey && field._argKey) {
      // it's func arg config
      return `arg:${getFieldPath(field._funcKey)}__${field._argKey}`;
    }
    if (field._funcKey) {
      // it's func config
      return `func:${getFieldPath(field._funcKey)}`;
    }
    if (field.func && field.arg) {
      // it's func arg
      return `arg:${getFieldPath(field.func)}__${field.arg}`;
    }
    if (field.func) {
      // it's field func
      return `func:${getFieldPath(field.func)}`;
    }
    if (field.type) {
      // it's already a config
      return null;
    }
  }
  if (field?.get?.("func")) { // immutable
    if (field?.get("arg")) {
      // it's func arg
      return `arg:${getFieldPath(field.get("func"))}__${field.get("arg")}`;
    } else {
      // it's field func
      return `func:${getFieldPath(field.get("func"))}`;
    }
  }
  return null;
};

export const _getFromConfigCache = (config, bucketKey, cacheKey) => {
  return config.__cache?.[bucketKey]?.[cacheKey];
};

export const _saveToConfigCache = (config, bucketKey, cacheKey, value) => {
  if (!config.__cache || !cacheKey) {
    return;
  }
  if (!config.__cache[bucketKey]) {
    config.__cache[bucketKey] = {};
  }
  config.__cache[bucketKey][cacheKey] = value;
};

export const getFieldSrc = (field) => {
  if (!field)
    return null;
  if (typeof field === "object") {
    if (!field.func && !!field.type) {
      // it's already a config
      return "field";
    }
    if (field.func) {
      if (field.func && field.arg) {
        // it's func arg
        return null;
      } else {
        // it's field func
        return "func";
      }
    }
  }
  if (field?.get?.("func")) { // immutable
    if (field?.get("arg")) {
      // it's func arg
      return null;
    } else {
      // it's field func
      return "func";
    }
  }
  return "field";
};

export const getFieldConfig = (config, field) => {
  if (!field)
    return null;
  if (typeof field == "object") {
    if (!field.func && !!field.type) {
      // it's already a config
      return field;
    }
    if (field.func) {
      if (field.func && field.arg) {
        // it's func arg
        return getFuncArgConfig(config, field.func, field.arg);
      } else {
        // it's field func
        return getFuncConfig(config, field.func);
      }
    }
  }
  if (field?.get?.("func")) { // immutable
    if (field?.get("arg")) {
      // it's func arg
      return getFuncArgConfig(config, field.get("func"), field.get("arg"));
    } else {
      // it's field func
      return getFuncConfig(config, field.get("func"));
    }
  }

  const fieldConfig = getFieldRawConfig(config, field);
  if (!fieldConfig)
    return null; //throw new Error("Can't find field " + field + ", please check your config");
  return fieldConfig;
};

export const getOperatorConfig = (config, operator, field = null) => {
  if (!operator)
    return null;
  const opConfig = config.operators[operator];
  if (field) {
    const fieldCacheKey = getFieldId(field);
    const cacheKey = fieldCacheKey ? `${fieldCacheKey}__${operator}` : null;
    const cached = _getFromConfigCache(config, "getOperatorConfig", cacheKey);
    if (cached)
      return cached;
    const fieldConfig = getFieldConfig(config, field);
    const widget = getWidgetForFieldOp(config, field, operator, null);
    const widgetConfig = config.widgets[widget] || {};
    const fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
    const widgetOpProps = widgetConfig.opProps?.[operator] || {};
    const fieldWidgetOpProps = fieldWidgetConfig.opProps?.[operator] || {};
    const mergedConfig = {
      ...opConfig,
      ...widgetOpProps,
      ...fieldWidgetOpProps,
    };
    _saveToConfigCache(config, "getOperatorConfig", cacheKey, mergedConfig);
    return mergedConfig;
  } else {
    return opConfig;
  }
};

export const getFieldWidgetConfig = (config, field, operator = null, widget = null, valueSrc = null, meta = {}) => {
  if (!field)
    return null;
  const fieldConfig = getFieldConfig(config, field);
  const fieldCacheKey = getFieldId(field);
  if (!widget) {
    widget = getWidgetForFieldOp(config, field, operator, valueSrc);
  }
  const cacheKey = fieldCacheKey ? `${fieldCacheKey}__${operator}__${widget}__${valueSrc}` : null;
  const cached = _getFromConfigCache(config, "getFieldWidgetConfig", cacheKey);
  if (cached)
    return cached;
  const widgetConfig = config.widgets[widget] || {};
  const fieldWidgetConfig = fieldConfig?.widgets?.[widget] || {};
  const fieldWidgetProps = fieldWidgetConfig.widgetProps || {};
  const valueFieldSettings = (valueSrc === "value" || !valueSrc) ? fieldConfig?.fieldSettings : {}; // useful to take 'validateValue'
  let mergedConfig = {
    ...widgetConfig,
    ...fieldWidgetConfig,
    ...fieldWidgetProps,
    ...valueFieldSettings,
  };
  _saveToConfigCache(config, "getFieldWidgetConfig", cacheKey, mergedConfig);
  if (meta.forExport) {
    mergedConfig = omit(mergedConfig, "factory");
  }
  return mergedConfig;
};

export const getFirstField = (config, parentRuleGroupField = null) => {
  const fieldSeparator = config.settings.fieldSeparator;
  const parentPathArr = getFieldParts(parentRuleGroupField, config);
  const parentField = parentRuleGroupField ? getFieldRawConfig(config, parentRuleGroupField) : config;

  let firstField = parentField, key = null, keysPath = [];
  do {
    const subfields = firstField === config ? config.fields : firstField?.subfields;
    if (!subfields || !Object.keys(subfields).length) {
      firstField = key = null;
      break;
    }
    key = Object.keys(subfields)[0];
    keysPath.push(key);
    firstField = subfields[key];
  } while (firstField.type == "!struct" || firstField.type == "!group");
  return (parentPathArr || []).concat(keysPath).join(fieldSeparator);
};

export function _getWidgetsAndSrcsForFieldOp (config, field, operator = null, valueSrc = null) {
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

export const getWidgetForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  let widget = null;
  if (widgets.length)
    widget = widgets[0];
  return widget;
};

export const getValueSourcesForFieldOp = (config, field, operator, fieldDefinition = null) => {
  const {valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, null);
  const filteredValueSrcs = filterValueSourcesForField(config, valueSrcs, fieldDefinition);
  return filteredValueSrcs;
};

export const getWidgetsForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  return widgets;
};

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
