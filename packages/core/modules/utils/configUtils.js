import merge from "lodash/merge";
import pick from "lodash/pick";
import mergeWith from "lodash/mergeWith";
import {widgetDefKeysToOmit, mergeCustomizerNoArrays} from "./stuff";
import {getWidgetForFieldOp} from "./ruleUtils";

export * from "./configSerialize";
export * from "./configExtend";
export * from "./configMemo";

export const _widgetDefKeysToOmit = widgetDefKeysToOmit; // for ui

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
  if (field == "!case_value") {
    return {
      type: "case_value",
      mainWidget: "case_value",
      widgets: {
        "case_value": config.widgets["case_value"]
      }
    };
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
  const typeConfig = config.types[funcConfig.returnType] || {};
  const ret = mergeWith({}, typeConfig, funcConfig, mergeCustomizerNoArrays);
  ret.type = funcConfig.returnType || funcConfig.type;
  return ret;
};

export const getFuncArgConfig = (config, funcKey, argKey) => {
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig)
    return null; //throw new Error(`Can't find func ${funcKey}, please check your config`);
  const argConfig = funcConfig.args && funcConfig.args[argKey] || null;
  if (!argConfig)
    return null; //throw new Error(`Can't find arg ${argKey} for func ${funcKey}, please check your config`);

  //merge, but don't merge operators (rewrite instead)
  const typeConfig = config.types[argConfig.type] || {};
  const ret = mergeWith({}, typeConfig, argConfig || {}, mergeCustomizerNoArrays);
  return ret;
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

export const getFieldCacheKey = (field) => {
  if (typeof field === "string" || Array.isArray(field)) {
    return `field:${getFieldPath(field)}`;
  }
  if (typeof field === "object" && field) {
    if (!field.func && !!field.type) {
      // it's already a config
      return null;
    }
    if (field.func) {
      if (field.func && field.arg) {
        // it's func arg
        return `arg:${getFieldPath(field.func)}__${field.arg}`;
      } else {
        // it's field func
        return `func:${getFieldPath(field.func)}`;
      }
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
    const fieldConfig = getFieldConfig(config, field);
    const widget = getWidgetForFieldOp(config, field, operator, null);
    const widgetConfig = config.widgets[widget] || {};
    const fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
    const widgetOpProps = (widgetConfig.opProps || {})[operator];
    const fieldWidgetOpProps = (fieldWidgetConfig.opProps || {})[operator];
    const mergedOpConfig = merge({}, opConfig, widgetOpProps, fieldWidgetOpProps);
    return mergedOpConfig;
  } else {
    return opConfig;
  }
};

export const getFieldWidgetConfig = (config, field, operator, widget = null, valueSrc = null) => {
  if (!field)
    return null;
  if (!(operator || widget) && valueSrc !== "const" && field !== "!case_value")
    return null;
  const fieldConfig = getFieldConfig(config, field);
  if (!widget)
    widget = getWidgetForFieldOp(config, field, operator, valueSrc);
  const widgetConfig = config.widgets[widget] || {};
  const fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
  const fieldWidgetProps = (fieldWidgetConfig.widgetProps || {});
  const valueFieldSettings = (valueSrc === "value" || !valueSrc) && fieldConfig?.fieldSettings || {}; // useful to take 'validateValue'
  const mergedConfig = merge({}, widgetConfig, fieldWidgetProps, valueFieldSettings);
  return mergedConfig;
};

export const getFirstField = (config, parentRuleGroupPath = null) => {
  const fieldSeparator = config.settings.fieldSeparator;
  const parentPathArr = getFieldParts(parentRuleGroupPath, config);
  const parentField = parentRuleGroupPath ? getFieldRawConfig(config, parentRuleGroupPath) : config;

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
