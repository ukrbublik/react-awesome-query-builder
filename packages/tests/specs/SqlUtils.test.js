import { Utils } from "@react-awesome-query-builder/ui";
import { expect } from "chai";
import {
  Parser as NodeSqlParser, Option as SqlParseOption, AST,
} from "node-sql-parser";


describe("ExportUtils.SqlString", () => {
  const sqlParser = new NodeSqlParser();
  const parseString = (escapedString) => {
    return sqlParser.parse("select * from a where b like " + escapedString).ast.where.right.value;
  };
  const extractFromLike = (escapedString) => {
    const likeSrting = parseString(escapedString);
    if (likeSrting.startsWith("%") && likeSrting.endsWith("%")) {
      return likeSrting.substring(1, likeSrting.length - 1);
    } else if (likeSrting.startsWith("%")) {
      return likeSrting.substring(1);
    } else if (likeSrting.endsWith("%")) {
      return likeSrting.substring(0, likeSrting.length - 1);
    }
  };

  describe("escapeLike + unescapeLike", () => {
    const testString = " _ % \\  '  \" "; //  _ % \\  '  \" 
    it("no sqlDialect", () => {
      const a = " ' \" ";
      console.log(1, a)
      console.log(2, Utils.ExportUtils.SqlString.escape(a))
      console.log(3, parseString(Utils.ExportUtils.SqlString.escape(a)))
      const escapedString = "'% \\\\_ \\\\% \\\\\\\\  \\'  \\\" %'"; // '% \\_ \\% \\\\  \'  \" %'
      expect(Utils.ExportUtils.SqlString.escapeLike(testString), "escapeLike").to.eql(escapedString);
      expect(Utils.ExportUtils.SqlString.unescapeLike(extractFromLike(escapedString)), "unescapeLike").to.eql(testString);
    });
    // it("sqlDialect == MySQL", () => {
    //   const escapedString = "'% \\_ \\% \\\\\\\\  \\'  \\\" %'"; // '% \_ \% \\\\  \'  \" %'
    //   expect(Utils.ExportUtils.SqlString.escapeLike(testString, true, true, "MySQL"), "escapeLike").to.eql(escapedString);
    //   expect(Utils.ExportUtils.SqlString.unescapeLike(eval(escapedString), "MySQL"), "unescapeLike").to.eql(testString);
    // });
    // it("sqlDialect == BigQuery", () => {
    //   const escapedString = "'% \\\\_ \\\\% \\\\\\  \\'  \\\" %'"; // '% \\_ \\% \\\  \'  \" %'
    //   expect(Utils.ExportUtils.SqlString.escapeLike(testString, true, true, "BigQuery"), "escapeLike").to.eql(escapedString);
    //   expect(Utils.ExportUtils.SqlString.unescapeLike(escapedString, "BigQuery"), "unescapeLike").to.eql(testString);
    // });
    // it("sqlDialect == PostgreSQL", () => {
    //   const escapedString = "?"; // todo
    //   expect(Utils.ExportUtils.SqlString.escapeLike(testString, true, true, "PostgreSQL"), "escapeLike").to.eql(escapedString);
    //   expect(Utils.ExportUtils.SqlString.unescapeLike(escapedString, "PostgreSQL"), "unescapeLike").to.eql(testString);
    // });
    // it("sqlDialect == XX", () => {
    //   const escapedString = "'% \\\\_ \\\\% \\\\\\\\  \\'  \\\" %'"; // '% \\_ \\% \\\\  \'  \" %'
    //   expect(Utils.ExportUtils.SqlString.escapeLike(testString, true, true, "XX"), "escapeLike").to.eql(escapedString);
    //   expect(Utils.ExportUtils.SqlString.unescapeLike(escapedString, "XX"), "unescapeLike").to.eql(testString);
    // });
  });
});