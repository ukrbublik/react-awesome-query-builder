import * as configs from "../support/configs";
import * as inits from "../support/inits";
import { export_checks, with_qb } from "../support/utils";
import chai from "chai";
import { ReactWrapper } from "enzyme";
const { expect } = chai;
// warning: don't put `export_checks` inside `it`

describe("LHS func", () => {
  describe("load forom SpEL", () => {
    describe(".toLowerCase().startsWith()", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_lhs_toLowerCase, "SpEL", {
        "query": "LOWER(str) Starts with \"aaa\"",
        "queryHuman": "Lowercase(String: String) Starts with aaa",
        "sql": "LOWER(str) LIKE 'aaa%'",
        "spel": "str.toLowerCase().startsWith('aaa')",
        // todo: Operator starts_with is not supported
        "mongo": {
          "$expr": {
            "$regex": [
              {
                "$toLower": "$str"
              },
              "^aaa"
            ]
          }
        }
      });
    });

    describe(".toLowerCase().toUpperCase()", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_lhs_toLowerCase_toUpperCase, "SpEL", {
        "sql": "UPPER(LOWER(str)) = UPPER(str)",
        "spel": "str.toLowerCase().toUpperCase() == str.toUpperCase()",
        "mongo": {
          "$expr": {
            "$eq": [
              {
                "$toUpper": {
                  "$toLower": "$str"
                }
              },
              {
                "$toUpper": "$str"
              }
            ]
          }
        },
        "logic": {
          "and": [
            {
              "==": [
                {
                  "toUpperCase": [
                    {
                      "toLowerCase": [
                        { "var": "str" }
                      ]
                    }
                  ]
                },
                {
                  "toUpperCase": [
                    { "var": "str" }
                  ]
                }
              ]
            }
          ]
        }
      });
    });

    // describe("new Date()", () => {
    //   export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_new_Date, "SpEL");
    // });

    // describe("new SimpleDateFormat().parse()", () => {
    //   export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_SimpleDateFormat, "SpEL");
    // });

    describe("T(LocalTime).parse()", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_LocalTime, "SpEL", {
        "spel": "time.compareTo(T(java.time.LocalTime).parse('02:03:00')) == 0",
        "logic": {
          "and": [
            {
              "==": [
                { "var": "time" },
                7380
              ]
            }
          ]
        },
      });
    });

    describe("new String().toUpperCase()", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_new_String, "SpEL", {
        "sql": "str = UPPER('hello world')",
        "spel": "str == 'hello world'.toUpperCase()",
        "logic": {
          "and": [
            {
              "==": [
                { "var": "str" },
                {
                  "toUpperCase": [
                    "hello world"
                  ]
                }
              ]
            }
          ]
        }
      });
    });

    describe(".compareTo() + T(LocalDateTime).now().plusDays()", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_lhs_compareTo, "SpEL", {
        "sql": "datetime < DATE_ADD(NOW(), INTERVAL 6 day)",
        "spel": "datetime.compareTo(T(java.time.LocalDateTime).now().plusDays(6)) < 0",
        "logic": {
          "and": [
            {
              "<": [
                { "var": "datetime" },
                {
                  "date_add": [
                    { "now": [] },
                    6,
                    "day"
                  ]
                }
              ]
            }
          ]
        }
      });
    });

    describe(".compareTo() + T(LocalDateTime).parse(v, T(DateTimeFormatter).ofPattern(p))", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_lhs_compareTo_parse, "SpEL", {
        "sql": "datetime = '2005-11-12 11:11:12.000'",
        "spel": "datetime.compareTo(T(java.time.LocalDateTime).parse('2005-11-12 11:11:12', T(java.time.format.DateTimeFormatter).ofPattern('yyyy-MM-dd HH:mm:ss'))) == 0",
        "logic": {
          "and": [
            {
              "==": [
                { "var": "datetime" },
                "2005-11-12T11:11:12.000Z"
              ]
            }
          ]
        }
      });
    });

    describe(".compareTo() + T(LocalDateTime).parse(v, T(DateTimeFormatter).ofPattern(p)).plusDays()", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_lhs_compareTo_parse_plusDays, "SpEL", {
        "sql": "datetime > DATE_ADD('2023-01-01 00:00:00', INTERVAL 7 day)",
        "spel": "datetime.compareTo(T(java.time.LocalDateTime).parse('2023-01-01 00:00:00', T(java.time.format.DateTimeFormatter).ofPattern('yyyy-MM-dd HH:mm:ss')).plusDays(7)) > 0",
        "logic": {
          "and": [
            {
              ">": [
                { "var": "datetime" },
                {
                  "date_add": [
                    "2023-01-01T00:00:00.000Z",
                    7,
                    "day"
                  ]
                }
              ]
            }
          ]
        }
      });
    });
  });

  describe("defaultValue, isOptional", () => {
    describe("fills defaultValue when loading from SpeL", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.spel_with_lhs_toLowerCase2, "SpEL", {
        "spel": "str.toLowerCase2(11) == 'aaa'",
        "query": "LOWER2(str, 11) == \"aaa\"",
        "queryHuman": "Lowercase2(String: String, def: 11) = aaa",
        "sql": "LOWER2(str, 11) = 'aaa'",
        "mongo": {
          "$expr": {
            "$eq": [
              {
                "$toLower2": [
                  "$str",
                  11
                ]
              },
              "aaa"
            ]
          }
        },
        "logic": {
          "and": [
            {
              "==": [
                {
                  "toLowerCase2": [
                    { "var": "str" },
                    11
                  ]
                },
                "aaa"
              ]
            }
          ]
        }
      });
    });

    describe("uses defaultValue on export", () => {
      export_checks([configs.with_fieldSources, configs.with_funcs], inits.tree_with_lhs_toLowerCase2, "default", {
        "spel": "str.toLowerCase2(11) == 'aaa'",
        "query": "LOWER2(str, 11) == \"aaa\"",
        "queryHuman": "Lowercase2(String: String, def: 11) = aaa",
        "sql": "LOWER2(str, 11) = 'aaa'",
        "mongo": {
          "$expr": {
            "$eq": [
              {
                "$toLower2": [
                  "$str",
                  11
                ]
              },
              "aaa"
            ]
          }
        },
        "logic": {
          "and": [
            {
              "==": [
                {
                  "toLowerCase2": [
                    { "var": "str" },
                    11
                  ]
                },
                "aaa"
              ]
            }
          ]
        }
      }, [
        // validation:
        "custom.LOWER2 = aaa  >>  * [lhs] Value of arg def for func custom.LOWER2 is required"
      ]);
    });
  });

  describe("interactions on vanilla", () => {
    const getLhsOptions = (qb: ReactWrapper, fieldSrc: string) => {
      const select = fieldSrc == "func"
        ? qb.find(".rule .rule--field--func .rule--func select")
        : qb.find(".rule .rule--field select").at(0);
      const fieldOptions = Object.fromEntries(select
        .find("option")
        .map((o, i) => ([
          o.getDOMNode().getAttribute("value"),
          o.getDOMNode().getAttribute("style"),
        ]))
        .filter(([v, _s]) => !!v)) as Record<string, string | undefined>;
      const allOptions = Object.keys(fieldOptions);
      const boldOptions = Object.keys(fieldOptions).filter(k => fieldOptions[k]?.includes("bold"));
      return [allOptions, boldOptions];
    };

    const getFuncsOptions = (qb: ReactWrapper) => getLhsOptions(qb, "func");
    const getFieldsOptions = (qb: ReactWrapper) => getLhsOptions(qb, "field");

    const selectFieldSrc = (qb: ReactWrapper, val: string) => {
      qb
        .find(".rule .rule--fieldsrc select")
        .simulate("change", { target: { value: val } });
    };

    const selectField = (qb: ReactWrapper, val: string) => {
      qb
        .find(".rule .rule--field select")
        .simulate("change", { target: { value: val } });
    };

    const selectFieldFunc = (qb: ReactWrapper, val: string) => {
      qb
        .find(".rule .rule--field--func .rule--func select")
        .simulate("change", { target: { value: val } });
    };

    const setFieldFuncArgValue = (qb: ReactWrapper, ind: number, val: string) => {
      qb
        .find(".rule .rule--field--func .rule--func--args .rule--func--arg")
        .at(ind)
        .find(".rule--func--arg-value .rule--widget .widget--widget input")
        .simulate("change", { target: { value: val } });
    };

    const setRhsValue = (qb: ReactWrapper, val: string) => {
      qb
        .find(".rule .rule--value .widget--widget input")
        .simulate("change", { target: { value: val } });
    };

    it("change field source to func, and vice versa", async () => {
      await with_qb([
        configs.with_fieldSources, configs.with_funcs, configs.with_keepInputOnChangeFieldSrc
      ], inits.with_text, "JsonLogic", (qb, {expect_jlogic}) => {
        // select src = func
        selectFieldSrc(qb, "func");
        expect_jlogic([null, undefined], 0);

        // check that text funcs are bold, other ones - not
        const [allOptions, boldOptions] = getFuncsOptions(qb);
        expect(boldOptions.length).to.be.lessThan(allOptions.length);
        expect(boldOptions).to.include.members(["LOWER", "UPPER"]);
        expect(boldOptions).to.not.include.members(["NOW", "RELATIVE_DATETIME", "LINEAR_REGRESSION"]);

        // select LOWER
        selectFieldFunc(qb, "LOWER");
        expect_jlogic([null, undefined], 1);

        // select arg for LOWER
        setFieldFuncArgValue(qb, 0, "ggg");
        // RHS should be preserved
        expect_jlogic([null,
          { "and": [{ "==": [ { "toLowerCase": [ "ggg" ] }, "abc" ] }] }
        ], 2);

        // select UPPER
        selectFieldFunc(qb, "UNKNOWN!"); // should not produce error
        selectFieldFunc(qb, "UPPER");
        // RHS should be preserved
        expect_jlogic([null,
          { "and": [{ "==": [ { "toUpperCase": [ "ggg" ] }, "abc" ] }] }
        ], 3);
        // bold marks should remain
        const [allOptions2, boldOptions2] = getFuncsOptions(qb);
        expect(boldOptions2.length).to.equal(3);
        expect(allOptions2.length).to.equal(allOptions2.length);

        // select NOW
        selectFieldFunc(qb, "NOW");
        expect_jlogic([null, undefined], 4);
        // there should not be bold marks
        const [allOptions3, boldOptions3] = getFuncsOptions(qb);
        expect(boldOptions3.length).to.equal(0);
        expect(allOptions3.length).to.equal(allOptions2.length);
        setRhsValue(qb, "2020-05-05");
        expect_jlogic([null,
          { "and": [{ "==": [ { "now": [] }, "2020-05-05T00:00:00.000Z" ] }] }
        ], 5);
  
        // select src = field
        selectFieldSrc(qb, "field");
        expect_jlogic([null, undefined], 6);
        // check that datetime fields are bold, other ones - not
        const [allOptions4, boldOptions4] = getFieldsOptions(qb);
        expect(boldOptions4.length).to.be.lessThan(allOptions4.length);
        expect(boldOptions4).to.include.members(["datetime"]);

        // select datetime field
        selectField(qb, "datetime");
        // RHS should be preserved
        expect_jlogic([null,
          { "and": [{ "==": [ { "var": "datetime" }, "2020-05-05T00:00:00.000Z" ] }] }
        ], 7);
      }, {
        ignoreLog: (errText) => {
          return errText.includes("No config for LHS Map { \"func\": \"UNKNOWN!\"");
        }
      });
    });
  });

});