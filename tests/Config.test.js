import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb_ant } from "./utils";


describe("config", () => {

  it("should render select by default", () => {
    with_qb_ant(configs.with_struct, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-select-selection-item").at(0).text()).to.equal("user.info.firstName");
    });
  });

  it("should render cascader", () => {
    with_qb_ant(configs.with_cascader, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-cascader-picker-label").text()).to.equal("User / info / firstName");
    });
  });

  it("should render tree select", () => {
    with_qb_ant(configs.with_tree_select, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-select.ant-tree-select")).to.have.length(1);
      expect(qb.find(".ant-select-selection-item").at(0).text()).to.equal("firstName");
    });
  });

  it("should render tree dropdown", () => {
    with_qb_ant(configs.with_dropdown, inits.with_nested, "JsonLogic", (qb) => {
      expect(qb.find(".query-builder")).to.have.length(1);
      expect(qb.find(".ant-dropdown-trigger span").at(0).text().trim()).to.equal("firstName");
    });
  });

});
