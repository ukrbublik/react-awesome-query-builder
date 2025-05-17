/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Utils } from "@react-awesome-query-builder/ui";
import { expect } from "chai";
// warning: don't put `export_checks` inside `it`
import deepEqualInAnyOrder from "deep-equal-in-any-order";
chai.use(deepEqualInAnyOrder);


describe("OtherUtils", () => {
  describe("mergeArraysSmart()", () => {
    it("works 1", () => {
      expect(Utils.OtherUtils.mergeArraysSmart(
        [1, 4, 9],
        [3, 5, 9]
      )).to.eql(
        [1, 4, 3, 5, 9]
      );
    });
    it("works 2", () => {
      expect(Utils.OtherUtils.mergeArraysSmart(
        [1, 3, 50, 60],
        [2, 3, 5, 6, 60, 7, 8],
      )).to.eql(
        [1, 2, 3, 5, 6, 50, 60, 7, 8]
      );
    });
    it("works 3", () => {
      expect(Utils.OtherUtils.mergeArraysSmart(
        [1, 4, 11],
        [3, 3.5, 4, 5, 9, 10, 11]
      )).to.eql(
        [1, 3, 3.5, 4, 5, 9, 10, 11]
      );
    });
  });

  describe("setIn()", () => {
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
      const aft = Utils.OtherUtils.setIn(bef, ["x", "y"], 11, {canCreate: true, canChangeType: true});
      expect(bef.xx === aft.xx).to.eq(true);
      expect(aft).to.eql({x: {y: 11}, xx: {yy: 22}});
    });
  });

  describe("mergeIn()", () => {
    const $v = Symbol.for("_v");
    const $type = Symbol.for("_type");
    const $canCreate = Symbol.for("_canCreate");
    const $canChangeType = Symbol.for("_canChangeType");
    //const $arrayMergeMode = Symbol.for("_arrayMergeMode");

    function withCanCreate<T>(o: T, v = true): T {
      Object.assign(o as object, {[$canCreate]: v});
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return o;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    function withCantCreate<T>(o: T): T {
      return withCanCreate(o, false);
    }

    it("throws", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => Utils.OtherUtils.mergeIn("" as any, {})).to.throw();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => Utils.OtherUtils.mergeIn(undefined as any, {})).to.throw();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(() => Utils.OtherUtils.mergeIn({}, undefined as any)).to.throw();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      // @ts-ignore
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.a === aft.a).to.eq(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.x === aft.x).to.eq(true);
    });
  
    it("must clone if deepCopyObj: true", () => {
      const bef = {a: "a", x: {y: 1}, z: {zz: {zzz: 3, aaa: 1}}};
      const aft = Utils.OtherUtils.mergeIn(bef, {z: {zz: {zzz: 4, ddd: 5}}}, { deepCopyObj: true });
      expect(aft).to.eql({a: "a", x: {y: 1}, z: {zz: {zzz: 4, aaa: 1, ddd: 5}}});
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.a === aft.a).to.eq(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.x === aft.x).to.eq(false);
    });
  
    it("can delete key if value is undefined in mixin", () => {
      const bef = {
        a: "a", x: {y: 1}, z: {zz: {zzz: {zzzz: 0}, aaa: [1]}}, keeped: [2]
      };
      const aft = Utils.OtherUtils.mergeIn(bef, {
        x: undefined, z: {zz: {zzz: undefined, miss: undefined}}
      });
      expect(aft).to.eql({a: "a", z: {zz: {aaa: [1]}}, keeped: [2]});
      expect(bef.keeped === aft.keeped).to.eq(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.z.zz.aaa === aft.z.zz.aaa).to.eq(true);
    });

    it("can set undefined value with Symbol.for('_v')", () => {
      const bef = {a: "a", x: {y: 1}};
      const aft = Utils.OtherUtils.mergeIn(bef, {
        a: {[$v]: undefined}, x: {y: 1, z: {[$v]: undefined}}
      });
      expect(aft).to.eql({a: undefined, x: {y: 1, z: undefined}});
    });

    it("respects Symbol.for('_canCreate')", () => {
      const bef = {x: {xx: 1}};
      const aft = Utils.OtherUtils.mergeIn(bef, {
        x: {add: "add"}, y: {[$canCreate]: false, add: "add"}, z: {[$canCreate]: false, [$v]: "zz"}
      });
      expect(aft).to.eql({x: {xx: 1, add: "add"}});

      const aft2 = Utils.OtherUtils.mergeIn(bef, {
        x: {add: "add"}, y: {[$canCreate]: true, add: "add"}, z: {[$canCreate]: true, [$v]: "zz"}
      });
      expect(aft2).to.eql({x: {xx: 1, add: "add"}, y: {add: "add"}, z: "zz"});

      // respects even for array
      const aft3 = Utils.OtherUtils.mergeIn(bef, {
        y: withCanCreate([1]), z: withCantCreate([2])
      });
      expect(aft3).to.eql({x: {xx: 1}, y: [1]});
    });

    it("respects Symbol.for('_canChangeType')", () => {
      const bef = {x: {xx: 1}, y: ["yy"], z: ["z", "z"]};
      const aft = Utils.OtherUtils.mergeIn(bef, {
        x: {[$v]: ["x"], [$canChangeType]: false}, y: {[$canChangeType]: false, add: "add"}, z: ["zz"]
      });
      expect(aft).to.eql({x: {xx: 1}, y: ["yy"], z: ["zz", "z"]});
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.x === aft.x).to.eq(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.y === aft.y).to.eq(true);

      const aft2 = Utils.OtherUtils.mergeIn(bef, {
        x: {[$v]: ["x"], [$canChangeType]: true}, y: {[$canChangeType]: true, add: "add"}, z: {[$v]: ["zz"]}
      });
      expect(aft2).to.eql({x: ["x"], y: {add: "add"}, z: ["zz"]});

      const aft3 = Utils.OtherUtils.mergeIn(bef, {
        x: {[$canChangeType]: true, [$type]: "array", 1: "1"}
      });
      expect(aft3).to.eql({x: [undefined, "1"], y: ["yy"], z: ["z", "z"]});
    });

    it("(deprecated) respects arrays with Symbol.for('_type')", () => {
      const bef = {a: [
        {aa: "a"},
        {bb: "b", cc:
          [ 0, 1, 2, {dd: 1}, 44, {x: 1}, {}, 7, 8, 9 ]
        }
      ]};
      const aft = Utils.OtherUtils.mergeIn(bef, {a: {
        [$type]: "array",
        0: {aa: "aa"},
        1: {
          bb: "bb",
          cc: {
            [$type]: "array",
            0: "0",
            1: "1",
            // skip `2`
            3: {ee: 2},
            4: undefined, // remove `44`
            5: {xx: 11},
            6: {zz: "zz"},
            7: undefined, // remove `7`
          }
        }
      }});
      expect(aft).to.eql({a: [
        {aa: "aa"},
        {bb: "bb", cc: [
          "0", "1", 2, {dd: 1, ee: 2}, {x: 1, xx: 11}, {zz: "zz"}, 8, 9
        ]}
      ]});
    });

    it("respects arrays", () => {
      const bef = {a: [
        1, {b: "b"}, 2, {c: "c"}, 3, {}
      ]};
      const aft = Utils.OtherUtils.mergeIn(bef, {a: [
        "11",
        undefined, // will not remove!
        22,
        {c: undefined, d: "d"},
        undefined
      ]});
      expect(aft).to.eql({a: [
        "11",
        undefined, // not removed!
        22,
        {d: "d"},
        undefined,
        {}
      ]});
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.a[5] === aft.a[5]).to.eql(true);
    });

    it("can join arrays with arrayMergeMode: 'join'", () => {
      const bef = {x: [1, 2, {a: 3}]};
      const aft = Utils.OtherUtils.mergeIn(bef, {
        x: [2, {a: 3}, 5]
      }, {
        arrayMergeMode: "join",
      });
      expect(aft).to.eql({x: [1, 2, {a: 3}, 2, {a: 3}, 5]});
    });

    it("can join arrays without repeats with arrayMergeMode: 'joinMissing'", () => {
      const bef = {x: [1, 2, {a: 3}]};
      const aft = Utils.OtherUtils.mergeIn(bef, {
        x: [2, {a: 3}, 5]
      }, {
        arrayMergeMode: "joinMissing",
      });
      expect(aft).to.eql({x: [1, 2, {a: 3}, {a: 3}, 5]});
    });

    it("can join arrays respecting order with arrayMergeMode: 'joinRespectOrder'", () => {
      const bef = {x: [1, 4, 9]};
      const aft = Utils.OtherUtils.mergeIn(bef, {
        x: [3, 5, 9]
      }, {
        arrayMergeMode: "joinRespectOrder",
      });
      expect(aft).to.eql({x: [1, 4, 3, 5, 9]});
    });

    it("can overwrite arrays with arrayMergeMode: 'overwrite'", () => {
      const bef = {x: [1, 4, 5]};
      const aft = Utils.OtherUtils.mergeIn(bef, {
        x: [4, 6, 2]
      }, {
        arrayMergeMode: "overwrite",
      });
      expect(aft).to.eql({x: [4, 6, 2]});
    });

  });
});
