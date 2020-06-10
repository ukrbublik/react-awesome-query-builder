"use strict";
import last from "lodash/last";
import merge from "lodash/merge";
import mergeWith from "lodash/mergeWith";
import {settings as defaultSettings} from "../config/default";
import moment from "moment";
import {normalizeListValues} from "./stuff";


export const extendConfig = (config) => {
  //operators, defaultOperator - merge
  //widgetProps (including valueLabel, valuePlaceholder, hideOperator, operatorInlineLabel) - concrete by widget

  if (config.__extended)
    return config;
    
  config.settings = merge({}, defaultSettings, config.settings);

  _extendTypesConfig(config.types, config);

  _extendFieldsConfig(config.fields, config);

  _extendFuncArgsConfig(config.funcs, config);
    
  moment.locale(config.settings.locale.short);

  Object.defineProperty(config, "__extended", {
    enumerable: false,
    writable: false,
    value: true
  });

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
      if (!operators)
        operators = [];
            
      operators = operators.concat(typeWidgetConfig.operators.slice());
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

function _extendFieldsConfig(subconfig, config) {
  config._fieldsCntByType = {};
  for (let field in subconfig) {
    _extendFieldConfig(subconfig[field], config);
    if (subconfig[field].subfields) {
      _extendFieldsConfig(subconfig[field].subfields, config);
    }
  }
}

function _extendFuncArgsConfig(subconfig, config) {
  config._funcsCntByType = {};
  if (!subconfig) return;
  for (let funcKey in subconfig) {
    const funcDef = subconfig[funcKey];
    if (funcDef.returnType) {
      if (!config._funcsCntByType[funcDef.returnType])
        config._funcsCntByType[funcDef.returnType] = 0;
      config._funcsCntByType[funcDef.returnType]++;
    }
    for (let argKey in funcDef.args) {
      _extendFieldConfig(funcDef.args[argKey], config, true);
    }

    // isOptional can be only in the end
    if (funcDef.args) {
      const argKeys = Object.keys(funcDef.args);
      let tmpIsOptional = true;
      for (const argKey of argKeys.reverse()) {
        const argDef = funcDef.args[argKey];
        if (!tmpIsOptional && argDef.isOptional) {
          delete argDef.isOptional;
        }
        if (!argDef.isOptional)
          tmpIsOptional = false;
      }
    }

    if (funcDef.subfields) {
      _extendFuncArgsConfig(funcDef.subfields, config);
    }
  }
}

function _extendFieldConfig(fieldConfig, config, isFuncArg = false) {
  let operators = null, defaultOperator = null;
  const typeConfig = config.types[fieldConfig.type];
  const excludeOperators = fieldConfig.excludeOperators || [];
  if (fieldConfig.type != "!struct" && fieldConfig.type != "!group") {
    if (!typeConfig) {
      //console.warn(`No type config for ${fieldConfig.type}`);
      fieldConfig.disabled = true;
      return;
    }
    if (!isFuncArg) {
      if (!config._fieldsCntByType[fieldConfig.type])
        config._fieldsCntByType[fieldConfig.type] = 0;
      config._fieldsCntByType[fieldConfig.type]++;
    }

    if (!fieldConfig.widgets)
      fieldConfig.widgets = {};
    fieldConfig.mainWidget = fieldConfig.mainWidget || typeConfig.mainWidget;
    fieldConfig.valueSources = fieldConfig.valueSources || typeConfig.valueSources;
    for (let widget in typeConfig.widgets) {
      let fieldWidgetConfig = fieldConfig.widgets[widget] || {};
      const typeWidgetConfig = typeConfig.widgets[widget] || {};
      if (!isFuncArg) {
        const shouldIncludeOperators = fieldConfig.preferWidgets && (widget == "field" || fieldConfig.preferWidgets.includes(widget)) || excludeOperators.length > 0;
        if (fieldWidgetConfig.operators) {
          if (!operators)
            operators = [];
          operators = operators.concat(fieldWidgetConfig.operators.filter(o => !excludeOperators.includes(o)));
        } else if (shouldIncludeOperators && typeWidgetConfig.operators) {
          if (!operators)
            operators = [];
          operators = operators.concat(typeWidgetConfig.operators.filter(o => !excludeOperators.includes(o)));
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

    const keysToPutInFieldSettings = ["listValues", "allowCustomValues", "validateValue"];
    if (!fieldConfig.fieldSettings)
      fieldConfig.fieldSettings = {};
    for (const k of keysToPutInFieldSettings) {
      if (fieldConfig[k]) {
        fieldConfig.fieldSettings[k] = fieldConfig[k];
        delete fieldConfig[k];
      }
    }

    if (fieldConfig.fieldSettings.listValues) {
      fieldConfig.fieldSettings.listValues = normalizeListValues(fieldConfig.fieldSettings.listValues, fieldConfig.type, fieldConfig.fieldSettings);
    }
  }
}

export const getFieldRawConfig = (field, config, fieldsKey = "fields", subfieldsKey = "subfields") => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
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


export const getFuncConfig = (func, config) => {
  if (!func)
    return null;
  const funcConfig = getFieldRawConfig(func, config, "funcs", "subfields");
  if (!funcConfig)
    return null; //throw new Error("Can't find func " + func + ", please check your config");
  return funcConfig;
};

export const getFuncArgConfig = (funcKey, argKey, config) => {
  const funcConfig = getFuncConfig(funcKey, config);
  if (!funcConfig)
    return null; //throw new Error(`Can't find func ${funcKey}, please check your config`);
  const argConfig = funcConfig.args && funcConfig.args[argKey] || null;
  if (!argConfig)
    return null; //throw new Error(`Can't find arg ${argKey} for func ${funcKey}, please check your config`);

  //merge, but don't merge operators (rewrite instead)
  const typeConfig = config.types[argConfig.type] || {};
  let ret = mergeWith({}, typeConfig, argConfig || {}, (objValue, srcValue, _key, _object, _source, _stack) => {
    if (Array.isArray(objValue)) {
      return srcValue;
    }
  });

  return ret;
};

export const getFieldConfig = (field, config) => {
  if (!field)
    return null;
  if (typeof field == "object" && !field.func && !!field.type)
    return field;
  if (typeof field == "object" && field.func && field.arg)
    return getFuncArgConfig(field.func, field.arg, config);
  const fieldConfig = getFieldRawConfig(field, config);
  if (!fieldConfig)
    return null; //throw new Error("Can't find field " + field + ", please check your config");

  //merge, but don't merge operators (rewrite instead)
  const typeConfig = config.types[fieldConfig.type] || {};
  let ret = mergeWith({}, typeConfig, fieldConfig || {}, (objValue, srcValue, _key, _object, _source, _stack) => {
    if (Array.isArray(objValue)) {
      return srcValue;
    }
  });

  return ret;
};

export const getFirstField = (config, parentRuleGroupPath = null) => {
  const fieldSeparator = config.settings.fieldSeparator;
  const parentPathArr = typeof parentRuleGroupPath == "string" ? parentRuleGroupPath.split(fieldSeparator) : parentRuleGroupPath;
  const parentField = parentRuleGroupPath ? getFieldRawConfig(parentRuleGroupPath, config) : config;

  let firstField = parentField, key = null, keysPath = [];
  do {
    const subfields = firstField === config ? config.fields : firstField.subfields;
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

export const getOperatorsForField = (config, field) => {
  const fieldConfig = getFieldConfig(field, config);
  const fieldOps = fieldConfig ? fieldConfig.operators : [];
  return fieldOps;
};

export const getFirstOperator = (config, field) => {
  const fieldOps = getOperatorsForField(config, field);
  return fieldOps ? fieldOps[0] : null;
};

export const getFieldPath = (field, config, onlyKeys = false) => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
  if (onlyKeys)
    return parts;
  else
    return parts
      .map((_curr, ind, arr) => arr.slice(0, ind+1))
      .map((parts) => parts.join(fieldSeparator));
};

export const getFuncPathLabels = (field, config) => {
  return getFieldPathLabels(field, config, "funcs", "subfields");
};

export const getFieldPathLabels = (field, config, fieldsKey = "fields", subfieldsKey = "subfields") => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
  return parts
    .map((_curr, ind, arr) => arr.slice(0, ind+1))
    .map((parts) => parts.join(fieldSeparator))
    .map(part => {
      const cnf = getFieldRawConfig(part, config, fieldsKey, subfieldsKey);
      return cnf && cnf.label || cnf && last(part.split(fieldSeparator));
    })
    .filter(label => label != null);
};

export const getOperatorConfig = (config, operator, field = null) => {
  if (!operator)
    return null;
  const opConfig = config.operators[operator];
  if (field) {
    const fieldConfig = getFieldConfig(field, config);
    const widget = getWidgetForFieldOp(config, field, operator);
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
  if (!field || !(operator || widget))
    return null;
  const fieldConfig = getFieldConfig(field, config);
  if (!widget)
    widget = getWidgetForFieldOp(config, field, operator, valueSrc);
  const widgetConfig = config.widgets[widget] || {};
  const fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
  const fieldWidgetProps = (fieldWidgetConfig.widgetProps || {});
  const valueFieldSettings = (valueSrc == "value" || !valueSrc) && fieldConfig && fieldConfig.fieldSettings || {}; // useful to take 'validateValue'
  const mergedConfig = merge({}, widgetConfig, fieldWidgetProps, valueFieldSettings);
  return mergedConfig;
};

export const getValueLabel = (config, field, operator, delta, valueSrc = null, isSpecialRange = false) => {
  const isFuncArg = typeof field == "object" && field.arg;
  const {showLabels} = config.settings;
  const fieldConfig = getFieldConfig(field, config);
  const fieldWidgetConfig = getFieldWidgetConfig(config, field, operator, null, valueSrc) || {};
  const mergedOpConfig = getOperatorConfig(config, operator, field) || {};
    
  const cardinality = isSpecialRange ? 1 : mergedOpConfig.cardinality;
  let ret = null;
  if (cardinality > 1) {
    const valueLabels = fieldWidgetConfig.valueLabels || mergedOpConfig.valueLabels;
    if (valueLabels)
      ret = valueLabels[delta];
    if (ret && typeof ret != "object") {
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
    if (isFuncArg) {
      if (!label)
        label = fieldConfig.label || field.arg;
      if (!placeholder && !showLabels)
        placeholder = fieldConfig.label || field.arg;
    }

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
  const isFuncArg = typeof field == "object" && !!field.type;
  const fieldConfig = getFieldConfig(field, config);
  const opConfig = operator ? config.operators[operator] : null;
  if (fieldConfig && fieldConfig.widgets) {
    for (let widget in fieldConfig.widgets) {
      const widgetConfig = fieldConfig.widgets[widget];
      const widgetValueSrc = config.widgets[widget].valueSrc || "value";
      let canAdd = true;
      if (!widgetConfig.operators)
        canAdd = canAdd && (valueSrc != "value" || isFuncArg); //if can't check operators, don't add
      if (widgetConfig.operators && operator)
        canAdd = canAdd && widgetConfig.operators.indexOf(operator) != -1;
      if (valueSrc && valueSrc != widgetValueSrc)
        canAdd = false;
      if (opConfig && opConfig.cardinality == 0 && (widgetValueSrc != "value"))
        canAdd = false;
      if (canAdd) {
        widgets.push(widget);
        let canAddValueSrc = fieldConfig.valueSources && fieldConfig.valueSources.indexOf(widgetValueSrc) != -1;
        if (opConfig && opConfig.valueSources && opConfig.valueSources.indexOf(widgetValueSrc) == -1)
          canAddValueSrc = false;
        if (canAddValueSrc && !valueSrcs.find(v => v == widgetValueSrc))
          valueSrcs.push(widgetValueSrc);
      }
    }
  }
  widgets.sort((w1, w2) => {
    let w1Main = fieldConfig.preferWidgets ? fieldConfig.preferWidgets.indexOf(w1) != -1 : w1 == fieldConfig.mainWidget;
    let _w2Main = fieldConfig.preferWidgets ? fieldConfig.preferWidgets.indexOf(w2) != -1 : w2 == fieldConfig.mainWidget;
    if (w1 != w2) {
      return w1Main ? -1 : +1;
    }
    return 0;
  });
    
  return {widgets, valueSrcs};
}

export const getWidgetsForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  return widgets;
};

export const getValueSourcesForFieldOp = (config, field, operator, fieldDefinition = null, leftFieldForFunc = null) => {
  const {valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, null);
  const filteredValueSrcs = valueSrcs.filter(vs => {
    if (vs == "field" && fieldDefinition) {
      return config._fieldsCntByType[fieldDefinition.type] > 1;
    }
    if (vs == "func" && fieldDefinition) {
      if (!config._funcsCntByType[fieldDefinition.type])
        return false;
      if (fieldDefinition.funcs)
        return fieldDefinition.funcs.length > 0;
      return true;
    }
    return true;
  });
  return filteredValueSrcs;
};

export const getWidgetForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  let widget = null;
  if (widgets.length)
    widget = widgets[0];
  return widget;
};
