import { Utils } from "react-awesome-query-builder";
const { getTree } = Utils;
import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb } from "./utils";


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
    with_qb(configs.simple_with_numbers_and_str, inits.with_2_numbers, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
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

  it("remove group with 2 rules with confirm", () => {
    with_qb(configs.with_settings_confirm, inits.with_number_and_group, "JsonLogic", (qb, onChange,  {expect_jlogic, config}) => {
      const renderConfirm = config.settings.renderConfirm;
      qb
        .find(".group--children .group .group--header .group--actions button")
        .at(2)
        .simulate("click");
      expect(renderConfirm.callCount).to.equal(1);
      renderConfirm.resetHistory();
    });
  });

  it("remove group with 1 rule with confirm", () => {
    with_qb(configs.with_settings_confirm, inits.with_number_and_group_1, "JsonLogic", (qb, onChange,  {expect_jlogic, config}) => {
      const renderConfirm = config.settings.renderConfirm;
      qb
        .find(".group--children .group .group--header .group--actions button")
        .at(2)
        .simulate("click");
      expect(renderConfirm.callCount).to.equal(1);
      renderConfirm.resetHistory();
    });
  });

  it("should not render not with showNot=false", () => {
    with_qb(configs.with_settings_not_show_not, inits.with_numbers_and_group, "JsonLogic", (qb) => {
      expect(qb.find(".group--conjunctions input[type='checkbox']")).to.have.length(0);
    });
  });

  it("should handle maxNumberOfRules=3", () => {
    with_qb(configs.with_settings_max_number_of_rules_3, inits.with_number_and_group, "JsonLogic", (qb) => {
      // if max exceeded --> (3) Add group | Add group, Delete group
      // else -->            (5) Add rule, Add group | Add rule, Add group, Delete group
      expect(qb.find(".group--actions button")).to.have.length(3);
    });
  });

});
