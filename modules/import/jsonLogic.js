import uuid from "../utils/uuid";
import {defaultValue} from "../utils/stuff";
import {getFieldConfig, extendConfig, getWidgetForFieldOp} from "../utils/configUtils";
import {loadTree} from "./tree";
import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";
import moment from "moment";
import {isJsonLogic} from "../utils/stuff";

// http://jsonlogic.com/

// helpers
Object.defineProperty(Array.prototype, "uniq", {
  configurable: true,
  enumerable: false,
  value: function () {
    return Array.from(new Set(this));
  }
});
Object.defineProperty(Array.prototype, "to_object", {
  configurable: true,
  enumerable: false,
  value: function () {
    return this.reduce((acc, [f, fc]) => ({ ...acc, [f]: fc }), {});
  }
});

//meta is mutable
export const loadFromJsonLogic = (logicTree, config) => {
  let meta = {
    errors: []
  };
  const extendedConfig = extendConfig(config);
  const conv = buildConv(extendedConfig);
  let jsTree = logicTree ? convertFromLogic(logicTree, conv, extendedConfig, "rule", meta) : undefined;
  if (jsTree && jsTree.type != "group") {
    jsTree = wrapInDefaultConj(jsTree, extendedConfig);
  }
  const immTree = jsTree ? loadTree(jsTree) : undefined;
  if (meta.errors.length)
    console.warn("Errors while importing from JsonLogic:", meta.errors);
  return immTree;
};

