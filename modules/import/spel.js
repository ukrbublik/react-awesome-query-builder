import { StandardContext, SpelExpressionEvaluator } from 'spel2js';
import uuid from "../utils/uuid";
import {defaultValue, isJsonLogic,shallowEqual} from "../utils/stuff";
import {getFieldConfig, extendConfig, normalizeField} from "../utils/configUtils";
import {getWidgetForFieldOp} from "../utils/ruleUtils";
import {loadTree} from "./tree";
import {defaultConjunction, defaultGroupConjunction} from "../utils/defaultUtils";

import moment from "moment";


export const loadFromSpel= (spelStr, config) => {
  //meta is mutable
  let meta = {
    errors: []
  };
  const extendedConfig = extendConfig(config);
  
  const compileRes = SpelExpressionEvaluator.compile(spelStr);
  const compiledExpression = compileRes._compiledExpression;
  const spelObj = convertCompiled(compiledExpression);
  console.log('spelObj:', spelObj);

  let jsTree = undefined;
  // let jsTree = logicTree ? convertFromLogic(logicTree, conv, extendedConfig, "rule", meta) : undefined;
  // if (jsTree && jsTree.type != "group") {
  //   jsTree = wrapInDefaultConj(jsTree, extendedConfig);
  // }

  const immTree = jsTree ? loadTree(jsTree) : undefined;
  if (meta.errors.length)
    console.warn("Errors while importing from SpEL:", meta.errors);
  return immTree;
};

const convertCompiled = (expr) => {
  const type = expr.getType();
  const children = expr.getChildren().map(convertCompiled);
  const str = expr.toString();

  let _value;
  let val;
  if (type == "property" || type == "number" || type == "string") {
    const loc = {};
    const ctx = {};
    const rootContext = {};
    const localsProxy = new Proxy(loc, {
      get: (target, name) => {
        _value = name;
      }
    });
    const contextProxy = new Proxy(ctx, {
      get: (target, name) => {
        _value = name;
      }
    });
    try {
      val = expr.getValue({
        activeContext: {
          peek: () => (contextProxy),
        },
        rootContext: rootContext,
        locals: localsProxy
      });
    } catch(e) {
      if (e.name == "NullPointerException") {
        // 'Property \'' + propertyName + '\' does not exist.'
      }
    }
    if (val === contextProxy)
      _value = "#this";
    else if (val === rootContext)
      _value = "#root";
  }

  return {
    type,
    children,
    val,
    value: _value
  };
};