import { BasicConfig } from "react-awesome-query-builder";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, load_tree } from "../support/utils";


describe("change props", () => {
  it("change tree via props triggers onChange", () => {
    with_qb(configs.simple_with_2_numbers, inits.with_num_and_num2, "JsonLogic", async (qb, onChange, {expect_jlogic}) => {
      await qb.setProps({
        value: load_tree(inits.with_number, configs.simple_with_2_numbers(BasicConfig), "JsonLogic")
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
    with_qb(configs.simple_with_number, inits.with_num_and_num2, "JsonLogic", (qb, onChange, {expect_checks}) => {
      expect_checks({
        logic: inits.with_number
      });
    });
  });
});
