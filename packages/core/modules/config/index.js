import {settings as defaultSettings} from "./default";
import ctx from "./ctx";



//----------------------------  conjunctions

const conjunctions = {
  AND: {
    label: "And",
    mongoConj: "$and",
    jsonLogicConj: "and",
    sqlConj: "AND",
    spelConj: "and",
    spelConjs: ["and", "&&"],
    reversedConj: "OR",
    formatConj: function (children, conj, not, isForDisplay) {
      let ret = children.size > 1 ? children.join(" " + (isForDisplay ? "AND" : "&&") + " ") : children.first();
      if (children.size > 1 || not) {
        ret = this.utils.wrapWithBrackets(ret);
      }
      if (not) {
        ret = "NOT " + ret;
      }
      return ret;
    },
    sqlFormatConj: function (children, conj, not) {
      let ret = children.size > 1 ? children.join(" " + "AND" + " ") : children.first();
      if (children.size > 1 || not) {
        ret = this.utils.wrapWithBrackets(ret);
      }
      if (not) {
        ret = "NOT " + ret;
      }
      return ret;
    },
    spelFormatConj: function (children, conj, not, omitBrackets) {
      if (not) omitBrackets = false;
      let ret = children.size > 1 ? children.join(" " + "&&" + " ") : children.first();
      if ((children.size > 1 || not) && !omitBrackets) {
        ret = this.utils.wrapWithBrackets(ret);
      }
      if (not) {
        ret = "!" + ret;
      }
      return ret;
    },
  },
  OR: {
    label: "Or",
    mongoConj: "$or",
    jsonLogicConj: "or",
    sqlConj: "OR",
    spelConj: "or",
    spelConjs: ["or", "||"],
    reversedConj: "AND",
    formatConj: (children, conj, not, isForDisplay) => {
      return children.size > 1
        ? (not ? "NOT " : "") + "(" + children.join(" " + (isForDisplay ? "OR" : "||") + " ") + ")"
        : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
    },
    sqlFormatConj: function (children, conj, not) {
      let ret = (children.size > 1 ? children.join(" " + "OR" + " ") : children.first());
      if (children.size > 1 || not) {
        ret = this.utils.wrapWithBrackets(ret);
      }
      if (not) {
        ret = "NOT " + ret;
      }
      return ret;
    },
    spelFormatConj: (children, conj, not, omitBrackets) => {
      if (not) omitBrackets = false;
      return children.size > 1
        ? (not ? "!" : "") + (omitBrackets ? "" : "(") + children.join(" " + "||" + " ") + (omitBrackets ? "" : ")")
        : (not ? "!(" : "") + children.first() + (not ? ")" : "");
    },
  },
};

//----------------------------  operators



