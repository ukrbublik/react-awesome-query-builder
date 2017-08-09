/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 */
export default (path, ...suffix) =>
  path.interpose('children1').withMutations((list) => {
    list.push.apply(list, suffix);
    return list;
  });
