import merge from "lodash/merge";
import omit from "lodash/omit";
import uuid from "../utils/uuid";
import mergeWith from "lodash/mergeWith";
import {settings as defaultSettings} from "../config/default";
import moment from "moment";
import {mergeArraysSmart, isJsonLogic, isJSX} from "./stuff";
import {getWidgetForFieldOp} from "./ruleUtils";
import clone from "clone";
import serializeJs from "serialize-javascript";


/////////////

// Keys in config with type RenderedReactElement
const renderKeysInFieldConfig = {
  labelYes: {},
  labelNo: {},
  marks: { isArr: true },
};
const renderKeysInFuncConfig = {
  renderBrackets: { isArr: true },
  renderSeps: { isArr: true },
};
const renderKeysInSettings = {
  renderSwitchPrefix: {},
};

// Keys in config with type JsonLogicFunction
const jlKeysInWidgetConfig = {
  factory: {},
};
const jlKeysInSettings = {
  renderConfirm: {},
  renderField: {},
};

export const compileConfig = (config) => {
  config = {...config};

  const opts = createOptsForRCE(config.ctx);

  // todo !!!!!
  config.ctx.addJsonLogicOperation("RE", (type, props) => ({type, props}));
  config.ctx.addJsonLogicOperation("MERGE", (obj1, obj2) => ({...obj1, ...obj2}));
  config.ctx.addJsonLogicOperation("MAP", (entries) => Object.fromEntries(entries));

  config.widgets = clone(config.widgets);
  _compileWidgetsConfig(config.widgets, config, opts);

  config.fields = clone(config.fields);
  _compileFieldsConfig(config.fields, config, opts);

  config.funcs = clone(config.funcs);
  _compileFuncsConfig(config.funcs, config, opts);

  _compileSettings(config.settings, config, opts);

  return config;
};

function createOptsForRCE(ctx) {
  return {
    components: {
      ...ctx.W,
      ...ctx.O,
    },
    RCE: ctx.RCE,
  };
}

function _compileWidgetsConfig(subconfig, config, opts, path = []) {
  for (let w in subconfig) {
    const def = subconfig[w];
    _compileJsonLogicFuncs(jlKeysInWidgetConfig, def, config, opts, ["widgets", ...path, w]);
  }
}

function _compileFieldsConfig(subconfig, config, opts, path = []) {
  for (let field in subconfig) {
    const def = subconfig[field];
    const fieldSettings = def?.fieldSettings || {};
    _compileReactElements(renderKeysInFieldConfig, fieldSettings, config, opts, ["fields", ...path, field]);
    if (def.subfields) {
      _compileFieldsConfig(def.subfields, config, opts, [...path, field]);
    }
  }
}

function _compileFuncsConfig(subconfig, config, opts, path = []) {
  if (!subconfig) return;
  for (let funcKey in subconfig) {
    const def = subconfig[funcKey];
    _compileReactElements(renderKeysInFuncConfig, def, config, opts, ["funcs", ...path, funcKey]);
    if (def.subfields) {
      _compileFuncsConfig(def.subfields, config, opts, [...path, funcKey]);
    }
  }
}

function _compileSettings(settings, config, opts, path = []) {
  _compileReactElements(renderKeysInSettings, settings, config, opts, ["settings", ...path]);
  _compileJsonLogicFuncs(jlKeysInSettings, settings, config, opts, ["settings", ...path]);
}

function _compileJsonLogicFuncs(jlKeys, targetObj, config, opts, path) {
  for (const [key, {}] of Object.entries(jlKeys)) {
    let val = targetObj[key];
    targetObj[key] = _compileJsonLogic(val, opts, [...path, key]);
  }
}

function _compileReactElements(renderKeys, targetObj, config, opts, path) {
  for (const [key, {isArr}] of Object.entries(renderKeys)) {
    let val = targetObj[key];
    if (val) {
      if (isArr) {
        for (const k in val) {
          val[k] = config.ctx.renderReactElement(val[k], opts, [...path, key, k]);
        }
      } else {
        targetObj[key] = config.ctx.renderReactElement(val, opts, [...path, key]);
      }
    }
  }
}

function _compileJsonLogic(jl, opts, path) {
  if (isJsonLogic(jl)) {
    return function(props, ctx) {
      const res = ctx.applyJsonLogic(jl, {
        props,
      });
      const opts = createOptsForRCE(ctx);
      const ret = ctx.renderReactElement(res, opts, path);
      return ret;
    };
  }
  return jl;
}


/////////////

