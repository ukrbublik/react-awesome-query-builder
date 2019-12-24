'use strict';
import {defaultValue} from "./stuff";
import {
    getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFuncConfig
} from './configUtils';
import {defaultConjunction} from './defaultUtils';
import {completeValue} from './funcUtils';
import {Map} from 'immutable';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

// http://jsonlogic.com/

export const jsonLogicFormat = (item, config) => {
    let meta = {
        usedFields: [],
        errors: []
    };
    
    let logic = jsonLogicFormatItem(item, config, meta);
    
    // build empty data
    const {errors, usedFields} = meta;
    const {fieldSeparator} = config.settings;
    let data = {};
    for (let ff of usedFields) {
      const parts = ff.split(fieldSeparator);
      let tmp = data;
      for (let i = 0 ; i < parts.length ; i++) {
        const p = parts[i];
        if (i != parts.length - 1) {
          if (!tmp[p])
            tmp[p] = {};
          tmp = tmp[p];
        } else {
          tmp[p] = null;
        }
      }
    }
    
    return errors.length ? {
      errors
    } : {
      logic,
      data,
    };
};

//meta is mutable
const jsonLogicFormatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition) => {
  if (currentValue === undefined)
      return undefined;
  const {fieldSeparator} = config.settings;
  let ret;
  if (valueSrc == 'field') {
      const rightField = currentValue;
      if (rightField) {
          const rightFieldName = Array.isArray(rightField) ? rightField.join(fieldSeparator) : rightField;
          ret = { "var": rightFieldName };
          if (meta.usedFields.indexOf(rightFieldName) == -1)
              meta.usedFields.push(rightFieldName);
      }
  } else if (valueSrc == 'func') {
      const funcKey = currentValue.get('func');
      const args = currentValue.get('args');
      const funcConfig = getFuncConfig(funcKey, config);
      if (!funcConfig.jsonLogic) {
        meta.errors.push(`Func ${funcKey} is not supported`);
        return undefined;
      }
      const formattedArgs = {};
      for (const argKey in funcConfig.args) {
          const argConfig = funcConfig.args[argKey];
          const fieldDef = getFieldConfig(argConfig, config);
          const argVal = args ? args.get(argKey) : undefined;
          const argValue = argVal ? argVal.get('value') : undefined;
          const argValueSrc = argVal ? argVal.get('valueSrc') : undefined;
          const formattedArgVal = jsonLogicFormatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null);
          if (argValue != undefined && formattedArgVal === undefined)
              return undefined;
          if (formattedArgVal !== undefined) { // skip optional in the end
              formattedArgs[argKey] = formattedArgVal;
          }
      }
      if (typeof funcConfig.jsonLogic === 'function') {
          const fn = funcConfig.jsonLogic;
          const args = [
              formattedArgs,
          ];
          ret = fn(...args);
      } else {
        const funcName = funcConfig.jsonLogic || funcKey;
        ret = { [funcName]: Object.values(formattedArgs) };
      }
  } else {
    if (typeof fieldWidgetDefinition.jsonLogic === 'function') {
        const fn = fieldWidgetDefinition.jsonLogic;
        const args = [
            currentValue,
            pick(fieldDefinition, ['fieldSettings', 'listValues']),
            //useful options: valueFormat for date/time
            omit(fieldWidgetDefinition, ['formatValue', 'mongoFormatValue', 'sqlFormatValue', 'jsonLogic']),
        ];
        if (operator) {
            args.push(operator);
            args.push(operatorDefinition);
        }
        ret = fn(...args);
    } else {
        ret = currentValue;
    }
  }
  return ret;
}

