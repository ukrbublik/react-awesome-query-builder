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
 * Set correct `path` in every item
 * @param {Immutable.Map} tree
 * @return {Immutable.Map} tree
 */
export const fixPathsInTree = (tree) => {
  let newTree = tree;

  function _processNode (item, path, lev) {
    const _id = item.get("id");
    const itemPath = path.push(item.get("id"));
    const currItemPath = item.get("path");
    if (!currItemPath || !currItemPath.equals(itemPath)) {
      newTree = newTree.setIn(expandTreePath(itemPath, "path"), itemPath);
    }

    const children = item.get("children1");
    if (children) {
      children.map((child, _childId) => {
        _processNode(child, itemPath, lev + 1);
      });
    }
  }

  _processNode(tree, new Immutable.List(), 0);


  return newTree;
};

export const fixEmptyGroupsInTree = (tree) => {
  let newTree = tree;

  function _processNode (item, path, lev) {
    const id = item.get("id");
    const itemPath = path.push(item.get("id"));

    const children = item.get("children1");
    if (children) {
      children.map((child, _childId) => {
        _processNode(child, itemPath, lev + 1);
      });
      if (children.size == 0) {
        newTree = newTree.deleteIn(expandTreePath(itemPath));
        return;
      }
    }
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

  function _flatizeTree (item, path, insideCollapsed, lev, info, parentType) {
    const type = item.get("type");
    const collapsed = item.get("collapsed");
    const id = item.get("id");
    const children = item.get("children1");
    const childrenIds = children ? children.map((_child, childId) => childId) : null;

    const itemsBefore = flat.length;
    const top = realHeight;
    flat.push(id);
    if (!insideCollapsed)
      realHeight += 1;
    info.height = (info.height || 0) + 1;
    if (children) {
      let subinfo = {};
      children.map((child, _childId) => {
        _flatizeTree(child, path.concat(id), insideCollapsed || collapsed, lev + 1, subinfo, type);
      });
      if (!collapsed) {
        info.height = (info.height || 0) + (subinfo.height || 0);
      }
    }
    const itemsAfter = flat.length;
    const _bottom = realHeight;
    const height = info.height;
        
    items[id] = {
      type: type,
      parent: path.length ? path[path.length-1] : null,
      parentType: parentType,
      path: path.concat(id),
      lev: lev,
      leaf: !children,
      index: itemsBefore,
      id: id,
      children: childrenIds,
      _top: itemsBefore,
      _height: (itemsAfter - itemsBefore),
      top: (insideCollapsed ? null : top),
      height: height,
      bottom: (insideCollapsed ? null : top) + height,
      collapsed: collapsed,
      node: item,
    };
  }

  _flatizeTree(tree, [], false, 0, {}, null);

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
    const id = item.get("id");
    const children = item.get("children1");
    const isRuleGroup = item.get("type") == "rule_group";
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
    const id = item.get("id");
    const children = item.get("children1");
    const isGroup = item.get("type") == "group";
    //const isRuleGroup = item.get("type") == "rule_group";
    if (children && isGroup) {
      children.map((child, _childId) => {
        _processNode(child, path.concat(id), lev + 1);
      });
    } else {
      // tip: count rule_group as 1 rule
      cnt++;
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