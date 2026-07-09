import { Utils, CoreConfig } from "@react-awesome-query-builder/core";
import { expect } from "chai";

const {
  loadFromJsonLogic, loadFromCel, checkTree, celFormat,
} = Utils;

const config = {
  ...CoreConfig,
  fields: {
    num: { label: "Num", type: "number" },
    str: { label: "Str", type: "text" },
    born: { label: "Born", type: "date" },
    sel: {
      label: "Sel", type: "select",
      fieldSettings: { listValues: [{ value: "x", title: "X" }, { value: "y", title: "Y" }, { value: "z", title: "Z" }] },
    },
    tags: {
      label: "Tags", type: "multiselect",
      fieldSettings: { listValues: [{ value: "a", title: "A" }, { value: "b", title: "B" }, { value: "c", title: "C" }] },
    },
  },
};

const celFromJsonLogic = (jl) => {
  const tree = checkTree(loadFromJsonLogic(jl, config), config);
  return celFormat(tree, config);
};

// -------------------------------------------------- export

describe("export to CEL", () => {
  it("equality with an integer", () => {
    expect(celFromJsonLogic({ "==": [{ var: "num" }, 5] })).to.equal("num == 5");
  });
  it("less-than with a double (no float suffix)", () => {
    expect(celFromJsonLogic({ "<": [{ var: "num" }, 2.5] })).to.equal("num < 2.5");
  });
  it("logical AND group", () => {
    expect(celFromJsonLogic({ and: [{ ">": [{ var: "num" }, 1] }, { "<": [{ var: "num" }, 10] }] }))
      .to.equal("(num > 1 && num < 10)");
  });
  it("between", () => {
    expect(celFromJsonLogic({ "<=": [1, { var: "num" }, 10] })).to.equal("(num >= 1 && num <= 10)");
  });
  it("string contains uses .contains()", () => {
    expect(celFromJsonLogic({ in: ["foo", { var: "str" }] })).to.equal("str.contains('foo')");
  });
  it("string escaping is C-style (backslash, not doubled quote)", () => {
    expect(celFromJsonLogic({ "==": [{ var: "str" }, "he'llo"] })).to.equal("str == 'he\\'llo'");
  });
  it("select equals", () => {
    expect(celFromJsonLogic({ "==": [{ var: "sel" }, "x"] })).to.equal("sel == 'x'");
  });
  it("is null", () => {
    expect(celFromJsonLogic({ "==": [{ var: "num" }, null] })).to.equal("num == null");
  });
});

// -------------------------------------------------- import (round-trip)

describe("import from CEL", () => {
  const roundTrips = [
    "num == 5",
    "num < 2.5",
    "(num > 1 && num < 10)",
    "(num == 1 || num == 2)",
    "(num >= 1 && num <= 10)",
    "str.contains('foo')",
    "str.startsWith('ab')",
    "str.endsWith('z')",
    "str == 'he\\'llo'",
    "sel == 'x'",
    "sel in ['x', 'y']",
    "num == null",
    "num != null",
    "!(num == 5)",
  ];
  for (const cel of roundTrips) {
    it(`round-trips ${JSON.stringify(cel)}`, () => {
      const [tree, errors] = loadFromCel(cel, config);
      expect(JSON.stringify(errors)).to.equal("[]");
      expect(tree, "tree should load").to.not.equal(undefined);
      const out = celFormat(checkTree(tree, config), config);
      expect(out).to.equal(cel);
    });
  }

  it("reports errors for unparseable CEL", () => {
    const [tree, errors] = loadFromCel("num === ", config);
    expect(errors.length).to.be.greaterThan(0);
    expect(tree).to.equal(undefined);
  });
});
