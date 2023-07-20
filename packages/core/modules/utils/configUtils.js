import merge from "lodash/merge";
import pick from "lodash/pick";
import uuid from "../utils/uuid";
import mergeWith from "lodash/mergeWith";
import {settings as defaultSettings} from "../config/default";
import moment from "moment";
import {mergeArraysSmart, logger, widgetDefKeysToOmit, deepFreeze} from "./stuff";
import {getWidgetForFieldOp} from "./ruleUtils";
import clone from "clone";

import { compileConfig } from "./configSerialize";
export * from "./configSerialize";

/////////////

export const extendConfig = (config, configId, canCompile = true) => {
  //operators, defaultOperator - merge
  //widgetProps (including valueLabel, valuePlaceholder, hideOperator, operatorInlineLabel) - concrete by widget

  if (config.__configId) {
    return config;
  }

  // Clone (and compile if need)
  if (canCompile && config.settings.useConfigCompress) {
    if (config.__compliled) {
      // already compiled
      config = clone(config);
    } else {
      // will be cloned and compiled
      config = compileConfig(config);
    }
  } else {
    config = clone(config);
  }

  config.settings = mergeWith({}, defaultSettings, config.settings, mergeCustomizerNoArrays);

  config.__fieldsCntByType = {};
  config.__funcsCntByType = {};
  config.__fieldNames = {};

  _extendTypesConfig(config.types, config);
  _extendFieldsConfig(config.fields, config);
  _extendFuncArgsConfig(config.funcs, config);

  const momentLocale = config.settings.locale.moment;
  if (momentLocale) {
    moment.locale(momentLocale);
  }

  Object.defineProperty(config, "__configId", {
    enumerable: false,
    writable: false,
    value: configId || uuid()
  });

  deepFreeze(config);

  return config;
};

function _extendTypesConfig(typesConfig, config) {
  for (let type in typesConfig) {
    let typeConfig = typesConfig[type];
    _extendTypeConfig(type, typeConfig, config);
  }
}

function _extendTypeConfig(type, typeConfig, config) {
  let operators = null, defaultOperator = null;
  typeConfig.mainWidget = typeConfig.mainWidget || Object.keys(typeConfig.widgets).filter(w => w != "field" && w != "func")[0];
  for (let widget in typeConfig.widgets) {
    let typeWidgetConfig = typeConfig.widgets[widget];
    if (typeWidgetConfig.operators) {
      let typeWidgetOperators = typeWidgetConfig.operators;
      if (typeConfig.excludeOperators) {
        typeWidgetOperators = typeWidgetOperators.filter(op => !typeConfig.excludeOperators.includes(op));
      }
      operators = mergeArraysSmart(operators, typeWidgetOperators);
    }
    if (typeWidgetConfig.defaultOperator)
      defaultOperator = typeWidgetConfig.defaultOperator;
    if (widget == typeConfig.mainWidget) {
      typeWidgetConfig = merge({}, {widgetProps: typeConfig.mainWidgetProps || {}}, typeWidgetConfig);
    }
    typeConfig.widgets[widget] = typeWidgetConfig;
  }
  if (!typeConfig.valueSources)
    typeConfig.valueSources = Object.keys(config.settings.valueSourcesInfo);
  for (let valueSrc of typeConfig.valueSources) {
    if (valueSrc != "value" && !typeConfig.widgets[valueSrc]) {
      typeConfig.widgets[valueSrc] = {
      };
    }
  }
  if (!typeConfig.operators && operators)
    typeConfig.operators = Array.from(new Set(operators)); //unique
  if (!typeConfig.defaultOperator && defaultOperator)
    typeConfig.defaultOperator = defaultOperator;
}

function _extendFieldsConfig(subconfig, config, path = []) {
  for (let field in subconfig) {
    _extendFieldConfig(subconfig[field], config, [...path, field]);
    if (subconfig[field].subfields) {
      _extendFieldsConfig(subconfig[field].subfields, config, [...path, field]);
    }
  }
}

