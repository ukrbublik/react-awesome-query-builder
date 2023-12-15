import { Utils } from "@react-awesome-query-builder/core";
const { isValidTree } = Utils;
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb } from "../support/utils";


describe("validation", () => {
  it("shows error when change number value to > max", async () => {
    const config = configs.with_all_types__show_error;
    await with_qb(config, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
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
      expect(ruleError.first().text()).to.eq("Value 200 > max 10");
    }, {
      ignoreLog: (errText) => {
        return errText.includes("Field num: Value 200 > max 10");
      }
    });
  });
});
