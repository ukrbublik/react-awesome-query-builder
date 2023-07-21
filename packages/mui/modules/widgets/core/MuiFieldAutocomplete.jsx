import React from "react";
import MuiAutocomplete from "../value/MuiAutocomplete";

// simple polyfill for Next
const findLastIndex = (arr, fn) => {
  if (arr.findLastIndex) {
    return arr.findLastIndex(fn);
  } else {
    const ind = arr.reverse().findIndex(fn);
    return ind == -1 ? -1 : (arr.length-1 - ind);
  }
};

const itemsToListValues = (items, level = 0) => (
  items.map(item => {
    const {items, path, label, disabled, grouplabel, matchesType} = item;
    const prefix = "\u00A0\u00A0".repeat(level);
    if (items) {
      return itemsToListValues(items, level+1);
    } else {
      return {
        title: label,
        renderTitle: matchesType ? <b>{prefix+label}</b> : prefix+label,
        value: path,
        disabled,
        groupTitle: level > 0 ? prefix+grouplabel : null,
      };
    }
  }).flat(Infinity)
);

const groupBy = (option) => option?.groupTitle;

const fixGroupBy = (listValues) => {
  let newValues = [];
  for (const lv of listValues) {
    const i = findLastIndex(newValues, lv1 => groupBy(lv1) === groupBy(lv));
    if (i != -1) {
      newValues.splice(i+1, 0, lv);
    } else {
      newValues.push(lv);
    }
  }
  return newValues;
};

const filterOptionsConfig = {
  stringify: (option) => {
    const keysForFilter = ["title", "value", "grouplabel", "label"];
    const valueForFilter = keysForFilter
      .map(k => (typeof option[k] == "string" ? option[k] : ""))
      .join("\0");
    return valueForFilter;
  }
};

const fieldAdapter = ({items, selectedKey, setField, ...rest}) => {
  const listValues = itemsToListValues(items);
  const fixedListValues = fixGroupBy(listValues);
  const value = selectedKey;
  const setValue = (value, _asyncValues) => {
    if (!value) return undefined;
    return setField(value);
  };

  return {
    ...rest,
    listValues: fixedListValues,
    setValue,
    groupBy,
    filterOptionsConfig,
    allowCustomValues: false,
    multiple: false,
    value,
  };
};

export default (props) => {
  return <MuiAutocomplete  {...fieldAdapter(props)} />;
};
