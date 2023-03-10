import merge from "lodash/merge";
import mergeWith from "lodash/mergeWith";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {isJsonLogic, isJSX, isDirtyJSX, cleanJSX, shallowEqual} from "./stuff";
import clone from "clone";
import serializeJs from "serialize-javascript";
import { applyJsonLogic, addRequiredJsonLogicOperations } from "./jsonLogic";
import { BasicFuncs } from "..";

// Add new operations for JsonLogic
addRequiredJsonLogicOperations();

export const configKeys = ["conjunctions", "fields", "types", "operators", "widgets", "settings", "funcs", "ctx"];

// type: 
//  x - iterate (with nesting `subfields`)
//  "r" - RenderedReactElement
//    Will be compiled with renderReactElement() into React element rendered with `React.createElement` (`ctx.RCE`)
//  "rf" - JsonLogicFunction/string to render React
//    JL data is { props, ctx }
//    Should return {type, props} or string, where type or string - React component
//    Can use { RE: ["SomeComponent", {var: "props"}] } or just return "SomeComponent"
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
  jsonLogic: { type: "f", onlyJL: true, args: ["field", "op", "vals", "opDef", "operatorOptions", "fieldDef"] },
  elasticSearchQueryType: { type: "f", onlyJL: true, args: ["valueType"] },
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

  jsonLogic: { type: "f", onlyJL: true, args: ["formattedArgs"] },
  jsonLogicImport: { type: "f", args: ["val"] },
  formatFunc: { type: "f", args: ["formattedArgs", "isForDisplay"] },
  sqlFormatFunc: { type: "f", args: ["formattedArgs"] },
  mongoFormatFunc: { type: "f", args: ["formattedArgs"] },
  spelFormatFunc: { type: "f", args: ["formattedArgs"] },
};

