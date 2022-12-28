import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, export_checks } from "../support/utils";


describe("proximity", () => {

  describe("export", () => {
    export_checks(configs.with_prox, inits.with_prox, "default", {
      "query": "str \"a\" NEAR/3 \"b\"",
      "queryHuman": "String a NEAR/3 b",
      "sql": "CONTAINS(str, 'NEAR((a, b), 3)')"
    });
  });

  it("change NEAR", async () => {
    await with_qb(configs.with_prox, inits.with_prox, "default", (qb, onChange, {expect_queries}) => {
      qb
        .find(".rule .rule--operator-options .rule--operator .operator--options select")
        .simulate("change", { target: { value: "5" } });
      expect_queries([
        "str \"a\" NEAR/3 \"b\"",
        "str \"a\" NEAR/5 \"b\""
      ]);
    });
  });
});
