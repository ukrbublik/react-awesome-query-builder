import * as configs from "../support/configs";
import * as inits from "../support/inits";
import {export_checks} from "../support/utils";


describe("query with switch-case", () => {

  describe("2 cases and 1 default", () => {
    export_checks([configs.with_all_types, configs.with_cases], inits.spel_with_cases, "SpEL", {
      "spel": "(str == '222' ? 'is_string' : (num == 4 ? 'is_number' : 'unknown'))",
      logic:
        {"if": [
          {"==":[{"var":"str"},"222"]},
          "is_string",
          {"if": [
            {"==":[{"var":"num"},4]},
            "is_number",
            "unknown"
          ]}
        ]}
    });

    export_checks([configs.with_all_types, configs.with_cases], inits.with_cases, undefined, {
      "spel": "(str == '222' ? 'is_string' : (num == 4 ? 'is_number' : 'unknown'))",
    });

    export_checks([configs.with_all_types, configs.with_cases], inits.sql_with_cases, "SQL", {
      "spel": "(str == '222' ? 'is_string' : (num == 4 ? 'is_number' : 'unknown'))",
    });
  });

  describe("1 case and 1 default", () => {
    export_checks([configs.with_all_types, configs.with_cases], inits.spel_with_cases_simple, "SpEL", {
      logic:
        {
          "if": [
            {"==": [{"var": "str"}, "222"]},
            "foo",
            "bar"
          ]
        }
    });

    export_checks([configs.with_all_types, configs.with_cases, configs.with_case_value_field_text], inits.spel_with_cases_vars, "SpEL", {
      logic: inits.with_cases_vars,
      spel: inits.spel_with_cases_vars,
    });

    export_checks([configs.with_all_types, configs.with_cases], inits.with_cases_simple, "JsonLogic", {
      spel: "(str == '222' ? 'foo' : 'bar')"
    });

    export_checks([configs.with_all_types, configs.with_cases, configs.with_case_value_field_text], inits.with_cases_vars, "JsonLogic", {
      spel: inits.spel_with_cases_vars,
      logic: inits.with_cases_vars
    });
  });

  describe("1 default case with field", () => {
    export_checks([configs.with_all_types, configs.with_cases, configs.with_case_value_field_text], inits.spel_with_default_case_field, "SpEL", {
      logic: inits.with_default_case_field,
      spel: inits.spel_with_default_case_field,
    });

    export_checks([configs.with_all_types, configs.with_cases, configs.with_case_value_field_text], inits.with_default_case_field, "JsonLogic", {
      logic: inits.with_default_case_field,
      spel: inits.spel_with_default_case_field,
    });
  });

  describe("1 default case with func", () => {
    export_checks([configs.with_all_types, configs.with_cases, configs.with_funcs, configs.with_case_value_field_text], inits.spel_with_default_case_func, "SpEL", {
      logic: inits.with_default_case_func,
      spel: inits.spel_with_default_case_func,
    });

    export_checks([configs.with_all_types, configs.with_cases, configs.with_funcs, configs.with_case_value_field_text], inits.with_default_case_func, "JsonLogic", {
      logic: inits.with_default_case_func,
      spel: inits.spel_with_default_case_func,
    });
  });

  describe("with concat in value", () => {
    export_checks([configs.with_all_types, configs.with_concat_case_value, configs.with_cases], inits.spel_with_cases_and_concat, "SpEL", {
      "spel": "(str == '222' ? foo : foo + bar)"
    });
  });

});
