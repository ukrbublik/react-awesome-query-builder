import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_skins, export_checks } from "../support/utils";


describe("query with !struct and !group", () => {

  describe("import", () => {
    it("should work with value of JsonLogic format", () => {
      with_qb_skins(configs.with_struct_and_group, inits.with_struct_and_group, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
    it("should handle custom operator in !group arrays", () => {
      with_qb_skins(configs.with_group_array_custom_operator, inits.with_group_array_custom_operator, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
        expect_checks({
          "logic": {
            "and": [
              {
                "custom_group_operator": [
                  {"var": "cars"},
                  {
                    "and": [
                      {
                        "==": [{"var": "vendor"}, "Toyota"]
                      }, {
                        ">=": [{"var": "year"}, 2010]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        });
      });
    });
  });

  describe("export", () => {
    export_checks(configs.with_struct_and_group, inits.with_struct_and_group, "JsonLogic", {
      "query": "((results.slider == 22 && results.stock == true) && user.firstName == \"abc\" && !!user.login)",
      "queryHuman": "((Results.Slider = 22 AND Results.In stock) AND Username = abc AND User.login IS NOT EMPTY)",
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
      "queryHuman": "(Results.Slider = 22 AND Username = abc)",
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
      "queryHuman": "(Results.score > 15 AND Results.user.name = denis)",
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
      "queryHuman": "(Results.score = 11 AND Results.user.name = aaa)",
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

  describe("with two nested groups", () => {
    export_checks(configs.with_nested_group, inits.with_two_groups_1, "JsonLogic", {
      "query": "((results.user.name == \"ddd\" && results.score == 2) && group2.inside == 33 && results.score == 2)",
      "queryHuman": "((Results.user.name = ddd AND Results.score = 2) AND Group2.inside = 33 AND Results.score = 2)",
      "sql": "((results.user.name = 'ddd' AND results.score = 2) AND group2.inside = 33 AND results.score = 2)",
      "mongo": {
        "$and": [
          {
            "results": {
              "$elemMatch": {
                "user": {
                  "$elemMatch": {
                    "name": "ddd"
                  }
                },
                "score": 2
              }
            }
          },
          {
            "group2": {
              "$elemMatch": {
                "inside": 33
              }
            }
          },
          {
            "results": {
              "$elemMatch": {
                "score": 2
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
              {
                "and": [
                  {
                    "some": [
                      { "var": "user" },
                      {
                        "==": [ { "var": "name" },  "ddd" ]
                      }
                    ]
                  },
                  {
                    "==": [ { "var": "score" },  2 ]
                  }
                ]
              }
            ]
          },
          {
            "some": [
              { "var": "group2" },
              {
                "==": [ { "var": "inside" },  33 ]
              }
            ]
          },
          {
            "some": [
              { "var": "results" },
              {
                "==": [ { "var": "score" },  2 ]
              }
            ]
          }
        ]
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with !struct inside !group", () => {

  describe("with 1 struct, 1 subfield", () => {
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group, "JsonLogic", {
      "query": "results.user.name == \"ddd\"",
      "queryHuman": "Results.user.name = ddd",
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

  describe("with 1 struct, 1 subfield and 1 simple field", () => {
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group_1_1, "JsonLogic", {
      "query": "(results.user.age >= 18 && results.score == 5)",
      "queryHuman": "(Results.user.age >= 18 AND Results.score = 5)",
      "sql": "(results.user.age >= 18 AND results.score = 5)",
      "mongo": {
        "results": {
          "$elemMatch": {
            "user.age": { "$gte": 18 },
            "score": 5
          }
        }
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "results" },
              { "and": [
                { ">=": [  { "var": "user.age" },  18  ] },
                { "==": [  { "var": "score" },  5  ] }
              ] }
            ]
          }
        ]
      }
    });
  });

  describe("with 1 struct, 2 subfields", () => {
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group_2, "JsonLogic", {
      "query": "(results.user.name == \"denis\" && results.user.age >= 18)",
      "queryHuman": "(Results.user.name = denis AND Results.user.age >= 18)",
      "sql": "(results.user.name = 'denis' AND results.user.age >= 18)",
      "mongo": {
        "results": {
          "$elemMatch": {
            "user.name": "denis",
            "user.age": { "$gte": 18 }
          }
        }
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "results" },
              { "and": [
                { "==": [  { "var": "user.name" },  "denis"  ] },
                { ">=": [  { "var": "user.age" },  18  ] }
              ] }
            ]
          }
        ]
      }
    });
  });

  describe("with 2 structs", () => {
    // todo
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with !group inside !struct", () => {

  describe("with 1 group, 1 subfield", () => {
    // todo
  });

  describe("with 1 group, 2 subfields", () => {
    export_checks(configs.with_group_inside_struct, inits.with_group_inside_struct, "JsonLogic", {
      "sql": "(vehicles.cars.vendor = 'Toyota' AND vehicles.cars.year = 2006)",
      "mongo": {
        "vehicles.cars": {
          "$elemMatch": {
            "vendor": "Toyota",
            "year": 2006
          }
        }
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "vehicles.cars" },
              {
                "and": [
                  { "==": [  { "var": "vendor" }, "Toyota"  ] },
                  { "==": [  { "var": "year" }, 2006  ] }
                ]
              }
            ]
          }
        ]
      }
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with !group mode array", () => {

  describe("export", () => {
    export_checks(configs.with_group_array, inits.with_group_array, "JsonLogic", {
      "query": "COUNT OF cars WHERE (vendor == \"Toyota\" && year >= 2010) > 2",
      "queryHuman": "COUNT OF Cars WHERE (vendor = Toyota AND year >= 2010) > 2",
      "sql": "(cars.vendor = 'Toyota' AND cars.year >= 2010)",
      "mongo": {
        "$expr": {
          "$gt": [
            {
              "$size": {
                "$filter": {
                  "input": "$cars",
                  "as": "el",
                  "cond": {
                    "$and": [
                      {
                        "$expr": {
                          "$eq": [
                            "$$el.vendor",
                            "Toyota"
                          ]
                        }
                      },
                      {
                        "$expr": {
                          "$gte": [
                            "$$el.year",
                            2010
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            },
            2
          ]
        }
      },
      "logic": {
        "and": [
          {
            ">": [
              {
                "reduce": [
                  {
                    "filter": [
                      {
                        "var": "cars"
                      },
                      {
                        "and": [
                          {
                            "==": [
                              {
                                "var": "vendor"
                              },
                              "Toyota"
                            ]
                          },
                          {
                            ">=": [
                              {
                                "var": "year"
                              },
                              2010
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "+": [
                      1,
                      {
                        "var": "accumulator"
                      }
                    ]
                  },
                  0
                ]
              },
              2
            ]
          }
        ]
      }
    });
  });

});
