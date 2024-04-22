import { Utils, ImmutableTree } from "@react-awesome-query-builder/core";
const { isValidTree, validateTree, sanitizeTree, checkTree, getTree } = Utils;
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, expect_objects_equal } from "../support/utils";
import chai from "chai";
import chaiSubsetInOrder from "chai-subset-in-order";
const { expect } = chai;
chai.use(chaiSubsetInOrder);

const {
  with_all_types,
  with_show_error,
  with_dont_fix_on_load,
} = configs;

describe("validateTree", () => {
  it("shows error when change number value to > max", async () => {
    await with_qb([
      with_all_types, with_show_error,
    ], inits.with_number, "JsonLogic", (qb, {expect_jlogic, config, onChange}) => {
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
  it("should remove empty group", async () => {
    await with_qb(
      [ with_all_types, with_show_error, with_dont_fix_on_load ], inits.tree_with_empty_groups_and_incomplete_rules, "default",
      async (qb, {expect_jlogic, expect_tree_validation_errors, config, startIdle, onInit}) => {
        // initial tree should NTO be sanitized
        const initialTree = onInit.getCall(0).args[0] as ImmutableTree;
        const initialJsonTree = getTree(initialTree);
        expect(initialJsonTree.children1?.length).to.eq(6);

        // only 1 error is visible
        const ruleError = qb.find(".rule--error");
        expect(ruleError).to.have.length(1);
        expect(ruleError.first().text()).to.eq("Value 100 should be from 0 to 10");

        // sanitizeTree
        const { fixedTree, fixedErrors, nonFixedErrors } = sanitizeTree(initialTree, config);

        // empty groups and incomplete rules should be removed
        expect(fixedErrors).to.have.length(6);
        expect(fixedErrors, "fixedErrors").to.containSubsetInOrder([{
          itemPositionStr: "Deleted group #1 (index path: 1)",
          errors: [{
            key: "EMPTY_GROUP",
            str: "Empty group"
          }],
        }, {
          itemPositionStr: "Deleted leaf #1 (index path: 1,1)",
          itemStr: "Number BETWEEN ? AND ?",
          errors: [{
            key: "INCOMPLETE_RHS",
            side: "rhs",
            str: "Incomplete RHS"
          }],
        }, {
          itemPositionStr: "Deleted group #2 (index path: 3)",
          errors: [{
            key: "EMPTY_GROUP",
            str: "Empty group"
          }],
        }, {
          itemPositionStr: "Deleted leaf #3 (index path: 3,1)",
          itemStr: "?",
          errors: [{
            key: "INCOMPLETE_LHS",
            side: "lhs",
            str: "Incomplete LHS"
          }],
        }, {
          itemPositionStr: "Deleted leaf #4 (index path: 4)",
          itemStr: "Number > ?",
          errors: [{
            key: "INCOMPLETE_RHS",
            side: "rhs",
            str: "Incomplete RHS"
          }],
        }, {
          itemPositionStr: "Deleted group #3 (index path: 6)",
          errors: [{
            key: "EMPTY_GROUP",
            str: "Empty group"
          }],
        }]);

        // 1 error can't be fixed
        expect(nonFixedErrors).to.have.length(1);
        expect(nonFixedErrors, "nonFixedErrors").to.containSubsetInOrder([{
          itemStr: "Number < 100",
          itemPositionStr: "Leaf #2 (index path: 2)",
          errors: [{
            key: "VALUE_MAX_CONSTRAINT_FAIL",
            side: "rhs",
            str: "Value 100 should be from 0 to 10",
            delta: 0,
            fixedFrom: undefined,
            fixedTo: undefined,
            args: {
              value: 100,
              fieldSettings: { min: 0, max: 10 }
            }
          }]
        }]);

        await qb.setProps({
          value: fixedTree,
          ...config
        });

        // still 1 error is visible
        const ruleError2 = qb.find(".rule--error");
        expect(ruleError2).to.have.length(1);
        expect(ruleError2.first().text()).to.eq("Value 100 should be from 0 to 10");
        const isValid2 = isValidTree(fixedTree, config);
        expect(isValid2).to.eq(false);

        // only 2 rules left
        const fixedJsonTree = getTree(fixedTree);
        expect(fixedJsonTree.children1?.length).to.eq(2);
        expect(fixedJsonTree, "fixedJsonTree").to.containSubsetInOrder({
          children1: [{
            type: "rule",
            properties: {
              field: "num",
              fieldError: undefined,
              operator: "is_null",
              value: [],
              valueError: [],
            }
          }, {
            type: "rule",
            properties: {
              field: "num",
              fieldError: undefined,
              operator: "less",
              value: [100],
              valueError: ["Value 100 should be from 0 to 10"]
            }
          }]
        });

        expect_tree_validation_errors([]);
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
      }
    );
  });
  

  it("can't fix value > max with showErrorMessage: true and forceFix: false", async () => {
    await with_qb(
      [ with_all_types, with_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
      async (qb, {expect_jlogic, config, onInit}) => {
        const initialTree = onInit.getCall(0).args[0] as ImmutableTree;
        const isValid = isValidTree(initialTree, config);
        expect(isValid).to.eq(false);
        const ruleError = qb.find(".rule--error");
        expect(ruleError).to.have.length(1);
        expect(ruleError.first().text()).to.eq("Value 200 should be from 0 to 10");

        const { fixedErrors, nonFixedErrors } = sanitizeTree(initialTree, config);
        expect(fixedErrors).to.have.length(0);
        expect(nonFixedErrors).to.have.length(1);
        expect(nonFixedErrors[0].errors.length).to.eq(1);
        expect(nonFixedErrors[0].errors[0].str).to.eq("Value 200 should be from 0 to 10");
        expect(nonFixedErrors[0].errors[0].fixed).to.eq(false);
      },
      {
        expectedLoadErrors: [
          "Number = 200  >>  [rhs 0] Value 200 should be from 0 to 10"
        ]
      }
    );
  });

  it("can fix value > max with forceFix: true", async () => {
    await with_qb(
      [ with_all_types, with_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
      async (qb, {expect_jlogic, config, onInit}) => {
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
        expect(Utils.spelFormat(fixedTree, config)).to.eq("num == 10");

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
      [ with_all_types, with_show_error, with_dont_fix_on_load ], inits.tree_with_empty_groups_and_incomplete_rules, "default",
      async (qb, {expect_jlogic, expect_tree_validation_errors, config, onInit}) => {
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
