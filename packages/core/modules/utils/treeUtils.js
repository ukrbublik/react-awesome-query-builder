import Immutable  from "immutable";
import {toImmutableList, isImmutable, applyToJS as immutableToJs} from "./stuff";
import {jsToImmutable} from "../import/tree";
import uuid from "./uuid";

export {
  toImmutableList, jsToImmutable, immutableToJs, isImmutable,
};

/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 * @return {Immutable.List}
 */
export const expandTreePath = (path, ...suffix) =>
  path.interpose("children1").withMutations((list) => {
    list.skip(1);
    list.push.apply(list, suffix);
    return list;
  });


/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 * @return {Immutable.List}
 */
export const expandTreeSubpath = (path, ...suffix) =>
  path.interpose("children1").withMutations((list) => {
    list.push.apply(list, suffix);
    return list;
  });


/**
 * @param {Immutable.Map} tree
 * @param {Immutable.List} path
 * @return {Immutable.Map}
 */
export const getItemByPath = (tree, path) => {
  let children = new Immutable.OrderedMap({ [tree.get("id")] : tree });
  let res = tree;
  path.forEach((id) => {
    res = children.get(id);
    children = res?.get("children1");
  });
  return res;
};


/**
 * Remove `path` in every item
 * @param {Immutable.Map} tree
 * @return {Immutable.Map} tree
 */
// export const removePathsInTree = (tree) => {
//   let newTree = tree;

//   function _processNode (item, path) {
//     const itemPath = path.push(item.get("id"));
//     if (item.get("path")) {
//       newTree = newTree.removeIn(expandTreePath(itemPath, "path"));
//     }

//     const children = item.get("children1");
//     if (children) {
//       children.map((child, _childId) => {
//         _processNode(child, itemPath);
//       });
//     }
//   }

//   _processNode(tree, new Immutable.List());

//   return newTree;
// };


/**
 * Remove `isLocked` in items that inherit parent's `isLocked`
 * @param {Immutable.Map} tree
 * @return {Immutable.Map} tree
 */
export const removeIsLockedInTree = (tree) => {
  let newTree = tree;

  function _processNode (item, path, isParentLocked = false) {
    const itemPath = path.push(item.get("id"));
    const isLocked = item.getIn(["properties", "isLocked"]);
    if (isParentLocked && isLocked) {
      newTree = newTree.deleteIn(expandTreePath(itemPath, "properties", "isLocked"));
    }

    const children = item.get("children1");
    if (children) {
      children.map((child, _childId) => {
        _processNode(child, itemPath, isLocked || isParentLocked);
      });
    }
  }

  _processNode(tree, new Immutable.List());

  return newTree;
};


/**
 * Set correct `path` and `id` in every item
 * @param {Immutable.Map} tree
 * @return {Immutable.Map} tree
 */
export const fixPathsInTree = (tree) => {
  let newTree = tree;

  function _processNode (item, path, lev, nodeId) {
    if (!item) return;
    const currPath = item.get("path");
    const currId = item.get("id");
    const itemId = currId || nodeId || uuid();
    const itemPath = path.push(itemId);
    if (!currPath || !currPath.equals(itemPath)) {
      newTree = newTree.setIn(expandTreePath(itemPath, "path"), itemPath);
    }
    if (!currId) {
      newTree = newTree.setIn(expandTreePath(itemPath, "id"), itemId);
    }

    const children = item.get("children1");
    if (children) {
      if (children.constructor.name === "Map") {
        // protect: should be OrderedMap, not Map (issue #501)
        newTree = newTree.setIn(
          expandTreePath(itemPath, "children1"), 
          new Immutable.OrderedMap(children)
        );
      }
      children.map((child, childId) => {
        _processNode(child, itemPath, lev + 1, childId);
      });
    }
  }

  _processNode(tree, new Immutable.List(), 0);


  return newTree;
};

export const fixEmptyGroupsInTree = (tree) => {
  let newTree = tree;

  function _processNode (item, path, lev, nodeId) {
    if (!item) return false;
    const itemId = item.get("id") || nodeId;
    const itemPath = path.push(itemId);

    const children = item.get("children1");
    if (children) {
      const allChildrenGone = children.map((child, childId) => {
        return _processNode(child, itemPath, lev + 1, childId);
      }).reduce((curr, v) => (curr && v), true);
      if ((children.size == 0 || allChildrenGone) && lev > 0) {
        newTree = newTree.deleteIn(expandTreePath(itemPath));
        return true;
      }
    }
    return false;
  }

  _processNode(tree, new Immutable.List(), 0);


  return newTree;
};

/**
 * @param {Immutable.Map} tree
 * @return {Object} {flat, items}
 */
