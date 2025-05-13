/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { Conv, FuncArgsObj, Meta, OperatorObj, FuncWithArgsObj, OutLogic, ValueObj } from "./types";
import {
  Config, JsonRule, JsonGroup, JsonSwitchGroup, JsonCaseGroup, CaseGroupProperties, FieldConfigExt,
  BaseWidget, Utils, ValueSource, RuleProperties, SqlImportFunc, JsonAnyRule,
  FuncArg,
  Func,
  FuncValue,
  Field,
  JsonRuleGroup,
} from "@react-awesome-query-builder/core";
import { getLogicDescr } from "./ast";
import { SqlPrimitiveTypes } from "./conv";
import { ValueExpr } from "node-sql-parser";


export const convertToTree = (
  logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic, returnGroup = false
): JsonRule | JsonGroup | JsonRuleGroup | JsonSwitchGroup | JsonCaseGroup | undefined => {
  if (!logic) return undefined;

  let res;
  if (logic.operator) {
    res = convertOp(logic, conv, config, meta, parentLogic);
  } else if (logic.conj) {
    res = convertConj(logic, conv, config, meta, parentLogic);
  } else if (logic.ternaryChildren) {
    res = convertTernary(logic, conv, config, meta, parentLogic);
  } else if (logic.func) {
    // try to use `sqlImport` in operator definitions
    res = convertOp(logic, conv, config, meta, parentLogic);
  } else {
    meta.errors.push(`Unexpected logic: ${getLogicDescr(logic)}`);
  }

  if (res?.type === "group") {
    res = groupToMaybeRuleGroup(res, config);
  }

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
  const res: JsonGroup = {
    type: "group",
    properties: {
      conjunction,
      not: logic.not,
    },
    children1: convChildren,
  };
  return res;
};

const getCommonGroupField = (fields: string[], config: Config): string | undefined => {
  if (fields.length > 0) {
    const closestGroupFields = fields.map(f => {
      const paths = Utils.ConfigUtils.getFieldParts(f, config);
      const groupFields = paths.filter(path => (Utils.ConfigUtils.getFieldConfig(config, path) as Field)?.type === "!group");
      const closestGroupField = groupFields.reverse()?.[0];
      return closestGroupField;
    }).filter(gf => !!gf);
    const isSameGroupField = Array.from(new Set(closestGroupFields)).length === 1;
    const allFieldsAreInsideGroup = closestGroupFields.length === fields.length;
    if (allFieldsAreInsideGroup && isSameGroupField) {
      return closestGroupFields[0];
    }
  }
  return undefined;
};

const groupToMaybeRuleGroup = (grp: JsonGroup, config: Config): JsonRuleGroup | JsonGroup => {
  const fields = (grp.children1 ?? [])
    .filter(ch => ch.type === "rule" || ch.type === "rule_group")
    .map(rule => (rule as JsonRule | JsonRuleGroup).properties?.field)
    .filter(f => !!f) as string[];  
  if (fields?.length === grp.children1?.length) {
    const commonGroupField = getCommonGroupField(fields, config);
    if (commonGroupField) {
      const rgr = grp as any as JsonRuleGroup;
      rgr.type = "rule_group";
      rgr.properties!.field = commonGroupField;
      (rgr.properties as any).fieldSrc = "field";
      return rgr;
    }
  }
  return grp;
};

