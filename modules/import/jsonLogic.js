import uuid from "../utils/uuid";
import {defaultValue} from "../utils/stuff";
import {getFieldConfig, extendConfig, getWidgetForFieldOp} from "../utils/configUtils";
import {loadTree} from "./tree";
import {defaultConjunction} from "../utils/defaultUtils";
import moment from "moment";

// http://jsonlogic.com/

//meta is mutable
export const loadFromJsonLogic = (logicTree, config) => {
  let meta = {
    errors: []
  };
  const extendedConfig = extendConfig(config);
  const conv = buildConv(extendedConfig);
  let jsTree = convertFromLogic(logicTree, conv, extendedConfig, "rule", meta);
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

const convertFromLogic = (logic, conv, config, expectedType, meta, not = false, fieldConfig, widget) => {
  let op, vals;
  if (isLogic(logic)) {
    op = Object.keys(logic)[0];
    vals = logic[op];
    if (!Array.isArray(vals))
      vals = [ vals ];
  }
  
  let ret;
  let beforeErrorsCnt = meta.errors.length;

  const isNotOp = op == "!" && (vals.length == 1 && vals[0] && isLogic(vals[0]) && Object.keys(vals[0])[0] == "var");
  const isRev = op == "!" && !isNotOp;
  if (isRev) {
    ret = convertFromLogic(vals[0], conv, config, expectedType, meta, !not, fieldConfig, widget);
  } else if(expectedType == "val") {
    ret = convertField(op, vals, conv, config, not, meta) 
      || convertFunc(op, vals, conv, config, not, fieldConfig, meta) 
      || convertVal(logic, fieldConfig, widget, config, meta);
  } else if(expectedType == "rule") {
    ret = convertConj(op, vals, conv, config, not, meta) 
    || convertOp(op, vals, conv, config, not, meta);
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

  if (isLogic(val)) {
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
    const dateVal = new Date(val);
    if (dateVal instanceof Date && dateVal.toISOString() === val) {
      val = dateVal;
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

const convertField = (op, vals, conv, config, not, meta) => {
  if (op == "var") {
    const field = vals[0];
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

const convertFunc = (op, vals, conv, config, not, fieldConfig, meta) => {
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
      let argVal = convertFromLogic(val, conv, config, "val", meta, false, argConfig);
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

const convertConj = (op, vals, conv, config, not, meta) => {
  const conjKey = conv.conjunctions[op];
  const {fieldSeparator} = config.settings;
  if (conjKey) {
    let type = "group";
    let children = vals
      .map(v => convertFromLogic(v, conv, config, "rule", meta, false))
      .filter(r => r !== undefined)
      .reduce((acc, r) => ({...acc, [r.id] : r}), {});
    let complexFields = Object.entries(children)
      .filter(([_k, v]) => v.properties !== undefined && v.properties.field !== undefined && v.properties.field.indexOf(fieldSeparator) != -1)
      .map(([_k, v]) => (v.properties.field.split(fieldSeparator)));
    let userGroupFields = complexFields
      .map(parts => parts.splice(0, parts.length - 1).join(fieldSeparator))
      .map(f => [f, getFieldConfig(f, config)])
      .filter(([f, fc]) => fc && fc.type == "!group")
      .map(([f, fc]) => f);
    let usedGroup = userGroupFields.length > 0 ? userGroupFields[0] : null;
    let properties = {
      conjunction: conjKey,
      not: not
    };
    if (usedGroup) {
      type = "rule_group";
      properties.field = usedGroup;
    }
    return {
      type: type,
      id: uuid(),
      children1: children,
      properties: properties
    };
  }

  return undefined;
};

const wrapInDefaultConj = (rule, config) => {
  return {
    type: "group",
    id: uuid(),
    children1: { [rule.id]: rule },
    properties: {
      conjunction: defaultConjunction(config),
      not: false
    }
  };
};

const convertOp = (op, vals, conv, config, not, meta) => {
  if (!op) return undefined;
  const arity = vals.length;
  const cardinality = arity - 1;
  if (op == "all") {
    // special case
    const op2 = Object.keys(vals[1])[0];
    vals = [
      vals[0],
      vals[1][op2][1]
    ];
    op = op + "-" + op2; // example: "all-in"
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
      const {"var": field} = jlField;
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
  if (not) {
    meta.errors.push(`No rev op for ${opKey}`);
    return undefined;
  }

  const widget = getWidgetForFieldOp(config, field, opKey);

  const convertedArgs = args
    .map(v => convertFromLogic(v, conv, config, "val", meta, false, fieldConfig, widget));
  if (convertedArgs.filter(v => v === undefined).length) {
    //meta.errors.push(`Undefined arg for field ${field} and op ${opKey}`);
    return undefined;
  }

  return {
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
};

const isLogic = (logic) => (
  typeof logic === "object" // An object
  && logic !== null // but not null
  && !Array.isArray(logic) // and not an array
  && Object.keys(logic).length === 1 // with exactly one key
);
