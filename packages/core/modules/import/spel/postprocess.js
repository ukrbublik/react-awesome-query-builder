import * as Utils from "../../utils";

const { logger } = Utils.OtherUtils;


export const postprocessCompiled = (expr, meta, parentExpr = null) => {
  const type = expr.getType();
  let children = expr.getChildren().map(child => postprocessCompiled(child, meta, expr));

  // flatize OR/AND
  if (type == "op-or" || type == "op-and") {
    children = children.reduce((acc, child) => {
      const canFlatize = child.type == type && !child.not;
      const flat = canFlatize ? child.children : [child];
      return [...acc, ...flat];
    }, []);
  }

  // unwrap NOT
  if (type == "op-not") {
    if (children.length != 1) {
      meta.errors.push(`Operator NOT should have 1 child, but got ${children.length}}`);
    }
    return {
      ...children[0],
      not: !(children[0].not || false)
    };
  }

  if (type == "compound") {
    // remove `.?[true]`
    children = children.filter(child => {
      const isListFix = child.type == "selection" && child.children.length == 1 && child.children[0].type == "boolean" && child.children[0].val == true;
      return !isListFix;
    });
    // aggregation
    // eg. `results.?[product == 'abc'].length`
    const selection = children.find(child => 
      child.type == "selection"
    );
    if (selection && selection.children.length != 1) {
      meta.errors.push(`Selection should have 1 child, but got ${selection.children.length}`);
    }
    const filter = selection ? selection.children[0] : null;
    let lastChild = children[children.length - 1];
    const isSize = lastChild.type == "method" && lastChild.val.methodName == "size" 
      || lastChild.type == "!func" && lastChild.methodName == "size";
    const isLength = lastChild.type == "property" && lastChild.val == "length";
    const sourceParts = children.filter(child => 
      child !== selection && child !== lastChild
    );
    const source = {
      type: "compound",
      children: sourceParts
    };
    const isAggr = (isSize || isLength) && convertPath(sourceParts) != null;
    if (isAggr) {
      return {
        type: "!aggr",
        filter,
        source
      };
    }
    // remove `#this`, `#root`
    children = children.filter(child => {
      const isThis = child.type == "variable" && child.val == "this";
      const isRoot = child.type == "variable" && child.val == "root";
      return !(isThis || isRoot);
    });
    // indexer
    children = children.map(child => {
      if (child.type == "indexer" && child.children.length == 1) {
        return {
          type: "indexer", 
          val: child.children[0].val,
          itype: child.children[0].type
        };
      } else {
        return child;
      }
    });
    // method
    // if (lastChild.type == "method") {
    //   // seems like obsolete code!
    //   debugger
    //   const obj = children.filter(child => 
    //     child !== lastChild
    //   );
    //   return {
    //     type: "!func",
    //     obj,
    //     methodName: lastChild.val.methodName,
    //     args: lastChild.val.args
    //   };
    // }
    // !func
    if (lastChild.type == "!func") {
      const ret = {};
      let curr = ret;
      do {
        Object.assign(curr, lastChild);
        children = children.filter(child => child !== lastChild);
        lastChild = children[children.length - 1];
        if (lastChild?.type == "!func") {
          curr.obj = {};
          curr = curr.obj;
        } else {
          if (children.length > 1) {
            curr.obj = {
              type: "compound",
              children
            };
          } else {
            curr.obj = lastChild;
          }
        }
      } while(lastChild?.type == "!func");
      return ret;
    }
  }

  // getRaw || getValue
  let val;
  try {
    if (expr.getRaw) { // use my fork
      val = expr.getRaw();
    } else if (expr.getValue.length == 0) { // getValue not requires context arg -> can use
      val = expr.getValue();
    }
  } catch(e) {
    logger.error("[spel2js] Error in getValue()", e);
  }

  // ternary
  if (type == "ternary") {
    val = flatizeTernary(children);
  }

  // convert method/function args
  if (typeof val === "object" && val !== null) {
    if (val.methodName || val.functionName) {
      val.args = val.args.map(child => postprocessCompiled(child, meta, expr));
    }
  }
  // convert list
  if (type == "list") {
    val = val.map(item => postprocessCompiled(item, meta, expr));

    // fix whole expression wrapped in `{}`
    if (!parentExpr && val.length == 1) {
      return val[0];
    }
  }
  // convert constructor
  if (type == "constructorref") {
    const qid = children.find(child => child.type == "qualifiedidentifier");
    const cls = qid?.val;
    if (!cls) {
      meta.errors.push(`Can't find qualifiedidentifier in constructorref children: ${JSON.stringify(children)}`);
      return undefined;
    }
    const args = children.filter(child => child.type != "qualifiedidentifier");
    return {
      type: "!new",
      cls,
      args
    };
  }
  // convert type
  if (type == "typeref") {
    const qid = children.find(child => child.type == "qualifiedidentifier");
    const cls = qid?.val;
    if (!cls) {
      meta.errors.push(`Can't find qualifiedidentifier in typeref children: ${JSON.stringify(children)}`);
      return undefined;
    }
    const _args = children.filter(child => child.type != "qualifiedidentifier");
    return {
      type: "!type",
      cls
    };
  }
  // convert function/method
  if (type == "function" || type == "method") {
    // `foo()` is method, `#foo()` is function
    // let's use common property `methodName` and just add `isVar` for function
    const {functionName, methodName, args} = val;
    return {
      type: "!func",
      methodName: functionName || methodName,
      isVar: type == "function",
      args
    };
  }

  return {
    type,
    children,
    val,
  };
};

const flatizeTernary = (children) => {
  let flat = [];
  function _processTernaryChildren(tern) {
    let [cond, if_val, else_val] = tern;
    flat.push([cond, if_val]);
    if (else_val?.type == "ternary") {
      _processTernaryChildren(else_val.children);
    } else {
      flat.push([undefined, else_val]);
    }
  }
  _processTernaryChildren(children);
  return flat;
};

export const convertPath = (parts, meta = {}, expectingField = false) => {
  let isError = false;
  const res = parts.map(c => {
    if (c.type == "variable" || c.type == "property" || c.type == "indexer" && c.itype == "string") {
      return c.val;
    } else {
      isError = true;
      expectingField && meta?.errors?.push?.(`Unexpected item in field path compound: ${JSON.stringify(c)}`);
    }
  });
  return !isError ? res : undefined;
};
