import { Query, Builder, BasicConfig } from "react-awesome-query-builder";
import AntdConfig from "react-awesome-query-builder/config/antd";
import * as configs from "./configs";
import * as inits from "./inits";
import { with_qb, empty_value, export_checks } from "./utils";
// warning: don't put `export_checks` inside `it`


describe("library", () => {
  it("should be imported correctly", () => {
    expect(Query).to.exist;
    expect(Builder).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});


describe("basic query", () => {

  describe("import", () => {
    it("should work with empty value", () => {
      with_qb(configs.simple_with_number, empty_value, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    it("should work with simple value", () => {
      with_qb(configs.simple_with_number, inits.tree_with_number, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    it("should work with simple value of JsonLogic format", () => {
      with_qb(configs.simple_with_number, inits.with_number, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });
  });

  describe("export", () => {
    export_checks(configs.simple_with_number, inits.tree_with_number, "default", {
      query: "num == 2",
      queryHuman: "Number == 2",
      sql: "num = 2",
      mongo: {num: 2},
      logic: {
        and: [
          { "==": [{ "var": "num" }, 2] }
        ]
      },
    });
  });
});