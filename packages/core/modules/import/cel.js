import uuid from "../utils/uuid";
import { loadTree } from "./tree";
import { getFieldConfig, getOperatorConfig, getWidgetForFieldOp } from "../utils/configUtils";
import { extendConfig } from "../utils/configExtend";
import { defaultConjunction } from "../utils/defaultUtils";

// Import from Google CEL (Common Expression Language).
// https://github.com/google/cel-spec/blob/master/doc/langdef.md
//
// Uses the `cel-js` parser to obtain a CST and walks it into a RAQB tree.
// It's the inverse of `modules/export/cel.js`, so a tree exported to CEL and
// re-imported yields an equivalent tree. Constructs that CEL export doesn't
// produce (arithmetic, maps, macros other than the ones below) aren't supported.
//
// `cel-js` is ESM-only. It's loaded lazily via dynamic `import()` so that:
//  - importing this package for export-only use never pulls it in;
//  - the package still loads on CommonJS + old Node (`require` of an ESM module
//    is unsupported before Node 20.19/22) — the dep is touched only when a CEL
//    string is actually imported.
// As a consequence `loadFromCel`/`_loadFromCel` are async (return a Promise).

let _celParsePromise;
const getCelParse = () => {
  if (!_celParsePromise) {
    // Literal specifier so bundlers (webpack/Next) can statically resolve and
    // code-split cel-js — a variable here triggers a "Critical dependency"
    // warning that fails CI builds run with CI=true.
    _celParsePromise = import("cel-js").then((m) => m.parse || (m.default && m.default.parse));
  }
  return _celParsePromise;
};

export const loadFromCel = (celStr, config) => {
  return _loadFromCel(celStr, config, true);
};

export const _loadFromCel = async (celStr, config, returnErrors = true) => {
  const meta = { errors: [] };
  const extendedConfig = extendConfig(config, undefined, false);

  let jsTree;
  try {
    const celParse = await getCelParse();
    const res = celParse(celStr);
    if (!res || res.isSuccess === false) {
      const errs = res?.errors?.map((e) => e?.message || String(e)) || ["Failed to parse CEL"];
      meta.errors.push(...errs);
    } else {
      const rule = convertExpr(res.cst, extendedConfig, meta);
      jsTree = wrapInGroup(rule);
    }
  } catch (e) {
    meta.errors.push(e.message || String(e));
  }

  const immTree = jsTree ? loadTree(jsTree) : undefined;

  if (returnErrors) {
    return [immTree, meta.errors];
  } else {
    if (meta.errors.length)
      console.warn("Errors while importing from CEL:", meta.errors);
    return immTree;
  }
};

// -----------------------------------------------------------------------------
// CST navigation helpers
//
// `cel-js` produces a Chevrotain CST with a fixed precedence chain:
//   expr > conditionalOr > conditionalAnd > relation > addition >
//   multiplication > unaryExpression > atomicExpression
// Each level holds `lhs` plus optional operator token(s) and `rhs`. When a level
// has no operator it's transparent and we descend into its single child.

const childList = (node, key) => node?.children?.[key] || [];
const firstChild = (node, key) => childList(node, key)[0];
const tokenImg = (node, key) => firstChild(node, key)?.image;

const wrapInGroup = (child) => {
  if (!child) return undefined;
  if (child.type === "group" || child.type === "rule_group") {
    return child;
  }
  return {
    type: "group",
    id: uuid(),
    children1: [child],
    properties: { conjunction: undefined },
  };
};

// -----------------------------------------------------------------------------
// Recursive conversion. Each `convert*` returns a RAQB rule/group node or undefined.

const convertExpr = (exprNode, config, meta) => {
  const or = firstChild(exprNode, "conditionalOr");
  return convertOr(or, config, meta);
};

const convertOr = (node, config, meta) => {
  if (!node) return undefined;
  const lhs = firstChild(node, "lhs");
  const rhsList = childList(node, "rhs");
  const first = convertAnd(lhs, config, meta);
  if (!rhsList.length) return first;
  const children = [first, ...rhsList.map((r) => convertAnd(r, config, meta))].filter(Boolean);
  return mkGroup("OR", children);
};

const convertAnd = (node, config, meta) => {
  if (!node) return undefined;
  const lhs = firstChild(node, "lhs");
  const rhsList = childList(node, "rhs");
  const first = convertRelation(lhs, config, meta);
  if (!rhsList.length) return first;
  const children = [first, ...rhsList.map((r) => convertRelation(r, config, meta))].filter(Boolean);
  // collapse `field >= a && field <= b` into a single `between` rule when possible
  const between = tryCollapseBetween(children, config);
  if (between) return between;
  return mkGroup("AND", children);
};

