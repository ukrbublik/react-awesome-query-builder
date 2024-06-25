import { SpelExpressionEvaluator } from "spel2js";
import uuid from "../utils/uuid";
import {getFieldConfig, getFuncConfig, extendConfig, normalizeField, iterateFuncs} from "../utils/configUtils";
import {getWidgetForFieldOp} from "../utils/ruleUtils";
import {loadTree} from "./tree";
import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";
import {getOpCardinality, logger, isJsonCompatible} from "../utils/stuff";
import moment from "moment";
import {compareToSign} from "../export/spel";

// https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions

// spel type => raqb type
const SpelPrimitiveTypes = {
  number: "number",
  string: "text",
  boolean: "boolean",
  null: "null" // should not be
};
// spel class => raqb type
const SpelPrimitiveClasses = {
  String: "text",
};
const ListValueType = "multiselect";
const isFuncableProperty = (p) => ["length"].includes(p);

const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

export const loadFromSpel = (logicTree, config) => {
  return _loadFromSpel(logicTree, config, true);
};

export const _loadFromSpel = (spelStr, config, returnErrors = true) => {
  //meta is mutable
  let meta = {
    errors: []
  };
  const extendedConfig = extendConfig(config, undefined, false);
  const conv = buildConv(extendedConfig);
  
  let compiledExpression;
  let convertedObj;
  let jsTree = undefined;
  try {
    const compileRes = SpelExpressionEvaluator.compile(spelStr);
    compiledExpression = compileRes._compiledExpression;
  } catch (e) {
    meta.errors.push(e);
  }
  
  if (compiledExpression) {
    //logger.debug("compiledExpression:", compiledExpression);
    convertedObj = postprocessCompiled(compiledExpression, meta);
    logger.debug("convertedObj:", convertedObj, meta);

    jsTree = convertToTree(convertedObj, conv, extendedConfig, meta);
    if (jsTree && jsTree.type != "group" && jsTree.type != "switch_group") {
      jsTree = wrapInDefaultConj(jsTree, extendedConfig, convertedObj["not"]);
    }
    logger.debug("jsTree:", jsTree);
  }

  const immTree = jsTree ? loadTree(jsTree) : undefined;

  if (returnErrors) {
    return [immTree, meta.errors];
  } else {
    if (meta.errors.length)
      console.warn("Errors while importing from SpEL:", meta.errors);
    return immTree;
  }
};

const postprocessCompiled = (expr, meta, parentExpr = null) => {
  const type = expr.getType();
  let children = expr.getChildren().map(child => postprocessCompiled(child, meta, expr));

  // flatize OR/AND
  if (type == "op-or" || type == "op-and") {
    children = children.reduce((acc, child) => {
      const canFlatize = child.type == type && !child.not;
      const flat = canFlatize ? child.children : [child];
      return [...acc, ...flat];
    }, []);
  }

  // unwrap NOT
  if (type == "op-not") {
    if (children.length != 1) {
      meta.errors.push(`Operator NOT should have 1 child, but got ${children.length}}`);
    }
    return {
      ...children[0],
      not: !(children[0].not || false)
    };
  }

  if (type == "compound") {
    // remove `.?[true]`
    children = children.filter(child => {
      const isListFix = child.type == "selection" && child.children.length == 1 && child.children[0].type == "boolean" && child.children[0].val == true;
      return !isListFix;
    });
    // aggregation
    // eg. `results.?[product == 'abc'].length`
    const selection = children.find(child => 
      child.type == "selection"
    );
    if (selection && selection.children.length != 1) {
      meta.errors.push(`Selection should have 1 child, but got ${selection.children.length}`);
    }
    const filter = selection ? selection.children[0] : null;
    let lastChild = children[children.length - 1];
    const isSize = lastChild.type == "method" && lastChild.val.methodName == "size" 
      || lastChild.type == "!func" && lastChild.methodName == "size";
    const isLength = lastChild.type == "property" && lastChild.val == "length";
    const sourceParts = children.filter(child => 
      child !== selection && child !== lastChild
    );
    const source = {
      type: "compound",
      children: sourceParts
    };
    const isAggr = (isSize || isLength) && convertPath(sourceParts) != null;
    if (isAggr) {
      return {
        type: "!aggr",
        filter,
        source
      };
    }
    // remove `#this`, `#root`
    children = children.filter(child => {
      const isThis = child.type == "variable" && child.val == "this";
      const isRoot = child.type == "variable" && child.val == "root";
      return !(isThis || isRoot);
    });
    // indexer
    children = children.map(child => {
      if (child.type == "indexer" && child.children.length == 1) {
        return {
          type: "indexer", 
          val: child.children[0].val,
          itype: child.children[0].type
        };
      } else {
        return child;
      }
    });
    // method
    // if (lastChild.type == "method") {
    //   // seems like obsolete code!
    //   debugger
    //   const obj = children.filter(child => 
    //     child !== lastChild
    //   );
    //   return {
    //     type: "!func",
    //     obj,
    //     methodName: lastChild.val.methodName,
    //     args: lastChild.val.args
    //   };
    // }
    // !func
    if (lastChild.type == "!func") {
      const ret = {};
      let curr = ret;
      do {
        Object.assign(curr, lastChild);
        children = children.filter(child => child !== lastChild);
        lastChild = children[children.length - 1];
        if (lastChild?.type == "!func") {
          curr.obj = {};
          curr = curr.obj;
        } else {
          if (children.length > 1) {
            curr.obj = {
              type: "compound",
              children
            };
          } else {
            curr.obj = lastChild;
          }
        }
      } while(lastChild?.type == "!func");
      return ret;
    }
  }

  // getRaw || getValue
  let val;
  try {
    if (expr.getRaw) { // use my fork
      val = expr.getRaw();
    } else if (expr.getValue.length == 0) { // getValue not requires context arg -> can use
      val = expr.getValue();
    }
  } catch(e) {
    logger.error("[spel2js] Error in getValue()", e);
  }

  // ternary
  if (type == "ternary") {
    val = flatizeTernary(children);
  }

  // convert method/function args
  if (typeof val === "object" && val !== null) {
    if (val.methodName || val.functionName) {
      val.args = val.args.map(child => postprocessCompiled(child, meta, expr));
    }
  }
  // convert list
  if (type == "list") {
    val = val.map(item => postprocessCompiled(item, meta, expr));

    // fix whole expression wrapped in `{}`
    if (!parentExpr && val.length == 1) {
      return val[0];
    }
  }
  // convert constructor
  if (type == "constructorref") {
    const qid = children.find(child => child.type == "qualifiedidentifier");
    const cls = qid?.val;
    if (!cls) {
      meta.errors.push(`Can't find qualifiedidentifier in constructorref children: ${JSON.stringify(children)}`);
      return undefined;
    }
    const args = children.filter(child => child.type != "qualifiedidentifier");
    return {
      type: "!new",
      cls,
      args
    };
  }
  // convert type
  if (type == "typeref") {
    const qid = children.find(child => child.type == "qualifiedidentifier");
    const cls = qid?.val;
    if (!cls) {
      meta.errors.push(`Can't find qualifiedidentifier in typeref children: ${JSON.stringify(children)}`);
      return undefined;
    }
    const _args = children.filter(child => child.type != "qualifiedidentifier");
    return {
      type: "!type",
      cls
    };
  }
  // convert function/method
  if (type == "function" || type == "method") {
    // `foo()` is method, `#foo()` is function
    // let's use common property `methodName` and just add `isVar` for function
    const {functionName, methodName, args} = val;
    return {
      type: "!func",
      methodName: functionName || methodName,
      isVar: type == "function",
      args
    };
  }

  return {
    type,
    children,
    val,
  };
};

