//import React from "react";
//import { mount, shallow } from "enzyme";
import sinon from "sinon";
import moment from "moment";

import {
  Query, Builder, Utils, BasicConfig,
} from "react-awesome-query-builder";
const {
  getTree, isValidTree,
} = Utils;
import AntdConfig from "react-awesome-query-builder/config/antd";

import * as configs from "./configs";
import * as inits from "./inits";
import {
  with_qb, with_qb_ant, with_qb_skins, empty_value, export_checks, simulate_drag_n_drop, load_tree,
  // warning: don't put `export_checks` inside `it`
} from "./utils";


//////////////////////////////////////////////////////////////////////////////////////////
// library

describe("library", () => {
  it("should be imported correctly", () => {
    expect(Query).to.exist;
    expect(Builder).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// basic query

describe("basic query", () => {

  describe("import", () => {
    it("should work with empty value", () => {
      with_qb(configs.simple_with_number, empty_value, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    it("should work with simple value", () => {
      with_qb(configs.simple_with_number, inits.tree_with_number, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    it("should work with simple value of JsonLogic format", () => {
      with_qb(configs.simple_with_number, inits.with_number, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.simple_with_number, inits.tree_with_number, "default", {
      query: "num == 2",
      queryHuman: "Number == 2",
      sql: "num = 2",
      mongo: {num: 2},
      logic: {
        and: [
          { "==": [{ "var": "num" }, 2] }
        ]
      },
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// change props

describe("change props", () => {
  it("change tree via props triggers onChange", () => {
    with_qb(configs.simple_with_2_numbers, inits.with_num_and_num2, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb.setProps({
        value: load_tree("JsonLogic", inits.with_number, configs.simple_with_2_numbers(BasicConfig))
      });
      expect_jlogic([null, inits.with_number]);
      expect(onChange.getCall(1)).to.equal(null);
    });
  });

  it("change config via props triggers onChange", () => {
    with_qb(configs.simple_with_2_numbers, inits.with_num_and_num2, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const config_without_num2 = configs.simple_with_number(BasicConfig);
      qb.setProps({
        ...config_without_num2,
      });
      expect_jlogic([null, inits.with_number]);
      expect(onChange.getCall(1)).to.equal(null);
    });
  });

  describe("load tree with another config", () => {
    with_qb(configs.simple_with_number, inits.with_num_and_num2, "JsonLogic", (qb, onChange, {export_checks}) => {
      export_checks({
        logic: inits.with_number
      });
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// query with conjunction

describe("query with conjunction", () => {
  describe("import", () => {
    it("should work with simple value of JsonLogic format", () => {
      with_qb_skins(configs.with_number_and_string, inits.with_number_and_string, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.with_number_and_string, inits.with_number_and_string, "JsonLogic", {
      query: '(num < 2 || login == "ukrbublik")',
      queryHuman: '(Number < 2 OR login == "ukrbublik")',
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
    });
  });

  describe("export with NOT", () => {
    export_checks(configs.with_number_and_string, inits.with_not_number_and_string, "JsonLogic", {
      "query": "NOT (num < 2 || login == \"ukrbublik\")",
      "queryHuman": "NOT (Number < 2 OR login == \"ukrbublik\")",
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
      }
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////
// query with subquery and datetime types

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
      "queryHuman": "(DateTime == \"18.05.2020 21:50\" OR (Date == \"18.05.2020\" AND Time == \"00:50\"))",
      "sql": "(datetime = '2020-05-18 21:50:01.000' OR (date = '2020-05-18' AND time = '00:50:00'))",
      "mongo": {
        "$or": [
          {
            "datetime": "2020-05-18 21:50:01"
          },
          {
            "date": "2020-05-18",
            "time": "00:50:00"
          }
        ]
      },
      "logic": {
        "or": [
          {
            "==": [
              {
                "var": "datetime"
              },
              "2020-05-18T21:50:01.000Z"
            ]
          },
          {
            "and": [
              {
                "==": [
                  {
                    "var": "date"
                  },
                  "2020-05-18T00:00:00.000Z"
                ]
              },
              {
                "==": [
                  {
                    "var": "time"
                  },
                  3000
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
// query with select

describe("query with select", () => {

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
      "queryHuman": "(Color == \"Yellow\" AND Colors == [\"Yellow\", \"Green\"])",
      "sql": "(color = 'yellow' AND multicolor = 'yellow,green')",
      "mongo": {
        "color": "yellow",
        "multicolor": [
          "yellow",
          "green"
        ]
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "var": "color"
              },
              "yellow"
            ]
          },
          {
            "all": [
              {
                "var": "multicolor"
              },
              {
                "in": [
                  {
                    "var": ""
                  },
                  [
                    "yellow",
                    "green"
                  ]
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
// query with !struct and !group

describe("query with !struct", () => {

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
            "and": [
              {
                "==": [
                  {
                    "var": "results.slider"
                  },
                  22
                ]
              },
              {
                "==": [
                  {
                    "var": "results.stock"
                  },
                  true
                ]
              }
            ]
          },
          {
            "==": [
              {
                "var": "user.firstName"
              },
              "abc"
            ]
          },
          {
            "!!": {
              "var": "user.login"
            }
          }
        ]
      }
    });
  });

});


//////////////////////////////////////////////////////////////////////////////////////////
// query with field compare

describe("query with field compare", () => {

  describe("import", () => {
    it("should work with simple value of JsonLogic format", () => {
      with_qb_skins(configs.simple_with_2_numbers, inits.with_number_field_compare, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.simple_with_2_numbers, inits.with_number_field_compare, "JsonLogic", {
      "query": "num == num2",
      "queryHuman": "Number == Number2",
      "sql": "num = num2",
      "mongo": {
        "$expr": {
          "$eq": [
            "$num",
            "$num2"
          ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "var": "num"
              },
              {
                "var": "num2"
              }
            ]
          }
        ]
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// query with func

describe("query with func", () => {

  describe("loads tree with func from JsonLogic", () => {
    export_checks(configs.with_funcs, inits.with_func_tolower_from_field, "JsonLogic", {
      "query": "str == LOWER(str2)",
      "queryHuman": "String == Lowercase(String: String2)",
      "sql": "str = LOWER(str2)",
      "mongo": {
        "$expr": {
          "$eq": [
            "$str",
            {
              "$toLower": "$str2"
            }
          ]
        }
      },
      "logic": {
        "and": [
          {
            "==": [
              {
                "var": "str"
              },
              {
                "method": [
                  {
                    "var": "str2"
                  },
                  "toLowerCase"
                ]
              }
            ]
          }
        ]
      }
    });
  });

  it("set function for number", () => {
    with_qb(configs.with_funcs, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--valuesrc select")
        .simulate("change", { target: { value: "func" } });
      qb
        .find(".rule .rule--value .widget--widget .rule--func select")
        .simulate("change", { target: { value: "LINEAR_REGRESSION" } });
      qb
        .find(".rule .rule--value .widget--widget .rule--func--args .rule--func--arg")
        .at(2)
        .find("input")
        .simulate("change", { target: { value: "4" } });
      expect_jlogic([null,
        { "and": [{ "==": [
          { "var": "num" }, 
          { "+": [ { "*": [ 1, 4 ] }, 0 ] }
        ] }] }
      ], 2);
      const updatedTree = onChange.getCall(2).args[0];
      export_checks(configs.with_funcs, updatedTree, "default", {
        "query": "num == (1 * 4 + 0)",
        "queryHuman": "Number == (1 * 4 + 0)",
        "sql": "num = (1 * 4 + 0)",
        "mongo": {
          "$expr": {
            "$eq": [
              "$num",
              {
                "$sum": [
                  {
                    "$multiply": [
                      1,
                      4
                    ]
                  },
                  0
                ]
              }
            ]
          }
        },
        "logic": {
          "and": [
            {
              "==": [
                {
                  "var": "num"
                },
                {
                  "+": [
                    {
                      "*": [
                        1,
                        4
                      ]
                    },
                    0
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

//////////////////////////////////////////////////////////////////////////////////////////
// query with ops

describe("query with ops", () => {
  describe("export", () => {
    export_checks(configs.with_all_types, inits.with_ops, "JsonLogic", {
      "query": "(num != 2 && str Like \"abc\" && str Not Like \"xyz\" && num >= 1 && num <= 2 && !(num >= 3 && num <= 4) && !num && color IN (\"yellow\") && color NOT IN (\"green\") && multicolor != [\"yellow\"])",
      "queryHuman": "(Number != 2 AND String Like \"abc\" AND String Not Like \"xyz\" AND Number >= 1 AND Number <= 2 AND NOT(Number >= 3 AND Number <= 4) AND Number IS EMPTY AND Color IN (\"Yellow\") AND Color NOT IN (\"Green\") AND Colors != [\"Yellow\"])",
      "sql": "(num <> 2 AND str LIKE '%abc%' AND str NOT LIKE '%xyz%' AND num BETWEEN 1 AND 2 AND num NOT BETWEEN 3 AND 4 AND num IS EMPTY AND color IN ('yellow') AND color NOT IN ('green') AND multicolor != 'yellow')",
      "mongo": {
        "num": {
          "$ne": 2,
          "$gte": 1,
          "$lte": 2,
          "$not": {
            "$gte": 3,
            "$lte": 4
          },
          "$exists": false
        },
        "str": {
          "$regex": "abc",
          "$not": {
            "$regex": "xyz"
          }
        },
        "color": {
          "$in": [
            "yellow"
          ],
          "$nin": [
            "green"
          ]
        },
        "multicolor": {
          "$ne": [
            "yellow"
          ]
        }
      },
      "logic": {
        "and": [
          {
            "!=": [
              {
                "var": "num"
              },
              2
            ]
          },
          {
            "in": [
              "abc",
              {
                "var": "str"
              }
            ]
          },
          {
            "!": {
              "in": [
                "xyz",
                {
                  "var": "str"
                }
              ]
            }
          },
          {
            "<=": [
              1,
              {
                "var": "num"
              },
              2
            ]
          },
          {
            "!": {
              "<=": [
                3,
                {
                  "var": "num"
                },
                4
              ]
            }
          },
          {
            "!": {
              "var": "num"
            }
          },
          {
            "in": [
              {
                "var": "color"
              },
              [
                "yellow"
              ]
            ]
          },
          {
            "!": {
              "in": [
                {
                  "var": "color"
                },
                [
                  "green"
                ]
              ]
            }
          },
          {
            "!": {
              "all": [
                {
                  "var": "multicolor"
                },
                {
                  "in": [
                    {
                      "var": ""
                    },
                    [
                      "yellow"
                    ]
                  ]
                }
              ]
            }
          }
        ]
      }
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// config

describe("config", () => {

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
// proximity

describe("proximity", () => {

  it("should import", () => {
    with_qb(configs.with_prox, inits.with_prox, "default", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
    });
  });

  describe("export", () => {
    export_checks(configs.with_prox, inits.with_prox, "default", {
      "query": "str \"a\" NEAR/3 \"b\"",
      "queryHuman": "String \"a\" NEAR/3 \"b\"",
      "sql": "CONTAINS(str, 'NEAR((a, b), 3)')"
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// interactions on vanilla

describe("interactions on vanilla", () => {
  it("click on remove single rule will leave empty rule", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule .rule--header button")
        .first()
        .simulate("click");
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal(null);
      expect(child.properties.operator).to.equal(null);
      expect(child.properties.value).to.eql([]);
    });
  });

  it("click on remove group will leave empty rule", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_group, "JsonLogic", (qb, onChange) => {
      qb
        .find(".group--children .group .group--header .group--actions button")
        .at(2)
        .simulate("click");
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal(null);
      expect(child.properties.operator).to.equal(null);
      expect(child.properties.value).to.eql([]);
    });
  });

  it("click on add rule will add new empty rule", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
      qb
        .find(".group--actions button")
        .first()
        .simulate("click");
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(2);
    });
  });

  it("click on add group will add new group with one empty rule", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
      qb
        .find(".group--actions button")
        .at(1)
        .simulate("click");
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(2);
      const child = changedTree.children1[childKeys[1]];
      expect(child.type).to.equal("group");
      expect(child.properties.conjunction).to.equal("AND"); //default
      const subchildKeys = Object.keys(child.children1);
      const subchild = child.children1[subchildKeys[0]];
      expect(subchild).to.eql({
        type: "rule", 
        properties: {field: null, operator: null, value: [], valueSrc: []}
      });
    });
  });

  it("change field to of same type will same op & value", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule .rule--field select")
        .simulate("change", { target: { value: "num2" } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal("num2");
      expect(child.properties.operator).to.equal("equal");
      expect(child.properties.value).to.eql([2]);
    });
  });

  it("change field to of another type will flush value and incompatible op", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule .rule--field select")
        .simulate("change", { target: { value: "str2" } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal("str2");
      expect(child.properties.operator).to.equal(null);
      expect(child.properties.value).to.eql([]);
    });
  });

  it("change field to of another type will flush value and leave compatible op", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule .rule--field select")
        .simulate("change", { target: { value: "str" } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal("str");
      expect(child.properties.operator).to.equal("equal");
      expect(child.properties.value).to.eql([undefined]);
    });
  });

  it("set not", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find('.group--conjunctions input[type="checkbox"]')
        .simulate("change", { target: { checked: true } });
      expect_jlogic([null,
        { "!" : { "and": [{ "==": [ { "var": "num" }, 2 ] }] } }
      ]);
    });
  });

  it("change conjunction from AND to OR", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find('.group--conjunctions input[type="radio"][value="OR"]')
        .simulate("change", { target: { value: "OR" } });
      expect_jlogic([null,
        { "or": [{ "==": [ { "var": "num" }, 2 ] }] }
      ]);
    });
  });

  it("change value source to another field of same type", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--valuesrc select")
        .simulate("change", { target: { value: "field" } });
      qb
        .find(".rule .rule--value .widget--widget select")
        .simulate("change", { target: { value: "num2" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "num" }, { "var": "num2" } ] }] }
      ], 1);
    });
  });

  it("change op from equal to not_equal", () => {
    with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--operator select")
        .simulate("change", { target: { value: "not_equal" } });
      expect_jlogic([null,
        { "and": [{ "!=": [ { "var": "num" }, 2 ] }] }
      ]);
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////
// interactions on antd

describe("interactions on antd", () => {

  it("set not", () => {
    with_qb_ant(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".group--conjunctions .ant-btn-group button")
        .at(0)
        .simulate("click");
      expect_jlogic([null,
        { "!" : { "and": [{ "==": [ { "var": "num" }, 2 ] }] } }
      ]);
    });
  });

  it("change conjunction from AND to OR", () => {
    with_qb_ant(configs.simple_with_numbers_and_str, inits.with_2_numbers, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".group--conjunctions .ant-btn-group button")
        .at(2)
        .simulate("click");
      expect_jlogic([null,
        { "or": [
          { "==": [ { "var": "num" }, 2 ] },
          { "==": [ { "var": "num" }, 3 ] }
        ] }
      ]);
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////
// widgets

describe("widgets", () => {
  it("change number value", () => {
    with_qb_skins(configs.with_all_types, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: "3" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "num" }, 3 ] }] }
      ]);
    });
  });

  it("change text value", () => {
    with_qb_skins(configs.with_all_types, inits.with_text, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: "def" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "str" }, "def" ] }] }
      ]);
    });
  });

  it("change date value", () => {
    with_qb(configs.with_all_types, inits.with_date, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: "2020-05-05" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "date" }, "2020-05-05T00:00:00.000Z" ] }] }
      ]);
    });
  });

  it("change datetime value", () => {
    with_qb(configs.with_all_types, inits.with_datetime, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: "2020-05-05T02:30" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "datetime" }, "2020-05-05T02:30:00.000Z" ] }] }
      ]);
    });
  });

  it("change select value", () => {
    with_qb(configs.with_all_types, inits.with_select, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--widget select")
        .simulate("change", { target: { value: "green" } });
      expect_jlogic([null, {
        "and": [{  "==": [ { "var": "color" }, "green" ]  }]
      }]);
    });
  });

  it("change multiselect value", () => {
    with_qb(configs.with_all_types, inits.with_multiselect, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--widget select")
        .simulate("change", { target: { options: [ {value: "yellow", selected: true}, {value: "green"}, {value: "orange"} ] } });
      expect_jlogic([null, {
        "and": [
          {
            "all": [
              { "var": "multicolor" },
              { "in": [ { "var": "" }, [ "yellow" ] ] }
            ]
          }
        ]
      }]);
    });
  });

  //todo: time, slider, bool
});


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

  //todo: datetime, time, slider, bool, multiselect, select, range, slider
});


//////////////////////////////////////////////////////////////////////////////////////////
// validation

describe("validation", () => {
  it("shows error when change number value to > max", () => {
    with_qb(configs.with_all_types__show_error, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: "200" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "num" }, 200 ] }] }
      ]);
      const changedTree = onChange.getCall(0).args[0];
      const isValid = isValidTree(changedTree);
      expect(isValid).to.eq(false);
      
      const ruleError = qb.find(".rule--error");
      expect(ruleError).to.have.length(1);
      expect(ruleError.first().text()).to.eq("Value 200 > max 10");
    });
  });
});