const operators = {
  equal: {
    label: "==",
    labelForFormat: "==",
    sqlOp: "=",
    spelOp: "==",
    spelOps: ["==", "eq"],
    reversedOp: "not_equal",
    formatOp: (field, op, value, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay, fieldDef) => {
      const opStr = isForDisplay ? "=" : opDef.label;
      if (valueTypes == "boolean" && isForDisplay)
        return value == "No" ? `NOT ${field}` : `${field}`;
      else
        return `${field} ${opStr} ${value}`;
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$eq", v => v, false, ...args); },
    jsonLogic2: "==",
    jsonLogicOps: ["==", "datetime==", "date=="],
    jsonLogic: (field, op, val, _opDef, _opOpts, _fieldDef, expectedType, settings) => {
      if (settings?.fixJsonLogicDateCompareOp && ["date", "datetime"].includes(expectedType)) {
        return { [`${expectedType}==`]: [field, val] };
      }
      return { "==": [field, val] };
    },
    elasticSearchQueryType: "term",
  },
  not_equal: {
    isNotOp: true,
    label: "!=",
    labelForFormat: "!=",
    sqlOp: "<>",
    sqlOps: ["<>", "!="],
    spelOp: "!=",
    spelOps: ["!=", "ne"],
    reversedOp: "equal",
    formatOp: (field, op, value, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay, fieldDef) => {
      if (valueTypes == "boolean" && isForDisplay)
        return value == "No" ? `${field}` : `NOT ${field}`;
      else
        return `${field} ${opDef.label} ${value}`;
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$ne", v => v, false, ...args); },
    jsonLogic2: "!=",
    jsonLogicOps: ["!=", "datetime!=", "date!="],
    jsonLogic: (field, op, val, _opDef, _opOpts, _fieldDef, expectedType, settings) => {
      if (settings?.fixJsonLogicDateCompareOp && ["date", "datetime"].includes(expectedType)) {
        return { [`${expectedType}!=`]: [field, val] };
      }
      return { "!=": [field, val] };
    },
  },
  less: {
    label: "<",
    labelForFormat: "<",
    sqlOp: "<",
    spelOp: "<",
    spelOps: ["<", "lt"],
    reversedOp: "greater_or_equal",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$lt", v => v, false, ...args); },
    jsonLogic: "<",
    elasticSearchQueryType: "range",
  },
  less_or_equal: {
    label: "<=",
    labelForFormat: "<=",
    sqlOp: "<=",
    spelOp: "<=",
    spelOps: ["<=", "le"],
    reversedOp: "greater",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$lte", v => v, false, ...args); },
    jsonLogic: "<=",
    elasticSearchQueryType: "range",
  },
  greater: {
    label: ">",
    labelForFormat: ">",
    sqlOp: ">",
    spelOp: ">",
    spelOps: [">", "gt"],
    reversedOp: "less_or_equal",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$gt", v => v, false, ...args); },
    jsonLogic: ">",
    elasticSearchQueryType: "range",
  },
  greater_or_equal: {
    label: ">=",
    labelForFormat: ">=",
    sqlOp: ">=",
    spelOp: ">=",
    spelOps: [">=", "ge"],
    reversedOp: "less",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$gte", v => v, false, ...args); },
    jsonLogic: ">=",
    elasticSearchQueryType: "range",
  },
  like: {
    label: "Contains",
    labelForFormat: "Contains",
    reversedOp: "not_like",
    sqlOp: "LIKE",
    // tip: this function covers import of 3 operators
    sqlImport: function (sqlObj, _, sqlDialect) {
      if (sqlObj?.operator == "LIKE" || sqlObj?.operator == "NOT LIKE") {
        const not = sqlObj?.operator == "NOT LIKE";
        const [_left, right] = sqlObj.children || [];
        if (right?.valueType?.endsWith("_quote_string")) {
          if (right?.value.startsWith("%") && right?.value.endsWith("%")) {
            right.value = this.utils.SqlString.unescapeLike(right.value.substring(1, right.value.length - 1), sqlDialect);
            sqlObj.operator = not ? "not_like" : "like";
            return sqlObj;
          } else if (right?.value.startsWith("%")) {
            right.value = this.utils.SqlString.unescapeLike(right.value.substring(1), sqlDialect);
            sqlObj.operator = "ends_with";
            return sqlObj;
          } else if (right?.value.endsWith("%")) {
            right.value = this.utils.SqlString.unescapeLike(right.value.substring(0, right.value.length - 1), sqlDialect);
            sqlObj.operator = "starts_with";
            return sqlObj;
          }
        }
      }
    },
    spelOp: "${0}.contains(${1})",
    valueTypes: ["text"],
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$regex", v => (typeof v == "string" ? this.utils.escapeRegExp(v) : undefined), false, ...args); },
    jsonLogic: (field, op, val) => ({ "in": [val, field] }),
    jsonLogic2: "#in",
    valueSources: ["value"],
    elasticSearchQueryType: "regexp",
  },
  not_like: {
    isNotOp: true,
    label: "Not contains",
    reversedOp: "like",
    labelForFormat: "Not Contains",
    sqlOp: "NOT LIKE",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$regex", v => (typeof v == "string" ? this.utils.escapeRegExp(v) : undefined), true, ...args); },
    jsonLogic: (field, op, val) => ({"!": { "in": [val, field] }}),
    jsonLogic2: "#!in",
    _jsonLogicIsExclamationOp: true,
    valueSources: ["value"],
  },
  starts_with: {
    label: "Starts with",
    labelForFormat: "Starts with",
    sqlOp: "LIKE",
    spelOp: "${0}.startsWith(${1})",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$regex", v => (typeof v == "string" ? "^" + this.utils.escapeRegExp(v) : undefined), false, ...args); },
    jsonLogic: undefined, // not supported
    valueSources: ["value"],
  },
  ends_with: {
    label: "Ends with",
    labelForFormat: "Ends with",
    sqlOp: "LIKE",
    spelOp: "${0}.endsWith(${1})",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$regex", v => (typeof v == "string" ? this.utils.escapeRegExp(v) + "$" : undefined), false, ...args); },
    jsonLogic: undefined, // not supported
    valueSources: ["value"],
  },
  between: {
    label: "Between",
    labelForFormat: "BETWEEN",
    sqlOp: "BETWEEN",
    cardinality: 2,
    formatOp: (field, op, values, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay) => {
      let valFrom = values.first();
      let valTo = values.get(1);
      if (isForDisplay)
        return `${field} BETWEEN ${valFrom} AND ${valTo}`;
      else
        return `${field} >= ${valFrom} && ${field} <= ${valTo}`;
    },
    // tip: this op can be imported from SpEL manually without using config
    spelFormatOp: (field, op, values, valueSrc, valueTypes, opDef, operatorOptions, fieldDef) => {
      const valFrom = values[0];
      const valTo = values[1];
      return `(${field} >= ${valFrom} && ${field} <= ${valTo})`;
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp2(["$gte", "$lte"], false, ...args); },
    valueLabels: [
      "Value from",
      "Value to"
    ],
    textSeparators: [
      null,
      "and"
    ],
    reversedOp: "not_between",
    jsonLogic: "<=",
    validateValues: (values) => {
      if (values[0] != undefined && values[1] != undefined) {
        return values[0] <= values[1];
      }
      return null;
    },
    elasticSearchQueryType: function elasticSearchQueryType(type) {
      return type === "time" ? "filter" : "range";
    },
  },
  not_between: {
    isNotOp: true,
    label: "Not between",
    labelForFormat: "NOT BETWEEN",
    sqlOp: "NOT BETWEEN",
    cardinality: 2,
    formatOp: (field, op, values, valueSrcs, valueTypes, opDef, operatorOptions, isForDisplay) => {
      let valFrom = values.first();
      let valTo = values.get(1);
      if (isForDisplay)
        return `${field} NOT BETWEEN ${valFrom} AND ${valTo}`;
      else
        return `(${field} < ${valFrom} || ${field} > ${valTo})`;
    },
    spelFormatOp: (field, op, values, valueSrc, valueTypes, opDef, operatorOptions, fieldDef) => {
      const valFrom = values[0];
      const valTo = values[1];
      return `(${field} < ${valFrom} || ${field} > ${valTo})`;
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp2(["$gte", "$lte"], true, ...args); },
    valueLabels: [
      "Value from",
      "Value to"
    ],
    textSeparators: [
      null,
      "and"
    ],
    reversedOp: "between",
    jsonLogic: (field, op, val) => ({"!": { "<=": [Array.isArray(val) ? val[0] : val, field, Array.isArray(val) ? val[1] : val] }}),
    jsonLogic2: "!<=",
    _jsonLogicIsExclamationOp: true,
    validateValues: (values) => {
      if (values[0] != undefined && values[1] != undefined) {
        return values[0] <= values[1];
      }
      return null;
    },
  },
  is_empty: {
    label: "Is empty",
    labelForFormat: "IS EMPTY",
    cardinality: 0,
    reversedOp: "is_not_empty",
    formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      return isForDisplay ? `${field} IS EMPTY` : `!${field}`;
    },
    sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      const empty = this.utils.sqlEmptyValue(fieldDef);
      return `COALESCE(${field}, ${empty}) = ${empty}`;
    },
    // tip: this function covers import of 2 operators
    sqlImport: function (sqlObj, _, sqlDialect) {
      if (sqlObj?.operator === "=" || sqlObj?.operator === "<>") {
        const [left, right] = sqlObj.children || [];
        if (right?.value === "" && left?.func === "COALESCE" && left?.children?.[1]?.value === "") {
          sqlObj.operator = sqlObj?.operator === "=" ? "is_empty" : "is_not_empty";
          sqlObj.children = [ left.children[0] ];
          return sqlObj;
        }
      }
    },
    // tip: this op can be imported from SpEL manually without using config
    spelFormatOp: (field, op, values, valueSrc, valueTypes, opDef, operatorOptions, fieldDef) => {
      //tip: is empty or null
      return `${field} <= ''`;
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$in", (v, fieldDef) => [this.utils.mongoEmptyValue(fieldDef), null], false, ...args); },
    jsonLogic: "!",
  },
  is_not_empty: {
    isNotOp: true,
    label: "Is not empty",
    labelForFormat: "IS NOT EMPTY",
    cardinality: 0,
    reversedOp: "is_empty",
    formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      return isForDisplay ? `${field} IS NOT EMPTY` : `!!${field}`;
    },
    sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      const empty = this.utils.sqlEmptyValue(fieldDef);
      return `COALESCE(${field}, ${empty}) <> ${empty}`;
    },
    spelFormatOp: (field, op, values, valueSrc, valueTypes, opDef, operatorOptions, fieldDef) => {
      //tip: is not empty and not null
      return `${field} > ''`;
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$nin", (v, fieldDef) => [this.utils.mongoEmptyValue(fieldDef), null], false, ...args); },
    jsonLogic: "!!",
    elasticSearchQueryType: "exists",
  },
  is_null: {
    label: "Is null",
    labelForFormat: "IS NULL",
    sqlOp: "IS NULL",
    // tip: this function covers import of 2 operators
    sqlImport: function (sqlObj, _, sqlDialect) {
      if (sqlObj?.operator === "IS" || sqlObj?.operator === "IS NOT") {
        const [left, right] = sqlObj.children || [];
        if (right?.valueType == "null") {
          sqlObj.operator = sqlObj?.operator === "IS" ? "is_null" : "is_not_null";
          sqlObj.value = left;
          return sqlObj;
        }
      }
    },
    cardinality: 0,
    reversedOp: "is_not_null",
    formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      return isForDisplay ? `${field} IS NULL` : `!${field}`;
    },
    // tip: this op can be imported from SpEL manually without using config
    spelFormatOp: (field, op, values, valueSrc, valueTypes, opDef, operatorOptions, fieldDef) => {
      return `${field} == null`;
    },
    // check if value is null OR not exists
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$eq", v => null, false, ...args); },
    jsonLogic: "==",
  },
  is_not_null: {
    label: "Is not null",
    labelForFormat: "IS NOT NULL",
    sqlOp: "IS NOT NULL",
    cardinality: 0,
    reversedOp: "is_null",
    formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      return isForDisplay ? `${field} IS NOT NULL` : `!!${field}`;
    },
    spelFormatOp: (field, op, values, valueSrc, valueTypes, opDef, operatorOptions, fieldDef) => {
      return `${field} != null`;
    },
    // check if value exists and is not null
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$ne", v => null, false, ...args); },
    jsonLogic: "!=",
    elasticSearchQueryType: "exists",
  },
  select_equals: {
    label: "==",
    labelForFormat: "==",
    sqlOp: "=", // enum/set
    formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      const opStr = isForDisplay ? "=" : "==";
      return `${field} ${opStr} ${value}`;
    },
    spelOp: "==",
    spelOps: ["==", "eq"],
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$eq", v => v, false, ...args); },
    reversedOp: "select_not_equals",
    jsonLogic: "==",
    elasticSearchQueryType: "term",
  },
  select_not_equals: {
    isNotOp: true,
    label: "!=",
    labelForFormat: "!=",
    sqlOp: "<>", // enum/set
    sqlOps: ["<>", "!="],
    formatOp: (field, op, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      return `${field} != ${value}`;
    },
    spelOp: "!=",
    spelOps: ["!=", "ne"],
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$ne", v => v, false, ...args); },
    reversedOp: "select_equals",
    jsonLogic: "!=",
  },
  select_any_in: {
    label: "Any in",
    labelForFormat: "IN",
    sqlOp: "IN",
    formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      if (valueSrc == "value")
        return `${field} IN (${values.join(", ")})`;
      else
        return `${field} IN (${values})`;
    },
    sqlFormatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      if (valueSrc == "value") {
        return `${field} IN (${values.join(", ")})`;
      } else return undefined; // not supported
    },
    valueTypes: ["multiselect"],
    spelOp: "${1}.contains(${0})",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$in", v => v, false, ...args); },
    reversedOp: "select_not_any_in",
    jsonLogic: "in",
    elasticSearchQueryType: "term",
  },
  select_not_any_in: {
    isNotOp: true,
    label: "Not in",
    labelForFormat: "NOT IN",
    sqlOp: "NOT IN",
    formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      if (valueSrc == "value")
        return `${field} NOT IN (${values.join(", ")})`;
      else
        return `${field} NOT IN (${values})`;
    },
    sqlFormatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      if (valueSrc == "value") {
        return `${field} NOT IN (${values.join(", ")})`;
      } else return undefined; // not supported
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$nin", v => v, false, ...args); },
    reversedOp: "select_any_in",
    jsonLogic: (field, op, val) => ({"!": { "in": [field, val] }}),
    jsonLogic2: "!in",
    _jsonLogicIsExclamationOp: true,
  },
  // it's not "contains all", but "contains any" operator
  multiselect_contains: {
    label: "Contains",
    labelForFormat: "CONTAINS",
    valueTypes: ["multiselect"],
    formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      if (valueSrc == "value")
        return `${field} CONTAINS [${values.join(", ")}]`;
      else
        return `${field} CONTAINS ${values}`;
    },
    reversedOp: "multiselect_not_contains",
    jsonLogic2: "some-in",
    jsonLogic: (field, op, vals) => ({
      "some": [ field, {"in": [{"var": ""}, vals]} ]
    }),
    //spelOp: "${0}.containsAll(${1})",
    spelOp: "T(CollectionUtils).containsAny(${0}, ${1})",
    spelImportFuncs: [
      // just for backward compatibility (issue #1007)
      {
        obj: {
          type: "property",
          val: "CollectionUtils"
        },
        methodName: "containsAny",
        args: [
          {var: "0"},
          {var: "1"},
        ],
      }
    ],
    elasticSearchQueryType: "term",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$in", v => v, false, ...args); },
  },
  multiselect_not_contains: {
    isNotOp: true,
    label: "Not contains",
    labelForFormat: "NOT CONTAINS",
    valueTypes: ["multiselect"],
    formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      if (valueSrc == "value")
        return `${field} NOT CONTAINS [${values.join(", ")}]`;
      else
        return `${field} NOT CONTAINS ${values}`;
    },
    reversedOp: "multiselect_contains",
    jsonLogic2: "!some-in",
    jsonLogic: (field, op, vals) => ({
      "!": { "some": [ field, {"in": [{"var": ""}, vals]} ]}
    }),
    _jsonLogicIsExclamationOp: true,
  },
  multiselect_equals: {
    label: "Equals",
    labelForFormat: "==",
    sqlOp: "=",
    valueTypes: ["multiselect"],
    formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      const opStr = isForDisplay ? "=" : "==";
      if (valueSrc == "value")
        return `${field} ${opStr} [${values.join(", ")}]`;
      else
        return `${field} ${opStr} ${values}`;
    },
    sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      if (valueSrc == "value")
      // set
        return `${field} = '${values.map(v => this.utils.SqlString.trim(v)).join(",")}'`;
      else
        return undefined; //not supported
    },
    spelOp: "${0}.equals(${1})",
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$eq", v => v, false, ...args); },
    reversedOp: "multiselect_not_equals",
    jsonLogic2: "all-in",
    jsonLogic: (field, op, vals) => ({
      // it's not "equals", but "includes" operator - just for example
      "all": [ field, {"in": [{"var": ""}, vals]} ]
    }),
    elasticSearchQueryType: "term",
  },
  multiselect_not_equals: {
    isNotOp: true,
    label: "Not equals",
    labelForFormat: "!=",
    sqlOp: "<>",
    sqlOps: ["<>", "!="],
    valueTypes: ["multiselect"],
    formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      if (valueSrc == "value")
        return `${field} != [${values.join(", ")}]`;
      else
        return `${field} != ${values}`;
    },
    sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      if (valueSrc == "value")
      // set
        return `${field} != '${values.map(v => this.utils.SqlString.trim(v)).join(",")}'`;
      else
        return undefined; //not supported
    },
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$ne", v => v, false, ...args); },
    reversedOp: "multiselect_equals",
    jsonLogic2: "!all-in",
    jsonLogic: (field, op, vals) => ({
      // it's not "equals", but "includes" operator - just for example
      "!": { "all": [ field, {"in": [{"var": ""}, vals]} ]}
    }),
    _jsonLogicIsExclamationOp: true,
  },
  proximity: {
    label: "Proximity search",
    cardinality: 2,
    valueLabels: [
      { label: "Word 1", placeholder: "Enter first word" },
      { label: "Word 2", placeholder: "Enter second word" },
    ],
    textSeparators: [
      //'Word 1',
      //'Word 2'
    ],
    formatOp: (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      const val1 = values.first();
      const val2 = values.get(1);
      const prox = operatorOptions?.get("proximity");
      return `${field} ${val1} NEAR/${prox} ${val2}`;
    },
    sqlFormatOp: function (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      // https://learn.microsoft.com/en-us/sql/relational-databases/search/search-for-words-close-to-another-word-with-near?view=sql-server-ver16#example-1
      const val1 = values.first();
      const val2 = values.get(1);
      const aVal1 = this.utils.SqlString.trim(val1);
      const aVal2 = this.utils.SqlString.trim(val2);
      const prox = operatorOptions?.get("proximity");
      return `CONTAINS(${field}, 'NEAR((${aVal1}, ${aVal2}), ${prox})')`;
    },
    sqlImport: function (sqlObj, _, sqlDialect) {
      if (sqlObj?.func === "CONTAINS") {
        const [left, right] = sqlObj.children || [];
        if (right?.value?.includes("NEAR(")) {
          const m = right.value.match(/NEAR\(\((\w+), (\w+)\), (\d+)\)/);
          if (m) {
            delete sqlObj.func;
            sqlObj.operator = "proximity";
            sqlObj.children = [
              left,
              { value: m[1] },
              { value: m[2] },
            ];
            sqlObj.operatorOptions = {
              proximity: parseInt(m[3])
            };
            return sqlObj;
          }
        }
      }
    },
    mongoFormatOp: undefined, // not supported
    jsonLogic: undefined, // not supported
    options: {
      optionLabel: "Near", // label on top of "near" selectbox (for config.settings.showLabels==true)
      optionTextBefore: "Near", // label before "near" selectbox (for config.settings.showLabels==false)
      optionPlaceholder: "Select words between", // placeholder for "near" selectbox
      minProximity: 2,
      maxProximity: 10,
      defaults: {
        proximity: 2
      },
    },
  },
  some: {
    label: "Some",
    labelForFormat: "SOME",
    cardinality: 0,
    jsonLogic: "some",
    spelFormatOp: (filteredSize) => `${filteredSize} > 0`,
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$gt", v => 0, false, ...args); },
    // reversedOp: undefined,
  },
  all: {
    label: "All",
    labelForFormat: "ALL",
    cardinality: 0,
    jsonLogic: "all",
    spelFormatOp: (filteredSize, op, fullSize) => `${filteredSize} == ${fullSize}`,
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$eq", v => v, false, ...args); },
    // reversedOp: "none",
  },
  none: {
    label: "None",
    labelForFormat: "NONE",
    cardinality: 0,
    jsonLogic: "none",
    spelFormatOp: (filteredSize) => `${filteredSize} == 0`,
    mongoFormatOp: function(...args) { return this.utils.mongoFormatOp1("$eq", v => 0, false, ...args); },
    // reversedOp: "all",
  }
};


