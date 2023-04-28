import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb_ant, sleep } from "../support/utils";

const stringifyOptions = (ac) => {
  return ac
    .find("Popup") // in portal
    .find("OptionList")
    .find("Item")
    .getElements()
    .map(el => el.key)
    .join(";");
};

describe("interactions on antd", () => {

  describe("autocomplete", () => {
    it("find B", async () => {
      await with_qb_ant(configs.with_autocomplete, inits.with_autocomplete_a, "JsonLogic", async (qb, onChange, {expect_jlogic}) => {
        let ac = qb.find("Select").filterWhere(s => s.props()?.placeholder == "Select value");
        expect(ac.prop("value")).to.eq("a");

        ac.prop("onDropdownVisibleChange")(true);
        qb.update();
        expect(stringifyOptions(qb)).to.eq("a");
        
        ac.prop("onSearch")("b");
        await sleep(200); // should be > 50ms delay
        qb.update();
        ac = qb.find("Select").filterWhere(s => s.props()?.placeholder == "Select value");
        expect(stringifyOptions(qb)).to.eq("a;b");
      });
    });
  });

  it("set not", async () => {
    await with_qb_ant(configs.simple_with_numbers_and_str, inits.with_number, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
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
    await with_qb_ant(configs.simple_with_numbers_and_str, inits.with_2_numbers, "JsonLogic", (qb, onChange, {expect_jlogic}) => {
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
