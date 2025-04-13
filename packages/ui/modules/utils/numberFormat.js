import { NumericFormat, numericFormatter as _numericFormatter } from "react-number-format";

export const getNumberFormatProps = (props, excludePropsNames = []) => {
  const propNames = [
    // Numeric format
    "prefix",
    "suffix",
    "thousandsGroupStyle",
    "thousandSeparator",
    "allowLeadingZeros",
    "allowNegative",
    "decimalScale",
    "decimalSeparator",
    "fixedDecimalScale",
    // Pattern format
    "allowEmptyFormatting",
    "format",
    "mask",
    "patternChar",
  ];
  const existingPropNames = propNames.filter(k => !excludePropsNames.includes(k) && props[k] !== undefined);
  const existingProps = Object.fromEntries(existingPropNames.map(k => [k, props[k]]));
  if (props.min >= 0) {
    existingProps.allowNegative = false;
  }
  return existingProps;
};

export const numericFormatter = (val, numericFormatProps) => {
  if (val == undefined) {
    return "";
  }
  return _numericFormatter(""+val, numericFormatProps);
};

export const numericParser = (str, numericFormatProps) => {
  const decimalSeparator = numericFormatProps?.decimalSeparator ?? ".";
  const decimalScale = numericFormatProps?.decimalScale;

  let cleanStr = str.replace(new RegExp(`[^0-9\\-\\${decimalSeparator}\\.]`, "g"), "");
  const isNegative = cleanStr?.startsWith("-");
  cleanStr = (isNegative ? "-" : "") + cleanStr.replace(/-+/g, "");
  cleanStr = cleanStr.replace(new RegExp(`\\${decimalSeparator}+|\\.+`, "g"), ".");
  let parts = cleanStr.split(".");
  if (parts.length > 2) {
    parts = [parts.slice(0, -1).join(""), parts.slice(-1)];
    cleanStr = parts.join(".");
  }

  const num = parseFloat(cleanStr);
  let res = !isNaN(num) && isFinite(num) ? num : undefined;
  if (res != undefined) {
    // if num == -3.141
    const positiveWholeNumberPart = Math.abs(isNegative ? Math.ceil(num) : Math.floor(num)); // 3
    let decimalStr = (""+res).split(".")[1] ?? ""; // "141"
    let decimalPart = decimalStr != undefined ? parseFloat("0." + decimalStr) : undefined;
    if (decimalScale && decimalStr.length > decimalScale) {
      decimalStr = decimalStr.substring(0, decimalScale); // "14"
      decimalPart = parseFloat("0." + decimalStr); // 0.14
    }
    res = (isNegative ? -1 : 1) * (positiveWholeNumberPart + decimalPart); // -3.14
  }
  return res;
};

export {
  NumericFormat,
};
