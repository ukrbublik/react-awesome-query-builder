import {sleep} from "./stuff";
import {listValuesToArray, getListValue, makeCustomListValue} from "./listValues";

// simple polyfill for Next
const findLastIndex = (arr, fn) => {
  if (arr.findLastIndex) {
    return arr.findLastIndex(fn);
  } else {
    const ind = [...arr].reverse().findIndex(fn);
    return ind == -1 ? -1 : (arr.length-1 - ind);
  }
};

export const simulateAsyncFetch = (all, cPageSize = 0, delay = 1000) => async (search, offset, meta) => {
  const pageSize = meta?.pageSize != undefined ? meta.pageSize : cPageSize;
  const filtered = listValuesToArray(all)
    .filter(({title, value}) => search == null ? true : (
      title.toUpperCase().indexOf(search.toUpperCase()) != -1
      || `${value}`.toUpperCase().indexOf(search.toUpperCase()) != -1
    ));
  const pages = pageSize ? Math.ceil(filtered.length / pageSize) : 0;
  const currentOffset = offset || 0;
  const currentPage = pageSize ? Math.ceil(currentOffset / pageSize) : null;
  const values = pageSize ? filtered.slice(currentOffset, currentOffset + pageSize) : filtered;
  const newOffset = pageSize ? currentOffset + values.length : null;
  const hasMore = pageSize ? (newOffset < filtered.length) : false;
  if (delay) {
    // console.debug("simulateAsyncFetch", {
    //   search, offset, values, hasMore, filtered
    // });
    await sleep(delay);
  }
  return {
    values,
    hasMore
  };
};

export const mergeListValues = (values, newValues, toStart = false, hideNewValues = false) => {
  if (!newValues)
    return values;
  const old = values || [];
  const newFiltered = newValues
    .filter(v => old.find(av => ""+av.value == ""+v.value) == undefined)
    .map(v => (hideNewValues ? {...v, isHidden: true} : v));
  const merged = toStart ? [...newFiltered, ...old] : [...old, ...newFiltered];
  return merged;
};

export const optionToListValue = (val, listValues, allowCustomValues) => {
  const v = val == null || val == "" ? undefined : (val?.value ?? val);
  const item = getListValue(v, listValues);
  const customItem = allowCustomValues && !item ? makeCustomListValue(v) : undefined;
  const listValue = item || customItem;
  const lvs = listValue ? [listValue] : undefined; //not allow []
  return [v, lvs];
};

export const optionsToListValues = (vals, listValues, allowCustomValues) => {
  const newSelectedListValues = vals.map((val, _i) => {
    const v = val == null || val == "" ? undefined : (val?.value ?? val);
    const item = getListValue(v, listValues);
    const customItem = allowCustomValues && !item ? makeCustomListValue(v) : undefined;
    const listValue = item || customItem;
    return listValue;
  }).filter(o => o != undefined);
  let newSelectedValues = newSelectedListValues
    .map(o => (o?.value ?? o));
  if (!newSelectedValues.length)
    newSelectedValues = undefined; //not allow []
  return [newSelectedValues, newSelectedListValues];
};

export const listValueToOption = (lv) => {
  if (lv == null) return null;
  const {title, value, disabled, groupTitle, renderTitle, children, label, isCustom, isHidden} = lv;
  let option = {
    value,
    title: title || label || children, // fix issue #930 for AntD
  };
  if (disabled)
    option.disabled = disabled;
  if (isCustom)
    option.isCustom = isCustom;
  if (isHidden)
    option.isHidden = isHidden;
  // group
  if (groupTitle)
    option.groupTitle = groupTitle;
  // used only for MUI field autocomplete (if matchesType, render as bold)
  if (renderTitle)
    option.renderTitle = renderTitle;
  return option;
};

export const fixListValuesGroupOrder = (listValues) => {
  let newValues = [];
  let groupTitles = [];
  for (let lv of listValues) {
    const i = findLastIndex(newValues, lv1 => {
      return (lv1.groupTitle ?? "") == (lv.groupTitle ?? "");
    });
    if (lv.groupTitle != undefined && !groupTitles.includes(lv.groupTitle)) {
      groupTitles.push(lv.groupTitle);
      if (groupTitles.length === 1) {
        // fix empty groupTitles
        newValues = newValues.map(nv => ({...nv, groupTitle: ""}));
      }
    }
    if (lv.groupTitle == undefined && groupTitles.length) {
      // fix empty groupTitle
      lv = {...lv, groupTitle: ""};
    }
    if (i != -1) {
      newValues.splice(i+1, 0, lv);
    } else {
      newValues.push(lv);
    }
  }
  return newValues;
};


export { getListValue };
