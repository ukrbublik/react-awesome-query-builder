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

describe("@util", () => {
  describe("OtherUtils.setIn()", () => {
    it("throws if path is incorrect", () => {
      expect(() => Utils.OtherUtils.setIn({}, ["a", "b"], 1)).to.throw();
      expect(() => Utils.OtherUtils.setIn({}, ["a"], 1)).not.to.throw();
    });

    it("can create", () => {
      const bef = {};
      const aft = Utils.OtherUtils.setIn(bef, ["x", "y"], 11, {canCreate: true});
      expect(aft).to.eql({x: {y: 11}});
    });

    it("can rewrite", () => {
      const bef = {xx: {yy: 22}, x: 2};
      const aft = Utils.OtherUtils.setIn(bef, ["x", "y"], 11, {canCreate: true, canRewrite: true});
      expect(bef.xx === aft.xx).to.eq(true);
      expect(aft).to.eql({x: {y: 11}, xx: {yy: 22}});
    });
  });

  describe("OtherUtils.mergeIn()", () => {
    it("throws", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => Utils.OtherUtils.mergeIn("" as any, {})).to.throw();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => Utils.OtherUtils.mergeIn(undefined as any, {})).to.throw();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => Utils.OtherUtils.mergeIn({}, undefined as any)).to.throw();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => Utils.OtherUtils.mergeIn({}, [])).to.throw();
    });
    
    it("noop if mixin is empty", () => {
      const bef = {a: "a", x: []};
      const aft = Utils.OtherUtils.mergeIn(bef, {});
      expect(aft).to.eql(bef);
      expect(bef === aft).to.eq(true);
    });

    it("noop if mixin does nothing", () => {
      const bef = {a: "a", x: []};
      const aft = Utils.OtherUtils.mergeIn(bef, {y: undefined});
      expect(aft).to.eql(bef);
      expect(bef === aft).to.eq(true);
    });

    it("noop if deep mixin does nothing", () => {
      const bef = {a: "a", x: {}};
      const aft = Utils.OtherUtils.mergeIn(bef, {y: undefined, x: {g: undefined}});
      expect(aft).to.eql(bef);
      expect(bef === aft).to.eq(true);
    });

    it("NOT noop if mixin creates empty {}", () => {
      const bef = {a: "a", x: {}};
      const aft = Utils.OtherUtils.mergeIn(bef, {y: undefined, x: {g: {}}});
      expect(aft).to.eql({a: "a", x: {g: {}}});
      expect(bef === aft).to.eq(false);
    });

    it("can overwrite [] to {}", () => {
      const bef = {a: "a", x: []};
      const aft = Utils.OtherUtils.mergeIn(bef, {x: {y: "y", z: "z"}});
      expect(aft).to.eql({a: "a", x: {y: "y", z: "z"}});
    });
  
    it("can overwrite {} to primitive", () => {
      const bef = {a: "a", x: {}};
      const aft = Utils.OtherUtils.mergeIn(bef, {x: "x"});
      expect(aft).to.eql({a: "a", x: "x"});
    });
  
    it("can merge deeply", () => {
      const bef = {a: "a", x: {y: 1}, z: {zz: {zzz: 3, aaa: 1}}};
      const aft = Utils.OtherUtils.mergeIn(bef, {z: {zz: {zzz: 4, ddd: 5}}});
      expect(aft).to.eql({a: "a", x: {y: 1}, z: {zz: {zzz: 4, aaa: 1, ddd: 5}}});
    });
  
    it("can delete key if value is undefined in mixin", () => {
      const bef = {a: "a", x: {y: 1}, z: {zz: {zzz: {zzzz: 0}, aaa: [1]}}, keeped: [2]};
      const aft = Utils.OtherUtils.mergeIn(bef, {x: undefined, z: {zz: {zzz: undefined, miss: undefined}}});
      expect(aft).to.eql({a: "a", z: {zz: {aaa: [1]}}, keeped: [2]});
      expect(bef.keeped === aft.keeped).to.eq(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.z.zz.aaa === aft.z.zz.aaa).to.eq(true);
    });
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
