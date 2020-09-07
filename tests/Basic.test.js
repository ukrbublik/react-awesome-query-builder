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

    it("should work with empty JsonLogic tree", () => {
      with_qb(configs.simple_with_number, undefined, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    it("should work with simple value", () => {
      with_qb(configs.simple_with_number, inits.tree_with_number, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    it("should work with simple value in JsonLogic format", () => {
      with_qb(configs.simple_with_number, inits.with_number, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    describe("should work with simple value in JsonLogic format not in group", () => {
      export_checks(configs.simple_with_number, inits.with_number_not_in_group, "JsonLogic", {
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

    describe("should handle undefined value in JsonLogic format", () => {
      export_checks(configs.simple_with_number, inits.with_undefined_as_number, "JsonLogic", {});
    });

    describe("should handle unexpected json logic value in JsonLogic format", () => {
      export_checks(configs.simple_with_number, inits.with_jl_value, "JsonLogic", {});
    });

    describe("should handle unknown field", () => {
      export_checks(configs.simple_with_number, inits.with_nested, "JsonLogic", {});
    });

    describe("should handle unknown type", () => {
      export_checks(configs.with_wrong_type, inits.with_number, "JsonLogic", {});
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
