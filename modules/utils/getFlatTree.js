
const getFlatTree = (tree) => {

    let flat = [];
    let items = {};
    let realHeight = 0;

    function _flatizeTree (item, parentItemId, insideCollapsed, lev, info) {
        const type = item.get('type');
        const collapsed = item.get('collapsed');
        const id = item.get('id');
        const children = item.get('children1');
        const childrenIds = children ? children.map((child, childId) => childId) : null;

        let itemsBefore = flat.length;
        let top = realHeight;
        flat.push(id);
        if (!insideCollapsed)
            realHeight += 1;
        info.height = (info.height || 0) + 1;
        if (children) {
            let subinfo = {};
            children.map((child, childId) => {
                _flatizeTree(child, id, insideCollapsed || collapsed, lev + 1, subinfo);
            });
            if (!collapsed) {
                info.height = (info.height || 0) + subinfo.height;
            }
        }
        let itemsAfter = flat.length;
        let bottom = realHeight;
        let height = info.height;

        items[id] = {
            type: type,
            parent: parentItemId,
            lev: lev,
            leaf: !children,
            index: flat.length,
            id: id,
            children: childrenIds,
            _top: itemsBefore,
            _height: (itemsAfter - itemsBefore),
            top: (insideCollapsed ? null : top),
            height: height,
        };
    }

    _flatizeTree(tree, null, false, 0, {});

    for (let i = 0 ; i < flat.length ; i++) {
        let prevId = i > 0 ? flat[i-1] : null;
        let nextId = i < (flat.length-1) ? flat[i+1] : null;
        let item = items[flat[i]];
        item.prev = prevId;
        item.next = nextId;
    }

    return {flat, items};
};

export default getFlatTree;

