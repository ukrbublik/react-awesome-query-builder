import { Utils, ImmutableTree } from "@react-awesome-query-builder/core";
const { isValidTree, validateTree, sanitizeTree, checkTree, getTree } = Utils;
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, expect_objects_equal } from "../support/utils";
import { expect } from "chai";

describe("validateTree", () => {
  it("shows error when change number value to > max", async () => {
    const configFn = configs.with_all_types__show_error;
    await with_qb(configFn, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic, config}) => {
      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: "200" } });
      expect_jlogic([null,
        { "and": [{ "==": [ { "var": "num" }, 200 ] }] }
      ]);
      const changedTree = onChange.getCall(0).args[0];
      const isValid = isValidTree(changedTree, config);
      expect(isValid).to.eq(false);
      
      const ruleError = qb.find(".rule--error");
      expect(ruleError).to.have.length(1);
      expect(ruleError.first().text()).to.eq("Value 200 should be from 0 to 10");

      const validationErrors = validateTree(changedTree, config);
      expect(validationErrors.length).to.eq(1);
      expect(validationErrors[0].itemStr).to.eq("Number = 200");
      expect(validationErrors[0].itemPositionStr).to.eq("Leaf #1 (index path: 1)");
      expect_objects_equal(validationErrors[0].itemPosition, {
        caseNo: null,
        globalNoByType: 0,
        indexPath: [0],
        globalLeafNo: 0,
        index: 1,
        type: "rule",
        isDeleted: false,
      });
      expect(validationErrors[0].errors.length).to.eq(1);
      expect(validationErrors[0].errors[0].str).to.eq("Value 200 should be from 0 to 10");
      expect_objects_equal(validationErrors[0].errors[0], {
        side: "rhs",
        delta: 0,
        key: "VALUE_MAX_CONSTRAINT_FAIL",
        args: {
          value: 200,
          fieldSettings: {
            min: 0,
            max: 10,
          },
        },
        fixed: false,
        str: "Value 200 should be from 0 to 10",
      });
    });
  });
});

describe("sanitizeTree", () => {
  it("can fix value > max with forceFix: true", async () => {
    await with_qb(
      configs.with_all_types__show_error, inits.with_number_bigger_than_max, "JsonLogic",
      async (qb, onChange, {expect_jlogic, config}, consoleData, onInit) => {
        const initialTree = onInit.getCall(0).args[0] as ImmutableTree;
        const isValid = isValidTree(initialTree, config);
        expect(isValid).to.eq(false);
        
        const ruleError = qb.find(".rule--error");
        expect(ruleError).to.have.length(1);
        expect(ruleError.first().text()).to.eq("Value 200 should be from 0 to 10");

        const { fixedTree, fixedErrors, nonFixedErrors } = sanitizeTree(initialTree, config, {
          forceFix: true
        });
        expect(fixedErrors).to.have.length(1);
        expect(fixedErrors[0].errors.length).to.eq(1);
        expect(fixedErrors[0].errors[0].str).to.eq("Value 200 should be from 0 to 10");
        expect(fixedErrors[0].errors[0].fixed).to.eq(true);
        expect(nonFixedErrors).to.have.length(0);

        await qb.setProps({
          value: fixedTree
        });
        const ruleError2 = qb.find(".rule--error");
        expect(ruleError2).to.have.length(0);
        const isValid2 = isValidTree(fixedTree, config);
        expect(isValid2).to.eq(true);
      },
      {
        expectedLoadErrors: [
          "Number = 200  >>  [rhs 0] Value 200 should be from 0 to 10"
        ]
      }
    );
  });
});

describe("deprecated checkTree", () => {
  it("can't fix value > max but can remove empty groups and incomplete rules", async () => {
    await with_qb(
      configs.with_all_types__show_error__dont_fix_on_load, inits.tree_with_empty_groups_and_incomplete_rules, "default",
      async (qb, onChange, {expect_jlogic, expect_tree_validation_errors, config}, consoleData, onInit) => {
        const initialTree = onInit.getCall(0).args[0] as ImmutableTree;
        const initialJsonTree = getTree(initialTree);
        expect(initialJsonTree.children1?.length).to.eq(6);

        const ruleError = qb.find(".rule--error");
        expect(ruleError).to.have.length(1);
        expect(ruleError.first().text()).to.eq("Value 100 should be from 0 to 10");

        config = {
          ...config,
          settings: {
            ...config.settings,
            removeEmptyGroupsOnLoad: true,
            removeIncompleteRulesOnLoad: true,
          }
        };
        const fixedTree = checkTree(initialTree, config);
        await qb.setProps({
          value: fixedTree,
          ...config
        });
        const ruleError2 = qb.find(".rule--error");
        expect(ruleError2).to.have.length(1);
        expect(ruleError2.first().text()).to.eq("Value 100 should be from 0 to 10");

        const isValid2 = isValidTree(fixedTree, config);
        expect(isValid2).to.eq(false);

        const fixedJsonTree = getTree(fixedTree);
        expect(fixedJsonTree.children1?.length).to.eq(2);
        expect_tree_validation_errors([
          "Tree check errors: ",
          "Deleted group #1 (index path: 1)  >>  * Empty group",
          "Number BETWEEN ? AND ?  >>  * [rhs] Incomplete RHS",
          "Deleted group #2 (index path: 3)  >>  * Empty group",
          "?  >>  * [lhs] Incomplete LHS",
          "Number > ?  >>  * [rhs] Incomplete RHS",
          "Number < 100  >>  [rhs 0] Value 100 should be from 0 to 10",
          "Deleted group #3 (index path: 6)  >>  * Empty group"
        ]);
      },
      {
        expectedLoadErrors: [
          "Number BETWEEN ? AND ?  >>  [rhs] Incomplete RHS",
          "?  >>  [lhs] Incomplete LHS",
          "Number > ?  >>  [rhs] Incomplete RHS",
          "Number < 100  >>  [rhs 0] Value 100 should be from 0 to 10",
          "Group #3 (index path: 6)  >>  Empty group"
        ],
        sanitizeOptions: {
          // don't fix tree in `load_tree`
          removeEmptyGroups: false,
          removeIncompleteRules: false,
        },
        ignoreLog: (errText) => {
          return errText.includes("Tree check errors:");
        },
      }
    );
  });
});

//todo: same for validateAndFix tree
