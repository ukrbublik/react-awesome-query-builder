import uuid from "../utils/uuid";
import {getOpCardinality, isJsonLogic, shallowEqual, logger} from "../utils/stuff";
import {getFieldConfig, extendConfig, normalizeField, getFuncConfig, iterateFuncs, getFieldParts} from "../utils/configUtils";
import {getWidgetForFieldOp} from "../utils/ruleUtils";
import {loadTree} from "./tree";
import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";

import moment from "moment";

// http://jsonlogic.com/

// helpers
const arrayUniq = (arr) => Array.from(new Set(arr));
const arrayToObject = (arr) => arr.reduce((acc, [f, fc]) => ({ ...acc, [f]: fc }), {});

const createMeta = (parentMeta) => {
  return {
    errors: [],
    settings: parentMeta?.settings,
  };
};

export const loadFromJsonLogic = (logicTree, config) => {
  return _loadFromJsonLogic(logicTree, config, false);
};

export const _loadFromJsonLogic = (logicTree, config, returnErrors = true) => {
  //meta is mutable
  let meta = createMeta();
  meta.settings = {
    allowUnknownFields: false,
    returnErrors,
  };
  const extendedConfig = extendConfig(config, undefined, false);
  const conv = buildConv(extendedConfig);
  const jsTree = logicTree ? convertFromLogic(logicTree, conv, extendedConfig, ["rule", "group", "switch"], meta) : undefined;
  const immTree = jsTree ? loadTree(jsTree) : undefined;

  if (returnErrors) {
    return [immTree, meta.errors];
  } else {
    if (meta.errors.length)
      console.warn("Errors while importing from JsonLogic:", meta.errors);
    return immTree;
  }
};


const buildConv = (config) => {
  let operators = {};
  for (let opKey in config.operators) {
    const opConfig = config.operators[opKey];
    if (typeof opConfig.jsonLogic == "string") {
      // example: "</2", "#in/1"
      const opk = (opConfig._jsonLogicIsRevArgs ? "#" : "") + opConfig.jsonLogic + "/" + getOpCardinality(opConfig);
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);
    } else if(typeof opConfig.jsonLogic2 == "string") {
      // example: all-in/1"
      const opk = opConfig.jsonLogic2 + "/" + getOpCardinality(opConfig);
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);
    }
  }

  let conjunctions = {};
  for (let conjKey in config.conjunctions) {
    const conjunctionDefinition = config.conjunctions[conjKey];
    const ck = conjunctionDefinition.jsonLogicConj || conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

  let funcs = {};
  for (const [funcPath, funcConfig] of iterateFuncs(config)) {
    let fk;
    if (funcConfig.jsonLogicIsMethod) {
      fk = "#" + funcConfig.jsonLogic;
    } else if (typeof funcConfig.jsonLogic == "string") {
      fk = funcConfig.jsonLogic;
    }
    if (fk) {
      if (!funcs[fk])
        funcs[fk] = [];
      funcs[fk].push(funcPath);
    }
  }

  const {groupVarKey, altVarKey} = config.settings.jsonLogic;

  return {
    operators,
    conjunctions,
    funcs,
    varKeys: ["var", groupVarKey, altVarKey],
  };
};

