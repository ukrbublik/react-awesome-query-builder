import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, with_qb_ant, export_checks, export_checks_in_it } from "../support/utils";
const {
  with_all_types,
  with_funcs,
  with_spel_safe_nav
} = configs;
import { expect } from "chai";

describe("query with func", () => {

  describe("loads tree with func LOWER from JsonLogic", () => {
    export_checks([with_all_types, with_funcs], inits.with_func_tolower_from_field, "JsonLogic", {
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

  describe("can import tree with func LOWER and operator 'contains'", () => {
    export_checks([with_all_types, with_funcs], inits.with_func_tolower_and_contains_op, "JsonLogic", {
      sql: "LOWER('AAA') LIKE '%aa%'",
      spel: "'AAA'.toLowerCase().contains('aa')",
      logic: inits.with_func_tolower_and_contains_op
    });
  });

  describe("support safe navigation operator in @spel import functions", () => {
    export_checks([with_all_types, with_funcs, with_spel_safe_nav], "'AAA'?.toLowerCase()?.contains('aa')", "SpEL", {
      spel: "'AAA'?.toLowerCase()?.contains('aa')",
    });
  });

  it("should render func with antd", async () => {
    await with_qb_ant([with_all_types, with_funcs], inits.with_func_tolower_from_field, "JsonLogic", (qb, {expect_jlogic}) => {
      expect(qb.find("FuncWidget")).to.have.length(1);
    });
  });

  it("set function for number", async () => {
    await with_qb([with_all_types, with_funcs], inits.with_number, "JsonLogic", (qb, {onChange, expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--valuesrc select")
        .simulate("change", { target: { value: "func" } });
      qb
        .find(".rule .rule--value .widget--func .rule--func select")
        .simulate("change", { target: { value: "LINEAR_REGRESSION" } });
      qb
        .find(".rule .rule--value .widget--func .rule--func--args .rule--func--arg")
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

      export_checks_in_it([with_all_types, with_funcs], updatedTree, "default", {
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
    export_checks([with_all_types, with_funcs], inits.with_func_linear_regression_tree, "default", {
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
    export_checks([with_all_types, with_funcs], inits.with_func_linear_regression, "JsonLogic", {
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
    export_checks([with_all_types, with_funcs], inits.with_func_relative_datetime, "JsonLogic", {
      "query": "datetime == NOW + 2 day",
      "queryHuman": "DateTime = NOW + 2 day",
      "sql": "datetime = DATE_ADD(NOW(), INTERVAL 2 day)",
      "spel": "datetime.compareTo(T(java.time.LocalDateTime).now().plusDays(2)) == 0",
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

  describe("loads tree with func SUM_OF_MULTISELECT", () => {
    export_checks([with_all_types, with_funcs], inits.with_func_sum_of_multiselect, "JsonLogic", {
      "query": "num == SUM_OF_MULTISELECT(3,5)",
      "queryHuman": "Number = Sum of multiselect(Value: C,E)",
      "sql": "num = SUM_OF_MULTISELECT(3,5)",
      "spel": "num == {3, 5}.sumOfMultiselect()",
      "logic": {
        "and": [
          {
            "==": [
              { "var": "num" },
              {
                "sumOfMultiselect": [
                  [3, 5]
                ]
              }
            ]
          }
        ]
      }
    });
  });

  describe("loads tree with func SUM_OF_MULTISELECT from SpEL", () => {
    export_checks([with_all_types, with_funcs], inits.with_func_sum_of_multiselect_spel, "SpEL", {
      "query": "num == SUM_OF_MULTISELECT(5)",
      "queryHuman": "Number = Sum of multiselect(Value: E)",
      "sql": "num = SUM_OF_MULTISELECT(5)",
      "spel": "num == {5}.sumOfMultiselect()",
      "logic": {
        "and": [
          {
            "==": [
              { "var": "num" },
              {
                "sumOfMultiselect": [
                  [5]
                ]
              }
            ]
          }
        ]
      }
    });
  });

  describe("loads tree with func SUM_OF_MULTISELECT in LHS", () => {
    export_checks([with_all_types, with_funcs], inits.with_func_sum_of_multiselect_in_lhs, "JsonLogic", {
      "query": "SUM_OF_MULTISELECT(3,4) >= SUM_OF_MULTISELECT(1,2) && SUM_OF_MULTISELECT(3,4) <= SUM_OF_MULTISELECT(5,6)",
      "sql": "SUM_OF_MULTISELECT(3,4) BETWEEN SUM_OF_MULTISELECT(1,2) AND SUM_OF_MULTISELECT(5,6)",
      "spel": "{3, 4}.sumOfMultiselect() >= {1, 2}.sumOfMultiselect() && {3, 4}.sumOfMultiselect() <= {5, 6}.sumOfMultiselect()",
      "logic": {
        "and": [
          {
            "<=": [
              { "sumOfMultiselect": [
                [ 1, 2]
              ] },
              { "sumOfMultiselect": [
                [ 3, 4]
              ] },
              { "sumOfMultiselect": [
                [ 5, 6]
              ] },
            ]
          }
        ]
      }
    });
  });

});
