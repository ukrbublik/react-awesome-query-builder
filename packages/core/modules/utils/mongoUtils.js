

export const mongoEmptyValue = (fieldDef) => {
  let v = "";
  const type = fieldDef?.type;
  if (type == "number") {
    v = 0;
  }
  return v;
};

// helpers for mongo format
export const mongoFormatOp1 = (mop, mc, opNot,  field, _op, value, not, useExpr, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
  const $field = typeof field == "string" && !field.startsWith("$") ? "$"+field : field;
  const mv = mc(value, fieldDef);
  if (mv === undefined)
    return undefined;
  const neg = not ^ opNot;

  if (useExpr && mop == "$regex") {
    // https://stackoverflow.com/questions/35750920/regex-as-filter-in-projection
    let e = {
      "$regexFind": {
        input: $field,
        regex: mv
      }
    };
    if (neg) {
      e = { "$not": e };
    }
    return e;
  }

  if (neg) {
    // if (!useExpr && (!mop || mop == "$eq"))
    //   return { [field]: { "$ne": mv } }; // short form
    return !useExpr
      ? { [field]: { "$not": { [mop]: mv } } } 
      : { "$not": { [mop]: [$field, mv] } };
  } else {
    if (!useExpr && (!mop || mop == "$eq"))
      return { [field]: mv }; // short form
    return !useExpr
      ? { [field]: { [mop]: mv } } 
      : { [mop]: [$field, mv] };
  }
};

export const mongoFormatOp2 = (mops, opNot,  field, _op, values, not, useExpr, valueSrcs, valueTypes, opDef, operatorOptions, fieldDef) => {
  const $field = typeof field == "string" && !field.startsWith("$") ? "$"+field : field;
  if (not ^ opNot) {
    return !useExpr
      ? { [field]: { "$not": { [mops[0]]: values[0], [mops[1]]: values[1] } } } 
      : {"$not":
                {"$and": [
                  { [mops[0]]: [ $field, values[0] ] },
                  { [mops[1]]: [ $field, values[1] ] },
                ]}
      };
  } else {
    return !useExpr
      ? { [field]: { [mops[0]]: values[0], [mops[1]]: values[1] } } 
      : {"$and": [
        { [mops[0]]: [ $field, values[0] ] },
        { [mops[1]]: [ $field, values[1] ] },
      ]};
  }
};


export const mongoFieldEscape = (input) => {
  return input.replace(/\$/g, "\uFF04");
};

export const mongoFieldUnescape = (input) => {
  return input.replace(/\uFF04/g, "$");
};
