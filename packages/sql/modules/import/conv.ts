/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { Conv, Meta } from "./types";
import {
  Config, SqlImportFunc, Utils,
} from "@react-awesome-query-builder/core";
import { ValueExpr } from "node-sql-parser";

const logger = Utils.OtherUtils.logger;

export const manuallyImportedOps: string[] = [
];
export const unsupportedOps: string[] = [
  "some", "all", "none",
];
// sql type => raqb type
export const SqlPrimitiveTypes: Record<string, string> = {
  single_quote_string: "text",
  number: "number",
  null: "null",
  bool: "boolean",
  // todo: others? see ValueExpr["type"]
};


export const buildConv = (config: Config, meta: Meta): Conv => {
  const operators: Record<string, string[]> = {};
  const opFuncs: Record<string, SqlImportFunc[]> = {};

  for (const opKey in config.operators) {
    const opConfig = config.operators[opKey];
    // const isGroupOp = config.settings.groupOperators?.includes(opKey);
    const sqlOps = opConfig.sqlOps ? opConfig.sqlOps : opConfig.sqlOp ? [opConfig.sqlOp] : undefined;
    if (opConfig.sqlImport) {
      if (!opFuncs[opKey])
        opFuncs[opKey] = [] as SqlImportFunc[];
      opFuncs[opKey].push(opConfig.sqlImport as SqlImportFunc);
    }
    if (sqlOps) {
      // examples of 2+: "==", "eq", ".contains", "matches" (can be used for starts_with, ends_with)
      sqlOps?.forEach(sqlOp => {
        if (!operators[sqlOp])
          operators[sqlOp] = [];
        operators[sqlOp].push(opKey);
      });
    } else {
      const revOpConfig = config.operators?.[opConfig.reversedOp!];
      const canUseRev = revOpConfig?.sqlOp || revOpConfig?.sqlOps || revOpConfig?.sqlImport;
      const canIgnore = canUseRev || opConfig.sqlImport
        || manuallyImportedOps.includes(opKey) || manuallyImportedOps.includes(opConfig.reversedOp!)
        || unsupportedOps.includes(opKey);
      if (!canIgnore) {
        logger.warn(`[sql] No sqlOp/sqlImport for operator ${opKey}`);
      }
    }
  }

  const conjunctions: Record<string, string> = {};
  for (const conjKey in config.conjunctions) {
    const conjunctionDefinition = config.conjunctions[conjKey];
    const ck = conjunctionDefinition.sqlConj || conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

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
    opFuncs,
    // funcs,
    // valueFuncs,
  };
};
