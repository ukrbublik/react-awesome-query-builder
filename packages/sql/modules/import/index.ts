/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import {
  Utils, Config, JsonTree, ImmutableTree,
} from "@react-awesome-query-builder/core";
import {
  Parser as NodeSqlParser, Option as SqlParseOption, AST,
} from "node-sql-parser";
import type { Meta, OutSelect } from "./types";
import { processAst } from "./ast";
import { buildConv } from "./conv";
import { convertToTree } from "./convert";


const logger = console; // (Utils.OtherUtils as any).logger as typeof console; // todo: at end


export const loadFromSql = (sqlStr: string, config: Config, options?: SqlParseOption): {tree: ImmutableTree | undefined, errors: string[]} => {
  const extendedConfig = Utils.ConfigUtils.extendConfig(config, undefined, false);
  const conv = buildConv(extendedConfig);
  let jsTree: JsonTree | undefined;
  let sqlAst: AST | undefined;
  let convertedObj: OutSelect | undefined;
  const meta: Meta = {
    errors: [], // mutable
  };

  // Normalize
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
    logger.debug("sqlAst:", sqlAst);
  } catch (exc) {
    const e = exc as Error;
    meta.errors.push(e.message);
  }

  if (sqlAst) {
    convertedObj = processAst(sqlAst, meta);
    logger.debug("convertedObj:", convertedObj, meta);
    meta.convertedObj = convertedObj;

    jsTree = convertToTree(convertedObj?.where ?? convertedObj?.select, conv, extendedConfig, meta, undefined, true) as JsonTree;
    logger.debug("jsTree:", jsTree);
  }

  const immTree = jsTree ? Utils.Import.loadTree(jsTree) : undefined;

  return {
    tree: immTree,
    errors: meta.errors
  };
};

// export const _loadFromSqlAndPrintErrors = (sqlStr: string, config: Config): ImmutableTree => {
//   const {tree, errors} = loadFromSql(sqlStr, config);
//   if (errors.length)
//     console.warn("Errors while importing from SQL:", errors);
//   return tree;
// };