function _extendFuncArgsConfig(subconfig, config, path = []) {
  if (!subconfig) return;
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  for (let funcKey in subconfig) {
    const funcPath = [...path, funcKey].join(fieldSeparator);
    const funcDef = subconfig[funcKey];
    if (funcDef.returnType) {
      if (!config.__funcsCntByType[funcDef.returnType])
        config.__funcsCntByType[funcDef.returnType] = 0;
      config.__funcsCntByType[funcDef.returnType]++;
    }
    for (let argKey in funcDef.args) {
      _extendFieldConfig(funcDef.args[argKey], config, null, true);
    }

    // isOptional can be only in the end
    if (funcDef.args) {
      const argKeys = Object.keys(funcDef.args);
      let tmpIsOptional = true;
      for (const argKey of argKeys.reverse()) {
        const argDef = funcDef.args[argKey];
        if (!tmpIsOptional && argDef.isOptional) {
          logger.info(`Arg ${argKey} for func ${funcPath} can't be optional`);
          delete argDef.isOptional;
        }
        if (!argDef.isOptional)
          tmpIsOptional = false;
      }
    }

    if (funcDef.subfields) {
      _extendFuncArgsConfig(funcDef.subfields, config, [...path, funcKey]);
    }
  }
}

function _extendFieldConfig(fieldConfig, config, path = null, isFuncArg = false) {
  let operators = null, defaultOperator = null;
  const typeConfig = config.types[fieldConfig.type];
  const excludeOperatorsForField = fieldConfig.excludeOperators || [];
  if (fieldConfig.type != "!struct" && fieldConfig.type != "!group") {
    const keysToPutInFieldSettings = ["listValues", "treeValues", "allowCustomValues", "validateValue"];
    if (!fieldConfig.fieldSettings)
      fieldConfig.fieldSettings = {};
    for (const k of keysToPutInFieldSettings) {
      if (fieldConfig[k]) {
        fieldConfig.fieldSettings[k] = fieldConfig[k];
        delete fieldConfig[k];
      }
    }

    // normalize listValues
    if (fieldConfig.fieldSettings.listValues) {
      if (config.settings.normalizeListValues) {
        fieldConfig.fieldSettings.listValues = config.settings.normalizeListValues.call(
          config.ctx,
          fieldConfig.fieldSettings.listValues, fieldConfig.type, fieldConfig.fieldSettings
        );
      }
    }
    // same for treeValues
    if (fieldConfig.fieldSettings.treeValues) {
      if (config.settings.normalizeListValues) {
        fieldConfig.fieldSettings.treeValues = config.settings.normalizeListValues.call(
          config.ctx,
          fieldConfig.fieldSettings.treeValues, fieldConfig.type, fieldConfig.fieldSettings
        );
      }
    }

    if (!typeConfig) {
      //console.warn(`No type config for ${fieldConfig.type}`);
      fieldConfig.disabled = true;
      return;
    }
    if (!isFuncArg) {
      if (!config.__fieldsCntByType[fieldConfig.type])
        config.__fieldsCntByType[fieldConfig.type] = 0;
      config.__fieldsCntByType[fieldConfig.type]++;
    }

    if (!fieldConfig.widgets)
      fieldConfig.widgets = {};
    if (isFuncArg)
      fieldConfig._isFuncArg = true;
    fieldConfig.mainWidget = fieldConfig.mainWidget || typeConfig.mainWidget;
    fieldConfig.valueSources = fieldConfig.valueSources || typeConfig.valueSources;
    const excludeOperatorsForType = typeConfig.excludeOperators || [];
    for (let widget in typeConfig.widgets) {
      let fieldWidgetConfig = fieldConfig.widgets[widget] || {};
      const typeWidgetConfig = typeConfig.widgets[widget] || {};
      if (!isFuncArg) {
        //todo: why I've excluded isFuncArg ?
        const excludeOperators = [...excludeOperatorsForField, ...excludeOperatorsForType];
        const shouldIncludeOperators = fieldConfig.preferWidgets
          && (widget == "field" || fieldConfig.preferWidgets.includes(widget))
          || excludeOperators.length > 0;
        if (fieldWidgetConfig.operators) {
          const addOperators = fieldWidgetConfig.operators.filter(o => !excludeOperators.includes(o));
          operators = [...(operators || []), ...addOperators];
        } else if (shouldIncludeOperators && typeWidgetConfig.operators) {
          const addOperators = typeWidgetConfig.operators.filter(o => !excludeOperators.includes(o));
          operators = [...(operators || []), ...addOperators];
        }
        if (fieldWidgetConfig.defaultOperator)
          defaultOperator = fieldWidgetConfig.defaultOperator;
      }

      if (widget == fieldConfig.mainWidget) {
        fieldWidgetConfig = merge({}, {widgetProps: fieldConfig.mainWidgetProps || {}}, fieldWidgetConfig);
      }
      fieldConfig.widgets[widget] = fieldWidgetConfig;
    }
    if (!isFuncArg) {
      if (!fieldConfig.operators && operators)
        fieldConfig.operators = Array.from(new Set(operators));
      if (!fieldConfig.defaultOperator && defaultOperator)
        fieldConfig.defaultOperator = defaultOperator;
    }
  }

  const { fieldName, inGroup } = computeFieldName(config, path);
  if (fieldName) {
    fieldConfig.fieldName = fieldName;
    if (!config.__fieldNames[fieldName])
      config.__fieldNames[fieldName] = [];
    config.__fieldNames[fieldName].push({fullPath: path, inGroup});
  }
}

