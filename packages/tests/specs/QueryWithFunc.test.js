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

  describe("text functions", () => {
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
  });

  describe("UX with functions", () => {
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
  });

  describe("math functions", () => {
    describe("loads tree with func LINEAR_REGRESSION", () => {
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

    describe("loads tree with func LINEAR_REGRESSION from JsonLogic", () => {
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
  });

  describe("date/datetime functions", () => {
    describe("loads tree with func RELATIVE_DATETIME from JsonLogic", () => {
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
                  "datetime_add": [
                    { "now": [] },
                    2,
                    "day"
                  ]
                }
              ]
            }
          ]
        },
        "tree": {
          "type": "group",
          "children1": [
            {
              "type": "rule",
              "properties": {
                "field": "datetime",
                "operator": "equal",
                "value": [
                  {
                    "func": "RELATIVE_DATETIME",
                    "args": {
                      "date": {
                        "valueType": "datetime",
                        "valueSrc": "func",
                        "value": {
                          "func": "NOW",
                          "args": {}
                        },
                      },
                      "op": {
                        "value": "plus",
                      },
                      "val": {
                        "value": 2,
                      },
                      "dim": {
                        "value": "day",
                      },
                    }
                  }
                ]
              }
            }
          ]
        }
      });
    });
    describe("loads tree with func RELATIVE_DATE from JsonLogic", () => {
      export_checks([with_all_types, with_funcs], inits.with_func_relative_date, "JsonLogic", {
        "query": "date == TODAY + 2 day",
        "queryHuman": "Date = TODAY + 2 day",
        "sql": "date = DATE_ADD(CURDATE(), INTERVAL 2 day)",
        "spel": "date.compareTo(T(java.time.LocalDate).now().plusDays(2)) == 0",
        "logic": {
          "and": [
            {
              "==": [
                { "var": "date" },
                {
                  "date_add": [
                    { "today": [] },
                    2,
                    "day"
                  ]
                }
              ]
            }
          ]
        },
        "tree": {
          "type": "group",
          "children1": [
            {
              "type": "rule",
              "properties": {
                "field": "date",
                "operator": "equal",
                "value": [
                  {
                    "func": "RELATIVE_DATE",
                    "args": {
                      "date": {
                        "valueType": "date",
                        "valueSrc": "func",
                        "value": {
                          "func": "TODAY",
                          "args": {}
                        },
                      },
                      "op": {
                        "value": "plus",
                      },
                      "val": {
                        "value": 2,
                      },
                      "dim": {
                        "value": "day",
                      },
                    }
                  }
                ]
              }
            }
          ]
        }
      });
    });

    describe("loads tree with NOW/TODAY in LHS and RELATIVE_DATETIME/RELATIVE_DATE in RHS", () => {
      describe("from SpEL", () => {
        export_checks([with_all_types, with_funcs], inits.spel_with_date_funcs_in_lhs_and_rhs, "SpEL", {
          "sql": inits.sql_with_date_funcs_in_lhs_and_rhs,
          "spel": inits.spel_with_date_funcs_in_lhs_and_rhs,
          "logic": inits.jl_with_date_funcs_in_lhs_and_rhs,
        });
      });
      describe("from SQL", () => {
        export_checks([with_all_types, with_funcs], inits.sql_with_date_funcs_in_lhs_and_rhs, "SQL", {
          "sql": inits.sql_with_date_funcs_in_lhs_and_rhs,
          "spel": inits.spel_with_date_funcs_in_lhs_and_rhs,
          "logic": inits.jl_with_date_funcs_in_lhs_and_rhs,
        });
      });
      describe("from JsonLogic", () => {
        export_checks([with_all_types, with_funcs], inits.jl_with_date_funcs_in_lhs_and_rhs, "JsonLogic", {
          "sql": inits.sql_with_date_funcs_in_lhs_and_rhs,
          "spel": inits.spel_with_date_funcs_in_lhs_and_rhs,
          "logic": inits.jl_with_date_funcs_in_lhs_and_rhs,
        });
      });
    });

    describe("loads tree with NOW/TODAY in both LHS and RHS", () => {
      describe("from SpEL", () => {
        export_checks([with_all_types, with_funcs], inits.spel_with_now_funcs_in_lhs_and_rhs, "SpEL", {
          "sql": inits.sql_with_now_funcs_in_lhs_and_rhs,
          "spel": inits.spel_with_now_funcs_in_lhs_and_rhs,
          "logic": inits.jl_with_now_funcs_in_lhs_and_rhs,
        });
      });
      describe("from SQL", () => {
        export_checks([with_all_types, with_funcs], inits.sql_with_now_funcs_in_lhs_and_rhs, "SQL", {
          "sql": inits.sql_with_now_funcs_in_lhs_and_rhs,
          "spel": inits.spel_with_now_funcs_in_lhs_and_rhs,
          "logic": inits.jl_with_now_funcs_in_lhs_and_rhs,
        });
      });
      describe("from JsonLogic", () => {
        export_checks([with_all_types, with_funcs], inits.jl_with_now_funcs_in_lhs_and_rhs, "JsonLogic", {
          "sql": inits.sql_with_now_funcs_in_lhs_and_rhs,
          "spel": inits.spel_with_now_funcs_in_lhs_and_rhs,
          "logic": inits.jl_with_now_funcs_in_lhs_and_rhs,
        });
      });
    });

    describe("loads tree with RELATIVE_DATE in LHS and value in RHS", () => {
      describe("from SpEL", () => {
        export_checks([with_all_types, with_funcs], inits.spel_with_date_func_in_lhs_and_value_in_rhs, "SpEL", {
          "sql": inits.sql_with_date_func_in_lhs_and_value_in_rhs,
          "spel": inits.spel_with_date_func_in_lhs_and_value_in_rhs,
          "logic": inits.jl_with_date_func_in_lhs_and_value_in_rhs,
        });
      });
      describe("from SQL", () => {
        export_checks([with_all_types, with_funcs], inits.sql_with_date_func_in_lhs_and_value_in_rhs, "SQL", {
          "sql": inits.sql_with_date_func_in_lhs_and_value_in_rhs,
          "spel": inits.spel_with_date_func_in_lhs_and_value_in_rhs,
          "logic": inits.jl_with_date_func_in_lhs_and_value_in_rhs,
        });
      });
      describe("from JsonLogic", () => {
        export_checks([with_all_types, with_funcs], inits.jl_with_date_func_in_lhs_and_value_in_rhs, "JsonLogic", {
          "sql": inits.sql_with_date_func_in_lhs_and_value_in_rhs,
          "spel": inits.spel_with_date_func_in_lhs_and_value_in_rhs,
          "logic": inits.jl_with_date_func_in_lhs_and_value_in_rhs,
        });
      });
    });

    describe("loads tree with RELATIVE_DATETIME in LHS and value in RHS", () => {
      describe("from SpEL", () => {
        export_checks([with_all_types, with_funcs], inits.spel_with_datetime_func_in_lhs_and_value_in_rhs, "SpEL", {
          "sql": inits.sql_with_datetime_func_in_lhs_and_value_in_rhs,
          "spel": inits.spel_with_datetime_func_in_lhs_and_value_in_rhs,
          "logic": inits.jl_with_datetime_func_in_lhs_and_value_in_rhs,
        });
      });
      describe("from SQL", () => {
        export_checks([with_all_types, with_funcs], inits.sql_with_datetime_func_in_lhs_and_value_in_rhs, "SQL", {
          "sql": inits.sql_with_datetime_func_in_lhs_and_value_in_rhs,
          "spel": inits.spel_with_datetime_func_in_lhs_and_value_in_rhs,
          "logic": inits.jl_with_datetime_func_in_lhs_and_value_in_rhs,
        });
      });
      describe("from JsonLogic", () => {
        export_checks([with_all_types, with_funcs], inits.jl_with_datetime_func_in_lhs_and_value_in_rhs, "JsonLogic", {
          "sql": inits.sql_with_datetime_func_in_lhs_and_value_in_rhs,
          "spel": inits.spel_with_datetime_func_in_lhs_and_value_in_rhs,
          "logic": inits.jl_with_datetime_func_in_lhs_and_value_in_rhs,
        });
      });
    });

    describe("loads tree with field in LHS and DATE_ADD(NOW(),..) in RHS", () => {
      describe("from SpEL", () => {
        export_checks([with_all_types, with_funcs], inits.spel_with_field_in_lhs_and_date_func_in_rhs, "SpEL", {
          "sql": inits.sql_with_field_in_lhs_and_date_func_in_rhs,
          "spel": inits.spel_with_field_in_lhs_and_date_func_in_rhs,
          "logic": inits.jl_with_field_in_lhs_and_date_func_in_rhs,
        });
      });
      describe("from SQL", () => {
        export_checks([with_all_types, with_funcs], inits.sql_with_field_in_lhs_and_date_func_in_rhs, "SQL", {
          "sql": inits.sql_with_field_in_lhs_and_date_func_in_rhs,
          "spel": inits.spel_with_field_in_lhs_and_date_func_in_rhs,
          "logic": inits.jl_with_field_in_lhs_and_date_func_in_rhs,
        });
      });
      describe("from JsonLogic", () => {
        export_checks([with_all_types, with_funcs], inits.jl_with_field_in_lhs_and_date_func_in_rhs, "JsonLogic", {
          "sql": inits.sql_with_field_in_lhs_and_date_func_in_rhs,
          "spel": inits.spel_with_field_in_lhs_and_date_func_in_rhs,
          "logic": inits.jl_with_field_in_lhs_and_date_func_in_rhs,
        });
      });
    });


    describe("loads tree with field in LHS and DATE_ADD(field,..) in RHS", () => {
      describe("from SpEL", () => {
        export_checks([with_all_types, with_funcs], inits.spel_with_field_in_lhs_and_date_func_in_rhs_2, "SpEL", {
          "sql": inits.sql_with_field_in_lhs_and_date_func_in_rhs_2,
          "spel": inits.spel_with_field_in_lhs_and_date_func_in_rhs_2,
          "logic": inits.jl_with_field_in_lhs_and_date_func_in_rhs_2,
        });
      });
      describe("from SQL", () => {
        export_checks([with_all_types, with_funcs], inits.sql_with_field_in_lhs_and_date_func_in_rhs_2, "SQL", {
          "sql": inits.sql_with_field_in_lhs_and_date_func_in_rhs_2,
          "spel": inits.spel_with_field_in_lhs_and_date_func_in_rhs_2,
          "logic": inits.jl_with_field_in_lhs_and_date_func_in_rhs_2,
        });
      });
      describe("from JsonLogic", () => {
        export_checks([with_all_types, with_funcs], inits.jl_with_field_in_lhs_and_date_func_in_rhs_2, "JsonLogic", {
          "sql": inits.sql_with_field_in_lhs_and_date_func_in_rhs_2,
          "spel": inits.spel_with_field_in_lhs_and_date_func_in_rhs_2,
          "logic": inits.jl_with_field_in_lhs_and_date_func_in_rhs_2,
        });
      });
    });

    describe("loads tree with START_OF_DAY in RHS", () => {
      describe("from SQL", () => {
        export_checks([with_all_types, with_funcs], inits.sql_with_start_of_day_in_rhs, "SQL", {
          "sql": inits.sql_with_start_of_day_in_rhs,
          "spel": inits.spel_with_start_of_day_in_rhs,
          "logic": inits.jl_with_start_of_day_in_rhs,
        });
      });
      describe("from SpEL", () => {
        export_checks([with_all_types, with_funcs], inits.spel_with_start_of_day_in_rhs, "SpEL", {
          "sql": inits.sql_with_start_of_day_in_rhs,
          "spel": inits.spel_with_start_of_day_in_rhs,
          "logic": inits.jl_with_start_of_day_in_rhs,
        });
      });
      describe("from JsonLogic", () => {
        export_checks([with_all_types, with_funcs], inits.jl_with_start_of_day_in_rhs, "JsonLogic", {
          "sql": inits.sql_with_start_of_day_in_rhs,
          "spel": inits.spel_with_start_of_day_in_rhs,
          "logic": inits.jl_with_start_of_day_in_rhs,
        });
      });
    });
  });

  describe("other functions", () => {
    describe("loads tree with func SUM_OF_MULTISELECT from JsonLogic", () => {
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

    describe("loads tree with func SUM_OF_MULTISELECT in LHS from JsonLogic", () => {
      export_checks([with_all_types, with_funcs], inits.with_func_sum_of_multiselect_in_lhs, "JsonLogic", {
        "query": "SUM_OF_MULTISELECT(3,4) >= SUM_OF_MULTISELECT(1,2) && SUM_OF_MULTISELECT(3,4) <= SUM_OF_MULTISELECT(5,6)",
        "sql": "SUM_OF_MULTISELECT(3,4) BETWEEN SUM_OF_MULTISELECT(1,2) AND SUM_OF_MULTISELECT(5,6)",
        "spel": "({3, 4}.sumOfMultiselect() >= {1, 2}.sumOfMultiselect() && {3, 4}.sumOfMultiselect() <= {5, 6}.sumOfMultiselect())",
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

});
