/*eslint @typescript-eslint/require-await: ["off"]*/
import { Utils, ImmutableTree, JsonGroup, JsonTree, RuleProperties } from "@react-awesome-query-builder/core";
import TextField from "@mui/material/TextField";
const { isValidTree, validateTree, sanitizeTree, checkTree, getTree } = Utils;
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import {
  with_qb,
  with_qb_mui,
  setFieldFuncArgValue,
  selectFieldFunc,
} from "../support/utils";
import chai from "chai";
import chaiSubsetInOrder from "chai-subset-in-order";
const { expect } = chai;
chai.use(chaiSubsetInOrder);

const {
  with_all_types,
  with_validateValue,
  with_show_error,
  with_dont_show_error,
  with_dont_fix_on_load,
  with_funcs_validation,
  with_fieldSources,
  with_validateValue_without_fixedValue_with_defaultValue,
} = configs;

before(() => {
  // Add translations
  Utils.i18n.addResources("en", "custom", {
    "NOT_EVEN": "Number should be even but got {{val}}"
  });
});

describe("validation in store on change", () => {
  describe("with showErrorMessage=false", () => {
    it("should fix number value to max when change to > max", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_number, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          qb
            .find(".rule .rule--value .widget--widget input")
            .simulate("change", { target: { value: "200" } });
          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 2 ] }] },
            { "and": [{ "==": [ { "var": "num" }, 10 ] }] }
          ]);
        }, {
        }
      );
    });

    it("should fix number values to [max, max] when change op to between and initial value == max", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          qb
            .find(".rule .rule--operator select")
            .simulate("change", { target: { value: "between" } });
          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 10 ] }] },
            { "and": [{ "<=": [ 10, { "var": "num" }, 10 ] }] }
          ]);
        }, {
          expectedLoadErrors: [
            "Number = 200  >>  * [rhs 0] Value 200 should be from 0 to 10"
          ],
        }
      );
    });

    it("should fix number value to max when change op from between to equal and initial values == max", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_range_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          const ruleErrors = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors).to.eql([]);

          qb
            .find(".rule .rule--operator select")
            .simulate("change", { target: { value: "equal" } });
          expect_jlogic([
            { "and": [{ "<=": [ 10, { "var": "num" }, 10 ] }] },
            { "and": [{ "==": [ { "var": "num" }, 10 ] }] }
          ]);
          const ruleErrors2 = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors2).to.eql([]);
        }, {
          expectedLoadErrors: [
            "Number BETWEEN 100 AND 200  >>  * [rhs 0] Value 100 should be from 0 to 10. * [rhs 1] Value 200 should be from 0 to 10"
          ],
        }
      );
    });

    it("should change value to max when change field to another with max < current", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_number, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          qb
            .find(".rule .rule--field select")
            .simulate("change", { target: { value: "negativeNum" } });

          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 2 ] }] },
            { "and": [{ "==": [ { "var": "negativeNum" }, -1 ] }] },
          ]);
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(0);
        }, {
        }
      );
    });
  });

  describe("with showErrorMessage=true", () => {
    it("shows error when change number value to > max", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_number, "JsonLogic",
        async (qb, {expect_jlogic, config, onChange}) => {
          qb
            .find(".rule .rule--value .widget--widget input")
            .simulate("change", { target: { value: "200" } });
          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 2 ] }] },
            { "and": [{ "==": [ { "var": "num" }, 200 ] }] }
          ]);

          const changedTree = onChange.getCall(0).args[0];
          const isValid = isValidTree(changedTree, config);
          expect(isValid).to.eq(false);
          
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Value 200 should be from 0 to 10");
        }, {
        }
      );
    });

    it("should fix number values to [max, max] when change op to between and initial value > max", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic, config, onChange}) => {
          qb
            .find(".rule .rule--operator select")
            .simulate("change", { target: { value: "between" } });
          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 200 ] }] },
            { "and": [{ "<=": [ 10, { "var": "num" }, 10 ] }] }
          ]);

          const changedTree = onChange.getCall(0).args[0];
          const isValid = isValidTree(changedTree, config);
          expect(isValid).to.eq(true);

          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(0);
        }, {
          expectedLoadErrors: [
            "Number = 200  >>  [rhs 0] Value 200 should be from 0 to 10"
          ],
        }
      );
    });

    it("should fix number value to max when change op from between to equal and initial values > max", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_range_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          const ruleErrors = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors).to.eql(["Value 100 should be from 0 to 10"]);

          qb
            .find(".rule .rule--operator select")
            .simulate("change", { target: { value: "equal" } });
          expect_jlogic([
            { "and": [{ "<=": [ 100, { "var": "num" }, 200 ] }] },
            { "and": [{ "==": [ { "var": "num" }, 10 ] }] }
          ]);
          const ruleErrors2 = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors2).to.eql([]);
        }, {
          expectedLoadErrors: [
            "Number BETWEEN 100 AND 200  >>  [rhs 0] Value 100 should be from 0 to 10. [rhs 1] Value 200 should be from 0 to 10"
          ],
        }
      );
    });

    it("should fix from [4, 3] to 4 when change op from between to equal", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_bad_range, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          const ruleErrors = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors).to.eql(["Invalid range"]);

          qb
            .find(".rule .rule--operator select")
            .simulate("change", { target: { value: "equal" } });
          expect_jlogic([
            { "and": [{ "<=": [ 4, { "var": "num" }, 3 ] }] },
            { "and": [{ "==": [ { "var": "num" }, 4 ] }] }
          ]);
          const ruleErrors2 = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors2).to.eql([]);
        }, {
          expectedLoadErrors: [
            "Number BETWEEN 4 AND 3  >>  [rhs -1] Invalid range"
          ],
        }
      );
    });

    it("should fix from [400, 300] to max when change op from between to equal", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_bad_range_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          const ruleErrors = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors).to.eql(["Value 400 should be from 0 to 10"]);

          qb
            .find(".rule .rule--operator select")
            .simulate("change", { target: { value: "equal" } });
          expect_jlogic([
            { "and": [{ "<=": [ 400, { "var": "num" }, 300 ] }] },
            { "and": [{ "==": [ { "var": "num" }, 10 ] }] }
          ]);
          const ruleErrors2 = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors2).to.eql([]);
        }, {
          expectedLoadErrors: [
            "Number BETWEEN 400 AND 300  >>  [rhs 0] Value 400 should be from 0 to 10. [rhs 1] Value 300 should be from 0 to 10. [rhs -1] Invalid range"
          ],
        }
      );
    });

    it("should discard value when change field to another with valueSources=[field]", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic, onChange}) => {
          qb
            .find(".rule .rule--field select")
            .simulate("change", { target: { value: "numField" } });

          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 200 ] }] },
            undefined
          ]);
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(0);

          const changedTree = onChange.getCall(0).args[0];
          const changedJsonTree = Utils.getTree(changedTree);
          expect(changedJsonTree, "changedJsonTree").to.containSubsetInOrder({
            children1: [{
              properties: {
                field: "numField",
                operator: "equal",
                value: [null],
                valueError: [null],
                valueSrc: ["field"],
                valueType: ["number"],
              }
            }]
          });
        }, {
          expectedLoadErrors: [
            "Number = 200  >>  [rhs 0] Value 200 should be from 0 to 10"
          ],
        }
      );
    });

    it("should not discard value when change field to another with max < current", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_number, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          qb
            .find(".rule .rule--field select")
            .simulate("change", { target: { value: "negativeNum" } });

          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 2 ] }] },
            { "and": [{ "==": [ { "var": "negativeNum" }, 2 ] }] },
          ]);
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Value 2 should be from -999 to -1");
        }, {
        }
      );
    });

    it("should not discard range value when change field to another with max < current", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_range_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          qb
            .find(".rule .rule--field select")
            .simulate("change", { target: { value: "negativeNum" } });

          expect_jlogic([
            { "and": [{ "<=": [ 100, { "var": "num" }, 200 ] }] },
            { "and": [{ "<=": [ 100, { "var": "negativeNum" }, 200 ] }] },
          ]);
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Value 100 should be from -999 to -1");
        }, {
          expectedLoadErrors: [
            "Number BETWEEN 100 AND 200  >>  [rhs 0] Value 100 should be from 0 to 10. [rhs 1] Value 200 should be from 0 to 10"
          ],
        }
      );
    });

    it("should not discard [field, 100] value when change field to another with max < 100", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_range_from_field_to_big_number, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          qb
            .find(".rule .rule--field select")
            .simulate("change", { target: { value: "negativeNum" } });

          expect_jlogic([
            { "and": [{ "<=": [ { "var": "numField" }, { "var": "num" }, 100 ] }] },
            { "and": [{ "<=": [ { "var": "numField" }, { "var": "negativeNum" }, 100 ] }] },
          ]);
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Value 100 should be from -999 to -1");
        }, {
          expectedLoadErrors: [
            "Number BETWEEN Number field AND 100  >>  [rhs 1] Value 100 should be from 0 to 10"
          ],
        }
      );
    });

    it("should fix args on func change", async () => {
      // tip: See line `canFix = canFix || canDropArgs` at `validateFuncValue()` - it affects this test
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config, onChange }) => {
          const treeWithFunc2 = Utils.loadTree(inits.tree_with_vfunc2_at_lhs as JsonTree);
          qb.setProps({
            value: treeWithFunc2
          });

          selectFieldFunc(qb, "vld.tfunc2a");

          // Args should change value from 7 to 5 (max)
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(0);
          const newSpel = Utils.spelFormat(onChange.lastCall.args[0], config);
          expect(newSpel).to.equal("T(String).tfunc2a(5, 5, 5) == 'xxxxxxx'");
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("should fix args on func change, even if valueSrc is missing in args", async () => {
      // tip: See line `canFix = canFix || canDropArgs` at `validateFuncValue()` - it affects this test
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config, onChange }) => {
          const treeWithFunc2 = Utils.loadTree(inits.tree_with_vfunc2_at_lhs_without_valueSrc as JsonTree);
          qb.setProps({
            value: treeWithFunc2
          });

          selectFieldFunc(qb, "vld.tfunc2a");

          // Arg `num1` should be fixed 7 -> 5 (max)
          // Arg `num3` should be fixed 7 -> 5 (max)
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(0);
          const validationErrors = Utils.validateTree(onChange.lastCall.args[0], config);
          expect(validationErrors).to.have.length(0);
          const newSpel = Utils.spelFormat(onChange.lastCall.args[0], config);
          expect(newSpel).to.equal("T(String).tfunc2a(5, 3, 5) == 'xxxxxxx'");
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("should drop args on func change if validateValue() returns false for arg", async () => {
      // tip: See line `canFix = canFix || canDropArgs` at `validateFuncValue()` - it affects this test
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config, onChange }) => {
          const treeWithFunc2 = Utils.loadTree(inits.tree_with_vfunc2_at_lhs_without_valueSrc as JsonTree);
          qb.setProps({
            value: treeWithFunc2
          });

          selectFieldFunc(qb, "vld.tfunc2b");

          // Arg `num1` should be dropped because validateValue() returns false
          // For arg `num3` also validateValue() returns false, but it has defaultValue
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(0);
          const validationErrors = Utils.validateTree(onChange.lastCall.args[0], config);
          expect(validationErrors).to.have.length(1);
          expect(validationErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc2b(Num1: ?, Num2: 3, Num3: 4) = xxxxxxx",
            errors: [{
              str: "Value of arg Num1 for func TextFunc2b is required"
            }, {
              key: "INCOMPLETE_LHS"
            }]
          }]);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("should fix args on func change, but not func value", async () => {
      // tip: See line `canFix = canFix || canDropArgs` at `validateFuncValue()` - it affects this test
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config, onChange }) => {
          const treeWithFunc2 = Utils.loadTree(inits.tree_with_vfunc2_at_lhs_and_long_rhs as JsonTree);
          qb.setProps({
            value: treeWithFunc2
          });

          selectFieldFunc(qb, "vld.tfunc2a");

          const validationErrors = Utils.validateTree(onChange.lastCall.args[0], config);
          expect(validationErrors).to.have.length(1);
          expect(validationErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc2a(Num1: 5, Num2: 5, Num3: 5) = xxxxxyyyyyzzz",
            errors: [{
              str: "Value xxxxxyyyyyzzz should have max length 10 but got 13"
            }]
          }]);
          expect(validationErrors[0].errors).to.have.length(1);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("should ignore missing args args on func change", async () => {
      // tip: See line `canFix = canFix || canDropArgs` at `validateFuncValue()` - it affects this test
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config, onChange }) => {
          const treeWithFunc2 = Utils.loadTree(inits.tree_with_vfunc2_at_lhs_with_missing_args as JsonTree);
          qb.setProps({
            value: treeWithFunc2
          });

          selectFieldFunc(qb, "vld.tfunc2a");

          // should not show error "Value of arg Num2 for func TextFunc2a is required"
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Value xxxxxyyyyyzzz should have max length 10 but got 13");

          const validationErrors = Utils.validateTree(onChange.lastCall.args[0], config);
          expect(validationErrors).to.have.length(1);
          expect(validationErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc2a(Num1: 5, Num2: ?, Num3: 3) = xxxxxyyyyyzzz",
            errors: [{
              str: "Value of arg Num2 for func TextFunc2a is required"
            }, {
              str: "Value xxxxxyyyyyzzz should have max length 10 but got 13"
            }, {
              str: "Incomplete LHS"
            }]
          }]);
          expect(validationErrors[0].errors).to.have.length(3);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

  });
});

