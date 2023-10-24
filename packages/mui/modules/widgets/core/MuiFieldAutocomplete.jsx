import React, {useCallback} from "react";
import MuiAutocomplete from "../value/MuiAutocomplete";

// see type FieldItemSearchableKeys
const mapFieldItemToOptionKeys = {
  key: "_value2",
  path: "value",
  label: "title",
  altLabel: "_altLabel",
  tooltip: "tooltip",
  grouplabel: "groupTitle",
};

const itemsToListValues = (items, level = 0) => (
  items.map(item => {
    const {items, path, key, label, altLabel, disabled, grouplabel, group, matchesType, tooltip} = item;
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
        group: group,
        tooltip: tooltip,
        _value2: key,
        _altLabel: altLabel,
      };
    }
  }).flat(Infinity)
);

const fieldAdapter = ({
  items, selectedKey, setField, isValueField,
  selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel,
  ...rest
}, config) => {
  let tooltipText = selectedAltLabel || selectedFullLabel;
  if (tooltipText == selectedLabel)
    tooltipText = null;
  const listValues = itemsToListValues(items);
  const value = selectedKey;
  const setValue = (value, _asyncValues) => {
    if (!value && !isValueField) return undefined;
    return setField(value);
  };
  const filterOptionsConfig = {
    stringify: useCallback((option) => {
      const keysForFilter = config.settings.fieldItemKeysForSearch
        .map(k => mapFieldItemToOptionKeys[k]);
      const valueForFilter = keysForFilter
        .map(k => (typeof option[k] == "string" ? option[k] : ""))
        .join("\0");
      return valueForFilter;
    }, [config])
  };

  return {
    ...rest,
    tooltipText,
    listValues,
    setValue,
    filterOptionsConfig,
    allowCustomValues: false,
    multiple: false,
    disableClearable: !isValueField,
    value,
    isFieldAutocomplete: true,
  };
};

export default (props) => {
  return <MuiAutocomplete  {...fieldAdapter(props, props.config)} />;
};