//----------------------------  widgets

const widgets = {
  text: {
    type: "text",
    jsType: "string",
    valueSrc: "value",
    valueLabel: "String",
    valuePlaceholder: "Enter string",
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay ? this.utils.stringifyForDisplay(val) : JSON.stringify(val);
    },
    spelFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      return this.utils.spelEscape(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      if (opDef.sqlOp == "LIKE" || opDef.sqlOp == "NOT LIKE") {
        return this.utils.SqlString.escapeLike(val, op != "starts_with", op != "ends_with", sqlDialect);
      } else {
        return this.utils.SqlString.escape(val);
      }
    },
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
  },
  textarea: {
    type: "text",
    jsType: "string",
    valueSrc: "value",
    valueLabel: "Text",
    valuePlaceholder: "Enter text",
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay ? this.utils.stringifyForDisplay(val) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      if (opDef.sqlOp == "LIKE" || opDef.sqlOp == "NOT LIKE") {
        return this.utils.SqlString.escapeLike(val, op != "starts_with", op != "ends_with", sqlDialect);
      } else {
        return this.utils.SqlString.escape(val);
      }
    },
    spelFormatValue: function (val) { return this.utils.spelEscape(val); },
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
    fullWidth: true,
  },
  number: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    valueLabel: "Number",
    valuePlaceholder: "Enter number",
    valueLabels: [
      { label: "Number from", placeholder: "Enter number from" },
      { label: "Number to", placeholder: "Enter number to" },
    ],
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay ? this.utils.stringifyForDisplay(val) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function (val, fieldDef, wgtDef) {
      const isFloat = wgtDef.step && !Number.isInteger(wgtDef.step);
      return this.utils.spelEscape(val, isFloat);
    },
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
  },
  price: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    valueLabel: "Price",
    valueLabels: [
      { label: "Price from", placeholder: "Enter price from" },
      { label: "Price to", placeholder: "Enter price to" },
    ],
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {      
      return isForDisplay ? this.utils.stringifyForDisplay(val) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function (val, fieldDef, wgtDef) {
      const isFloat = wgtDef.step && !Number.isInteger(wgtDef.step);
      return this.utils.spelEscape(val, isFloat);
    },
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
  },
  slider: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    valueLabel: "Number",
    valuePlaceholder: "Enter number or move slider",
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay ? this.utils.stringifyForDisplay(val) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function (val) { return this.utils.spelEscape(val); },
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
  },
  select: {
    type: "select",
    jsType: "string",
    valueSrc: "value",
    valueLabel: "Value",
    valuePlaceholder: "Select value",
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      let valLabel = this.utils.getTitleInListValues(fieldDef.fieldSettings.listValues || fieldDef.asyncListValues, val);
      return isForDisplay ? this.utils.stringifyForDisplay(valLabel) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function (val) { return this.utils.spelEscape(val); },
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
  },
  multiselect: {
    type: "multiselect",
    jsType: "array",
    valueSrc: "value",
    valueLabel: "Values",
    valuePlaceholder: "Select values",
    formatValue: function (vals, fieldDef, wgtDef, isForDisplay) {
      let valsLabels = vals.map(v => this.utils.getTitleInListValues(fieldDef.fieldSettings.listValues || fieldDef.asyncListValues, v));
      return isForDisplay ? valsLabels.map(this.utils.stringifyForDisplay) : vals.map(JSON.stringify);
    },
    sqlFormatValue: function (vals, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      return vals.map(v => this.utils.SqlString.escape(v));
    },
    spelFormatValue: function (vals, fieldDef, wgtDef, op, opDef) {
      const isCallable = opDef && opDef.spelOp && opDef.spelOp.startsWith("${1}");
      let res = this.utils.spelEscape(vals); // inline list
      if (isCallable) {
        // `{1,2}.contains(1)` NOT works
        // `{1,2}.?[true].contains(1)` works
        res = this.utils.spelFixList(res);
      }
      return res;
    },
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
  },
  date: {
    type: "date",
    jsType: "string",
    valueSrc: "value",
    dateFormat: "DD.MM.YYYY",
    valueFormat: "YYYY-MM-DD",
    valueLabel: "Date",
    valuePlaceholder: "Enter date",
    valueLabels: [
      { label: "Date from", placeholder: "Enter date from" },
      { label: "Date to", placeholder: "Enter date to" },
    ],
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return isForDisplay ? dateVal.format(wgtDef.dateFormat) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return this.utils.SqlString.escape(dateVal.format("YYYY-MM-DD"));
    },
    spelFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      const v = dateVal.format("YYYY-MM-DD");
      const fmt = "yyyy-MM-dd";
      //return `new java.text.SimpleDateFormat('${fmt}').parse('${v}')`;
      return `T(java.time.LocalDate).parse('${v}', T(java.time.format.DateTimeFormatter).ofPattern('${fmt}'))`;
    },
    spelImportFuncs: [
      //"new java.text.SimpleDateFormat(${fmt}).parse(${v})",
      {
        obj: {
          cls: ["java", "time", "LocalDate"],
        },
        methodName: "parse",
        args: [
          {var: "v"},
          {
            obj: {
              cls: ["java", "time", "format", "DateTimeFormatter"],
            },
            methodName: "ofPattern",
            args: [
              {var: "fmt"}
            ]
          },
        ],
      }
    ],
    spelImportValue: function (val, wgtDef, args) {
      if (!wgtDef)
        return [undefined, "No widget def to get value format"];
      if (args?.fmt?.value?.includes?.(" ") || args.fmt?.value?.toLowerCase?.().includes("hh:mm"))
        return [undefined, `Invalid date format ${JSON.stringify(args.fmt)}`];
      const dateVal = this.utils.moment(val.value, this.utils.moment.ISO_8601);
      if (dateVal.isValid()) {
        return [dateVal.format(wgtDef?.valueFormat), []];
      } else {
        return [undefined, "Invalid date"];
      }
    },
    jsonLogic: function (val, fieldDef, wgtDef) {
      // tip: we use UTC to return same result as new Date(val)
      // new Date("2000-01-01") is now the same as new Date("2000-01-01 00:00:00") (first one in UTC)
      return this.utils.moment.utc(val, wgtDef.valueFormat).toDate();
    },
    toJS: function (val, fieldSettings) {
      const dateVal = this.utils.moment(val, fieldSettings.valueFormat);
      return dateVal.isValid() ? dateVal.toDate() : undefined;
    },
    mongoFormatValue: function (val, fieldDef, wgtDef) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      if (dateVal.isValid()) {
        return {
          "$dateFromString": {
            "dateString": dateVal.format("YYYY-MM-DD"),
            "format": "%Y-%m-%d"
          }
        };
      }
      return undefined;
    }
  },
  time: {
    type: "time",
    jsType: "string",
    valueSrc: "value",
    timeFormat: "HH:mm",
    valueFormat: "HH:mm:ss",
    use12Hours: false,
    valueLabel: "Time",
    valuePlaceholder: "Enter time",
    valueLabels: [
      { label: "Time from", placeholder: "Enter time from" },
      { label: "Time to", placeholder: "Enter time to" },
    ],
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return isForDisplay ? dateVal.format(wgtDef.timeFormat) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return this.utils.SqlString.escape(dateVal.format("HH:mm:ss"));
    },
    spelFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      const fmt = "HH:mm:ss";
      const v = dateVal.format("HH:mm:ss");
      return `T(java.time.LocalTime).parse('${v}')`;
      //return `new java.text.SimpleDateFormat('${fmt}').parse('${v}')`;
    },
    spelImportFuncs: [
      "T(java.time.LocalTime).parse(${v})",
      //"new java.text.SimpleDateFormat(${fmt}).parse(${v})"
    ],
    spelImportValue: function (val, wgtDef, args) {
      if (!wgtDef)
        return [undefined, "No widget def to get value format"];
      if (args?.fmt && (!args.fmt?.value?.toLowerCase?.().includes("hh:mm") || args.fmt?.value?.includes(" ")))
        return [undefined, `Invalid time format ${JSON.stringify(args.fmt)}`];
      const dateVal = this.utils.moment(val.value, "HH:mm:ss");
      if (dateVal.isValid()) {
        return [dateVal.format(wgtDef?.valueFormat), []];
      } else {
        return [undefined, "Invalid date"];
      }
    },
    jsonLogic: function (val, fieldDef, wgtDef) {
      // return seconds of day
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return dateVal.get("hour") * 60 * 60 + dateVal.get("minute") * 60 + dateVal.get("second");
    },
    toJS: function (val, fieldSettings) {
      // return seconds of day
      const dateVal = this.utils.moment(val, fieldSettings.valueFormat);
      return dateVal.isValid() ? dateVal.get("hour") * 60 * 60 + dateVal.get("minute") * 60 + dateVal.get("second") : undefined;
    },
    mongoFormatValue: function (val, fieldDef, wgtDef) {
      // return seconds of day
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return dateVal.get("hour") * 60 * 60 + dateVal.get("minute") * 60 + dateVal.get("second");
    },
    elasticSearchFormatValue: function elasticSearchFormatValue(queryType, value, operator, fieldName) {
      return {
        script: {
          script: {
            source: "doc[".concat(fieldName, "][0].getHour() >== params.min && doc[").concat(fieldName, "][0].getHour() <== params.max"),
            params: {
              min: value[0],
              max: value[1]
            }
          }
        }
      };
    },
  },
  datetime: {
    type: "datetime",
    jsType: "string",
    valueSrc: "value",
    timeFormat: "HH:mm",
    dateFormat: "DD.MM.YYYY",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    use12Hours: false,
    valueLabel: "Datetime",
    valuePlaceholder: "Enter datetime",
    valueLabels: [
      { label: "Datetime from", placeholder: "Enter datetime from" },
      { label: "Datetime to", placeholder: "Enter datetime to" },
    ],
    formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return isForDisplay ? dateVal.format(wgtDef.dateFormat + " " + wgtDef.timeFormat) : JSON.stringify(val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return this.utils.SqlString.escape(dateVal.toDate());
    },
    spelFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      const v = dateVal.format("YYYY-MM-DD HH:mm:ss");
      const fmt = "yyyy-MM-dd HH:mm:ss";
      //return `new java.text.SimpleDateFormat('${fmt}').parse('${v}')`;
      return `T(java.time.LocalDateTime).parse('${v}', T(java.time.format.DateTimeFormatter).ofPattern('${fmt}'))`;
    },
    spelImportFuncs: [
      //"new java.text.SimpleDateFormat(${fmt}).parse(${v})",
      {
        obj: {
          cls: ["java", "time", "LocalDateTime"],
        },
        methodName: "parse",
        args: [
          {var: "v"},
          {
            obj: {
              cls: ["java", "time", "format", "DateTimeFormatter"],
            },
            methodName: "ofPattern",
            args: [
              {var: "fmt"}
            ]
          },
        ],
      }
    ],
    spelImportValue: function (val, wgtDef, args) {
      if (!wgtDef)
        return [undefined, "No widget def to get value format"];
      if (!args?.fmt?.value?.includes?.(" "))
        return [undefined, `Invalid datetime format ${JSON.stringify(args.fmt)}`];
      const dateVal = this.utils.moment(val.value, this.utils.moment.ISO_8601);
      if (dateVal.isValid()) {
        return [dateVal.format(wgtDef?.valueFormat), []];
      } else {
        return [undefined, "Invalid date"];
      }
    },
    // Moved to `sqlImportDate` in `packages/sql/modules/import/conv`
    // sqlImport: function (sqlObj, wgtDef, sqlDialect) {
    //   if (["TO_DATE"].includes(sqlObj?.func) && sqlObj?.children?.length >= 1) {
    //     const [valArg, patternArg] = sqlObj.children;
    //     if (valArg?.valueType == "single_quote_string") {
    //       // tip: moment doesn't support SQL date format, so ignore patternArg
    //       const dateVal = this.utils.moment(valArg.value);
    //       if (dateVal.isValid()) {
    //         return {
    //           value: dateVal.format(wgtDef?.valueFormat),
    //         };
    //       } else {
    //         return {
    //           value: null,
    //           error: "Invalid date",
    //         };
    //       }
    //     }
    //   }
    // },
    jsonLogic: function (val, fieldDef, wgtDef) {
      return this.utils.moment(val, wgtDef.valueFormat).toDate();
    },
    // Example of importing and exporting to epoch timestamp (in ms) for JsonLogic:
    // jsonLogicImport: function(timestamp, wgtDef) {
    //   const momentVal = this.utils.moment(timestamp, "x");
    //   return momentVal.isValid() ? momentVal.toDate() : undefined;
    // },
    // jsonLogic: function (val, fieldDef, wgtDef) {
    //   return this.utils.moment(val, wgtDef.valueFormat).format("x");
    // },
    toJS: function (val, fieldSettings) {
      const dateVal = this.utils.moment(val, fieldSettings.valueFormat);
      return dateVal.isValid() ? dateVal.toDate() : undefined;
    },
    // todo: $toDate (works onliny in $expr)
    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/toDate/
    mongoFormatValue: function (val, fieldDef, wgtDef) {
      const dateVal = this.utils.moment(val, wgtDef.valueFormat);
      if (dateVal.isValid()) {
        return {
          "$dateFromString": {
            "dateString": dateVal.format("YYYY-MM-DD HH:mm:ss"),
            "format": "%Y-%m-%d %H:%M:%S"
          }
        };
      }
    }
  },
  boolean: {
    type: "boolean",
    jsType: "boolean",
    valueSrc: "value",
    labelYes: "Yes",
    labelNo: "No",
    formatValue: (val, fieldDef, wgtDef, isForDisplay) => {
      return isForDisplay ? (val ? "Yes" : "No") : JSON.stringify(!!val);
    },
    sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function (val, fieldDef, wgtDef, op, opDef) {
      return this.utils.spelEscape(val);
    },
    defaultValue: false,
    toJS: (val, fieldSettings) => (val),
    mongoFormatValue: (val, fieldDef, wgtDef) => (val),
  },
  field: {
    valueSrc: "field",
    formatValue: (val, fieldDef, wgtDef, isForDisplay, op, opDef, rightFieldDef) => {
      return isForDisplay ? (rightFieldDef.label || val) : val;
    },
    sqlFormatValue: (val, fieldDef, wgtDef, op, opDef, rightFieldDef, sqlDialect) => {
      return val;
    },
    spelFormatValue: (val, fieldDef, wgtDef, op, opDef) => {
      return val;
    },
    valueLabel: "Field to compare",
    valuePlaceholder: "Select field to compare",
  },
  func: {
    valueSrc: "func",
    valueLabel: "Function",
    valuePlaceholder: "Select function",
  },
  /**
   * @deprecated
   */
  case_value: {
    valueSrc: "value",
    type: "case_value",
    spelFormatValue: function (val) {
      return this.utils.spelEscape(val === "" ? null : val);
    },
    spelImportValue: (val) => {
      return [val.value, []];
    },
    jsonLogic: function (val) {
      return val === "" ? null : val;
    },
  }
};

