import React from "react";
import MaterialAutocomplete from "../value/MaterialAutocomplete";


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

const fieldAdapter = ({items, selectedKey, setField, isValueField, ...rest}) => {
  const listValues = itemsToListValues(items);
  const value = selectedKey;
  const setValue = (value, _asyncValues) => {
    if (!value && !isValueField) return undefined;
    return setField(value);
  };

  return {
    ...rest,
    listValues,
    setValue,
    filterOptionsConfig,
    allowCustomValues: false,
    multiple: false,
    disableClearable: !isValueField,
    value,
  };
};

export default (props) => {
  return <MaterialAutocomplete  {...fieldAdapter(props)} />;
};
