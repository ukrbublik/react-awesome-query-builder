/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { Conv, Meta, OutLogic } from "./types";
import {
  Config, SqlImportFunc, Utils, ConfigContext, DateTimeWidget,
  BaseWidget, MomentInput, SqlDialect, Widget
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
  double_quote_string: "text",
  backticks_quote_string: "text",
  var_string: "text",
  natural_string: "text",
  hex_string: "text",
  full_hex_string: "text",
  bit_string: "text",
  string: "text",
  regex_string: "text", // ?
  number: "number",
  null: "null",
  bool: "boolean",
  boolean: "boolean",
};


export const buildConv = (config: Config, meta: Meta): Conv => {
  const operators: Record<string, string[]> = {};
  const opFuncs: Record<string, SqlImportFunc[]> = {};
  const valueFuncs: Record<string, SqlImportFunc[]> = {
    datetime: [sqlImportDate],
    date: [sqlImportDate],
    time: [sqlImportDate],
  };

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

  for (const w in config.widgets) {
    const widgetDef = config.widgets[w] as BaseWidget;
    const {sqlImport} = widgetDef;
    if (sqlImport) {
      if (!valueFuncs[w])
        valueFuncs[w] = [] as SqlImportFunc[];
      valueFuncs[w].push(sqlImport);
    }
  }

  return {
    operators,
    conjunctions,
    opFuncs,
    valueFuncs,
  };
};


const sqlImportDate: SqlImportFunc = function (this: ConfigContext, sqlObj: OutLogic, wgtDef?: Widget, sqlDialect?: SqlDialect) {
  if (sqlObj?.children && [
    "TO_DATE", "TO_TIMESTAMP", "TO_TIMESTAMP_TZ", "TO_UTC_TIMESTAMP_TZ"
  ].includes(sqlObj.func!) && sqlObj.children.length >= 1) {
    const [valArg, _patternArg] = sqlObj!.children!;
    if (valArg?.valueType?.endsWith("_quote_string")) {
      const dateWidgetDef = wgtDef as DateTimeWidget;
      // tip: moment doesn't support SQL date format, so ignore patternArg
      const dateVal = this.utils.moment(valArg.value as MomentInput);
      if (dateVal.isValid()) {
        return {
          value: dateVal.format(dateWidgetDef?.valueFormat),
        };
      } else {
        return {
          value: null,
          error: "Invalid date",
        };
      }
    }
  }
  return undefined;
};
