/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { Conv, FuncArgsObj, Meta, OperatorObj, OutLogic, ValueObj } from "./types";
import {
  Config, JsonRule, JsonGroup, JsonSwitchGroup, JsonCaseGroup, CaseGroupProperties, FieldConfigExt,
  BaseWidget, Utils, ValueSource, RuleProperties, SqlImportFunc, JsonAnyRule,
  FuncArg,
  Func,
  FuncValue,
  Field,
} from "@react-awesome-query-builder/core";
import { getLogicDescr } from "./ast";
import { SqlPrimitiveTypes } from "./conv";
import { ValueExpr } from "node-sql-parser";


export const convertToTree = (
  logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic, returnGroup = false
): JsonRule | JsonGroup | JsonSwitchGroup | JsonCaseGroup | undefined => {
  if (!logic) return undefined;

  let res;
  if (logic.operator) {
    res = convertOp(logic, conv, config, meta, parentLogic);
  } else if (logic.conj) {
    res = convertConj(logic, conv, config, meta, parentLogic);
  } else if (logic.ternaryChildren) {
    res = convertTernary(logic, conv, config, meta, parentLogic);
  } else {
    meta.errors.push(`Unexpected logic: ${getLogicDescr(logic)}`);
  }

  // todo

  if (returnGroup && res && res.type != "group" && res.type != "switch_group") {
    res = wrapInDefaultConj(res, config, logic.not);
  }

  return res;
};

const convertTernary = (logic: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): JsonSwitchGroup => {
  const { ternaryChildren } = logic;
  const cases = (ternaryChildren ?? []).map(([cond, val]) => {
    return buildCase(cond, val, conv, config, meta, logic);
  }) as JsonCaseGroup[];
  return {
    type: "switch_group",
    children1: cases,
  };
};

const buildCase = (cond: OutLogic | undefined, val: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): JsonCaseGroup | undefined => {
  const valProperties = buildCaseValProperties(config, meta, conv, val, parentLogic);

  let caseI: JsonCaseGroup | undefined;
  if (cond) {
    caseI = convertToTree(cond, conv, config, meta, parentLogic, true) as JsonCaseGroup;
    if (caseI && caseI.type) {
      caseI.type = "case_group";
    } else {
      meta.errors.push(`Unexpected case: ${JSON.stringify(caseI)}`);
      caseI = undefined;
    }
  } else {
    caseI = {
      type: "case_group",
      properties: {}
    };
  }

  if (caseI) {
    caseI.properties = {
      ...caseI.properties,
      ...valProperties,
    };
  }

  return caseI;
};

const buildCaseValProperties = (config: Config, meta: Meta, conv: Conv, val: OutLogic, parentLogic?: OutLogic): CaseGroupProperties => {
  const caseValueFieldConfig = Utils.ConfigUtils.getFieldConfig(config, "!case_value") as FieldConfigExt;
  const widget = caseValueFieldConfig?.mainWidget!;
  const widgetConfig = config.widgets[widget] as BaseWidget;
  const convVal = convertArg(val, conv, config, meta, parentLogic)!;
  if (convVal && convVal.valueSrc === "value") {
    // @ts-ignore
    convVal.valueType = (widgetConfig.type || caseValueFieldConfig.type || convVal.valueType);
  }
  const valProperties = {
    value: [convVal.value],
    valueSrc: [convVal.valueSrc as ValueSource],
    valueType: [convVal.valueType! as string],
    field: "!case_value",
  };
  return valProperties;
};

const convertConj = (logic: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): JsonGroup => {
  const { conj, children } = logic;
  const conjunction = conv.conjunctions[conj!];
  const convChildren = (children || []).map(a => convertToTree(a, conv, config, meta, logic)).filter(c => !!c) as JsonGroup[];
  return {
    type: "group",
    properties: {
      conjunction,
      not: logic.not,
    },
    children1: convChildren,
  };
};


const convertOp = (logic: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): JsonRule | undefined => {
  const opKeys = conv.operators[logic.operator!];
  let opKey = opKeys?.[0];
  let convChildren, convFuncOp;
  if (opKeys.length != 1) {
    // todo: cover other cases like is_empty, proximity
    convFuncOp = convertOpFunc(logic, conv, config, meta, parentLogic)!;
    if (convFuncOp) {
      opKey = convFuncOp.operator!;
      convChildren = convFuncOp.children;
    } else {
      if (!opKeys.length) {
        meta.errors.push(`Can't convert op ${getLogicDescr(logic)}`);
        return undefined;
      } else {
        // todo
        meta.warnings.push(`SQL operator "${logic.operator}" can be converted to several operators: ${opKeys.join(", ")}`);
      }
    }
  }
  if (!convChildren) {
    convChildren = (logic.children || []).map(a => convertArg(a, conv, config, meta, logic));
  }

  const [left, ...right] = (convChildren || []).filter(c => !!c);
  // todo: 2 right for between
  const properties: RuleProperties = {
    operator: opKey,
    value: [],
    valueSrc: [],
    valueType: [],
    field: undefined,
  };
  if (left?.valueSrc === "field") {
    properties.field = left.value;
    properties.fieldSrc = "field";
    // todo: support tableName ?
  } else if (left?.valueSrc === "func") {
    properties.field = left.value;
    properties.fieldSrc = left.valueSrc;
  }
  // todo: left/right can be func
  right.forEach((v, i) => {
    if (v) {
      properties.valueSrc![i] = v?.valueSrc as ValueSource;
      properties.valueType![i] = v?.valueType!;
      properties.value[i] = v?.value;
    }
  });
  return {
    type: "rule",
    properties,
  };
};

