/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import {
  Utils, Config,
  JsonTree,
  ImmutableTree,
} from "@react-awesome-query-builder/core";
// import {getFieldConfig, getFuncConfig, extendConfig, normalizeField, iterateFuncs} from "../utils/configUtils";
// import {getWidgetForFieldOp} from "../utils/ruleUtils";
// import {loadTree} from "./tree";
// import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";
// import {getOpCardinality, logger, isJsonCompatible} from "../utils/stuff";

import {Parser as NodeSqlParser} from "node-sql-parser";


// todo: maybe use?
// Utils.uuid
// Utils.moment

const isObject = (v: any) => (typeof v == "object" && v !== null && !Array.isArray(v));

interface Meta {
  errors: string[];
}

export const loadFromSql = (sqlStr: string, config: Config): {tree: ImmutableTree, errors: string[]} => {
  //meta is mutable
  const meta: Meta = {
    errors: []
  };
  // const extendedConfig = Utils.ConfigUtils.extendConfig(config, undefined, false);
  // const conv = buildConv(extendedConfig);

  sqlStr = "SELECT * FROM t WHERE " + sqlStr;
  console.log(0, sqlStr);
  const parser1 = new NodeSqlParser();
  const ast1 = parser1.astify(sqlStr, {
    database: "Postgresql"
  });
  console.log(1, ast1);

  let compiledExpression;
  let convertedObj;
  let jsTree: JsonTree | undefined;


  //   try {
  //     const compileRes = SpelExpressionEvaluator.compile(spelStr);
  //     compiledExpression = compileRes._compiledExpression;
  //   } catch (e) {
  //     meta.errors.push(e);
  //   }
    
  //   if (compiledExpression) {
  //     //logger.debug("compiledExpression:", compiledExpression);
  //     convertedObj = postprocessCompiled(compiledExpression, meta);
  //     logger.debug("convertedObj:", convertedObj, meta);

  //     jsTree = convertToTree(convertedObj, conv, extendedConfig, meta);
  //     if (jsTree && jsTree.type != "group" && jsTree.type != "switch_group") {
  //       jsTree = wrapInDefaultConj(jsTree, extendedConfig, convertedObj["not"]);
  //     }
  //     logger.debug("jsTree:", jsTree);
  //   }

  const immTree: ImmutableTree = Utils.Import.loadTree(jsTree!);

  return {
    tree: immTree,
    errors: meta.errors
  };

};

export const _loadFromSqlAndPrintErrors = (sqlStr: string, config: Config): ImmutableTree => {
  const {tree, errors} = loadFromSql(sqlStr, config);
  if (errors.length)
    console.warn("Errors while importing from SQL:", errors);
  return tree;
};
