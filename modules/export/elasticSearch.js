
import {getWidgetForFieldOp} from "../utils/ruleUtils";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Converts a string representation of top_left and bottom_right cords to
 * a ES geo_point required for query
 *
 * @param {string} geoPointString - comma separated string of lat/lon coods
 * @returns {{top_left: {lon: number, lat: number}, bottom_right: {lon: number, lat: number}}} - ES geoPoint formatted object
 * @private
 */
function buildEsGeoPoint(geoPointString) {
  if (geoPointString == null) {
    return null;
  }

  var coordsNumberArray = geoPointString.split(",").map(Number);
  return {
    top_left: {
      lat: coordsNumberArray[0],
      lon: coordsNumberArray[1]
    },
    bottom_right: {
      lat: coordsNumberArray[2],
      lon: coordsNumberArray[3]
    }
  };
}
/**
 * Converts a dateTime string from the query builder to a ES range formatted object
 *
 * @param {string} dateTime - dateTime formatted string
 * @param {string} operator - query builder operator type, see constants.js and query builder docs
 * @returns {{lt: string}|{lte: string}|{gte: string}|{gte: string, lte: string}|undefined} - ES range query parameter
 *
 * @private
 */


function buildEsRangeParameters(value, operator) {
  // -- if value is greater than 1 then we assume this is a between operator : BUG this is wrong, a selectable list can have multiple values
  if (value.length > 1) {
    return {
      gte: "".concat(value[0]),
      lte: "".concat(value[1])
    };
  } // -- if value is only one we assume this is a date time query for a specific day


  var dateTime = value[0]; //TODO: Rethink about this part, what if someone adds a new type of opperator

  switch (operator) {
  case "on_date":
  case "not_on_date":
  case "equal":
  case "select_equals":
  case "not_equal":
    return {
      gte: "".concat(dateTime, "||/d"),
      lte: "".concat(dateTime, "||+1d")
    };

  case "less_or_equal":
    return {
      lte: "".concat(dateTime)
    };

  case "greater_or_equal":
    return {
      gte: "".concat(dateTime)
    };

  case "less":
    return {
      lt: "".concat(dateTime)
    };

  case "greater":
    return {
      gte: "".concat(dateTime)
    };

  default:
    return undefined;
  }
}
/**
 * Builds the DSL parameters for a Wildcard query
 *
 * @param {string} value - The match value
 * @returns {{value: string}} - The value = value parameter surrounded with * on each end
 * @private
 */


function buildEsWildcardParameters(value) {
  return {
    value: "*".concat(value, "*")
  };
}
/**
 * Takes the match type string from awesome query builder like 'greater_or_equal' and
 * returns the ES occurrence required for bool queries
 *
 * @param {string} combinator - query group type or rule condition
 * @returns {string} - ES occurrence type. See constants.js
 * @private
 */


function determineOccurrence(combinator) {
  switch (combinator) {
  case "AND":
    return "must";
    // -- AND

  case "OR":
    return "should";
    // -- OR

  case "NOT":
    return "must_not";
    // -- NOT AND

  default:
    return undefined;
  }
}
/**
 * Determines what field to query off of given the operator type
 *
 * @param {string} fieldDataType - The type of data
 * @param {string} fullFieldName - A '.' separated string containing the property lineage (including self)
 * @param {string} queryType - The query type
 * @returns {string|*} - will be either the fullFieldName or fullFieldName.keyword
 * @private
 */


function determineQueryField(fieldDataType, fullFieldName, queryType) {
  if (fieldDataType === "boolean") {
    return fullFieldName;
  }

  switch (queryType) {
  case "term":
  case "wildcard":
    return "".concat(fullFieldName, ".keyword");

  case "geo_bounding_box":
  case "range":
  case "match":
    return fullFieldName;

  default:
    console.error("Can't determine query field for query type ".concat(queryType));
    return null;
  }
}

function buildRegexpParameters(value) {
  return {
    value: value
  };
}

function determineField(fieldName, config) {
  return config.fields[fieldName].ElasticSearchTextField || fieldName;
}