describe("validateAndFix (internal, on load)", () => {
  describe("with showErrorMessage=false", () => {
    it("should fix number value to max", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          expect_jlogic([
            { "and": [{ "==": [ { "var": "num" }, 10 ] }] }
          ]);
        }, {
          expectedLoadErrors: [
            "Number = 200  >>  * [rhs 0] Value 200 should be from 0 to 10"
          ],
        }
      );
    });

    it("should fix bad range from [4, 3] to [4, 4]", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_bad_range, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          const ruleErrors = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors).to.eql([]);
          expect_jlogic([
            { "and": [{ "<=": [ 4, { "var": "num" }, 4 ] }] }
          ]);
        }, {
          expectedLoadErrors: [
            "Number BETWEEN 4 AND 3  >>  * [rhs -1] Invalid range"
          ],
        }
      );
    });

    it("should fix bad range from [400, 300] to [max, max]", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_bad_range_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          const ruleErrors = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors).to.eql([]);
          expect_jlogic([
            { "and": [{ "<=": [ 10, { "var": "num" }, 10 ] }] }
          ]);
        }, {
          expectedLoadErrors: [
            "Number BETWEEN 400 AND 300  >>  * [rhs 0] Value 400 should be from 0 to 10. * [rhs 1] Value 300 should be from 0 to 10"
          ],
        }
      );
    });

    it("should fix bad date range", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.with_bad_date_range, "JsonLogic",
        async (qb, {expect_jlogic}) => {
          const ruleErrors = qb.find(".rule--error").map(e => e.text());
          expect(ruleErrors).to.eql([]);
          expect_jlogic([
            { "and": [{ "<=": [
              "2020-05-15T00:00:00.000Z",
              { "var": "date" },
              "2020-05-15T00:00:00.000Z"
            ] }] }
          ]);
        }, {
          expectedLoadErrors: [
            "Date BETWEEN 15.05.2020 AND 10.05.2020  >>  * [rhs -1] Invalid range"
          ],
        }
      );
    });

    it("should remove rule with INCORRECT_VALUE_TYPE", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.tree_with_incorrect_value_type_in_rule, null,
        async (qb, {expect_jlogic}) => {
          expect_jlogic([undefined]);
        }, {
          expectedLoadErrors: [
            "Root  >>  Empty query",
            "Number = 100  >>  * [rhs 0] Value should have type number, but got value of type string. * [rhs] Incomplete RHS"
          ],
        }
      );
    });

    it("should not detect INCORRECT_VALUE_TYPE if valueType is missing", async () => {
      await with_qb(
        [ with_all_types, with_dont_show_error ], inits.tree_with_missing_value_type_in_rule, null,
        async (qb, {expect_jlogic}) => {
          expect_jlogic([
            { "and":[ {"==":[{ "var":"num" }, "5"] }] }
          ]);
        }, {
          expectedLoadErrors: [],
        }
      );
    });
  });
});

