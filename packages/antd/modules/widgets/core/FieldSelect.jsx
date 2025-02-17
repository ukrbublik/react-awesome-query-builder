import React, { useState, useCallback, useMemo } from "react";
import { Tooltip, Select } from "antd";
import {BUILT_IN_PLACEMENTS, SELECT_WIDTH_OFFSET_RIGHT, calcTextWidth} from "../../utils/domUtils";
const { Option, OptGroup } = Select;

// see type FieldItemSearchableKeys
const mapFieldItemToOptionKeys = {
  key: "_value2",
  path: "value",
  label: "label",
  altLabel: "title",
  tooltip: "_tooltip",
  grouplabel: "grouplabel",
  fullLabel: "_fullLabel",
};

const FieldSelect = (props) => {
  const {
    setField, config, customProps, items, placeholder,
    selectedKey, selectedLabel, selectedOpts, selectedAltLabel, selectedFullLabel, readonly, errorText,
  } = props;
  const {showSearch} = customProps || {};

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectText = selectedLabel || placeholder;
  const selectWidth = calcTextWidth(selectText);
  const isFieldSelected = !!selectedKey;
  const dropdownPlacement = config.settings.dropdownPlacement;
  const dropdownAlign = dropdownPlacement ? BUILT_IN_PLACEMENTS[dropdownPlacement] : undefined;
  const width = isFieldSelected && !showSearch || !selectWidth ? null : selectWidth + SELECT_WIDTH_OFFSET_RIGHT;
  let tooltipText = selectedAltLabel || selectedFullLabel;
  if (tooltipText == selectedLabel)
    tooltipText = null;

  const style = useMemo(() => ({ width }), [width]);

  const onChange = useCallback((key) => {
    setField(key);
  }, [setField]);

  const onSearch = useCallback((search) => {
    setSearchValue(search);
  }, [setSearchValue]);

  const filterOption = useCallback((input, option) => {
    const keysForFilter = config.settings.fieldItemKeysForSearch
      .map(k => mapFieldItemToOptionKeys[k]);
    const valueForFilter = keysForFilter
      .map(k => (typeof option[k] == "string" ? option[k] : ""))
      .join("\0");
    const matches = valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    return matches;
  }, [config.settings.fieldItemKeysForSearch]);

  const renderSelectItems = (fields, level = 0) => {
    return fields.map(field => {
      const {items, key, path, label, fullLabel, altLabel, tooltip, grouplabel, disabled, matchesType} = field;
      const groupPrefix = level > 0 ? "\u00A0\u00A0".repeat(level) : "";
      const prefix = level > 1 ? "\u00A0\u00A0".repeat(level-1) : "";
      const pathKey = path || key;
      if (items) {
        const simpleItems = items.filter(it => !it.items);
        const complexItems = items.filter(it => !!it.items);
        const complexList = complexItems.length ? renderSelectItems(complexItems, level+1) : [];
        const simpleList = simpleItems.length ? renderSelectItems(simpleItems, level+1) : [];
        let groupLabel = groupPrefix+label;
        if (tooltip) {
          groupLabel = <Tooltip title={tooltip}>{groupLabel}</Tooltip>;
        }
        const grp = (
          <OptGroup
            key={pathKey}
            label={groupLabel}
          >
            {simpleList}
          </OptGroup>
        );
        return [grp, ...complexList];
      } else {
        const optionText = matchesType ? <b>{prefix+label}</b> : prefix+label;
        const option = tooltip ? <Tooltip title={tooltip}>{optionText}</Tooltip> : optionText;
        
        return <Option
          key={pathKey}
          value={pathKey}
          title={altLabel}
          grouplabel={grouplabel}
          label={label}
          disabled={disabled}
          _fullLabel={fullLabel}
          _tooltip={tooltip}
          _value2={key}
        >
          {option}
        </Option>;
      }
    }).flat(Infinity);
  };

  const fieldSelectItems = renderSelectItems(items);

  let res = (
    <Select
      open={open}
      onDropdownVisibleChange={setOpen}
      dropdownAlign={dropdownAlign}
      popupMatchSelectWidth={false}
      style={style}
      placeholder={placeholder}
      size={config.settings.renderSize}
      onChange={onChange}
      value={selectedKey || undefined}
      optionLabelProp={"label"}
      filterOption={filterOption}
      disabled={readonly}
      status={errorText && "error"}
      showSearch={!!showSearch}
      searchValue={searchValue}
      onSearch={showSearch ? onSearch : undefined}
      {...customProps}
    >{fieldSelectItems}</Select>
  );

  if (tooltipText) {
    res = <Tooltip title={!open ? tooltipText : null}>{res}</Tooltip>;
  }

  return res;
};

FieldSelect.displayName = "FieldSelect";
export default FieldSelect;

