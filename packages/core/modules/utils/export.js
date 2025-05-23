/* eslint-disable quotes */
import SqlStringOrig from "sqlstring";
import chunk from "lodash/chunk";

//////////  SQL

// todo: override SqlString.escape: if value is string - use escapeStr
// todo: rewrite SqlString.escapeId to support not only MySQL

// todo: move sql utils to ./sql.js
// todo: don't extend SqlString

// @deprecated Use dedicated utils instead
export { mongoEmptyValue } from "./mongoUtils";
export { spelEscape, spelFixList, spelFormatConcat, spelImportConcat } from "./spelUtils";

// todo: move to sqlUtils
export const SqlString = SqlStringOrig;

SqlString.trimQuote = (str, sqlDialect = undefined, literalType = undefined) => {
  if (typeof str !== "string") {
    return undefined;
  }
  if (sqlDialect === "PostgreSQL" && (literalType === "origin" || !literalType)) {
    const m = str.match(/^([EeBbXx]|[Uu]&)'(.+)'$/);
    if (m) {
      return {
        str: m[2],
        literalType: "single_quote_string",
        prefix: m[1].toUpperCase(),
      };
    }
  }
  // Note: Prefixes n, N, _utf8 (eg. N'some text') for MySQL are not supported
  if (!literalType) {
    if (str.startsWith("'") && str.endsWith("'")) {
      return {
        str: str.substring(1, str.length - 1),
        literalType: "single_quote_string",
      };
    }
    if (sqlDialect === "MySQL" && str.startsWith('"') && str.endsWith('"')) {
      return {
        str: str.substring(1, str.length - 1),
        literalType: "double_quote_string",
      };
    }
  }
  return {
    str,
    literalType,
  };
};

const wrapSQuote = (str) => {
  return "'" + str + "'";
};

const MYSQL_CHARS_ESCAPE_MAP = {
  '\0': '\\0',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\Z',
  '"': '\\"',
  '\'': '\\\'',
  '\\': '\\\\',
};

// https://github.com/mikesamuel/safesql/blob/c9944e8d6b0bdeb8c619847145ea2e32f866eab7/lib/pg-escaper.js#L74C1-L94C3
const PG_E_CHARS_ESCAPE_MAP = {
  __proto__: null,
  // See note on NUL above
  '\0': '',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\x1a',
  '"': '\\"',
  '$': '\\$',
  // This fails safe when we pick the wrong escaping convention for a
  // single-quote delimited string.
  // Empirically, from a psql10 client,
  // # SELECT e'foo''bar';
  //  ?column?
  // ----------
  //  foo'bar
  '\'': '\'\'',
  // '\'': '\\\'',
  '\\': '\\\\',
};

const MYSQL_CHARS_UNESCAPE_MAP = Object.fromEntries(
  Object.entries(MYSQL_CHARS_ESCAPE_MAP).map(([k, v]) => [v, k])
);

const PG_E_CHARS_UNESCAPE_MAP = {...Object.fromEntries(
  Object.entries(PG_E_CHARS_ESCAPE_MAP).map(([k, v]) => [v, k])
), ...{
  '\\\'': '\'',
}};

