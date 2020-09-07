import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb, export_checks } from "./utils";


describe("query with func", () => {

  describe("loads tree with func from JsonLogic", () => {
    export_checks(configs.with_funcs, inits.with_func_tolower_from_field, "JsonLogic", {
      "query": "str == LOWER(str2)",
      "queryHuman": "String == Lowercase(String: String2)",
      "sql": "str = LOWER(str2)",
      "mongo": {
        "$expr": {
          "$eq": [
            "$str",
            {
              "$toLower": "$str2"
            }
          ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              { "var": "str" },
              {
                "method": [ { "var": "str2" },  "toLowerCase" ]
              }
            ]
          }
        ]
      }
    });
  });

  it("set function for number", () => {
    with_qb(configs.with_funcs, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--valuesrc select")
        .simulate("change", { target: { value: "func" } });
      qb
        .find(".rule .rule--value .widget--widget .rule--func select")
        .simulate("change", { target: { value: "LINEAR_REGRESSION" } });
      qb
        .find(".rule .rule--value .widget--widget .rule--func--args .rule--func--arg")
        .at(2)
        .find("input")
        .simulate("change", { target: { value: "4" } });
      expect_jlogic([null,
        { "and": [{ "==": [
          { "var": "num" }, 
          { "+": [ { "*": [ 1, 4 ] }, 0 ] }
        ] }] }
      ], 2);
      const updatedTree = onChange.getCall(2).args[0];
      export_checks(configs.with_funcs, updatedTree, "default", {
        "query": "num == (1 * 4 + 0)",
        "queryHuman": "Number == (1 * 4 + 0)",
        "sql": "num = (1 * 4 + 0)",
        "mongo": {
          "$expr": {
            "$eq": [
              "$num",
              { "$sum": [
                { "$multiply": [ 1, 4 ] },  0
              ] }
            ]
          }
        },
        "logic": {
          "and": [
            {
              "==": [
                { "var": "num" },
                { "+": [ { "*": [ 1, 4 ] }, 0 ] }
              ]
            }
          ]
        }
      });
    });
  });

});