// expectedTypes - "val", "rule", "group", "switch", "case_val"
const convertFromLogic = (logic, conv, config, expectedTypes, meta, not = false, fieldConfig, widget, parentField = null, _isLockedLogic = false) => {
  let op, vals;
  if (isJsonLogic(logic)) {
    op = Object.keys(logic)[0];
    vals = logic[op];
    if (!Array.isArray(vals))
      vals = [ vals ];
  }
  
  let ret;
  const beforeErrorsCnt = meta.errors.length;

  const {lockedOp} = config.settings.jsonLogic;
  const isEmptyOp = op == "!" && (vals.length == 1 && vals[0] && isJsonLogic(vals[0]) && conv.varKeys.includes(Object.keys(vals[0])[0]));
  const isRev = op == "!" && !isEmptyOp;
  const isLocked = lockedOp && op == lockedOp;
  const isSwitch = expectedTypes.includes("switch");
  const isRoot = isSwitch;
  if (isLocked) {
    ret = convertFromLogic(vals[0], conv, config, expectedTypes, meta, not, fieldConfig, widget, parentField, true);
  } else if (isRev) {
    // reverse with not
    ret = convertFromLogic(vals[0], conv, config, expectedTypes, meta, !not, fieldConfig, widget, parentField);
  } else if(expectedTypes.includes("val")) {
    // not is not used here
    ret = convertFieldRhs(op, vals, conv, config, not, meta, parentField) 
      || convertFuncRhs(op, vals, conv, config, not, fieldConfig, meta, parentField) 
      || convertValRhs(logic, fieldConfig, widget, config, meta);
  } else {
    if (expectedTypes.includes("switch")) {
      ret = convertIf(op, vals, conv, config, not, meta, parentField);
    }
    if (ret == undefined && expectedTypes.includes("group")) {
      ret = convertConj(op, vals, conv, config, not, meta, parentField, false);
    }
    if (ret == undefined && expectedTypes.includes("rule")) {
      ret = convertOp(op, vals, conv, config, not, meta, parentField);
    }
    if (ret) {
      if (isRoot && !["group", "switch_group"].includes(ret.type)) {
        ret = wrapInDefaultConj(ret, config);
      }
    }
  }

  const afterErrorsCnt = meta.errors.length;
  if (op != "!" && ret === undefined && afterErrorsCnt == beforeErrorsCnt) {
    meta.errors.push(`Can't parse logic ${JSON.stringify(logic)}`);
  }

  if (isLocked) {
    ret.properties.isLocked = true;
  }

  return ret;
};


const convertValRhs = (val, fieldConfig, widget, config, meta) => {
  if (val === undefined)
    val = fieldConfig?.defaultValue;
  if (val === undefined) return undefined;
  widget = widget || fieldConfig?.mainWidget;
  const widgetConfig = config.widgets[widget];
  const fieldType = fieldConfig?.type;

  if (fieldType && !widgetConfig) {
    meta.errors.push(`No widget for type ${fieldType}`);
    return undefined;
  }

  if (isJsonLogic(val)) {
    meta.errors.push(`Unexpected logic in value: ${JSON.stringify(val)}`);
    return undefined;
  }

  // number of seconds -> time string
  if (fieldType === "time" && typeof val === "number") {
    const [h, m, s] = [Math.floor(val / 60 / 60) % 24, Math.floor(val / 60) % 60, val % 60];
    const valueFormat = widgetConfig.valueFormat;
    if (valueFormat) {
      const dateVal = new Date(val);
      dateVal.setMilliseconds(0);
      dateVal.setHours(h);
      dateVal.setMinutes(m);
      dateVal.setSeconds(s);
      val = moment(dateVal).format(valueFormat);
    } else {
      val = `${h}:${m}:${s}`;
    }
  }

  // "2020-01-08T22:00:00.000Z" -> Date object
  if (["date", "datetime"].includes(fieldType) && val && !(val instanceof Date)) {
    try {
      const dateVal = new Date(val);
      if (dateVal instanceof Date && dateVal.toISOString() === val) {
        val = dateVal;
      }
    } catch(e) {
      meta.errors.push(`Can't convert value ${val} as Date`);
      val = undefined;
    }
  }

  // Date object -> formatted string
  if (val instanceof Date && fieldConfig) {
    const valueFormat = widgetConfig.valueFormat;
    if (valueFormat) {
      val = moment(val).format(valueFormat);
    }
  }

  let asyncListValues;
  if (val && fieldConfig?.fieldSettings?.asyncFetch) {
    const vals = Array.isArray(val) ? val : [val];
    asyncListValues = vals;
  }

  if (widgetConfig?.jsonLogicImport) {
    try {
      val = widgetConfig.jsonLogicImport.call(config.ctx, val);
    } catch(e) {
      meta.errors.push(`Can't import value ${val} using import func of widget ${widget}: ${e?.message ?? e}`);
      val = undefined;
    }
  }

  return {
    valueSrc: "value",
    value: val,
    valueType: widgetConfig?.type,
    asyncListValues
  };
};

