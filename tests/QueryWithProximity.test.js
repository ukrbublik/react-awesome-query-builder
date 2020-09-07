import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb, export_checks } from "./utils";


describe("proximity", () => {

  it("should import", () => {
    with_qb(configs.with_prox, inits.with_prox, "default", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
    });
  });

  describe("export", () => {
    export_checks(configs.with_prox, inits.with_prox, "default", {
      "query": "str \"a\" NEAR/3 \"b\"",
      "queryHuman": "String \"a\" NEAR/3 \"b\"",
      "sql": "CONTAINS(str, 'NEAR((a, b), 3)')"
    });
  });
});