const flatizeTernary = (children) => {
  let flat = [];
  function _processTernaryChildren(tern) {
    let [cond, if_val, else_val] = tern;
    flat.push([cond, if_val]);
    if (else_val?.type == "ternary") {
      _processTernaryChildren(else_val.children);
    } else {
      flat.push([undefined, else_val]);
    }
  }
  _processTernaryChildren(children);
  return flat;
};

const buildConv = (config) => {
  let operators = {};
  for (let opKey in config.operators) {
    const opConfig = config.operators[opKey];
    if (opConfig.spelOps) {
      // examples: "==", "eq", ".contains", "matches" (can be used for starts_with, ends_with)
      opConfig.spelOps.forEach(spelOp => {
        const opk = spelOp; // + "/" + getOpCardinality(opConfig);
        if (!operators[opk])
          operators[opk] = [];
        operators[opk].push(opKey);
      });
    } else if (opConfig.spelOp) {
      const opk = opConfig.spelOp; // + "/" + getOpCardinality(opConfig);
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);
    } else {
      logger.log(`[spel] No spelOp for operator ${opKey}`);
    }
  }

  let conjunctions = {};
  for (let conjKey in config.conjunctions) {
    const conjunctionDefinition = config.conjunctions[conjKey];
    const ck = conjunctionDefinition.spelConj || conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

  let funcs = {};
  for (const [funcPath, funcConfig] of iterateFuncs(config)) {
    let fks = [];
    const {spelFunc} = funcConfig;
    if (typeof spelFunc === "string") {
      const optionalArgs = Object.keys(funcConfig.args || {})
        .reverse()
        .filter(argKey => !!funcConfig.args[argKey].isOptional || funcConfig.args[argKey].defaultValue != undefined);
      const funcSignMain = spelFunc
        .replace(/\${(\w+)}/g, (_, _k) => "?");
      const funcSignsOptional = optionalArgs
        .reduce((acc, argKey) => (
          [
            ...acc,
            [
              argKey,
              ...(acc[acc.length-1] || []),
            ]
          ]
        ), [])
        .map(optionalArgKeys => (
          spelFunc
            .replace(/(?:, )?\${(\w+)}/g, (found, a) => (
              optionalArgKeys.includes(a) ? "" : found
            ))
            .replace(/\${(\w+)}/g, (_, _k) => "?")
        ));
      fks = [
        funcSignMain,
        ...funcSignsOptional,
      ];
    }
    for (const fk of fks) {
      if (!funcs[fk])
        funcs[fk] = [];
      funcs[fk].push(funcPath);
    }
  }

  let valueFuncs = {};
  for (let w in config.widgets) {
    const widgetDef = config.widgets[w];
    const {spelImportFuncs, type} = widgetDef;
    if (spelImportFuncs) {
      for (const fk of spelImportFuncs) {
        if (typeof fk === "string") {
          const fs = fk.replace(/\${(\w+)}/g, (_, k) => "?");
          const argsOrder = [...fk.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
          if (!valueFuncs[fs])
            valueFuncs[fs] = [];
          valueFuncs[fs].push({
            w,
            argsOrder
          });
        }
      }
    }
  }

  let opFuncs = {};
  for (let op in config.operators) {
    const opDef = config.operators[op];
    const {spelOp} = opDef;
    if (spelOp?.includes("${0}")) {
      const fs = spelOp.replace(/\${(\w+)}/g, (_, k) => "?");
      const argsOrder = [...spelOp.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
      if (!opFuncs[fs])
        opFuncs[fs] = [];
      opFuncs[fs].push({
        op,
        argsOrder
      });
    }
  }
  // Special .compareTo()
  const compareToSS = compareToSign.replace(/\${(\w+)}/g, (_, k) => "?");
  opFuncs[compareToSS] = [{
    op: "!compare",
    argsOrder: ["0", "1"]
  }];

  return {
    operators,
    conjunctions,
    funcs,
    valueFuncs,
    opFuncs,
  };
};

const convertToTree = (spel, conv, config, meta, parentSpel = null) => {
  if (!spel) return undefined;

  let res, canParseAsArg = true;
  if (spel.type.indexOf("op-") === 0 || spel.type === "matches") {
    res = convertOp(spel, conv, config, meta, parentSpel);
  } else if (spel.type == "!aggr") {
    spel._groupField = parentSpel?._groupField;
    const groupFieldValue = convertToTree(spel.source, conv, config, meta, spel);
    spel._groupField = groupFieldValue?.value;
    let groupFilter = convertToTree(spel.filter, conv, config, meta, spel);
    if (groupFilter?.type == "rule") {
      groupFilter = wrapInDefaultConj(groupFilter, config, spel.filter.not);
    }
    res = {
      groupFilter,
      groupFieldValue
    };
    if (!parentSpel) {
      // !aggr can't be in root, it should be compared with something
      res = undefined;
      meta.errors.push("Unexpected !aggr in root");
      canParseAsArg = false;
    }
  } else if (spel.type == "ternary") {
    const children1 = {};
    spel.val.forEach(v => {
      const [cond, val] = v;
      const caseI = buildCase(cond, val, conv, config, meta, spel);
      if (caseI) {
        children1[caseI.id] = caseI;
      }
    });
    res = {
      type: "switch_group",
      id: uuid(),
      children1,
      properties: {}
    };
  }

  if (!res && canParseAsArg) {
    res = convertArg(spel, conv, config, meta, parentSpel);
  }

  if (res && !res.type && !parentSpel) {
    // res is not a rule, it's value at root
    // try to parse whole `"1"` as ternary
    const sw = buildSimpleSwitch(spel, conv, config, meta);
    if (sw) {
      res = sw;
    } else {
      res = undefined;
      meta.errors.push(`Can't convert rule of type ${spel.type}, it looks like var/literal`);
    }
  }
  
  return res;
};

const convertOp = (spel, conv, config, meta, parentSpel = null) => {
  let res;

  let op = spel.type.startsWith("op-") ? spel.type.slice("op-".length) : spel.type;

  // unary
  const isUnary = (op == "minus" || op == "plus") && spel.children.length == 1;
  if (isUnary) {
    let negative = spel.negative;
    if (op == "minus") {
      negative = !negative;
    }
    spel.children[0].negative = negative;
    return convertToTree(spel.children[0], conv, config, meta, parentSpel);
  }

  // between
  const isBetweenNormal = (op == "and" && spel.children.length == 2 && spel.children[0].type == "op-ge" && spel.children[1].type == "op-le");
  const isBetweenRev = (op == "or" && spel.children.length == 2 && spel.children[0].type == "op-lt" && spel.children[1].type == "op-gt");
  const isBetween = isBetweenNormal || isBetweenRev;
  if (isBetween) {
    const [left, from] = spel.children[0].children;
    const [right, to] = spel.children[1].children;
    spel._groupField = parentSpel?._groupField;
    const isSameSource = compareArgs(left, right, spel, conv, config, meta, parentSpel);
    if (isSameSource) {
      const _fromValue = from.val;
      const _toValue = to.val;
      const oneSpel = {
        type: "op-between",
        children: [
          left,
          from,
          to
        ],
        not: isBetweenRev,
      };
      return convertOp(oneSpel, conv, config, meta, parentSpel);
    }
  }

  // find op
  let opKeys = conv.operators[op];
  if (op == "eq" && spel.children[1].type == "null") {
    opKeys = ["is_null"];
  } else if (op == "ne" && spel.children[1].type == "null") {
    opKeys = ["is_not_null"];
  } else if (op == "le" && spel.children[1].type == "string" && spel.children[1].val == "") {
    opKeys = ["is_empty"];
  } else if (op == "gt" && spel.children[1].type == "string" && spel.children[1].val == "") {
    opKeys = ["is_not_empty"];
  } else if (op == "between") {
    opKeys = ["between"];
  }

  // convert children
  spel._groupField = parentSpel?._groupField;
  const convertChildren = () => {
    let newChildren = spel.children.map(child =>
      convertToTree(child, conv, config, meta, spel)
    );
    if (newChildren.length >= 2 && newChildren?.[0]?.type == "!compare") {
      newChildren = newChildren[0].children;
    }
    return newChildren;
  };
  if (op == "and" || op == "or") {
    const children1 = {};
    const vals = convertChildren();
    vals.forEach(v => {
      if (v) {
        const id = uuid();
        v.id = id;
        if (v.type != undefined) {
          children1[id] = v;
        } else {
          meta.errors.push(`Bad item in AND/OR: ${JSON.stringify(v)}`);
        }
      }
    });
    res = {
      type: "group",
      id: uuid(),
      children1,
      properties: {
        conjunction: conv.conjunctions[op],
        not: spel.not
      }
    };
  } else if (opKeys) {
    const vals = convertChildren();
    const fieldObj = vals[0];
    let convertedArgs = vals.slice(1);
    const groupField = fieldObj?.groupFieldValue?.value;
    const opArg = convertedArgs?.[0];
    
    let opKey = opKeys[0];
    if (opKeys.length > 1) {
      const valueType = vals[0]?.valueType || vals[1]?.valueType;
      //todo: it's naive, use valueType
      const field = fieldObj?.value;
      const widgets = opKeys.map(op => ({op, widget: getWidgetForFieldOp(config, field, op)}));
      logger.warn(`[spel] Spel operator ${op} can be mapped to ${opKeys}.`,
        "widgets:", widgets, "vals:", vals, "valueType=", valueType);
      
      if (op == "eq" || op == "ne") {
        const ws = widgets.find(({ op, widget }) => (widget && widget != "field"));
        if (ws) {
          opKey = ws.op;
        }
      }
    }

    // some/all/none
    if (fieldObj?.groupFieldValue) {
      if (opArg && opArg.groupFieldValue && opArg.groupFieldValue.valueSrc == "field" && opArg.groupFieldValue.value == groupField) {
        // group.?[...].size() == group.size()
        opKey = "all";
        convertedArgs = [];
      } else if (opKey == "equal" && opArg.valueSrc == "value" && opArg.valueType == "number" && opArg.value == 0) {
        opKey = "none";
        convertedArgs = [];
      } else if (opKey == "greater" && opArg.valueSrc == "value" && opArg.valueType == "number" && opArg.value == 0) {
        opKey = "some";
        convertedArgs = [];
      }
    }

    let opConfig = config.operators[opKey];
    const reversedOpConfig = config.operators[opConfig?.reversedOp];
    const opNeedsReverse = spel.not && ["between"].includes(opKey);
    const opCanReverse = !!reversedOpConfig;
    const canRev = opCanReverse && (!!config.settings.reverseOperatorsForNot || opNeedsReverse);
    const needRev = spel.not && canRev || opNeedsReverse;
    if (needRev) {
      opKey = opConfig.reversedOp;
      opConfig = config.operators[opKey];
      spel.not = !spel.not;
    }
    const needWrapWithNot = !!spel.not;
    spel.not = false; // handled with needWrapWithNot
    
    if (!fieldObj) {
      // LHS can't be parsed
    } else if (fieldObj.groupFieldValue) {
      // 1. group
      if (fieldObj.groupFieldValue.valueSrc != "field") {
        meta.errors.push(`Expected group field ${JSON.stringify(fieldObj)}`);
      }

      res = buildRuleGroup(fieldObj, opKey, convertedArgs, config, meta);
    } else {
      // 2. not group
      if (fieldObj.valueSrc != "field" && fieldObj.valueSrc != "func") {
        meta.errors.push(`Expected field/func at LHS, but got ${JSON.stringify(fieldObj)}`);
      }
      const field = fieldObj.value;
      res = buildRule(config, meta, field, opKey, convertedArgs, spel);
    }

    if (needWrapWithNot) {
      if (res.type !== "group") {
        res = wrapInDefaultConj(res, config, true);
      } else {
        res.properties.not = !res.properties.not;
      }
    }
  } else {
    if (!parentSpel) {
      // try to parse whole `"str" + prop + #var` as ternary
      res = buildSimpleSwitch(spel, conv, config, meta);
    }
    // if (!res) {
    //   meta.errors.push(`Can't convert op ${op}`);
    // }
  }
  return res;
};

const convertPath = (parts, meta = {}, expectingField = false) => {
  let isError = false;
  const res = parts.map(c => {
    if (c.type == "variable" || c.type == "property" || c.type == "indexer" && c.itype == "string") {
      return c.val;
    } else {
      isError = true;
      expectingField && meta?.errors?.push?.(`Unexpected item in field path compound: ${JSON.stringify(c)}`);
    }
  });
  return !isError ? res : undefined;
};

const convertArg = (spel, conv, config, meta, parentSpel) => {
  if (spel == undefined)
    return undefined;
  const {fieldSeparator} = config.settings;

  if (spel.type == "variable" || spel.type == "property") {
    // normal field
    const field = normalizeField(config, spel.val, parentSpel?._groupField);
    const fieldConfig = getFieldConfig(config, field);
    const isVariable = spel.type == "variable";
    return {
      valueSrc: "field",
      valueType: fieldConfig?.type,
      isVariable,
      value: field,
    };
  } else if (spel.type == "compound") {
    // complex field
    const parts = convertPath(spel.children, meta);
    if (parts) {
      const field = normalizeField(config, parts.join(fieldSeparator), parentSpel?._groupField);
      const fieldConfig = getFieldConfig(config, field);
      const isVariable = spel.children?.[0]?.type == "variable";
      return {
        valueSrc: "field",
        valueType: fieldConfig?.type,
        isVariable,
        value: field,
      };
    } else {
      // it's not complex field
    }
  } else if (SpelPrimitiveTypes[spel.type]) {
    let value = spel.val;
    const valueType = SpelPrimitiveTypes[spel.type];
    if (spel.negative) {
      value = -value;
    }
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (spel.type == "!new" && SpelPrimitiveClasses[spel.cls.at(-1)]) {
    const args = spel.args.map(v => convertArg(v, conv, config, meta, spel));
    const value = args?.[0];
    const valueType = SpelPrimitiveClasses[spel.cls.at(-1)];
    return {
      ...value,
      valueType,
    };
  } else if (spel.type == "list") {
    const values = spel.val.map(v => convertArg(v, conv, config, meta, spel));
    const _itemType = values.length ? values[0]?.valueType : null;
    const value = values.map(v => v?.value);
    const valueType = ListValueType;
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (spel.type === "op-plus" && parentSpel?.type === "ternary" && config.settings.caseValueField?.type === "case_value") {
    /**
     * @deprecated
     */
    return buildCaseValueConcat(spel, conv, config, meta);
  }

  let maybe = convertFunc(spel, conv, config, meta, parentSpel);
  if (maybe !== undefined) {
    return maybe;
  }

  meta.errors.push(`Can't convert arg of type ${spel.type}`);
  return undefined;
};

const buildFuncSignatures = (spel) => {
  // branches
  const brns = [
    {s: "", params: [], objs: []}
  ];
  _buildFuncSignatures(spel, brns);
  return brns.map(({s, params}) => ({s, params})).reverse().filter(({s}) => s !== "" && s !== "?");
};

// a.toLower().toUpper()
// ->
// ?.toLower().toUpper()
// ?.toUpper()
const _buildFuncSignatures = (spel, brns) => {
  let params = [], s = "";
  const { type, methodName, val, obj, args, isVar, cls, children } = spel;
  const lastChild = children?.[children.length-1];
  let currBrn = brns[brns.length-1];
  if (type === "!func") {
    // T(DateTimeFormat).forPattern(?).parseDateTime(?)  --  ok
    // T(LocalDateTime).parse(?, T(DateTimeFormatter).ofPattern(?))  --  will not work
    let o = obj;
    while (o) {
      const [s1, params1] = _buildFuncSignatures({...o, obj: null}, [{}]);
      if (s1 !== "?") {
        // start new branch
        const newBrn = {
          s: currBrn.s,
          params: [...currBrn.params],
          objs: [...currBrn.objs]
        };
        // finish old branch
        currBrn.objs.unshift("?");
        currBrn.params.unshift(o);
        // switch
        brns.push(newBrn);
        currBrn = brns[brns.length-1];
      }
      // step
      currBrn.objs.unshift(s1);
      currBrn.params.unshift(...params1);
      o = o.type === "!func" ? o.obj : null;
    }
    for (const brn of brns) {
      params = [
        ...(brn?.params || []),
        ...(args || []),
      ];
      s = "";
      if (brn?.objs?.length)
        s += brn.objs.join(".") + ".";
      s += (isVar ? "#" : "") + methodName;
      s += "(" + (args || []).map(_ => "?").join(", ") + ")";
      brn.s = s;
      brn.params = params;
    }
  } else if (type === "!new") {
    // new java.text.SimpleDateFormat('HH:mm:ss').parse('...')
    params = args || [];
    s = `new ${cls.join(".")}(${params.map(_ => "?").join(", ")})`;
  } else if (type === "!type") {
    // T(java.time.LocalTime).parse('...')
    s = `T(${cls.join(".")})`;
  } else if (type === "compound" && lastChild.type === "property" && isFuncableProperty(lastChild.val)) {
    // {1,2}.length  --  ok
    // 'Hello World'.bytes.length  --  will not work
    s = children.map((c) => {
      if (c === lastChild)
        return c.val;
      const [s1, params1] = _buildFuncSignatures({...c, obj: null}, [{}]);
      params.push(...params1);
      return s1;
    }).join(".");
  } else {
    params = [spel];
    s = "?";
  }

  if (currBrn) {
    currBrn.s = s;
    currBrn.params = params;
  }

  return [s, params];
};

const convertFunc = (spel, conv, config, meta, parentSpel) => {
  // Build signatures
  spel._groupField = parentSpel?._groupField;
  const convertFuncArg = v => convertToTree(v, conv, config, meta, spel);
  const fsigns = buildFuncSignatures(spel);
  const firstSign = fsigns?.[0]?.s;
  if (fsigns.length)
    logger.debug("Signatures for ", spel, ":", firstSign, fsigns);
  
  // 1. Try to parse as value
  let maybeValue = convertFuncToValue(spel, conv, config, meta, parentSpel, fsigns, convertFuncArg);
  if (maybeValue !== undefined)
    return maybeValue;
  
  // 2. Try to parse as op
  let maybeOp = convertFuncToOp(spel, conv, config, meta, parentSpel, fsigns, convertFuncArg);
  if (maybeOp !== undefined)
    return maybeOp;
  
  // 3. Try to parse as func
  let funcKey, funcConfig, argsObj;
  // try func signature matching
  for (const {s, params} of fsigns) {
    const funcKeys = conv.funcs[s];
    if (funcKeys) {
      // todo: here we can check arg types, if we have function overloading
      funcKey = funcKeys[0];
      funcConfig = getFuncConfig(config, funcKey);
      const {spelFunc} = funcConfig;
      const argsArr = params.map(convertFuncArg);
      const argsOrder = [...spelFunc.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
      argsObj = Object.fromEntries(
        argsOrder.map((argKey, i) => [argKey, argsArr[i]])
      );
      break;
    }
  }
  // try `spelImport`
  if (!funcKey) {
    for (const [f, fc] of iterateFuncs(config)) {
      if (fc.spelImport) {
        let parsed;
        try {
          parsed = fc.spelImport(spel);
        } catch(_e) {
          // can't be parsed
        }
        if (parsed) {
          funcKey = f;
          funcConfig = getFuncConfig(config, funcKey);
          argsObj = {};
          for (let argKey in parsed) {
            argsObj[argKey] = convertFuncArg(parsed[argKey]);
          }
        }
      }
    }
  }

  // convert
  if (funcKey) {
    const funcArgs = {};
    for (let argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      let argVal = argsObj[argKey];
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
      valueType: funcConfig.returnType,
    };
  }

  const {methodName} = spel;
  if (methodName)
    meta.errors.push(`Signature ${firstSign} - failed to convert`);
  
  return undefined;
};

const convertFuncToValue = (spel, conv, config, meta, parentSpel, fsigns, convertFuncArg) => {
  let errs, foundSign, foundWidget;
  const candidates = [];

  for (let w in config.widgets) {
    const widgetDef = config.widgets[w];
    const {spelImportFuncs} = widgetDef;
    if (spelImportFuncs) {
      for (let i = 0 ; i < spelImportFuncs.length ; i++) {
        const fj = spelImportFuncs[i];
        if (isObject(fj)) {
          const bag = {};
          if (isJsonCompatible(fj, spel, bag)) {
            for (const k in bag) {
              bag[k] = convertFuncArg(bag[k]);
            }
            candidates.push({
              s: `widgets.${w}.spelImportFuncs[${i}]`,
              w,
              argsObj: bag,
            });
          }
        }
      }
    }
  }

  for (const {s, params} of fsigns) {
    const found = conv.valueFuncs[s] || [];
    for (const {w, argsOrder} of found) {
      const argsArr = params.map(convertFuncArg);
      const argsObj = Object.fromEntries(
        argsOrder.map((argKey, i) => [argKey, argsArr[i]])
      );
      candidates.push({
        s,
        w,
        argsObj,
      });
    }
  }

  for (const {s, w, argsObj} of candidates) {
    const widgetDef = config.widgets[w];
    const {spelImportValue, type} = widgetDef;
    foundWidget = w;
    foundSign = s;
    errs = [];
    for (const k in argsObj) {
      if (!["value"].includes(argsObj[k].valueSrc)) {
        errs.push(`${k} has unsupported value src ${argsObj[k].valueSrc}`);
      }
    }
    let value = argsObj.v.value;
    if (spelImportValue && !errs.length) {
      [value, errs] = spelImportValue.call(config.ctx, argsObj.v, widgetDef, argsObj);
      if (errs && !Array.isArray(errs))
        errs = [errs];
    }
    if (!errs.length) {
      return {
        valueSrc: "value",
        valueType: type,
        value,
      };
    }
  }

  if (foundWidget && errs.length) {
    meta.errors.push(`Signature ${foundSign} - looks like convertable to ${foundWidget}, but: ${errs.join("; ")}`);
  }

  return undefined;
};

const convertFuncToOp = (spel, conv, config, meta, parentSpel, fsigns, convertFuncArg) => {
  let errs, opKey, foundSign;
  for (const {s, params} of fsigns) {
    const found = conv.opFuncs[s] || [];
    for (const {op, argsOrder} of found) {
      const argsArr = params.map(convertFuncArg);
      opKey = op;
      if (op === "!compare") {
        if (
          parentSpel.type.startsWith("op-")
          && parentSpel.children.length == 2
          && parentSpel.children[1].type == "number"
          && parentSpel.children[1].val === 0
        ) {
          return {
            type: "!compare",
            children: argsArr,
          };
        } else {
          errs.push("Result of compareTo() should be compared to 0");
        }
      }
      foundSign = s;
      errs = [];
      const opDef = config.operators[opKey];
      const {spelOp, valueTypes} = opDef;
      const argsObj = Object.fromEntries(
        argsOrder.map((argKey, i) => [argKey, argsArr[i]])
      );
      const field = argsObj["0"];
      const convertedArgs = Object.keys(argsObj).filter(k => parseInt(k) > 0).map(k => argsObj[k]);
      
      const valueType = argsArr.filter(a => !!a).find(({valueSrc}) => valueSrc === "value")?.valueType;
      if (valueTypes && valueType && !valueTypes.includes(valueType)) {
        errs.push(`Op supports types ${valueTypes}, but got ${valueType}`);
      }
      if (!errs.length) {
        spel._groupField = parentSpel?._groupField;
        return buildRule(config, meta, field, opKey, convertedArgs, spel);
      }
    }
  }

  if (opKey && errs.length) {
    meta.errors.push(`Signature ${foundSign} - looks like convertable to ${opKey}, but: ${errs.join("; ")}`);
  }

  return undefined;
};

const buildRule = (config, meta, field, opKey, convertedArgs, spel) => {
  if (convertedArgs.filter(v => v === undefined).length) {
    return undefined;
  }
  let fieldSrc = field?.func ? "func" : "field";
  if (isObject(field) && field.valueSrc) {
    // if comed from convertFuncToOp()
    fieldSrc = field.valueSrc;
    field = field.value;
  }
  const fieldConfig = getFieldConfig(config, field);
  if (!fieldConfig) {
    meta.errors.push(`No config for field ${field}`);
    return undefined;
  }

  const parentFieldConfig = getFieldConfig(config, spel?._groupField);
  const isRuleGroup = fieldConfig.type == "!group";
  const isGroupArray = isRuleGroup && fieldConfig.mode == "array";
  const isInRuleGroup = parentFieldConfig?.type == "!group";

  let opConfig = config.operators[opKey];
  const reversedOpConfig = config.operators[opConfig?.reversedOp];
  const opNeedsReverse = spel?.not && ["between"].includes(opKey);
  const opCanReverse = !!reversedOpConfig;
  const canRev = opCanReverse && (
    !!config.settings.reverseOperatorsForNot
    || opNeedsReverse
    || !isRuleGroup && isInRuleGroup // 2+ rules in rule-group should be flat. see inits.with_not_and_in_some in test
  );
  const needRev = spel?.not && canRev || opNeedsReverse;
  if (needRev) {
    // todo: should be already handled at convertOp ?  or there are special cases to handle here, like rule-group ?
    opKey = opConfig.reversedOp;
    opConfig = config.operators[opKey];
    spel.not = !spel.not;
  }
  const needWrapWithNot = !!spel?.not;

  const widget = getWidgetForFieldOp(config, field, opKey);
  const widgetConfig = config.widgets[widget || fieldConfig.mainWidget];
  const asyncListValuesArr = convertedArgs.map(v => v.asyncListValues).filter(v => v != undefined);
  const asyncListValues = asyncListValuesArr.length ? asyncListValuesArr[0] : undefined;

  let res = {
    type: "rule",
    id: uuid(),
    properties: {
      field,
      fieldSrc,
      operator: opKey,
      value: convertedArgs.map(v => v.value),
      valueSrc: convertedArgs.map(v => v.valueSrc),
      valueType: convertedArgs.map(v => {
        if (v.valueSrc == "value") {
          return widgetConfig?.type || fieldConfig?.type || v.valueType;
        }
        return v.valueType;
      }),
      ...(asyncListValues ? {asyncListValues} : {}),
    }
  };

  if (needWrapWithNot) {
    res = wrapInDefaultConj(res, config, spel.not);
    // spel.not = !spel.not; // why I added this line?
  }

  return res;
};

const buildRuleGroup = ({groupFilter, groupFieldValue}, opKey, convertedArgs, config, meta) => {
  if (groupFieldValue.valueSrc != "field")
    throw `Bad groupFieldValue: ${JSON.stringify(groupFieldValue)}`;
  const groupField = groupFieldValue.value;
  let groupOpRule = buildRule(config, meta, groupField, opKey, convertedArgs);
  if (!groupOpRule)
    return undefined;
  const fieldConfig = getFieldConfig(config, groupField);
  const mode = fieldConfig?.mode;
  let res;

  if (groupFilter?.type === "group") {
    res = {
      ...(groupFilter || {}),
      type: "rule_group",
      properties: {
        ...groupOpRule.properties,
        ...(groupFilter?.properties || {}),
        mode
      }
    };
  } else if (groupFilter) {
    // rule_group in rule_group
    res = {
      ...(groupOpRule || {}),
      type: "rule_group",
      children1: [ groupFilter ],
      properties: {
        ...groupOpRule.properties,
        mode
      }
    };
  } else {
    res = {
      ...(groupOpRule || {}),
      type: "rule_group",
      properties: {
        ...groupOpRule.properties,
        mode
      }
    };
  }

  if (!res.id)
    res.id = uuid();
  return res;
};


const compareArgs = (left, right,  spel, conv, config, meta, parentSpel = null) => {
  if (left.type == right.type) {
    if (left.type == "!aggr") {
      const [leftSource, rightSource] = [left.source, right.source].map(v => convertArg(v, conv, config, meta, spel));
      //todo: check same filter
      return leftSource.value == rightSource.value;
    } else {
      const [leftVal, rightVal] = [left, right].map(v => convertArg(v, conv, config, meta, spel));
      return leftVal.value == rightVal.value;
    }
  }
  return false;
};

const buildSimpleSwitch = (val, conv, config, meta) => {
  let children1 = {};
  const cond = null;
  const caseI = buildCase(cond, val, conv, config, meta);
  if (caseI) {
    children1[caseI.id] = caseI;
  }
  let res = {
    type: "switch_group",
    id: uuid(),
    children1,
    properties: {}
  };
  return res;
};

const buildCase = (cond, val, conv, config, meta, spel = null) => {
  const valProperties = buildCaseValProperties(config, meta, conv, val, spel);

  let caseI;
  if (cond) {
    caseI = convertToTree(cond, conv, config, meta, spel);
    if (caseI && caseI.type) {
      if (caseI.type != "group") {
        caseI = wrapInDefaultConj(caseI, config);
      }
      caseI.type = "case_group";
    } else {
      meta.errors.push(`Unexpected case: ${JSON.stringify(caseI)}`);
      caseI = undefined;
    }
  } else {
    caseI = {
      id: uuid(),
      type: "case_group",
      properties: {}
    };
  }

  if (caseI) {
    caseI.properties = {
      ...caseI.properties,
      ...valProperties
    };
  }

  return caseI;
};

/**
 * @deprecated
 */
const buildCaseValueConcat = (spel, conv, config, meta) => {
  let flat = [];
  function _processConcatChildren(children) {
    children.map(child => {
      if (child.type === "op-plus") {
        _processConcatChildren(child.children);
      } else {
        const convertedChild = convertArg(child, conv, config, meta, spel);
        if (convertedChild) {
          flat.push(convertedChild);
        } else {
          meta.errors.push(`Can't convert ${child.type} in concatenation`);
        }
      }
    });
  }
  _processConcatChildren(spel.children);
  return {
    valueSrc: "value",
    valueType: "case_value",
    value: flat,
  };
};

const buildCaseValProperties = (config, meta, conv, val, spel = null) => {
  let valProperties = {};
  let convVal;
  let widget;
  let widgetConfig;
  const caseValueFieldConfig = getFieldConfig(config, "!case_value");
  if (val?.type === "op-plus" && config.settings.caseValueField?.type === "case_value") {
    /**
     * @deprecated
     */
    widget = "case_value";
    convVal = buildCaseValueConcat(val, conv, config, meta);
  } else {
    widget = caseValueFieldConfig?.mainWidget;
    widgetConfig = config.widgets[widget];
    convVal = convertArg(val, conv, config, meta, spel);
    if (convVal && convVal.valueSrc === "value") {
      convVal.valueType = widgetConfig?.type || caseValueFieldConfig?.type || convVal.valueType;
    }
  }
  const widgetDef = config.widgets[widget];
  if (widget === "case_value") {
    /**
     * @deprecated
     */
    const importCaseValue = widgetDef?.spelImportValue;
    if (importCaseValue) {
      const [normVal, normErrors] = importCaseValue.call(config.ctx, convVal);
      normErrors.map(e => meta.errors.push(e));
      if (normVal != undefined) {
        valProperties = {
          value: [normVal],
          valueSrc: ["value"],
          valueType: [widgetDef?.type ?? "case_value"],
          field: "!case_value",
        };
      }
    }
  } else if (convVal != undefined && convVal?.value != undefined) {
    valProperties = {
      value: [convVal.value],
      valueSrc: [convVal.valueSrc],
      valueType: [convVal.valueType],
      field: "!case_value",
    };
  }
  return valProperties;
};

// const wrapInDefaultConjRuleGroup = (rule, parentField, parentFieldConfig, config, conj) => {
//   if (!rule) return undefined;
//   return {
//     type: "rule_group",
//     id: uuid(),
//     children1: { [rule.id]: rule },
//     properties: {
//       conjunction: conj || defaultGroupConjunction(config, parentFieldConfig),
//       not: false,
//       field: parentField,
//     }
//   };
// };

const wrapInDefaultConj = (rule, config, not = false) => {
  return {
    type: "group",
    id: uuid(),
    children1: { [rule.id]: rule },
    properties: {
      conjunction: defaultConjunction(config),
      not: not || false
    }
  };
};
