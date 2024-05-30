import merge from "lodash/merge";
import uuid from "./uuid";
import mergeWith from "lodash/mergeWith";
import {settings as defaultSettings} from "../config/default";
import moment from "moment";
import {mergeArraysSmart, logger, deepFreeze, mergeCustomizerNoArrays, shallowCopy} from "./stuff";
import clone from "clone";

import { compileConfig } from "./configSerialize";
import { getFieldRawConfig } from "./configUtils";
import { findExtendedConfigInAllMemos, getCommonMemo } from "./configMemo";

export const extendConfig = (config, configId, canCompile = true) => {
  //operators, defaultOperator - merge
  //widgetProps (including valueLabel, valuePlaceholder, hideOperator, operatorInlineLabel) - concrete by widget

  // Already extended?
  if (config.__configId) {
    return config;
  }

  // Try to take from memo (cache)
  const cachedExtConfig = findExtendedConfigInAllMemos(config);
  if (cachedExtConfig) {
    return cachedExtConfig;
  }

  const origConfig = config;

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

  extendTypesConfig(config.types, config);
  extendFieldsConfig(config.fields, config);
  extendFuncArgsConfig(config.funcs, config);

  const momentLocale = config.settings.locale.moment;
  if (momentLocale) {
    moment.locale(momentLocale);
  }

  Object.defineProperty(config, "__configId", {
    enumerable: false,
    writable: false,
    value: configId || uuid()
  });

  config.__cache__ = {};

  deepFreeze(config);

  // Save to memo (cache)
  const memo = getCommonMemo();
  memo.storeConfigPair(origConfig, config);

  return config;
};

function extendTypesConfig(typesConfig, config) {
  for (let type in typesConfig) {
    let typeConfig = typesConfig[type];
    extendTypeConfig(type, typeConfig, config);
  }
}

function extendTypeConfig(type, typeConfig, config) {
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

function extendFieldsConfig(subconfig, config, path = []) {
  for (let field in subconfig) {
    extendFieldConfig(subconfig[field], config, [...path, field]);
    if (subconfig[field].subfields) {
      extendFieldsConfig(subconfig[field].subfields, config, [...path, field]);
    }
  }
}

function extendFuncArgsConfig(subconfig, config, path = []) {
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
    extendFieldConfig(funcDef, config, null, false);

    if (funcDef.args) {
      for (let argKey in funcDef.args) {
        extendFieldConfig(funcDef.args[argKey], config, null, true);
      }
      // isOptional can be only in the end
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
      extendFuncArgsConfig(funcDef.subfields, config, [...path, funcKey]);
    }
  }
}

function normalizeFieldSettings(fieldConfig, config, type) {
  const keysToPutInFieldSettings = ["listValues", "treeValues", "allowCustomValues", "validateValue"];
  for (const k of keysToPutInFieldSettings) {
    if (fieldConfig[k]) {
      if (!fieldConfig.fieldSettings)
        fieldConfig.fieldSettings = {};
      fieldConfig.fieldSettings[k] = fieldConfig[k];
      delete fieldConfig[k];
    }
  }

  // normalize listValues
  if (fieldConfig.fieldSettings?.listValues) {
    if (config.settings.normalizeListValues) {
      fieldConfig.fieldSettings.listValues = config.settings.normalizeListValues.call(
        config.ctx,
        fieldConfig.fieldSettings.listValues, type, fieldConfig.fieldSettings
      );
    }
  }
  // same for treeValues
  if (fieldConfig.fieldSettings?.treeValues) {
    if (config.settings.normalizeListValues) {
      fieldConfig.fieldSettings.treeValues = config.settings.normalizeListValues.call(
        config.ctx,
        fieldConfig.fieldSettings.treeValues, type, fieldConfig.fieldSettings
      );
    }
  }
}

function extendFieldConfig(fieldConfig, config, path = null, isFuncArg = false) {
  const isFunc = !!fieldConfig.returnType;
  const type = fieldConfig.type || fieldConfig.returnType;
  const isGroup = type === "!struct" || type === "!group";
  const typeConfig = config.types[type];
  const excludeOperatorsForField = fieldConfig.excludeOperators || [];
  let operators = (fieldConfig.operators || typeConfig?.operators || []).filter(op => !excludeOperatorsForField.includes(op));
  let defaultOperator = fieldConfig.defaultOperator || typeConfig?.defaultOperator;

  if (!typeConfig) {
    //console.warn(`No type config for ${type}`);
    fieldConfig.disabled = true;
    return;
  }

  if (!isFuncArg && !isFunc) {
    if (!config.__fieldsCntByType[type])
      config.__fieldsCntByType[type] = 0;
    config.__fieldsCntByType[type]++;
  }

  if (isFuncArg) {
    fieldConfig._isFuncArg = true;
  }

  normalizeFieldSettings(fieldConfig, config, type);

  // copy from type to field
  Object.keys(typeConfig).filter((k) => !["widgets", "operators", "defaultOperator"].includes(k)).map((k) => {
    if (!fieldConfig[k]) {
      fieldConfig[k] = shallowCopy(typeConfig[k]);
    }
  });

  // copy widgets
  if (!isFunc) { // tip: func always have its own widget
    const excludeOperatorsForType = typeConfig.excludeOperators || [];
    if (!fieldConfig.widgets)
      fieldConfig.widgets = {};
    for (let widget in typeConfig.widgets) {
      let fieldWidgetConfig = fieldConfig.widgets[widget] || {};
      const typeWidgetConfig = typeConfig.widgets[widget] || {};
      if (!isFuncArg) {
        const excludeOperators = [...excludeOperatorsForField, ...excludeOperatorsForType];
        const shouldIncludeOperators = fieldConfig.preferWidgets
          && (widget == "field" || fieldConfig.preferWidgets.includes(widget))
          || excludeOperators.length > 0;
        if (fieldWidgetConfig.operators) {
          const addOperators = fieldWidgetConfig.operators.filter(op => !excludeOperators.includes(op));
          fieldWidgetConfig.operators = addOperators;
          operators = [...(operators || []), ...addOperators];
        } else if (shouldIncludeOperators && typeWidgetConfig.operators) {
          const addOperators = typeWidgetConfig.operators.filter(op => !excludeOperators.includes(op));
          fieldWidgetConfig.operators = addOperators;
          operators = [...(operators || []), ...addOperators];
        }
        if (fieldWidgetConfig.defaultOperator)
          defaultOperator = fieldWidgetConfig.defaultOperator;
      }

      if (widget == fieldConfig.mainWidget) {
        fieldWidgetConfig.widgetProps = {
          ...(fieldConfig.mainWidgetProps || {}),
          ...(fieldWidgetConfig.widgetProps || {}),
        };
      }

      fieldWidgetConfig = {
        ...typeWidgetConfig,
        ...fieldWidgetConfig,
      };

      fieldConfig.widgets[widget] = fieldWidgetConfig;
    }
  }

  if (!isFuncArg) { // tip: operators are not used for func args
    if (!fieldConfig.operators) {
      fieldConfig.operators = Array.from(new Set(operators));
    }
    if (!fieldConfig.defaultOperator) {
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

function computeFieldName(config, path) {
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
}
