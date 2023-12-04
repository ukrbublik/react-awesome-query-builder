import * as configs from "../support/configs";
import * as inits from "../support/inits";
import {export_checks} from "../support/utils";


describe("query with switch-case", () => {

  describe("simple", () => {
    export_checks([configs.with_all_types, configs.with_cases], inits.spel_with_cases, "SpEL", {
      "spel": "(str == '222' ? 'is_string' : (num == 4 ? 'is_number' : 'unknown'))",
      logic:
        {"IF":[{"==":[{"var":"str"},"222"]},"is_string",{"==":[{"var":"num"},4]},"is_number","unknown"]}
    });
  });

  describe("simple json", () => {
    export_checks([configs.with_concat_case_value, configs.with_cases], inits.spel_with_cases_simple, "SpEL", {
      logic:
        {"IF": [{"==": [{"var": "str"}, "222"]}, "foo", "bar"]}
    });
  });

  describe("with concat in value", () => {
    export_checks([configs.with_all_types, configs.with_concat_case_value, configs.with_cases], inits.spel_with_cases_and_concat, "SpEL", {
      "spel": "(str == '222' ? foo : foo + bar)"
    });
  });

});
