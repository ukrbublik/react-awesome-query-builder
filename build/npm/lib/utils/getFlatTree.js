'use strict';

exports.__esModule = true;

var getFlatTree = function getFlatTree(tree) {

    var flat = [];
    var items = {};
    var realHeight = 0;

    function _flatizeTree(item, parentItemId, insideCollapsed, lev, info) {
        var type = item.get('type');
        var collapsed = item.get('collapsed');
        var id = item.get('id');
        var children = item.get('children1');
        var childrenIds = children ? children.map(function (child, childId) {
            return childId;
        }) : null;

        var itemsBefore = flat.length;
        var top = realHeight;
        flat.push(id);
        if (!insideCollapsed) realHeight += 1;
        info.height = (info.height || 0) + 1;
        if (children) {
            var subinfo = {};
            children.map(function (child, childId) {
                _flatizeTree(child, id, insideCollapsed || collapsed, lev + 1, subinfo);
            });
            if (!collapsed) {
                info.height = (info.height || 0) + subinfo.height;
            }
        }
        var itemsAfter = flat.length;
        var bottom = realHeight;
        var height = info.height;

        items[id] = {
            type: type,
            parent: parentItemId,
            lev: lev,
            leaf: !children,
            index: flat.length,
            id: id,
            children: childrenIds,
            _top: itemsBefore,
            _height: itemsAfter - itemsBefore,
            top: insideCollapsed ? null : top,
            height: height
        };
    }

    _flatizeTree(tree, null, false, 0, {});

    for (var i = 0; i < flat.length; i++) {
        var prevId = i > 0 ? flat[i - 1] : null;
        var nextId = i < flat.length - 1 ? flat[i + 1] : null;
        var item = items[flat[i]];
        item.prev = prevId;
        item.next = nextId;
    }

    return { flat: flat, items: items };
};

exports.default = getFlatTree;