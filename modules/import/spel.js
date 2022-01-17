import { StandardContext, SpelExpressionEvaluator } from "spel2js/src/main";
import uuid from "../utils/uuid";
import {defaultValue, isJsonLogic,shallowEqual} from "../utils/stuff";
import {getFieldConfig, extendConfig, normalizeField} from "../utils/configUtils";
import {getWidgetForFieldOp} from "../utils/ruleUtils";
import {loadTree} from "./tree";
import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";
import {fixPathsInTree} from "../utils/treeUtils";

import moment from "moment";


export const loadFromSpel = (spelStr, config) => {
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
    console.error(e);
    meta.errors.push(e);
  }
  
  if (compiledExpression) {
    console.log("compiledExpression:", compiledExpression);
    convertedObj = convertCompiled(compiledExpression, meta);
    console.log("convertedObj:", convertedObj, meta);

    jsTree = convertToTree(convertedObj, conv, extendedConfig, meta);
    if (jsTree && jsTree.type != "group") {
      jsTree = wrapInDefaultConj(jsTree, extendedConfig);
    }
    console.log("jsTree:", jsTree);
  }

  const immTree = jsTree ? loadTree(jsTree) : undefined;
  if (meta.errors.length)
    console.warn("Errors while importing from SpEL:", meta.errors);
  return [immTree, meta.errors];
};

const convertCompiled = (expr, meta) => {
  const type = expr.getType();
  let children = expr.getChildren().map(child => convertCompiled(child, meta));

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
    const isSize = lastChild.type == "method" && lastChild.val.methodName == "size";
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
    const isMethod = lastChild.type == "method";
    if (isMethod) {
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
    console.error("[spel2js] Error in getValue()", e);
  }

  // convert method/function args
  if (typeof val === "object" && val !== null) {
    if (val.methodName || val.functionName) {
      val.args = val.args.map(child => convertCompiled(child, meta));
    }
  }
  // convert list
  if (type == "list") {
    val = val.map(item => convertCompiled(item, meta));
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
    const args = children.filter(child => child.type != "qualifiedidentifier");
    return {
      type: "!type",
      cls
    };
  }

  return {
    type,
    children,
    val,
  };
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
      console.log(`[spel] No spelOp for operator ${opKey}`);
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
    if (!parts) return undefined;
    const fullParts = [...groupFieldParts, ...parts];
    return {
      valueSrc: "field",
      //valueType: todo
      value: fullParts.join(fieldSeparator),
    };
  } else if (spel.type == "variable" || spel.type == "property") {
    // normal field
    const fullParts = [...groupFieldParts, spel.val];
    return {
      valueSrc: "field",
      //valueType: todo
      value: fullParts.join(fieldSeparator),
    };
  } else if (literalTypes[spel.type]) {
    let value = spel.val;
    const valueType = literalTypes[spel.type];
    if (parentSpel.isUnary) {
      value = -value;
    }
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (spel.type == "list") {
    const values = spel.val.map(v => convertArg(v, conv, config, meta, spel));
    const _itemType = values.length ? values[0].valueType : null;
    const value = values.map(v => v.value);
    const valueType = "multiselect";
    return {
      valueSrc: "value",
      valueType,
      value,
    };
  } else if (spel.type == "!func") {
    const {obj, methodName, args} = spel;
    
    // todo: get from conv
    const funcToOpMap = {
      [".contains"]: "like",
      [".startsWith"]: "starts_with",
      [".endsWith"]: "ends_with",
      ["#contains"]: "select_any_in",
    };

    const convertedArgs = args.map(v => convertArg(v, conv, config, meta, {
      ...spel,
      _groupField: parentSpel?._groupField
    }));

    //todo: make dynamic: use funcToOpMap and check obj type in basic config
    if (methodName == "contains" && obj[0].type == "list") {
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
      const opKey = funcToOpMap["#"+methodName];
      const list = convertedObj[0];
      return buildRule(field, opKey, [list]);
    } else if (funcToOpMap["."+methodName]) {
      // user.login.startsWith('gg')
      const opKey = funcToOpMap["."+methodName];
      const parts = convertPath(obj, meta);
      if (parts && convertedArgs.length == 1) {
        const fullParts = [...groupFieldParts, ...parts];
        const field = fullParts.join(fieldSeparator);
        return buildRule(field, opKey, convertedArgs);
      }
    } else if (methodName == "parse" && obj[0].type == "!new" && obj[0].cls.at(-1) == "SimpleDateFormat") {
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
    } else if (methodName == "parse" && obj[0].type == "!type" && obj[0].cls.at(-1) == "LocalTime") {
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
  } else {
    meta.errors.push(`Can't convert arg of type ${spel.type}`);
  }
  return undefined;
};

const buildRule = (field, opKey, convertedArgs) => {
  if (convertedArgs.filter(v => v === undefined).length) {
    return undefined;
  }
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
      valueType: convertedArgs.map(v => v.valueType),
      asyncListValues,
    }
  };
  return res;
};

