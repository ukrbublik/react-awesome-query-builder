import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { export_checks } from "../support/utils";

import { BasicConfig, Utils } from "react-awesome-query-builder";

describe("query with ops", () => {
  describe("export", () => {
    export_checks(configs.with_all_types, inits.with_ops, "JsonLogic", {
      "spel": "(num != 2 && str.contains('abc') && !(str.contains('xyz')) && num >= 1 && num <= 2 && (num < 3 || num > 4) && num == null && {'yellow'}.?[true].contains(color) && !({'green'}.?[true].contains(color)) && !(multicolor.equals({'yellow'})))",
      "query": "(num != 2 && str Contains \"abc\" && str Not Contains \"xyz\" && num >= 1 && num <= 2 && (num < 3 || num > 4) && !num && color IN (\"yellow\") && color NOT IN (\"green\") && multicolor != [\"yellow\"])",
      "queryHuman": "(Number != 2 AND String Contains abc AND String Not Contains xyz AND Number BETWEEN 1 AND 2 AND Number NOT BETWEEN 3 AND 4 AND Number IS NULL AND Color IN (Yellow) AND Color NOT IN (Green) AND Colors != [Yellow])",
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

  describe("round trip", () => {
    it("should work", () => {
      const config = configs.with_all_types(BasicConfig);
      const input = { "and": [{ "==": [{ "var": "color" }, null] }] };
      const [tree, errs] = Utils._loadFromJsonLogic(input, config, true);
      expect(errs).to.deep.equal([]);
      const output = Utils.jsonLogicFormat(tree, config);
      expect(output.logic).to.deep.equal(input);
    });
  })
});