//////////////////////////////////////////////////////////////////////////////////////////
// drag-n-drop

describe("drag-n-drop", () => {

  it("should move rule after second rule", () => {
    with_qb(configs.simple_with_number, inits.with_group, "JsonLogic", (qb, onChange, {expect_queries}) => {
      const firstRule = qb.find(".rule").at(0);
      const secondRule = qb.find(".rule").at(1);

      simulate_drag_n_drop(firstRule, secondRule, {
        "dragRect": {"x":58,"y":113,"width":1525,"height":46,"top":113,"right":1583,"bottom":159,"left":58},
        "plhRect":  {"x":59,"y":79,"width":1525,"height":46,"top":79,"right":1584,"bottom":125,"left":59},
        "treeRect": {"x":34,"y":34,"width":1571,"height":336.296875,"top":34,"right":1605,"bottom":370.296875,"left":34},
        "hovRect":  {"x":59,"y":135,"width":1535,"height":46.296875,"top":135,"right":1594,"bottom":181.296875,"left":59},
        "startMousePos": {"clientX":81,"clientY":101},
        "mousePos":      {"clientX":80,"clientY":135}
      });

      expect_queries([
        "(num == 1 && num == 2)",
        "(num == 2 && num == 1)"
      ]);
    });
  });

  it("should move group before rule", () => {
    with_qb(configs.simple_with_number, inits.with_number_and_group, "JsonLogic", (qb, onChange, {expect_queries}) => {
      const firstRule = qb.find(".rule").at(0);
      const group = qb.find(".group--children .group").at(0);

      simulate_drag_n_drop(group, firstRule, {
        "dragRect":{"x":52,"y":102,"width":1525,"height":159,"top":102,"right":1577,"bottom":261,"left":52},
        "plhRect":{"x":59,"y":135.296875,"width":1525,"height":156,"top":135.296875,"right":1584,"bottom":291.296875,"left":59},
        "treeRect":{"x":34,"y":34,"width":1571,"height":268.296875,"top":34,"right":1605,"bottom":302.296875,"left":34},
        "hovRect":{"x":59,"y":79,"width":1535,"height":46.296875,"top":79,"right":1594,"bottom":125.296875,"left":59},
        "startMousePos":{"clientX":220,"clientY":157},
        "mousePos":{"clientX":213,"clientY":124}
      });

      expect_queries([
        "(num == 1 || (num == 2 && num == 3))",
        "((num == 2 && num == 3) || num == 1)"
      ]);
    });
  });

  it("should move rule into group", () => {
    const do_test = (config, value, checks) => {
      with_qb(config, value, "JsonLogic", (qb, onChange, tasks) => {
        const secondRule = qb.find(".rule").at(1);
        const group = qb.find(".group--children .group").at(0);
        const groupHeader = group.find(".group--header").first();
  
        simulate_drag_n_drop(secondRule, groupHeader, {
          "dragRect":{"x":83,"y":167,"width":1525,"height":43,"top":167,"right":1608,"bottom":210,"left":83},
          "plhRect":{"x":59,"y":129,"width":1525,"height":43,"top":129,"right":1584,"bottom":172,"left":59},
          "treeRect":{"x":34,"y":34,"width":1571,"height":430,"top":34,"right":1605,"bottom":464,"left":34},
          "hovRect":{"x":59,"y":182,"width":1535,"height":158,"top":182,"right":1594,"bottom":340,"left":59},
          "startMousePos":{"clientX":81,"clientY":147},
          "mousePos":{"clientX":105,"clientY":185}
        });

        checks(config, value, onChange, tasks);
      });
    };

    do_test(configs.simple_with_number, inits.with_numbers_and_group, (config, value, onChange, {expect_queries}) => {
      expect_queries([
        "(num == 1 || num == 2 || (num == 3 && num == 4))",
        "(num == 1 || (num == 2 && num == 3 && num == 4))"
      ]);
    });
    
    do_test(configs.simple_with_number_without_regroup, inits.with_numbers_and_group, (_config, _value, onChange, _tasks) => {
      sinon.assert.notCalled(onChange);
    });
  });

  it("should move rule out of group", () => {
    const do_test = (config, value, checks) => {
      with_qb(config, value, "JsonLogic", (qb, onChange, tasks) => {
        const firstRuleInGroup = qb.find(".rule").at(1);
        const group = qb.find(".group--children .group").at(0);
        const groupHeader = group.find(".group--header").first();
  
        simulate_drag_n_drop(firstRuleInGroup, groupHeader, {
          "dragRect":{"x":81,"y":80,"width":1489,"height":43,"top":80,"right":1570,"bottom":123,"left":81},
          "plhRect":{"x":84,"y":119,"width":1489,"height":43,"top":119,"right":1573,"bottom":162,"left":84},
          "treeRect":{"x":34,"y":34,"width":1571,"height":203,"top":34,"right":1605,"bottom":237,"left":34},
          "hovRect":{"x":59,"y":76,"width":1535,"height":150,"top":76,"right":1594,"bottom":226,"left":59},
          "startMousePos":{"clientX":107,"clientY":139},
          "mousePos":{"clientX":104,"clientY":100}
        });
  
        checks(config, value, onChange, tasks);
      });
    };

    do_test(configs.simple_with_number, inits.with_number_and_group_3, (config, value, onChange, {expect_queries}) => {
      expect_queries([
        "(num == 1 || (num == 2 && num == 3 && num == 4))",
        "(num == 1 || num == 2 || (num == 3 && num == 4))"
      ]);
    });
    
    do_test(configs.simple_with_number_without_regroup, inits.with_number_and_group_3, (_config, _value, onChange, _tasks) => {
      sinon.assert.notCalled(onChange);
    });
  });

  it("should move group before group", () => {
    with_qb(configs.simple_with_number_without_regroup, inits.with_groups, "JsonLogic", (qb, onChange, {expect_queries}) => {
      const firstGroup = qb.find(".group--children .group").at(0);
      const secondGroup = qb.find(".group--children .group").at(1);
      const firstGroupHeader = firstGroup.find(".group--header").first();
      const secondGroupHeader = secondGroup.find(".group--header").first();

      simulate_drag_n_drop(secondGroup, firstGroupHeader, {
        "dragRect":{"x":55,"y":83,"width":1448,"height":159.296875,"top":83,"right":1503,"bottom":242.296875,"left":55},
        "plhRect":{"x":59,"y":250.5,"width":1448,"height":159.296875,"top":250.5,"right":1507,"bottom":409.796875,"left":59},
        "treeRect":{"x":34,"y":34,"width":1494,"height":386.796875,"top":34,"right":1528,"bottom":420.796875,"left":34},
        "hovRect":{"x":59,"y":79,"width":1458,"height":161.5,"top":79,"right":1517,"bottom":240.5,"left":59},
        "startMousePos":{"clientX":201,"clientY":272},
        "mousePos":{"clientX":197,"clientY":104}
      });

      expect_queries([
        "((num == 1 && num == 2) || (num == 3 && num == 4))",
        "((num == 3 && num == 4) || (num == 1 && num == 2))"
      ]);
    });
  });

});

//////////////////////////////////////////////////////////////////////////////////////////

