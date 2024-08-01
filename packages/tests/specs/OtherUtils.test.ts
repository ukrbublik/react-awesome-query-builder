import { Utils } from "@react-awesome-query-builder/ui";
import { expect } from "chai";
// warning: don't put `export_checks` inside `it`
import deepEqualInAnyOrder from "deep-equal-in-any-order";
chai.use(deepEqualInAnyOrder);


describe("OtherUtils", () => {
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

    it("can set undefined value with _v", () => {
      const bef = {a: "a", x: {y: 1}};
      const aft = Utils.OtherUtils.mergeIn(bef, {a: {_v: undefined}, x: {y: 1, z: {_v: undefined}}});
      expect(aft).to.eql({a: undefined, x: {y: 1, z: undefined}});
    });

    it("respects _canCreate", () => {
      const bef = {x: {xx: 1}};
      const aft = Utils.OtherUtils.mergeIn(bef, {x: {add: "add"}, y: {_canCreate: false, add: "add"}, z: {_canCreate: false, _v: "zz"}});
      expect(aft).to.eql({x: {xx: 1, add: "add"}});

      const aft2 = Utils.OtherUtils.mergeIn(bef, {x: {add: "add"}, y: {_canCreate: true, add: "add"}, z: {_canCreate: true, _v: "zz"}});
      expect(aft2).to.eql({x: {xx: 1, add: "add"}, y: {add: "add"}, z: "zz"});
    });

    it("respects _canChangeType", () => {
      const bef = {x: {xx: 1}, y: ["yy"], z: ["z", "z"]};
      const aft = Utils.OtherUtils.mergeIn(bef, {x: {_v: ["x"], _canChangeType: false}, y: {_canChangeType: false, add: "add"}, z: ["zz"]});
      expect(aft).to.eql({x: {xx: 1}, y: ["yy"], z: ["zz", "z"]});
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.x === aft.x).to.eq(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(bef.y === aft.y).to.eq(true);

      const aft2 = Utils.OtherUtils.mergeIn(bef, {x: {_v: ["x"], _canChangeType: true}, y: {_canChangeType: true, add: "add"}, z: {_v: ["zz"]}});
      expect(aft2).to.eql({x: ["x"], y: {add: "add"}, z: ["zz"]});

      const aft3 = Utils.OtherUtils.mergeIn(bef, {x: {_canChangeType: true, _type: "array", 1: "1"}});
      expect(aft3).to.eql({x: [undefined, "1"], y: ["yy"], z: ["z", "z"]});
    });

    it("respects arrays with _type", () => {
      const bef = {a: [
        {aa: "a"},
        {bb: "b", cc:
          [ 0, 1, 2, {dd: 1}, 44, {x: 1}, {}, 7, 8, 9 ]
        }
      ]};
      const aft = Utils.OtherUtils.mergeIn(bef, {a: {
        _type: "array",
        0: {aa: "aa"},
        1: {
          bb: "bb",
          cc: {
            _type: "array",
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

    //todo: _replace: (old) => (new)
    //todo: insert in aray ???
    //todo: find in [] by predicate ??
  });
});
