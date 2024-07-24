import { Utils } from "@react-awesome-query-builder/core";
const { applyJsonLogic } = Utils.ConfigUtils;
import { expect } from "chai";

describe("JsonLogic", () => {
  describe("should add custom operations", () => {
    it("JSX, fromEntries, mergeObjects", () => {
      const jsxRes = applyJsonLogic({
        JSX: [
          "img",
          {mergeObjects: [
            {fromEntries:[ [ ["src", "1.png"] ] ]},
            {fromEntries:[ [ ["width", 100] ] ]}
          ]}
        ]
      });
      expect(jsxRes).to.satisfy(jsx => jsx.type === "img" && jsx.props.src === "1.png" && jsx.props.width === 100);
    });

    it("string operations", () => {
      expect(applyJsonLogic({strlen: "abc"})).to.eq(3);
      expect(applyJsonLogic({toLowerCase: "aBc"})).to.eq("abc");
      expect(applyJsonLogic({toUpperCase: "aBc"})).to.eq("ABC");
      expect(applyJsonLogic({regexTest: [ {var: "val"}, "^[A-Za-z0-9_-]+$" ]}, {val: "aa8"})).to.equal(true);
      expect(applyJsonLogic({regexTest: [ {var: "val"}, "^[A-Za-z0-9_-]+$" ]}, {val: "bb#"})).to.equal(false);
    });

    it("date operations", () => {
      expect(applyJsonLogic({now: []})).to.be.instanceOf(Date);
      const addRes = applyJsonLogic({date_add: [ {now: []}, 2, "year" ]});
      expect(addRes.getUTCFullYear()).to.equal(new Date().getUTCFullYear() + 2);
    });

    it("CALL", () => {
      expect(applyJsonLogic({
        CALL: [ {var: "mySum"}, null, {var: "a"}, {var: "b"} ]
      }, {
        mySum: (a, b) => a + b,
        a: 4,
        b: 7
      })).to.eq(11);
    });

  });
});
