import Immutable  from "immutable";

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
 * @param {Immutable.Map} path
 * @param {Immutable.List} path
 * @return {Immutable.Map}
 */
export const getItemByPath = (tree, path) => {
  let children = new Immutable.OrderedMap({ [tree.get("id")] : tree });
  let res = tree;
  path.forEach((id) => {
    res = children.get(id);
    children = res.get("children1");
  });
  return res;
};


/**
 * Remove `path` in every item
 * @param {Immutable.Map} tree
 * @return {Immutable.Map} tree
 */
export const removePathsInTree = (tree) => {
  let newTree = tree;

  function _processNode (item, path) {
    const itemPath = path.push(item.get("id"));
    if (item.get("path")) {
      newTree = newTree.removeIn(expandTreePath(itemPath, "path"));
    }

    const children = item.get("children1");
    if (children) {
      children.map((child, _childId) => {
        _processNode(child, itemPath);
      });
    }
  }

  _processNode(tree, new Immutable.List());

  return newTree;
};


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
    const itemId = currId || nodeId;
    const itemPath = path.push(itemId);
    if (!currPath || !currPath.equals(itemPath)) {
      newTree = newTree.setIn(expandTreePath(itemPath, "path"), itemPath);
    }
    if (!currId) {
      newTree = newTree.setIn(expandTreePath(itemPath, "id"), itemId);
    }

    const children = item.get("children1");
    if (children) {
      if (children.constructor.name == "Map") {
        // protect: should me OrderedMap, not Map (issue #501)
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
  let realHeight = 0;

  function _flatizeTree (item, path, insideCollapsed, insideLocked, insideRuleGroup, lev, info, parentType, caseId) {
    const type = item.get("type");
    const collapsed = item.get("collapsed");
    const id = item.get("id");
    const children = item.get("children1");
    const isLocked = item.getIn(["properties", "isLocked"]);
    const childrenIds = children ? children.map((_child, childId) => childId) : null;
    const isRuleGroup = type == "rule_group";
    // tip: count rule_group as 1 rule
    const isLeaf = !insideRuleGroup && (!children || isRuleGroup);

    const itemsBefore = flat.length;
    const top = realHeight;
    flat.push(id);
    if (!insideCollapsed)
      realHeight += 1;
    info.height = (info.height || 0) + 1;

    items[id] = {
      type: type,
      parent: path.length ? path[path.length-1] : null,
      parentType: parentType,
      caseId: type == "case_group" ? id : caseId,
      isDefaultCase: type == "case_group" && !children,
      path: path.concat(id),
      lev: lev,
      leaf: !children,
      index: itemsBefore,
      id: id,
      children: childrenIds,
      leafsCount: 0,
      _top: itemsBefore,
      //_height: (itemsAfter - itemsBefore),
      top: (insideCollapsed ? null : top),
      //height: height,
      //bottom: (insideCollapsed ? null : top) + height,
      collapsed: collapsed,
      node: item,
      isLocked: isLocked || insideLocked,
    };

    if (children) {
      let subinfo = {};
      children.map((child, _childId) => {
        _flatizeTree(
          child, path.concat(id), 
          insideCollapsed || collapsed, insideLocked || isLocked, insideRuleGroup || isRuleGroup,
          lev + 1, subinfo, type, type == "case_group" ? id : caseId
        );
      });
      if (!collapsed) {
        info.height = (info.height || 0) + (subinfo.height || 0);
      }
    }
    
    if (caseId && isLeaf) {
      items[caseId].leafsCount++;
    }

    const itemsAfter = flat.length;
    const _bottom = realHeight;
    const height = info.height;
        
    Object.assign(items[id], {
      _height: (itemsAfter - itemsBefore),
      height: height,
      bottom: (insideCollapsed ? null : top) + height,
    });
  }

  _flatizeTree(tree, [], false, false, false, 0, {}, null, null);

  for (let i = 0 ; i < flat.length ; i++) {
    const prevId = i > 0 ? flat[i-1] : null;
    const nextId = i < (flat.length-1) ? flat[i+1] : null;
    let item = items[flat[i]];
    item.prev = prevId;
    item.next = nextId;
  }

  return {flat, items};
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
        _processNode(child, path.concat(id), lev + 1);
      });
    }
  }

  _processNode(tree, [], 0);
    
  return cnt - 1; // -1 for root
};

/**
 * Returns count of rules (leafs, i.e. don't count groups)
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
        _processNode(child, path.concat(id), lev + 1);
      });
    }
  }

  _processNode(tree, [], 0);
    
  return cnt;
};

export const getTreeBadFields = (tree) => {
  let badFields = [];

  function _processNode (item, path, lev) {
    const id = item.get("id");
    const children = item.get("children1");
    const valueError = item.getIn(["properties", "valueError"]);
    const field = item.getIn(["properties", "field"]);
    if (valueError && valueError.size > 0 && valueError.filter(v => v != null).size > 0) {
      badFields.push(field);
    }
    if (children) {
      children.map((child, _childId) => {
        _processNode(child, path.concat(id), lev + 1);
      });
    }
  }

  if (tree)
    _processNode(tree, [], 0);
    
  return Array.from(new Set(badFields));
};


// Remove fields that can be calced: "id", "path"
// Remove empty fields: "operatorOptions"
export const getLightTree = (tree, children1AsArray = false) => {
  let newTree = tree;

  function _processNode (item, itemId) {
    if (item.path)
      delete item.path;
    if (!children1AsArray && itemId)
      delete item.id;
    let properties = item.properties;
    if (properties) {
      if (properties.operatorOptions == null)
        delete properties.operatorOptions;
    }

    const children = item.children1;
    if (children) {
      for (let id in children) {
        _processNode(children[id], id);
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
