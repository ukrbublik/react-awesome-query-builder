import * as Utils from "../../utils";
import { compareToSign } from "../../export/spel";

const { iterateFuncs } = Utils.ConfigUtils;
const { logger } = Utils.OtherUtils;

const isFuncableProperty = (p) => ["length"].includes(p);

export const manuallyImportedOps = [
  "between", "not_between", "is_empty", "is_not_empty", "is_null", "is_not_null",
  "some", "all", "none",
];
export const unsupportedOps = ["proximity"];


export const buildConv = (config) => {
  let operators = {};
  for (let opKey in config.operators) {
    const opConfig = config.operators[opKey];
    // const isGroupOp = config.settings.groupOperators?.includes(opKey);
    const spelOps = opConfig.spelOps ? opConfig.spelOps : opConfig.spelOp ? [opConfig.spelOp] : undefined;
    if (spelOps) {
      // examples of 2+: "==", "eq", ".contains", "matches" (can be used for starts_with, ends_with)
      spelOps.forEach(spelOp => {
        const opk = spelOp; // + "/" + getOpCardinality(opConfig);
        if (!operators[opk])
          operators[opk] = [];
        operators[opk].push(opKey);
      });
    } else {
      const revOpConfig = config.operators?.[opConfig.reversedOp];
      const canUseRev = revOpConfig?.spelOp || revOpConfig?.spelOps;
      const canIgnore = canUseRev
        || manuallyImportedOps.includes(opKey) || manuallyImportedOps.includes(opConfig.reversedOp)
        || unsupportedOps.includes(opKey);
      if (!canIgnore) {
        logger.warn(`[spel] No spelOp for operator ${opKey}`);
      }
    }
  }

  let conjunctions = {};
  for (let conjKey in config.conjunctions) {
    const conjunctionDefinition = config.conjunctions[conjKey];
    const ck = conjunctionDefinition.spelConj || conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }

  let funcs = {};
  for (const [funcPath, funcConfig] of iterateFuncs(config)) {
    let fks = [];
    const {spelFunc} = funcConfig;
    if (typeof spelFunc === "string") {
      const optionalArgs = Object.keys(funcConfig.args || {})
        .reverse()
        .filter(argKey => !!funcConfig.args[argKey].isOptional || funcConfig.args[argKey].defaultValue != undefined);
      const funcSignMain = spelFunc
        .replace(/\${(\w+)}/g, (_, _k) => "?");
      const funcSignsOptional = optionalArgs
        .reduce((acc, argKey) => (
          [
            ...acc,
            [
              argKey,
              ...(acc[acc.length-1] || []),
            ]
          ]
        ), [])
        .map(optionalArgKeys => (
          spelFunc
            .replace(/(?:, )?\${(\w+)}/g, (found, a) => (
              optionalArgKeys.includes(a) ? "" : found
            ))
            .replace(/\${(\w+)}/g, (_, _k) => "?")
        ));
      fks = [
        funcSignMain,
        ...funcSignsOptional,
      ];
    }
    for (const fk of fks) {
      if (!funcs[fk])
        funcs[fk] = [];
      funcs[fk].push(funcPath);
    }
  }

  let valueFuncs = {};
  for (let w in config.widgets) {
    const widgetDef = config.widgets[w];
    const {spelImportFuncs} = widgetDef;
    if (spelImportFuncs) {
      for (const fk of spelImportFuncs) {
        if (typeof fk === "string") {
          const fs = fk.replace(/\${(\w+)}/g, (_, k) => "?");
          const argsOrder = [...fk.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
          if (!valueFuncs[fs])
            valueFuncs[fs] = [];
          valueFuncs[fs].push({
            w,
            argsOrder
          });
        }
      }
    }
  }

  let opFuncs = {};
  for (let op in config.operators) {
    const opDef = config.operators[op];
    const spelOps = opDef.spelOps ? opDef.spelOps : opDef.spelOp ? [opDef.spelOp] : undefined;
    spelOps?.forEach(spelOp => {
      if (spelOp?.includes("${0}")) {
        const fs = spelOp.replace(/\${(\w+)}/g, (_, k) => "?");
        const argsOrder = [...spelOp.matchAll(/\${(\w+)}/g)].map(([_, k]) => k);
        if (!opFuncs[fs])
          opFuncs[fs] = [];
        opFuncs[fs].push({
          op,
          argsOrder
        });
      }
    });
  }
  // Special .compareTo()
  const compareToSS = compareToSign.replace(/\${(\w+)}/g, (_, k) => "?");
  opFuncs[compareToSS] = [{
    op: "!compare",
    argsOrder: ["0", "1"]
  }];

  return {
    operators,
    conjunctions,
    funcs,
    valueFuncs,
    opFuncs,
  };
};

export const buildFuncSignatures = (spel) => {
  // branches
  const brns = [
    {s: "", params: [], objs: []}
  ];
  _buildFuncSignatures(spel, brns);
  return brns.map(({s, params}) => ({s, params})).reverse().filter(({s}) => s !== "" && s !== "?");
};

// a.toLower().toUpper()
// ->
// ?.toLower().toUpper()
// ?.toUpper()
const _buildFuncSignatures = (spel, brns) => {
  let params = [], s = "";
  const { type, methodName, val, obj, args, isVar, cls, children } = spel;
  const lastChild = children?.[children.length-1];
  let currBrn = brns[brns.length-1];
  if (type === "!func") {
    // T(DateTimeFormat).forPattern(?).parseDateTime(?)  --  ok
    // T(LocalDateTime).parse(?, T(DateTimeFormatter).ofPattern(?))  --  will not work
    let o = obj;
    while (o) {
      const [s1, params1] = _buildFuncSignatures({...o, obj: null}, [{}]);
      if (s1 !== "?") {
        // start new branch
        const newBrn = {
          s: currBrn.s,
          params: [...currBrn.params],
          objs: [...currBrn.objs]
        };
        // finish old branch
        currBrn.objs.unshift("?");
        currBrn.params.unshift(o);
        // switch
        brns.push(newBrn);
        currBrn = brns[brns.length-1];
      }
      // step
      currBrn.objs.unshift(s1);
      currBrn.params.unshift(...params1);
      o = o.type === "!func" ? o.obj : null;
    }
    for (const brn of brns) {
      params = [
        ...(brn?.params || []),
        ...(args || []),
      ];
      s = "";
      if (brn?.objs?.length)
        s += brn.objs.join(".") + ".";
      s += (isVar ? "#" : "") + methodName;
      s += "(" + (args || []).map(_ => "?").join(", ") + ")";
      brn.s = s;
      brn.params = params;
    }
  } else if (type === "!new") {
    // new java.text.SimpleDateFormat('HH:mm:ss').parse('...')
    params = args || [];
    s = `new ${cls.join(".")}(${params.map(_ => "?").join(", ")})`;
  } else if (type === "!type") {
    // T(java.time.LocalTime).parse('...')
    s = `T(${cls.join(".")})`;
  } else if (type === "compound" && lastChild.type === "property" && isFuncableProperty(lastChild.val)) {
    // {1,2}.length  --  ok
    // 'Hello World'.bytes.length  --  will not work
    s = children.map((c) => {
      if (c === lastChild)
        return c.val;
      const [s1, params1] = _buildFuncSignatures({...c, obj: null}, [{}]);
      params.push(...params1);
      return s1;
    }).join(".");
  } else {
    params = [spel];
    s = "?";
  }

  if (currBrn) {
    currBrn.s = s;
    currBrn.params = params;
  }

  return [s, params];
};
