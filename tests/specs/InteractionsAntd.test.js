import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_ant } from "../support/utils";


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
