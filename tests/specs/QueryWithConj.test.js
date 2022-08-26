import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_skins, export_checks } from "../support/utils";


describe("query with conjunction", () => {
  describe("import", () => {
    it("should work with simple value of JsonLogic format", async () => {
      await with_qb_skins(configs.with_number_and_string, inits.with_number_and_string, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.with_number_and_string, inits.with_number_and_string, "JsonLogic", {
      query: '(num < 2 || login == "ukrbublik")',
      queryHuman: "(Number < 2 OR login = ukrbublik)",
      sql: "(num < 2 OR login = 'ukrbublik')",
      mongo: {
        "$or": [
          { "num": {"$lt": 2} },
          { "login": "ukrbublik" }
        ]
      },
      logic: {
        "or": [
          {
            "<": [ {"var": "num"}, 2 ]
          }, {
            "==": [ {"var": "login"}, "ukrbublik" ]
          }
        ]
      },
      elasticSearch: {
        "bool": {
          "should": [
            {
              "range": {
                "num": {
                  "lt": "2"
                }
              }
            },
            {
              "term": {
                "login": "ukrbublik"
              }
            }
          ] 
        }
      },
    });
  });

  describe("export with NOT", () => {
    export_checks(configs.with_number_and_string, inits.with_not_number_and_string, "JsonLogic", {
      "query": "NOT (num < 2 || login == \"ukrbublik\")",
      "queryHuman": "NOT (Number < 2 OR login = ukrbublik)",
      "sql": "NOT (num < 2 OR login = 'ukrbublik')",
      "mongo": {
        "num": {
          "$gte": 2
        },
        "login": {
          "$ne": "ukrbublik"
        }
      },
      "logic": {
        "!": {
          "or": [
            {
              "<": [ {"var": "num"}, 2 ]
            }, {
              "==": [ {"var": "login"}, "ukrbublik" ]
            }
          ]
        }
      },
      "elasticSearch": {
        "bool": {
          "should_not": [
            {
              "range": {
                "num": {
                  "lt": "2"
                }
              }
            },
            {
              "term": {
                "login": "ukrbublik"
              }
            }
          ]
        }
      }
    });
  });

});
