import moment from "moment";
import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb_ant } from "./utils";


describe("antdesign widgets render", () => {

  it("should render select by default", () => {
    with_qb_ant(configs.with_struct, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-select-selection-item").at(0).text()).to.equal("user.info.firstName");
    });
  });

  it("should render cascader", () => {
    with_qb_ant(configs.with_cascader, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-cascader-picker-label").text()).to.equal("User / info / firstName");
    });
  });

  it("should render tree select", () => {
    with_qb_ant(configs.with_tree_select, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-select.ant-tree-select")).to.have.length(1);
      expect(qb.find(".ant-select-selection-item").at(0).text()).to.equal("firstName");
    });
  });

  it("should render tree dropdown", () => {
    with_qb_ant(configs.with_dropdown, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-dropdown-trigger span").at(0).text().trim()).to.equal("firstName");
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

describe("antdesign widgets interactions", () => {
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
    with_qb_ant(configs.with_all_types, inits.with_treeselect, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
      expect_checks({
        "query": "selecttree == \"2\"",
        "queryHuman": "Color (tree) == \"Red\"",
        "sql": "selecttree = '2'",
        "mongo": {
          "selecttree": "2"
        },
        "logic": {
          "and": [
            { "==": [ { "var": "selecttree" }, "2" ] }
          ]
        }
      });
      
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
    with_qb_ant(configs.with_all_types, inits.with_multiselecttree, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
      expect_checks({
        "query": "multiselecttree == [\"2\", \"5\"]",
        "queryHuman": "Colors (tree) == [\"Red\", \"Green\"]",
        "sql": "multiselecttree = '2,5'",
        "mongo": {
          "multiselecttree": [ "2", "5" ]
        },
        "logic": {
          "and": [
            { "all": [
              { "var": "multiselecttree" },
              { "in": [ { "var": "" }, [ "2", "5" ] ] }
            ] }
          ]
        }
      });

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

  it("change range slider value", () => {
    with_qb_ant(configs.with_all_types, inits.with_range_slider, "JsonLogic", (qb, onChange, {expect_jlogic, expect_checks}) => {
      expect_checks({
        "query": "slider >= 18 && slider <= 42",
        "queryHuman": "Slider >= 18 AND Slider <= 42",
        "sql": "slider BETWEEN 18 AND 42",
        "mongo": {
          "slider": {
            "$gte": 18,
            "$lte": 42
          }
        },
        "logic": {
          "and": [
            { "<=": [ 18, { "var": "slider" }, 42 ] }
          ]
        }
      });

      qb
        .find("RangeWidget")
        .instance()
        .handleChange([19, 42]);
      expect_jlogic([null,
        { "and": [{ "<=": [ 19, { "var": "slider" }, 42 ] }] }
      ]);
    });
  });

});
