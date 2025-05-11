import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { export_checks } from "../support/utils";
import { Utils } from "@react-awesome-query-builder/core";
import { BasicConfig } from "@react-awesome-query-builder/ui";
import { expect } from "chai";


describe("query with ops", () => {
  describe("reverseOperatorsForNot == true", () => {
    export_checks([configs.with_all_types, configs.with_reverse_operators], inits.with_ops, "JsonLogic", {
      "spel": "(text == 'Long\nText' && num != 2 && str.contains('abc') && !(str.contains('xyz')) && (num >= 1 && num <= 2) && (num < 3 || num > 4) && num == null && {'yellow'}.?[true].contains(color) && !({'green'}.?[true].contains(color)) && !(multicolor.equals({'yellow'})))",
      "query": "(text == \"Long\\nText\" && num != 2 && str Contains \"abc\" && str Not Contains \"xyz\" && num >= 1 && num <= 2 && (num < 3 || num > 4) && !num && color IN (\"yellow\") && color NOT IN (\"green\") && multicolor != [\"yellow\"])",
      "queryHuman": "(Textarea = Long\nText AND Number != 2 AND String Contains abc AND String Not Contains xyz AND Number BETWEEN 1 AND 2 AND Number NOT BETWEEN 3 AND 4 AND Number IS NULL AND Color IN (Yellow) AND Color NOT IN (Green) AND Colors != [Yellow])",
      "sql": "(text = 'Long\\nText' AND num <> 2 AND str LIKE '%abc%' AND str NOT LIKE '%xyz%' AND num BETWEEN 1 AND 2 AND num NOT BETWEEN 3 AND 4 AND num IS NULL AND color IN ('yellow') AND color NOT IN ('green') AND multicolor != 'yellow')",
      "mongo": {
        "text": "Long\nText",
        "num": {
          "$ne": 2,
          "$gte": 1,
          "$lte": 2,
          "$not": {
            "$gte": 3,
            "$lte": 4
          },
          "$eq": null
        },
        "str": {
          "$regex": "abc",
          "$not": {
            "$regex": "xyz"
          }
        },
        "color": {
          "$in": [ "yellow" ],
          "$nin": [ "green" ]
        },
        "multicolor": {
          "$ne": [ "yellow" ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [ { "var": "text" },  "Long\nText" ]
          }, {
            "!=": [ { "var": "num" },  2 ]
          }, {
            "in": [ "abc",  { "var": "str" } ]
          }, {
            "!": {
              "in": [
                "xyz",
                { "var": "str" }
              ]
            }
          }, {
            "<=": [  1,  { "var": "num" },  2  ]
          }, {
            "!": {  "<=": [ 3,  { "var": "num" },  4 ]  }
          }, {
            "==": [ { "var": "num" }, null ]
          }, {
            "in": [
              { "var": "color" },  [ "yellow" ]
            ]
          }, {
            "!": {
              "in": [
                { "var": "color" },  [ "green" ]
              ]
            }
          }, {
            "!": {
              "all": [
                { "var": "multicolor" },
                { "in": [ { "var": "" },  [ "yellow" ] ] }
              ]
            }
          }
        ]
      },
      "elasticSearch": {
        "bool": {
          "must": [
            {
              "term": {
                "text": "Long\nText"
              }
            },
            {
              "bool": {
                "must_not": {
                  "term": {
                    "num": 2
                  }
                }
              }
            },
            {
              "regexp": {
                "str": {
                  "value": "abc"
                }
              }
            },
            {
              "bool": {
                "must_not": {
                  "regexp": {
                    "str": {
                      "value": "xyz"
                    }
                  }
                }
              }
            },
            {
              "range": {
                "num": {
                  "gte": "1",
                  "lte": "2"
                }
              }
            },
            {
              "bool": {
                "must_not": {
                  "range": {
                    "num": {
                      "gte": "3",
                      "lte": "4"
                    }
                  }
                }
              }
            },
            {
              "bool": {
                "must_not": {
                  "exists": {
                    "field": "num"
                  }
                }
              }
            },
            {
              "term": {
                "color": "yellow"
              }
            },
            {
              "bool": {
                "must_not": {
                  "term": {
                    "color": "green"
                  }
                }
              }
            },
            {
              "bool": {
                "must_not": {
                  "term": {
                    "multicolor": "yellow"
                  }
                }
              }
            }
          ]
        }
      }
    });
  });

  describe("reverseOperatorsForNot == false", () => {
    export_checks([configs.with_all_types], inits.with_ops_and_negation_groups, "JsonLogic", {
      "spel": "(text == 'Long\nText' && num != 2 && str.contains('abc') && !(str.contains('xyz')) && (num >= 1 && num <= 2) && !(num >= 3 && num <= 4) && num == null && {'yellow'}.?[true].contains(color) && !({'green'}.?[true].contains(color)) && !(multicolor.equals({'yellow'})))",
      "query": "(text == \"Long\\nText\" && num != 2 && str Contains \"abc\" && NOT (str Contains \"xyz\") && num >= 1 && num <= 2 && NOT (num >= 3 && num <= 4) && !num && color IN (\"yellow\") && NOT (color IN (\"green\")) && NOT (multicolor == [\"yellow\"]))",
      "queryHuman": "(Textarea = Long\nText AND Number != 2 AND String Contains abc AND NOT (String Contains xyz) AND Number BETWEEN 1 AND 2 AND NOT (Number BETWEEN 3 AND 4) AND Number IS NULL AND Color IN (Yellow) AND NOT (Color IN (Green)) AND NOT (Colors = [Yellow]))",
      "sql": "(text = 'Long\\nText' AND num <> 2 AND str LIKE '%abc%' AND NOT (str LIKE '%xyz%') AND num BETWEEN 1 AND 2 AND NOT (num BETWEEN 3 AND 4) AND num IS NULL AND color IN ('yellow') AND NOT (color IN ('green')) AND NOT (multicolor = 'yellow'))",
      "mongo": {
        "$and": [
          {
            "text": "Long\nText"
          },
          {
            "num": {
              "$ne": 2
            }
          },
          {
            "str": {
              "$regex": "abc"
            }
          },
          {
            "$nor": [{
              "str": {
                "$regex": "xyz"
              }
            }]
          },
          {
            "num": {
              "$gte": 1,
              "$lte": 2
            }
          },
          {
            "$nor": [{
              "num": {
                "$gte": 3,
                "$lte": 4
              }
            }]
          },
          {
            "num": null
          },
          {
            "color": {
              "$in": [
                "yellow"
              ]
            }
          },
          {
            "$nor": [{
              "color": {
                "$in": [
                  "green"
                ]
              }
            }]
          },
          {
            "$nor": [{
              "multicolor": [
                "yellow"
              ]
            }]
          }
        ]
      },
      "logic": {
        "and": [
          {
            "==": [ { "var": "text" },  "Long\nText" ]
          }, {
            "!=": [ { "var": "num" },  2 ]
          }, {
            "in": [ "abc",  { "var": "str" } ]
          }, {
            "!": {
              "and": [
                {
                  "in": [ "xyz", { "var": "str" } ]
                }
              ]
            }
          }, {
            "<=": [  1,  { "var": "num" },  2  ]
          }, {
            "!": {
              "and": [
                {
                  "<=": [  3,  { "var": "num" },  4  ]
                }
              ]
            }
          }, {
            "==": [ { "var": "num" }, null ]
          }, {
            "in": [
              { "var": "color" },
              [ "yellow" ]
            ]
          }, {
            "!": {
              "and": [
                {
                  "in": [
                    { "var": "color" },  [ "green" ]
                  ]
                }
              ]
            }
          }, {
            "!": {
              "and": [
                {
                  "all": [
                    { "var": "multicolor" },
                    { "in": [ { "var": "" },  [ "yellow" ] ] }
                  ]
                }
              ]
            }
          }
        ]
      },
      "elasticSearch": {
        "bool": {
          "must": [
            {
              "term": {
                "text": "Long\nText"
              }
            },
            {
              "bool": {
                "must_not": {
                  "term": {
                    "num": 2
                  }
                }
              }
            },
            {
              "regexp": {
                "str": {
                  "value": "abc"
                }
              }
            },
            {
              "bool": {
                "must_not": [
                  {
                    "regexp": {
                      "str": {
                        "value": "xyz"
                      }
                    }
                  }
                ]
              }
            },
            {
              "range": {
                "num": {
                  "gte": "1",
                  "lte": "2"
                }
              }
            },
            {
              "bool": {
                "must_not": [
                  {
                    "range": {
                      "num": {
                        "gte": "3",
                        "lte": "4"
                      }
                    }
                  }
                ]
              }
            },
            {
              "bool": {
                "must_not": {
                  "exists": {
                    "field": "num"
                  }
                }
              }
            },
            {
              "term": {
                "color": "yellow"
              }
            },
            {
              "bool": {
                "must_not": [
                  {
                    "term": {
                      "color": "green"
                    }
                  }
                ]
              }
            },
            {
              "bool": {
                "must_not": [
                  {
                    "term": {
                      "multicolor": "yellow"
                    }
                  }
                ]
              }
            }
          ]
        }
      }    
    });
  });

  describe("canShortMongoQuery == false", () => {
    export_checks([configs.with_all_types, configs.without_short_mongo_query], inits.with_ops_and_negation_groups, "JsonLogic", {
      "mongo": {
        "$and": [
          {
            "text": "Long\nText"
          },
          {
            "num": {
              "$ne": 2
            }
          },
          {
            "str": {
              "$regex": "abc"
            }
          },
          {
            "$nor": [{
              "str": {
                "$regex": "xyz"
              }
            }]
          },
          {
            "num": {
              "$gte": 1,
              "$lte": 2
            }
          },
          {
            "$nor": [{
              "num": {
                "$gte": 3,
                "$lte": 4
              }
            }]
          },
          {
            "num": null
          },
          {
            "color": {
              "$in": [
                "yellow"
              ]
            }
          },
          {
            "$nor": [{
              "color": {
                "$in": [
                  "green"
                ]
              }
            }]
          },
          {
            "$nor": [{
              "multicolor": [
                "yellow"
              ]
            }]
          }
        ]
      },
    });
  });

  describe("round trip", () => {
    it("should work", () => {
      const config = configs.with_all_types(BasicConfig);
      const input = { "and": [{ "==": [{ "var": "color" }, null] }] };
      const [tree, errs] = Utils._loadFromJsonLogic(input, config, true);
      expect(errs).to.deep.equal([]);
      const output = Utils.jsonLogicFormat(tree, config);
      expect(output.logic).to.deep.equal(input);
    });
  });

  describe("@sql operators", () => {
    export_checks([configs.with_all_types], inits.with_ops_sql, "SQL", {
      "sql": inits.with_ops_sql,
    });
  });

  describe("@sql LIKE escape", () => {
    export_checks([configs.with_all_types], "str LIKE '%h\\%\\_h%'", "SQL", {
      "sql": "str LIKE '%h\\%\\_h%'",
      "spel": "str.contains('h%_h')"
    });
  });

  describe("@sql LIKE escape for BigQuery", () => {
    export_checks([configs.with_all_types, configs.with_sql_dialect("BigQuery")], "str LIKE '%h\\\\%\\\\_h%'", "SQL", {
      "sql": "str LIKE '%h\\\\%\\\\_h%'",
      "spel": "str.contains('h%_h')"
    });
  });

  describe("@spel multiselect_contains import works", () => {
    export_checks([configs.with_all_types], "T(CollectionUtils).containsAny(multicolor, {'yellow'})", "SpEL", {
      spel: "T(CollectionUtils).containsAny(multicolor, {'yellow'})",
    });
  });

  describe("@spel multiselect_contains import is backward compatible", () => {
    export_checks([configs.with_all_types], "CollectionUtils.containsAny(multicolor, {'yellow'})", "SpEL", {
      spel: "T(CollectionUtils).containsAny(multicolor, {'yellow'})",
    });
  });
});

