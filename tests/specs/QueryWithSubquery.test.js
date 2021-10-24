import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_skins, export_checks } from "../support/utils";


describe("query with subquery and datetime types", () => {

  describe("import", () => {
    it("should work with simple value of JsonLogic format", () => {
      with_qb_skins(configs.with_date_and_time, inits.with_date_and_time, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.with_date_and_time, inits.with_date_and_time, "JsonLogic", {
      "query": "(datetime == \"2020-05-18 21:50:01\" || (date == \"2020-05-18\" && time == \"00:50:00\"))",
      "queryHuman": "(DateTime = 18.05.2020 21:50 OR (Date = 18.05.2020 AND Time = 00:50))",
      "sql": "(datetime = '2020-05-18 21:50:01.000' OR (date = '2020-05-18' AND time = '00:50:00'))",
      "mongo": {
        "$or": [
          {
            "datetime": "2020-05-18T21:50:01.000Z"
          }, {
            "date": "2020-05-18T00:00:00.000Z",
            "time": 3000
          }
        ]
      },
      "logic": {
        "or": [
          {
            "==": [ { "var": "datetime" },  "2020-05-18T21:50:01.000Z" ]
          }, {
            "and": [
              {
                "==": [ { "var": "date" },  "2020-05-18T00:00:00.000Z" ]
              }, {
                "==": [ { "var": "time" },  3000 ]
              }
            ]
          }
        ]
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////

describe("query with subquery and select types", () => {

  describe("import", () => {
    it("should work with value of JsonLogic format", () => {
      with_qb_skins(configs.with_select, inits.with_select_and_multiselect, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.with_select, inits.with_select_and_multiselect, "JsonLogic", {
      "query": "(color == \"yellow\" && multicolor == [\"yellow\", \"green\"])",
      "queryHuman": "(Color = Yellow AND Colors = [Yellow, Green])",
      "sql": "(color = 'yellow' AND multicolor = 'yellow,green')",
      "mongo": {
        "color": "yellow",
        "multicolor": [ "yellow", "green" ]
      },
      "logic": {
        "and": [
          {
            "==": [ { "var": "color" },  "yellow" ]
          }, {
            "all": [
              { "var": "multicolor" },
              { "in": [
                { "var": "" },  [ "yellow", "green" ]
              ] }
            ]
          }
        ]
      }
    });
  });
});
