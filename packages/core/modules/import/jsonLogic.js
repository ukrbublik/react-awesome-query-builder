import uuid from "../utils/uuid";
import {getOpCardinality, isJsonLogic, shallowEqual} from "../utils/stuff";
import {getFieldConfig, normalizeField, getFuncConfig, iterateFuncs, getFieldParts, getWidgetForFieldOp} from "../utils/configUtils";
import {extendConfig} from "../utils/configExtend";
import {loadTree} from "./tree";
import {defaultGroupConjunction} from "../utils/defaultUtils";

import moment from "moment";

// http://jsonlogic.com/

// helpers
const arrayUniq = (arr) => Array.from(new Set(arr));

// constants
const jlFieldMarker = "jlField";
const jlArgsMarker = "jlArgs";
const jlEqOps = ["==", "!="];
const jlRangeOps = ["<", "<=", ">", ">="];
const jlDualMeaningOps = ["in", "!in"]; // can be mapped to "select_any_in" or "like"
const multiselectOps = [
  "multiselect_equals", "multiselect_not_equals",
  "multiselect_contains", "multiselect_not_contains"
];

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

  meta.errors = Array.from(new Set(meta.errors));

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
  let combinationOperators = {};
  for (let opKey in config.operators) {
    const opConfig = config.operators[opKey];
    if (typeof opConfig.jsonLogic == "string") {
      // example: "</2", "#in/1"
      const opk = opConfig.jsonLogic + "/" + getOpCardinality(opConfig);
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);
    } else if(typeof opConfig.jsonLogic2 == "string") {
      // example: all-in/1"
      const isRevArgs = opConfig.jsonLogic2.startsWith("#");
      const jsonLogic = (""+opConfig.jsonLogic2).replace(/^#/, "");
      const opk = jsonLogic + "/" + getOpCardinality(opConfig);
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);

      if (!combinationOperators[opKey])
        combinationOperators[opKey] = {};
      combinationOperators[opKey] = {
        "template": opConfig.jsonLogic(jlFieldMarker, opKey, jlArgsMarker), 
        "jsonLogic2": jsonLogic,
        "_jsonLogicIsExclamationOp": !!opConfig._jsonLogicIsExclamationOp,
        "isRevArgs": isRevArgs
      };
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
    combinationOperators,
  };
};

/**
 * This function checks a given jsonlogic object against a set of templates defined in 'conv'. 
 * It determines if the jsonlogic object matches any of the specified templates.
 * 
 * @param {*} jsonlogic The jsonlogic object to be matched against the templates.
 * @param {*} conv The object containing all potential templates and their associated logic for matching. 
 * It is expected to have a 'combinationOperators' property that houses the templates.
 * @param {*} meta An object where any errors or metadata during the processing are stored. It's modified by reference.
 * @param {*} operatorsToCheck An optional array of operator keys that limits which operators in 'conv' are checked. 
 * If null, all operators in 'conv' are considered.
 * @returns {Object|null} The response object containing the match result, and any relevant matched fields and 
 * arguments if a match is found. Returns null if no match is found.
 */
const matchAgainstTemplates = (jsonlogic, conv, meta, operatorsToCheck = null) => {
  let response;
  if (conv?.combinationOperators) {
    for (const [key, value] of Object.entries(conv.combinationOperators)) {
      if ((operatorsToCheck == null || operatorsToCheck.includes(key))) {
        const tempResponse = isTemplateMatch(value.template, jsonlogic);
        // Found a match
        if (tempResponse.match) {
          if (!response) response = tempResponse;
          // Templates should be spesific enough that only one match can be found. This should not happen
          else {
            meta.errors.push(`Operator matched against 2 templates: ${response.newOp} and ${key}`);
          }
          // New op that is used to represent operator that is combosed of multiple operators
          response["newOp"] = value.jsonLogic2;
        }
      }
    }
  }
  // Returns undefined if no matches found
  return response;
};

