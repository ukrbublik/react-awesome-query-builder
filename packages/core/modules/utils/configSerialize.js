import merge from "lodash/merge";
import pick from "lodash/pick";
import {isJsonLogic, isJSX, isDirtyJSX, cleanJSX, shallowEqual} from "./stuff";
import clone from "clone";
import JL from "json-logic-js";
import { addRequiredJsonLogicOperations, applyJsonLogic } from "./jsonLogic";
import { BasicFuncs } from "..";
import { getFieldRawConfig } from "./configUtils";

// Add new operations for JsonLogic
addRequiredJsonLogicOperations();

export { isJSX, isDirtyJSX, cleanJSX, applyJsonLogic };

function applyJsonLogicWithPath(logic, data, path) {
  let ret;
  try {
    ret = JL.apply(logic, data);
  } catch (e) {
    e.message = `${path.join(".")} :: ${e.message}`;
    throw e;
  }
  return ret;
}

function callContextFn(_this, fn, args, path) {
  let ret;
  try {
    ret = fn.call(_this, ...args);
  } catch (e) {
    e.message = `${path.join(".")} :: ${e.message}`;
    throw e;
  }
  return ret;
}

export const configKeys = ["conjunctions", "fields", "types", "operators", "widgets", "settings", "funcs", "ctx"];

// type: 
//  x - iterate (with nesting `subfields`)
//  "r" - RenderedReactElement
//    Will be compiled with renderReactElement() into React element rendered with `React.createElement` (`ctx.RCE`)
//  "rf" - JsonLogicFunction/string to render React
//    JL data is { props, ctx }
//    Should return {type, props} or string, where type or string - React component
//    Can use { JSX: ["SomeComponent", {var: "props"}] } or just return "SomeComponent"
//    Returned component will be searched in ctx.components/ctx.W/ctx.O, see getReactComponentFromCtx()
//    Will be compiled with compileJsonLogicReact() into function with args (props, ctx) that will return renderReactElement()
//  "f" - JsonLogicFunction/string
//    JL data is { args, ctx } plus named args defined in `args` inside `compileMeta`
//    Can use { CALL: [ {var: "ctx.someFunc"}, null, {var: "args[0]" }] } 
//    If string is passed, it's a path to function in ctx (with dot notation)
//    Will be compiled with compileJsonLogic() into function with any args and `this` should be `ctx`

const compileMetaFieldSettings = {
  asyncFetch: { type: "f", args: ["search", "offset"] },
  labelYes: { type: "r" },
  labelNo: { type: "r" },
  marks: { type: "r", isArr: true },
  validateValue: { type: "f", args: ["val", "fieldSettings", "op", "opDef", "rightFieldDef"] },
};

const compileMetaWidget = {
  ...compileMetaFieldSettings,
  factory: { type: "rf" },
  formatValue: { type: "f", args: ["val", "fieldDef", "wgtDef", "isForDisplay", "op", "opDef", "rightFieldDef"] },
  sqlFormatValue: { type: "f", args: ["val", "fieldDef", "wgtDef", "op", "opDef", "rightFieldDef"] },
  spelFormatValue: { type: "f", args: ["val", "fieldDef", "wgtDef", "op", "opDef", "rightFieldDef"] },
  spelImportValue: { type: "f", args: ["val"] },
  mongoFormatValue: { type: "f", args: ["val", "fieldDef", "wgtDef", "op", "opDef"] },
  elasticSearchFormatValue: { type: "f", args: ["queryType", "val", "op", "field", "config"] },
  jsonLogic: { type: "f", args: ["val", "fieldDef", "wgtDef", "op", "opDef"] },
  validateValue: { type: "f", args: ["val", "fieldSettings", "op", "opDef", "rightFieldDef"] }, // obsolete
  toJS: { type: "f", args: ["val"] },
};