const convertRelation = (node, config, meta) => {
  if (!node) return undefined;
  const opTok = firstChild(node, "ComparisonOperator");
  if (!opTok) {
    // no comparison at this level → descend
    return convertAddition(firstChild(node, "lhs"), config, meta);
  }
  const lhs = firstChild(node, "lhs");
  const rhs = firstChild(node, "rhs");
  const celOp = opTok.image; // ==, !=, <, <=, >, >=, in

  // arithmetic operands can't map to a field/value — error rather than drop terms
  if (hasArithmetic(lhs) || hasArithmetic(rhs)) {
    meta.errors.push("Arithmetic expressions are not supported");
    return undefined;
  }

  // Left side is normally a field, right side a value.
  const leftField = extractFieldPath(lhs, config);
  const rightValue = evalLiteral(rhs, config, meta);
  const rightField = extractFieldPath(rhs, config);

  if (celOp === "in") {
    // `field in [..]` => any-in ; `value in field` isn't produced by export
    if (leftField && Array.isArray(rightValue)) {
      return mkRule(leftField, "select_any_in", [rightValue], config, meta);
    }
    meta.errors.push("Unsupported `in` expression");
    return undefined;
  }

  if (leftField == null) {
    meta.errors.push("Can't resolve field in comparison");
    return undefined;
  }

  // null / empty checks
  if (rightValue === null && (celOp === "==" || celOp === "!=")) {
    return mkRule(leftField, celOp === "==" ? "is_null" : "is_not_null", [], config, meta);
  }
  if (celOp === "<=" && rightValue === "") {
    return mkRule(leftField, "is_empty", [], config, meta);
  }

  const operator = mapComparisonOp(celOp, leftField, config);
  if (!operator) {
    meta.errors.push(`Unsupported operator ${celOp}`);
    return undefined;
  }
  if (rightField != null && rightValue === undefined) {
    // field-to-field comparison
    return mkRule(leftField, operator, [rightField], config, meta, "field");
  }
  return mkRule(leftField, operator, [rightValue], config, meta);
};

const convertAddition = (node, config, meta) => {
  // arithmetic isn't representable in a RAQB rule — error instead of silently dropping it
  if (childList(node, "AdditionOperator").length) {
    meta.errors.push("Arithmetic expressions are not supported");
    return undefined;
  }
  return convertMultiplication(firstChild(node, "lhs"), config, meta);
};

const convertMultiplication = (node, config, meta) => {
  if (childList(node, "MultiplicationOperator").length) {
    meta.errors.push("Arithmetic expressions are not supported");
    return undefined;
  }
  return convertUnary(firstChild(node, "lhs"), config, meta);
};

const convertUnary = (node, config, meta) => {
  if (!node) return undefined;
  const unaryOps = childList(node, "UnaryOperator");
  const notCount = unaryOps.filter((t) => t.image === "!").length;
  const atomic = firstChild(node, "atomicExpression");
  let res = convertAtomic(atomic, config, meta);
  if (res && notCount % 2 === 1) {
    res = negate(res);
  }
  return res;
};

const convertAtomic = (node, config, meta) => {
  if (!node) return undefined;
  const paren = firstChild(node, "parenthesisExpression");
  if (paren) {
    return convertExpr(firstChild(paren, "expr"), config, meta);
  }
  const ident = firstChild(node, "identifierExpression");
  if (ident) {
    // could be a method call like `field.contains('x')`
    const methodRule = convertMethodCall(ident, config, meta);
    if (methodRule) return methodRule;
    meta.errors.push("Bare field reference is not a valid condition");
    return undefined;
  }
  meta.errors.push("Unsupported expression");
  return undefined;
};

// field.contains(x) / field.startsWith(x) / field.endsWith(x) / field.exists(v, v in [..])
const convertMethodCall = (identNode, config, meta) => {
  const dot = firstChild(identNode, "identifierDotExpression");
  if (!dot) return undefined;
  const methodName = tokenImg(dot, "Identifier");
  const baseField = tokenImg(identNode, "Identifier");
  const field = resolveField(baseField, config);
  if (!field) return undefined;

  // `list.exists(v, v in [..])` — the "contains any" multiselect operator
  if (methodName === "exists") {
    return convertExistsMacro(field, dot, config, meta);
  }

  const methodMap = { contains: "like", startsWith: "starts_with", endsWith: "ends_with" };
  const operator = methodMap[methodName];
  if (!operator) return undefined;
  const argExpr = firstChild(dot, "arg");
  const argVal = evalLiteral(argExpr, config, meta);
  return mkRule(field, operator, [argVal], config, meta);
};

