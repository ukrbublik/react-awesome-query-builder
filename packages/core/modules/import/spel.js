import { SpelExpressionEvaluator } from "spel2js";
import uuid from "../utils/uuid";
import {getFieldConfig, getFuncConfig, extendConfig, normalizeField, iterateFuncs} from "../utils/configUtils";
import {getWidgetForFieldOp} from "../utils/ruleUtils";
import {loadTree} from "./tree";
import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";
import {logger} from "../utils/stuff";
import moment from "moment";

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
    convertedObj = convertCompiled(compiledExpression, meta);
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

const convertCompiled = (expr, meta, parentExpr = null) => {
  const type = expr.getType();
  let children = expr.getChildren().map(child => convertCompiled(child, meta, expr));

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
      val.args = val.args.map(child => convertCompiled(child, meta, expr));
    }
  }
  // convert list
  if (type == "list") {
    val = val.map(item => convertCompiled(item, meta, expr));

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
        const opk = spelOp; // + "/" + defaultValue(opConfig.cardinality, 1);
        if (!operators[opk])
          operators[opk] = [];
        operators[opk].push(opKey);
      });
    } else if (opConfig.spelOp) {
      const opk = opConfig.spelOp; // + "/" + defaultValue(opConfig.cardinality, 1);
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
    let fk;
    if (typeof funcConfig.spelFunc == "string") {
      fk = funcConfig.spelFunc.replace(/\${(\w+)}/g, (_, _k) => "?");
    }
    if (fk) {
      if (!funcs[fk])
        funcs[fk] = [];
      funcs[fk].push(funcPath);
    }
  }

  return {
    operators,
    conjunctions,
    funcs,
  };
};