const compileMetaSettings = {
  locale: {
    mui: { type: "f", args: [], invokeWith: [] },
  },

  canCompareFieldWithField: { type: "f", args: ["leftField", "leftFieldConfig", "rightField", "rightFieldConfig", "op"] },
  formatReverse: { type: "f", args: ["q", "op", "reversedOp", "operatorDefinition", "revOperatorDefinition", "isForDisplay"] },
  sqlFormatReverse: { type: "f", args: ["q"] },
  spelFormatReverse: { type: "f", args: ["q"] },
  formatField: { type: "f", args: ["field", "parts", "label2", "fieldDefinition", "config", "isForDisplay"] },
  formatSpelField: { type: "f", args: ["field", "parentField", "parts", "partsExt", "fieldDefinition", "config"] },
  formarAggr: { type: "f", args: ["whereStr", "aggrField", "operator", "value", "valueSrc", "valueType", "opDef", "operatorOptions", "isForDisplay", "aggrFieldDef"] },
  
  normalizeListValues: { type: "f", args: ["listValues", "type", "fieldSettings"] },

  renderConfirm: { type: "f", args: ["props"] },
  useConfirm: { type: "f", args: [] },

  renderField: { type: "rf" },
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
  let zipConfig = pick(config, configKeys);
  delete zipConfig.ctx;

  const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

  const _clean = (target, base, path) => {
    if (isObject(target)) {
      if (isDirtyJSX(target)) {
        target = cleanJSX(target);
      }
      if (base !== undefined) {
        for (let k in base) {
          if (!Object.keys(target).includes(k)) {
            // deleted in target
            target[k] = '$$deleted';
          } else {
            target[k] = _clean(target[k], base[k], [...path, k]);
            if (target[k] === undefined) {
              delete target[k];
            }
          }
        }
      }
      for (let k in target) {
        if (!base || !Object.keys(base).includes(k)) {
          // new in target
          target[k] = _clean(target[k], base?.[k], [...path, k]);
        }
      }
      if (Object.keys(target).length === 0) {
        target = undefined;
      }
    } else if (Array.isArray(target)) {
      // don't deep compare arrays, but allow clean JSX inside array
      target.forEach((val, ind) => {
        target[ind] = _clean(target[ind], undefined, [...path, ind]);
      });
    }

    if (base !== undefined && shallowEqual(target, base)) {
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
      zipConfig[rootKey] = clone(zipConfig[rootKey]);
      for (let k in zipConfig[rootKey]) {
        _clean(zipConfig[rootKey][k], BasicFuncs[k], [rootKey, k]);
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
  let unzipConfig = {};

  const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

  const _mergeDeep = (target, mixin, path) => {
    if (isObject(mixin)) {
      if (!isObject(target)) {
        target = {};
      }
      for (let k in mixin) {
        if (mixin[k] === "$$deleted") {
          delete target[k];
        } else {
          target[k] = _mergeDeep(target[k], mixin[k], [...path, k]);
        }
      }
    } else if (Array.isArray(mixin)) {
      target = mixin;
      // don't merge arrays, just replace
    } else {
      target = mixin;
    }

    return target;
  };

  for (const rootKey of configKeys) {
    if (rootKey === "ctx") {
      // simple deep merge
      unzipConfig[rootKey] = merge({}, baseConfig.ctx || {}, ctx || {});
    } else if (rootKey === "funcs") {
      // first pick only used funcs, then merge
      unzipConfig[rootKey] = clone( pick( BasicFuncs, Object.keys(zipConfig[rootKey] || {}) ) );
      _mergeDeep(unzipConfig[rootKey], zipConfig[rootKey] || {}, [rootKey]);
    } else if (rootKey === "fields") {
      // just copy
      unzipConfig[rootKey] = clone(zipConfig[rootKey] || {});
    } else {
      // deep merge base with zip
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
  console.log(logs.join("\n"));

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
      const newVal = compileJsonLogicReact(val, opts, newPath);
      if (newVal !== val) {
        logs.push(`Compiled JL-RF ${newPath.join(".")}`);
        targetObj[k] = newVal;
      }
    } else if (submeta.type === "f") {
      const targetObj = subconfig;
      const val = targetObj[k];
      let newVal = compileJsonLogic(val, opts, newPath, submeta.args, submeta.onlyJL);
      if (submeta.invokeWith && newVal) {
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

function compileJsonLogicReact(jl, opts, path) {
  if (isJsonLogic(jl)) {
    return function(props, ctx) {
      ctx = ctx || opts?.ctx; // can use context compile-time if not passed at runtime
      const data = {
        props, ctx,
      };
      let re = applyJsonLogic(jl, data);
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
      const re = {
        type: jl,
        props
      };
      const ret = renderReactElement(re, {ctx}, path);
      return ret;
    };
  }
  return jl;
}

function compileJsonLogic(jl, opts, path, argNames, onlyJL = false) {
  if (isJsonLogic(jl)) {
    return function(...args) {
      const ctx = this || opts?.ctx; // can use context compile-time if not passed at runtime
      const data = (argNames || []).reduce((acc, k, i) => ({...acc, [k]: args[i]}), {
        args, ctx
      });
      const ret = applyJsonLogic(jl, data);
      return ret;
    };
  } else if (typeof jl === "string" && !onlyJL) {
    return function(...args) {
      const ctx = this || opts?.ctx; // can use context compile-time if not passed at runtime
      const fn = jl.split(".").reduce((o, k) => o?.[k], ctx);
      if (fn) {
        return fn.call(this, ...args);
      } else {
        throw new Error(`compileJsonLogic for ${path.join(".")}: Function ${jl} is not found in ctx`);
      }
    };
  }
  return jl;
}



function getReactComponentFromCtx(name, ctx) {
  return ctx?.components?.[name] || ctx.W[name] || ctx.O[name];
};

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
};

/////////////

const mergeCustomizerCleanJSX = (_objValue, srcValue, _key, _object, _source, _stack) => {
  if (isDirtyJSX(srcValue)) {
    return cleanJSX(srcValue);
  }
};

export const UNSAFE_serializeConfig = (config) => {
  const sanitizedConfig = mergeWith({}, omit(config, ["ctx"]), mergeCustomizerCleanJSX);
  const strConfig = serializeJs(sanitizedConfig, {
    space: 2,
    unsafe: true,
  });
  if (strConfig.includes("__WEBPACK_IMPORTED_MODULE_")) {
    throw new Error("Serialized config should not have references to modules imported from webpack.");
  }
  return strConfig;
};

export const UNSAFE_deserializeConfig = (strConfig, ctx) => {
  let config = eval("("+strConfig+")");
  config.ctx = ctx;
  return config;
};

