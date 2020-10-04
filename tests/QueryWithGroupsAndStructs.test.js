import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb_skins, export_checks } from "./utils";


describe("query with !struct and !group", () => {

  describe("import", () => {
    it("should work with value of JsonLogic format", () => {
      with_qb_skins(configs.with_struct_and_group, inits.with_struct_and_group, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.with_struct_and_group, inits.with_struct_and_group, "JsonLogic", {
      "query": "((results.slider == 22 && results.stock == true) && user.firstName == \"abc\" && !!user.login)",
      "queryHuman": "((Results.Slider == 22 AND Results.In stock) AND Username == \"abc\" AND User.login IS NOT EMPTY)",
      "sql": "((results.slider = 22 AND results.stock = true) AND user.firstName = 'abc' AND user.login IS NOT EMPTY)",
      "mongo": {
        "results": {
          "$elemMatch": {
            "slider": 22,
            "stock": true
          }
        },
        "user.firstName": "abc",
        "user.login": {
          "$exists": true
        }
      },
      "logic": {
        "and": [
          {
            "and": [{
              "==": [ { "var": "results.slider" },  22 ]
            }, {
              "==": [ { "var": "results.stock" },  true ]
            }]
          }, {
            "==": [ { "var": "user.firstName" },  "abc" ]
          }, {
            "!!": { "var": "user.login" }
          }
        ]
      }
    });
  });

  describe("should handle if !group isnot wrapped in #some", () => {
    export_checks(configs.with_struct_and_group, inits.with_struct_and_group_mixed_obsolete, "JsonLogic", {
      "query": "(results.slider == 22 && user.firstName == \"abc\")",
      "queryHuman": "(Results.Slider == 22 AND Username == \"abc\")",
      "sql": "(results.slider = 22 AND user.firstName = 'abc')",
      "mongo": {
        "results": {
          "$elemMatch": {
            "slider": 22
          }
        },
        "user.firstName": "abc"
      },
      "logic": {
        "and": [
          {
            "==": [ { "var": "results.slider" }, 22 ]
          }, {
            "==": [ { "var": "user.firstName" }, "abc" ]
          }
        ]
      }
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with nested !group", () => {

  describe("with one group rule", () => {
    export_checks(configs.with_nested_group, inits.with_nested_group, "JsonLogic", {
      "query": "(results.score > 15 && results.user.name == \"denis\")",
      "queryHuman": "(Results.score > 15 AND Results.user.name == \"denis\")",
      "sql": "(results.score > 15 AND results.user.name = 'denis')",
      "mongo": {
        "results": {
          "$elemMatch": {
            "score": {
              "$gt": 15
            },
            "user": {
              "$elemMatch": {
                "name": "denis"
              }
            }
          }
        }
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "results" },
              {
                "and": [
                  {
                    ">": [  { "var": "score" },  15  ]
                  }, {
                    "some": [
                      { "var": "user" },
                      {
                        "==": [  { "var": "name" },  "denis"  ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    });
  });

  describe("with two separate group rules", () => {
    export_checks(configs.with_nested_group, inits.two_rules_with_nested_group, "JsonLogic", {
      "query": "(results.score == 11 && results.user.name == \"aaa\")",
      "queryHuman": "(Results.score == 11 AND Results.user.name == \"aaa\")",
      "sql": "(results.score = 11 AND results.user.name = 'aaa')",
      "mongo": {
        "$and": [
          {
            "results": {
              "$elemMatch": {
                "score": 11
              }
            }
          }, {
            "results": {
              "$elemMatch": {
                "user": {
                  "$elemMatch": {
                    "name": "aaa"
                  }
                }
              }
            }
          }
        ]
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "results" },
              { "==": [  { "var": "score" },  11  ] }
            ]
          },
          {
            "some": [
              { "var": "results" },
              { "some": [
                { "var": "user" }, 
                {
                  "==": [ { "var": "name" },  "aaa" ]
                }
              ] }
            ]
          }
        ]
      }
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with !struct inside !group", () => {

  describe("export", () => {
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group, "JsonLogic", {
      "query": "results.user.name == \"ddd\"",
      "queryHuman": "Results.user.name == \"ddd\"",
      "sql": "results.user.name = 'ddd'",
      "mongo": {
        "results": {
          "$elemMatch": {
            "user.name": "ddd"
          }
        }
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "results" },
              { "==": [  { "var": "user.name" },  "ddd"  ] }
            ]
          }
        ]
      }
    });
  });

});
