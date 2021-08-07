import {listValuesToArray, sleep, mapListValues} from "./stuff";

export const simulateAsyncFetch = (all, pageSize = 0, delay = 1000) => async (search, offset, _meta) => {
  const filtered = listValuesToArray(all)
    .filter(({title}) => search == null ? true : title.toUpperCase().indexOf(search.toUpperCase()) != -1);
  const pages = pageSize ? Math.ceil(filtered.length / pageSize) : 0;
  const currentOffset = offset || 0;
  const currentPage = pageSize ? Math.ceil(currentOffset / pageSize) : null;
  const values = pageSize ? filtered.slice(currentOffset, currentOffset + pageSize) : filtered;
  const newOffset = pageSize ? currentOffset + values.length : null;
  const hasMore = pageSize ? (newOffset < filtered.length) : false;
  console.debug('simulateAsyncFetch', {
    search, offset, values, hasMore, filtered
  });
  await sleep(delay);
  return {
    values,
    hasMore
  };
};

export const mergeListValues = (values, newValues, toStart = false) => {
  if (!newValues)
    return values;
  const old = values || [];
  const newFiltered = newValues.filter(v => old.find(av => av.value == v.value) == undefined);
  const merged = toStart ? [...newFiltered, ...old] : [...old, ...newFiltered];
  return merged;
};

export const listValueToOption = (lv) => {
  if (lv == null) return null;
  const {title, value} = lv;
  return {title, value};
};

export const getListValue = (selectedValue, listValues) => 
  mapListValues(listValues, (lv) => (lv.value === selectedValue ? lv : null))
  .filter(v => v !== null)
  .shift();