const convertFieldRhs = (op, vals, conv, config, not, meta, parentField = null) => {
  if (conv.varKeys.includes(op) && typeof vals[0] == "string") {
    const field = normalizeField(config, vals[0], parentField);
    const fieldConfig = getFieldConfig(config, field);
    if (!fieldConfig && !meta.settings?.allowUnknownFields) {
      meta.errors.push(`No config for field ${field}`);
      return undefined;
    }

    return {
      valueSrc: "field",
      value: field,
      valueType: fieldConfig?.type,
    };
  }

  return undefined;
};

const convertLhs = (isGroup0, jlField, args, conv, config, not = null, fieldConfig = null, meta, parentField = null) => {
  let k = Object.keys(jlField)[0];
  let v = Object.values(jlField)[0];

  const _parse = (k, v) => {
    return convertFieldLhs(k, v, conv, config, not, meta, parentField)
    || convertFuncLhs(k, v, conv, config, not, fieldConfig, meta, parentField);
  };

  const beforeErrorsCnt = meta.errors.length;
  let field, fieldSrc, having, isGroup;
  const parsed = _parse(k, v);
  if (parsed) {
    field = parsed.field;
    fieldSrc = parsed.fieldSrc;
  }
  if (isGroup0) {
    isGroup = true;
    having = args[0];
    args = [];
  }
  // reduce/filter for group ext
  if (k == "reduce" && Array.isArray(v) && v.length == 3) {
    let [filter, acc, init] = v;
    if (isJsonLogic(filter) && init == 0
      && isJsonLogic(acc)
      && Array.isArray(acc["+"]) && acc["+"][0] == 1
      && isJsonLogic(acc["+"][1]) && acc["+"][1]["var"] == "accumulator"
    ) {
      k = Object.keys(filter)[0];
      v = Object.values(filter)[0];
      if (k == "filter") {
        let [group, filter] = v;
        if (isJsonLogic(group)) {
          k = Object.keys(group)[0];
          v = Object.values(group)[0];
          const parsedGroup = _parse(k, v);
          if (parsedGroup) {
            field = parsedGroup.field;
            fieldSrc = parsedGroup.fieldSrc;
            having = filter;
            isGroup = true;
          }
        }
      } else {
        const parsedGroup = _parse(k, v);
        if (parsedGroup) {
          field = parsedGroup.field;
          fieldSrc = parsedGroup.fieldSrc;
          isGroup = true;
        }
      }
    }
  }
  const afterErrorsCnt = meta.errors.length;

  if (!field && afterErrorsCnt == beforeErrorsCnt) {
    meta.errors.push(`Unknown LHS ${JSON.stringify(jlField)}`);
  }
  if (!field) return;

  return {
    field, fieldSrc, having, isGroup, args
  };
};

const convertFieldLhs = (op, vals, conv, config, not, meta, parentField = null) => {
  if (!Array.isArray(vals))
    vals = [ vals ];
  const parsed = convertFieldRhs(op, vals, conv, config, not, meta, parentField);
  if (parsed) {
    return {
      fieldSrc: "field",
      field: parsed.value,
    };
  }
  return undefined;
};

const convertFuncLhs = (op, vals, conv, config, not, fieldConfig = null, meta, parentField = null) => {
  const parsed = convertFuncRhs(op, vals, conv, config, not, fieldConfig, meta, parentField);
  if (parsed) {
    return {
      fieldSrc: "func",
      field: parsed.value,
    };
  }
  return undefined;
};

