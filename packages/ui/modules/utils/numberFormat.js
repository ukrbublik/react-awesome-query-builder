import { NumericFormat, numericFormatter as _numericFormatter, removeNumericFormat, useNumericFormat } from "react-number-format";

const getNumberFormatProps = (props, excludePropsNames = []) => {
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

const numericFormatter = (val, numericFormatProps) => {
  if (val == undefined) {
    return "";
  }
  return _numericFormatter(""+val, numericFormatProps);
};

// Copied from https://github.com/s-yadav/react-number-format/blob/master/src/utils.tsx#L309
function getDefaultChangeMeta(value) {
  return {
    from: {
      start: 0,
      end: 0,
    },
    to: {
      start: 0,
      end: value.length,
    },
    lastValue: "",
  };
}

// Copied from https://github.com/s-yadav/react-number-format/blob/master/src/utils.tsx#L257
const findChangeRange = (prevValue, newValue) => {
  let i = 0,
    j = 0;
  const prevLength = prevValue.length;
  const newLength = newValue.length;
  while (prevValue[i] === newValue[i] && i < prevLength) i++;

  //check what has been changed from last
  while (
    prevValue[prevLength - 1 - j] === newValue[newLength - 1 - j] &&
    newLength - j > i &&
    prevLength - j > i
  ) {
    j++;
  }

  return {
    from: { start: i, end: prevLength - j },
    to: { start: i, end: newLength - j },
  };
};

// Helps with generating correct `changeMeta` for proper work of `removeNumericFormat()`
const getChangeMeta = (newValue, prevValue = undefined) => {
  if (prevValue != undefined) {
    return { ...findChangeRange(prevValue, newValue), lastValue: newValue };
  } else {
    return { ...getDefaultChangeMeta(newValue), lastValue: newValue ?? "" };
  }
};

// Apply `decimalScale`
const limitToScale = (num, numericFormatProps) => {
  const decimalScale = numericFormatProps?.decimalScale;
  const isNegative = num < 0;
  // if num == -3.141
  const positiveWholeNumberPart = Math.abs(isNegative ? Math.ceil(num) : Math.floor(num)); // 3
  let decimalStr = (""+num).split(".")[1] ?? ""; // "141"
  let decimalPart = decimalStr != undefined ? parseFloat("0." + decimalStr) : undefined;
  if (decimalScale && decimalStr.length > decimalScale) {
    decimalStr = decimalStr.substring(0, decimalScale); // "14"
    decimalPart = parseFloat("0." + decimalStr); // 0.14
  }
  const res = (isNegative ? -1 : 1) * (positiveWholeNumberPart + decimalPart); // -3.14
  return res;
};

const startsWithZero = (num) => {
  const isNegative = num < 0;
  const positiveWholeNumberPart = Math.abs(isNegative ? Math.ceil(num) : Math.floor(num));
  return positiveWholeNumberPart === 0;
};

const getExtraLeadingZeros = (str, num) => {
  const leadingZeros = str.match(/^-?(0+).+/)?.[1]?.length;
  const extraLeadingZeros = leadingZeros ? (leadingZeros - (startsWithZero(num) ? 1 : 0)) : undefined;
  return extraLeadingZeros;
};

const getTrailingZeros = (str) => {
  const parts = str.split(".");
  if (parts[1]?.match(/^0+$/)) {
    return parts[1].length;
  }
  return undefined;
};

const fixDecimal = (origStr, numericFormatProps, lastStrValue = undefined) => {
  const decimalSeparator = numericFormatProps?.decimalSeparator ?? ".";
  let str = origStr;
  if (lastStrValue?.endsWith(".") && origStr.indexOf(lastStrValue) === 0) {
    // If decimal separator is "," but user types "." and numbers - treat this as decimal part
    str = lastStrValue.substring(0, lastStrValue.length - 1) + decimalSeparator + origStr.substring(lastStrValue.length);
  }
  return str;
};

const numericParser = (origStr, numericFormatProps, lastStrValue = undefined, lastNumValue = undefined) => {
  const decimalSeparator = numericFormatProps?.decimalSeparator ?? ".";
  const str = fixDecimal(origStr, numericFormatProps, lastStrValue);
  const changeMeta = getChangeMeta(str, lastStrValue);
  const typedDecimalSep = (changeMeta.to.end - changeMeta.to.start) === 1 && [decimalSeparator, "."].includes(str[changeMeta.to.start]);
  const cleanStr = removeNumericFormat(str, changeMeta, numericFormatProps);
 
  let num = parseFloat(cleanStr);
  num = !isNaN(num) && isFinite(num) ? num : undefined;
  if (num != undefined) {
    num = limitToScale(num, numericFormatProps);
  }

  const { max, min, allowLeadingZeros } = numericFormatProps;
  const changedValueWithSep = typedDecimalSep && num != lastNumValue;
  const isValid = num != undefined && (max == undefined || num <= max) && (min == undefined || num >= min);
  const extraLeadingZeros = allowLeadingZeros ? getExtraLeadingZeros(cleanStr, num) : undefined;
  const trailingZeros = changedValueWithSep ? undefined : getTrailingZeros(cleanStr);

  const res = {
    str: origStr,
    num,
    extraLeadingZeros,
    trailingZeros,
    isValid,
  };
  return res;
};

const addLeadingZeros = (str, extraLeadingZeros) => {
  const isNegative = str.startsWith("-");
  const positiveStr = isNegative ? str.replace(/^[-]+/, "") : str;
  const res = (isNegative ? "-" : "") + "".padStart(extraLeadingZeros, "0") + positiveStr;
  return res;
};

const addTrailingZeros = (str, trailingZeros) => {
  const hasDot = str.endsWith(".");
  const res = str + (hasDot ? "" : ".") + "".padStart(trailingZeros, "0");
  return res;
};

export {
  NumericFormat,
  useNumericFormat,
  numericParser,
  numericFormatter,
  getNumberFormatProps,
  addLeadingZeros,
  addTrailingZeros,
};
