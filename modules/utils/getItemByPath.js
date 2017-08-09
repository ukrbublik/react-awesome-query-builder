import Immutable from 'immutable';

/**
 * @param {Immutable.Map} path
 * @param {Immutable.List} path
 */
export default (tree, path) => {
	let children = new Immutable.OrderedMap({ [tree.get('id')] : tree });
	let res = tree;
	path.forEach((id) => {
		res = children.get(id);
		children = res.get('children1');
	});
	return res;
};
