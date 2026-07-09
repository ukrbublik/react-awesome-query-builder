import { Func, FuncValue, RuleValue, SimpleValue, SqlImportFunc, ValueSource } from "@react-awesome-query-builder/core";
import type {
  ExpressionValue, ExprList, LocationRange, ValueExpr,
} from "node-sql-parser";

declare module "node-sql-parser" {
  export interface BaseExpr {
    parentheses?: boolean;
  }
  export interface BinaryExpr extends BaseExpr {
    type: "binary_expr";
    operator: string;
    left: Logic;
    right: Logic;
    loc?: LocationRange;
  }
  export interface ConjExpr extends BaseExpr {
    type: "binary_expr";
    operator: "AND" | "OR";
    left: Logic;
    right: Logic;
    loc?: LocationRange;
  }
  export interface UnaryExpr extends BaseExpr {
    type: "unary_expr";
    operator: string;
    expr: Logic;
  }
  export type AnyExpr = BinaryExpr | ConjExpr | UnaryExpr | ExprList;
  export type Logic = AnyExpr | ExpressionValue;
}

export interface Conv {
  conjunctions: Record<string, string>;
  operators: Record<string, string[]>;
  opFuncs: Record<string, SqlImportFunc[]>;
  valueFuncs: Record<string, SqlImportFunc[]>;
}

export interface Meta {
  // out meta
  errors: string[];
  warnings: string[];
  convertedObj?: OutSelect;

  // call meta
  opKey?: string;
  funcKey?: string;
  widgetKey?: string;
  outType?: "op" | "func" | "value";
}

export interface OutLogic  {
  parentheses?: boolean;
  not?: boolean;
  conj?: string;
  children?: OutLogic[];
  ternaryChildren?: [OutLogic | undefined, OutLogic][];
  field?: string;
  table?: string;
  value?: any;
  values?: any[]; // for expr_list
  valueType?: /* ValueExpr["type"] */ string;
  oneValueType?: string;
  operator?: string;
  func?: string;
  _type?: string;
  unit?: string;
}

export interface OutSelect {
  where?: OutLogic;
  select?: OutLogic;
}

///////

export interface ValueObj {
  valueType?: string;
  value: RuleValue;
  valueSrc: ValueSource;
  valueError?: string;
  _maybeValueType?: string;
}

export type FuncArgsObj = Record<string, ValueObj>;
export interface FuncWithArgsObj {
  func: string;
  funcConfig?: Func | null;
  args: FuncArgsObj;
}
export interface OperatorObj {
  operator: string;
  children: Array<any>;
  operatorOptions?: Record<string, any>;
}
