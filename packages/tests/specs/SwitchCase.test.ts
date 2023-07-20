import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, with_qb_ant, export_checks, export_checks_in_it } from "../support/utils";


describe("query with switch-case", () => {

  describe("simple", () => {
    export_checks(configs.with_cases, inits.spel_with_cases, "SpEL", {
      "spel": "(str == '222' ? 'is_string' : (num == 222 ? 'is_number' : 'unknown'))"
    });
  });

  describe("with concat in value", () => {
    export_checks([configs.with_concat_case_value, configs.with_cases], inits.spel_with_cases_and_concat, "SpEL", {
      "spel": "(str == '222' ? foo : foo + bar)"
    });
  });

});