const convertArg = (logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): ValueObj | undefined => {
  const { fieldSeparator } = config.settings;
  if (logic?.valueType) {
    const sqlType = logic?.valueType;
    const valueType = SqlPrimitiveTypes[sqlType];
    if (!valueType) {
      meta.warnings.push(`Unexpected value type ${sqlType}`);
    }
    const value = logic.value; // todo: convert ?
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (logic?.field) {
    const field = [logic.table, logic.field].filter(v => !!v).join(fieldSeparator);
    const fieldConfig = Utils.ConfigUtils.getFieldConfig(config, field) as Field | undefined;
    const valueType = fieldConfig?.type;
    return {
      valueSrc: "field",
      valueType,
      value: field,
    };
  } else if (logic?.func) {
    return convertFunc(logic, conv, config, meta, parentLogic);
  } else {
    meta.errors.push(`Unexpected arg: ${getLogicDescr(logic)}`);
  }
  return undefined;
};

const convertFuncArg = (logic: any, argConfig: FuncArg | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): ValueObj => {
  if (typeof logic === "object" && logic !== null && !Array.isArray(logic)) {
    return convertArg(logic as OutLogic, conv, config, meta, parentLogic)!;
  }
  return {
    valueSrc: "value",
    value: logic,
    //valueType: // todo: see SpelPrimitiveTypes[spel.type] or argConfig
  };
};

const useImportFunc = (
  sqlImport: SqlImportFunc, logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta
): FuncArgsObj | OperatorObj | undefined => {
  let parsed: Record<string, any> | undefined;
  try {
    parsed = sqlImport.call(config.ctx, logic!);
  } catch(_e) {
    // can't be parsed
  }

  if (parsed) {
    if (parsed?.children) {
      return {
        operator: parsed.operator ?? meta.opKey,
        children: (parsed as OutLogic).children?.map(ch => convertArg(ch, conv, config, meta, logic)),
      } as OperatorObj;
    } else if (parsed?.args) {
      const funcKey = parsed?.func as string ?? meta.funcKey;
      const funcConfig = Utils.ConfigUtils.getFuncConfig(config, funcKey);
      const argsObj: FuncArgsObj = {};
      for (const argKey in parsed) {
        const argLogic = parsed[argKey] as OutLogic;
        const argConfig = funcConfig?.args[argKey];
        argsObj[argKey] = convertFuncArg(argLogic, argConfig, conv, config, meta, logic);
      }
      return argsObj;
    }
  }

  return undefined;
};


const convertOpFunc = (logic: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): OperatorObj | undefined => {
  for (const opKey in conv.opFuncs) {
    for (const f of conv.opFuncs[opKey]) {
      const parsed = useImportFunc(f, logic, conv, config, {...meta, opKey: opKey});
      if (parsed) {
        return parsed as OperatorObj;
      }
    }
  }
  return undefined;
};

const convertFunc = (logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): ValueObj | undefined => {
  let funcKey: string | undefined, argsObj: FuncArgsObj | undefined, funcConfig: Func | undefined | null;

  for (const [f, fc] of Utils.ConfigUtils.iterateFuncs(config)) {
    const { sqlFunc, sqlImport } = fc;
    if (sqlImport) {
      // todo: types: always SqlImportFunc
      const parsed = useImportFunc(sqlImport as SqlImportFunc, logic, conv, config, {...meta, funcKey: f});
      if (parsed) {
        funcKey = f;
        funcConfig = Utils.ConfigUtils.getFuncConfig(config, funcKey);
        argsObj = parsed as FuncArgsObj;
        break;
      }
    }
    if (sqlFunc && sqlFunc === logic?.func) {
      funcKey = f;
      funcConfig = Utils.ConfigUtils.getFuncConfig(config, funcKey);
      argsObj = {};
      let argIndex = 0;
      for (const argKey in funcConfig!.args) {
        const argLogic = logic.children?.[argIndex];
        const argConfig = funcConfig?.args[argKey];
        argsObj[argKey] = convertFuncArg(argLogic, argConfig, conv, config, meta, logic);
        argIndex++;
      }
      break;
    }
  }

  if (funcKey) {
    const funcArgs: FuncArgsObj = {};
    for (const argKey in funcConfig?.args) {
      const argConfig = funcConfig.args[argKey];
      let argVal = argsObj?.[argKey];
      if (argVal === undefined) {
        argVal = argConfig?.defaultValue;
        if (argVal === undefined) {
          if (argConfig?.isOptional) {
            //ignore
          } else {
            meta.errors.push(`No value for arg ${argKey} of func ${funcKey}`);
            return undefined;
          }
        } else {
          argVal = {
            value: argVal,
            valueSrc: (argVal as any)["func"] ? "func" : "value",
            valueType: argConfig.type,
          };
        }
      }
      if (argVal)
        funcArgs[argKey] = argVal;
    }

    return {
      valueSrc: "func",
      value: {
        func: funcKey,
        args: funcArgs
      } as FuncValue,
      valueType: funcConfig!.returnType,
    };
  } else {
    meta.errors.push(`Unexpected func: ${getLogicDescr(logic)}`);
    return undefined;
  }
};

const wrapInDefaultConj = (rule: JsonAnyRule, config: Config, not = false): JsonGroup => {
  return {
    type: "group",
    id: Utils.uuid(),
    children1: [
      rule,
    ],
    properties: {
      conjunction: Utils.DefaultUtils.defaultConjunction(config),
      not: not || false
    }
  };
};