const compileMetaOperator = {
  options: { // proximity
    factory: { type: "rf" },
  },
  formatOp: { type: "f", args: ["field", "op", "vals", "valueSrc", "valueType", "opDef", "operatorOptions", "isForDisplay", "fieldDef"] },
  mongoFormatOp: { type: "f", args: ["field", "op", "vals", "useExpr", "valueSrc", "valueType", "opDef", "operatorOptions", "fieldDef"] },
  sqlFormatOp: { type: "f", args: ["field", "op", "vals", "valueSrc", "valueType", "opDef", "operatorOptions", "fieldDef"] },
  spelFormatOp: { type: "f", args: ["field", "op", "vals", "valueSrc", "valueType", "opDef", "operatorOptions", "fieldDef"] },
  jsonLogic: { type: "f", ignore: "string", args: ["field", "op", "vals", "opDef", "operatorOptions", "fieldDef"] },
  elasticSearchQueryType: { type: "f", ignore: "string", args: ["valueType"] },
  textSeparators: { type: "r", isArr: true },
};

const compileMetaConjunction = {
  formatConj: { type: "f", args: ["children", "conj", "not", "isForDisplay"] },
  sqlFormatConj: { type: "f", args: ["children", "conj", "not"] },
  spelFormatConj: { type: "f", args: ["children", "conj", "not", "omitBrackets"] },
};

const compileMetaWidgetForType = {
  widgetProps: compileMetaWidget,
  opProps: compileMetaOperator
};

const compileMetaFunc = {
  renderBrackets: { type: "r", isArr: true },
  renderSeps: { type: "r", isArr: true },

  jsonLogic: { type: "f", ignore: "string", args: ["formattedArgs"] },
  jsonLogicImport: { type: "f", args: ["val"] },
  formatFunc: { type: "f", args: ["formattedArgs", "isForDisplay"] },
  sqlFormatFunc: { type: "f", args: ["formattedArgs"] },
  mongoFormatFunc: { type: "f", args: ["formattedArgs"] },
  spelFormatFunc: { type: "f", args: ["formattedArgs"] },
};

const compileMetaSettings = {
  locale: {
    mui: { type: "f", args: [], invokeWith: [], ignore: "jl" },
  },

  canCompareFieldWithField: { type: "f", args: ["leftField", "leftFieldConfig", "rightField", "rightFieldConfig", "op"] },
  formatReverse: { type: "f", args: ["q", "op", "reversedOp", "operatorDefinition", "revOperatorDefinition", "isForDisplay"] },
  sqlFormatReverse: { type: "f", args: ["q"] },
  spelFormatReverse: { type: "f", args: ["q"] },
  formatField: { type: "f", args: ["field", "parts", "label2", "fieldDefinition", "config", "isForDisplay"] },
  formatSpelField: { type: "f", args: ["field", "parentField", "parts", "partsExt", "fieldDefinition", "config"] },
  formatAggr: { type: "f", args: ["whereStr", "aggrField", "operator", "value", "valueSrc", "valueType", "opDef", "operatorOptions", "isForDisplay", "aggrFieldDef"] },
  
  normalizeListValues: { type: "f", args: ["listValues", "type", "fieldSettings"] },

  renderConfirm: { type: "f", args: ["props"] },
  useConfirm: { type: "f", args: [] },

  renderField: { type: "rf" },
  renderFieldSources: { type: "rf" },
  renderOperator: { type: "rf" },
  renderFunc: { type: "rf" },
  renderConjs: { type: "rf" },
  renderButton: { type: "rf" },
  renderButtonGroup: { type: "rf" },
  renderValueSources: { type: "rf" },
  renderProvider: { type: "rf" },
  renderSwitch: { type: "rf" },
  renderSwitchPrefix: { type: "r" },

  renderItem: { type: "rf" },
  renderBeforeWidget: { type: "rf" },
  renderAfterWidget: { type: "rf" },
  renderBeforeActions: { type: "rf" },
  renderAfterActions: { type: "rf" },
  renderRuleError: { type: "rf" },
};

