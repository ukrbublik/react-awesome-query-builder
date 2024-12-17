/* eslint-disable @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import type { Meta, OutLogic, OutSelect } from "./types";
import { SqlPrimitiveTypes } from "./conv";
import {
  // ext
  ConjExpr, BinaryExpr, UnaryExpr, AnyExpr, Logic, BaseExpr,
  // orig
  AST, Select, Function as SqlFunction, ExpressionValue, ExprList, LocationRange,
  ColumnRef, ValueExpr, Value, Case, Interval, Column,
} from "node-sql-parser";


export const processAst = (sqlAst: AST, meta: Meta): OutSelect => {
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
  const valueTypes = children.map(ch => ch.valueType).filter(ev => !!ev);
  const uniqValueTypes = Array.from(new Set(valueTypes));
  const oneValueType = valueTypes.length === children.length && uniqValueTypes.length === 1 ? uniqValueTypes[0] : undefined;
  let values;
  if (oneValueType && SqlPrimitiveTypes[oneValueType]) {
    // it's list of primitive values
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    values = children.map(ch => ch.value);
  }
  return {
    children,
    not,
    _type: "expr_list",
    oneValueType,
    values,
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


export const getLogicDescr = (logic?: OutLogic) => {
  if (logic?._type === "case") {
    // const cases = logic.children as {cond: OutLogic, result: OutLogic}[];
    return "CASE";
  } else if (logic?._type === "interval") {
    return `INTERVAL ${JSON.stringify(logic.value)} ${logic.unit}`;
  } else if (logic?.func) {
    return `${logic.func}()`;
  }
  // todo: aggr?
  return JSON.stringify(logic);
};