//meta is mutable
const jsonLogicFormatItem = (item, config, meta) => {
    const type = item.get('type');
    const properties = item.get('properties') || new Map();
    const children = item.get('children1');

    if (type === 'group' && children && children.size) {
        const list = children
            .map((currentChild) => jsonLogicFormatItem(currentChild, config, meta))
            .filter((currentChild) => typeof currentChild !== 'undefined');
        if (!list.size)
            return undefined;

        let conjunction = properties.get('conjunction');
        if (!conjunction)
            conjunction = defaultConjunction(config);
        let conj = conjunction.toLowerCase();
        const not = properties.get('not');
        if (conj != "and" && conj != "or") {
          meta.errors.push(`Conjunction ${conj} is not supported`);
          return undefined;
        }

        let resultQuery = {};
        if (list.size == 1)
            resultQuery = list.first();
        else
            resultQuery[conj] = list.toList().toJS();
        if (not) {
          resultQuery = { "!": resultQuery };
        }
        return resultQuery;
    } else if (type === 'rule') {
        let operator = properties.get('operator');
        let operatorOptions = properties.get('operatorOptions');
        operatorOptions = operatorOptions ? operatorOptions.toJS() : null;
        if (operatorOptions && !Object.keys(operatorOptions).length)
            operatorOptions = null;
        let field = properties.get('field');
        let value = properties.get('value');

        if (field == null || operator == null)
            return undefined;

        const fieldDefinition = getFieldConfig(field, config) || {};
        let operatorDefinition = getOperatorConfig(config, operator, field) || {};
        let reversedOp = operatorDefinition.reversedOp;
        let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
        const _fieldType = fieldDefinition.type || "undefined";
        const cardinality = defaultValue(operatorDefinition.cardinality, 1);

        // check op
        let isRev = false;
        if (!operatorDefinition.jsonLogic && revOperatorDefinition.jsonLogic) {
          isRev = true;
          [operator, reversedOp] = [reversedOp, operator];
          [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
        }
        if (!operatorDefinition.jsonLogic) {
          meta.errors.push(`Operator ${operator} is not supported`);
        }

        // format value
        let valueSrcs = [];
        let valueTypes = [];
        let _usedFields = meta.usedFields;
        value = value.map((currentValue, ind) => {
            const valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
            const valueType = properties.get('valueType') ? properties.get('valueType').get(ind) : null;
            currentValue = completeValue(currentValue, valueSrc, config);
            const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
            const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ['factory']);
            const fv = jsonLogicFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition);
            if (fv !== undefined) {
                valueSrcs.push(valueSrc);
                valueTypes.push(valueType);
            }
            return fv;
        });
        const hasUndefinedValues = value.filter(v => v === undefined).size > 0;
        if (value.size < cardinality || hasUndefinedValues) {
            meta.usedFields = _usedFields; // restore
            return undefined;
        }
        const formattedValue = cardinality > 1 ? value.toArray() : (cardinality == 1 ? value.first() : null);

        // format field
        let fieldName = field;
        const formattedField = { "var": fieldName };
        if (meta.usedFields.indexOf(fieldName) == -1)
            meta.usedFields.push(fieldName);

        // format logic
        let formatteOp = operator;
        if (typeof operatorDefinition.jsonLogic == 'string')
          formatteOp = operatorDefinition.jsonLogic;
        let fn = typeof operatorDefinition.jsonLogic == 'function' ? operatorDefinition.jsonLogic : null
        if (!fn) {
          fn = (field, op, val, opDef, opOpts) => {
            if (cardinality == 0)
              return { [formatteOp]: formattedField };
            else if (cardinality == 1)
              return { [formatteOp]: [formattedField, formattedValue] };
            else
              return { [formatteOp]: [formattedField, ...formattedValue] };
          };
        }
        const args = [
            formattedField,
            operator,
            formattedValue,
            omit(operatorDefinition, ['formatOp', 'mongoFormatOp', 'sqlFormatOp', 'jsonLogic']),
            operatorOptions,
        ];
        let ruleQuery = fn(...args);

        if (isRev) {
          ruleQuery = { "!": ruleQuery };
        }

        return ruleQuery;
    }
    return undefined;
};

