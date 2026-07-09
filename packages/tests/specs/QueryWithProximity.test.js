import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, export_checks } from "../support/utils";
import { expect } from "chai";


describe("proximity", () => {

  describe("when text type has proximity operator", () => {
    export_checks(configs.with_prox, inits.with_prox, "default", {
      "query": "str \"a\" NEAR/3 \"b\"",
      "queryHuman": "String a NEAR/3 b",
      "sql": "CONTAINS(str, 'NEAR((a, b), 3)')"
    });

    it("change NEAR", async () => {
      await with_qb(configs.with_prox, inits.with_prox, "default", (qb, {expect_queries}) => {
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

  describe("when text type has no proximity operator, but prox field has", () => {
    export_checks(configs.with_prox1, inits.with_prox1, "default", {
      "query": "prox1 \"a\" NEAR/3 \"b\"",
      "queryHuman": "Prox1 a NEAR/3 b",
      "sql": "CONTAINS(prox1, 'NEAR((a, b), 3)')"
    });

    it("renders widgets correctly", async () => {
      await with_qb([
        configs.with_prox1, configs.with_dont_fix_on_load, configs.with_show_error,
      ], inits.with_prox1_no_values, "default", async (qb) => {
        expect(qb.find(".rule .rule--value .widget--widget")).to.have.length(2);
      }, {
        expectedLoadErrors: [
          "Prox1 ? NEAR/3 ?  >>  [rhs] Incomplete RHS"
        ],
        sanitizeOptions: {
          // don't fix tree in `load_tree`
          removeEmptyGroups: false,
          removeEmptyRules: false,
          removeIncompleteRules: false,
        },
      });
    });
  });

});
