import { SpelExpressionEvaluator } from "spel2js";
import { loadTree } from "../tree";
import { buildConv } from "./conv";
import { convertToTree } from "./convert";
import { postprocessCompiled } from "./postprocess";
import { wrapInDefaultConj } from "./builder";
import * as Utils from "../../utils";

const { logger } = Utils.OtherUtils;
const { extendConfig } = Utils.ConfigUtils;

// https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions


export const loadFromSpel = (spelStr, config) => {
  return _loadFromSpel(spelStr, config, true);
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