const compileMeta = {
  fields: {
    x: {
      fieldSettings: compileMetaFieldSettings,
      widgets: {
        x: compileMetaWidgetForType
      },
      mainWidgetProps: compileMetaWidget
    },
  },
  widgets: {
    x: compileMetaWidget
  },
  conjunctions: {
    x: compileMetaConjunction
  },
  operators: {
    x: compileMetaOperator
  },
  types: {
    x: {
      widgets: {
        x: compileMetaWidgetForType
      }
    }
  },
  funcs: {
    x: compileMetaFunc
  },
  settings: compileMetaSettings,
};

/////////////

export const compressConfig = (config, baseConfig) => {
  if (config.__fieldNames) {
    throw new Error("Don't apply `compressConfig()` to extended config");
  }
  let zipConfig = pick(config, configKeys);
  delete zipConfig.ctx;

  const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

  const _clean = (target, base, path, meta) => {
    if (isObject(target)) {
      if (isDirtyJSX(target)) {
        target = cleanJSX(target);
      }
      if (path[0] === "funcs" && !base) {
        const funcKey = path[path.length - 1];
        // todo: if there will be change in `BasicFuncs` when funcs can be nested, need to chnage code to find `base`
        base = getFieldRawConfig({
          funcs: meta.BasicFuncs
        }, funcKey, "funcs", "subfields") || undefined;
        if (base) {
          target["$$key"] = funcKey;
        }
      }
      if (base !== undefined && isObject(base)) {
        for (let k in base) {
          if (Object.prototype.hasOwnProperty.call(base, k)) {
            if (!Object.keys(target).includes(k) || target[k] === undefined && base[k] !== undefined) {
              // deleted in target
              target[k] = "$$deleted";
            } else {
              target[k] = _clean(target[k], base[k], [...path, k], meta);
              if (target[k] === undefined) {
                delete target[k];
              }
            }
          }
        }
      }
      for (let k in target) {
        if (Object.prototype.hasOwnProperty.call(target, k)) {
          if (!base || !Object.keys(base).includes(k)) {
            // new in target
            target[k] = _clean(target[k], base?.[k], [...path, k], meta);
          }
          if (target[k] === undefined) {
            delete target[k];
          }
        }
      }
      if (Object.keys(target).length === 0) {
        target = undefined;
      }
    } else if (Array.isArray(target)) {
      // don't deep compare arrays, but allow clean JSX inside array
      target.forEach((val, ind) => {
        target[ind] = _clean(target[ind], undefined, [...path, ind], meta);
      });
    }

    if (base !== undefined && shallowEqual(target, base, true)) {
      return undefined;
    }

    if (typeof target === "function") {
      throw new Error(`compressConfig: function at ${path.join(".")} should be converted to JsonLogic`);
    }

    return target;
  };

  for (const rootKey of configKeys) {
    if (rootKey === "ctx") {
      // ignore
    } else if (rootKey === "fields") {
      // just copy
      zipConfig[rootKey] = clone(zipConfig[rootKey]);
      _clean(zipConfig[rootKey], {}, [rootKey]);
    } else if (rootKey === "funcs") {
      // leave only diff for every used func
      zipConfig[rootKey] = clone(zipConfig[rootKey] || {});
      for (let k in zipConfig[rootKey]) {
        _clean(zipConfig[rootKey][k], null, [rootKey, k], {
          BasicFuncs
        });
      }
    } else {
      // leave only diff
      zipConfig[rootKey] = clone(zipConfig[rootKey]);
      _clean(zipConfig[rootKey], baseConfig[rootKey], [rootKey]);
    }
  }

  return zipConfig;
};


