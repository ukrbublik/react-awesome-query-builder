import {defaultValue} from "../utils/stuff";
import {getFieldConfig, getOperatorConfig} from "../utils/configUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import {formatFieldName} from "../utils/ruleUtils";
import {completeValue} from "../utils/funcUtils";
import {Map} from "immutable";

/*
 Build tree to http://querybuilder.js.org/ like format

 Example:
 {
    "condition": "AND",
    "rules": [
        {
            "id": "price",
            "field": "price",
            "type": "double",
            "input": "text",
            "operator": "less",
            "value": "10.25"
        },
        {
            "condition": "OR",
            "rules": [
                {
                    "id": "category",
                    "field": "category",
                    "type": "integer",
                    "input": "select",
                    "operator": "equal",
                    "value": "2"
                },
                {
                    "id": "category",
                    "field": "category",
                    "type": "integer",
                    "input": "select",
                    "operator": "equal",
                    "value": "1"
                }
            ]
        }
    ]
 }
 */


export const queryBuilderFormat = (item, config) => {
  //meta is mutable
  let meta = {
    usedFields: []
  };
  const res = formatItem(item, config, meta);
  if (!res)
    return undefined;
  return {
    ...res, 
    ...meta
  };
};


const formatItem = (item, config, meta) => {
  if (!item) return undefined;

  const type = item.get("type");
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group") && children && children.size) {
    return formatGroup(item, config, meta);
  } else if (type === "rule") {
    return formatRule(item, config, meta);
  }
  return undefined;
};


const formatGroup = (item, config, meta) => {
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");
  const id = item.get("id");

  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta))
    .filter((currentChild) => typeof currentChild !== "undefined");
  if (!list.size)
    return undefined;

  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  const not = properties.get("not");

  const resultQuery = {
    id,
    rules: list.toList(),
    condition: conjunction.toUpperCase(),
    not,
  };
  return resultQuery;
};


const formatRule = (item, config, meta) => {
  const properties = item.get("properties") || new Map();
  const id = item.get("id");

  const operator = properties.get("operator");
  const options = properties.get("operatorOptions");
  let field = properties.get("field");
  let value = properties.get("value");
  let valueSrc = properties.get("valueSrc");
  let valueType = properties.get("valueType");
  const hasUndefinedValues = value.filter(v => v === undefined).size > 0;

  if (field == null || operator == null || hasUndefinedValues)
    return undefined;

  const fieldDefinition = getFieldConfig(config, field) || {};
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  const fieldType = fieldDefinition.type || "undefined";
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
  const typeConfig = config.types[fieldDefinition.type] || {};
  const fieldName = formatFieldName(field, config, meta);

  if (value.size < cardinality)
    return undefined;

  if (meta.usedFields.indexOf(field) == -1)
    meta.usedFields.push(field);
  value = value.toArray();
  valueSrc = valueSrc.toArray();
  valueType = valueType.toArray();
  let values = [];
  for (let i = 0 ; i < value.length ; i++) {
    const val = {
      type: valueType[i],
      value: value[i],
    };
    values.push(val);
    if (valueSrc[i] == "field") {
      const secondField = value[i];
      if (meta.usedFields.indexOf(secondField) == -1)
        meta.usedFields.push(secondField);
    }
  }
  let operatorOptions = options ? options.toJS() : null;
  if (operatorOptions && !Object.keys(operatorOptions).length)
    operatorOptions = null;
      
  let ruleQuery = {
    id,
    fieldName,
    type: fieldType,
    input: typeConfig.mainWidget,
    operator,
  };
  if (operatorOptions)
    ruleQuery.operatorOptions = operatorOptions;
  ruleQuery.values = values;
  return ruleQuery;
};
