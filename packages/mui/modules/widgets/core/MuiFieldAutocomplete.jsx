import React from "react";
import MuiAutocomplete from "../value/MuiAutocomplete";


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
  const value = selectedKey;
  const setValue = (value, _asyncValues) => {
    if (!value) return undefined;
    return setField(value);
  };

  return {
    ...rest,
    listValues,
    setValue,
    filterOptionsConfig,
    allowCustomValues: false,
    multiple: false,
    value,
  };
};

export default (props) => {
  return <MuiAutocomplete  {...fieldAdapter(props)} />;
};