export const decompressConfig = (zipConfig, baseConfig, ctx) => {
  if (!zipConfig.settings.useConfigCompress) {
    throw new Error("Please enable `useConfigCompress` in config settings to use decompressConfig()");
  }
  let unzipConfig = {};

  const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

  const _mergeDeep = (target, mixin, path) => {
    if (isObject(mixin)) {
      if (!isObject(target)) {
        target = {};
      }
      for (let k in mixin) {
        if (Object.prototype.hasOwnProperty.call(mixin, k)) {
          if (mixin[k] === "$$deleted") {
            delete target[k];
          } else {
            target[k] = _mergeDeep(target[k], mixin[k], [...path, k]);
          }
        }
      }
    } else if (Array.isArray(mixin)) {
      // don't merge arrays, just replace
      target = clone(mixin);
    } else {
      target = mixin;
    }

    return target;
  };

  const _resolveAndMergeDeep = (target, path, meta) => {
    // try to resolve by $$key and merge
    let resolved = false;
    if (isObject(target) && Object.prototype.hasOwnProperty.call(target, "$$key") && target["$$key"]) {
      const func = getFieldRawConfig({
        funcs: meta.BasicFuncs
      }, target["$$key"], "funcs", "subfields");
      if (func) {
        // deep merge func <- zip
        delete target["$$key"];
        target = _mergeDeep(clone(func), target, path);
        resolved = true;
      } else {
        throw new Error(`decompressConfig: basic function not found by key ${target["$$key"]} at ${path.join(".")}`);
      }
    }

    if (!resolved) {
      if (isObject(target)) {
        // loop through object to find refs ($$key)
        for (let k in target) {
          if (Object.prototype.hasOwnProperty.call(target, k)) {
            target[k] = _resolveAndMergeDeep(target[k], [...path, k], meta);
          }
        }
      } else if (Array.isArray(target)) {
        // also loop through array to find refs ($$key)
        for (const k of target) {
          target[k] = _resolveAndMergeDeep(target[k], [...path, k], meta);
        }
      }
    }

    return target;
  };

  for (const rootKey of configKeys) {
    if (rootKey === "ctx") {
      // simple deep merge
      unzipConfig[rootKey] = merge({}, baseConfig.ctx || {}, ctx || {});
    } else if (rootKey === "funcs") {
      // use $$key to pick funcs from BasicFuncs
      unzipConfig[rootKey] = clone(zipConfig[rootKey] || {});
      _resolveAndMergeDeep(unzipConfig[rootKey], [rootKey], {
        BasicFuncs
      });
    } else if (rootKey === "fields") {
      // just copy
      unzipConfig[rootKey] = clone(zipConfig[rootKey] || {});
    } else {
      // deep merge base <- zip
      unzipConfig[rootKey] = clone(baseConfig[rootKey] || {});
      _mergeDeep(unzipConfig[rootKey], zipConfig[rootKey] || {}, [rootKey]);
    }
  }

  return unzipConfig;
};

/////////////

export const compileConfig = (config) => {
  if (config.__compliled) {
    return config;
  }

  config = {...config};

  const opts = {
    ctx: config.ctx,
  };

  const logs = [];
  _compileConfigParts(config, config, opts, compileMeta, logs);
  //console.log(logs.join("\n"));

  Object.defineProperty(config, "__compliled", {
    enumerable: false,
    writable: false,
    value: true
  });

  return config;
};

function _compileConfigParts(config, subconfig, opts, meta, logs, path = []) {
  if (!subconfig) return;
  const isRoot = !path.length;
  for (const k in meta) {
    const submeta = meta[k];
    let newPath = k === "x" ? path : [...path, k];
    if (isRoot) {
      //logs.push(`Cloned ${newPath.join(".")}`);
      config[k] = clone(config[k]);
    }
    if (submeta.type === "r") {
      const targetObj = subconfig;
      const val = targetObj[k];
      if (submeta.isArr) {
        for (const ind in val) {
          const newVal = renderReactElement(val[ind], opts, [...newPath, ind]);
          if (newVal !== val[ind]) {
            logs.push(`Compiled ${newPath.join(".")}[${ind}]`);
            val[ind] = newVal;
          }
        }
      } else {
        const newVal = renderReactElement(val, opts, newPath, undefined);
        if (newVal !== val) {
          logs.push(`Compiled R ${newPath.join(".")}`);
          targetObj[k] = newVal;
        }
      }
    } else if (submeta.type === "rf") {
      const targetObj = subconfig;
      const val = targetObj[k];
      const newVal = compileJsonLogicReact(val, opts, newPath, submeta.ignore);
      if (newVal !== val) {
        logs.push(`Compiled JL-RF ${newPath.join(".")}`);
        targetObj[k] = newVal;
      }
    } else if (submeta.type === "f") {
      const targetObj = subconfig;
      const val = targetObj[k];
      let newVal = compileJsonLogic(val, opts, newPath, submeta.args, submeta.ignore);
      if (submeta.invokeWith && newVal && typeof newVal === "function") {
        newVal = newVal.call(null, ...submeta.invokeWith);
      }
      if (newVal !== val) {
        logs.push(`Compiled JL-F ${newPath.join(".")}`);
        targetObj[k] = newVal;
      }
    } else if (k === "x") {
      for (const field in subconfig) {
        newPath = [...path, field];
        const def = subconfig[field];
        _compileConfigParts(config, def, opts, submeta, logs, newPath);
        if (def.subfields) {
          // tip: need to pass `meta`, not `submeta`
          _compileConfigParts(config, def.subfields, opts, meta, logs, newPath);
        }
      }
    } else {
      const def = subconfig[k];
      _compileConfigParts(config, def, opts, submeta, logs, newPath);
    }
  }
}

