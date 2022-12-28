import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_skins, export_checks } from "../support/utils";


describe("query with field compare", () => {

  describe("import", () => {
    it("should work with simple value of JsonLogic format", async () => {
      await with_qb_skins(configs.simple_with_2_numbers, inits.with_number_field_compare, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.simple_with_2_numbers, inits.with_number_field_compare, "JsonLogic", {
      "query": "num == num2",
      "queryHuman": "Number = Number2",
      "sql": "num = num2",
      "mongo": {
        "$expr": {
          "$eq": [ "$num", "$num2" ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              { "var": "num" },  { "var": "num2" }
            ]
          }
        ]
      }
    });
  });
});