function buildParameters(queryType, value, operator, fieldName, config) {
  switch (queryType) {
  case "filter":
    return {
      script: config.operators[operator].elasticSearchScript(fieldName, value)
    };

  case "exists":
    return { field: fieldName };

  case "match":
    var textField = determineField(fieldName, config);
    return { [textField]: value[0] };

  case "term":
    return { [fieldName]: value[0] };

  //todo: not used so far
  // need to add geo type into RAQB or remove this code
  case "geo_bounding_box":
    return { [fieldName]: buildEsGeoPoint(value[0]) };

  case "range":
    return { [fieldName]: buildEsRangeParameters(value, operator) };

  case "wildcard":
    return { [fieldName]: buildEsWildcardParameters(value[0]) };

  case "regexp":
    return { [fieldName]: buildRegexpParameters(value[0]) };

  default:
    return undefined;
  }
}
/**
 * Handles the building of the group portion of the DSL
 *
 * @param {string} fieldName - The name of the field you are building a rule for
 * @param {string} fieldDataType - The type of data this field holds
 * @param {string} value - The value of this rule
 * @param {string} operator - The condition on how the value is matched
 * @returns {object} - The ES rule
 * @private
 */


function buildEsRule(fieldName, value, operator, config, valueSrc) {
  // handle if value 0 has multiple values like a select in a array
  var widget = getWidgetForFieldOp(config, fieldName, operator, valueSrc);
  var occurrence = config.operators[operator].elasticSearchOccurrence;
  /** In most cases the queryType will be static however in some casese (like between) the query type will change
   * based on the data type. i.e. a between time will be different than between number, date, letters etc... */

  var queryType;

  if (typeof config.operators[operator].elasticSearchQueryType === "function") {
    queryType = config.operators[operator].elasticSearchQueryType(widget);
  } else {
    queryType = config.operators[operator].elasticSearchQueryType;
  }
  /** If a widget has a rule on how to format that data then use that otherwise use default way of determineing search parameters
   * */


  var parameters;

  if (typeof config.widgets[widget].elasticSearchFormatValue === "function") {
    parameters = config.widgets[widget].elasticSearchFormatValue(queryType, value, operator, fieldName, config);
  } else {
    parameters = buildParameters(queryType, value, operator, fieldName, config);
  }

  if (occurrence === "must") {
    return {
      [queryType]: {...parameters}
    };
  }

  return {
    bool: {
      [occurrence]: {
        [queryType]: {...parameters}
      }
    }
  };
}

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
/**
 * Handles the building of the group portion of the DSL
 *
 * @param {object} children - The contents of the group
 * @param {string} conjunction - The way the contents of the group are joined together i.e. AND OR
 * @param {Function} recursiveFxn - The recursive fxn to build the contents of the groups children
 * @private
 * @returns {object} - The ES group
 */


function buildEsGroup(children, conjunction, recursiveFxn, config) {
  var realChildren = children.valueSeq().toArray();
  var occurrence = determineOccurrence(conjunction);
  var result = realChildren.map(function (c) {
    return recursiveFxn(c, config);
  });
  return {
    bool: _defineProperty({}, occurrence, flatten(result))
  };
}

export function elasticSearchFormat(tree, config) {
  // -- format the es dsl here
  if (!tree) return undefined;
  var type = tree.get("type");
  var tk_dbug = tree.toJS();
  var properties = tree.get("properties");
  var tk_properties = properties.toJS();

  if (type === "rule" && properties.get("field")) {
    // -- field is null when a new blank rule is added
    var operator = properties.get("operator");
    var field = properties.get("field");
    var value = properties.get("value").toJS();
    var valueType = properties.get("valueType").get(0);
    var valueSrc = properties.get("valueSrc").get(0);

    if (valueSrc === "func") {
      // -- elastic search doesn't support functions (that is post processing)
      return;
    }

    if (value && Array.isArray(value[0])) {
      //TODO : Handle case where the value has multiple values such as in the case of a list
      return value[0].map(function (val) {
        return buildEsRule(field, [val], operator, config, valueSrc);
      });
    } else {
      return buildEsRule(field, value, operator, config, valueSrc);
    }
  }

  if (type === "group" || type === "rule_group") {
    var thing = tree.toJS();
    var conjunction = tree.get("properties").get("conjunction");
    var children = tree.get("children1");
    return buildEsGroup(children, conjunction, elasticSearchFormat, config);
  }
}