function compileJsonLogicReact(jl, opts, path, ignore = undefined) {
  if (isJsonLogic(jl)) {
    return function(props, ctx) {
      ctx = ctx || opts?.ctx; // can use context compile-time if not passed at runtime
      const data = {
        props, ctx,
      };
      let re = applyJsonLogicWithPath(jl, data, path);
      if (typeof re === "string") {
        re = {
          type: re,
          props
        };
      }
      
      const ret = renderReactElement(re, {ctx}, path);
      return ret;
    };
  } else if (typeof jl === "string") {
    return function(props, ctx) {
      ctx = ctx || opts?.ctx; // can use context compile-time if not passed at runtime
      const fn = jl.split(".").reduce((o, k) => o?.[k], ctx);
      if (fn) {
        return callContextFn(this, fn, [props, ctx], path);
      } else {
        const re = {
          type: jl,
          props
        };
        const ret = renderReactElement(re, {ctx}, path);
        return ret;
      }
    };
  }
  return jl;
}

function compileJsonLogic(jl, opts, path, argNames, ignore = undefined) {
  if (isJsonLogic(jl) && ignore !== "jl") {
    return function(...args) {
      const ctx = this || opts?.ctx; // can use context compile-time if not passed at runtime
      const data = (argNames || []).reduce((acc, k, i) => ({...acc, [k]: args[i]}), {
        args, ctx
      });
      const ret = applyJsonLogicWithPath(jl, data, path);
      return ret;
    }.bind(opts?.ctx);
  } else if (typeof jl === "string" && ignore !== "string") {
    return function(...args) {
      const ctx = this || opts?.ctx; // can use context compile-time if not passed at runtime
      const fn = jl.split(".").reduce((o, k) => o?.[k], ctx);
      if (fn) {
        return callContextFn(this, fn, args, path);
      } else {
        throw new Error(`${path.join(".")} :: Function ${jl} is not found in ctx`);
      }
    }.bind(opts?.ctx);
  }
  return jl;
}



function getReactComponentFromCtx(name, ctx) {
  return ctx?.components?.[name] || ctx.W[name] || ctx.O[name];
}

function renderReactElement(jsx, opts, path, key = undefined) {
  if (isJSX(jsx)) {
    let { type, props } = jsx;
    if (typeof type !== "string") {
      throw new Error(`renderReactElement for ${path.join(".")}: type should be string`);
    }
    const Cmp = getReactComponentFromCtx(type, opts.ctx) || type.toLowerCase();
    let children;
    if (key !== undefined) {
      props = { ...props, key };
    }
    if (props?.children) {
      children = renderReactElement(props.children, opts, path);
      props = { ...props, children };
    }
    const res = opts.ctx.RCE(Cmp, props);
    return res;
  } else if (jsx instanceof Array) {
    return jsx.map((el, i) => renderReactElement(el, opts, path, ""+i));
  }
  return jsx;
}
