import { Query, Builder, BasicConfig } from "react-awesome-query-builder";
import AntdConfig from "react-awesome-query-builder/config/antd";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, empty_value, export_checks } from "../support/utils";
// warning: don't put `export_checks` inside `it`


describe("rare features", () => {
  describe("export uses fieldName", () => {
    export_checks(configs.with_fieldName, inits.with_number, "JsonLogic", {
      "query": "state.input.num == 2",
      "queryHuman": "Number = 2",
      "sql": "state.input.num = 2",
      "mongo": {
        "state.input.num": 2
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "var": "state.input.num"
              },
              2
            ]
          }
        ]
      }
    });
  });

  describe("import uses fieldName", () => {
    export_checks(configs.with_fieldName, inits.with_fieldName, "JsonLogic", {
      "query": "state.input.num == 2",
      "queryHuman": "Number = 2",
      "sql": "state.input.num = 2",
      "mongo": {
        "state.input.num": 2
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "var": "state.input.num"
              },
              2
            ]
          }
        ]
      }
    });
  });

  describe("uses groupVarKey and altVarKey", () => {
    export_checks(configs.with_groupVarKey, inits.with_groupVarKey, "JsonLogic", {
      "query": "(stock == true && results.score > 8)",
      "queryHuman": "(In stock AND Results.score > 8)",
      "sql": "(stock = true AND results.score > 8)",
      "mongo": {
        "stock": true,
        "results": {
          "$elemMatch": {
            "score": {
              "$gt": 8
            }
          }
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "shortcut": "stock"
              },
              true
            ]
          },
          {
            "some": [
              {
                "varValues": "results"
              },
              {
                ">": [
                  {
                    "var": "score"
                  },
                  8
                ]
              }
            ]
          }
        ]
      }
    });
  });

});
