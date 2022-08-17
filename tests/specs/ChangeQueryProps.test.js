import { BasicConfig } from "react-awesome-query-builder";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, with_qb_ant, load_tree } from "../support/utils";


describe("change props", () => {
  it("change tree via props triggers onChange", async () => {
    await with_qb(configs.simple_with_2_numbers, inits.with_num_and_num2, "JsonLogic", async (qb, onChange, {expect_jlogic}) => {
      const {tree, errors} = load_tree(inits.with_number, configs.simple_with_2_numbers(BasicConfig), "JsonLogic");
      await qb.setProps({
        value: tree
      });
      expect_jlogic([null, inits.with_number]);
      expect(onChange.getCall(1)).to.equal(null);
    });
  });

  it("change config via props triggers onChange", async () => {
    await with_qb(configs.simple_with_2_numbers, inits.with_num_and_num2, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
      const config_without_num2 = configs.simple_with_number(BasicConfig);
      qb.setProps({
        ...config_without_num2,
      });
      expect_jlogic([null, inits.with_number]);
      expect(onChange.getCall(1)).to.equal(null);
    });
  });

  it("change UI framework should not produce error", async () => {
    await with_qb_ant(configs.with_all_types, inits.with_treeselect, "JsonLogic", async (qb, onChange) => {
      const config_vanilla = configs.with_all_types(BasicConfig);
      await qb.setProps({
        ...config_vanilla,
      });
    });
  });

  describe("load tree with another config", async () => {
    await with_qb(configs.simple_with_number, inits.with_num_and_num2, "JsonLogic", (qb, onChange, {expect_checks}) => {
      expect_checks({
        logic: inits.with_number
      });
    });
  });
});
