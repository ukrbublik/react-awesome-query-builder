import moment from "moment";
import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb_ant } from "./utils";


describe("antdesign widgets", () => {
  it("change date value", () => {
    with_qb_ant(configs.with_all_types, inits.with_date, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("DateWidget")
        .instance()
        .handleChange(moment("2020-05-05"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "date" }, "2020-05-05T00:00:00.000Z" ] }] }
      ]);
    });
  });

  it("change select value", () => {
    with_qb_ant(configs.with_all_types, inits.with_select, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("SelectWidget")
        .instance()
        .handleChange("green");
      expect_jlogic([null,
        { "and": [{  "==": [ { "var": "color" }, "green" ]  }] }
      ]);
    });
  });

  it("change multiselect value", () => {
    with_qb_ant(configs.with_all_types, inits.with_multiselect, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("MultiSelectWidget")
        .instance()
        .handleChange(["orange"]);
      expect_jlogic([null, {
        "and": [
          {
            "all": [
              { "var": "multicolor" },
              { "in": [ { "var": "" }, [ "orange" ] ] }
            ]
          }
        ]
      }]);
    });
  });

  it("change treeselect value", () => {
    with_qb_ant(configs.with_all_types, inits.with_treeselect, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("TreeSelectWidget")
        .instance()
        .handleChange("5");
      expect_jlogic([null,
        { "and": [{  "==": [ { "var": "selecttree" }, "5" ]  }] }
      ]);
    });
  });

  it("change multitreeselect value", () => {
    with_qb_ant(configs.with_all_types, inits.with_multiselecttree, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("TreeSelectWidget")
        .instance()
        .handleChange(["3"]);
      expect_jlogic([null, {
        "and": [
          {
            "all": [
              { "var": "multiselecttree" },
              { "in": [ { "var": "" }, [ "3" ] ] }
            ]
          }
        ]
      }]);
    });
  });

  it("change time value", () => {
    with_qb_ant(configs.with_all_types, inits.with_time, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("TimeWidget")
        .instance()
        .handleChange(moment("0001-01-01 10:30"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "time" }, 60*60*10+60*30 ] }] }
      ]);
    });
  });

  it("change datetime value", () => {
    with_qb_ant(configs.with_all_types, inits.with_datetime, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("DateTimeWidget")
        .instance()
        .handleChange(moment("2020-05-05 10:30"));
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "datetime" }, "2020-05-05T10:30:00.000Z" ] }] }
      ]);
    });
  });

  it("change slider value", () => {
    with_qb_ant(configs.with_all_types, inits.with_slider, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("SliderWidget")
        .instance()
        .handleChange(12);
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "slider" }, 12 ] }] }
      ]);
    });
  });

  it("change bool value", () => {
    with_qb_ant(configs.with_all_types, inits.with_bool, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find("BooleanWidget")
        .instance()
        .handleChange(false);
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "stock" }, false ] }] }
      ]);
    });
  });

  //todo: range
});
