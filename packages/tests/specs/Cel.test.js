import { Utils, CoreConfig } from "@react-awesome-query-builder/core";
import { expect } from "chai";

const {
  loadFromJsonLogic, loadFromCel, checkTree, loadTree, celFormat,
} = Utils;

const config = {
  ...CoreConfig,
  fields: {
    num: { label: "Num", type: "number" },
    num2: { label: "Num2", type: "number" },
    str: { label: "Str", type: "text" },
    flag: { label: "Flag", type: "boolean" },
    born: { label: "Born", type: "date" },
    sel: {
      label: "Sel", type: "select",
      fieldSettings: { listValues: [{ value: "x", title: "X" }, { value: "y", title: "Y" }, { value: "z", title: "Z" }] },
    },
    tags: {
      label: "Tags", type: "multiselect",
      fieldSettings: { listValues: [{ value: "a", title: "A" }, { value: "b", title: "B" }, { value: "c", title: "C" }] },
    },
    cars: {
      label: "Cars", type: "!group", mode: "array",
      subfields: {
        vendor: { label: "Vendor", type: "select", fieldSettings: { listValues: [{ value: "Toyota" }, { value: "BMW" }] } },
        year: { label: "Year", type: "number" },
      },
    },
    results: {
      label: "Results", type: "!struct",
      subfields: {
        product: { label: "Product", type: "select", fieldSettings: { listValues: [{ value: "abc" }, { value: "def" }] } },
        score: { label: "Score", type: "number" },
      },
    },
  },
};

const uuid = Utils.uuid;
const rule = (field, operator, value = [], valueType) => ({
  type: "rule", id: uuid(),
  properties: { field, operator, value, valueSrc: value.map(() => "value"), valueType: valueType || value.map(() => null) },
});
const celFromTree = (children, props = { conjunction: "AND" }) =>
  celFormat(checkTree(loadTree({ id: uuid(), type: "group", properties: { conjunction: "AND" }, children1: children }), config), config);

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
  it("not_between", () => {
    expect(celFromJsonLogic({ "!": { "<=": [1, { var: "num" }, 10] } })).to.equal("(num < 1 || num > 10)");
  });
  it("negated (reverse) operators wrap with !()", () => {
    expect(celFromJsonLogic({ "!": { in: ["ab", { var: "str" }] } })).to.equal("!(str.contains('ab'))");
  });
  it("booleans", () => {
    expect(celFromJsonLogic({ "==": [{ var: "flag" }, true] })).to.equal("flag == true");
  });
  it("negative numbers", () => {
    expect(celFromJsonLogic({ "==": [{ var: "num" }, -3] })).to.equal("num == -3");
  });
  it("field-to-field comparison", () => {
    expect(celFromJsonLogic({ "==": [{ var: "num" }, { var: "num2" }] })).to.equal("num == num2");
  });
  it("NOT group and nested OR", () => {
    expect(celFromJsonLogic({ "!": { and: [{ ">": [{ var: "num" }, 0] }] } })).to.equal("!(num > 0)");
  });

  it("struct group qualifies child fields (no aggregation)", () => {
    const g = {
      id: uuid(), type: "rule_group", properties: { conjunction: "AND", field: "results" },
      children1: [rule("results.product", "select_equals", ["abc"], ["select"]), rule("results.score", "greater", [8], ["number"])],
    };
    expect(celFromTree([g])).to.equal("(results.product == 'abc' && results.score > 8)");
  });

  it("array group aggregates with size(filter) and a count comparison", () => {
    const g = {
      id: uuid(), type: "rule_group",
      properties: { mode: "array", operator: "greater", value: [2], valueSrc: ["value"], valueType: ["number"], conjunction: "AND", field: "cars" },
      children1: [rule("cars.vendor", "select_equals", ["Toyota"], ["select"]), rule("cars.year", "greater_or_equal", [2010], ["number"])],
    };
    expect(celFromTree([g])).to.equal("size(cars.filter(_cars, (_cars.vendor == 'Toyota' && _cars.year >= 2010))) > 2");
  });

  it("array group with 'some' mode uses exists()", () => {
    const g = {
      id: uuid(), type: "rule_group", properties: { mode: "some", conjunction: "AND", field: "cars" },
      children1: [rule("cars.year", "greater_or_equal", [2010], ["number"])],
    };
    expect(celFromTree([g])).to.equal("cars.exists(_cars, _cars.year >= 2010)");
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
    "tags == ['a', 'b']",
    "tags.exists(_v, _v in ['a', 'b'])",
    "num == null",
    "num != null",
    "!(num == 5)",
  ];
  for (const cel of roundTrips) {
    it(`round-trips ${JSON.stringify(cel)}`, async () => {
      const [tree, errors] = await loadFromCel(cel, config);
      expect(JSON.stringify(errors)).to.equal("[]");
      expect(tree, "tree should load").to.not.equal(undefined);
      const out = celFormat(checkTree(tree, config), config);
      expect(out).to.equal(cel);
    });
  }

  // hand-written CEL that isn't in canonical export form still imports, and
  // re-exports to the canonical string
  const normalizations = [
    ["num==5", "num == 5"],
    ["str == \"hi\"", "str == 'hi'"],
    ["((num > 5))", "num > 5"],
    ["  num   ==   5  ", "num == 5"],
    ["!(!(num == 5))", "num == 5"],
    ["num > 1 && num < 9 && num != 5", "(num > 1 && num < 9 && num != 5)"],
  ];
  for (const [input, expected] of normalizations) {
    it(`normalizes ${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, async () => {
      const [tree, errors] = await loadFromCel(input, config);
      expect(JSON.stringify(errors)).to.equal("[]");
      const out = celFormat(checkTree(tree, config), config);
      expect(out).to.equal(expected);
    });
  }

  it("reports errors for unparseable CEL", async () => {
    const [tree, errors] = await loadFromCel("num === ", config);
    expect(errors.length).to.be.greaterThan(0);
    expect(tree).to.equal(undefined);
  });

  it("rejects arithmetic instead of silently dropping terms", async () => {
    const [tree, errors] = await loadFromCel("num + 1 == 5", config);
    expect(errors.length).to.be.greaterThan(0);
    expect(tree).to.equal(undefined);
  });
});