SqlString.escapeStr = (str, sqlDialect = undefined) => {
  let res = str;
  if (sqlDialect === "PostgreSQL") {
    // https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS-ESCAPE
    // The character with the code zero cannot be in a string constant.
    // Quoted identifiers can contain any character, except the character with code zero.
    res = res.replace(/'/g, "''");
    res = res.replace(/\0/g, "");
    res = wrapSQuote(res);
  } else if (sqlDialect === "MySQL" || !sqlDialect) {
    // https://dev.mysql.com/doc/refman/8.4/en/string-literals.html
    res = SqlString.escape(res);
  }
  return res;
};

SqlString.unescapeStr = (str, sqlDialect = undefined, literalType = undefined, forLike = false) => {
  if (typeof str !== "string") {
    return str;
  }
  let res = str;
  const t = SqlString.trimQuote(res, sqlDialect, literalType);
  res = t.str;
  literalType = t.literalType;
  if (sqlDialect === "PostgreSQL" && t.prefix === "E" && !forLike) {
    // https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS-ESCAPE
    res = res.replace(
      /''|\\(([0-7]{1,3})|x([0-9a-fA-F]{1,2})|u([0-9a-fA-F]{4})|U([0-9a-fA-F]{8})|(.))/g,
      (found, _chars, octal, hex, u16, u32, char) => {
        if (found === "''") {
          return "'";
        }
        if (found.startsWith("\\")) {
          if (PG_E_CHARS_UNESCAPE_MAP[found] !== undefined) {
            return PG_E_CHARS_UNESCAPE_MAP[found];
          }
          if (hex) {
            return String.fromCharCode(Number.parseInt(hex, 16));
          }
          if (octal) {
            return String.fromCharCode(Number.parseInt(octal, 8));
          }
          if (u16 ?? u32) {
            return String.fromCodePoint(Number.parseInt(u16 ?? u32, 16));
          }
          return char;
        }
        return found;
      }
    );
  } else if (sqlDialect === "PostgreSQL" && t.prefix === "E" && forLike) {
    res = res.replace(
      /\\\\\\\\|\\\\''|''|\\\\\\(.)|\\\\(.)|\\(.)/g,
      (found, sChar2, dChar, sChar) => {
        if (found.endsWith("''")) {
          // ignore leading \\
          return "'";
        }
        if (found === "\\\\\\\\") {
          return "\\";
        }
        if (dChar !== undefined) {
          if (["%", "_"].includes(dChar)) {
            return dChar; // real chars '%' or '_'
          }
          return dChar; // ignore leading \\
        }
        if (sChar !== undefined || sChar2 !== undefined) {
          // ignore leading \\ (for case of sChar2)
          const char = sChar ?? sChar2;
          const key = "\\" + char;
          if (PG_E_CHARS_UNESCAPE_MAP[key] !== undefined) {
            return PG_E_CHARS_UNESCAPE_MAP[key];
          } else if (["%", "_"].includes(char)) {
            return char; // ANY char for \_ (case of sChar) but real '_' char for \\\_ (case of sChar2) (same as \\_)
          } else {
            return char;
          }
        }
        return found;
      }
    );
  } else if (sqlDialect === "PostgreSQL" && t.prefix === "U&" && !forLike) {
    // https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-STRINGS-UESCAPE
    res = res.replace(
      /''|\\([+0-9a-fA-F]{4,8})/g,
      (found, uni) => {
        if (found === "''") {
          return "'";
        }
        if (found.startsWith("\\")) {
          return String.fromCodePoint(Number.parseInt(uni, 16));
        }
        return found;
      }
    );
  } else if (sqlDialect === "PostgreSQL" && t.prefix === "X" && !forLike) {
    // https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-BIT-STRINGS
    res = chunk(
      Array.from(res).reverse(), 2
    ).map(hex =>
      String.fromCharCode(
        Number.parseInt(hex.reverse().join(""), 16)
      )
    ).reverse().join("");
  } else if (sqlDialect === "PostgreSQL" && t.prefix === "B" && !forLike) {
    // https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-BIT-STRINGS
    res = chunk(
      Array.from(res).reverse(), 8
    ).map(hex =>
      String.fromCharCode(
        Number.parseInt(hex.reverse().join(""), 2)
      )
    ).reverse().join("");
  } else if (sqlDialect === "PostgreSQL" && !forLike) {
    res = res.replace(/''/g, "'");
  } else if (sqlDialect === "PostgreSQL" && forLike) {
    res = res.replace(
      /\\''|''|\\(.)/g,
      (found, char) => {
        if (found.endsWith("''")) {
          return "'";
        }
        if (found.startsWith("\\")) {
          if (["%", "_", "\\"].includes(char)) {
            return char;
          }
          return char; // ignore \ from output
        }
        return found;
      }
    );
  } else if ((sqlDialect === "MySQL" || !sqlDialect) && !forLike) {
    // https://dev.mysql.com/doc/refman/8.4/en/string-literals.html
    res = res.replace(/""|''|\\(.)/g, (found, char) => {
      if (found === '""' || found === "''") {
        if (found === '""' && literalType === "double_quote_string") {
          return '"';
        } else if (found === "''" && literalType === "single_quote_string") {
          return "'";
        }
        return found;
      }
      if (char !== undefined) {
        return MYSQL_CHARS_UNESCAPE_MAP[found] ?? char;
      }
      return found;
    });
  } else if ((sqlDialect === "MySQL" || !sqlDialect) && forLike) {
    // https://dev.mysql.com/doc/refman/8.4/en/string-comparison-functions.html#operator_like
    // it can be \_ or \\_ for escaping _ (and it means real '_' char anyway) BUT not \\\_
    // it's ALWAYS \\\\ for escaping one \
    res = res.replace(
      /\\\\\\\\|\\\\['"]{2}|['"]{2}|\\\\\\(.)|\\\\(.)|\\(.)/g,
      (found, sChar2, dChar, sChar) => {
        if (found.endsWith('""') || found.endsWith("''")) {
          // ignore leading \\
          if (found.endsWith('""') && literalType === "double_quote_string") {
            return '"';
          } else if (found.endsWith("''") && literalType === "single_quote_string") {
            return "'";
          }
          return found;
        }
        if (found === "\\\\\\\\") {
          return "\\";
        }
        if (dChar !== undefined) {
          if (["%", "_"].includes(dChar)) {
            return dChar; // real chars '%' or '_'
          }
          return dChar; // ignore leading \\
        }
        if (sChar !== undefined || sChar2 !== undefined) {
          // ignore leading \\ (for case of sChar2)
          const char = sChar ?? sChar2;
          const key = "\\" + char;
          if (MYSQL_CHARS_UNESCAPE_MAP[key] !== undefined) {
            return MYSQL_CHARS_UNESCAPE_MAP[key];
          } else if (["%", "_"].includes(char)) {
            if (sChar2 !== undefined) {
              return ""; // it's a mistake to use \\\_ or \\\%
            }
            return char;
          } else {
            return char;
          }
        }
        return found;
      }
    );
  } else if (sqlDialect === "BigQuery" && !forLike) {
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/lexical#string_and_bytes_literals
    // todo
  } else if (sqlDialect === "BigQuery" && forLike) {
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#like_operator
    // todo
  }
  return res;
};

const _unescapeLike = (likeStr, sqlDialect = undefined) => {
  if (typeof likeStr !== "string") {
    return likeStr;
  }
  let res = likeStr;
  if (!sqlDialect) {
    res = res.replace(/\\\\([%_])/g, "$1");
    res = res.replace(/\\(['"])/g, "$1"); // todo: not automatically ? 
    res = res.replace(/\\\\\\\\/g, "\\");
  }
  // if (sqlDialect === "BigQuery") {
  //   // https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#like_operator
  //   res = res.replace(/\\\\([%_])/g, "$1");
  // } else {
  //   res = res.replace(/\\\\([%_])/g, "$1");
  // }
  return res;
};

SqlString.unescapeLike = (likeStr, sqlDialect = undefined) => {
  let res = {
    anyStart: false,
    anyEnd: false,
    str: likeStr,
  };
  if (likeStr.startsWith("%") && likeStr.endsWith("%")) {
    res.str = likeStr.substring(1, likeStr.length - 1);
    res.anyStart = true;
    res.anyEnd = true;
  } else if (likeStr.startsWith("%")) {
    res.str = likeStr.substring(1);
    res.anyStart = true;
    res.anyEnd = false;
  } else if (likeStr.endsWith("%")) {
    res.str = likeStr.substring(0, likeStr.length - 1);
    res.anyStart = false;
    res.anyEnd = true;
  }
  res.str = _unescapeLike(res.str, sqlDialect);
  return res;
};

SqlString.escapeLike = (str, anyStart = true, anyEnd = true, sqlDialect = undefined) => {
  if (typeof str !== "string") {
    return str;
  }

  let res = str;

  if (!sqlDialect) {
    // escape % and _ and \ with \
    res = res.replace(/[%_\\]/g, "\\$&");
    // wrap with % for LIKE
    res = (anyStart ? "%" : "") + res + (anyEnd ? "%" : "");
    // escape (will escape all \ with \)
    res = SqlString.escape(res);
  } else {
    // normal escape
    res = SqlString.escape(res);
    // unwrap ''
    const t = SqlString.trimQuote(res, sqlDialect); // todo: literalType
    res = t.str;
    if (sqlDialect === "PostgreSQL") {
      // TODO: for PostgreSQL it should just replace ' -> '' (without \), for like it should escape % ) and \
      //!!!!!!
    } else if (sqlDialect === "BigQuery") {
      // https://cloud.google.com/bigquery/docs/reference/standard-sql/operators#like_operator
      // escape \ with \\
      res = res.replace(/(\\\\)/g, "\\$&");
      // escape % and _ with \\
      res = res.replace(/[%_]/g, "\\\\$&");
    } else if (sqlDialect === "MySQL") {
      // https://dev.mysql.com/doc/refman/8.4/en/string-comparison-functions.html
      // tip: for mysql it can be \_ or \\_ for escaping _ BUT it's ALWAYS \\\\ for one \
      // escape \ -> \\\\
      res = res.replace(/(\\\\)/g, "\\\\$&");
      // escape % and _ with \
      res = res.replace(/[%_]/g, "\\$&");
    } else {
      // escape \ -> \\\\
      res = res.replace(/(\\\\)/g, "\\\\$&");
      // escape % and _ with \\
      res = res.replace(/[%_]/g, "\\\\$&");
    }
    // wrap with % for LIKE
    res = (anyStart ? "%" : "") + res + (anyEnd ? "%" : "");
    // wrap with ''
    res = "'" + res + "'";
  }

  return res;
};

export const sqlEmptyValue = (fieldDef) => {
  let v = "''";
  const type = fieldDef?.type;
  if (type == "date") {
    //todo: support other SQL dialects?  0001-01-01 for oracle, 1970-01-01 for timestamp
    v = "'0000-00-00'";
  } else if (type == "datetime") {
    v = "'0000-00-00 00:00'";
  } else if (type == "time") {
    v = "'00:00'";
  } else if (type == "number") {
    v = "0";
  }
  return v;
};

export const stringifyForDisplay = (v) => (v == null ? "NULL" : v.toString());

export const wrapWithBrackets = (v) => {
  if (v == undefined)
    return v;
  if (v?.[0] === "(" && v?.[v?.length - 1] === ")") {
    // already wrapped
    return v;
  }
  return "(" + v + ")";
};
