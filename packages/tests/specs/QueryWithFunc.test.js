import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, with_qb_ant, export_checks, export_checks_in_it } from "../support/utils";


describe("query with func", () => {

  describe("loads tree with func LOWER from JsonLogic", () => {
    export_checks(configs.with_funcs, inits.with_func_tolower_from_field, "JsonLogic", {
      "query": "str == LOWER(str2)",
      "queryHuman": "String = Lowercase(String: String2)",
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
                "toLowerCase": [ { "var": "str2" } ]
              }
            ]
          }
        ]
      }
    });
  });

  it("should render func with antd", async () => {
    await with_qb_ant(configs.with_funcs, inits.with_func_tolower_from_field, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      expect(qb.find("FuncWidget")).to.have.length(1);
    });
  });

  it("set function for number", async () => {
    await with_qb(configs.with_funcs, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
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

      export_checks_in_it(configs.with_funcs, updatedTree, "default", {
        "query": "num == (1 * 4 + 0)",
        "queryHuman": "Number = (1 * 4 + 0)",
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

  describe("loads tree in tree format with func LINEAR_REGRESSION", () => {
    export_checks(configs.with_funcs, inits.with_func_linear_regression_tree, "default", {
      "query": "num == (2 * 3 + 0)",
      "queryHuman": "Number = (2 * 3 + 0)",
      "sql": "num = (2 * 3 + 0)",
      "spel": "num == (2 * 3 + 0)",
      "mongo": {
        "$expr": {
          "$eq": [
            "$num",
            { "$sum": [
              { "$multiply": [ 2, 3 ] },  0
            ] }
          ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              { "var": "num" },
              { "+": [ { "*": [ 2, 3 ] }, 0 ] }
            ]
          }
        ]
      }
    });
  });

  describe("loads tree in JsonLogic format with func LINEAR_REGRESSION", () => {
    export_checks(configs.with_funcs, inits.with_func_linear_regression, "JsonLogic", {
      "query": "num == (2 * 3 + 0)",
      "queryHuman": "Number = (2 * 3 + 0)",
      "sql": "num = (2 * 3 + 0)",
      "spel": "num == (2 * 3 + 0)",
      "mongo": {
        "$expr": {
          "$eq": [
            "$num",
            { "$sum": [
              { "$multiply": [ 2, 3 ] },  0
            ] }
          ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              { "var": "num" },
              { "+": [ { "*": [ 2, 3 ] }, 0 ] }
            ]
          }
        ]
      }
    });
  });

  describe("loads tree with func RELATIVE_DATETIME", () => {
    export_checks(configs.with_funcs, inits.with_func_relative_datetime, "JsonLogic", {
      "query": "datetime == NOW + 2 day",
      "queryHuman": "Datetime = NOW + 2 day",
      "sql": "datetime = DATE_ADD(NOW(), INTERVAL 2 day)",
      "spel": "datetime == RELATIVE_DATETIME(new java.util.Date()(), 'plus', 2, 'day')",
      "logic": {
        "and": [
          {
            "==": [
              { "var": "datetime" },
              {
                "date_add": [
                  { "now": [] },
                  2,
                  "day"
                ]
              }
            ]
          }
        ]
      }
    });
  });

});