const convertFuncRhs = (op, vals, conv, config, not, fieldConfig = null, meta, parentField = null) => {
  if (!op) return undefined;
  let func, argsArr, funcKey;
  const jsonLogicIsMethod = (op == "method");
  if (jsonLogicIsMethod) {
    let obj, opts;
    [obj, func, ...opts] = vals;
    argsArr = [obj, ...opts];
  } else {
    func = op;
    argsArr = vals;
  }

  const fk = (jsonLogicIsMethod ? "#" : "") + func;
  const returnType = fieldConfig?.type || fieldConfig?.returnType;
  const funcKeys = (conv.funcs[fk] || []).filter(k => 
    (fieldConfig ? getFuncConfig(config, k).returnType == returnType : true)
  );
  if (funcKeys.length) {
    funcKey = funcKeys[0];
  } else {
    const v = {[op]: vals};

    for (const [f, fc] of iterateFuncs(config)) {
      if (fc.jsonLogicImport && (returnType ? fc.returnType == returnType : true)) {
        let parsed;
        try {
          parsed = fc.jsonLogicImport(v);
        } catch(_e) {
          // given expression `v` can't be parsed into function
        }
        if (parsed) {
          funcKey = f;
          argsArr = parsed;
        }
      }
    }
  }
  if (!funcKey)
    return undefined;

  if (funcKey) {
    const funcConfig = getFuncConfig(config, funcKey);
    const argKeys = Object.keys(funcConfig.args || {});
    let argsObj = argsArr.reduce((acc, val, ind) => {
      const argKey = argKeys[ind];
      const argConfig = funcConfig.args[argKey];
      let argVal;
      if (argConfig) {
        argVal = convertFromLogic(val, conv, config, ["val"], meta, false, argConfig, null, parentField);
      }
      return argVal !== undefined ? {...acc, [argKey]: argVal} : acc;
    }, {});

    for (let argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      let argVal = argsObj[argKey];
      if (argVal === undefined) {
        argVal = argConfig?.defaultValue;
        if (argVal !== undefined) {
          argVal = {
            value: argVal,
            valueSrc: argVal?.func ? "func" : "value",
            valueType: argConfig.type,
          };
        }
        if (argVal === undefined) {
          if (argConfig?.isOptional) {
            //ignore
          } else {
            meta.errors.push(`No value for arg ${argKey} of func ${funcKey}`);
            return undefined;
          }
        } else {
          argsObj[argKey] = argVal;
        }
      }
    }

    return {
      valueSrc: "func",
      value: {
        func: funcKey,
        args: argsObj
      },
      valueType: funcConfig.returnType,
    };
  }

  return undefined;
};


const convertConj = (op, vals, conv, config, not, meta, parentField = null, isRuleGroup = false) => {
  const conjKey = conv.conjunctions[op];
  const {fieldSeparator} = config.settings;
  // const parentFieldConfig = parentField ? getFieldConfig(config, parentField) : null;
  // const isParentGroup = parentFieldConfig?.type == "!group";
  if (conjKey) {
    let type = "group";
    const children = vals
      .map(v => convertFromLogic(v, conv, config, ["rule", "group"], meta, false, null, null, parentField))
      .filter(r => r !== undefined)
      .reduce((acc, r) => ({...acc, [r.id] : r}), {});
    const complexFields = Object.values(children)
      .map(v => v?.properties?.fieldSrc == "field" && v?.properties?.field)
      .filter(f => f?.includes?.(fieldSeparator));
    const complexFieldsGroupAncestors = Object.fromEntries(
      arrayUniq(complexFields).map(f => {
        const parts = f.split(fieldSeparator);
        const ancs = Object.fromEntries(
          parts.slice(0, -1)
            .map((f, i, parts) => [...parts.slice(0, i), f])
            .map(fp => [fp.join(fieldSeparator), getFieldConfig(config, fp)])
            .filter(([_f, fc]) => fc?.type == "!group")
        );
        return [f, Object.keys(ancs)];
      })
    );
    // const childrenInRuleGroup = Object.values(children)
    //   .map(v => v?.properties?.fieldSrc == "field" && v?.properties?.field)
    //   .map(f => complexFieldsGroupAncestors[f])
    //   .filter(ancs => ancs && ancs.length);
    // const usedRuleGroups = arrayUniq(Object.values(complexFieldsGroupAncestors).flat());
    // const usedTopRuleGroups = topLevelFieldsFilter(usedRuleGroups);
    
    let properties = {
      conjunction: conjKey,
      not: not
    };
    const id = uuid();

    let children1 = {};
    let groupToId = {};
    Object.entries(children).map(([k, v]) => {
      if (v?.type == "group" || v?.type == "rule_group") {
        // put as-is
        children1[k] = v;
      } else {
        const field = v?.properties?.field;
        const groupAncestors = complexFieldsGroupAncestors[field] || [];
        const groupField = groupAncestors[groupAncestors.length - 1];
        if (!groupField) {
          // not in rule_group (can be simple field or in struct) - put as-is
          if (v) {
            children1[k] = v;
          }
        } else {
          // wrap field in rule_group (with creating hierarchy if need)
          let ch = children1;
          let parentFieldParts = getFieldParts(parentField, config);
          const groupPath = getFieldParts(groupField, config);
          const isInParent = shallowEqual(parentFieldParts, groupPath.slice(0, parentFieldParts.length));
          if (!isInParent)
            parentFieldParts = []; // should not be
          const traverseGroupFields = groupField
            .split(fieldSeparator)
            .slice(parentFieldParts.length)
            .map((f, i, parts) => [...parentFieldParts, ...parts.slice(0, i), f].join(fieldSeparator))
            .map((f) => ({f, fc: getFieldConfig(config, f) || {}}))
            .filter(({fc}) => (fc.type != "!struct"));
          traverseGroupFields.map(({f: gf, fc: gfc}, i) => {
            let groupId = groupToId[gf];
            if (!groupId) {
              groupId = uuid();
              groupToId[gf] = groupId;
              ch[groupId] = {
                type: "rule_group",
                id: groupId,
                children1: {},
                properties: {
                  conjunction: conjKey,
                  not: false,
                  field: gf,
                  fieldSrc: "field",
                  mode: gfc.mode,
                }
              };
            }
            ch = ch[groupId].children1;
          });
          ch[k] = v;
        }
      }
    });

    // tip: for isRuleGroup=true correct type and properties will be set out of this func

    return {
      type: type,
      id: id,
      children1: children1,
      properties: properties
    };
  }

  return undefined;
};


