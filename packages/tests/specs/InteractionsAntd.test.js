import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_ant, sleep } from "../support/utils";
import { autocompleteTestsFor } from "./Autocomplete";

describe("interactions on antd", () => {

  describe("autocomplete", () => {
    const {
      testsSingleStrict,
      testsMultipleStrict,
    } = autocompleteTestsFor("antd", null, it, with_qb_ant);

    describe("single-strict", () => {
      testsSingleStrict();
    });

    describe("multiple-strict", () => {
      testsMultipleStrict();
    });
  });

  // -------

  it("set not", async () => {
    await with_qb_ant(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, {expect_jlogic}) => {
      qb
        .find(".group--conjunctions .ant-btn-group button")
        .at(0)
        .simulate("click");
      expect_jlogic([null,
        { "!" : { "and": [{ "==": [ { "var": "num" }, 2 ] }] } }
      ]);
    });
  });

  it("change conjunction from AND to OR", async () => {
    await with_qb_ant(configs.simple_with_numbers_and_str, inits.with_2_numbers, "JsonLogic", (qb, {expect_jlogic}) => {
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

  it("should render labels with showLabels=true", async () => {
    await with_qb_ant([configs.with_different_groups, configs.with_settings_show_labels], inits.with_different_groups, "JsonLogic", (qb) => {
      //todo
    });
  });

  it("should render admin mode with showLock=true", async () => {
    await with_qb_ant([configs.with_different_groups, configs.with_settings_show_lock], inits.with_different_groups, "JsonLogic", (qb) => {
      //todo
    });
  });

});