const convertOp = (spel, conv, config, meta, parentSpel = null) => {
  let res;

  let op = spel.type.slice("op-".length);

  // unary
  const isUnary = (op == "minus" || op == "plus") && spel.children.length == 1;
  if (isUnary) {
    spel.isUnary = true;
    return convertOp(spel.children[0], conv, config, meta, spel);
  }

  // between
  let isBetweenNormal = (op == "and" && spel.children.length == 2 && spel.children[0].type == "op-ge" && spel.children[1].type == "op-le");
  let isBetweenRev = (op == "or" && spel.children.length == 2 && spel.children[0].type == "op-lt" && spel.children[1].type == "op-gt");
  let isBetween = isBetweenNormal || isBetweenRev;
  if (isBetween) {
    const [left, from] = spel.children[0].children;
    const [right, to] = spel.children[1].children;
    const isNumbers = from.type == "number" && to.type == "number";
    const isSameSource = compareArgs(left, right,  spel, conv, config, meta, parentSpel);
    if (isNumbers && isSameSource) {
      const _fromValue = from.val;
      const _toValue = to.val;
      const oneSpel = {
        type: "op-between",
        children: [
          left,
          from,
          to
        ]
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
  const convertChildren = () => spel.children.map(child => 
    convertToTree(child, conv, config, meta, {
      ...spel,
      _groupField: parentSpel?._groupField
    })
  );
  
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
      logger.warn(`[spel] Spel operator ${op} can be mapped to ${opKeys}`);

      //todo: it's naive
      const field = fieldObj?.value;
      const widgets = opKeys.map(op => ({op, widget: getWidgetForFieldOp(config, field, op)}));
      
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

    let canRev = true;
    let needWrapReverse = false;
    if (spel.not && canRev) {
      const opConfig = config.operators[opKey];
      if (opConfig.reversedOp) {
        opKey = opConfig.reversedOp;
        spel.not = false;
      } else {
        needWrapReverse = true;
      }
    }
    
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
      res = buildRule(config, meta, field, opKey, convertedArgs);
    }

    if (needWrapReverse) {
      if (res.type !== "group") {
        res = wrapInDefaultConj(res, config, spel.not);
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

const convertToTree = (spel, conv, config, meta, parentSpel = null) => {
  if (!spel) return undefined;

  let res, canParseAsArg = true;
  if (spel.type.indexOf("op-") == 0) {
    res = convertOp(spel, conv, config, meta, parentSpel);
  } else if (spel.type == "!aggr") {
    const groupFieldValue = convertToTree(spel.source, conv, config, meta, {
      ...spel, 
      _groupField: parentSpel?._groupField
    });
    let groupFilter = convertToTree(spel.filter, conv, config, meta, {
      ...spel, 
      _groupField: groupFieldValue?.value
    });
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

  const groupFieldParts = parentSpel?._groupField ? [parentSpel?._groupField] : [];
  if (spel.type == "compound") {
    // complex field
    const parts = convertPath(spel.children, meta);
    if (parts) {
      const fullParts = [...groupFieldParts, ...parts];
      // todo: normalizeField
      const isVariable = spel.children?.[0]?.type == "variable";
      return {
        valueSrc: "field",
        //valueType: todo
        isVariable,
        value: fullParts.join(fieldSeparator),
      };
    }
  } else if (spel.type == "variable" || spel.type == "property") {
    // normal field
    const fullParts = [...groupFieldParts, spel.val];
    // todo: normalizeField
    const isVariable = spel.type == "variable";
    return {
      valueSrc: "field",
      //valueType: todo
      isVariable,
      value: fullParts.join(fieldSeparator),
    };
  } else if (SpelPrimitiveTypes[spel.type]) {
    let value = spel.val;
    const valueType = SpelPrimitiveTypes[spel.type];
    if (parentSpel?.isUnary) {
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
  } else if (spel.type == "op-plus" && parentSpel?.type == "ternary") {
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
  return brns.map(({s, params}) => ({s, params})).reverse();
}

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
  let maybeValue = convertFuncToValue(spel, conv, config, meta, parentSpel);
  if (maybeValue !== undefined)
    return maybeValue;

  let maybeOp = convertFuncToOp(spel, conv, config, meta, parentSpel);
  if (maybeOp !== undefined)
    return maybeOp;

  const convertFuncArg = v => convertArg(v, conv, config, meta, {
    ...spel,
    _groupField: parentSpel?._groupField
  });

  const {methodName} = spel;
  let funcKey, funcConfig, argsObj;
  // try func signature matching
  const fsigns = buildFuncSignatures(spel);
  const firstSign = fsigns[0].s;
  if (firstSign !== "?")
    logger.debug("Signatures for ", spel, fsigns, firstSign);
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
        argVal = argConfig.defaultValue;
        if (argVal === undefined) {
          meta.errors.push(`No value for arg ${argKey} of func ${funcKey}`);
          return undefined;
        }
        argVal = {
          value: argVal,
          valueSrc: argVal?.func ? "func" : "value",
          valueType: argConfig.valueType,
        };
      }
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

  if (methodName)
    meta.errors.push(`Unsupported method ${methodName}, signature ${firstSign}`);
  
  return undefined;
};


const convertFuncToValue = (spel, conv, config, meta, parentSpel) => {
  const {obj, methodName, args, isVar} = spel;
  const ctorArgs = obj?.args;
  
  const convertFuncArg = v => convertArg(v, conv, config, meta, {
    ...spel,
    _groupField: parentSpel?._groupField
  });
  const convertArgs = () => args?.map(convertFuncArg);
  const convertCtorArgs = () => ctorArgs?.map(convertFuncArg);

  if (methodName == "parse" && obj && obj.type == "!new" && obj.cls.at(-1) == "SimpleDateFormat") {
    // new java.text.SimpleDateFormat('yyyy-MM-dd').parse('2022-01-15')
    const convertedArgs = convertArgs();
    const convertedCtorArgs = convertCtorArgs();
    if (!( convertedCtorArgs.length == 1 && convertedCtorArgs[0].valueType == "text" )) {
      meta.errors.push(`Expected args of ${obj.cls.join(".")}.${methodName} to be 1 string but got: ${JSON.stringify(convertedCtorArgs)}`);
      return undefined;
    }
    if (!( convertedArgs.length == 1 && convertedArgs[0].valueType == "text" )) {
      meta.errors.push(`Expected args of ${obj.cls.join(".")} to be 1 string but got: ${JSON.stringify(convertedArgs)}`);
      return undefined;
    }
    const dateFormat = convertedCtorArgs[0].value;
    const dateString = convertedArgs[0].value;
    const valueType = dateFormat.includes(" ") ? "datetime" : "date";
    const field = null; // todo
    const widget = valueType;
    const fieldConfig = getFieldConfig(config, field);
    const widgetConfig = config.widgets[widget || fieldConfig?.mainWidget];
    const valueFormat = widgetConfig.valueFormat;
    const dateVal = moment(dateString, moment.ISO_8601);
    const value = dateVal.isValid() ? dateVal.format(valueFormat) : undefined;
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (methodName == "parse" && obj && obj.type == "!type" && obj.cls.at(-1) == "LocalTime") {
    // time == T(java.time.LocalTime).parse('02:03:00')
    const convertedArgs = convertArgs();
    if (!( convertedArgs.length == 1 && convertedArgs[0].valueType == "text" )) {
      meta.errors.push(`Expected args of ${obj.cls.join(".")} to be 1 string but got: ${JSON.stringify(convertedArgs)}`);
      return undefined;
    }
    const timeString = convertedArgs[0].value;
    const valueType = "time";
    const field = null; // todo
    const widget = valueType;
    const fieldConfig = getFieldConfig(config, field);
    const widgetConfig = config.widgets[widget || fieldConfig?.mainWidget];
    const valueFormat = widgetConfig.valueFormat;
    const dateVal = moment(timeString, "HH:mm:ss");
    const value = dateVal.isValid() ? dateVal.format(valueFormat) : undefined;
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  }

  return undefined;
};

const convertFuncToOp = (spel, conv, config, meta, parentSpel) => {
  const {fieldSeparator} = config.settings;
  const groupFieldParts = parentSpel?._groupField ? [parentSpel?._groupField] : [];
  const {obj, methodName, args, isVar} = spel;
    
  // todo: get from conv
  const funcToOpMap = {
    [".contains"]: "like",
    [".startsWith"]: "starts_with",
    [".endsWith"]: "ends_with",
    ["$contains"]: "select_any_in",
    [".equals"]: "multiselect_equals",
    //[".containsAll"]: "multiselect_contains",
    ["CollectionUtils.containsAny()"]: "multiselect_contains"
  };

  const convertFuncArg = v => convertArg(v, conv, config, meta, {
    ...spel,
    _groupField: parentSpel?._groupField
  });
  const convertArgs = () => args?.map(convertFuncArg);

  //todo: make dynamic: use funcToOpMap and check obj type in basic config
  if (methodName == "contains" && obj && obj.type == "list") {
    const convertedArgs = convertArgs();
    const convertedObj = convertFuncArg(obj);
    // {'yellow', 'green'}.?[true].contains(color)
    if (!( convertedArgs.length == 1 && convertedArgs[0].valueSrc == "field" )) {
      meta.errors.push(`Expected arg to method ${methodName} to be field but got: ${JSON.stringify(convertedArgs)}`);
      return undefined;
    }
    const field = convertedArgs[0].value;
    if (convertedObj?.valueType != ListValueType) {
      meta.errors.push(`Expected object of method ${methodName} to be inline list but got: ${JSON.stringify(convertedObj)}`);
      return undefined;
    }
    const opKey = funcToOpMap["$"+methodName];
    return buildRule(config, meta, field, opKey, [convertedObj], spel);
  } else if (obj && obj.type == "property" && funcToOpMap[obj.val + "." + methodName + "()"]) {
    //todo: !!!!!! wrong
    // CollectionUtils.containsAny(multicolor, {'yellow', 'green'})
    const convertedArgs = convertArgs();
    const opKey = funcToOpMap[obj.val + "." + methodName + "()"];
    const field = convertedArgs[0].value;
    const args = convertedArgs.slice(1);
    return buildRule(config, meta, field, opKey, args, spel);
  } else if (funcToOpMap["."+methodName]) {
    // user.login.startsWith('gg')
    //todo: use convertArg(obj) should return field
    const convertedArgs = convertArgs();
    const opKey = funcToOpMap["."+methodName];
    const parts = convertPath(obj.children || [], meta);
    if (parts && convertedArgs.length == 1) {
      const fullParts = [...groupFieldParts, ...parts];
      const field = fullParts.join(fieldSeparator);
      return buildRule(config, meta, field, opKey, convertedArgs, spel);
    }
  }

  return undefined;
};

const buildRule = (config, meta, field, opKey, convertedArgs, spel) => {
  if (convertedArgs.filter(v => v === undefined).length) {
    return undefined;
  }
  const fieldConfig = getFieldConfig(config, field);
  if (!fieldConfig) {
    meta.errors.push(`No config for field ${field}`);
    return undefined;
  }

  let canRev = true;
  let needWrapReverse = false;
  if (spel?.not && canRev) {
    const opConfig = config.operators[opKey];
    if (opConfig.reversedOp) {
      opKey = opConfig.reversedOp;
      spel.not = false;
    } else {
      needWrapReverse = true;
    }
  }

  const fieldSrc = field?.func ? "func" : "field";
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

  if (needWrapReverse) {
    res = wrapInDefaultConj(res, config, spel?.not);
    if (spel?.not) {
      spel.not = false;
    }
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
  let res = {
    ...(groupFilter || {}),
    type: "rule_group",
    properties: {
      ...groupOpRule.properties,
      ...(groupFilter?.properties || {}),
      mode
    }
  };
  if (!res.id)
    res.id = uuid();
  return res;
};


const compareArgs = (left, right,  spel, conv, config, meta, parentSpel = null) => {
  if (left.type == right.type) {
    if (left.type == "!aggr") {
      const [leftSource, rightSource] = [left.source, right.source].map(v => convertArg(v, conv, config, meta, {
        ...spel,
        _groupField: parentSpel?._groupField
      }));
      //todo: check same filter
      return leftSource.value == rightSource.value;
    } else {
      const [leftVal, rightVal] = [left, right].map(v => convertArg(v, conv, config, meta, {
        ...spel,
        _groupField: parentSpel?._groupField
      }));
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

const buildCaseValueConcat = (spel, conv, config, meta) => {
  let flat = [];
  function _processConcatChildren(children) {
    children.map(child => {
      if (child.type == "op-plus") {
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
  if (val?.type == "op-plus") {
    convVal = buildCaseValueConcat(val, conv, config, meta);
  } else {
    convVal = convertArg(val, conv, config, meta, spel);
  }
  const widgetDef = config.widgets["case_value"];
  const importCaseValue = widgetDef?.spelImportValue;
  if (importCaseValue) {
    const [normVal, normErrors] = importCaseValue(convVal);
    normErrors.map(e => meta.errors.push(e));
    if (normVal) {
      valProperties = {
        value: [normVal],
        valueSrc: ["value"],
        valueType: ["case_value"]
      };
    }
  } else {
    meta.errors.push("No fucntion to import case value");
  }
  return valProperties;
};

const wrapInDefaultConjRuleGroup = (rule, parentField, parentFieldConfig, config, conj) => {
  if (!rule) return undefined;
  return {
    type: "rule_group",
    id: uuid(),
    children1: { [rule.id]: rule },
    properties: {
      conjunction: conj || defaultGroupConjunction(config, parentFieldConfig),
      not: false,
      field: parentField,
    }
  };
};

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