// const topLevelFieldsFilter = (fields) => {
//   let arr = [...fields].sort((a, b) => (a.length - b.length));
//   for (let i = 0 ; i < arr.length ; i++) {
//     for (let j = i + 1 ; j < arr.length ; j++) {
//       if (arr[j].indexOf(arr[i]) == 0) {
//         // arr[j] is inside arr[i] (eg. "a.b" inside "a")
//         arr.splice(j, 1);
//         j--;
//       }
//     }
//   }
//   return arr;
// };

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

const parseRule = (op, arity, vals, parentField, conv, config, meta) => {
  const submeta = createMeta(meta);
  let res = _parseRule(op, arity, vals, parentField, conv, config, false, submeta);
  if (!res) {
    // try reverse
    res = _parseRule(op, arity, vals, parentField, conv, config, true, createMeta(meta));
  }
  if (!res) {
    meta.errors.push(submeta.errors.join("; ") || `Unknown op ${op}/${arity}`);
    return undefined;
  }
  
  return res;
};

const _parseRule = (op, arity, vals, parentField, conv, config, isRevArgs, meta) => {
  // config.settings.groupOperators are used for group count (cardinality = 0 is exception)
  // but don't confuse with "all-in" or "some-in" for multiselect
  const isAllOrSomeInForMultiselect
    = (op === "all" || op === "some")
    && isJsonLogic(vals[1])
    && Object.keys(vals[1])[0] == "in"
    && vals[1]["in"][0]?.["var"] === "";
  const isGroup0 = !isAllOrSomeInForMultiselect && config.settings.groupOperators.includes(op);
  const eqOps = ["==", "!="];
  let cardinality = isGroup0 ? 0 : arity - 1;
  if (isGroup0)
    cardinality = 0;
  else if (eqOps.includes(op) && cardinality == 1 && vals[1] === null) {
    arity = 1;
    cardinality = 0;
    vals = [vals[0]];
  }

  const opk = op + "/" + cardinality;
  let opKeys = conv.operators[(isRevArgs ? "#" : "") + opk];
  if (!opKeys)
    return;
  
  let jlField, jlArgs = [];
  const rangeOps = ["<", "<=", ">", ">="];
  if (rangeOps.includes(op) && arity == 3) {
    jlField = vals[1];
    jlArgs = [ vals[0], vals[2] ];
  } else if (isRevArgs) {
    jlField = vals[1];
    jlArgs = [ vals[0] ];
  } else {
    [jlField, ...jlArgs] = vals;
  }

  if (!isJsonLogic(jlField)) {
    meta.errors.push(`Incorrect operands for ${op}: ${JSON.stringify(vals)}`);
    return;
  }

  const lhs = convertLhs(isGroup0, jlField, jlArgs, conv, config, null, null, meta, parentField);
  if (!lhs) return;
  const {
    field, fieldSrc, having, isGroup, args
  } = lhs;
  const fieldConfig = getFieldConfig(config, field);
  if (!fieldConfig && !meta.settings?.allowUnknownFields) {
    meta.errors.push(`No config for LHS ${field}`);
    return;
  }

  let opKey = opKeys[0];
  if (opKeys.length > 1 && fieldConfig && fieldConfig.operators) {
    // eg. for "equal" and "select_equals"
    opKeys = opKeys
      .filter(k => fieldConfig.operators.includes(k));
    if (opKeys.length == 0) {
      meta.errors.push(`No corresponding ops for LHS ${field}`);
      return;
    }
    opKey = opKeys[0];
  }
  
  return {
    field, fieldSrc, fieldConfig, opKey, args, having
  };
};

