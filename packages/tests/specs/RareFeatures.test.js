import { Query, Builder, BasicConfig } from "@react-awesome-query-builder/ui";
import { AntdConfig } from "@react-awesome-query-builder/antd";
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
      "spel": "state.input.num == 2",
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

  describe("import from SpEL uses fieldName", () => {
    export_checks(configs.with_fieldName, inits.spel_with_fieldName, "SpEL", {
      "spel": "state.input.num == 2",
    });
  });

  describe("import uses fieldName in group", () => {
    export_checks(configs.with_fieldName, inits.with_fieldName_in_group, "JsonLogic", {
      "spel": "results.?[outcome == 3].size() > 0",
      "query": "outcome == 3",
      "queryHuman": "Results.Score = 3",
      "mongo": {
        "results": {
          "$elemMatch": {
            "outcome": 3
          }
        }
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "results" },
              {
                "==": [
                  { "var": "outcome" },
                  3
                ]
              }
            ]
          }
        ]
      }
    });
  });

  describe("import uses fieldName in struct", () => {
    export_checks(configs.with_fieldName, inits.with_fieldName_in_struct, "JsonLogic", {
      "query": "(person.age >= 18 && userName == \"Denys\" && account.id == \"123\")",
      "queryHuman": "(user.age >= 18 AND user.name = Denys AND user.id = 123)",
      "sql": "(person.age >= 18 AND userName = 'Denys' AND account.id = '123')",
      "spel": "(person.age >= 18 && userName == 'Denys' && account.id == '123')",
      "mongo": {
        "person.age": {
          "$gte": 18
        },
        "userName": "Denys",
        "account.id": "123"
      },
      "logic": {
        "and": [
          {
            ">=": [
              {
                "var": "person.age"
              },
              18
            ]
          },
          {
            "==": [
              {
                "var": "userName"
              },
              "Denys"
            ]
          },
          {
            "==": [
              {
                "var": "account.id"
              },
              "123"
            ]
          }
        ]
      },
      // "elasticSearch": {
      //   "bool": {
      //     "must": [
      //       {
      //         "range": {
      //           "user.age": {
      //             "gte": "18"
      //           }
      //         }
      //       },
      //       {
      //         "term": {
      //           "user.name": "Denys"
      //         }
      //       },
      //       {
      //         "term": {
      //           "user.id": "123"
      //         }
      //       }
      //     ]
      //   }
      // }
    });
  });

  describe("import from SpEL uses fieldName in group", () => {
    export_checks(configs.with_fieldName, inits.spel_with_fieldName_in_group, "SpEL", {
      "spel": "results.?[outcome == 3].size() > 0",
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