// `field.exists(_v, _v in [..])` (exported by multiselect_contains)
const convertExistsMacro = (field, dot, config, meta) => {
  // macro predicate is the 2nd argument: `_v in [..]`
  const predExpr = firstChild(dot, "args");
  const rel = firstRelation(predExpr);
  if (!rel || firstChild(rel, "ComparisonOperator")?.image !== "in") {
    meta.errors.push("Unsupported exists() predicate; expected `<var> in [..]`");
    return undefined;
  }
  const list = evalLiteral(firstChild(rel, "rhs"), config, meta);
  if (!Array.isArray(list)) {
    meta.errors.push("exists() predicate must test membership in a list");
    return undefined;
  }
  return mkRule(field, "multiselect_contains", [list], config, meta);
};

// navigate expr => conditionalOr => conditionalAnd => relation
const firstRelation = (exprNode) => {
  const or = firstChild(exprNode, "conditionalOr");
  const and = firstChild(or, "lhs");
  return firstChild(and, "lhs");
};

// -----------------------------------------------------------------------------
// Value & field extraction

// Descend transparently to the single unaryExpression under an addition node.
const unaryOf = (additionNode) => {
  const mult = firstChild(additionNode, "lhs");
  return firstChild(mult, "lhs");
};

// True if an addition-level node actually performs +/-/*// arithmetic.
const hasArithmetic = (additionNode) => {
  if (!additionNode) return false;
  if (childList(additionNode, "AdditionOperator").length) return true;
  return childList(firstChild(additionNode, "lhs"), "MultiplicationOperator").length > 0;
};

// Descend transparently to the single atomicExpression under an addition node.
const atomicOf = (additionNode) => {
  return firstChild(unaryOf(additionNode), "atomicExpression");
};

const extractFieldPath = (additionNode, config) => {
  const atomic = atomicOf(additionNode);
  const ident = atomic && firstChild(atomic, "identifierExpression");
  if (!ident) return null;
  if (childList(ident, "identifierDotExpression").length) {
    // dotted path a.b.c
    const parts = [tokenImg(ident, "Identifier")];
    for (const d of childList(ident, "identifierDotExpression")) {
      // only plain field access (Dot Identifier), not method calls with parens
      if (childList(d, "OpenParenthesis").length) return null;
      parts.push(tokenImg(d, "Identifier"));
    }
    return resolveField(parts.join("."), config);
  }
  return resolveField(tokenImg(ident, "Identifier"), config);
};

// Resolve a CEL field name to a RAQB field key.
const resolveField = (name, config) => {
  if (name == null) return null;
  if (getFieldConfig(config, name)) return name;
  // try replacing dots with the config field separator
  const sep = config.settings.fieldSeparator;
  if (sep && sep !== ".") {
    const alt = name.split(".").join(sep);
    if (getFieldConfig(config, alt)) return alt;
  }
  return name; // let checkTree flag unknown fields
};

// Evaluate an `addition` (or `expr` for call args) node as a literal value.
const evalLiteral = (node, config, meta) => {
  if (!node) return undefined;
  // unwrap expr → conditionalOr → ... down to the addition-level node
  let addNode;
  if (node.name === "expr") {
    const or = firstChild(node, "conditionalOr");
    const and = firstChild(or, "lhs");
    const rel = firstChild(and, "lhs");
    addNode = firstChild(rel, "lhs");
  } else {
    addNode = node;
  }
  let val = atomicToValue(atomicOf(addNode), config, meta);
  // apply a leading unary minus (e.g. `-3`) to numeric literals
  const minusCount = childList(unaryOf(addNode), "UnaryOperator").filter((t) => t.image === "-").length;
  if (minusCount % 2 === 1 && typeof val === "number") {
    val = -val;
  }
  return val;
};

const atomicToValue = (atomic, config, meta) => {
  if (!atomic) return undefined;
  const c = atomic.children || {};
  if (c.StringLiteral) return unquoteCelString(c.StringLiteral[0].image);
  if (c.Integer) return parseInt(c.Integer[0].image, 10);
  if (c.Float || c.FloatLiteral) return parseFloat((c.Float || c.FloatLiteral)[0].image);
  if (c.BooleanLiteral) return c.BooleanLiteral[0].image === "true";
  if (c.Null || c.NullLiteral) return null;
  if (c.ReservedIdentifiers) {
    const img = c.ReservedIdentifiers[0].image;
    if (img === "true") return true;
    if (img === "false") return false;
    if (img === "null") return null;
  }
  const list = c.listExpression && c.listExpression[0];
  if (list) {
    const items = [];
    const lhs = firstChild(list, "lhs");
    if (lhs) items.push(evalLiteral(lhs, config, meta));
    for (const r of childList(list, "rhs")) items.push(evalLiteral(r, config, meta));
    return items;
  }
  // timestamp('...') / duration('...') are parsed as macro calls; use the inner string
  const macro = c.macrosExpression && c.macrosExpression[0];
  if (macro) {
    const fnName = tokenImg(macro, "Identifier");
    if (fnName === "timestamp" || fnName === "duration") {
      const arg = firstChild(macro, "arg");
      return evalLiteral(arg, config, meta);
    }
  }
  return undefined;
};