const convertOp = (op, vals, conv, config, not, meta, parentField = null) => {
  if (!op) return undefined;

  const arity = vals.length;
  if ((op === "all" || op === "some") && isJsonLogic(vals[1])) {
    // special case for "all-in" and "some-in"
    const op2 = Object.keys(vals[1])[0];
    const isEmptyVar = vals[1][op2][0]?.["var"] === "";
    if (op2 === "in" && isEmptyVar) {
      vals = [
        vals[0],
        vals[1][op2][1]
      ];
      op = op + "-" + op2; // "all-in" and "some-in"
    }
  }

  const parseRes = parseRule(op, arity, vals, parentField, conv, config, meta);
  if (!parseRes) return undefined;
  let {field, fieldSrc, fieldConfig, opKey, args, having} = parseRes;
  let opConfig = config.operators[opKey];

  // Group component in array mode can show NOT checkbox, so do nothing in this case
  // Otherwise try to revert
  const showNot = fieldConfig?.showNot !== undefined ? fieldConfig.showNot : config.settings.showNot; 
  let canRev = true;
  // if (fieldConfig.type == "!group" && fieldConfig.mode == "array" && showNot)
  //   canRev = false;

  let conj;
  let havingVals;
  let havingNot = false;
  if (fieldConfig?.type == "!group" && having) {
    conj = Object.keys(having)[0];
    havingVals = having[conj];
    if (!Array.isArray(havingVals))
      havingVals = [ havingVals ];

    // Preprocess "!": Try to reverse op in single rule in having
    // Eg. use `not_equal` instead of `not` `equal`
    const isEmptyOp = conj == "!" && (havingVals.length == 1 && havingVals[0] && isJsonLogic(havingVals[0]) && conv.varKeys.includes(Object.keys(havingVals[0])[0]));
    if (conj == "!" && !isEmptyOp) {
      havingNot = true;
      having = having["!"];
      conj = Object.keys(having)[0];
      havingVals = having[conj];
      if (!Array.isArray(havingVals))
        havingVals = [ havingVals ];
    }
  }

  // Use reversed op
  if (not && canRev && opConfig.reversedOp) {
    not = false;
    opKey = opConfig.reversedOp;
    opConfig = config.operators[opKey];
  }

  const widget = getWidgetForFieldOp(config, field, opKey, null);

  const convertedArgs = args
    .map(v => convertFromLogic(v, conv, config, ["val"], meta, false, fieldConfig, widget, parentField));
  if (convertedArgs.filter(v => v === undefined).length) {
    //meta.errors.push(`Undefined arg for field ${field} and op ${opKey}`);
    return undefined;
  }

  let res;

  let fieldType = fieldConfig?.type;
  if (fieldType === "!group" || fieldType === "!struct") {
    fieldType = null;
  }

  if (fieldConfig?.type == "!group" && having) {
    if (conv.conjunctions[conj] !== undefined) {
      // group
      res = convertConj(conj, havingVals, conv, config, havingNot, meta, field, true);
      havingNot = false;
    } else {
      // need to be wrapped in `rule_group`
      const rule = convertOp(conj, havingVals, conv, config, havingNot, meta, field);
      havingNot = false;
      res = wrapInDefaultConjRuleGroup(rule, field, fieldConfig, config, conv.conjunctions["and"]);
    }
    if (!res)
      return undefined;
    
    res.type = "rule_group";
    Object.assign(res.properties, {
      field: field,
      mode: fieldConfig.mode,
      operator: opKey,
    });
    if (fieldConfig.mode == "array") {
      Object.assign(res.properties, {
        value: convertedArgs.map(v => v.value),
        valueSrc: convertedArgs.map(v => v.valueSrc),
        valueType: convertedArgs.map(v => v.valueType),
      });
    }
    if (not) {
      res = wrapInDefaultConj(res, config, not);
    }
  } else if (fieldConfig?.type == "!group" && !having) {
    res = {
      type: "rule_group",
      id: uuid(),
      children1: {},
      properties: {
        conjunction: defaultGroupConjunction(config, fieldConfig),
        not: not,
        mode: fieldConfig.mode,
        field: field,
        operator: opKey,
      }
    };
    if (fieldConfig.mode === "array") {
      Object.assign(res.properties, {
        value: convertedArgs.map(v => v.value),
        valueSrc: convertedArgs.map(v => v.valueSrc),
        valueType: convertedArgs.map(v => v.valueType),
      });
    }
  } else {
    const asyncListValuesArr = convertedArgs.map(v => v.asyncListValues).filter(v => v != undefined);
    const asyncListValues = asyncListValuesArr.length ? asyncListValuesArr[0] : undefined;
    res = {
      type: "rule",
      id: uuid(),
      properties: {
        field: field,
        fieldSrc: fieldSrc,
        operator: opKey,
        value: convertedArgs.map(v => v.value),
        valueSrc: convertedArgs.map(v => v.valueSrc),
        valueType: convertedArgs.map(v => v.valueType),
        ...(asyncListValues ? {asyncListValues} : {}),
      }
    };
    if (not) {
      //meta.errors.push(`No rev op for ${opKey}`);
      res = wrapInDefaultConj(res, config, not);
    }
  }

  return res;
};


