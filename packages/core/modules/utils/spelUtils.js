

const spelEscapeString = (val) => {
  // Strings are delimited by single quotes. To put a single quote itself in a string, use two single quote characters. 
  return "'" + val.replace(/'/g, "''") + "'";
};

const spelInlineList = (vals, toArray = false) => {
  // find java type of values
  let javaType;
  let jt;
  const numberJavaTypes = ["int", "float"];
  vals.map(v => {
    if (v !== undefined && v !== null) {
      if (typeof v === "string") {
        jt = "String";
      } else if (typeof v === "number") {
        jt = Number.isInteger(v) ? "int" : "float";
      } else throw new Error(`spelEscape: Can't use value ${v} in array`);

      if (!javaType) {
        javaType = jt;
      } else if (javaType != jt) {
        if (numberJavaTypes.includes(javaType) && numberJavaTypes.includes(jt)) {
          // found int and float in collecton - use float
          javaType = "float";
        } else throw new Error(`spelEscape: Can't use different types in array: found ${javaType} and ${jt}`);
      }
    }
  });
  if (!javaType) {
    javaType = "String"; //default if empty array
  }

  // for floats we should add 'f' to all items
  let escapedVals;
  if (javaType == "float") {
    escapedVals = vals.map(v => spelEscape(v, true));
  } else {
    escapedVals = vals.map(v => spelEscape(v));
  }

  // build inline list or array
  let res;
  if (toArray) {
    res = `new ${javaType}[]{${escapedVals.join(", ")}}`;
  } else {
    res = `{${escapedVals.join(", ")}}`;
  }
  
  return res;
};


export const spelEscape = (val, numberToFloat = false, arrayToArray = false) => {
  // https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions-ref-literal
  if (val === undefined || val === null) {
    return "null";
  }
  switch (typeof val) {
  case "boolean":
    return (val) ? "true" : "false";
  case "number":
    if (!Number.isFinite(val) || isNaN(val))
      return undefined;
    return val + (!Number.isInteger(val) || numberToFloat ? "f" : "");
  case "object":
    if (Array.isArray(val)) {
      return spelInlineList(val, arrayToArray);
    } else {
      // see `spelFormatValue` for Date, LocalTime
      throw new Error("spelEscape: Object is not supported");
    }
  default: return spelEscapeString(val);
  }
};

// @deprecated
export const spelFormatConcat = (parts) => {
  if (parts && Array.isArray(parts) && parts.length) {
    return parts
      .map(part => {
        if (part.type == "const") {
          return spelEscape(part.value);
        } else if (part.type == "property") {
          return ""+part.value;
        } else if (part.type == "variable") {
          return "#"+part.value;
        } return undefined;
      })
      .filter(r => r != undefined)
      .join(" + ");
  } else {
    return "null";
  }
};

// @deprecated
// `val` is {value, valueType, valueSrc}
// If `valueType` == "case_value", `value` is array of such items (to be considered as concatenation)
export const spelImportConcat = (val) => {
  if (val == undefined)
    return [undefined, []];
  let errors = [];
  const value = val.valueType == "case_value" ? val.value : val;
  const valueArr = Array.isArray(value) ? value : [value];
  const res = valueArr.map(child => {
    if (child.valueSrc === "value") {
      if (child.value === null) {
        return undefined;
      } else {
        return {
          type: "const", 
          value: child.value
        };
      }
    } else if (child.valueSrc === "field") {
      return {
        type: (child.isVariable ? "variable" : "property"), 
        value: child.value
      };
    } else {
      errors.push(`Unsupported valueSrc ${child.valueSrc} in concatenation`);
    }
  }).filter(v => v != undefined);
  return [res, errors];
};

export const spelFixList = (val) => {
  // `{1,2}.contains(1)` NOT works
  // `{1,2}.?[true].contains(1)` works
  return `${val}.?[true]`;
};

