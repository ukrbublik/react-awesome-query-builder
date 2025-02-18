import { Query, Builder, BasicConfig, Utils } from "@react-awesome-query-builder/ui";
import { AntdConfig } from "@react-awesome-query-builder/antd";
import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { with_qb, empty_value, export_checks } from "../support/utils";
import { expect } from "chai";
// warning: don't put `export_checks` inside `it`
import deepEqualInAnyOrder from "deep-equal-in-any-order";
chai.use(deepEqualInAnyOrder);

describe("library", () => {
  it("should be imported correctly", () => {
    expect(Query).to.exist;
    expect(Builder).to.exist;
    expect(BasicConfig).to.exist;
    expect(AntdConfig).to.exist;
  });
});

describe("basic query", () => {

  describe("strict mode", () => {
    it("should not produce warnings", async () => {
      await with_qb(configs.simple_with_number, empty_value, "default", (qb, { consoleData }) => {
        expect(qb.find(".query-builder")).to.have.length(1);
        const consoleErrors = consoleData.error?.join("\n");
        const consoleWarns = consoleData.warn?.join("\n");
        expect(consoleErrors).to.not.contain("componentWillReceiveProps");
        expect(consoleWarns).to.not.contain("componentWillReceiveProps");
      }, {
        strict: true,
        expectedLoadErrors: [
          "Root  >>  Empty query"
        ],
        // occurs only in debug mode
        // ignoreLog: (errText) => {
        //   return errText.includes(" is deprecated in StrictMode") && errText.includes("findDOMNode");
        // }
      });
    });
  });

  describe("import", () => {
    it("should work with empty value", async () => {
      await with_qb(configs.simple_with_number, empty_value, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      }, {
        expectedLoadErrors: [
          "Root  >>  Empty query"
        ]
      });
    });

    it("should work with empty JsonLogic tree", async () => {
      await with_qb(configs.simple_with_number, undefined, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      }, {
        //ignoreLog
      });
    });

    it("should work with empty group", async () => {
      await with_qb(configs.simple_with_number, inits.tree_with_empty_group, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      }, {
        expectedLoadErrors: [
          "Root  >>  Empty query",
          "Deleted group #1 (index path: 1)  >>  * Empty group"
        ]
      });
    });

    it("should work with simple value", async () => {
      await with_qb(configs.simple_with_number, inits.tree_with_number, "default", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    it("should work with simple value in JsonLogic format", async () => {
      await with_qb(configs.simple_with_number, inits.with_number, "JsonLogic", (qb) => {
        expect(qb.find(".query-builder")).to.have.length(1);
      });
    });

    describe("should work with simple value in SpEL format", () => {
      export_checks(configs.simple_with_number, inits.spel_with_number, "SpEL", {
        logic: {
          and: [
            { "==": [{ "var": "num" }, 2] }
          ]
        },
        spel: "num == 2"
      }, []);
    });

    describe("should work with between op in SpEL format", () => {
      export_checks(configs.simple_with_number, inits.spel_with_between, "SpEL", {
        logic: {
          "and": [
            {
              "<=": [
                1,
                { "var": "num" },
                2
              ]
            }
          ]
        },
        spel: "num >= 1 && num <= 2",
        mongo: {
          num: { $gte: 1, $lte: 2 }
        },
      }, []);

      // canShortMongoQuery should not affect on between op
      describe("canShortMongoQuery == false", () => {
        export_checks([configs.simple_with_number, configs.without_short_mongo_query], inits.spel_with_between, "SpEL", {
          mongo: {
            num: { $gte: 1, $lte: 2 }
          },
        });
      });
    });

    describe("should work with not_between op in SpEL format", () => {
      describe("reverseOperatorsForNot == true", () => {
        export_checks([configs.simple_with_number, configs.with_reverse_operators], inits.spel_with_not_between, "SpEL", {
          logic: {
            "and": [
              {
                "!": {
                  "<=": [ 1, { "var": "num" }, 2 ]
                }
              }
            ]
          },
          spel: "(num < 1 || num > 2)",
          mongo: {
            num: {
              $not: { $gte: 1, $lte: 2 }
            }
          },
        }, []);
      });

      // reverseOperatorsForNot should not affect
      describe("reverseOperatorsForNot == false", () => {
        export_checks([configs.simple_with_number], inits.spel_with_not_between, "SpEL", {
          logic: {
            "and": [
              {
                "!": {
                  "<=": [ 1, { "var": "num" }, 2 ]
                }
              }
            ]
          },
          spel: "(num < 1 || num > 2)",
          mongo: {
            num: {
              $not: { $gte: 1, $lte: 2 }
            }
          },
        });
      });

      // canShortMongoQuery should not affect on not_between op
      describe("canShortMongoQuery == false", () => {
        export_checks([configs.simple_with_number, configs.without_short_mongo_query], inits.spel_with_not_between, "SpEL", {
          mongo: {
            num: {
              $not: { $gte: 1, $lte: 2 }
            }
          },
        });
      });
    });

    describe("should work with simple value in JsonLogic format not in group", () => {
      export_checks(configs.simple_with_number, inits.with_number_not_in_group, "JsonLogic", {
        query: "num == 2",
        queryHuman: "Number = 2",
        sql: "num = 2",
        mongo: {num: 2},
        logic: {
          and: [
            { "==": [{ "var": "num" }, 2] }
          ]
        },
      }, []);
    });

    describe("should handle undefined value in JsonLogic format", () => {
      export_checks(configs.simple_with_number, inits.with_undefined_as_number, "JsonLogic", {
        logic: undefined,
      }, [
        "Can't parse logic undefined",
        // validation:
        "Root  >>  Empty query"
      ]);
    });

    describe("should handle unexpected json logic value in JsonLogic format", () => {
      export_checks(configs.simple_with_number, inits.with_jl_value, "JsonLogic", {
        logic: undefined,
      }, [
        "Unexpected logic in value: {\"+\":[1,2]}",
        // tree is undefined, so no validation errors
      ]);
    });

    describe("should handle unknown field", () => {
      export_checks(configs.simple_with_number, inits.with_nested, "JsonLogic", {
        logic: undefined,
      }, [
        "No config for field user.info.firstName",
        // validation:
        "Root  >>  Empty query"
      ]);
    });

    describe("should handle unknown type", () => {
      export_checks(configs.with_wrong_type, inits.with_number, "JsonLogic", {
        logic: undefined,
      }, [
        "No widget for type not-a-text",
        // validation:
        "Root  >>  Empty query"
      ]);
    });

    describe("should import @epoch timestamp ms from JL", () => {
      export_checks([configs.with_date_and_time], inits.with_date_epoch_ms, "JsonLogic", {
        logic: {
          "and": [
            {
              "==": [
                {
                  "var": "datetime"
                },
                "2025-01-13T15:39:28.000Z"
              ]
            }
          ]
        }
      });
    });

    describe("should import @epoch timestamp sec from JL if configured", () => {
      export_checks([configs.with_date_and_time, configs.with_datetime_import_epoch_sec_jl], inits.with_date_epoch, "JsonLogic", {
        logic: {
          "and": [
            {
              "==": [
                {
                  "var": "datetime"
                },
                "2025-01-13T15:39:28.000Z"
              ]
            }
          ]
        }
      });
    });

    describe("should export @epoch timestamp ms to JL if configured", () => {
      export_checks([configs.with_date_and_time, configs.with_datetime_export_epoch_ms_jl], inits.with_date_epoch_ms, "JsonLogic", {
        logic: inits.with_date_epoch_ms
      });
    });

  });

  describe("export", () => {
    export_checks([configs.simple_with_number], inits.tree_with_number, "default", {
      spel: "num == 2",
      query: "num == 2",
      queryHuman: "Number = 2",
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
