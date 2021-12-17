let SqlString = require("sqlstring");

SqlString.trim = (val) => {
  if (val.charAt(0) == "'")
    return val.substring(1, val.length-1);
  else
    return val;
};

SqlString.escapeLike = (val, any_start = true, any_end = true) => {
  // normal escape
  let res = SqlString.escape(val);
  // unwrap ''
  res = SqlString.trim(res);
  // escape % and _
  res = res.replace(/[%_]/g, "\\$&");
  // wrap with % for LIKE
  res = (any_start ? "%" : "") + res + (any_end ? "%" : "");
  // wrap ''
  res = "'" + res + "'";
  return res;
};

const sqlEmptyValue = (fieldDef) => {
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

const mongoEmptyValue = (fieldDef) => {
  let v = "";
  const type = fieldDef?.type;
  if (type == "number") {
    v = 0;
  }
  return v;
};

export {SqlString, sqlEmptyValue, mongoEmptyValue};