/////////////

const mergeCustomizerNoArrays = (objValue, srcValue, _key, _object, _source, _stack) => {
  if (Array.isArray(objValue)) {
    return srcValue;
  }
};

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

const computeFieldName = (config, path) => {
  if (!path)
    return {};
  const fieldSeparator = config.settings.fieldSeparator;
  const {computedPath, computed, inGroup} = [...path].reduce(({computedPath, computed, inGroup}, f, i, arr) => {
    const fullPath = [...arr.slice(0, i), f];
    const fConfig = getFieldRawConfig(config, fullPath);
    if (fConfig?.type === "!group" && i < arr.length-1) {
      // don't include group in final field name
      inGroup = fullPath.join(fieldSeparator);
      computedPath = [];
    } else if (fConfig?.fieldName) {
      // tip: fieldName overrides path !
      computed = true;
      computedPath = [fConfig.fieldName];
    } else {
      computedPath = [...computedPath, f];
    }
    return {computedPath, computed, inGroup};
  }, {computedPath: [], computed: false, inGroup: undefined});
  return computed ? {
    fieldName: computedPath.join(fieldSeparator),
    inGroup,
  } : {};
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
  return { ...typeConfig, ...funcConfig, type: funcConfig.returnType || funcConfig.type};
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
  let ret = mergeWith({}, typeConfig, argConfig || {}, mergeCustomizerNoArrays);

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

export const getFieldSrc = (field) => {
  if (!field)
    return null;
  if (typeof field == "object") {
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
      // if (!field.defaultOperator) {
      //   // if not complete config..
      //   // merge, but don't merge operators (rewrite instead)
      //   const typeConfig = config.types[field.type] || {};
      //   return mergeWith({}, typeConfig, field, mergeCustomizerNoArrays);
      // }
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

  //merge, but don't merge operators (rewrite instead)
  const typeConfig = config.types[fieldConfig.type] || {};
  let ret = mergeWith({}, typeConfig, fieldConfig || {}, mergeCustomizerNoArrays);

  return ret;
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
  if (!(operator || widget) && valueSrc != "const" && field != "!case_value")
    return null;
  const fieldConfig = getFieldConfig(config, field);
  if (!widget)
    widget = getWidgetForFieldOp(config, field, operator, valueSrc);
  const widgetConfig = config.widgets[widget] || {};
  const fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
  const fieldWidgetProps = (fieldWidgetConfig.widgetProps || {});
  const valueFieldSettings = (valueSrc == "value" || !valueSrc) && fieldConfig && fieldConfig.fieldSettings || {}; // useful to take 'validateValue'
  const mergedConfig = merge({}, widgetConfig, fieldWidgetProps, valueFieldSettings);
  return mergedConfig;
};

export const _widgetDefKeysToOmit = widgetDefKeysToOmit;
