/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 */
export default (path, ...suffix) =>
  path.interpose('children').withMutations((list) => {
    list.skip(1);
    list.push.apply(list, suffix);
    return list;
  });