export const getFlatTree = (tree) => {
  let flat = [];
  let items = {};
  let cases = [];
  let visibleHeight = 0; // number of non-collapsed nodes
  let globalLeafCount = 0;
  let globalAtomicCount = 0;
  let globalGroupCount = 0;
  let globalCountByType = {};
  // rule_group_ext can be counted as group  (group #x)
  // or by similars (rule-group #x) (NOT both _ext and no ext)

  function _flatizeTree (
    item, path, insideCollapsed, insideLocked, insideRuleGroup, lev, caseId, childNo
  ) {
    const isRoot = item === tree;
    const type = item.get("type");
    const collapsed = item.get("collapsed");
    const id = item.get("id");
    const children = item.get("children1");
    const isLocked = item.getIn(["properties", "isLocked"]);
    const childrenIds = children ? children.map((_child, childId) => childId).valueSeq().toArray() : null;
    const isRuleGroup = type === "rule_group";
    const isRule = type === "rule";
    const isGroup = type === "group";
    const isCaseGroup = type === "case_group";
    // tip: count rule_group as 1 atomic rule
    const isAtomicRule = !insideRuleGroup && (!children || isRuleGroup);
    const hasChildren = childrenIds?.length > 0;
    const parentId = path.length ? path[path.length-1] : null;
    const closestRuleGroupId = [...path].reverse().find(id => items[id].type == "rule_group");
    const currentCaseId = isCaseGroup ? id : caseId;

    // Calculations before
    if (isCaseGroup) {
      cases.push(id);
      // reset counters
      globalLeafCount = 0;
      globalAtomicCount = 0;
      globalGroupCount = 0;
      globalCountByType = {};
    }
    const caseNo = currentCaseId ? cases.indexOf(currentCaseId) : null;
    const itemsBefore = flat.length;
    const top = visibleHeight;

    let position;
    if (!isRoot) {
      position = {};
      position.caseNo = caseNo;
      position.globalNoByType = isCaseGroup ? caseNo : globalCountByType[type] || 0;
      position.indexPath = [ ...path.slice(1).map(id => items[id].childNo), childNo ];
      if (isRule) {
        position.globalLeafNo = globalLeafCount;
      } else if (isGroup) {
        position.globalGroupNo = globalGroupCount;
      }
    }

    flat.push(id);
    items[id] = {
      node: item,
      index: itemsBefore, // index in `flat`
      id: id,
      type: type,
      parent: parentId,
      parentType: parentId ? items[parentId].type : null,
      children: childrenIds,
      childNo,
      caseId: currentCaseId,
      caseNo,
      closestRuleGroupId,
      path: path.concat(id),
      lev: lev, // depth level (0 for root node)
      isLeaf: !children, // is atomic rule OR rule inside rule_group
      isAtomicRule, // is atomic (rule or rule_group, but not rules inside rule_group)
      isLocked: isLocked || insideLocked,
      // vertical
      top: (insideCollapsed ? null : top),
      // for case
      isDefaultCase: isCaseGroup ? !children : undefined,
      atomicRulesCountInCase: isCaseGroup ? 0 : undefined,
      // object with numbers indicating # of item in tree
      position,
      // unused
      collapsed: collapsed,
      _top: itemsBefore,
      // @deprecated use isLeaf instead
      leaf: !children,

      // will be added later:
      //  prev
      //  next
      //  depth  - for any group (children of rule_group are not counted, collapsed are not counted)
      //  height  - visible height
      //  bottom = (insideCollapsed ? null : top + height)
      //  _height = (itemsAfter - itemsBefore)  - real height (incl. collapsed)
    };

    // Calculations before traversing children
    let height = 0;
    let depth = 0;
    if (!insideCollapsed) {
      visibleHeight += 1;
      height += 1;
      if (hasChildren && !collapsed && !isRuleGroup) {
        // tip: don't count children of rule_group
        depth += 1;
      }
      if (!isRoot && !isCaseGroup) {
        isGroup && globalGroupCount++;
        isAtomicRule && globalAtomicCount++;
        isRule && globalLeafCount++;
        globalCountByType[type] = (globalCountByType[type] || 0) + 1;
      }
    }
    if (caseId && isAtomicRule) {
      items[caseId].atomicRulesCountInCase++;
    }

    // Traverse children deeply
    let maxChildDepth = 0;
    let sumHeight = 0;
    if (hasChildren) {
      let childCount = 0;
      children.map((child, childId) => {
        if (child) {
          _flatizeTree(
            child, 
            path.concat(id), 
            insideCollapsed || collapsed, insideLocked || isLocked, insideRuleGroup || isRuleGroup,
            lev + 1, currentCaseId, childCount
          );
          const childItem = items[childId];
          // Calculations after deep traversing 1 child
          maxChildDepth = Math.max(maxChildDepth, childItem.depth || 0);
          sumHeight += childItem.height;
          childCount++;
        }
      });
    }

    // Calculations after deep traversing ALL children
    height += sumHeight;
    depth += maxChildDepth;
    const itemsAfter = flat.length;
    const _height = itemsAfter - itemsBefore;
    const bottom = (insideCollapsed ? null : top + height);

    Object.assign(items[id], {
      depth: children ? depth : undefined,
      _height,
      height,
      bottom,
    });
  }

  // Start recursion
  _flatizeTree(tree, [], false, false, false, 0, null, null);

  // Calc after recursion
  for (let i = 0 ; i < flat.length ; i++) {
    const prevId = i > 0 ? flat[i-1] : null;
    const nextId = i < (flat.length-1) ? flat[i+1] : null;
    let item = items[flat[i]];
    item.prev = prevId;
    item.next = nextId;
  }

  return {flat, items, cases};
};