describe("validateTree", () => {
  it("VALUE_MAX_CONSTRAINT_FAIL", async () => {
    await with_qb(
      [ with_all_types, with_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
      async (qb, {expect_jlogic, config, initialTree}) => {
        const isValid = isValidTree(initialTree, config);
        expect(isValid).to.eq(false);

        const ruleError = qb.find(".rule--error");
        expect(ruleError).to.have.length(1);
        expect(ruleError.first().text()).to.eq("Value 200 should be from 0 to 10");

        const validationErrors = validateTree(initialTree, config);
        expect(validationErrors.length).to.eq(1);
        expect(validationErrors[0].errors.length).to.eq(1);
        expect(validationErrors).to.containSubsetInOrder([{
          itemStr: "Number = 200",
          itemPositionStr: "Leaf #1 (index path: 1)",
          itemPosition: {
            caseNo: null,
            globalNoByType: 0,
            indexPath: [0],
            globalLeafNo: 0,
            index: 1,
            type: "rule",
            isDeleted: false,
          },
          errors: [{
            str: "Value 200 should be from 0 to 10",
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
          }],
        }]);
      }, {
        expectedLoadErrors: [
          "Number = 200  >>  [rhs 0] Value 200 should be from 0 to 10"
        ],
      }
    );
  });

  it("calls validateValue() if exists", async () => {
    await with_qb([
      with_all_types, with_validateValue, with_show_error,
    ], inits.with_uneven_number, "JsonLogic", 
    async (qb, {config, initialTree}) => {
      const ruleError = qb.find(".rule--error");
      expect(ruleError).to.have.length(1);
      expect(ruleError.first().text()).to.eq("Number should be even but got 7");

      const validationErrors = Utils.validateTree(initialTree, config);
      expect(validationErrors).to.containSubsetInOrder([{
        itemPositionStr: "Leaf #1 (index path: 1)",
        itemStr: "Number even = 7",
        errors: [{
          key: "custom:NOT_EVEN",
          side: "rhs",
          str: "Number should be even but got 7",
          args: {
            val: 7,
          },
          delta: 0,
          fixed: false,
        }],
      }]);
    }, {
      expectedLoadErrors: [
        "Number even = 7  >>  [rhs 0] Number should be even but got 7"
      ],
    });
  });

  it("does not call validateValue() after VALUE_MAX_CONSTRAINT_FAIL", async () => {
    await with_qb([
      with_all_types, with_validateValue, with_show_error,
    ], inits.with_uneven_number_bigger_than_max, "JsonLogic", 
    async (qb, {config, initialTree}) => {
      const validationErrors = Utils.validateTree(initialTree, config);
      expect(validationErrors).to.containSubsetInOrder([{
        itemPositionStr: "Leaf #1 (index path: 1)",
        itemStr: "Number even = 13",
        errors: [{
          key: "VALUE_MAX_CONSTRAINT_FAIL",
          side: "rhs",
          str: "Value 13 should be from 0 to 11",
          args: {
            value: 13,
            fieldSettings: {
              min: 0,
              max: 11,
            }
          },
          delta: 0,
          fixed: false,
        }],
      }]);
      expect(validationErrors[0].errors.length).to.eq(1);
    }, {
      expectedLoadErrors: [
        "Number even = 13  >>  [rhs 0] Value 13 should be from 0 to 11"
      ],
    });
  });
});

describe("sanitizeTree", () => {
  describe("with forceFix=false", () => {
    it("can't fix VALUE_MAX_CONSTRAINT_FAIL with showErrorMessage=true", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic, config, initialTree}) => {
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

    it("rule with missing required arg in func should be treated as incomplete => deleted", async () => {
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config }) => {
          const invalidTree = Utils.loadTree(inits.tree_with_vfunc_in_lhs_with_missing_args as JsonTree);
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config, {
            removeIncompleteRules: true,
          });

          // rule should be removed as incomplete
          expect(nonFixedErrors.length).eq(0);
          expect(fixedErrors.length).eq(1);
          expect(fixedErrors[0].errors).to.containSubsetInOrder([{
            key: "INCOMPLETE_LHS",
            fixed: true
          }]);
          expect(Utils.getTree(fixedTree).children1?.length).eq(0);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        });
    });

    it("should remove empty groups and incomplete rules", async () => {
      await with_qb(
        [ with_all_types, with_show_error, with_dont_fix_on_load ], inits.tree_with_empty_groups_and_incomplete_rules, "default",
        async (qb, {expect_tree_validation_errors_in_console, config, initialJsonTree, initialTree}) => {
          // initial tree should NOT be sanitized
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
  
          qb.setProps({
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
  
          expect_tree_validation_errors_in_console([]);
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
            removeEmptyRules: false,
            removeIncompleteRules: false,
          },
        }
      );
    });

    it("will not set defaultValue if value is invalid", async () => {
      await with_qb(
        [ with_all_types, with_show_error, with_validateValue_without_fixedValue_with_defaultValue ], inits.empty, null,
        async (qb, { config }) => {
          const invalidTree = Utils.loadFromJsonLogic(inits.with_numLess5_eq_7, config)!;
          const { fixedErrors, nonFixedErrors } = Utils.sanitizeTree(invalidTree, config);

          expect(fixedErrors.length).to.eq(0);
          expect(nonFixedErrors.length).to.eq(1);
          expect(nonFixedErrors).to.containSubsetInOrder([{
            itemStr: "NumberLess5 = 7",
            errors: [{
              key: "INVALID_VALUE",
              fixed: false,
            }]
          }]);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("if both LHS and RHS have errors, only first error will be shown in UI", async () => {
      await with_qb(
        [ with_all_types, with_funcs_validation, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config }) => {
          const invalidTree = Utils.loadTree(inits.tree_with_vfunc_in_lhs_with_invalid_args_and_rhs as JsonTree);
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config);

          expect(fixedErrors.length).eq(0);
          expect(nonFixedErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: aaaaaa, Str2: bbbbbb, Num1: 20, Num2: 4) = xxxxxx",
            errors: [{
              side: "lhs",
              str: "Invalid value of arg Str1 for func TextFunc1: Value aaaaaa should have max length 5 but got 6",
              key: "INVALID_FUNC_ARG_VALUE",
              fixed: false,
              args: {
                funcKey: "vld.tfunc1",
                funcName: "TextFunc1",
                argKey: "str1",
                argName: "Str1",
                argValidationError: "Value aaaaaa should have max length 5 but got 6",
                argErrors: [{
                  key: "VALUE_LENGTH_CONSTRAINT_FAIL",
                  args: {
                    fieldSettings: {maxLength: 5},
                    length: 6,
                    value: "aaaaaa",
                  },
                }],
              },
            }, {
              side: "lhs",
              str: "Invalid value of arg Str2 for func TextFunc1: Value bbbbbb should have max length 5 but got 6",
              key: "INVALID_FUNC_ARG_VALUE",
              fixed: false,
              args: {
                funcKey: "vld.tfunc1",
                funcName: "TextFunc1",
                argKey: "str2",
                argName: "Str2",
                argValidationError: "Value bbbbbb should have max length 5 but got 6",
              },
            }, {
              side: "lhs",
              str: "Invalid value of arg Num1 for func TextFunc1: Value 20 should be from 0 to 10",
              key: "INVALID_FUNC_ARG_VALUE",
              fixed: false,
              args: {
                argKey: "num1",
                argName: "Num1",
              }
            }, {
              side: "rhs",
              delta: 0,
              str: "Value xxxxxx should have max length 5 but got 6",
              key: "VALUE_LENGTH_CONSTRAINT_FAIL",
              fixed: false,
            }]
          }]);
          expect(nonFixedErrors[0].errors.length).eq(4);

          qb.setProps({
            value: fixedTree
          });
          
          const isValid2 = Utils.isValidTree(fixedTree, config);
          expect(isValid2).to.eq(false);
          const ruleError2 = qb.find(".rule--error");
          expect(ruleError2).to.have.length(1);
          expect(ruleError2.first().text()).to.eq("Invalid value of arg Str1 for func TextFunc1: Value aaaaaa should have max length 5 but got 6")
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("if both parts of value for between op have errors, only first error will be shown in UI", async () => {
      await with_qb(
        [ with_all_types, with_show_error, with_dont_fix_on_load ], inits.empty, null,
        async (qb, { config, pauseTest }) => {
          const invalidTree = Utils.loadFromJsonLogic(inits.with_bad_range_bigger_than_max, config)!;
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config);

          expect(fixedErrors.length).to.eq(0);
          expect(nonFixedErrors.length).to.eq(1);
          expect(nonFixedErrors).to.containSubsetInOrder([{
            itemStr: "Number BETWEEN 400 AND 300",
            errors: [{
              side: "rhs",
              delta: 0,
              key: "VALUE_MAX_CONSTRAINT_FAIL",
              fixed: false,
            }, {
              side: "rhs",
              delta: 1,
              key: "VALUE_MAX_CONSTRAINT_FAIL",
              fixed: false,
            }, {
              side: "rhs",
              delta: -1,
              key: "INVALID_RANGE",
              fixed: false,
            }]
          }]);
          expect(nonFixedErrors[0].errors).to.have.length(3);

          qb.setProps({
            value: fixedTree
          });

          const ruleError2 = qb.find(".rule--error");
          expect(ruleError2).to.have.length(1);
          expect(ruleError2.first().text()).to.eq("Value 400 should be from 0 to 10");
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });
  });

  describe("with forceFix=true", () => {
    it("can fix VALUE_MAX_CONSTRAINT_FAIL", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.with_number_bigger_than_max, "JsonLogic",
        async (qb, {expect_jlogic, config, initialTree}) => {
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
  
          qb.setProps({
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
  
    it("can fix VALUE_MAX_CONSTRAINT_FAIL AND fix from validateValue()", async () => {
      await with_qb(
        [ with_all_types, with_validateValue, with_show_error ], inits.with_uneven_number_bigger_than_max, null,
        async (qb, {expect_jlogic, config, initialTree}) => {
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Value 13 should be from 0 to 11");
          
          const { fixedTree, fixedErrors, nonFixedErrors } = Utils.sanitizeTree(initialTree, config, {
            forceFix: true
          });
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "Number even = 13",
            itemPositionStr: "Leaf #1 (index path: 1)",
            errors: [{
              key: "VALUE_MAX_CONSTRAINT_FAIL",
              side: "rhs",
              str: "Value 13 should be from 0 to 11",
              args: {
                value: 13,
              },
              delta: 0,
              fixed: true,
              fixedFrom: 13,
              fixedTo: 11,
            }, {
              key: "custom:NOT_EVEN",
              side: "rhs",
              str: "Number should be even but got 11",
              args: {
                val: 11,
              },
              delta: 0,
              fixed: true,
              fixedFrom: 11,
              fixedTo: 10,
            }],
          }]);
          expect(nonFixedErrors).to.eql([]);
  
          qb.setProps({
            value: fixedTree
          });
  
          const ruleError2 = qb.find(".rule--error");
          expect(ruleError2).to.have.length(0);
          const isValid2 = Utils.isValidTree(fixedTree, config);
          expect(isValid2).to.eq(true);
          expect(Utils.spelFormat(fixedTree, config)).to.eq("evenNum == 10");
        },
        {
          expectedLoadErrors: [
            "Number even = 13  >>  [rhs 0] Value 13 should be from 0 to 11"
          ]
        }
      );
    });

    it("can remove rule with BAD_SELECT_VALUE", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.empty, null,
        async (_qb, {config}) => {
          const treeWithBadSelect = Utils.loadFromJsonLogic(inits.with_bad_select_value, config)!;
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(treeWithBadSelect, config, {
            forceFix: true
          });
          const fixedJsonTree = Utils.getTree(fixedTree);

          expect(nonFixedErrors.length).to.eq(0);
          expect(fixedErrors.length).to.eq(1);
          expect(fixedErrors[0].errors.length).to.eq(2);
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "Color = unexisting",
            errors: [{
              fixed: true,
              key: "BAD_SELECT_VALUE",
              args: {
                value: "unexisting",
              },
              str: "Value unexisting is not in the list of allowed values",
              fixedFrom: "unexisting",
              fixedTo: null,
            }, {
              fixed: true,
              key: "INCOMPLETE_RHS",
              str: "Incomplete RHS",
            }]
          }]);
          expect(fixedJsonTree.children1?.length).to.eq(0);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ]
        }
      );
    });

    it("can remove rule with BAD_MULTISELECT_VALUES", async () => {
      await with_qb(
        [ with_all_types, with_show_error ], inits.empty, null,
        async (qb, { config }) => {
          const treeWithBadMultiSelect = Utils.loadFromJsonLogic(inits.with_bad_multiselect_value, config)!;
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(treeWithBadMultiSelect, config, {
            forceFix: true
          });
          const fixedJsonTree = Utils.getTree(fixedTree);

          expect(nonFixedErrors.length).to.eq(0);
          expect(fixedErrors.length).to.eq(1);
          expect(fixedErrors[0].errors.length).to.eq(1);
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "Colors = [unexisting1, Orange, unexisting2]",
            errors: [{
              fixed: true,
              key: "BAD_MULTISELECT_VALUES",
              args: {
                badValues: ["unexisting1", "unexisting2"],
                count: 2,
              },
              str: "Values unexisting1 and unexisting2 are not in the list of allowed values",
              fixedFrom: ["unexisting1", "orange", "unexisting2"],
              fixedTo: ["orange"],
            }]
          }]);
          expect(fixedJsonTree).to.containSubsetInOrder({
            children1: [{
              properties: {
                field: "multicolor",
                operator: "multiselect_equals",
                value: [ ["orange"] ],
                valueError: [null],
              }
            }]
          });
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ]
        }
      );
    });

    it("can set defaultValue if can't fix", async () => {
      await with_qb(
        [ with_all_types, with_validateValue_without_fixedValue_with_defaultValue ], inits.empty, null,
        async (qb, { config }) => {
          const invalidTree = Utils.loadFromJsonLogic(inits.with_numLess5_eq_7, config)!;
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config, {
            forceFix: true
          });
          const fixedJsonTree = Utils.getTree(fixedTree);

          expect(nonFixedErrors.length).to.eq(0);
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "NumberLess5 = 7",
            errors: [{
              key: "INVALID_VALUE",
              fixed: true,
              fixedFrom: 7,
              fixedTo: 3,
            }]
          }]);
          expect(fixedJsonTree).to.containSubsetInOrder({
            children1: [{
              properties: {
                field: "numLess5",
                fieldSrc: "field",
                operator: "equal",
                value: [3],
              }
            }]
          });
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("can fix all args in func in LHS", async () => {
      await with_qb(
        [ with_all_types, with_funcs_validation, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config }) => {
          const invalidTree = Utils.loadTree(inits.tree_with_vfunc_in_lhs_with_invalid_args_and_rhs as JsonTree);
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config, {
            forceFix: true
          });

          expect(nonFixedErrors.length).eq(0);
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: aaaaaa, Str2: bbbbbb, Num1: 20, Num2: 4) = xxxxxx",
            errors: [{
              side: "lhs",
              str: "Invalid value of arg Str1 for func TextFunc1: Value aaaaaa should have max length 5 but got 6",
              key: "INVALID_FUNC_ARG_VALUE",
              fixedFrom: "aaaaaa",
              fixedTo: "aaaaa",
              fixed: true,
              args: {
                funcKey: "vld.tfunc1",
                funcName: "TextFunc1",
                argKey: "str1",
                argName: "Str1",
                argValidationError: "Value aaaaaa should have max length 5 but got 6",
                argErrors: [{
                  key: "VALUE_LENGTH_CONSTRAINT_FAIL",
                  args: {
                    fieldSettings: {maxLength: 5},
                    length: 6,
                    value: "aaaaaa",
                  },
                }],
              },
            }, {
              side: "lhs",
              str: "Invalid value of arg Str2 for func TextFunc1: Value bbbbbb should have max length 5 but got 6",
              key: "INVALID_FUNC_ARG_VALUE",
              fixedFrom: "bbbbbb",
              fixedTo: "bbbbb",
              fixed: true,
              args: {
                funcKey: "vld.tfunc1",
                funcName: "TextFunc1",
                argKey: "str2",
                argName: "Str2",
                argValidationError: "Value bbbbbb should have max length 5 but got 6",
              },
            }, {
              side: "lhs",
              str: "Invalid value of arg Num1 for func TextFunc1: Value 20 should be from 0 to 10",
              key: "INVALID_FUNC_ARG_VALUE",
              fixed: true,
              fixedFrom: 20,
              fixedTo: 10,
              args: {
                argKey: "num1",
                argName: "Num1",
              }
            }, {
              side: "rhs",
              delta: 0,
              str: "Value xxxxxx should have max length 5 but got 6",
              key: "VALUE_LENGTH_CONSTRAINT_FAIL",
              fixed: true,
              fixedFrom: "xxxxxx",
              fixedTo: "xxxxx",
            }]
          }]);
          expect(fixedErrors[0].errors.length).eq(4);

          qb.setProps({
            value: fixedTree
          });
          const ruleError2 = qb.find(".rule--error");
          expect(ruleError2).to.have.length(0);
          const isValid2 = Utils.isValidTree(fixedTree, config);
          expect(isValid2).to.eq(true);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("can't fix missing required arg in func in LHS", async () => {
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config, onChange }) => {
          const invalidTree = Utils.loadTree(inits.tree_with_vfunc_in_lhs_with_missing_args as JsonTree);
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config, {
            forceFix: true,
            removeIncompleteRules: false,
          });

          // Tree will be partially fixed
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: aaaaa, Str2: bbbbb, Num1: ?, Num2: ?) = xxxxxx",
            errors: [{
              key: "REQUIRED_FUNCTION_ARG",
              args: {
                argKey: "num1",
              },
              fixedTo: 0, // defaultValue
            }, {
              side: "rhs",
              key: "VALUE_LENGTH_CONSTRAINT_FAIL",
              fixedFrom: "xxxxxx",
              fixedTo: "xxxxx",
            }],
          }]);

          expect(nonFixedErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: aaaaa, Str2: bbbbb, Num1: ?, Num2: ?) = xxxxxx",
            errors: [{
              key: "REQUIRED_FUNCTION_ARG",
              args: {
                argKey: "num2",
              },
              fixedTo: undefined, // NO defaultValue
            }, {
              side: "lhs",
              key: "INCOMPLETE_LHS",
            }],
          }]);
          expect(nonFixedErrors[0].errors.length).eq(2);

          // Tree should be invalid on load
          qb.setProps({
            value: fixedTree
          });
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Value of arg Num2 for func TextFunc1 is required");

          // If user starts updating tree, validation errors about missing required args are not being shown in UI.
          // Beucase tree in not completed yet.
          setFieldFuncArgValue(qb, 3, "");
          const ruleError2 = qb.find(".rule--error");
          expect(ruleError2).to.have.length(0);
          const validationErrors2 = Utils.validateTree(onChange.lastCall.args[0], config);
          expect(validationErrors2).to.have.length(1);
          expect(validationErrors2).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: aaaaa, Str2: bbbbb, Num1: 0, Num2: ?) = xxxxx",
            errors: [{
              key: "REQUIRED_FUNCTION_ARG",
              args: {
                argKey: "num2",
              },
              fixedTo: undefined, // NO defaultValue
            }, {
              side: "lhs",
              key: "INCOMPLETE_LHS",
            }],
          }]);
          expect(validationErrors2[0].errors).to.have.length(2);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });

    it("can fix all args in nested func in LHS", async () => {
      await with_qb(
        [ with_all_types, with_funcs_validation, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config }) => {
          const invalidTree = Utils.loadTree(inits.tree_with_vfunc_in_both_sides_with_invalid_args_in_nested_funcs as JsonTree);
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config, {
            forceFix: true
          });

          expect(nonFixedErrors.length).eq(0);
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: aaaaaa, Str2: TextFunc1(Str1: _aaaaaa, Str2: ?, Num1: ?, Num2: 4), Num1: 20, Num2: 4) = TextFunc1(Str1: ?, Str2: rbbbbbb, Num1: ?, Num2: 13)",
            errors: [{
              side: "lhs",
              str: "Invalid value of arg Str1 for func TextFunc1: Value aaaaaa should have max length 5 but got 6",
              key: "INVALID_FUNC_ARG_VALUE",
              fixedTo: "aaaaa",
              fixed: true,
            }, {
              side: "lhs",
              // tip: only first error is shown in `str` for nested func, but see `args.argErrors` for full details
              str: "Invalid value of arg Str2 for func TextFunc1: Invalid value of arg Str1 for func TextFunc1: Value _aaaaaa should have max length 5 but got 7",
              key: "INVALID_FUNC_ARG_VALUE",
              // todo: no OrderedMap ??
              // fixedFrom: OrderedMap,
              // fixedTo: OrderedMap,
              fixed: true,
              args: {
                funcKey: "vld.tfunc1",
                funcName: "TextFunc1",
                argKey: "str2",
                argName: "Str2",
                argValidationError: "Invalid value of arg Str1 for func TextFunc1: Value _aaaaaa should have max length 5 but got 7",
                argErrors: [{
                  key: "INVALID_FUNC_ARG_VALUE",
                  fixedFrom: "_aaaaaa",
                  fixedTo: "_aaaa",
                  args: {
                    funcKey: "vld.tfunc1",
                    argKey: "str1",
                    argErrors: [{
                      key: "VALUE_LENGTH_CONSTRAINT_FAIL",
                    }],
                  },
                }, {
                  key: "REQUIRED_FUNCTION_ARG",
                  fixedTo: "_d2_",
                  args: {
                    funcKey: "vld.tfunc1",
                    argKey: "str2",
                    argErrors: undefined,
                  },
                }, {
                  key: "REQUIRED_FUNCTION_ARG",
                  fixedTo: 0,
                  args: {
                    funcKey: "vld.tfunc1",
                    argKey: "num1",
                    argErrors: undefined,
                  },
                }]
              },
            }, {
              side: "lhs",
              str: "Invalid value of arg Num1 for func TextFunc1: Value 20 should be from 0 to 10",
              key: "INVALID_FUNC_ARG_VALUE",
              fixed: true,
              fixedTo: 10,
              args: {
                argKey: "num1",
                argErrors: [{
                  key: "VALUE_MAX_CONSTRAINT_FAIL",
                }],
              },
            }, {
              side: "rhs",
              delta: 0,
              str: "Value of arg Str1 for func TextFunc1 is required",
              key: "REQUIRED_FUNCTION_ARG",
              fixedTo: "_d1_",
            }, {
              side: "rhs",
              delta: 0,
              str: "Invalid value of arg Str2 for func TextFunc1: Value rbbbbbb should have max length 5 but got 7",
              key: "INVALID_FUNC_ARG_VALUE",
              fixedTo: "rbbbb",
            }, {
              side: "rhs",
              delta: 0,
              str: "Value of arg Num1 for func TextFunc1 is required",
              key: "REQUIRED_FUNCTION_ARG",
              fixedTo: 0,
            }, {
              side: "rhs",
              delta: 0,
              str: "Invalid value of arg Num2 for func TextFunc1: Value 13 should be from 0 to 10",
              key: "INVALID_FUNC_ARG_VALUE",
              fixedTo: 10,
            }]
          }]);
          expect(fixedErrors[0].errors.length).eq(7);

          qb.setProps({
            value: fixedTree
          });
          const ruleError2 = qb.find(".rule--error");
          expect(ruleError2).to.have.length(0);
          const isValid2 = Utils.isValidTree(fixedTree, config);
          expect(isValid2).to.eq(true);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });
  
    it("can't fix missing required arg in nested func in LHS", async () => {
      await with_qb(
        [ with_all_types, with_funcs_validation, with_dont_fix_on_load, with_show_error, with_fieldSources ], inits.empty, null,
        async (qb, { config, onChange }) => {
          const invalidTree = Utils.loadTree(inits.tree_with_vfunc_in_both_sides_with_missing_args_in_nested_funcs as JsonTree);
          const { fixedErrors, nonFixedErrors, fixedTree } = Utils.sanitizeTree(invalidTree, config, {
            forceFix: true,
            removeIncompleteRules: false,
          });

          // Tree will be partially fixed
          expect(fixedErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: TextFunc2(Num1: ?, Num2: 3, Num3: 4), Str2: TextFunc2(Num1: -13, Num2: ?, Num3: -14), Num1: 20, Num2: 4) = TextFunc1(Str1: raaaaaaa, Str2: rbbb, Num1: 3, Num2: 4)",
            errors: [{
              key: "INVALID_FUNC_ARG_VALUE",
              str: "Invalid value of arg Str1 for func TextFunc1: Value of arg Num1 for func TextFunc2 is required",
              args: {
                argKey: "str1",
                funcKey: "vld.tfunc1",
                argErrors: [{
                  key: "REQUIRED_FUNCTION_ARG",
                  fixedTo: 0,
                  args: {
                    argKey: "num1",
                    funcKey: "vld.tfunc2",
                  }
                }]
              },
              // todo: no OrderedMap ??
              // fixedFrom: OrderedMap,
              // fixedTo: OrderedMap,
            }, {
              key: "INVALID_FUNC_ARG_VALUE",
              // tip: `str` has first non-fixed error here!
              str: "Invalid value of arg Str2 for func TextFunc1: Value of arg Num2 for func TextFunc2 is required",
              // todo: no OrderedMap ??
              // fixedFrom: OrderedMap,
              // fixedTo: OrderedMap,
              // todo: here is partial fix in arguments of nested func. is all correct?
              fixed: true, // !!! partially fixed
              args: {
                argKey: "str2",
                funcKey: "vld.tfunc1",
                argErrors: [{
                  key: "INVALID_FUNC_ARG_VALUE",
                  fixedTo: 0,
                  fixed: true,
                  args: {
                    argKey: "num1",
                    funcKey: "vld.tfunc2",
                  }
                }, {
                  key: "REQUIRED_FUNCTION_ARG",
                  fixedTo: undefined, // !!!
                  fixed: false, // !!!
                  args: {
                    argKey: "num2",
                    funcKey: "vld.tfunc2",
                  }
                }, {
                  key: "INVALID_FUNC_ARG_VALUE",
                  fixedTo: 0,
                  fixed: true,
                  args: {
                    argKey: "num3",
                    funcKey: "vld.tfunc2",
                  }
                }]
              },
            }, {
              key: "INVALID_FUNC_ARG_VALUE",
              str: "Invalid value of arg Num1 for func TextFunc1: Value 20 should be from 0 to 10",
              fixedTo: 10,
            }, {
              side: "rhs",
              delta: 0,
              key: "INVALID_FUNC_ARG_VALUE",
              str: "Invalid value of arg Str1 for func TextFunc1: Value raaaaaaa should have max length 5 but got 8",
              fixedTo: "raaaa",
            }],
          }]);

          expect(nonFixedErrors).to.containSubsetInOrder([{
            itemStr: "TextFunc1(Str1: TextFunc2(Num1: ?, Num2: 3, Num3: 4), Str2: TextFunc2(Num1: -13, Num2: ?, Num3: -14), Num1: 20, Num2: 4) = TextFunc1(Str1: raaaaaaa, Str2: rbbb, Num1: 3, Num2: 4)",
            errors: [{
              side: "lhs",
              key: "INCOMPLETE_LHS",
            }],
          }]);
          expect(nonFixedErrors[0].errors.length).eq(1);

          // Tree should be invalid on load
          qb.setProps({
            value: fixedTree
          });
          const ruleError = qb.find(".rule--error");
          expect(ruleError).to.have.length(1);
          expect(ruleError.first().text()).to.eq("Invalid value of arg Str2 for func TextFunc1: Value of arg Num2 for func TextFunc2 is required");

          // If user starts updating tree, validation errors about missing required args are not being shown in UI.
          // Beucase tree in not completed yet.
          setFieldFuncArgValue(qb, 3, "5");
          const ruleError2 = qb.find(".rule--error");
          expect(ruleError2).to.have.length(0);
          const validationErrors2 = Utils.validateTree(onChange.lastCall.args[0], config);
          expect(validationErrors2).to.have.length(1);
          expect(validationErrors2).to.containSubsetInOrder([{
            errors: [{
              key: "INVALID_FUNC_ARG_VALUE",
              str: "Invalid value of arg Str2 for func TextFunc1: Value of arg Num2 for func TextFunc2 is required",
              fixed: false,
            }, {
              key: "INCOMPLETE_LHS",
            }],
          }]);
        }, {
          expectedLoadErrors: [ "Root  >>  Empty query" ],
        }
      );
    });
  });
});

