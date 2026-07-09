const celEscapeString = (val) => {
  // CEL string literals use C-style backslash escaping (unlike SpEL/SQL which double the quote).
  // https://github.com/google/cel-spec/blob/master/doc/langdef.md#string-and-bytes-values
  const escaped = ("" + val)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  return "'" + escaped + "'";
};

const celInlineList = (vals, numberToFloat = false) => {
  // CEL list literal: [a, b, c]. Lists are heterogeneous (`dyn`), no per-type wrapper needed.
  const escapedVals = vals.map((v) => celEscape(v, numberToFloat));
  return `[${escapedVals.join(", ")}]`;
};

export const celEscape = (val, numberToFloat = false) => {
  // https://github.com/google/cel-spec/blob/master/doc/langdef.md#values
  if (val === undefined || val === null) {
    return "null";
  }
  switch (typeof val) {
  case "boolean":
    return val ? "true" : "false";
  case "number":
    if (!Number.isFinite(val) || isNaN(val)) return undefined;
    // CEL is strongly typed: int literals have no suffix, doubles must carry a
    // decimal point (or exponent). `numberToFloat` forces a double literal so an
    // integer value compared against a double field doesn't become a type error.
    if (Number.isInteger(val)) {
      return numberToFloat ? val + ".0" : "" + val;
    }
    return "" + val;
  case "object":
    if (Array.isArray(val)) {
      return celInlineList(val, numberToFloat);
    } else {
      // see `celFormatValue` for Date, timestamp
      throw new Error("celEscape: Object is not supported");
    }
  default:
    return celEscapeString(val);
  }
};
