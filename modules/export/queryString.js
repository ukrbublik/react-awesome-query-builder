import {
  getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFieldPath, getFieldPathLabels, getFuncConfig
} from "../utils/configUtils";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {defaultValue} from "../utils/stuff";
import {defaultConjunction} from "../utils/defaultUtils";
import {settings as defaultSettings} from "../config/default";
import {completeValue} from "../utils/funcUtils";
import {Map} from "immutable";

const formatValue = (config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition, isForDisplay) => {
  if (currentValue === undefined)
    return undefined;
  const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
  let ret;
  if (valueSrc == "field") {
    //format field
    const rightField = currentValue;
    let formattedField = null;
    if (rightField) {
      const rightFieldDefinition = getFieldConfig(rightField, config) || {};
      const fieldParts = Array.isArray(rightField) ? rightField : rightField.split(fieldSeparator);
      const _fieldKeys = getFieldPath(rightField, config);
      const fieldPartsLabels = getFieldPathLabels(rightField, config);
      const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparatorDisplay) : null;
      const fieldLabel2 = rightFieldDefinition.label2 || fieldFullLabel;
      const formatField = config.settings.formatField || defaultSettings.formatField;
      const rightFieldName = Array.isArray(rightField) ? rightField.join(fieldSeparator) : rightField;
      formattedField = formatField(rightFieldName, fieldParts, fieldLabel2, rightFieldDefinition, config, isForDisplay);
    }
    ret = formattedField;
  } else if (valueSrc == "func") {
    const funcKey = currentValue.get("func");
    const args = currentValue.get("args");
    const funcConfig = getFuncConfig(funcKey, config);
    const funcName = isForDisplay && funcConfig.label || funcKey;
    const formattedArgs = {};
    const formattedArgsWithNames = {};
    for (const argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      const fieldDef = getFieldConfig(argConfig, config);
      const argVal = args ? args.get(argKey) : undefined;
      const argValue = argVal ? argVal.get("value") : undefined;
      const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
      const formattedArgVal = formatValue(config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, isForDisplay);
      const argName = isForDisplay && argConfig.label || argKey;
      if (formattedArgVal !== undefined) { // skip optional in the end
        formattedArgs[argKey] = formattedArgVal;
        formattedArgsWithNames[argName] = formattedArgVal;
      }
    }
    if (typeof funcConfig.formatFunc === "function") {
      const fn = funcConfig.formatFunc;
      const args = [
        formattedArgs,
        isForDisplay
      ];
      ret = fn(...args);
    } else {
      ret = `${funcName}(${Object.entries(formattedArgsWithNames).map(([k, v]) => (isForDisplay ? `${k}: ${v}` : `${v}`)).join(", ")})`;
    }
  } else {
    if (typeof fieldWidgetDefinition.formatValue === "function") {
      const fn = fieldWidgetDefinition.formatValue;
      const args = [
        currentValue,
        pick(fieldDefinition, ["fieldSettings", "listValues"]),
        //useful options: valueFormat for date/time
        omit(fieldWidgetDefinition, ["formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic"]),
        isForDisplay
      ];
      if (operator) {
        args.push(operator);
        args.push(operatorDefinition);
      }
      if (valueSrc == "field") {
        const valFieldDefinition = getFieldConfig(currentValue, config) || {}; 
        args.push(valFieldDefinition);
      }
      ret = fn(...args);
    } else {
      ret = currentValue;
    }
  }
  return ret;
};

export const queryString = (item, config, isForDisplay = false) => {
  if (!item) return undefined;
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group") && children && children.size) {
    const not = properties.get("not");
    const list = children
      .map((currentChild) => queryString(currentChild, config, isForDisplay))
      .filter((currentChild) => typeof currentChild !== "undefined");
    if (!list.size)
      return undefined;

    let conjunction = properties.get("conjunction");
    if (!conjunction)
      conjunction = defaultConjunction(config);
    const conjunctionDefinition = config.conjunctions[conjunction];

    return conjunctionDefinition.formatConj(list, conjunction, not, isForDisplay);
  } else if (type === "rule") {
    let field = properties.get("field");
    const operator = properties.get("operator");
    const operatorOptions = properties.get("operatorOptions");
    if (field == null || operator == null)
      return undefined;

    const fieldDefinition = getFieldConfig(field, config) || {};
    const operatorDefinition = getOperatorConfig(config, operator, field) || {};
    const reversedOp = operatorDefinition.reversedOp;
    const revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
    const cardinality = defaultValue(operatorDefinition.cardinality, 1);
    const {fieldSeparator} = config.settings;

    //format value
    let valueSrcs = [];
    let valueTypes = [];
    let value = properties.get("value").map((currentValue, ind) => {
      const valueSrc = properties.get("valueSrc") ? properties.get("valueSrc").get(ind) : null;
      const valueType = properties.get("valueType") ? properties.get("valueType").get(ind) : null;
      currentValue = completeValue(currentValue, valueSrc, config);
      const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
      const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
      let fv = formatValue(config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition, isForDisplay);
      if (fv !== undefined) {
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    const hasUndefinedValues = value.filter(v => v === undefined).size > 0;
    if (hasUndefinedValues || value.size < cardinality)
      return undefined;
    const formattedValue = (cardinality == 1 ? value.first() : value);

    //find fn to format expr
    let isRev = false;
    let fn = operatorDefinition.formatOp;
    if (!fn && reversedOp) {
      fn = revOperatorDefinition.formatOp;
      if (fn) {
        isRev = true;
      }
    }
    if (!fn && cardinality == 1) {
      let _operator = operatorDefinition.labelForFormat || operator;
      fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        return `${field} ${_operator} ${values}`;
      };
    }
    if (!fn)
      return undefined;
        
    //format field
    let fieldName = field;
    const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
    if (fieldDefinition.tableName) {
      const fieldPartsCopy = [...fieldParts];
      fieldPartsCopy[0] = fieldDefinition.tableName;
      fieldName = fieldPartsCopy.join(fieldSeparator);
    }
    const _fieldKeys = getFieldPath(field, config);
    const fieldPartsLabels = getFieldPathLabels(field, config);
    const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(config.settings.fieldSeparatorDisplay) : null;
    const fieldLabel2 = fieldDefinition.label2 || fieldFullLabel;
    const formatField = config.settings.formatField || defaultSettings.formatField;
    const formattedField = formatField(fieldName, fieldParts, fieldLabel2, fieldDefinition, config, isForDisplay);
        
    //format expr
    const args = [
      formattedField,
      operator,
      formattedValue,
      (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
      (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
      omit(operatorDefinition, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic"]),
      operatorOptions,
      isForDisplay,
      fieldDefinition,
    ];
    let ret = fn(...args);
    if (isRev) {
      ret = config.settings.formatReverse(ret, operator, reversedOp, operatorDefinition, revOperatorDefinition, isForDisplay);
    }
    return ret;
  }

  return undefined;
};