const buildRuleGroup = ({groupFilter, groupFieldValue}, opKey, convertedArgs, config) => {
  if (groupFieldValue.valueSrc != "field")
    throw `Bad groupFieldValue: ${JSON.stringify(groupFieldValue)}`;
  const groupField = groupFieldValue.value;
  let groupOpRule = buildRule(groupField, opKey, convertedArgs);
  const fieldConfig = getFieldConfig(config, groupField);
  const mode = fieldConfig?.mode;
  let res = {
    ...groupFilter,
    type: "rule_group",
    properties: {
      ...groupOpRule.properties,
      ...groupFilter.properties,
      mode
    }
  };
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
      console.log(1, leftSource, rightSource);
      return leftSource.value == rightSource.value;
    } else {
      const [leftVal, rightVal] = [left, right].map(v => convertArg(v, conv, config, meta, {
        ...spel,
        _groupField: parentSpel?._groupField
      }));
      console.log(2, leftVal, rightVal);
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
        const fromValue = from.val;
        const toValue = to.val;
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
    } else if (op == "gt" && spel.children[1].type == "string" && spel.children[1].val == "") {
      opKey = "is_not_empty";
    } else if (op == "between") {
      opKey = "between";
      opKeys = ["between"];
    }

    // convert children
    const vals = spel.children.map(child => 
      convertToTree(child, conv, config, meta, {
        ...spel,
        _groupField: parentSpel?._groupField
      })
    );
    
    if (op == "and" || op == "or") {
      const children1 = {};
      vals.forEach(v => {
        const id = uuid();
        v.id = id;
        children1[id] = v;
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
      const fieldObj = vals[0];
      let convertedArgs = vals.slice(1);
      opKey = opKeys[0];

      if (fieldObj.groupFieldValue) {
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

        res = buildRuleGroup(fieldObj, opKey, convertedArgs, config);
      } else {
        // 2. not group
        if (fieldObj.valueSrc != "field") {
          meta.errors.push(`Expected field ${JSON.stringify(fieldObj)}`);
        }
        const field = fieldObj.value;

        if (opKeys.length > 1) {
          console.warn(`[spel] Spel operator ${op} can be mapped to ${opKeys}`);

          //todo: it's naive
          const widgets = opKeys.map(op => ({op, widget: getWidgetForFieldOp(config, field, op)}));
          if (op == "eq") {
            const ws = widgets.find(({op, widget}) => (widget != "field"));
            opKey = ws.op;
          }
        }
        res = buildRule(field, opKey, convertedArgs);
      }
    } else {
      meta.errors.push(`Can't convert op ${op}`);
    }
  } else if (spel.type == "!aggr") {
    const groupFieldValue = convertToTree(spel.source, conv, config, meta, {
      ...spel, 
      _groupField: parentSpel?._groupField
    });
    let groupFilter = convertToTree(spel.filter, conv, config, meta, {
      ...spel, 
      _groupField: groupFieldValue.value
    });
    if (groupFilter?.type == "rule") {
      groupFilter = wrapInDefaultConj(groupFilter, config);
    }
    res = {
      groupFilter,
      groupFieldValue
    };
  } else {
    res = convertArg(spel, conv, config, meta, parentSpel);
    if (res && !res.type && !parentSpel) {
      res = undefined;
      meta.errors.push(`Can't convert rule of type ${spel.type}, it looks like var/literal`);
    }
  }
  return res;
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
      not: not
    }
  };
};
