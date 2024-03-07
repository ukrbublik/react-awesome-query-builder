import * as constants from "./constains";

export const I18NS = "raqbvalidation";
export const I18NSP = `${I18NS}:`;

export const translations = {
  [constants.EMPTY_GROUP]: "Empty group",
  [constants.NO_CONFIG_FOR_FIELD]: "No config for field {{field}}",
  [constants.FIXED_OPERATOR]: "Fixed operator {{from}} to {{to}}",
  [constants.NO_CONFIG_FOR_OPERATOR]: "No config for operator {{operator}}",
  [constants.NO_CONFIG_FOR_FUNCTION]: "No config for function {{funcKey}}",
  [constants.INVALID_VALUE]: "Invalid value",
  [constants.INVALID_FUNC_ARG_VALUE]: "Invalid value of arg {{argKey}} for func {{funcKey}}: {{argValidationError}}"
};

export const custom = {
  "INVALID_SLIDER_VALUE": "Invalid slider value {{val}} translated with i18next",
  "BAD_LEN": "bad len {{val}} translated with i18next"
};
