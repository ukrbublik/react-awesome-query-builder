import SqlStringOrig from "sqlstring";

export const SqlString = SqlStringOrig;

SqlString.trim = (val) => {
  if (val?.charAt(0) == "'")
    return val.substring(1, val.length-1);
  else
    return val;
};

SqlString.unescapeLike = (val, sqlDialect = undefined) => {
  if (typeof val !== "string") {
    return val;
  }
  let res = val;
  // unescape % and _
  if (sqlDialect === "BigQuery") {
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#like_operator
    res = res.replace(/\\\\([%_])/g, "$1");
  } else {
    res = res.replace(/\\([%_])/g, "$1");
  }
  return res;
};

SqlString.escapeLike = (val, any_start = true, any_end = true, sqlDialect = undefined) => {
  if (typeof val !== "string") {
    return val;
  }
  // normal escape
  let res = SqlString.escape(val);
  // unwrap ''
  res = SqlString.trim(res);
  // escape % and _
  if (sqlDialect === "BigQuery") {
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#like_operator
    res = res.replace(/[%_\\]/g, "\\\\$&");
  } else {
    res = res.replace(/[%_]/g, "\\$&");
  }
  // wrap with % for LIKE
  res = (any_start ? "%" : "") + res + (any_end ? "%" : "");
  // wrap ''
  res = "'" + res + "'";
  return res;
};

export const sqlEmptyValue = (fieldDef) => {
  let v = "''";
  const type = fieldDef?.type;
  if (type == "date") {
    //todo: support other SQL dialects?  0001-01-01 for oracle, 1970-01-01 for timestamp
    v = "'0000-00-00'";
  } else if (type == "datetime") {
    v = "'0000-00-00 00:00'";
  } else if (type == "time") {
    v = "'00:00'";
  } else if (type == "number") {
    v = "0";
  }
  return v;
};

export const stringifyForDisplay = (v) => (v == null ? "NULL" : v.toString());

export const wrapWithBrackets = (v) => {
  if (v == undefined)
    return v;
  if (v?.[0] === "(" && v?.[v?.length - 1] === ")") {
    // already wrapped
    return v;
  }
  return "(" + v + ")";
};