const buildConv = (config) => {
  let operators = {};
  for (let opKey in config.operators) {
    const opConfig = config.operators[opKey];
    if (typeof opConfig.jsonLogic == "string") {
      // example: "</2", "#in/1"
      const opk = (opConfig._jsonLogicIsRevArgs ? "#" : "") + opConfig.jsonLogic + "/" + defaultValue(opConfig.cardinality, 1);
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);
    } else if(typeof opConfig.jsonLogic2 == "string") {
      // example: all-in/1"
      const opk = opConfig.jsonLogic2 + "/" + defaultValue(opConfig.cardinality, 1);
      if (!operators[opk])
        operators[opk] = [];
      operators[opk].push(opKey);
    }
  }

  let conjunctions = {};
  for (let conjKey in config.conjunctions) {
    const ck = conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

  let funcs = {};
  for (let funcKey in config.funcs) {
    const funcConfig = config.funcs[funcKey];
    if (typeof funcConfig.jsonLogic == "string") {
      const fk = (funcConfig.jsonLogicIsMethod ? "#" : "") + funcConfig.jsonLogic;
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

const convertFromLogic = (logic, conv, config, expectedType, meta, not = false, fieldConfig, widget, parentField = null) => {
  let op, vals;
  if (isJsonLogic(logic)) {
    op = Object.keys(logic)[0];
    vals = logic[op];
    if (!Array.isArray(vals))
      vals = [ vals ];
  }
  
  let ret;
  let beforeErrorsCnt = meta.errors.length;

  const isNotOp = op == "!" && (vals.length == 1 && vals[0] && isJsonLogic(vals[0]) && Object.keys(vals[0])[0] == "var");
  const isRev = op == "!" && !isNotOp;
  if (isRev) {
    ret = convertFromLogic(vals[0], conv, config, expectedType, meta, !not, fieldConfig, widget, parentField);
  } else if(expectedType == "val") {
    ret = convertField(op, vals, conv, config, not, meta, parentField) 
      || convertFunc(op, vals, conv, config, not, fieldConfig, meta, parentField) 
      || convertVal(logic, fieldConfig, widget, config, meta);
  } else if(expectedType == "rule") {
    ret = convertConj(op, vals, conv, config, not, meta, parentField) 
    || convertOp(op, vals, conv, config, not, meta, parentField);
  }

  let afterErrorsCnt = meta.errors.length;
  if (op != "!" && ret === undefined && afterErrorsCnt == beforeErrorsCnt) {
    meta.errors.push(`Can't parse logic ${JSON.stringify(logic)}`);
  }

  return ret;
};

const convertVal = (val, fieldConfig, widget, config, meta) => {
  if (val === undefined) return undefined;
  const widgetConfig = config.widgets[widget || fieldConfig.mainWidget];

  if (!widgetConfig) {
    meta.errors.push(`No widget for type ${fieldConfig.type}`);
    return undefined;
  }

  if (isJsonLogic(val)) {
    meta.errors.push(`Unexpected logic in value: ${JSON.stringify(val)}`);
    return undefined;
  }

  // number of seconds -> time string
  if (fieldConfig && fieldConfig.type == "time" && typeof val == "number") {
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
  if (fieldConfig && ["date", "datetime"].includes(fieldConfig.type) && val && !(val instanceof Date)) {
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

  return {
    valueSrc: "value",
    value: val,
    valueType: widgetConfig.type
  };
};

const convertField = (op, vals, conv, config, not, meta, parentField = null) => {
  const {fieldSeparator} = config.settings;
  if (op == "var") {
    let field = vals[0];
    if (parentField)
      field = [parentField, field].join(fieldSeparator);
    const fieldConfig = getFieldConfig(field, config);
    if (!fieldConfig) {
      meta.errors.push(`No config for field ${field}`);
      return undefined;
    }

    return {
      valueSrc: "field",
      value: field,
      valueType: fieldConfig.type,
    };
  }

  return undefined;
};

const convertFunc = (op, vals, conv, config, not, fieldConfig, meta, parentField = null) => {
  if (!op) return undefined;
  let func, argsArr;
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

  let funcKeys = conv.funcs[fk];
  if (funcKeys) {
    let funcKey = funcKeys[0];
    if (funcKeys.length > 1 && fieldConfig) {
      funcKeys = funcKeys
        .filter(k => (config.funcs[k].returnType == fieldConfig.type));
      if (funcKeys.length == 0) {
        meta.errors.push(`No funcs returning type ${fieldConfig.type}`);
        return undefined;
      }
      funcKey = funcKeys[0];
    }
    const funcConfig = config.funcs[funcKey];
    const argKeys = Object.keys(funcConfig.args);
    let args = argsArr.reduce((acc, val, ind) => {
      const argKey = argKeys[ind];
      const argConfig = funcConfig.args[argKey];
      let argVal = convertFromLogic(val, conv, config, "val", meta, false, argConfig, null, parentField);
      if (argVal === undefined) {
        argVal = argConfig.defaultValue;
        if (argVal === undefined) {
          meta.errors.push(`No value for arg ${argKey} of func ${funcKey}`);
          return undefined;
        }
      }
      return {...acc, [argKey]: argVal};
    }, {});

    return {
      valueSrc: "func",
      value: {
        func: funcKey,
        args: args
      },
      valueType: funcConfig.returnType,
    };
  }

  return undefined;
};

const convertConj = (op, vals, conv, config, not, meta, parentField = null) => {
  const conjKey = conv.conjunctions[op];
  const {fieldSeparator} = config.settings;
  if (conjKey) {
    let type = "group";
    const children = vals
      .map(v => convertFromLogic(v, conv, config, "rule", meta, false, null, null, parentField))
      .filter(r => r !== undefined)
      .reduce((acc, r) => ({...acc, [r.id] : r}), {});
    const complexFields = Object.entries(children)
      .filter(([_k, v]) => v.properties !== undefined && v.properties.field !== undefined && v.properties.field.indexOf(fieldSeparator) != -1)
      .map(([_k, v]) => (v.properties.field.split(fieldSeparator)));
    const complexFieldsParents = complexFields
      .map(parts => parts.slice(0, parts.length - 1).join(fieldSeparator));
    const complexFieldsConfigs = complexFieldsParents
      .uniq()
      .map(f => [f, getFieldConfig(f, config)])
      .to_object();
    const complexFieldsInRuleGroup = complexFieldsParents
      .filter((f) => complexFieldsConfigs[f].type == "!group");
    const usedRuleGroups = complexFieldsInRuleGroup.uniq();
    const usedTopRuleGroups = topLevelFieldsFilter(usedRuleGroups);
    
    let properties = {
      conjunction: conjKey,
      not: not
    };
    const id = uuid();

    let children1 = {};
    // TIP: `needSplit` will be true if using useGroupsAsArrays=false and there are fields of different groups on one level
    //      (like "a.b" and "x.z" -> need to split them with hierarchy)
    // TIP: Even if fields are of same root parent (like "a.b", "a.c.d"), still we may need to create hierarchy of `rule_group`s
    const needSplit = !(usedTopRuleGroups.length == 1 && complexFieldsInRuleGroup.length == Object.keys(children).length);
    let groupToId = {};
    Object.entries(children).map(([k, v]) => {
      if (v.type == "group" || v.type == "rule_group") {
        // put as-is
        children1[k] = v;
      } else {
        const groupFields = usedRuleGroups.filter((f) => v.properties.field.indexOf(f) == 0);
        const groupField = groupFields.length > 0 ? groupFields.sort((a, b) => (b.length - a.length))[0] : null;
        if (!groupField) {
          // not in rule_group (can be simple field or in struct) - put as-is
          children1[k] = v;
        } else {
          // wrap field in rule_group (with creating hierarchy if need)
          let ch = children1;
          groupField.split(fieldSeparator).map((f, i, a) => {
            const p = a.slice(0, i);
            const ff = [...p, f].join(fieldSeparator);
            if (!needSplit && i == 0) {
              type = "rule_group";
              properties.field = ff;
              groupToId[ff] = id;
            } else {
              let groupId = groupToId[ff];
              if (!groupId) {
                groupId = uuid();
                groupToId[ff] = groupId;
                ch[groupId] = {
                  type: "rule_group",
                  id: groupId,
                  children1: {},
                  properties: {
                    conjunction: conjKey,
                    not: false,
                    field: ff,
                  }
                };
              }
              ch = ch[groupId].children1;
            }
          });
          ch[k] = v;
        }
      }
    });

    return {
      type: type,
      id: id,
      children1: children1,
      properties: properties
    };
  }

  return undefined;
};

const topLevelFieldsFilter = (fields) => {
  let arr = [...fields].sort((a, b) => (a.length - b.length));
  for (let i = 0 ; i < arr.length ; i++) {
    for (let j = i + 1 ; j < arr.length ; j++) {
      if (arr[j].indexOf(arr[i]) == 0) {
        // arr[j] is inside arr[i] (eg. "a.b" inside "a")
        arr.splice(j, 1);
        j--;
      }
    }
  }
  return arr;
};

const wrapInDefaultConjRuleGroup = (rule, parentField, config, conj) => {
  if (!rule) return undefined;
  return {
    type: "rule_group",
    id: uuid(),
    children1: { [rule.id]: rule },
    properties: {
      conjunction: conj || defaultGroupConjunction(config),
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

const convertOp = (op, vals, conv, config, not, meta, parentField = null) => {
  if (!op) return undefined;
  const {fieldSeparator} = config.settings;
  const arity = vals.length;
  const cardinality = arity - 1;
  if (op == "all") {
    // special case for "all-in"
    const op2 = Object.keys(vals[1])[0];
    if (op2 == "in") {
      vals = [
        vals[0],
        vals[1][op2][1]
      ];
      op = op + "-" + op2; // "all-in"
    }
  }
  const opk = op + "/" + cardinality;

  let oks = [], errors = [];
  const _check = (isRevArgs) => {
    let opKeys = conv.operators[(isRevArgs ? "#" : "") + opk];
    if (opKeys) {
      let jlField, args = [];
      const rangeOps = ["<", "<=", ">", ">="];
      if (rangeOps.includes(op) && arity == 3) {
        jlField = vals[1];
        args = [ vals[0], vals[2] ];
      } else if (isRevArgs) {
        jlField = vals[1];
        args = [ vals[0] ];
      } else {
        [jlField, ...args] = vals;
      }
      let {"var": field} = jlField;
      if (parentField)
        field = [parentField, field].join(fieldSeparator);
      if (!field) {
        errors.push(`Unknown field ${JSON.stringify(jlField)}`);
        return;
      }
      const fieldConfig = getFieldConfig(field, config);
      if (!fieldConfig) {
        errors.push(`No config for field ${field}`);
        return;
      }
  
      let opKey = opKeys[0];
      if (opKeys.length > 1 && fieldConfig && fieldConfig.operators) {
        // eg. for "equal" and "select_equals"
        opKeys = opKeys
          .filter(k => fieldConfig.operators.includes(k));
        if (opKeys.length == 0) {
          errors.push(`No corresponding ops for field ${field}`);
          return;
        }
        opKey = opKeys[0];
      }
      
      oks.push({
        field, fieldConfig, opKey, args
      });
    }
  };

  _check(false);
  _check(true);

  // special case for `rule_group` (issue #246)
  if (["some", "all", "none"].includes(op) && arity == 2) {
    if (vals[0].var !== undefined && Object.keys(vals[1]).length == 1) {
      const {"var": field} = vals[0];
      const sub = vals[1];
      const newOp = Object.keys(sub)[0];
      if (!(newOp == "in" && op == "all")) { // don't confuse with "all-in" for multiselect
        const newVals = sub[newOp];
        const newNot = !!(not ^ (newOp == "none"));
        const groupField = (parentField ? [parentField, field] : [field]).join(fieldSeparator);
        const groupFieldConfig = getFieldConfig(groupField, config);
        if (groupFieldConfig && groupFieldConfig.type == "!group") {
          let res;
          if (conv.conjunctions[newOp] !== undefined) {
            res = convertConj(newOp, newVals, conv, config, newNot, meta, groupField);
          } else {
            // need to be wrapped in `rule_group`
            const rule = convertOp(newOp, newVals, conv, config, newNot, meta, groupField);
            res = wrapInDefaultConjRuleGroup(rule, groupField, config, conv.conjunctions["and"]);
          }
          return res;
        }
      }
    }
  }

  if (!oks.length) {
    meta.errors.push(errors.join("; ") || `Unknown op ${op}/${arity}`);
    return undefined;
  }
  let {field, fieldConfig, opKey, args} = oks[0];
  let opConfig = config.operators[opKey];

  if (not && opConfig.reversedOp) {
    not = false;
    opKey = opConfig.reversedOp;
    opConfig = config.operators[opKey];
  }

  const widget = getWidgetForFieldOp(config, field, opKey);

  const convertedArgs = args
    .map(v => convertFromLogic(v, conv, config, "val", meta, false, fieldConfig, widget, parentField));
  if (convertedArgs.filter(v => v === undefined).length) {
    //meta.errors.push(`Undefined arg for field ${field} and op ${opKey}`);
    return undefined;
  }

  const rule = {
    type: "rule",
    id: uuid(),
    properties: {
      field: field,
      operator: opKey,
      value: convertedArgs.map(v => v.value),
      valueSrc: convertedArgs.map(v => v.valueSrc),
      valueType: convertedArgs.map(v => v.valueType),
    }
  };

  if (not) {
    //meta.errors.push(`No rev op for ${opKey}`);
    return wrapInDefaultConj(rule, config, not);
  } else {
    return rule;
  }
};

