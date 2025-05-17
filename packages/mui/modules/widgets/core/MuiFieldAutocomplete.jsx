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

const itemsToListValues = (items, level = 0, parentGroups = []) => {
  const lvs = items.map(item => {
    const {items, path, key, label, altLabel, disabled, grouplabel, group, matchesType, tooltip} = item;
    const getPrefix = (lev) => "\u00A0\u00A0".repeat(lev);
    const prefix = getPrefix(level);
    if (items) {
      return itemsToListValues(items, level+1, [...parentGroups, item]);
    } else {
      return {
        title: label,
        renderTitle: matchesType ? <b>{prefix+label}</b> : prefix+label,
        value: path,
        disabled,
        groupTitle: level > 0 ? prefix+grouplabel : null,
        group: level > 0 ? {
          ...group,
          label: prefix+group.label,
          parentGroups: parentGroups.map(({
            tooltip, label, path
          }, ind) => ({
            path, tooltip, label: getPrefix(ind)+label
          })),
        } : null,
        tooltip: tooltip,
        _value2: key,
        _altLabel: altLabel,
      };
    }
  }).flat(Infinity);
  
  // Don't repeat groups
  const usedGroups = [];
  for (const lv of lvs) {
    if (lv.group) {
      lv.group.parentGroups = lv.group.parentGroups.filter(({path}) => (!usedGroups.includes(path)));
      for (const gr of lv.group.parentGroups) {
        usedGroups.push(gr.path);
      }
    }
  }

  return lvs;
};

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
    dontFixOptionsOrder: true, // don't apply fixListValuesGroupOrder() for options
  };
};

export default (props) => {
  return <MuiAutocomplete  {...fieldAdapter(props, props.config)} />;
};