const convertOp = (logic: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): JsonRule | undefined => {
  let opKeys = conv.operators[logic.operator!];
  let opKey = opKeys?.[0];
  let convChildren;
  let operatorOptions;

  // tip: Even if opKeys.length === 1, still try to use `convertOpFunc` to let `sqlImport` be applied first (eg. `not_like` op)
  const convFuncOp = convertOpFunc(logic, conv, config, meta, parentLogic)!;
  if (convFuncOp) {
    opKey = convFuncOp.operator!;
    convChildren = convFuncOp.children;
    operatorOptions = convFuncOp.operatorOptions;
  } else if (logic.operator) {
    // Predict return type for function at RHS based on field type in LHS (and vice versa) (needed to distinguish between date and datetime)
    const sideVals = (logic.children || []).filter(a => a.value).map(a => convertArg(a, conv, config, meta, logic));
    const sideFields = (logic.children || []).filter(a => a.field).map(a => convertArg(a, conv, config, meta, logic));
    const expectedSideTypes = [...new Set([...sideFields.map(f => f?.valueType), ...sideVals.map(v => v?._maybeValueType)].filter(v => !!v))];
    const expectedSideType = expectedSideTypes.length === 1 ? expectedSideTypes[0] : undefined;
    for (const child of logic.children || []) {
      if (child.func && !child._type) {
        child._type = expectedSideType;
      }
    }
    // Convert
    convChildren = (logic.children || []).map(a => convertArg(a, conv, config, meta, logic));
    const isMultiselect = convChildren.filter(ch => ch?.valueType === "multiselect").length > 0;
    const isSelect = convChildren.filter(ch => ch?.valueType === "select").length > 0;
    if (opKeys?.length > 1) {
      if (isMultiselect) {
        opKeys = opKeys.filter(op => !["equal", "not_equal", "select_equals", "select_not_equals"].includes(op));
      } else if (isSelect) {
        opKeys = opKeys.filter(op => !["equal", "not_equal"].includes(op));
      }
      opKey = opKeys?.[0];
    }

    if (!opKeys?.length) {
      meta.errors.push(`Can't convert ${getLogicDescr(logic)}`);
      return undefined;
    } else if (opKeys.length > 1 && !["=", "!=", "<>"].includes(logic.operator!)) {
      meta.warnings.push(`SQL operator "${logic.operator}" can be converted to several operators: ${opKeys.join(", ")}`);
    }
  } else {
    meta.errors.push(`Can't convert ${getLogicDescr(logic)}`);
    return undefined;
  }

  const [left, ...right] = (convChildren || []).filter(c => !!c);
  const properties: RuleProperties = {
    operator: opKey,
    value: [],
    valueSrc: [],
    valueType: [],
    valueError: [],
    field: undefined,
  };
  if (operatorOptions) {
    properties.operatorOptions = operatorOptions;
  }
  if (left?.valueSrc === "field") {
    properties.field = left.value;
    properties.fieldSrc = "field";
  } else if (left?.valueSrc === "func") {
    properties.field = left.value;
    properties.fieldSrc = left.valueSrc;
  }

  const opDef = Utils.ConfigUtils.getOperatorConfig(config, opKey, properties.field ?? undefined);
  // const opCardinality = opDef?.cardinality;
  const opValueTypes = opDef?.valueTypes;

  right.forEach((v, i) => {
    if (v) {
      properties.valueSrc![i] = v?.valueSrc as ValueSource;
      let valueType: string = v?.valueType;
      let finalVal = v?.value;
      if (valueType && opValueTypes && !opValueTypes.includes(valueType)) {
        meta.warnings.push(`Operator "${opKey}" supports value types [${opValueTypes.join(", ")}] but got ${valueType}`);
      }
      if (opValueTypes?.length === 1) {
        valueType = opValueTypes[0];
      }
      if (valueType && v?.valueSrc === "value") {
        finalVal = checkSimpleValueType(finalVal, valueType);
      }
      properties.valueType![i] = valueType;
      properties.value[i] = finalVal;
      if (v?.valueError) {
        properties.valueError![i] = v.valueError;
      }
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
    let valueType: string | undefined = SqlPrimitiveTypes[sqlType];
    let _maybeValueType;
    if (!valueType) {
      meta.warnings.push(`Unexpected value type ${sqlType}`);
    }
    const value = logic.value; // todo: convert ?
    if (valueType === "text") {
      // fix issues with date/time values
      if (value.match(/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/)) {
        _maybeValueType = "datetime";
      }
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        _maybeValueType = "date";
      }
      valueType = undefined;
    }
    return {
      valueSrc: "value",
      valueType,
      _maybeValueType,
      value,
    };
  } else if (logic?.field) {
    let field = [logic.table, logic.field].filter(v => !!v).join(fieldSeparator);
    for (const [fieldPath, fieldConfig, fieldKey] of Utils.ConfigUtils.iterateFields(config)) {
      if (fieldConfig.tableName === logic.table && fieldKey === logic.field) {
        field = fieldPath;
        break;
      }
    }
    const fieldConfig = Utils.ConfigUtils.getFieldConfig(config, field) as Field | undefined;
    const valueType = fieldConfig?.type;
    return {
      valueSrc: "field",
      valueType,
      value: field,
    };
  } else if (logic?.children && logic._type === "expr_list") {
    return {
      valueSrc: "value",
      valueType: "multiselect",
      value: logic.values,
    };
  } else if (logic?.value) {
    const value = logic.value; // todo: convert ?
    return {
      valueSrc: "value",
      value,
    };
  } else {
    const maybeFunc = convertValueFunc(logic, conv, config, meta, parentLogic) || convertFunc(logic, conv, config, meta, parentLogic);
    if (maybeFunc) {
      return maybeFunc;
    }
  }

  meta.errors.push(`Unexpected arg: ${getLogicDescr(logic)}`);
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

// `meta` should contain either `funcKey` or `opKey`
const useImportFunc = (
  sqlImport: SqlImportFunc, logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta
): FuncWithArgsObj | OperatorObj | ValueObj | undefined => {
  let parsed: Record<string, any> | undefined;
  let widgetConfig: BaseWidget | undefined;
  if (meta.widgetKey) {
    widgetConfig = config.widgets[meta.widgetKey] as BaseWidget;
  }
  const args: any[] = [config.ctx, logic!, widgetConfig, config.settings.sqlDialect];
  try {
    parsed = (sqlImport as any).call(...args);
  } catch(_e) {
    // can't be parsed
  }

  if (parsed) {
    const funcKey = parsed?.func as string ?? meta.funcKey;
    const sqlFunc = logic?.func;
    const parseKey = meta.opKey ?? meta.funcKey ?? meta.widgetKey ?? meta.outType ?? "?";
    if (parsed?.children) {
      return {
        operator: parsed.operator ?? meta.opKey,
        children: (parsed as OutLogic).children?.map(ch => convertArg(ch, conv, config, meta, logic)),
        operatorOptions: parsed.operatorOptions,
      } as OperatorObj;
    } else if (parsed?.args) {
      const funcConfig = Utils.ConfigUtils.getFuncConfig(config, funcKey);
      const args: FuncArgsObj = {};
      for (const argKey in parsed.args) {
        const argLogic = parsed.args[argKey] as OutLogic;
        const argConfig = funcConfig?.args[argKey];
        args[argKey] = convertFuncArg(argLogic, argConfig, conv, config, meta, logic);
      }
      return {
        func: funcKey,
        funcConfig,
        args,
      };
    } else if (Object.keys(parsed).includes("value")) {
      const { value, error } = parsed;
      if (error) {
        meta.errors.push(`Error while parsing ${parseKey} with func ${sqlFunc ?? "?"}: ${error}`);
      }
      return {
        value,
        valueType: widgetConfig?.type,
        valueSrc: "value",
        valueError: error,
      };
    } else {
      meta.errors.push(`Result of parsing as ${parseKey} should contain either 'children' or 'args' or 'value'`);
    }
  }

  return undefined;
};


const convertOpFunc = (logic: OutLogic, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): OperatorObj | undefined => {
  for (const opKey in conv.opFuncs) {
    for (const f of conv.opFuncs[opKey]) {
      const parsed = useImportFunc(f, logic, conv, config, {...meta, opKey: opKey, outType: "op"});
      if (parsed) {
        return parsed as OperatorObj;
      }
    }
  }
  return undefined;
};

const convertValueFunc = (logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic): ValueObj | undefined => {
  for (const widgetKey in conv.valueFuncs) {
    for (const f of conv.valueFuncs[widgetKey]) {
      const parsed = useImportFunc(f, logic, conv, config, {...meta, outType: "value", widgetKey});
      if (parsed) {
        return parsed as ValueObj;
      }
    }
  }
  return undefined;
};

const convertFunc = (
  logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic
): ValueObj | undefined => {
  let funcKey: string | undefined, argsObj: FuncArgsObj | undefined, funcConfig: Func | undefined | null;

  for (const [f, fc] of Utils.ConfigUtils.iterateFuncs(config)) {
    const { sqlFunc, sqlImport } = fc;
    if (sqlImport) {
      const parsed = useImportFunc(sqlImport, logic, conv, config, {...meta, funcKey: f, outType: "func"}) as FuncWithArgsObj;
      if (parsed) {
        funcKey = parsed.func;
        funcConfig = parsed.funcConfig;
        argsObj = parsed.args;

        // Special case to distinct date and datetime
        let isOk = true;
        if (funcConfig) {
          const funcType = funcConfig!.returnType;
          if (["date", "datetime"].includes(funcType)) {
            if (logic?._type && ["date", "datetime"].includes(logic._type) && logic._type !== funcType) {
              isOk = false;
            }
            const dateArgsKeys = Object.keys(funcConfig.args ?? []).filter(k => ["date", "datetime"].includes(funcConfig!.args[k].type));
            for (const k of dateArgsKeys) {
              const argConfig = funcConfig.args[k];
              const expectedType = argConfig.type;
              const realType = argsObj[k]?.valueType;
              const argVal = argsObj[k];
              if (argVal && realType != expectedType) {
                isOk = false;
              }
            }
          }
        }
        if (isOk) {
          break;
        }
      }
    }
    if (sqlFunc && sqlFunc === logic?.func) {
      funcKey = f;
      funcConfig = Utils.ConfigUtils.getFuncConfig(config, funcKey);
      const funcType = funcConfig!.returnType;
      argsObj = {};
      let argIndex = 0;
      for (const argKey in funcConfig!.args) {
        const argLogic = logic.children?.[argIndex];
        const argConfig = funcConfig?.args[argKey];
        argsObj[argKey] = convertFuncArg(argLogic, argConfig, conv, config, meta, logic);
        argIndex++;
      }
      // Special case to distinct date and datetime for args of function
      let isOk = true;
      if (["date", "datetime"].includes(funcType)) {
        if (parentLogic?.func && parentLogic?._type && ["date", "datetime"].includes(parentLogic._type)) {
          const expectedFuncType = parentLogic._type;
          if (expectedFuncType != funcType) {
            isOk = false;
          }
        }
      }
      if (isOk) {
        break;
      }
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

const checkSimpleValueType = (val: any, valueType: string) => {
  if (val != null && val?.func === undefined) {
    if (valueType === "text") {
      val = "" + val;
    } else if (valueType === "multiselect" && val?.map === undefined) {
      val = [val];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return val;
};