const convertIf = (op, vals, conv, config, not, meta, parentField = null) => {
  if (op?.toLowerCase() !== "if") return undefined;

  const flat = flatizeTernary(vals);

  const cases = flat.map(([cond, val]) => ([
    cond ? convertFromLogic(cond, conv, config, ["rule", "group"], meta, false, null, null, parentField) : null,
    buildCaseValProperties(config, meta, conv, val),
  ]));
  const children1 = cases.map(([cond, val]) => wrapInCase(cond, val, config, meta));

  const switchI = {
    type: "switch_group",
    id: uuid(),
    children1,
    properties: {}
  };

  return switchI;
};

const flatizeTernary = (children) => {
  let flat = [];
  function _processTernaryChildren(tern) {
    let [cond, if_val, else_val] = tern;
    flat.push([cond, if_val]);
    const else_op = isJsonLogic(else_val) ? Object.keys(else_val)[0] : null;
    if (else_op?.toLowerCase() === "if") {
      _processTernaryChildren(else_val[else_op]);
    } else {
      flat.push([undefined, else_val]);
    }
  }
  _processTernaryChildren(children);
  return flat;
};

const wrapInCase = (cond, valProperties, config, meta) => {
  let caseI;
  if (cond) {
    caseI = {...cond};
    if (caseI.type) {
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

const buildCaseValProperties = (config, meta, conv, val) => {
  const caseValueFieldConfig = getFieldConfig(config, "!case_value");
  if (!caseValueFieldConfig) {
    meta.errors.push("Missing caseValueField in settings");
    return undefined;
  }
  const widget = caseValueFieldConfig.mainWidget;
  const widgetDef = config.widgets[widget];
  if (!widgetDef) {
    meta.errors.push(`No widget ${widget} for case value`);
    return undefined;
  }
  const convVal = convertFromLogic(val, conv, config, ["val", "case_val"], meta, false, caseValueFieldConfig, widget);
  if (convVal == undefined) {
    return undefined;
  }
  const { value, valueSrc, valueType} = convVal;
  let valProperties = {
    value: [value],
    valueSrc: [valueSrc ?? "value"],
    valueType: [valueType ?? widgetDef?.type]
  };
  return valProperties;
};
