import { Utils } from "@react-awesome-query-builder/core";
const { getTree } = Utils;
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb } from "../support/utils";
import chai from "chai";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe("interactions on vanilla", () => {
  it("click on remove single rule will leave empty rule if canLeaveEmptyGroup=false", async () => {
    await with_qb([configs.dont_leave_empty_group, configs.with_default_field_and_operator], inits.with_number, "JsonLogic", (qb, onChange) => {
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

  it("click on remove group will leave empty rule if canLeaveEmptyGroup=false", async () => {
    await with_qb(configs.dont_leave_empty_group, inits.with_group, "JsonLogic", (qb, onChange) => {
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

  it("click on add rule will add new empty rule", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
      qb
        .find(".group--actions button")
        .first()
        .simulate("click");
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(2);
    });
  });

  it("click on add rule will add default rule if defaultField/defaultOperator is present", async () => {
    await with_qb([configs.simple_with_numbers_and_str, configs.with_default_field_and_operator], inits.empty, "JsonLogic", (qb, onChange) => {
      qb
        .find(".group--actions button")
        .first()
        .simulate("click");
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal("str");
      expect(child.properties.operator).to.equal("like");
      expect(child.properties.value).to.eql([undefined]);
    });
  });

  it("click on add rule will add default rule with func at LHS if defaultField is present", async () => {
    await with_qb([configs.simple_with_numbers_and_str, configs.with_default_func_field, configs.with_funcs], inits.empty, "JsonLogic", (qb, onChange) => {
      qb
        .find(".group--actions button")
        .first()
        .simulate("click");
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.fieldSrc).to.equal("func");
      expect(child.properties.field).to.deep.equalInAnyOrder({
        func: "LOWER",
        args: {
          str: {
            valueSrc: "field",
            value: "str"
          }
        }
      });
      expect(child.properties.operator).to.equal("like");
      expect(child.properties.value).to.eql([undefined]);
    });
  });

  it("click on add group will add new group with one empty rule if shouldCreateEmptyGroup=false", async () => {
    await with_qb(configs.dont_leave_empty_group, inits.with_number, "JsonLogic", (qb, onChange) => {
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
      expect(JSON.stringify(subchild)).to.eql(JSON.stringify({
        type: "rule", 
        id: subchild.id,
        properties: {fieldSrc: "field", field: null, operator: null, value: [], valueSrc: []},
      }));
    });
  });

  it("click on add group will add new group with one default rule if shouldCreateEmptyGroup=false AND defaultField is present", async () => {
    await with_qb([configs.dont_leave_empty_group, configs.with_default_field_and_operator], inits.with_number, "JsonLogic", (qb, onChange) => {
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
      expect(JSON.stringify(subchild)).to.eql(JSON.stringify({
        type: "rule", 
        id: subchild.id,
        properties: {
          fieldSrc: "field", 
          field: "str", 
          operator: "like", 
          value: [undefined], 
          valueSrc: ["value"], 
          valueType: ["text"]
        },
      }));
    });
  });

  it("change field to of same type will same op & value", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
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

  it("change field to of another type will flush value and incompatible op", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
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

  it("change field to of another type will flush value and leave compatible op", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange) => {
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

  it("change field from group_ext to simple", async () => {
    await with_qb(configs.with_group_array_cars, inits.with_group_array_cars, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule_group_ext .group--field--count--rule .rule--field select")
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

  it("change field from group_ext to simple with custom operator", async () => {
    await with_qb(configs.with_group_array_custom_operator, inits.with_group_array_custom_operator, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule_group_ext .group--field--count--rule .rule--field select")
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

  it("change field from simple to group_ext, will add empty subfield", async () => {
    await with_qb([configs.with_group_array_cars, configs.with_default_field_and_operator], inits.with_text, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule .rule--field select")
        .simulate("change", { target: { value: "cars" } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal("cars");
      expect(child.properties.operator).to.equal("some");
      expect(child.properties.conjunction).to.equal("AND");
      expect(child.properties.value).to.eql([]);
      const subchildKeys = Object.keys(child.children1 || {}); 
      expect(subchildKeys.length).to.equal(1);
      const subchild = child.children1[subchildKeys[0]];
      expect(subchild.properties.field).to.equal(null);
      expect(subchild.properties.operator).to.equal(null);
      expect(subchild.properties.value).to.eql([]);
    });
  });

  it("change field from simple to group_ext, will add default subfield if defaultField is set in group", async () => {
    await with_qb([configs.with_group_array_cars, configs.with_default_field_in_cars], inits.with_text, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule .rule--field select")
        .simulate("change", { target: { value: "cars" } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1);
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal("cars");
      expect(child.properties.operator).to.equal("some");
      expect(child.properties.conjunction).to.equal("AND");
      expect(child.properties.value).to.eql([]);
      const subchildKeys = Object.keys(child.children1); 
      expect(subchildKeys.length).to.equal(1);
      const subchild = child.children1[subchildKeys[0]];
      expect(subchild.properties.field).to.equal("cars.year");
      expect(subchild.properties.operator).to.equal("equal");
      expect(subchild.properties.value).to.eql([undefined]);
      expect(subchild.properties.valueSrc).to.eql(["value"]);
    });
  });

  it("set not", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find('.group--conjunctions input[type="checkbox"]')
        .simulate("change", { target: { checked: true } });
      expect_jlogic([null,
        { "!" : { "and": [{ "==": [ { "var": "num" }, 2 ] }] } }
      ]);
    });
  });

  it("change conjunction from AND to OR", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_2_numbers, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find('.group--conjunctions input[type="radio"][value="OR"]')
        .simulate("change", { target: { value: "OR" } });
      expect_jlogic([null,
        { "or": [
          { "==": [ { "var": "num" }, 2 ] },
          { "==": [ { "var": "num" }, 3 ] }
        ] }
      ]);
    });
  });

  it("change value source to another field of same type", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
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

  it("change op from equal to not_equal", async () => {
    await with_qb(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      qb
        .find(".rule .rule--operator select")
        .simulate("change", { target: { value: "not_equal" } });
      expect_jlogic([null,
        { "and": [{ "!=": [ { "var": "num" }, 2 ] }] }
      ]);
    });
  });

  it("remove group with 2 rules with confirm", async () => {
    await with_qb(configs.with_settings_confirm, inits.with_number_and_group, "JsonLogic", (qb, onChange,  {expect_jlogic, config}) => {
      const renderConfirm = config.settings.renderConfirm;
      qb
        .find(".group--children .group .group--header .group--actions button")
        .at(2)
        .simulate("click");
      expect(renderConfirm.callCount).to.equal(1);
      renderConfirm.resetHistory();
    });
  });

  it("remove group with 1 rule with confirm", async () => {
    await with_qb(configs.with_settings_confirm, inits.with_number_and_group_1, "JsonLogic", (qb, onChange,  {expect_jlogic, config}) => {
      const renderConfirm = config.settings.renderConfirm;
      qb
        .find(".group--children .group .group--header .group--actions button")
        .at(2)
        .simulate("click");
      expect(renderConfirm.callCount).to.equal(1);
      renderConfirm.resetHistory();
    });
  });

  it("remove rule with confirm", async () => {
    await with_qb(configs.with_settings_confirm, inits.with_2_numbers, "JsonLogic", (qb, onChange,  {expect_jlogic, config}) => {
      const renderConfirm = config.settings.renderConfirm;
      qb
        .find(".group--children .rule-container")
        .first()
        .find(".rule .rule--header button")
        .at(0)
        .simulate("click");
      expect(renderConfirm.callCount).to.equal(1);
      renderConfirm.resetHistory();
    });
  });

  it("should not render not with showNot=false", async () => {
    await with_qb(configs.with_settings_not_show_not, inits.with_numbers_and_group, "JsonLogic", (qb) => {
      expect(qb.find(".group--conjunctions input[type='checkbox']")).to.have.length(0);
    }, {
      ignoreLog: (errText) => {
        // OR conjection is removed from config, so can't load operator `or` from JL
        return errText.includes("Unknown op or/3");
      }
    });
  });

  it("should handle maxNumberOfRules=3", async () => {
    await with_qb(configs.with_settings_max_number_of_rules_3, inits.with_number_and_group, "JsonLogic", (qb) => {
      // if max exceeded --> (3) Add group | Add group, Delete group
      // else -->            (5) Add rule, Add group | Add rule, Add group, Delete group
      expect(qb.find(".group--actions button")).to.have.length(3);
    });
  });

  it("should render labels with showLabels=true", async () => {
    await with_qb([configs.with_different_groups, configs.with_settings_show_labels], inits.with_different_groups, "JsonLogic", (qb) => {
      //todo
    });
  });

  it("should render admin mode with showLock=true", async () => {
    await with_qb([configs.with_different_groups, configs.with_settings_show_lock], inits.with_different_groups, "JsonLogic", (qb) => {
      //todo
    });
  });

  it("change group operator", async () => {
    await with_qb(configs.with_group_array_cars, inits.with_group_array_cars, "JsonLogic", (qb, onChange) => {
      qb
        .find(".rule_group_ext .group--field--count--rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: 4 } });
      const changedTree = getTree(onChange.getCall(0).args[0]);
      const childKeys = Object.keys(changedTree.children1); 
      expect(childKeys.length).to.equal(1);
      const child = changedTree.children1[childKeys[0]];
      expect(child.properties.field).to.equal("cars");
      expect(child.properties.operator).to.equal("greater");
      expect(child.properties.conjunction).to.equal("AND");
      expect(child.properties.value).to.eql([4]);
    });
  });

});

