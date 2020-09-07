import { BasicConfig } from "react-awesome-query-builder";
import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb, load_tree } from "./utils";


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
    with_qb(configs.simple_with_number, inits.with_num_and_num2, "JsonLogic", (qb, onChange, {expect_checks}) => {
      expect_checks({
        logic: inits.with_number
      });
    });
  });
});
