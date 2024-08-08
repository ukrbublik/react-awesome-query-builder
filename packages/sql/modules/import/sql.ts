/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import {
  Utils, Config, JsonTree, ImmutableTree, JsonGroup, JsonAnyRule, JsonRule, PartialPartial,
  FieldConfigExt,
  RuleProperties,
  ValueSource,
  JsonSwitchGroup,
  JsonCaseGroup,
  CaseGroupProperties,
  BaseWidget,
  SqlImportFunc,
} from "@react-awesome-query-builder/core";
import type { Conv, Meta, OutLogic, OutSelect } from "./types";
import {
  // ext
  ConjExpr, BinaryExpr, UnaryExpr, AnyExpr, Logic, BaseExpr,
  // orig
  Parser as NodeSqlParser, Option as SqlParseOption, AST, Select,
  Function as SqlFunction, ExpressionValue, ExprList, LocationRange,
  ColumnRef, ValueExpr, Value, Case, Interval,
  Column,
} from "node-sql-parser";





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

///////////////////

const buildConv = (config: Config): Conv => {
  const operators: Record<string, string[]> = {};
  for (const opKey in config.operators) {
    const opConfig = config.operators[opKey];
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
      logger.log(`[sql] No sqlOp for operator ${opKey}`);
    }
  }

  const conjunctions: Record<string, string> = {};
  for (const conjKey in config.conjunctions) {
    const conjunctionDefinition = config.conjunctions[conjKey];
    const ck = conjunctionDefinition.spelConj || conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

  // let funcs = {};
  // for (const [funcPath, funcConfig] of iterateFuncs(config)) {
  //   let fks = [];
  //   const {spelFunc} = funcConfig;
  //   if (typeof spelFunc === "string") {
  //     const optionalArgs = Object.keys(funcConfig.args || {})
  //       .reverse()
  //       .filter(argKey => !!funcConfig.args[argKey].isOptional || funcConfig.args[argKey].defaultValue != undefined);
  //     const funcSignMain = spelFunc
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
  //         spelFunc
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
  //   const {spelImportFuncs, type} = widgetDef;
  //   if (spelImportFuncs) {
  //     for (const fk of spelImportFuncs) {
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
  //   const {spelOp} = opDef;
  //   if (spelOp?.includes("${0}")) {
  //     const fs = spelOp.replace(/\${(\w+)}/g, (_, k) => "?");
  //     const argsOrder = [...spelOp.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
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


///////////////////

const processAst = (sqlAst: AST, meta: Meta): OutSelect => {
  if (sqlAst.type !== "select") {
    meta.errors.push(`Expected SELECT, but got ${sqlAst.type}`);
  }
  const select = sqlAst as Select;
  const pWhere = processLogic(select.where, meta);
  const selectExpr = ((select.columns ?? []) as Column[]).find(c => c.type === "expr");
  const pSelectExpr = processLogic(selectExpr?.expr as Logic, meta);
  const hasLogic = select.where || selectExpr?.expr;
  if (!hasLogic) {
    meta.errors.push("No logic found in WHERE/SELECT");
  }
  return {
    where: pWhere,
    select: pSelectExpr,
  };
};

const processLogic = (logic: Logic | null | undefined, meta: Meta, not = false): OutLogic | undefined => {
  if (!logic) {
    return undefined;
  }
  let ret: OutLogic | undefined;
  if (logic.type === "function") {
    ret = processFunc(logic as SqlFunction, meta, not);
  } else if (logic.type === "binary_expr") {
    if (["AND", "OR"].includes((logic as BinaryExpr).operator)) {
      ret = processConj(logic as ConjExpr, meta, not);
    } else {
      ret = processBinaryOp(logic as BinaryExpr, meta, not);
    }
  } else if (logic.type === "unary_expr") {
    if ((logic as UnaryExpr).operator === "NOT") {
      const subFilter = (logic as UnaryExpr).expr;
      ret = processLogic(subFilter, meta, !not);
      if (ret) {
        ret.parentheses = true;
      }
    } else {
      meta.errors.push(`Unexpected unary operator ${(logic as UnaryExpr).operator}`);
    }
  } else if (logic.type === "expr_list") {
    ret = processExprList(logic as ExprList, meta, not);
  } else if (logic.type === "case") {
    ret = processCase(logic as Case, meta, not);
  } else if (logic.type === "column_ref") {
    ret = processField(logic as ColumnRef, meta, not);
  } else if (logic.type === "interval") {
    ret = processInterval(logic as Interval, meta, not);
  } else if ((logic as Value).value !== undefined) {
    ret = processValue(logic as Value, meta, not);
  } else {
    // todo: aggr_func, cast
    meta.errors.push(`Unexpected logic type ${logic.type}`);
  }
  return ret;
};

const processConj = (expr: ConjExpr, meta: Meta, not = false): OutLogic | undefined => {
  const parentheses = expr.parentheses;
  const conj = expr.operator;
  // flatize OR/AND
  const childrenChain = [
    processLogic(expr.left, meta),
    processLogic(expr.right, meta),
  ].filter(c => !!c) as OutLogic[];
  const children = childrenChain.reduce((acc, child) => {
    const canFlatize = child?.conj === conj && !child.parentheses && !child.not;
    const flat = canFlatize ? (child.children ?? []) : [child];
    return [...acc, ...flat];
  }, [] as OutLogic[]);
  return {
    parentheses,
    not,
    conj,
    children,
  };
};

const processCase = (expr: Case, meta: Meta, not = false): OutLogic | undefined => {
  const parentheses = (expr as BaseExpr).parentheses;
  const children = expr.args
    .map(arg => {
      if (!["when", "else"].includes(arg.type)) {
        meta.errors.push(`Unexpected type ${arg.type} inside CASE`);
      }
      return {
        cond: arg.type === "when" ? processLogic(arg.cond, meta) : undefined,
        result: processLogic(arg.result, meta),
      };
    })
    .filter(a => !!a) as OutLogic[];
  return {
    parentheses,
    children,
    _type: "case",
    not,
  };
};

const processBinaryOp = (expr: BinaryExpr, meta: Meta, not = false): OutLogic | undefined => {
  const parentheses = expr.parentheses;
  const operator = expr.operator;
  let children = [
    processLogic(expr.left, meta),
    processLogic(expr.right, meta),
  ].filter(c => !!c) as OutLogic[];
  if (operator === "BETWEEN" || operator === "NOT BETWEEN") {
    // flatize BETWEEN
    children = [
      children[0],
      ...(children[1].children ?? []),
    ].filter(c => !!c);
  }
  return {
    parentheses,
    not,
    children,
    operator,
  };
};

const getExprValue = (expr: ValueExpr, meta: Meta, not = false): string | number | boolean => {
  let value = expr.value;
  if (expr.type === "boolean" && not) {
    value = !value;
  }
  // todo: '' for single_quote_string
  // todo: date literals?
  return value;
};

const getExprStringValue = (expr: ValueExpr, meta: Meta, not = false): string => {
  const v = getExprValue(expr, meta, not);
  return String(v);
};

const processExprList = (expr: ExprList, meta: Meta, not = false): OutLogic | undefined => {
  const children = expr.value
    .map(ev => processLogic(ev, meta, false))
    .filter(ev => !!ev) as OutLogic[];
  return {
    children,
    not,
  };
};

const processInterval = (expr: Interval, meta: Meta, not = false): OutLogic | undefined => {
  return {
    _type: "interval",
    ...(processValue(expr.expr, meta) ?? {}),
    unit: expr.unit,
  };
};

const processValue = (expr: Value, meta: Meta, not = false): OutLogic | undefined => {
  const {type: valueType} = expr;
  const value = getExprValue(expr as ValueExpr, meta, not);
  return {
    valueType,
    value,
  };
};

const processField = (expr: ColumnRef, meta: Meta, not = false): OutLogic | undefined => {
  const parentheses = (expr as BaseExpr).parentheses;
  const field = typeof expr.column === "string" ? expr.column : getExprStringValue(expr.column.expr, meta, not);
  const table = expr.table ?? undefined;
  return {
    parentheses,
    field,
    table,
  };
};

const flatizeTernary = (children: OutLogic[], meta: Meta) => {
  const flat: [OutLogic | undefined, OutLogic][] = [];
  function _processTernaryChildren(tern: OutLogic[]) {
    const [cond, if_val, else_val] = tern;
    if (if_val.func === "IF") {
      meta.errors.push("Unexpected IF inside IF");
    }
    flat.push([cond, if_val]);
    if (else_val?.func === "IF") {
      _processTernaryChildren(else_val?.children!);
    } else {
      flat.push([undefined, else_val]);
    }
  }
  _processTernaryChildren(children);
  return flat;
};

const processFunc = (expr: SqlFunction, meta: Meta, not = false): OutLogic | undefined => {
  const nameType = expr.name.name[0].type as string;
  const firstName = expr.name.name[0].value;
  const getArgs = (useNot: boolean): OutLogic[] => {
    if (expr.args) {
      if (expr.args.type === "expr_list") {
        return expr.args.value
          .map(arg => processLogic(arg, meta, useNot ? not : undefined))
          .filter(a => !!a) as OutLogic[];
      } else {
        meta.errors.push(`Unexpected args type for func (${JSON.stringify(expr.name.name)}): ${JSON.stringify(expr.args.type)}`);
      }
    }
    return [];
  };
  let ret: OutLogic | undefined;

  if (nameType === "default" && firstName === "NOT") {
    if (expr.args?.value.length === 1) {
      const args = getArgs(false);
      ret = args[0];
      // ret.parentheses = true;
      ret.not = !ret.not;
      if (not) {
        ret.not = !ret.not;
      }
    } else {
      meta.errors.push(`Unexpected args for func NOT: ${JSON.stringify(expr.args?.value)}`);
    }
  } else if (nameType === "default" && firstName === "IFNULL") {
    const args = getArgs(true);
    // const defaultValue = args[1].value;
    ret = args[0];
  } else if (nameType === "default") {
    const flatizeArgs = firstName === "IF";
    const args = getArgs(false);
    ret = {
      func: firstName,
      children: args,
      not: not,
    };
    if (flatizeArgs) {
      ret.ternaryChildren = flatizeTernary(args, meta);
    }
    return ret;
  } else {
    meta.errors.push(`Unexpected function name ${JSON.stringify(expr.name.name)}`);
  }
  return ret;
};

const getLogicDescr = (logic?: OutLogic) => {
  if (logic?._type === "case") {
    // const cases = logic.children as {cond: OutLogic, result: OutLogic}[];
    return "CASE";
  } else if (logic?._type === "interval") {
    return `INTERVAL ${JSON.stringify(logic.value)} ${logic.unit}`;
  } else if (logic?.func) {
    return `${logic.func}()`;
  }
  // todo
  return JSON.stringify(logic);
};

///////////////////


const convertToTree = (
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
  const conjunction = conj!; // todo: conj conv
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

const convertFunc = (logic: OutLogic | undefined, conv: Conv, config: Config, meta: Meta, parentLogic?: OutLogic) => {
  let funcKey, argsObj, funcConfig;

  for (const [f, fc] of Utils.ConfigUtils.iterateFuncs(config)) {
    const { sqlFunc, sqlImport } = fc;
    if (sqlImport) {
      let parsed: Record<string, any> | undefined;
      try {
        // todo: types: always SqlImportFunc
        parsed = (sqlImport as SqlImportFunc).call(config.ctx, logic!);
      } catch(_e) {
        // can't be parsed
      }
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
