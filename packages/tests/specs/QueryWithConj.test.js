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

  describe("should handle OR with 2 rules", () => {
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
      elasticSearch7: {
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
                "login": {
                  "value": "ukrbublik"
                }
              }
            }
          ]
        }
      },
    });
  });

  describe("can use reversed op", () => {
    export_checks([configs.with_number_and_string, configs.without_less_format], inits.with_less, "JsonLogic", {
      "query": "!(num >= 2)",
      "queryHuman": "NOT (Number >= 2)",
      "sql": "NOT(num >= 2)",
      "spel": "!(num >= 2)",
    });
  });

  describe("should handle OR with 2 rules with NOT", () => {
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
      },
      "spel": "!(num < 2 || login == 'ukrbublik')",
    });

    describe("reverseOperatorsForNot == true", () => {
      export_checks([configs.with_number_and_string, configs.with_reverse_operators], inits.with_not_number_and_string, "JsonLogic", {
        // should be same
        "spel": "!(num < 2 || login == 'ukrbublik')",
      }, []);

      describe("canShortMongoQuery == false", () => {
        export_checks([configs.with_number_and_string, configs.without_short_mongo_query], inits.with_not_number_and_string, "JsonLogic", {
          "spel": "!(num < 2 || login == 'ukrbublik')",
          "mongo": {
            "$or": [
              {
                "$not": {
                  "num": {
                    "$lt": 2
                  }
                }
              },
              {
                "$not": {
                  "login": "ukrbublik"
                }
              }
            ]
          }
        }, []);
      });
    });

  });

  describe("should handle NOT with 1 rule", () => {
    describe("reverseOperatorsForNot == true", () => {
      export_checks([configs.with_number_and_string, configs.with_reverse_operators], inits.spel_with_not, "SpEL", {
        // will convert `!(num == 2)` to `num != 2`
        spel: "num != 2"
      });
    });

    describe("reverseOperatorsForNot == false", () => {
      export_checks(configs.with_number_and_string, inits.spel_with_not, "SpEL", {
        spel: "!(num == 2)"
      });
    });
  });

  describe("should handle NOT with 1 rule inside NOT with 2 rules", () => {
    describe("reverseOperatorsForNot == true", () => {
      export_checks([configs.with_number_and_string, configs.with_reverse_operators], inits.spel_with_not_not, "SpEL", {
        // will convert `!(num == 3)` to `num != 3`
        spel: "!(num == 2 || num != 3)"
      });
    });

    describe("reverseOperatorsForNot == false", () => {
      export_checks([configs.with_number_and_string], inits.spel_with_not_not, "SpEL", {
        spel: "!(num == 2 || !(num == 3))"
      });
    });
  });

});
