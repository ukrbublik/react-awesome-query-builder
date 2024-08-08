import { wrapInDefaultConj, buildCase, buildSimpleSwitch, buildRuleGroup, buildRule } from "./builder";
import { convertPath } from "./postprocess";
import { buildFuncSignatures } from "./conv";
import * as Utils from "../../utils";

const { isJsonCompatible, isObject, uuid, logger } = Utils.OtherUtils;
const { getFieldConfig, getFuncConfig, normalizeField, iterateFuncs, getWidgetForFieldOp } = Utils.ConfigUtils;

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


export const convertToTree = (spel, conv, config, meta, parentSpel = null) => {
  if (!spel) return undefined;
  spel._groupField = spel._groupField ?? parentSpel?._groupField;

  let res, canParseAsArg = true;
  if (spel.type.indexOf("op-") === 0 || spel.type === "matches") {
    res = convertOp(spel, conv, config, meta, parentSpel);
  } else if (spel.type == "!aggr") {
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
      const convCond = convertToTree(cond, conv, config, meta, spel);
      const convVal = convertCaseValue(val, conv, config, meta, spel);
      const caseI = buildCase(convCond, convVal, conv, config, meta, spel);
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
    const convVal = convertCaseValue(spel, conv, config, meta);
    const sw = buildSimpleSwitch(convVal, conv, config, meta);
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
      oneSpel._groupField = parentSpel?._groupField;
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
      const convVal = convertCaseValue(spel, conv, config, meta);
      res = buildSimpleSwitch(convVal, conv, config, meta);
    }
    // if (!res) {
    //   meta.errors.push(`Can't convert op ${op}`);
    // }
  }
  return res;
};


export const convertArg = (spel, conv, config, meta, parentSpel = null) => {
  if (spel == undefined)
    return undefined;
  const {fieldSeparator} = config.settings;
  spel._groupField = spel._groupField ?? parentSpel?._groupField;

  if (spel.type == "variable" || spel.type == "property") {
    // normal field
    const field = normalizeField(config, spel.val, spel._groupField);
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
      const field = normalizeField(config, parts.join(fieldSeparator), spel._groupField);
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
    return convertCaseValueConcat(spel, conv, config, meta);
  }

  let maybe = convertFunc(spel, conv, config, meta, parentSpel);
  if (maybe !== undefined) {
    return maybe;
  }

  meta.errors.push(`Can't convert arg of type ${spel.type}`);
  return undefined;
};



const convertFunc = (spel, conv, config, meta, parentSpel = null) => {
  // Build signatures
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
          parsed = fc.spelImport.call(config.ctx, spel);
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
      const {valueTypes} = opDef;
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
        return buildRule(config, meta, field, opKey, convertedArgs, spel);
      }
    }
  }

  if (opKey && errs.length) {
    meta.errors.push(`Signature ${foundSign} - looks like convertable to ${opKey}, but: ${errs.join("; ")}`);
  }

  return undefined;
};

const compareArgs = (left, right,  spel, conv, config, meta) => {
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

export const convertCaseValue = (val, conv, config, meta, spel = null) => {
  let convVal;
  if (val?.type === "op-plus" && config.settings.caseValueField?.type === "case_value") {
    /**
     * @deprecated
     */
    convVal = convertCaseValueConcat(val, conv, config, meta);
  } else {
    convVal = convertArg(val, conv, config, meta, spel);
  }
  return convVal;
};

/**
 * @deprecated
 */
export const convertCaseValueConcat = (spel, conv, config, meta) => {
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
