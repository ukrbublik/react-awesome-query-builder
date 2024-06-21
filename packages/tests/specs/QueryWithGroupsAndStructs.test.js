import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_skins, export_checks } from "../support/utils";


describe("query with !struct and !group", () => {

  describe("import", () => {
    it("should work with value of JsonLogic format", async () => {
      await with_qb_skins(configs.with_struct_and_group, inits.with_struct_and_group, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      }, {
        // ignoreLog: (errText) => {
        //   return errText.includes("Operator between is not supported for field results.slider");
        // }
      });
    });
    it("should handle custom operator in !group arrays", async () => {
      await with_qb_skins(configs.with_group_array_custom_operator, inits.with_group_array_custom_operator, "JsonLogic", async (qb, {onChange, expect_jlogic, expect_checks}) => {
        await expect_checks({
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
      }, {
        //ignoreLog
      });
    });
  });

  describe("export", () => {
    export_checks(configs.with_struct_and_group, inits.with_struct_and_group, "JsonLogic", {
      "query": "((results.slider == 22 && results.slider >= 13 && results.slider <= 36 && results.stock == true) && user.firstName == \"abc\" && !!user.login)",
      "queryHuman": "((Results.Slider = 22 AND Results.Slider BETWEEN 13 AND 36 AND Results.In stock) AND Username = abc AND User.login IS NOT EMPTY)",
      "sql": "((results.slider = 22 AND results.slider BETWEEN 13 AND 36 AND results.stock = true) AND user.firstName = 'abc' AND COALESCE(user.login, '') <> '')",
      "mongo": {
        "results": {
          "$elemMatch": {
            "slider": {
              "$eq": 22,
              "$gte": 13,
              "$lte": 36
            },
            "stock": true
          }
        },
        "user.firstName": "abc",
        "user.login": {
          "$nin": ["", null]
        }
      },
      "logic": {
        "and": [
          {
            "and": [{
              "==": [ { "var": "results.slider" }, 22 ]
            }, {
              "<=": [ 13, { "var": "results.slider" }, 36 ]
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
    }, [
      // validation:
      // "Results.Slider BETWEEN 13 AND 36  >>  * [lhs] Operator between is not supported for field results.slider. * [rhs] Incomplete RHS"
    ], {
      //ignoreLog
    });
  });

  describe("should handle if !group is not wrapped in #some (old format)", () => {
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
    }, [], {
      // ignoreLog
    });
  });

  describe("should handle some-in when it's not related to multiselect_contains op", () => {
    export_checks(configs.with_group_inside_struct, inits.with_select_any_in_in_some, "JsonLogic", {
      "query": "vehicles.cars.vendor IN (\"Ford\", \"Toyota\")",
      logic: inits.with_select_any_in_in_some,
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with !group", () => {

  describe("should handle ! in some (when group mode is some)", () => {
    export_checks(configs.with_group_some, inits.with_is_empty_in_some, "JsonLogic", {
      "logic": inits.with_is_empty_in_some
    });
  });

  describe("should handle is_empty in some (when bad subfield)", () => {
    export_checks(configs.with_group_some, inits.with_bad_subfield_in_group, "JsonLogic", {
      "logic": undefined
    }, [
      "No config for field results.bad-subfield",
      // validation
      "Root  >>  Empty query"
    ]);
  });

  describe("should handle is_empty in some (when group mode is struct)", () => {
    export_checks(configs.with_group_struct, inits.with_is_empty_in_some, "JsonLogic", {
      "logic": {
        "and": [{
          "!": { "var": "results.grade" }
        } ]
      }
    });
  });

  describe("should handle is_empty in some (when group mode is array)", () => {
    export_checks(configs.with_group_array, inits.with_is_empty_in_some, "JsonLogic", {
      "logic": inits.with_is_empty_in_some
    });

    export_checks(configs.with_group_array, inits.spel_with_is_empty_in_some, "SpEL", {
      "spel": inits.spel_with_is_empty_in_some
    });
  });

  describe("should handle select_not_any_in in some (when group mode is array)", () => {
    describe("reverseOperatorsForNot == true", () => {
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.with_select_not_any_in_in_some, "JsonLogic", {
          "logic": inits.with_select_not_any_in_in_some,
          "query": "SOME OF cars HAVE vendor NOT IN (\"Ford\", \"Toyota\")"
        });
      });
    });
  
    describe("reverseOperatorsForNot == false", () => {
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars], inits.with_select_not_any_in_in_some, "JsonLogic", {
          "logic": inits.with_select_not_any_in_in_some,
          "query": "SOME OF cars HAVE NOT (vendor IN (\"Ford\", \"Toyota\"))"
        });
      });

      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars], inits.spel_with_select_not_any_in_in_some, "SpEL", {
          "spel": inits.spel_with_select_not_any_in_in_some,
          "query": "SOME OF cars HAVE NOT (vendor IN (\"Ford\", \"Toyota\"))"
        });
      });
    });
  });

  describe("should handle not and in some (when group mode is array)", () => {
    describe("reverseOperatorsForNot == true", () => {
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.with_not_and_in_some, "JsonLogic", {
          "logic": inits.with_not_and_in_some,
          "query": "SOME OF cars HAVE NOT (!year && vendor NOT IN (\"Ford\", \"Toyota\"))"
        });
      });

      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.spel_with_not_and_in_some, "SpEL", {
          "spel": inits.spel_with_not_and_in_some,
          "query": "SOME OF cars HAVE NOT (!year && vendor NOT IN (\"Ford\", \"Toyota\"))"
        });
      });
    });
  });

  describe("should handle count w/o children (when group mode is array)", () => {
    export_checks(configs.with_group_array_cars, inits.with_group_count, "JsonLogic", {
      "logic": inits.with_group_count,
      "query": "COUNT OF cars == 2"
    });

    export_checks(configs.with_group_array_cars, inits.spel_with_group_count, "SpEL", {
      "spel": inits.spel_with_group_count,
      "query": "COUNT OF cars == 2",
      "mongo": {
        "$expr": {
          "$eq": [
            {
              "$size": {
                "$ifNull": ["$cars", []]
              }
            },
            2
          ]
        }
      }
    });
  });

  describe("should handle not and count w/o children (when group mode is array)", () => {
    describe("reverseOperatorsForNot == false", () => {
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars], inits.with_not_group_count, "JsonLogic", {
          // will convert not == to !=
          // because of line ` || isGroupArray && !having` (see `canRev = ..` and comment // !(count == 2)  ->  count != 2`
          "logic": inits.with_not_group_count_out,
          "query": "COUNT OF cars != 2"
        });
      });

      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars], inits.spel_with_not_group_count, "SpEL", {
          "spel": inits.spel_with_not_group_count,
          "query": "NOT (COUNT OF cars == 2)"
        });
      });
    });

    describe("reverseOperatorsForNot == true", () => {
      //will convert
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.with_not_group_count, "JsonLogic", {
          // will convert not == to !=
          "logic": inits.with_not_group_count_out,
          "query": "COUNT OF cars != 2"
        });
      });

      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.spel_with_not_group_count, "SpEL", {
          // will convert not == to !=
          "spel": inits.spel_with_not_group_count_out,
          "query": "COUNT OF cars != 2"
        });
      });
    });
  });

  describe("should handle not aggregate + not filter (when group mode is array)", () => {
    describe("reverseOperatorsForNot == false", () => {
      // will remain
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars], inits.with_not_group_not_filter, "JsonLogic", {
          "logic": inits.with_not_group_not_filter,
          "query": "NOT (COUNT OF cars WHERE NOT (vendor == \"Toyota\") == 6)"
        });
      });

      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars], inits.spel_with_not_group_not_filter, "SpEL", {
          "spel": inits.spel_with_not_group_not_filter,
          "query": "NOT (COUNT OF cars WHERE NOT (vendor == \"Toyota\") == 6)"
        });
      });
    });

    describe("reverseOperatorsForNot == true", () => {
      // will convert
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.with_not_group_not_filter, "JsonLogic", {
          // will convert `not ==` to `!=` inside group filter, but not for group conj
          "logic": inits.with_not_group_not_filter_out,
          "query": "NOT (COUNT OF cars WHERE vendor != \"Toyota\" == 6)"
        });
      });

      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.spel_with_not_group_not_filter, "SpEL", {
          // will convert both `not ==` to `!=`
          "spel": inits.spel_with_not_group_not_filter_out,
          "query": "COUNT OF cars WHERE vendor != \"Toyota\" != 6"
        });
      });
    });
  });

  describe("should handle not is_null in not some (when group mode is array)", () => {
    describe("reverseOperatorsForNot == false", () => {
      // should preserve
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars], inits.with_not_some_not_is_null, "JsonLogic", {
          "logic": inits.with_not_some_not_is_null,
          "query": "NOT (SOME OF cars HAVE NOT (!vendor))"
        });
      });
  
      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars], inits.spel_with_not_some_not_is_null, "SpEL", {
          "spel": inits.spel_with_not_some_not_is_null,
          "query": "NOT (SOME OF cars HAVE NOT (!vendor))"
        });
      });
    });

    describe("reverseOperatorsForNot == true", () => {
      // should convert
      describe("from JL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.with_not_some_not_is_null, "JsonLogic", {
          "logic": inits.with_not_some_not_is_null_out,
          "query": "NOT (SOME OF cars HAVE !!vendor)"
        });
      });
  
      describe("from SpEL", () => {
        export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.spel_with_not_some_not_is_null, "SpEL", {
          "spel": inits.spel_with_not_some_not_is_null_out,
          "query": "NOT (SOME OF cars HAVE !!vendor)"
        });
      });
    });
  });

  describe("should handle is_not_null in not some (when group mode is array)", () => {
    describe("reverseOperatorsForNot == false", () => {
      describe("from JL", () => {
        export_checks(configs.with_group_array_cars, inits.with_not_some_not_is_null_out, "JsonLogic", {
          "logic": inits.with_not_some_not_is_null_out,
          "query": "NOT (SOME OF cars HAVE !!vendor)"
        });
      });

      describe("from SpEL", () => {
        export_checks(configs.with_group_array_cars, inits.spel_with_not_some_not_is_null_out, "SpEL", {
          "spel": inits.spel_with_not_some_not_is_null_out,
          "query": "NOT (SOME OF cars HAVE !!vendor)"
        });
      });
    });
  });

  describe("should handle not contains in not some (when group mode is array)", () => {
    describe("reverseOperatorsForNot == false", () => {
      describe("from SpEL", () => {
        export_checks(configs.with_group_array, inits.spel_with_not_some_not_contains, "SpEL", {
          "spel": inits.spel_with_not_some_not_contains, // same
          "query": "NOT (SOME OF results HAVE NOT (grade Contains \"Toy\"))"
        });
      });
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
      },
      "spel": "results.?[score > 15 && user.?[name == 'denis'].size() > 0].size() > 0"
    });
  });

  describe("with one group rule, imported from spel", () => {
    export_checks(configs.with_nested_group, inits.spel_with_nested_group, "SpEL", {
      "spel": "results.?[score > 15 && user.?[name == 'denis'].size() > 0].size() > 0"
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
      },
      "spel": "(results.?[score == 11].size() > 0 && results.?[user.?[name == 'aaa'].size() > 0].size() > 0)"
    });
  });

  describe("with two separate group rules, imported from spel", () => {
    export_checks(configs.with_nested_group, inits.spel_two_rules_with_nested_group, "SpEL", {
      "spel": "(results.?[user.?[name == 'aaa'].size() > 0].size() > 0 && results.?[score == 11].size() > 0)"
    });
  });

  describe("with two nested groups - import with old format, export to new format", () => {
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
                      { "==": [ { "var": "name" },  "ddd" ] }
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
              { "==": [ { "var": "inside" },  33 ] }
            ]
          },
          {
            "some": [
              { "var": "results" },
              { "==": [ { "var": "score" },  2 ] }
            ]
          }
        ]
      }
    }, [
      "No config for field num"
    ]);
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
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group_1_1s, "JsonLogic", {
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

  describe("with 2 structs, 1 subfield per each", () => {
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group_1_1, "JsonLogic", {
      "query": "(results.user.name == \"denis\" && results.quiz.name == \"ethics\")",
      "queryHuman": "(Results.user.name = denis AND Results.quiz.name = ethics)",
      "sql": "(results.user.name = 'denis' AND results.quiz.name = 'ethics')",
      "mongo": {
        "results": {
          "$elemMatch": {
            "user.name": "denis",
            "quiz.name": "ethics"
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
                { "==": [  { "var": "quiz.name" },  "ethics"  ] }
              ] }
            ]
          }
        ]
      }
    });
  });

  describe("with 2 structs, 2 subfields per each", () => {
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group_2_2, "JsonLogic", {
      "query": "(results.user.name == \"denis\" && results.quiz.name == \"ethics\" && results.user.age >= 18 && results.quiz.max_score > 70)",
      "queryHuman": "(Results.user.name = denis AND Results.quiz.name = ethics AND Results.user.age >= 18 AND Results.quiz.max_score > 70)",
      "sql": "(results.user.name = 'denis' AND results.quiz.name = 'ethics' AND results.user.age >= 18 AND results.quiz.max_score > 70)",
      "mongo": {
        "results": {
          "$elemMatch": {
            "user.name": "denis",
            "quiz.name": "ethics",
            "user.age": { "$gte": 18 },
            "quiz.max_score": { "$gt": 70 }
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
                { "==": [  { "var": "quiz.name" },  "ethics"  ] },
                { ">=": [  { "var": "user.age" },  18  ] },
                { ">": [  { "var": "quiz.max_score" },  70  ] },
              ] }
            ]
          }
        ]
      }
    });
  });

  describe("with 2 structs, 1 subfield per each and 1 simple field", () => {
    export_checks(configs.with_struct_inside_group, inits.with_struct_inside_group_1_1_1s, "JsonLogic", {
      "query": "(results.user.age >= 18 && results.quiz.max_score > 70 && results.score < 70)",
      "queryHuman": "(Results.user.age >= 18 AND Results.quiz.max_score > 70 AND Results.score < 70)",
      "sql": "(results.user.age >= 18 AND results.quiz.max_score > 70 AND results.score < 70)",
      "mongo": {
        "results": {
          "$elemMatch": {
            "user.age": { "$gte": 18 },
            "quiz.max_score": { "$gt": 70 },
            "score": { "$lt": 70 }
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
                { ">": [  { "var": "quiz.max_score" },  70  ] },
                { "<": [  { "var": "score" },  70  ] }
              ] }
            ]
          }
        ]
      }
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with !group inside !struct", () => {

  describe("with 1 group, 1 subfield", () => {
    export_checks(configs.with_group_inside_struct, inits.with_group_inside_struct_1, "JsonLogic", {
      "sql": "vehicles.cars.vendor = 'Toyota'",
      "mongo": {
        "vehicles.cars": {
          "$elemMatch": {
            "vendor": "Toyota"
          }
        }
      },
      "logic": {
        "and": [
          {
            "some": [
              { "var": "vehicles.cars" },
              { "==": [  { "var": "vendor" }, "Toyota"  ] }
            ]
          }
        ]
      }
    });
  });

  describe("with 1 group, 2 subfields", () => {
    export_checks(configs.with_group_inside_struct, inits.with_group_inside_struct_2, "JsonLogic", {
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

  describe("insane nesting", () => {
    export_checks(configs.with_group_and_struct_deep, inits.with_group_and_struct_deep, "JsonLogic", {
      "logic": {
        "and": [
          {
            "some": [
              { "var": "vehicles.cars" },
              {
                "and": [
                  { "==": [ { "var": "manufactured.vendor" }, "Toyota" ] },
                  {
                    "some": [
                      { "var": "manufactured.type" },
                      {
                        "and": [
                          { "==": [ { "var": "segment" }, "C" ] },
                          { "==": [ { "var": "class" }, "Mid" ] }
                        ]
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

  describe("insane nesting in old format", () => {
    export_checks(configs.with_group_and_struct_deep, inits.with_group_and_struct_deep_old, "JsonLogic", {
      "logic": inits.with_group_and_struct_deep
    });
  });

  describe("insane nesting in old format 2", () => {
    export_checks(configs.with_group_and_struct_deep, inits.with_group_and_struct_deep_old2, "JsonLogic", {
      "logic": inits.with_group_and_struct_deep
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with !group mode array", () => {

  describe("export", () => {
    export_checks(configs.with_group_array_cars, inits.with_group_array_cars, "JsonLogic", {
      "query": "COUNT OF cars WHERE (vendor == \"Toyota\" && year >= 2010) > 2",
      "queryHuman": "COUNT OF Cars WHERE (vendor = Toyota AND year >= 2010) > 2",
      "sql": [
        "(cars.vendor = 'Toyota' AND cars.year >= 2010)",
        [
          "Aggregation is not supported for cars"
        ]
      ],
      "mongo": {
        "$expr": {
          "$gt": [
            {
              "$size": {
                "$ifNull": [
                  {
                    "$filter": {
                      "input": "$cars",
                      "as": "el",
                      "cond": {
                        "$and": [
                          {
                            "$eq": [
                              "$$el.vendor",
                              "Toyota"
                            ]
                          },
                          {
                            "$gte": [
                              "$$el.year",
                              2010
                            ]
                          }
                        ]
                      }
                    }
                  },
                  []
                ]
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

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with dot but without !struct", () => {

  describe("should handle dot notation when importing from JsonLogic", () => {
    export_checks(configs.with_dot_in_field, inits.with_dot_in_field, "JsonLogic", {
      "logic": inits.with_dot_in_field,
      "spel": inits.spel_with_dot_in_field,
    });
  });

  describe("should handle dot notation when importing from SpEL", () => {
    export_checks(configs.with_dot_in_field, inits.spel_with_dot_in_field, "SpEL", {
      "logic": inits.with_dot_in_field,
      "spel": inits.spel_with_dot_in_field,
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////
