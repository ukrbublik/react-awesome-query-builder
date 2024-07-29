/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import {
  Utils, Config,
  JsonTree,
  ImmutableTree,
} from "@react-awesome-query-builder/core";
import {
  Parser as NodeSqlParser, Option as SqlParseOption, AST,
  Select, Expr, Function as SqlFunction, ExpressionValue,
} from "node-sql-parser";

const isObject = (v: any) => (typeof v == "object" && v !== null && !Array.isArray(v));


interface Meta {
  errors: string[];
}

export const loadFromSql = (sqlStr: string, config: Config, options?: SqlParseOption): {tree: ImmutableTree | undefined, errors: string[]} => {
  //meta is mutable
  const meta: Meta = {
    errors: []
  };
  const logger = console; // (Utils.OtherUtils as any).logger as typeof console; // todo: at end
  const extendedConfig = Utils.ConfigUtils.extendConfig(config, undefined, false);
  // const conv = buildConv(extendedConfig);
  let jsTree: JsonTree | undefined;
  let sqlAst: AST | undefined;
  let compiledExpression; // todo
  let convertedObj; // todo

  if (!options) {
    options = {};
  }
  if (!options?.database) {
    // todo
    options.database = "Postgresql";
  }

  if (!sqlStr.startsWith("SELECT ")) {
    sqlStr = "SELECT * FROM t WHERE " + sqlStr;
  }

  const sqlParser = new NodeSqlParser();
  try {
    sqlAst = sqlParser.astify(sqlStr, options) as AST;
  } catch (exc) {
    const e = exc as Error;
    meta.errors.push(e.message);
  }

  if (sqlAst) {
    logger.debug("sqlAst:", sqlAst);
    convertedObj = processAst(sqlAst, meta);
    logger.debug("convertedObj:", convertedObj, meta);

    // jsTree = convertToTree(convertedObj, conv, extendedConfig, meta);
    // if (jsTree && jsTree.type != "group" && jsTree.type != "switch_group") {
    //   jsTree = wrapInDefaultConj(jsTree, extendedConfig, convertedObj["not"]);
    // }
    // logger.debug("jsTree:", jsTree);
  }

  const immTree = jsTree ? Utils.Import.loadTree(jsTree) : undefined;

  return {
    tree: immTree,
    errors: meta.errors
  };

};

const processAst = (sqlAst: AST, meta: Meta) => {
  if (sqlAst.type !== "select") {
    meta.errors.push(`Expected SELECT, but got ${sqlAst.type}`);
  }
  if (!(sqlAst as Select).where) {
    meta.errors.push("WHERE is missing");
  }
  const select = sqlAst as Select;
  const pWhere = processLogic(select.where, meta);
  return {
    where: pWhere,
  };
};

//todo: types
type OutLogic = Record<string, any>;
type Logic = Expr | SqlFunction | ExpressionValue;

const processLogic = (where: Logic | null, meta: Meta, not = false): OutLogic | undefined => {
  if (!where) {
    return undefined;
  }
  if (where.type === "function") {
    return processFunc(where as SqlFunction, meta, not);
  } else if (where.type === "binary_expr") {
    if (["AND", "OR"].includes((where as Expr).operator)) {
      return processConj(where as Expr, meta, not);
    } else {
      return processBinaryOp(where as Expr, meta, not);
    }
  } else if (where.type === "unary_expr") {
    if ((where as any).operator === "NOT") {
      const subFilter = (where as any).expr as Expr | SqlFunction;
      return processLogic(subFilter, meta, !not);
    } else {
      meta.errors.push(`Unexpected unary operator ${(where as any).operator}`);
    }
  } else {
    meta.errors.push(`Unexpected logic type ${where.type}`);
  }
  return undefined;
};

const processConj = (expr: Expr, meta: Meta, not = false) => {
  const parentheses = (expr as any).parentheses as boolean;
  const conj = expr.operator;
  const rulesChain = [
    processLogic(expr.left, meta),
    processLogic(expr.right, meta),
  ];
  const rules: OutLogic[] = [];
  rulesChain.map((r: OutLogic) => {
    if (r?.conj === conj && !r.parentheses && !r.not) {
      rules.push(...r?.rules)
    } else {
      rules.push(r);
    }
  });
  // todo: parentheses or not - means wrap in group
  return {
    parentheses,
    not,
    conj,
    rules,
  };
};

const processBinaryOp = (expr: Expr, meta: Meta, not = false) => {
  //todo: recurs left, right
  //todo: mapping
  return {...expr, not};
};

const processFunc = (expr: SqlFunction, meta: Meta, not = false) => {
  const nameType = expr.name.name[0].type as string;
  const firstName = expr.name.name[0].value;
  if (nameType === "default" && firstName === "NOT") {
    if (expr.args?.type === "expr_list") {
      if (expr.args.value.length === 1) {
        const arg = expr.args.value[0];
        return processLogic(arg as any as Expr, meta, !not);
      } else {
        meta.errors.push(`Unexpected args for func NOT: ${JSON.stringify(expr.args.value)}`);
      }
    } else {
      meta.errors.push(`Unexpected args type of func NOT: ${JSON.stringify(expr.args?.type as any)}`);
    }
  } else {
    //todo: mapping
    meta.errors.push(`Unexpected function name ${JSON.stringify(expr.name.name)}`);
  }
  return undefined;
};

// export const _loadFromSqlAndPrintErrors = (sqlStr: string, config: Config): ImmutableTree => {
//   const {tree, errors} = loadFromSql(sqlStr, config);
//   if (errors.length)
//     console.warn("Errors while importing from SQL:", errors);
//   return tree;
// };