//----------------------------  types

const types = {
  text: {
    defaultOperator: "equal",
    mainWidget: "text",
    widgets: {
      text: {
        operators: [
          "equal",
          "not_equal",
          "like",
          "not_like",
          "starts_with",
          "ends_with",
          "proximity",
          "is_empty",
          "is_not_empty",
          "is_null",
          "is_not_null",
        ],
        widgetProps: {},
        opProps: {},
      },
      textarea: {
        operators: [
          "equal",
          "not_equal",
          "like",
          "not_like",
          "starts_with",
          "ends_with",
          "is_empty",
          "is_not_empty",
          "is_null",
          "is_not_null",
        ],
        widgetProps: {},
        opProps: {},
      },
      field: {
        operators: [
          //unary ops (like `is_empty`) will be excluded anyway, see getWidgetsForFieldOp()
          "equal",
          "not_equal",
          "proximity", //can exclude if you want
        ],
      }
    },
  },
  number: {
    defaultOperator: "equal",
    mainWidget: "number",
    widgets: {
      number: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
      price: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
      slider: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null"
        ],
      },
    },
  },
  date: {
    defaultOperator: "equal",
    widgets: {
      date: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null"
        ]
      }
    },
  },
  time: {
    defaultOperator: "equal",
    widgets: {
      time: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ]
      }
    },
  },
  datetime: {
    defaultOperator: "equal",
    widgets: {
      datetime: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      }
    },
  },
  select: {
    mainWidget: "select",
    defaultOperator: "select_equals",
    widgets: {
      select: {
        operators: [
          "select_equals",
          "select_not_equals",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
      multiselect: {
        operators: [
          "select_any_in",
          "select_not_any_in",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
    },
  },
  multiselect: {
    defaultOperator: "multiselect_equals",
    widgets: {
      multiselect: {
        operators: [
          "multiselect_contains",
          "multiselect_not_contains",
          "multiselect_equals",
          "multiselect_not_equals",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ]
      }
    },
  },
  boolean: {
    defaultOperator: "equal",
    widgets: {
      boolean: {
        operators: [
          "equal",
          "not_equal",
          "is_null",
          "is_not_null",
        ],
        widgetProps: {
          //you can enable this if you don't use fields as value sources
          // hideOperator: true,
          // operatorInlineLabel: "is",
        }
      },
      field: {
        operators: [
          "equal",
          "not_equal",
        ],
      }
    },
  },
  "!group": {
    defaultOperator: "some",
    mainWidget: "number",
    widgets: {
      number: {
        widgetProps: {
          min: 0
        },
        operators: [
          // w/o operand
          "some",
          "all",
          "none",

          // w/ operand - count
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
        ],
        opProps: {
          equal: {
            label: "Count =="
          },
          not_equal: {
            label: "Count !="
          },
          less: {
            label: "Count <"
          },
          less_or_equal: {
            label: "Count <="
          },
          greater: {
            label: "Count >"
          },
          greater_or_equal: {
            label: "Count >="
          },
          between: {
            label: "Count between"
          },
          not_between: {
            label: "Count not between"
          }
        }
      }
    }
  },
  /**
   * @deprecated
   */
  "case_value": {
    mainWidget: "case_value",
    widgets: {
      case_value: {
        widgetProps: {},
      }
    }
  },
};

//----------------------------  settings

const settings = {
  ...defaultSettings,

  convertableWidgets: {
    "number": ["slider", "rangeslider", "price"],
    "slider": ["number", "rangeslider", "price"],
    "rangeslider": ["number", "slider", "price"],
    "price": ["number", "slider", "rangeslider"],
    "text": ["textarea"],
    "textarea": ["text"]
  },

  formatSpelField: function (field, parentField, parts, partsExt, fieldDefinition, config) {
    let fieldName = partsExt.map(({key, parent, fieldSeparator: sep}, ind) => {
      if (ind == 0) {
        if (parent == "[map]")
          return `#this[${this.utils.spelEscape(key)}]`;
        else if (parent == "[class]")
          return key;
        else
          return key;
      } else {
        if (parent == "map" || parent == "[map]")
          return `[${this.utils.spelEscape(key)}]`;
        else if (parent == "class" || parent == "[class]")
          return `${sep}${key}`;
        else
          return `${sep}${key}`;
      }
    }).join("");
    if (fieldDefinition.fieldName) {
      fieldName = field;
    }
    if (fieldDefinition.isSpelVariable) {
      fieldName = "#" + fieldName;
    }
    return fieldName;
  },
  sqlFormatReverse: function (q) {
    if (q == undefined) return undefined;
    return "NOT" + this.utils.wrapWithBrackets(q);
  },
  spelFormatReverse: function (q) {
    if (q == undefined) return undefined;
    return "!" + this.utils.wrapWithBrackets(q);
  },
  formatReverse: function (q, operator, reversedOp, operatorDefinition, revOperatorDefinition, isForDisplay) {
    if (q == undefined) return undefined;
    if (isForDisplay)
      return "NOT " + this.utils.wrapWithBrackets(q);
    else
      return "!" + this.utils.wrapWithBrackets(q);
  },
  formatAggr: (whereStr, aggrField, operator, value, valueSrc, valueType, opDef, operatorOptions, isForDisplay, aggrFieldDef) => {
    const {labelForFormat, cardinality} = opDef;
    if (cardinality == 0) {
      const cond = whereStr ? ` HAVE ${whereStr}` : "";
      return `${labelForFormat} OF ${aggrField}${cond}`;
    } else if (cardinality == undefined || cardinality == 1) {
      const cond = whereStr ? ` WHERE ${whereStr}` : "";
      return `COUNT OF ${aggrField}${cond} ${labelForFormat} ${value}`;
    } else if (cardinality == 2) {
      const cond = whereStr ? ` WHERE ${whereStr}` : "";
      let valFrom = value.first();
      let valTo = value.get(1);
      return `COUNT OF ${aggrField}${cond} ${labelForFormat} ${valFrom} AND ${valTo}`;
    }
  },
  jsonLogic: {
    groupVarKey: "var",
    altVarKey: "var",
    lockedOp: "locked"
  },
  
  canCompareFieldWithField: (leftField, leftFieldConfig, rightField, rightFieldConfig) => {
    //for type == 'select'/'multiselect' you can check listValues
    return true;
  },

  // enable compare fields
  valueSourcesInfo: {
    value: {
      label: "Value"
    },
    field: {
      label: "Field",
      widget: "field",
    },
    func: {
      label: "Function",
      widget: "func",
    }
  },

};

//----------------------------

const _addMixins = (config, mixins, doAdd = true) => {
  const mixinFuncs = {
    rangeslider: mixinWidgetRangeslider,
    treeselect: mixinWidgetTreeselect,
    treemultiselect: mixinWidgetTreemultiselect,
    rangeable__date: mixinRangeableWidget("date", "date"),
  };
  for (const mixName of mixins) {
    const mixinFunc = mixinFuncs[mixName];
    if (mixinFunc) {
      config = mixinFunc(config, doAdd);
    } else {
      throw new Error(`Can't ${doAdd ? "add": "remove"} mixin ${mixName}`);
    }
  }
  return config;
};

const addMixins = (config, mixins) => {
  return _addMixins(config, mixins, true);
};
const removeMixins = (config, mixins) => {
  return _addMixins(config, mixins, false);
};

const mixinRangeableWidget = (type, widget) => (config, addMixin = true) => {
  let { types } = config;

  types = {
    ...types,
    [type]: {
      ...types[type],
      widgets: {
        ...types[type].widgets,
      }
    }
  };

  if (addMixin) {
    types[type].widgets[widget] = {
      opProps: {
        between: {
          isSpecialRange: true,
          textSeparators: [null, null],
        },
        not_between: {
          isSpecialRange: true,
          textSeparators: [null, null],
        }
      },
      ...types[type].widgets[widget],
    };
  } else {
    delete types[type].widgets[widget];
  }

  return {
    ...config,
    types,
  };
};

const mixinWidgetRangeslider = (config, addMixin = true) => {
  let { widgets, types } = config;

  widgets = {
    ...widgets,
  };

  if (addMixin) {
    widgets.rangeslider = {
      type: "number",
      jsType: "number",
      valueSrc: "value",
      valueLabel: "Range",
      valuePlaceholder: "Select range",
      valueLabels: [
        { label: "Number from", placeholder: "Enter number from" },
        { label: "Number to", placeholder: "Enter number to" },
      ],
      formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
        return isForDisplay ? this.utils.stringifyForDisplay(val) : JSON.stringify(val);
      },
      sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
        return this.utils.SqlString.escape(val);
      },
      spelFormatValue: function (val) { return this.utils.spelEscape(val); },
      singleWidget: "slider",
      toJS: (val, fieldSettings) => (val),
      ...widgets.rangeslider,
    };
  } else {
    delete widgets.rangeslider;
  }

  types = {
    ...types,
    number: {
      ...types.number,
      widgets: {
        ...types.number.widgets,
      }
    }
  };

  if (addMixin) {
    types.number.widgets.rangeslider = {
      opProps: {
        between: {
          isSpecialRange: true,
        },
        not_between: {
          isSpecialRange: true,
        }
      },
      operators: [
        "between",
        "not_between",
        // "is_empty",
        // "is_not_empty",
        "is_null",
        "is_not_null",
      ],
      ...types.number.widgets.rangeslider,
    };
  } else {
    delete types.number.widgets.rangeslider;
  }

  return {
    ...config,
    widgets,
    types,
  };
};

const mixinWidgetTreeselect = (config, addMixin = true) => {
  let { widgets, types } = config;

  widgets = {
    ...widgets,
  };

  if (addMixin) {
    widgets.treeselect = {
      type: "treeselect",
      jsType: "string",
      valueSrc: "value",
      valueLabel: "Value",
      valuePlaceholder: "Select value",
      formatValue: function (val, fieldDef, wgtDef, isForDisplay) {
        const treeData = fieldDef.fieldSettings.treeValues || fieldDef.fieldSettings.listValues || fieldDef.asyncListValues;
        let valLabel = this.utils.getTitleInListValues(treeData, val);
        return isForDisplay ? this.utils.stringifyForDisplay(valLabel) : JSON.stringify(val);
      },
      sqlFormatValue: function (val, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
        return this.utils.SqlString.escape(val);
      },
      spelFormatValue: function (val) { return this.utils.spelEscape(val); },
      toJS: (val, fieldSettings) => (val),
      ...widgets.treeselect,
    };
  } else {
    delete widgets.treeselect;
  }

  types = {
    ...types,
  };

  if (addMixin) {
    types.treeselect = {
      mainWidget: "treeselect",
      defaultOperator: "select_equals",
      widgets: {
        treeselect: {
          operators: [
            "select_equals",
            "select_not_equals"
          ],
        },
        treemultiselect: {
          operators: [
            "select_any_in",
            "select_not_any_in"
          ],
        },
      },
      ...types.treeselect,
    };
  } else {
    delete types.treeselect;
  }

  return {
    ...config,
    widgets,
    types,
  };
};

const mixinWidgetTreemultiselect = (config, addMixin = true) => {
  let { widgets, types } = config;

  widgets = {
    ...widgets,
  };

  if (addMixin) {
    widgets.treemultiselect = {
      type: "treemultiselect",
      jsType: "array",
      valueSrc: "value",
      valueLabel: "Values",
      valuePlaceholder: "Select values",
      formatValue: function (vals, fieldDef, wgtDef, isForDisplay) {
        const treeData = fieldDef.fieldSettings.treeValues || fieldDef.fieldSettings.listValues || fieldDef.asyncListValues;
        let valsLabels = vals.map(v => this.utils.getTitleInListValues(treeData, v));
        return isForDisplay ? valsLabels.map(this.utils.stringifyForDisplay) : vals.map(JSON.stringify);
      },
      sqlFormatValue: function (vals, fieldDef, wgtDef, op, opDef, _, sqlDialect) {
        return vals.map(v => this.utils.SqlString.escape(v));
      },
      spelFormatValue: function (val) { return this.utils.spelEscape(val); },
      toJS: (val, fieldSettings) => (val),
      ...widgets.treemultiselect,
    };
  } else {
    delete widgets.treemultiselect;
  }

  types = {
    ...types,
  };

  if (addMixin) {
    types.treemultiselect = {
      defaultOperator: "multiselect_equals",
      widgets: {
        treemultiselect: {
          operators: [
            "multiselect_equals",
            "multiselect_not_equals",
          ],
        }
      },
      ...types.treemultiselect,
    };
  } else {
    delete types.treemultiselect;
  }

  return {
    ...config,
    widgets,
    types,
  };
};

export const ConfigMixins = {
  addMixins,
  removeMixins,
};

//----------------------------

let config = {
  conjunctions,
  operators,
  widgets,
  types,
  settings,
  ctx,
};
// Mixin advanced widgets just to allow using it on server-side eg. for export routines
config = addMixins(config, [
  "rangeslider",
  "treeselect",
  "treemultiselect",
]);

export default config;
