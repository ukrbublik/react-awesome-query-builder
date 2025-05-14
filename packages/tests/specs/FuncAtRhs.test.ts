import * as configs from "../support/configs";
import * as inits from "../support/inits";
import {
  export_checks
} from "../support/utils";
import chai from "chai";
const { expect } = chai;
const {
  with_all_types,
  with_fieldSources,
  with_funcs,
} = configs;
// warning: don't put `export_checks` inside `it`

describe("RHS func", () => {
  describe("load from SpEL", () => {

    describe("T(LocalTime).parse()", () => {
      export_checks([with_fieldSources, with_all_types, with_funcs], inits.spel_with_LocalTime, "SpEL", {
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
      export_checks([with_fieldSources, with_all_types, with_funcs], inits.spel_with_new_String, "SpEL", {
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
      export_checks([with_fieldSources, with_all_types, with_funcs], inits.spel_with_datetime_compareTo, "SpEL", {
        "sql": "datetime < DATE_ADD(NOW(), INTERVAL 6 day)",
        "spel": "datetime.compareTo(T(java.time.LocalDateTime).now().plusDays(6)) < 0",
        "logic": {
          "and": [
            {
              "<": [
                { "var": "datetime" },
                {
                  "datetime_add": [
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

    describe(".compareTo() + T(LocalDate).now().plusDays()", () => {
      export_checks([with_fieldSources, with_all_types, with_funcs], inits.spel_with_date_compareTo, "SpEL", {
        "sql": "date < DATE_ADD(CURDATE(), INTERVAL 6 day)",
        "spel": "date.compareTo(T(java.time.LocalDate).now().plusDays(6)) < 0",
        "logic": {
          "and": [
            {
              "<": [
                { "var": "date" },
                {
                  "date_add": [
                    { "today": [] },
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
      export_checks([with_fieldSources, with_all_types, with_funcs], inits.spel_with_datetime_compareTo_parse, "SpEL", {
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
      export_checks([with_fieldSources, with_all_types, with_funcs], inits.spel_with_datetime_compareTo_parse_plusDays, "SpEL", {
        "sql": "datetime > DATE_ADD('2023-01-01 00:00:00', INTERVAL 7 day)",
        "spel": "datetime.compareTo(T(java.time.LocalDateTime).parse('2023-01-01 00:00:00', T(java.time.format.DateTimeFormatter).ofPattern('yyyy-MM-dd HH:mm:ss')).plusDays(7)) > 0",
        "logic": {
          "and": [
            {
              ">": [
                { "var": "datetime" },
                {
                  "datetime_add": [
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
});
