
const getFlatTree = (tree) => {

    function _flatizeTree (item, parentItemId, lev, flat, items) {
        const type = item.get('type');
        const id = item.get('id');
        const children = item.get('children1');
        const childrenIds = children ? children.map((child, childId) => childId) : null;

        let itemsBefore = flat.length;
        flat.push(id);
        if (children) {
            children.map((child, childId) => {
                _flatizeTree(child, id, lev + 1, flat, items);
            });
        }
        let itemsAfter = flat.length;

        items[id] = {
            type: type,
            parent: parentItemId,
            lev: lev,
            leaf: !children,
            index: flat.length,
            id: id,
            children: childrenIds,
            top: itemsBefore,
            bottom: itemsAfter,
        };
    }

    let flat = [];
    let items = {};
    _flatizeTree(tree, null, 0, flat, items);

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

