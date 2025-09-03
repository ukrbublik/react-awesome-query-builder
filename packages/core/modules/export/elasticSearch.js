import {getWidgetForFieldOp} from "../utils/configUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import { extendConfig } from "../utils/configExtend";

// ElasticSearch syntax versions
export const ES_7_SYNTAX = "ES_7_SYNTAX";
export const ES_6_SYNTAX = "ES_6_SYNTAX";

/**
 * Converts a range query parameters based on operator and values
 */
function buildEsRangeParameters(value, operator) {
  if (value.length > 1) {
    return {
      gte: value[0],
      lte: value[1]
    };
  }

  const val = value[0];
  switch (operator) {
  case "equal":
  case "select_equals":
    return { gte: val, lte: val };
  case "not_equal":
    return { gt: val, lt: val };
  case "less_or_equal":
    return { lte: val };
  case "greater_or_equal":
    return { gte: val };
  case "less":
    return { lt: val };
  case "greater":
    return { gt: val };
  default:
    return undefined;
  }
}

/**
 * Builds parameters for a fuzzy query
 */
function buildEsFuzzyParameters(value, fuzziness = "AUTO") {
  return {
    value: value,
    fuzziness: fuzziness
  };
}

/**
 * Builds parameters for a wildcard query with proper escaping
 */
function buildEsWildcardParameters(value, operator) {
  const escaped = value.replace(/[\\*?]/g, "\\$&");
  switch (operator) {
  case "contains":
    return { value: `*${escaped}*` };
  case "starts_with":
    return { value: `${escaped}*` };
  case "ends_with":
    return { value: `*${escaped}` };
  default:
    return { value: escaped };
  }
}

/**
 * Determines the occurrence type for bool queries
 */
function determineOccurrence(combinator, not) {
  switch (combinator) {
  case "AND":
    return not ? "must_not" : "must";
  case "OR":
    return "should";
  case "NOT":
    return not ? "must" : "must_not";
  default:
    return undefined;
  }
}

/**
 * Determines the field name to use in the query
 */
function determineField(fieldName, config) {
  const fieldConfig = config.fields[fieldName];
  return fieldConfig?.elasticSearchField || fieldName;
}

/**
 * Builds query parameters based on query type
 */
function buildParameters(queryType, value, operator, fieldName, config, syntax) {
  const field = determineField(fieldName, config);
  
  switch (queryType) {
  case "term":
    return syntax === ES_7_SYNTAX
      ? { [field]: { value: value[0] }}
      : { [field]: value[0] };
      
  case "terms":
    return { [field]: Array.isArray(value) ? value : [value] };
    
  case "match":
    return { [field]: value[0] };
    
  case "range":
    return { [field]: buildEsRangeParameters(value, operator) };
    
  case "wildcard":
    return { [field]: buildEsWildcardParameters(value[0], operator) };
    
  case "fuzzy":
    return { [field]: buildEsFuzzyParameters(value[0]) };
    
  case "exists":
    return { field };
    
  default:
    return undefined;
  }
}

/**
 * Builds an Elasticsearch rule
 */
function buildEsRule(fieldName, value, operator, config, valueSrc, syntax) {
  if (!fieldName || !operator || value == undefined) {
    return undefined;
  }

  let op = operator;
  let opConfig = config.operators[op];
  if (!opConfig) return undefined;

  let { elasticSearchQueryType } = opConfig;
  
  // Handle negation through reversed operators
  let not = false;
  if (!elasticSearchQueryType && opConfig.reversedOp) {
    not = true;
    op = opConfig.reversedOp;
    opConfig = config.operators[op];
    ({ elasticSearchQueryType } = opConfig);
  }

  // Get widget config
  const widget = getWidgetForFieldOp(config, fieldName, op, valueSrc);
  const widgetConfig = config.widgets[widget];
  if (!widgetConfig) return undefined;

  // Determine query type
  let queryType;
  if (typeof elasticSearchQueryType === "function") {
    queryType = elasticSearchQueryType(widget);
  } else {
    queryType = elasticSearchQueryType;
  }
  if (!queryType) return undefined;

  // Format value
  const { elasticSearchFormatValue } = widgetConfig;
  let parameters;
  if (typeof elasticSearchFormatValue === "function") {
    parameters = elasticSearchFormatValue(queryType, value, op, fieldName, config);
  } else {
    parameters = buildParameters(queryType, value, op, fieldName, config, syntax);
  }
  if (!parameters) return undefined;

  // Handle lists/arrays
  if (Array.isArray(value) && value.length > 1 && !Array.isArray(value[0])) {
    return {
      bool: {
        [op === "not_in" ? "must_not" : "should"]: value.map(v => ({
          [queryType]: buildParameters(queryType, [v], op, fieldName, config, syntax)
        }))
      }
    };
  }

  // Build final query
  if (not) {
    return {
      bool: {
        must_not: {
          [queryType]: parameters
        }
      }
    };
  } else {
    return {
      [queryType]: parameters
    };
  }
}

/**
 * Builds an Elasticsearch bool query group
 */
function buildEsGroup(children, conjunction, not, recursiveFxn, config, syntax) {
  if (!children || !children.size) return undefined;

  const childrenArray = children.valueSeq().toArray();
  const occurrence = determineOccurrence(conjunction, not);
  
  // Handle negation for OR groups properly
  if (not && conjunction === "OR") {
    return {
      bool: {
        must_not: {
          bool: {
            should: childrenArray
              .map(c => recursiveFxn(c, config, syntax))
              .filter(v => v !== undefined)
              .flat(Infinity)
          }
        }
      }
    };
  }

  const result = childrenArray
    .map(c => recursiveFxn(c, config, syntax))
    .filter(v => v !== undefined);

  if (!result.length) return undefined;

  const resultFlat = result.flat(Infinity);
  return {
    bool: {
      [occurrence]: resultFlat
    }
  };
}

/**
 * Main function to convert a query tree to Elasticsearch DSL
 */
export function elasticSearchFormat(tree, config, syntax = ES_6_SYNTAX) {
  const extendedConfig = extendConfig(config, undefined, false);
  if (!tree) return undefined;

  const type = tree.get("type");
  const properties = tree.get("properties") || new Map();

  if (type === "rule" && properties.get("field")) {
    const operator = properties.get("operator");
    const field = properties.get("field");
    const fieldSrc = properties.get("fieldSrc");
    const value = properties.get("value")?.toJS();
    const valueSrc = properties.get("valueSrc")?.get(0);

    if (valueSrc === "func" || fieldSrc === "func") {
      return undefined;
    }

    return buildEsRule(field, value, operator, extendedConfig, valueSrc, syntax);
  }

  if (type === "group" || type === "rule_group") {
    const not = properties.get("not");
    let conjunction = properties.get("conjunction") || defaultConjunction(extendedConfig);
    const children = tree.get("children1");
    return buildEsGroup(children, conjunction, not, elasticSearchFormat, extendedConfig, syntax);
  }

  return undefined;
}
