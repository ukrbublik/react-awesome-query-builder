/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { Conv } from "./types";
import {
  Config,
} from "@react-awesome-query-builder/core";


const logger = console; // (Utils.OtherUtils as any).logger as typeof console; // todo: at end


export const buildConv = (config: Config): Conv => {
  const operators: Record<string, string[]> = {};
  for (const opKey in config.operators) {
    const opConfig = config.operators[opKey];
    const isGroupOp = config.settings.groupOperators?.includes(opKey);
    if (opConfig.sqlOps) {
      // examples: "==", "eq", ".contains", "matches" (can be used for starts_with, ends_with)
      opConfig.sqlOps?.forEach(sqlOp => {
        const opk = sqlOp; // + "/" + getOpCardinality(opConfig);
        if (!operators[opk])
          operators[opk] = [];
        operators[opk].push(opKey);
      });
    } else if (opConfig.sqlOp) {
      const opk = opConfig.sqlOp;
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);
    } else {
      // todo
      if (!isGroupOp) {
        logger.log(`[sql] No sqlOp for operator ${opKey}`);
      }
    }
  }

  const conjunctions: Record<string, string> = {};
  for (const conjKey in config.conjunctions) {
    const conjunctionDefinition = config.conjunctions[conjKey];
    const ck = conjunctionDefinition.sqlConj || conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

  // let funcs = {};
  // for (const [funcPath, funcConfig] of iterateFuncs(config)) {
  //   let fks = [];
  //   const {sqlFunc} = funcConfig;
  //   if (typeof sqlFunc === "string") {
  //     const optionalArgs = Object.keys(funcConfig.args || {})
  //       .reverse()
  //       .filter(argKey => !!funcConfig.args[argKey].isOptional || funcConfig.args[argKey].defaultValue != undefined);
  //     const funcSignMain = sqlFunc
  //       .replace(/\${(\w+)}/g, (_, _k) => "?");
  //     const funcSignsOptional = optionalArgs
  //       .reduce((acc, argKey) => (
  //         [
  //           ...acc,
  //           [
  //             argKey,
  //             ...(acc[acc.length-1] || []),
  //           ]
  //         ]
  //       ), [])
  //       .map(optionalArgKeys => (
  //         sqlFunc
  //           .replace(/(?:, )?\${(\w+)}/g, (found, a) => (
  //             optionalArgKeys.includes(a) ? "" : found
  //           ))
  //           .replace(/\${(\w+)}/g, (_, _k) => "?")
  //       ));
  //     fks = [
  //       funcSignMain,
  //       ...funcSignsOptional,
  //     ];
  //   }
  //   for (const fk of fks) {
  //     if (!funcs[fk])
  //       funcs[fk] = [];
  //     funcs[fk].push(funcPath);
  //   }
  // }

  // let valueFuncs = {};
  // for (let w in config.widgets) {
  //   const widgetDef = config.widgets[w];
  //   const {sqlImportFuncs, type} = widgetDef;
  //   if (sqlImportFuncs) {
  //     for (const fk of sqlImportFuncs) {
  //       if (typeof fk === "string") {
  //         const fs = fk.replace(/\${(\w+)}/g, (_, k) => "?");
  //         const argsOrder = [...fk.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
  //         if (!valueFuncs[fs])
  //           valueFuncs[fs] = [];
  //         valueFuncs[fs].push({
  //           w,
  //           argsOrder
  //         });
  //       }
  //     }
  //   }
  // }

  // let opFuncs = {};
  // for (let op in config.operators) {
  //   const opDef = config.operators[op];
  //   const {sqlOp} = opDef;
  //   if (sqlOp?.includes("${0}")) {
  //     const fs = sqlOp.replace(/\${(\w+)}/g, (_, k) => "?");
  //     const argsOrder = [...sqlOp.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
  //     if (!opFuncs[fs])
  //       opFuncs[fs] = [];
  //     opFuncs[fs].push({
  //       op,
  //       argsOrder
  //     });
  //   }
  // }
  // // Special .compareTo()
  // const compareToSS = compareToSign.replace(/\${(\w+)}/g, (_, k) => "?");
  // opFuncs[compareToSS] = [{
  //   op: "!compare",
  //   argsOrder: ["0", "1"]
  // }];

  return {
    operators,
    conjunctions,
    // funcs,
    // valueFuncs,
    // opFuncs,
  };
};
