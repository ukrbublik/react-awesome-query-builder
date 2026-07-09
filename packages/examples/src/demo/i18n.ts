import {
  Utils
} from "@react-awesome-query-builder/ui";

// Add translations
Utils.i18n.addResources("en", "custom", {
  "INVALID_SLIDER_VALUE": "Invalid slider value {{val}} translated with i18next",
  "BAD_LEN": "Bad length {{val}} translated with i18next"
});

// Override translations
Utils.i18n.addResources("en", "raqbvalidation", {
  "INCOMPLETE_LHS": "Incomplete left-hand side",
  "INCOMPLETE_RHS": "Incomplete right-hand side",
});