describe("checkTree (deprecated)", () => {
  it("can't fix VALUE_MAX_CONSTRAINT_FAIL but can remove empty groups and incomplete rules", async () => {
    await with_qb(
      [ with_all_types, with_show_error, with_dont_fix_on_load ], inits.tree_with_empty_groups_and_incomplete_rules, "default",
      async (qb, {expect_jlogic, expect_tree_validation_errors_in_console, config, initialTree, initialJsonTree}) => {
        expect(initialJsonTree.children1?.length).to.eq(6);

        const ruleError = qb.find(".rule--error");
        expect(ruleError).to.have.length(1);
        expect(ruleError.first().text()).to.eq("Value 100 should be from 0 to 10");

        config = {
          ...config,
          settings: {
            ...config.settings,
            removeEmptyGroupsOnLoad: true,
            removeEmptyRulesOnLoad: true,
            removeIncompleteRulesOnLoad: true,
          }
        };
        const fixedTree = checkTree(initialTree, config);
        qb.setProps({
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
        expect_tree_validation_errors_in_console([
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
          removeEmptyRules: false,
          removeIncompleteRules: false,
        },
        ignoreLog: (errText) => {
          return errText.includes("Tree check errors:");
        },
      }
    );
  });
});

describe("optimizeRenderWithInternals (MUI)", () => {
  it("input with state should not loose focus", async () => {
    await with_qb_mui(
      [
        with_all_types, with_funcs_validation, with_show_error, with_fieldSources,
        // configs.with_optimizeRenderWithInternals, // test will fail with optimization
      ], inits.empty, null,
      async (qb, { config, onChange, pauseTest }) => {
        const invalidTree = Utils.loadTree(inits.tree_with_vfunc_in_lhs_with_missing_args as JsonTree);
        qb.setProps({
          value: invalidTree
        });

        // BUG:
        // 1. change "aaaaa" to "aaa" (delete 2 chars)
        // 2. change "xxxxxx" to "xxxxx" (delete 2 char)
        // -> input "xxxxx" lost its focus

        // await pauseTest({});

        qb.find(TextField).filter({placeholder: "Str1"}).prop("onChange")?.({target: {value: "aaaa"}} as any);
        qb.find(TextField).filter({placeholder: "Str1"}).prop("onChange")?.({target: {value: "aaa"}} as any);
        qb.find(TextField).filter({placeholder: "Str2"}).prop("onChange")?.({target: {value: "bbb"}} as any);
        qb.find(TextField).filter({placeholder: "Enter string"}).prop("onChange")?.({target: {value: "xxxxx"}} as any);
        qb.find(TextField).filter({placeholder: "Enter string"}).prop("onChange")?.({target: {value: "xxx"}} as any);
        qb.update();

        const newTree = Utils.getTree(onChange.lastCall.args[0]);
        expect((newTree.children1?.[0].properties as RuleProperties).value[0]).eql("xxx");
        expect(qb.find(TextField).filter({placeholder: "Enter string"}).prop("value")).eql("xxx");
      }, {
        expectedLoadErrors: [ "Root  >>  Empty query" ],
        debug: true,
      }
    );
  });
});
