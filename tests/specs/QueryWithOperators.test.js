import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { export_checks } from "../support/utils";


describe("query with ops", () => {
  describe("export", () => {
    export_checks(configs.with_all_types, inits.with_ops, "JsonLogic", {
      "query": "(num != 2 && str Like \"abc\" && str Not Like \"xyz\" && num >= 1 && num <= 2 && !(num >= 3 && num <= 4) && !num && color IN (\"yellow\") && color NOT IN (\"green\") && multicolor != [\"yellow\"])",
      "queryHuman": "(Number != 2 AND String Like abc AND String Not Like xyz AND Number BETWEEN 1 AND 2 AND NOT (Number BETWEEN 3 AND 4) AND Number IS NULL AND Color IN (Yellow) AND Color NOT IN (Green) AND Colors != [Yellow])",
      "sql": "(num <> 2 AND str LIKE '%abc%' AND str NOT LIKE '%xyz%' AND num BETWEEN 1 AND 2 AND num NOT BETWEEN 3 AND 4 AND num IS NULL AND color IN ('yellow') AND color NOT IN ('green') AND multicolor != 'yellow')",
      "mongo": {
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
      }
    });
  });
});