/**
 * This function recursively compares a jsonlogic object against a template to determine if they match structurally and content-wise.
 * It is used to support complex template matching where the template can include special markers indicating variable fields and arguments.
 *
 * @param {*} template The template object to match against, which can include special markers to denote fields and arguments.
 * @param {*} jsonlogic The jsonlogic object to test against the template.
 * @param {*} response An object to accumulate results such as whether a match is found, and to collect any fields or arguments identified 
 * by the template markers. Default is initialized to a match state with empty fields and arguments.
 * @returns {Object} The updated response object after checking the current template level. It includes whether the current level 
 * matches (match: true/false), any identified fields (jlField), and any arguments (jlArgs).
 */
const isTemplateMatch = (template, jsonlogic, response = {"match": true, "jlField": null, "jlArgs": []}) => {
  if (template == undefined || jsonlogic == undefined) {
    response.match = false;
    return response;    
  }
  // This lets us compare order easily
  const tKeys = Object.keys(template);
  const jKeys = Object.keys(jsonlogic);
  if (tKeys.length !== jKeys.length) {
    // Both have same length
    response.match = false;
    return response;      
  }
  response.vals = [];
  for (let index = 0; index < tKeys.length; index++) {
    const key = tKeys[index];
    const value = template[key];
    response.vals.push(jsonlogic[key]);
    if (key !== jKeys[index]) { 
      // Checks that both have exact same key at exact same place. Kind of pointless for arrays but whatever
      response.match = false;
      return response;
    } else if (value === jlFieldMarker && isJsonLogic(jsonlogic[key])) {
      // If jlFieldMarker is found in template AND it's field or func we take the value from corresponding place in jsonlogic
      response.jlField = jsonlogic[key];
    } else if (value === jlArgsMarker) {
      // If jlArgsMarker is found in template we take the value from corresponding place in jsonlogic
      response.jlArgs.push(jsonlogic[key]);
    } else if (typeof value === "object" && value !== null || Array.isArray(value)) {
      // Here we recurse thru objects and arrays of template until we have gone thru it completely
      response = isTemplateMatch(value, jsonlogic[key], response);
    } else if (value !== jsonlogic[key]) {
      // This is for cases of {var: ""}, which should be only case in default config that leads here
      response.match = false;
      return response;
    }
  }
  return response;
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
  // If matchAgainstTemplates returns match then op is replaced with special jsonlogic2 value
  const match = matchAgainstTemplates(logic, conv, meta);
  if (match) {
    // We reset vals if match found
    vals = [];
    vals[0] = match.jlField;
    match.jlArgs.forEach(arg => vals.push(arg));
    // We reset op to new op that represents multiple jsonlogic operators
    op = match.newOp;
    if (jlDualMeaningOps.includes(op)) {
      // use original order of args
      vals = match.vals;
    }
  }
  const isNot = op == "!" && !isEmptyOp;
  const isLocked = lockedOp && op == lockedOp;
  const isSwitch = expectedTypes.includes("switch");
  const isRoot = isSwitch;
  if (isLocked) {
    ret = convertFromLogic(vals[0], conv, config, expectedTypes, meta, not, fieldConfig, widget, parentField, true);
  } else if (isNot) {
    // apply not
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


  if (widgetConfig?.jsonLogicImport) {
    try {
      val = widgetConfig.jsonLogicImport.call(
        config.ctx, val,
        {...widgetConfig, ...(fieldConfig?.fieldSettings ?? {})}
      );
    } catch(e) {
      meta.errors.push(`Can't import value ${val} using import func of widget ${widget}: ${e?.message ?? e}`);
      val = undefined;
    }
  } else {
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
        const isEpoch = typeof val === "number" || typeof val === "string" && !isNaN(val);
        // Note: can import only from ms timestamp, not seconds timestamp
        const epoch = isEpoch && typeof val === "string" ? parseInt(val) : val;
        const dateVal = new Date(isEpoch ? epoch : val);
        if (dateVal instanceof Date && (dateVal.toISOString() === val || isEpoch)) {
          val = dateVal;
        }
        if (isNaN(dateVal)) {
          throw new Error("Invalid date");
        }
      } catch(e) {
        meta.errors.push(`Can't convert value ${val} as Date`);
        val = undefined;
      }
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
          parsed = fc.jsonLogicImport.call(config.ctx, v);
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

const wrapInDefaultConjRuleGroup = (rule, groupField, groupFieldConfig, config, conj = undefined, not = false) => {
  if (!rule) return undefined;
  return {
    type: "rule_group",
    id: uuid(),
    children1: { [rule.id]: rule },
    properties: {
      conjunction: conj || defaultGroupConjunction(config, groupFieldConfig),
      not: not,
      field: groupField,
    }
  };
};

const wrapInDefaultConj = (rule, config, not = false) => {
  return {
    type: "group",
    id: uuid(),
    children1: { [rule.id]: rule },
    properties: {
      conjunction: defaultGroupConjunction(config),
      not: not
    }
  };
};

const parseRule = (op, arity, vals, parentField, conv, config, meta) => {
  const submeta = createMeta(meta);
  let res = _parseRule(op, arity, vals, parentField, conv, config, submeta);
  if (!res) {
    meta.errors.push(Array.from(new Set(submeta.errors)).join("; ") || `Unknown op ${op}/${arity}`);
    return undefined;
  }
  
  return res;
};

const _parseRule = (op, arity, vals, parentField, conv, config, meta) => {
  // config.settings.groupOperators are used for group count (cardinality = 0 is exception)
  // but don't confuse with "all-in" or "some-in" for multiselect
  const isAllOrSomeInForMultiselect = multiselectOps
    .map((opName) => config.operators[opName]?.jsonLogic2)
    .includes(op);
  const isGroup0 = config.settings.groupOperators.includes(op) && !isAllOrSomeInForMultiselect;
  let cardinality = isGroup0 ? 0 : arity - 1;
  if (isGroup0)
    cardinality = 0;
  else if (jlEqOps.includes(op) && cardinality == 1 && vals[1] === null) {
    arity = 1;
    cardinality = 0;
    vals = [vals[0]];
  }

  const opk = op + "/" + cardinality;
  let opKeys = conv.operators[opk];
  if (!opKeys)
    return;

  const returnVariants = [];
  for (const opKey of opKeys) {
    let jlField, jlArgs = [];
    if (jlRangeOps.includes(op) && arity == 3) {
      jlField = vals[1];
      jlArgs = [ vals[0], vals[2] ];
    } else {
      [jlField, ...jlArgs] = vals;
    }
    if (conv.combinationOperators[opKey]?.isRevArgs) {
      jlField = vals[vals.length-1];
      jlArgs = vals.slice(0, vals.length-1);
    }
  
    if (!isJsonLogic(jlField)) {
      continue; // try another operator
    }

    const lhs = convertLhs(isGroup0, jlField, jlArgs, conv, config, null, null, meta, parentField);
    if (!lhs) {
      continue; // try another operator
    }
    const {
      field, fieldSrc, having, isGroup, args
    } = lhs;
    const fieldConfig = getFieldConfig(config, field);
    if (!fieldConfig && !meta.settings?.allowUnknownFields) {
      meta.errors.push(`No config for LHS ${field}`);
      return;
    }
    const isValidOp = fieldConfig?.operators && fieldConfig.operators.includes(opKey);

    returnVariants.push({
      field, fieldSrc, fieldConfig, opKey, args, having,
      isValidOp,
    });
  }

  returnVariants.sort(({isValidOp}) => isValidOp ? -1 : +1);

  return returnVariants[0];
};

const convertOp = (op, vals, conv, config, not, meta, parentField = null, _isOneRuleInRuleGroup = false) => {
  if (!op) return undefined;
  
  const jlConjs = Object.values(config.conjunctions).map(({jsonLogicConj}) => jsonLogicConj);
  const arity = vals.length;

  const parseRes = parseRule(op, arity, vals, parentField, conv, config, meta);
  if (!parseRes) return undefined;
  let {field, fieldSrc, fieldConfig, opKey, args, having} = parseRes;
  const parentFieldConfig = getFieldConfig(config, parentField);

  let opConfig = config.operators[opKey];
  const reversedOpConfig = config.operators[opConfig?.reversedOp];
  const opNeedsReverse = false;
  const opCanReverse = !!reversedOpConfig;

  // Group component in array mode can show NOT checkbox, so do nothing in this case
  // Otherwise try to reverse
  // const showNot = fieldConfig?.showNot !== undefined ? fieldConfig.showNot : config.settings.showNot;
  const isRuleGroup = fieldConfig.type == "!group";
  // const isGroupArray = isRuleGroup && fieldConfig.mode == "array";
  const isInRuleGroup = parentFieldConfig?.type == "!group";
  let canRev = opCanReverse && (
    !!config.settings.reverseOperatorsForNot
    || opNeedsReverse
    || isRuleGroup && !having // !(count == 2)  ->  count != 2  // because "NOT" is not visible inside rule_group if there are no children
    || !isRuleGroup && isInRuleGroup && !_isOneRuleInRuleGroup // 2+ rules in rule-group should be flat. see inits.with_not_and_in_some in test
  );
  // if (isGroupArray && showNot)
  //   canRev = false;
  const needRev = not && canRev || opNeedsReverse;
  
  let conj;
  let havingVals;
  let havingNot = false;
  const canRevHaving = !!config.settings.reverseOperatorsForNot;
  if (fieldConfig?.type == "!group" && having) {
    conj = Object.keys(having)[0];
    havingVals = having[conj];
    if (!Array.isArray(havingVals))
      havingVals = [ havingVals ];

    // Preprocess "!": Try to reverse op in single rule in having
    // Eg. use `not_equal` instead of `not` `equal`
    // We look for template matches here to make sure we dont reverse when "!" is
    // part of operator
    let match = matchAgainstTemplates(having, conv, meta);
    while (conj == "!" && !match) {
      const isEmptyOp = conj == "!" && (
        havingVals.length == 1 && havingVals[0] && isJsonLogic(havingVals[0])
        && conv.varKeys.includes(Object.keys(havingVals[0])[0])
      );
      if (isEmptyOp) {
        break;
      }
      havingNot = !havingNot;
      having = having["!"];
      conj = Object.keys(having)[0];
      havingVals = having[conj];
      // Negation group with single rule is to be treated the same as !
      if (canRevHaving && jlConjs.includes(conj) && havingVals.length == 1) {
        having = having[conj][0];
        conj = Object.keys(having)[0];
        havingVals = having[conj];
      }
      // Another template matching
      const matchTemp = matchAgainstTemplates(having, conv, meta);
      match = matchTemp ? matchTemp : match;
    }
    if (!Array.isArray(havingVals)) {
      havingVals = [ havingVals ];
    }
    // If template match found we act accordingly
    if (match) {
      // We reset vals if match found
      havingVals = [];
      havingVals[0] = match.jlField;
      match.jlArgs.forEach(arg => havingVals.push(arg));
      // We reset op to new op that represents multiple jsonlogic operators
      conj = match.newOp;
    }
  }

  // Use reversed op
  if (needRev) {
    not = !not;
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
    } else {
      // rule, need to be wrapped in `rule_group`
      res = convertOp(conj, havingVals, conv, config, havingNot, meta, field, true);
      if (res) {
        if (res.type === "rule_group" && res.properties?.field !== field) {
          res = wrapInDefaultConjRuleGroup(res, field, fieldConfig, config);
        }
        Object.assign(res.properties, {
          conjunction: defaultGroupConjunction(config, fieldConfig),
        });
      }
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
      // tip: don't set not to properties, only havingNot should affect it
      res = wrapInDefaultConj(res, config, not);
    }
  } else if (fieldConfig?.type == "!group" && !having) {
    res = {
      type: "rule_group",
      id: uuid(),
      children1: {},
      properties: {
        conjunction: defaultGroupConjunction(config, fieldConfig),
        // tip: `not: true` have no effect if there are no children! "NOT" is hidden in UI and is ignored during export
        // So it's better to reverse group op (see `canRev =`), or wrap in conj with NOT as a last resort
        not: false,
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
    if (not) {
      res = wrapInDefaultConj(res, config, not);
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
    if (not || _isOneRuleInRuleGroup) {
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
    valueType: [valueType ?? widgetDef?.type],
    field: "!case_value",
  };
  return valProperties;
};
