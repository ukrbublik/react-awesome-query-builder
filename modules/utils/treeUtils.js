import Immutable, { fromJS, Map } from 'immutable';
const transit = require('transit-immutable-js');
import {validateTree} from "./validation";
import {extendConfig} from "./configUtils";


/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 * @return {Immutable.List}
 */
export const expandTreePath = (path, ...suffix) =>
  path.interpose('children1').withMutations((list) => {
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
  path.interpose('children1').withMutations((list) => {
    list.push.apply(list, suffix);
    return list;
  });


/**
 * @param {Immutable.Map} path
 * @param {Immutable.List} path
 * @return {Immutable.Map}
 */
export const getItemByPath = (tree, path) => {
    let children = new Immutable.OrderedMap({ [tree.get('id')] : tree });
    let res = tree;
    path.forEach((id) => {
        res = children.get(id);
        children = res.get('children1');
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
        const itemPath = path.push(item.get('id'));
        if (item.get('path')) {
          newTree = newTree.removeIn(expandTreePath(itemPath, 'path'))
        }

        const children = item.get('children1');
        if (children) {
            children.map((child, _childId) => {
                _processNode(child, itemPath);
            });
        }
    };

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
        const _id = item.get('id');
        const itemPath = path.push(item.get('id'));
        const currItemPath = item.get('path');
        if (!currItemPath || !currItemPath.equals(itemPath)) {
          newTree = newTree.setIn(expandTreePath(itemPath, 'path'), itemPath)
        }

        const children = item.get('children1');
        if (children) {
            children.map((child, _childId) => {
                _processNode(child, itemPath, lev + 1);
            });
        }
    };

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

    function _flatizeTree (item, path, insideCollapsed, lev, info) {
        const type = item.get('type');
        const collapsed = item.get('collapsed');
        const id = item.get('id');
        const children = item.get('children1');
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
                _flatizeTree(child, path.concat(id), insideCollapsed || collapsed, lev + 1, subinfo);
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

    _flatizeTree(tree, [], false, 0, {});

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
 * @param {Immutable.Map} tree
 * @return {Integer}
 */
export const getTotalNodesCountInTree = (tree) => {
    if (!tree)
        return -1;
    let cnt = 0;

    function _processNode (item, path, lev) {
        const id = item.get('id');
        const children = item.get('children1');
        cnt++;
        if (children) {
            children.map((child, childId) => {
                _processNode(child, path.concat(id), lev + 1);
            });
        }
    };

    _processNode(tree, [], 0);

    return cnt;
};


//----------


export const getTree = (immutableTree, light = true) => {
    let tree = immutableTree;
    tree = tree.toJS();
    if (light)
      tree = _lightTree(tree);
    return tree;
};
  
export const loadTree = (serTree) => {
    if (Map.isMap(serTree)) {
        return serTree;
    } else if (typeof serTree == "object") {
        return _fromJS(serTree);
    } else if (typeof serTree == "string" && serTree.startsWith('["~#iM"')) {
        //tip: old versions of RAQB were saving tree with `transit.toJSON()`
        // https://github.com/ukrbublik/react-awesome-query-builder/issues/69
        return transit.fromJSON(serTree);
    } else if (typeof serTree == "string") {
        return _fromJS(JSON.parse(serTree));
    } else throw "Can't load tree!";
};

export const checkTree = (tree, config) => {
    const extendedConfig = extendConfig(config);
    return validateTree(tree, null, extendedConfig, extendedConfig, true, true);
}
  
function _fromJS(tree) {
    return fromJS(tree, function (key, value) {
        let outValue;
        if (key == 'value' && value.get(0) && value.get(0).toJS !== undefined) {
            const valueJs = value.get(0).toJS();
            if (valueJs.func) {
                outValue = value.toOrderedMap();
            } else {
                // only for raw values keep JS representation
                outValue = Immutable.List.of(valueJs);
            }
        } else
            outValue = Immutable.Iterable.isIndexed(value) ? value.toList() : value.toOrderedMap();
        return outValue;
    });
};


// Remove fields that can be calced: "id", "path"
// Remove empty fields: "operatorOptions"
function _lightTree (tree) {
    let newTree = tree;

    function _processNode (item, itemId) {
        if (item.path)
            delete item.path;
        if (itemId)
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
        }
    };

    _processNode(tree, null);

    return newTree;
};