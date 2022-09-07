import { SpelExpressionEvaluator } from "spel2js";
import uuid from "../utils/uuid";
import {getFieldConfig, extendConfig, normalizeField} from "../utils/configUtils";
import {getWidgetForFieldOp} from "../utils/ruleUtils";
import {loadTree} from "./tree";
import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";
import {logger} from "../utils/stuff";
import moment from "moment";

export const loadFromSpel = (logicTree, config) => {
  return _loadFromSpel(logicTree, config, true);
};

export const _loadFromSpel = (spelStr, config, returnErrors = true) => {
  //meta is mutable
  let meta = {
    errors: []
  };
  const extendedConfig = extendConfig(config);
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
    logger.debug("compiledExpression:", compiledExpression);
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
    const lastChild = children[children.length - 1];
    const isSize = lastChild.type == "method" && lastChild.val.methodName == "size" 
      || lastChild.type == "!func" && lastChild.methodName == "size" ;
    const isLength = lastChild.type == "property" && lastChild.val == "length";
    const sourceParts = children.filter(child => 
      child !== selection && child !== lastChild
    );
    const source = {
      type: "compound",
      children: sourceParts
    };
    if (isSize || isLength) {
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
    if (lastChild.type == "method") {
      const obj = children.filter(child => 
        child !== lastChild
      );
      return {
        type: "!func",
        obj,
        methodName: lastChild.val.methodName,
        args: lastChild.val.args
      };
    }
    // !func
    if (lastChild.type == "!func") {
      const obj = children.filter(child => 
        child !== lastChild
      );
      return {
        ...lastChild,
        obj,
      };
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
  for (let funcKey in config.funcs) {
    const funcConfig = config.funcs[funcKey];
    let fk;
    if (typeof funcConfig.spelFunc == "string") {
      fk = funcConfig.spelFunc;
    }
    if (fk) {
      if (!funcs[fk])
        funcs[fk] = [];
      funcs[fk].push(funcKey);
    }
  }

  return {
    operators,
    conjunctions,
    funcs,
  };
};

const convertPath = (parts, meta) => {
  let isError = false;
  const res = parts.map(c => {
    if (c.type == "variable" || c.type == "property" || c.type == "indexer" && c.itype == "string") {
      return c.val;
    } else {
      isError = true;
      meta.errors.push(`Unexpected item in compound: ${JSON.stringify(c)}`);
    }
  });
  return !isError ? res : undefined;
};

const convertArg = (spel, conv, config, meta, parentSpel) => {
  if (spel == undefined)
    return undefined;
  const {fieldSeparator} = config.settings;
  const literalTypes = {
    number: "number",
    string: "text",
    boolean: "boolean",
    null: "null" // should not be
  };
  
  const groupFieldParts = parentSpel?._groupField ? [parentSpel?._groupField] : [];
  if (spel.type == "compound") {
    // complex field
    const parts = convertPath(spel.children, meta);
    if (!parts) {
      return undefined;
    }
    const fullParts = [...groupFieldParts, ...parts];
    const isVariable = spel.children?.[0]?.type == "variable";
    return {
      valueSrc: "field",
      //valueType: todo
      isVariable,
      value: fullParts.join(fieldSeparator),
    };
  } else if (spel.type == "variable" || spel.type == "property") {
    // normal field
    const fullParts = [...groupFieldParts, spel.val];
    const isVariable = spel.type == "variable";
    return {
      valueSrc: "field",
      //valueType: todo
      isVariable,
      value: fullParts.join(fieldSeparator),
    };
  } else if (literalTypes[spel.type]) {
    let value = spel.val;
    let valueType = literalTypes[spel.type];
    if (parentSpel?.isUnary) {
      value = -value;
    }
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (spel.type == "list") {
    const values = spel.val.map(v => convertArg(v, conv, config, meta, spel));
    const _itemType = values.length ? values[0]?.valueType : null;
    const value = values.map(v => v?.value);
    const valueType = "multiselect";
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (spel.type == "!func") {
    const {obj, methodName, args, isVar} = spel;
    
    // todo: get from conv
    const funcToOpMap = {
      [".contains"]: "like",
      [".startsWith"]: "starts_with",
      [".endsWith"]: "ends_with",
      ["$contains"]: "select_any_in",
    };

    const convertedArgs = args.map(v => convertArg(v, conv, config, meta, {
      ...spel,
      _groupField: parentSpel?._groupField
    }));

    //todo: make dynamic: use funcToOpMap and check obj type in basic config
    if (methodName == "contains" && obj && obj[0].type == "list") {
      const convertedObj = obj.map(v => convertArg(v, conv, config, meta, spel));
      // {'yellow', 'green'}.?[true].contains(color)
      if (!( convertedArgs.length == 1 && convertedArgs[0].valueSrc == "field" )) {
        meta.errors.push(`Expected arg to method ${methodName} to be field but got: ${JSON.stringify(convertedArgs)}`);
        return undefined;
      }
      const field = convertedArgs[0].value;
      if (!( convertedObj.length == 1 && convertedObj[0].valueType == "multiselect" )) {
        meta.errors.push(`Expected object of method ${methodName} to be inline list but got: ${JSON.stringify(convertedObj)}`);
        return undefined;
      }
      const opKey = funcToOpMap["$"+methodName];
      const list = convertedObj[0];
      return buildRule(config, meta, field, opKey, [list]);
    } else if (funcToOpMap["."+methodName]) {
      // user.login.startsWith('gg')
      const opKey = funcToOpMap["."+methodName];
      const parts = convertPath(obj, meta);
      if (parts && convertedArgs.length == 1) {
        const fullParts = [...groupFieldParts, ...parts];
        const field = fullParts.join(fieldSeparator);
        return buildRule(config, meta, field, opKey, convertedArgs);
      }
    } else if (methodName == "parse" && obj && obj[0].type == "!new" && obj[0].cls.at(-1) == "SimpleDateFormat") {
      // new java.text.SimpleDateFormat('yyyy-MM-dd').parse('2022-01-15')
      const args = obj[0].args.map(v => convertArg(v, conv, config, meta, {
        ...spel,
        _groupField: parentSpel?._groupField
      }));
      if (!( args.length == 1 && args[0].valueType == "text" )) {
        meta.errors.push(`Expected args of ${obj[0].cls.join(".")}.${methodName} to be 1 string but got: ${JSON.stringify(args)}`);
        return undefined;
      }
      if (!( convertedArgs.length == 1 && convertedArgs[0].valueType == "text" )) {
        meta.errors.push(`Expected args of ${obj[0].cls.join(".")} to be 1 string but got: ${JSON.stringify(convertedArgs)}`);
        return undefined;
      }
      const dateFormat = args[0].value;
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
    } else if (methodName == "parse" && obj && obj[0].type == "!type" && obj[0].cls.at(-1) == "LocalTime") {
      // time == T(java.time.LocalTime).parse('02:03:00')
      if (!( convertedArgs.length == 1 && convertedArgs[0].valueType == "text" )) {
        meta.errors.push(`Expected args of ${obj[0].cls.join(".")} to be 1 string but got: ${JSON.stringify(convertedArgs)}`);
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
    } else {
      // todo: conv.funcs
      meta.errors.push(`Unsupported method ${methodName}`);
    }
  } else if (spel.type == "op-plus" && parentSpel?.type == "ternary") {
    return buildCaseValueConcat(spel, conv, config, meta);
  } else {
    meta.errors.push(`Can't convert arg of type ${spel.type}`);
  }
  return undefined;
};

const buildRule = (config, meta, field, opKey, convertedArgs) => {
  if (convertedArgs.filter(v => v === undefined).length) {
    return undefined;
  }
  const fieldConfig = getFieldConfig(config, field);
  if (!fieldConfig) {
    meta.errors.push(`No config for field ${field}`);
    return undefined;
  }
  const widget = getWidgetForFieldOp(config, field, opKey);
  const widgetConfig = config.widgets[widget || fieldConfig.mainWidget];
  const asyncListValuesArr = convertedArgs.map(v => v.asyncListValues).filter(v => v != undefined);
  const asyncListValues = asyncListValuesArr.length ? asyncListValuesArr[0] : undefined;
  let res = {
    type: "rule",
    id: uuid(),
    properties: {
      field: field,
      operator: opKey,
      value: convertedArgs.map(v => v.value),
      valueSrc: convertedArgs.map(v => v.valueSrc),
      valueType: convertedArgs.map(v => {
        if (v.valueSrc == "value") {
          return widgetConfig?.type || fieldConfig?.type || v.valueType;
        }
        return v.valueType;
      }),
      asyncListValues,
    }
  };
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

const convertToTree = (spel, conv, config, meta, parentSpel = null) => {
  if(!spel) return undefined;
  let res;
  if (spel.type.indexOf("op-") == 0) {
    let op = spel.type.slice("op-".length);

    // unary
    const isUnary = (op == "minus" || op == "plus") && spel.children.length == 1;
    if (isUnary) {
      spel.isUnary = true;
      return convertToTree(spel.children[0], conv, config, meta, spel);
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
        return convertToTree(oneSpel, conv, config, meta, parentSpel);
      }
    }

    // find op
    let opKeys = conv.operators[op];
    let opKey;
    // todo: make dynamic, use basic config
    if (op == "eq" && spel.children[1].type == "null") {
      opKey = "is_null";
    } else if (op == "ne" && spel.children[1].type == "null") {
      opKey = "is_not_null";
    } else if (op == "le" && spel.children[1].type == "string" && spel.children[1].val == "") {
      opKey = "is_empty";
      opKeys = ["is_empty"];
    } else if (op == "gt" && spel.children[1].type == "string" && spel.children[1].val == "") {
      opKey = "is_not_empty";
      opKeys = ["is_not_empty"];
    } else if (op == "between") {
      opKey = "between";
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
      opKey = opKeys[0];
      
      if (!fieldObj) {
        // LHS can't be parsed
      } else if (fieldObj.groupFieldValue) {
        // 1. group
        if (fieldObj.groupFieldValue.valueSrc != "field") {
          meta.errors.push(`Expected group field ${JSON.stringify(fieldObj)}`);
        }
        const groupField = fieldObj.groupFieldValue.value;
        
        // some/all/none
        const opArg = convertedArgs[0];
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

        res = buildRuleGroup(fieldObj, opKey, convertedArgs, config, meta);
      } else {
        // 2. not group
        if (fieldObj.valueSrc != "field") {
          meta.errors.push(`Expected field ${JSON.stringify(fieldObj)}`);
        }
        const field = fieldObj.value;

        if (opKeys.length > 1) {
          logger.warn(`[spel] Spel operator ${op} can be mapped to ${opKeys}`);

          //todo: it's naive
          const widgets = opKeys.map(op => ({op, widget: getWidgetForFieldOp(config, field, op)}));
          
          if (op == "eq" || op == "ne") {
            const ws = widgets.find(({ op, widget }) => (widget && widget != "field"));
            opKey = ws.op;
          }
        }
        res = buildRule(config, meta, field, opKey, convertedArgs);
      }
    } else {
      if (!parentSpel) {
        // try to parse whole `"str" + prop + #var` as ternary
        res = buildSimpleSwitch(spel, conv, config, meta);
      }
      if (!res) {
        meta.errors.push(`Can't convert op ${op}`);
      }
    }
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
      groupFilter = wrapInDefaultConj(groupFilter, config);
    }
    res = {
      groupFilter,
      groupFieldValue
    };
    if (!parentSpel) {
      // !aggr can't be in root, it should be compared with something
      res = undefined;
      meta.errors.push("Unexpected !aggr in root");
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
  } else {
    res = convertArg(spel, conv, config, meta, parentSpel);
    if (res && !res.type && !parentSpel) {
      // try to parse whole `"1"` as ternary
      const sw = buildSimpleSwitch(spel, conv, config, meta);
      if (sw) {
        res = sw;
      } else {
        res = undefined;
        meta.errors.push(`Can't convert rule of type ${spel.type}, it looks like var/literal`);
      }
    }
  }
  return res;
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