export const extendConfig = (config, configId) => {
  //operators, defaultOperator - merge
  //widgetProps (including valueLabel, valuePlaceholder, hideOperator, operatorInlineLabel) - concrete by widget

  if (config.__configId) {
    return config;
  }

  config = compileConfig(config);
  
  config = {...config};
  config.settings = merge({}, defaultSettings, config.settings);
  config._fieldsCntByType = {};
  config._funcsCntByType = {};

  config.types = clone(config.types);
  _extendTypesConfig(config.types, config);

  config.fields = clone(config.fields);
  config.__fieldNames = {};
  _extendFieldsConfig(config.fields, config);

  config.funcs = clone(config.funcs);
  _extendFuncArgsConfig(config.funcs, config);

  moment.locale(config.settings.locale.moment);

  Object.defineProperty(config, "__configId", {
    enumerable: false,
    writable: false,
    value: configId || uuid()
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

function _extendFuncArgsConfig(subconfig, config) {
  if (!subconfig) return;
  for (let funcKey in subconfig) {
    const funcDef = subconfig[funcKey];
    if (funcDef.returnType) {
      if (!config._funcsCntByType[funcDef.returnType])
        config._funcsCntByType[funcDef.returnType] = 0;
      config._funcsCntByType[funcDef.returnType]++;
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

function _extendFieldConfig(fieldConfig, config, path = null, isFuncArg = false) {
  let operators = null, defaultOperator = null;
  const typeConfig = config.types[fieldConfig.type];
  const excludeOperatorsForField = fieldConfig.excludeOperators || [];
  if (fieldConfig.type != "!struct" && fieldConfig.type != "!group") {
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
      if (config.settings.normalizeListValues) {
        fieldConfig.fieldSettings.listValues = config.settings.normalizeListValues(
          fieldConfig.fieldSettings.listValues, fieldConfig.type, fieldConfig.fieldSettings
        );
      }
    }

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

  const computedFieldName = computeFieldName(config, path);
  if (computedFieldName) {
    fieldConfig.fieldName = computedFieldName;
  }

  if (path && fieldConfig.fieldName) {
    config.__fieldNames[fieldConfig.fieldName] = path;
  }
}

/////////////

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
  const fieldSeparator = config.settings.fieldSeparator;
  //field = normalizeField(config, field);
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

const computeFieldName = (config, path) => {
  if (!path)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  let l = [...path], r = [], f, fConfig;
  while ((f = l.pop()) !== undefined && l.length > 0) {
    r.unshift(f);
    fConfig = getFieldRawConfig(config, l);
    if (fConfig.fieldName) {
      return [fConfig.fieldName, ...r].join(fieldSeparator);
    }
  }
  return null;
};

export const normalizeField = (config, field) => {
  const fieldSeparator = config.settings.fieldSeparator;
  const fieldStr = Array.isArray(field) ? field.join(fieldSeparator) : field;
  if (config.__fieldNames[fieldStr]) {
    return config.__fieldNames[fieldStr].join(fieldSeparator);
  }
  return fieldStr;
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

  //merge, but don't merge operators (rewrite instead)
  const typeConfig = config.types[argConfig.type] || {};
  let ret = mergeWith({}, typeConfig, argConfig || {}, (objValue, srcValue, _key, _object, _source, _stack) => {
    if (Array.isArray(objValue)) {
      return srcValue;
    }
  });

  return ret;
};

export const getFieldConfig = (config, field) => {
  if (!field)
    return null;
  if (typeof field == "object" && !field.func && !!field.type)
    return field;
  if (typeof field == "object" && field.func && field.arg)
    return getFuncArgConfig(config, field.func, field.arg);
  const fieldConfig = getFieldRawConfig(config, field);
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

export const getOperatorConfig = (config, operator, field = null) => {
  if (!operator)
    return null;
  const opConfig = config.operators[operator];
  if (field) {
    const fieldConfig = getFieldConfig(config, field);
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

/////////////

export const UNSAFE_serializeConfig = (config) => {
  let strConfig = serializeJs(omit(config, ["ctx"]), {
    space: 2,
    unsafe: true,
  });
  if (strConfig.includes("__WEBPACK_IMPORTED_MODULE_")) {
    console.warn("Serialized config should not have references to libraries imported from webpack.");
  }
  if (strConfig.includes("\"_store\": {}")) {
    console.warn("Serialized config should not have JSX.");
  }
  return strConfig;
};

export const UNSAFE_deserializeConfig = (strConfig, ctx) => {
  let config = eval("("+strConfig+")");
  config.ctx = ctx;
  return config;
};