// CEL C-style string literal → JS string
const unquoteCelString = (img) => {
  if (img == null) return img;
  let s = img;
  // strip raw prefix
  const raw = /^[rR]/.test(s);
  s = s.replace(/^[rRbB]+/, "");
  // strip surrounding quotes (single, double, or triple)
  if (s.startsWith("'''") || s.startsWith("\"\"\"")) {
    s = s.slice(3, -3);
  } else {
    s = s.slice(1, -1);
  }
  if (raw) return s;
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, "\"")
    .replace(/\\\\/g, "\\");
};

// -----------------------------------------------------------------------------
// Operator mapping & tree node builders

const mapComparisonOp = (celOp, field, config) => {
  const fieldDef = getFieldConfig(config, field) || {};
  const type = fieldDef.type;
  const isSelect = type === "select";
  const isMulti = type === "multiselect";
  switch (celOp) {
  case "==":
    return isMulti ? "multiselect_equals" : isSelect ? "select_equals" : "equal";
  case "!=":
    return isMulti ? "multiselect_not_equals" : isSelect ? "select_not_equals" : "not_equal";
  case "<": return "less";
  case "<=": return "less_or_equal";
  case ">": return "greater";
  case ">=": return "greater_or_equal";
  default: return undefined;
  }
};

const mkGroup = (conjunction, children) => {
  const valid = children.filter(Boolean);
  if (!valid.length) return undefined;
  if (valid.length === 1 && conjunction === "AND") {
    // a single child needs no explicit conjunction wrapper
    return valid[0].type === "rule" ? { ...groupShell("AND"), children1: valid } : valid[0];
  }
  return { ...groupShell(conjunction), children1: valid };
};

const groupShell = (conjunction) => ({
  type: "group",
  id: uuid(),
  properties: { conjunction },
});

const negate = (node) => {
  if (node.type === "group" || node.type === "rule_group") {
    node.properties = { ...node.properties, not: !node.properties?.not };
    return node;
  }
  // wrap a single rule in a NOT group
  return {
    type: "group",
    id: uuid(),
    children1: [node],
    properties: { conjunction: "AND", not: true },
  };
};

const mkRule = (field, operator, values, config, meta, valueSrcOverride) => {
  const opConfig = getOperatorConfig(config, operator, field);
  if (!opConfig) {
    meta.errors.push(`Operator ${operator} is not supported for field ${field}`);
    return undefined;
  }
  const valueSrc = values.map(() => valueSrcOverride || "value");
  const valueType = values.map((_, i) => {
    const widget = getWidgetForFieldOp(config, field, operator, valueSrc[i]);
    const w = config.widgets[widget];
    return w?.type || null;
  });
  return {
    type: "rule",
    id: uuid(),
    properties: {
      field,
      operator,
      value: values,
      valueSrc,
      valueType,
    },
  };
};

// Collapse [ {field>=a}, {field<=b} ] into a single `between` rule.
const tryCollapseBetween = (children, config) => {
  if (children.length !== 2) return undefined;
  const [a, b] = children;
  if (!a || !b || a.type !== "rule" || b.type !== "rule") return undefined;
  const pa = a.properties, pb = b.properties;
  if (pa.field !== pb.field) return undefined;
  const fieldDef = getFieldConfig(config, pa.field) || {};
  if (!getOperatorConfig(config, "between", pa.field)) return undefined;
  let from, to;
  if (pa.operator === "greater_or_equal" && pb.operator === "less_or_equal") {
    from = pa.value[0]; to = pb.value[0];
  } else if (pa.operator === "less_or_equal" && pb.operator === "greater_or_equal") {
    from = pb.value[0]; to = pa.value[0];
  } else {
    return undefined;
  }
  const valueType = pa.valueType?.[0] || fieldDef.type || null;
  return {
    type: "rule",
    id: uuid(),
    properties: {
      field: pa.field,
      operator: "between",
      value: [from, to],
      valueSrc: ["value", "value"],
      valueType: [valueType, valueType],
    },
  };
};
