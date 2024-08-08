import { SqlImportFunc } from "@react-awesome-query-builder/core";
import type {
  ExpressionValue, ExprList, LocationRange,
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
}

export interface Meta {
  errors: string[];
  convertedObj?: OutSelect;
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
  valueType?: string;
  operator?: string;
  func?: string;
  _type?: string;
  unit?: string;
}

export interface OutSelect {
  where?: OutLogic;
  select?: OutLogic;
}