describe("query with exclamation operators", () => {
  describe("reverseOperatorsForNot == false", () => {
    export_checks([configs.with_all_types], inits.exclamation_operators_and_negation_groups, "JsonLogic", {
      "logic": inits.exclamation_operators_and_negation_groups
    });
  });
  describe("reverseOperatorsForNot == true", () => {
    export_checks([configs.with_all_types, configs.with_reverse_operators], inits.exclamation_operators_and_negation_groups, "JsonLogic", {
      "logic": inits.exclamation_operators_and_negation_groups_reversed
    });
  });
});

describe("query with exclamation operators in array group", () => {
  describe("reverseOperatorsForNot == false", () => {
    export_checks([configs.with_group_array_cars], inits.with_not_and_neg_in_some, "JsonLogic", {
      "query": "(SOME OF cars HAVE vendor IN (\"Ford\", \"Toyota\")"
        + " && SOME OF cars HAVE NOT (year >= 1995 && year <= 2005)"
        + " && SOME OF cars HAVE model Not Contains \"ggg\""
        + " && SOME OF cars HAVE NOT (model Not Contains \"ggg\")"
        + " && SOME OF cars HAVE NOT (cars.model Not Contains \"ggg\")" // todo: fix "cars.model" !!!
        + " && ALL OF cars HAVE vendor NOT IN (\"Ford\", \"Toyota\")"
        + " && ALL OF cars HAVE NOT (vendor NOT IN (\"Ford\", \"Toyota\"))"
        + " && SOME OF cars HAVE NOT (vendor NOT IN (\"Ford\", \"Toyota\"))"
        + " && SOME OF cars HAVE NOT (vendor NOT IN (\"Ford\", \"Toyota\"))"
        + " && SOME OF cars HAVE vendor NOT IN (\"Ford\", \"Toyota\"))",
      "logic": {
        "and": [
          { "some": [
            { "var": "cars" },
            { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] }
          ] },
          { "some": [
            { "var": "cars" },
            { "!": { "and": [ { "<=": [ 1995, { "var": "year" }, 2005 ] } ] } }
          ] },
          { "some": [
            { "var": "cars" },
            { "!": { "in": [ "ggg", { "var": "model" } ] } }
          ] },
          { "some": [
            { "var": "cars" },
            { "!": { "!": { "in": [ "ggg", { "var": "model" } ] } } }
          ] },
          { "some": [
            { "var": "cars" },
            { "!": { "!": { "in": [ "ggg", { "var": "model" } ] } } }
          ] },
          { "all": [
            { "var": "cars" },
            { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } }
          ] },
          { "all": [
            { "var": "cars" },
            { "!": { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } } }
          ] },
          { "some": [
            { "var": "cars" },
            { "!": { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } } }
          ] },
          { "some": [
            { "var": "cars" },
            { "!": { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } } }
          ] },
          { "some": [
            { "var": "cars" },
            { "!": { "in": [ { "var": "vendor" }, [ "Ford", "Toyota" ] ] } }
          ] }
        ]
      },
      "mongo": {
        "$and": [
          // some (vendor)
          {
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
                            "$in": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (year)
          {
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
                            "$not": {
                              "$and": [
                                {
                                  "$gte": [
                                    "$$el.year",
                                    1995
                                  ]
                                },
                                {
                                  "$lte": [
                                    "$$el.year",
                                    2005
                                  ]
                                }
                              ]
                            }
                          },
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (model)
          {
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
                            "$not": {
                              "$regex": [
                                "$$el.model",
                                "ggg"
                              ]
                            }
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (model)
          {
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
                            "$not": {
                              "$not": {
                                "$regex": [
                                  "$$el.model",
                                  "ggg"
                                ]
                              }
                            }
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (model)
          {
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
                            "$not": {
                              "$not": {
                                "$regex": [
                                  "$$el.model",
                                  "ggg"
                                ]
                              }
                            }
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // all (vendor)
          {
            "$expr": {
              "$eq": [
                {
                  "$size": {
                    "$ifNull": [
                      {
                        "$filter": {
                          "input": "$cars",
                          "as": "el",
                          "cond": {
                            "$nin": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                {
                  "$size": {
                    "$ifNull": [
                      "$cars",
                      []
                    ]
                  }
                }
              ]
            }
          },
          // all (vendor)
          {
            "$expr": {
              "$eq": [
                {
                  "$size": {
                    "$ifNull": [
                      {
                        "$filter": {
                          "input": "$cars",
                          "as": "el",
                          "cond": {
                            "$not": {
                              "$nin": [
                                "$$el.vendor",
                                [
                                  "Ford",
                                  "Toyota"
                                ]
                              ]
                            }
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                {
                  "$size": {
                    "$ifNull": [
                      "$cars",
                      []
                    ]
                  }
                }
              ]
            }
          },
          // some (vendor)
          {
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
                            "$not": {
                              "$nin": [
                                "$$el.vendor",
                                [
                                  "Ford",
                                  "Toyota"
                                ]
                              ]
                            }
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (vendor)
          {
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
                            "$not": {
                              "$nin": [
                                "$$el.vendor",
                                [
                                  "Ford",
                                  "Toyota"
                                ]
                              ]
                            }
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (vendor)
          {
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
                            "$nin": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          }
        ]
      }
    });
  });
  describe("reverseOperatorsForNot == true", () => {
    export_checks([configs.with_group_array_cars, configs.with_reverse_operators], inits.with_not_and_neg_in_some, "JsonLogic", {
      "query": "(SOME OF cars HAVE vendor IN (\"Ford\", \"Toyota\")"
      + " && SOME OF cars HAVE (year < 1995 || year > 2005)"
      + " && SOME OF cars HAVE model Not Contains \"ggg\""
      + " && SOME OF cars HAVE model Contains \"ggg\""
      + " && SOME OF cars HAVE NOT (cars.model Not Contains \"ggg\")" // todo: fix "cars.model" !!!
      + " && ALL OF cars HAVE vendor NOT IN (\"Ford\", \"Toyota\")"
      + " && ALL OF cars HAVE vendor IN (\"Ford\", \"Toyota\")"
      + " && SOME OF cars HAVE vendor IN (\"Ford\", \"Toyota\")"
      + " && SOME OF cars HAVE vendor IN (\"Ford\", \"Toyota\")"
      + " && SOME OF cars HAVE vendor NOT IN (\"Ford\", \"Toyota\"))",
      "logic": inits.with_not_and_neg_in_some_reversed,
      "mongo": {
        "$and": [
          // some (vendor)
          {
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
                            "$in": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (year)
          {
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
                            "$not": {
                              "$and": [
                                {
                                  "$gte": [
                                    "$$el.year",
                                    1995
                                  ]
                                },
                                {
                                  "$lte": [
                                    "$$el.year",
                                    2005
                                  ]
                                }
                              ]
                            }
                          },
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (model)
          {
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
                            "$not": {
                              "$regex": [
                                "$$el.model",
                                "ggg"
                              ]
                            }
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (model)
          {
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
                            "$regex": [
                              "$$el.model",
                              "ggg"
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (model)
          {
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
                            "$regex": [
                              "$$el.model",
                              "ggg"
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // all (vendor)
          {
            "$expr": {
              "$eq": [
                {
                  "$size": {
                    "$ifNull": [
                      {
                        "$filter": {
                          "input": "$cars",
                          "as": "el",
                          "cond": {
                            "$nin": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                {
                  "$size": {
                    "$ifNull": [
                      "$cars",
                      []
                    ]
                  }
                }
              ]
            }
          },
          // all (vendor)
          {
            "$expr": {
              "$eq": [
                {
                  "$size": {
                    "$ifNull": [
                      {
                        "$filter": {
                          "input": "$cars",
                          "as": "el",
                          "cond": {
                            "$in": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                {
                  "$size": {
                    "$ifNull": [
                      "$cars",
                      []
                    ]
                  }
                }
              ]
            }
          },
          // some (vendor)
          {
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
                            "$in": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (vendor)
          {
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
                            "$in": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          },
          // some (vendor)
          {
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
                            "$nin": [
                              "$$el.vendor",
                              [
                                "Ford",
                                "Toyota"
                              ]
                            ]
                          }
                        }
                      },
                      []
                    ]
                  }
                },
                0
              ]
            }
          }
        ]
      }
    });
  });
});


describe("dual meaning ops", () => {
  describe("(JL) in", () => {
    export_checks([configs.with_all_types, configs.with_allow_any_src_for_all_ops], inits.with_in_ops, "JsonLogic", {
      "logic": inits.with_in_ops,
      "spel": inits.with_in_ops_spel
    });
  });

  describe("(SpEL) contains", () => {
    export_checks([configs.with_all_types, configs.with_allow_any_src_for_all_ops], inits.with_in_ops_spel, "SpEL", {
      "logic": inits.with_in_ops,
      "spel": inits.with_in_ops_spel
    });
  });
});
