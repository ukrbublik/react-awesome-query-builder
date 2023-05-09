import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, with_qb_ant, export_checks, export_checks_in_it } from "../support/utils";


describe("query with switch-case", () => {

  describe("export", () => {
    export_checks(configs.with_cases, inits.spel_with_cases, "SpEL", {
      "spel": "(str == '222' ? 'is_string' : (num == 222 ? 'is_number' : 'unknown'))"
    });
  });

});
