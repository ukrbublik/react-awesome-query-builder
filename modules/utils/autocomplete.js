import {listValuesToArray, sleep} from "./stuff";

export const simulateAsyncFetch = (all, pageSize = 0, delay = 1000) => async (search, offset, _meta) => {
  const filtered = listValuesToArray(all)
    .filter(({title}) => search == null ? true : title.indexOf(search) != -1);
  const pages = pageSize ? Math.ceil(filtered.length / pageSize) : 0;
  const currentOffset = offset || 0;
  const currentPage = pageSize ? Math.ceil(currentOffset / pageSize) : null;
  const values = pageSize ? filtered.slice(currentOffset, currentOffset + pageSize) : filtered;
  const newOffset = pageSize ? currentOffset + values.length : null;
  const hasMore = pageSize ? (newOffset < filtered.length) : false;
  // console.debug('simulateAsyncFetch', {
  //   search, offset, values, hasMore, filtered
  // });
  await sleep(delay);
  return {
    values,
    hasMore
  };
};
