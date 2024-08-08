/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { Conv, Meta, OutLogic } from "./types";
import {
  Config, JsonRule, JsonGroup, JsonSwitchGroup, JsonCaseGroup, CaseGroupProperties, FieldConfigExt,
  BaseWidget, Utils, ValueSource, RuleProperties, SqlImportFunc, JsonAnyRule,
} from "@react-awesome-query-builder/core";
import { getLogicDescr } from "./ast";


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

const convertOp = (logic: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): JsonRule => {
  const { operator, children } = logic;
  const opKeys = conv.operators[operator!];
  if (opKeys.length != 1) {
    // todo
  }
  const opKey = opKeys?.[0];
  const [left, ...right] = (children || []).map(a => convertArg(a, conv, config, meta, logic)).filter(c => !!c);
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

const convertArg = (logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic) => {
  const { fieldSeparator } = config.settings;
  if (logic?.valueType) {
    const valueType = undefined; // todo
    const value = logic.value; // todo: convert ?
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (logic?.field) {
    const valueType = undefined; // todo
    const value = [logic.table, logic.field].filter(v => !!v).join(fieldSeparator);
    return {
      valueSrc: "field",
      valueType,
      value,
    };
  } else if (logic?.func) {
    return convertFunc(logic, conv, config, meta, parentLogic);
  } else {
    meta.errors.push(`Unexpected arg: ${getLogicDescr(logic)}`);
  }
  return undefined;
};

const convertFuncArg = (logic: any, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic) => {
  if (typeof logic === "object" && logic !== null && !Array.isArray(logic)) {
    return convertArg(logic as OutLogic, conv, config, meta, parentLogic);
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    valueSrc: "value",
    value: logic,
  };
};

const useImportFunc = (sqlImport: SqlImportFunc, logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta) => {
  let parsed: Record<string, any> | undefined;
  try {
    parsed = sqlImport.call(config.ctx, logic!);
  } catch(_e) {
    // can't be parsed
  }

  return parsed;
};

const convertFunc = (logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic) => {
  let funcKey, argsObj, funcConfig;

  for (const [f, fc] of Utils.ConfigUtils.iterateFuncs(config)) {
    const { sqlFunc, sqlImport } = fc;
    if (sqlImport) {
      // todo: types: always SqlImportFunc
      const parsed = useImportFunc(sqlImport as SqlImportFunc, logic, conv, config, meta);
      if (parsed) {
        funcKey = f;
        funcConfig = Utils.ConfigUtils.getFuncConfig(config, funcKey);
        argsObj = {};
        for (const argKey in parsed) {
          argsObj[argKey] = convertFuncArg(parsed[argKey] as OutLogic, conv, config, meta, logic);
        }
      }
    }
    if (!funcKey && sqlFunc && sqlFunc === logic?.func) {
      funcKey = f;
      funcConfig = Utils.ConfigUtils.getFuncConfig(config, funcKey);
      argsObj = {};
      let argIndex = 0;
      for (const argKey in funcConfig!.args) {
        const argLogic = logic.children?.[argIndex];
        argsObj[argKey] = convertFuncArg(argLogic, conv, config, meta, logic);
        argIndex++;
      }
    }
  }

  if (funcKey) {
    const funcArgs = {};
    for (const argKey in funcConfig!.args) {
      const argConfig = funcConfig!.args[argKey];
      let argVal = argsObj![argKey];
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
            valueSrc: argVal?.func ? "func" : "value",
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
      },
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