/**
 * Returns count of reorderable(!) nodes
 * @param {Immutable.Map} tree
 * @return {Integer}
 */
export const getTotalReordableNodesCountInTree = (tree) => {
  if (!tree)
    return -1;
  let cnt = 0;

  function _processNode (item, path, lev) {
    let id, children, type;
    if (typeof item.get === "function") {
      id = item.get("id");
      children = item.get("children1");
      type = item.get("type");
    } else {
      id = item.id;
      children = item.children1;
      type = item.type;
    }
    const isRuleGroup = type == "rule_group";
    cnt++;
    //tip: rules in rule-group can be reordered only inside
    if (children && !isRuleGroup) {
      children.map((child, _childId) => {
        if (child) {
          _processNode(child, path.concat(id), lev + 1);
        }
      });
    }
  }

  _processNode(tree, [], 0);
    
  return cnt - 1; // -1 for root
};

/**
 * Returns count of atomic rules (i.e. don't count groups; count rule_group as 1 atomic rule)
 * @param {Immutable.Map} tree
 * @return {Integer}
 */
export const getTotalRulesCountInTree = (tree) => {
  if (!tree)
    return -1;
  let cnt = 0;

  function _processNode (item, path, lev) {
    let id, children, type;
    if (typeof item.get === "function") {
      id = item.get("id");
      children = item.get("children1");
      type = item.get("type");
    } else {
      id = item.id;
      children = item.children1;
      type = item.type;
    }
    
    if (type == "rule" || type == "rule_group") {
      // tip: count rule_group as 1 rule
      cnt++;
    } else if (children) {
      children.map((child, _childId) => {
        if (child) {
          _processNode(child, path.concat(id), lev + 1);
        }
      });
    }
  }

  _processNode(tree, [], 0);
    
  return cnt;
};


// Remove fields that can be calced: "id", "path"
// Remove empty fields: "operatorOptions"
export const getLightTree = (tree, deleteExcess = true, children1AsArray = true) => {
  let newTree = tree;

  function _processNode (item, itemId) {
    if (deleteExcess && item.path) {
      delete item.path;
    }
    if (deleteExcess && !children1AsArray && itemId) {
      delete item.id;
    }
    let properties = item.properties;
    if (properties) {
      if (properties.operatorOptions == null) {
        delete properties.operatorOptions;
      }
    }

    const children = item.children1;
    if (children) {
      for (let id in children) {
        if (children[id]) {
          _processNode(children[id], id);
        }
      }
      if (children1AsArray) {
        item.children1 = Object.values(children);
      }
    }
  }

  _processNode(tree, null);

  return newTree;
};

export const getSwitchValues = (tree) => {
  let vals = [];
  const children = tree.get("children1");
  if (children) {
    children.map((child) => {
      const value = child.getIn(["properties", "value"]);
      let caseValue;
      if (value && value.size == 1) {
        caseValue = value.get(0);
        if (Array.isArray(caseValue) && caseValue.length == 0) {
          caseValue = null;
        }
      } else {
        caseValue = null;
      }
      vals = [...vals, caseValue];
    });
  }

  return vals;
};

export const isEmptyTree = (tree) => (!tree.get("children1") || tree.get("children1").size == 0);

export const hasChildren = (tree, path) => tree.getIn(expandTreePath(path, "children1")).size > 0;


export const _fixImmutableValue = (v) => {
  if (v?.toJS) {
    const vJs = v?.toJS?.();
    if (vJs?.func) {
      // `v` is a func, keep Immutable
      return v.toOrderedMap();
    } else {
      // for values of multiselect use Array instead of List
      return vJs;
    }
  } else {
    return v;
  }
};
