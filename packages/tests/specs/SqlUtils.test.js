import { Utils } from "@react-awesome-query-builder/ui";
import { expect } from "chai";

describe("ExportUtils.SqlString", () => {
  describe("escapeStr + unescapeStr", () => {
    const tests = [
      {
        key: "special chars",
        str: " ' \" \\ \n \r ",
        outByDialect: {
          "PostgreSQL": "' '' \" \\ \n \r '",
          "MySQL":      "' \\' \\\" \\\\ \\n \\r '",
        }
      },
      {
        key: "other special chars",
        str: " \t \b \f \v \0 \x1a $ ",
        outByDialect: {
          "PostgreSQL": "' \t \b \f \v  \x1a $ '",
          "MySQL":      "' \\t \\b \f \v \\0 \\Z $ '",
        }
      },
      // todo
      // {
      //   key: "unicode",
      //   str: " \u00A0 \u00A1 \u00A2 \u00A3 \u00A4 \u00A5 \u00A6 \u00A7 \u00A8 \u00A9 ",
      //   outByDialect: {
      //     "PostgreSQL": "' \\u00A0 \\u00A1 \\u00A2 \\u00A3 \\u00A4 \\u00A5 \\u00A6 \\u00A7 \\u00A8 \\u00A9 '",
      //     "MySQL":      "' \\xC2\\xA0 \\xC2\\xA1 \\xC2\\xA2 \\xC2\\xA3 \\xC2\\xA4 \\xC2\\xA5 \\xC2\\xA6 \\xC2\\xA7 \\xC2\\xA8 \\xC2\\xA9 '",
      //   }
      // },
    ];
    for (const test of tests) {
      const { key, str: origStr, outByDialect } = test;
      describe(`${key || origStr}`, () => {
        for (const [sqlDialect, escapedString] of Object.entries(outByDialect)) {
          it(`sqlDialect == ${sqlDialect}`, () => {
            const escaped = Utils.ExportUtils.SqlString.escapeStr(origStr, sqlDialect);
            expect(escaped, "escapeStr()").to.eql(escapedString);
            const unescapedStr = Utils.ExportUtils.SqlString.unescapeStr(escapedString, sqlDialect);
            const roundtripStr = sqlDialect === "PostgreSQL" ? origStr.replace(/\0/g, "") : origStr;
            expect(unescapedStr, "unescapeStr()").to.eql(roundtripStr);
          });
        }
      });
    }
  });

  describe("unescapeStr", () => {
    const tests = [
      {
        key: "2x single quotes",
        escaped: "'f\"\"o''o'",
        orig: "f\"\"o'o",
        sqlDialect: "MySQL",
      },
      {
        key: "2x double quotes",
        escaped: '"f\'\'o""o"',
        orig: 'f\'\'o"o',
        sqlDialect: "MySQL",
      },
      {
        key: "disappearing backslash",
        escaped: "'disappearing\\ backslash'",
        orig: "disappearing backslash",
        sqlDialect: "MySQL",
      },
      {
        key: "special chars with E",
        escaped: "E' \\' '' \\\" \\\\ \\n \\r '",
        orig: " ' ' \" \\ \n \r ",
        sqlDialect: "PostgreSQL",
      },
      {
        key: "hex with E",
        escaped: "E' \\x3F '",
        orig: " ? ",
        sqlDialect: "PostgreSQL",
      },
      {
        key: "unicode with E",
        escaped: "E' \\u03A9 \\uD83D\\uDE02 \\U0001F51F \\uD83D\\uDD1F '",
        orig: " Ω 😂 🔟 🔟 ",
        sqlDialect: "PostgreSQL",
      },
      {
        key: "unicode with U&",
        escaped: "U&' d\\0061''t\\+000061 \\0441\\043B\\043E\\043D \\0027 \\005c '",
        orig: " da'ta слон ' \\ ",
        sqlDialect: "PostgreSQL",
      },
      {
        key: "hex with X",
        escaped: "X'133FF26'",
        orig: String.fromCharCode(1)+"3ÿ&",
        sqlDialect: "PostgreSQL",
      },
      {
        key: "binary with B",
        escaped: "B'111111111111111101'",
        orig: String.fromCharCode(3)+"ÿý",
        sqlDialect: "PostgreSQL",
      },
      ///
      {
        key: "like with E",
        escaped: "E' \\\\_ \\\\% \\\\\\\\ \\' \\\" '' '",
        orig: " _ % \\ ' \" ' ",
        sqlDialect: "PostgreSQL",
        forLike: true,
      },
      {
        key: "like with wrong escapes with E",
        escaped: "E' \\0\\a1 \\\\? '",
        orig: " 0a1 ? ",
        sqlDialect: "PostgreSQL",
        forLike: true,
      },
      {
        key: "like with tricky wrong escapes with E",
        escaped: "E' \\\\'' \\\\\\' \\\\\\% \\% \\_ \\\\\\\" '",
        orig: " ' ' % % _ \" ",
        sqlDialect: "PostgreSQL",
        forLike: true,
      },
      {
        key: "like",
        escaped: "' \\_ \\% \\\\ \\\" '' \\'' \\6 '",
        orig: " _ % \\ \" ' ' 6 ",
        sqlDialect: "PostgreSQL",
        forLike: true,
      },
      {
        // todo: \' should break
        key: "like with wrong escapes",
        escaped: "' \\' '",
        orig: " ' ",
        sqlDialect: "PostgreSQL",
        forLike: true,
      },
      {
        key: "like",
        escaped: "' \\_ \\\\_ \\\\% \\\\\\\\ \\' \\\\'' '' \\\" \\[ \\1 \\\\1 '",
        orig: " _ _ % \\ ' ' ' \" [ 1 1 ",
        sqlDialect: "MySQL",
        forLike: true,
      },
      {
        // todo: \'' should break
        // \\\_ is a mistake
        key: "like with wrong escapes",
        escaped: "' \\'' \\\\\\_ '",
        orig: " ''  ",
        sqlDialect: "MySQL",
        forLike: true,
      },
    ];
    for (const test of tests) {
      const { key, escaped: escapedString, orig, sqlDialect, forLike } = test;
      it(`[${sqlDialect}] ${key || escapedString}`, () => {
        const unescapedStr = Utils.ExportUtils.SqlString.unescapeStr(escapedString, sqlDialect, undefined, forLike);
        expect(unescapedStr, "unescapeStr()").to.eql(orig);
      });
    }        
  });

  if(0)
  describe("escapeLike + unescapeLike", () => {
    const likeTests = [
      {
        key: "simple",
        str: "abc",
        anyStart: true,
        anyEnd: true,
        likeByDialect: {
          "": "'%abc%'",
          "MySQL": "'%abc%'",
          "BigQuery": "'%abc%'",
          "PostgreSQL": "'%abc%'",
          "XX": "'%abc%'",
        }
      },
      {
        key: "",
        str: " _ % \\  '  \" ", //  _ % \\  '  \" 
        anyStart: true,
        anyEnd: true,
        likeByDialect: {
          "":           "'% \\\\_ \\\\% \\\\\\\\  \\'  \\\" %'",   // '% \\_ \\% \\\\  \'  \" %'
          "MySQL":      "'% \\_ \\% \\\\\\\\  \\'  \\\" %'",       // '% \_ \% \\\\  \'  \" %'
          "BigQuery":   "'% \\\\_ \\\\% \\\\\\  \\'  \\\" %'",     // '% \\_ \\% \\\  \'  \" %'
          "PostgreSQL": "?", // todo
          "XX":         "'% \\\\_ \\\\% \\\\\\\\  \\'  \\\" %'",   // '% \\_ \\% \\\\  \'  \" %'
        }
      },
    ];

    for (const test of likeTests) {
      const { key, str: origStr, anyStart, anyEnd, likeByDialect } = test;
      describe(`${key || origStr}`, () => {
        for (const [sqlDialect, escapedString] of Object.entries(likeByDialect)) {
          it(`sqlDialect == ${sqlDialect}`, () => {
            const escaped = Utils.ExportUtils.SqlString.escapeLike(origStr, anyStart, anyEnd, sqlDialect);
            expect(escaped, "escapeLike()").to.eql(escapedString);
            const unescaped = Utils.ExportUtils.SqlString.unescapeLike(escapedString, sqlDialect);
            expect(unescaped.str, "unescapeLike().str").to.eql(origStr);
            expect(unescaped.anyStart, "unescapeLike().anyStart").to.eql(anyStart);
            expect(unescaped.anyEnd, "unescapeLike().anyEnd").to.eql(anyEnd);
          });
        }
      });
    }
  });
});