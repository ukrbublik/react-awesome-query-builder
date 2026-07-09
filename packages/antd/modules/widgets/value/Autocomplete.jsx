import React, { useMemo, useCallback } from "react";
import { Select, Divider, Tooltip, version as antdVersion } from "antd";
import { calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../utils/domUtils";
import { Hooks , Utils } from "@react-awesome-query-builder/ui";
const { fixListValuesGroupOrder } = Utils.Autocomplete;
const { makeCustomListValue } = Utils.ListUtils;
const { useListValuesAutocomplete } = Hooks;

// see type ListItem
const mapListItemToOptionKeys = {
  value: "value",
  title: "label",
  groupTitle: "grouplabel",
};

export default (props) => {
  const { config, placeholder, allowCustomValues, customProps, value, readonly, multiple, useAsyncSearch } = props;

  // hook
  const {
    open,
    onDropdownVisibleChange,
    onChange,
    isSpecialValue,
    onSearch,
    inputValue,
    options,
    isInitialLoading,
    isLoading,
    aPlaceholder,
    extendOptions,
    getOptionDisabled,
    getOptionIsCustom,
    getOptionLabel,
    onInputChange,
  } = useListValuesAutocomplete(props, {
    debounceTimeout: 100,
    multiple,
    uif: "antd"
  });

  const filteredOptions = extendOptions(options);

  // To colorize custom options
  if (multiple && allowCustomValues && value?.length) {
    for (const v of value) {
      if (getOptionIsCustom(v) && !options.find(({value}) => value === v)) {
        filteredOptions.push(makeCustomListValue(v));
      }
    }
  }

  const optionsMaxWidth = useMemo(() => {
    return filteredOptions.reduce((max, option) => {
      return Math.max(max, calcTextWidth(option.title, null));
    }, 0);
  }, [options]);

  const { defaultSelectWidth, defaultSearchWidth, renderSize } = config.settings;
  const placeholderWidth = calcTextWidth(placeholder);
  const isEmptyValue = multiple ? !value?.length : !value;
  const aValue = !isEmptyValue ? value : (multiple ? [] : undefined);
  const width = aValue || !placeholderWidth ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
  const dropdownWidth = optionsMaxWidth && !isNaN(optionsMaxWidth) ? optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT : null;
  const minWidth = width || defaultSelectWidth;
  const isClearAllClicked = React.useRef(false);

  const style = {
    width: (multiple ? undefined : minWidth),
    minWidth: minWidth
  };
  const dropdownStyle = {
    width: dropdownWidth,
  };

  const mode = !multiple ? undefined : (
    customProps?.mode || (allowCustomValues && customProps?.tokenSeparators ? "tags" : "multiple")
  );
  const dynamicPlaceholder = !readonly ? aPlaceholder : "";

  const nestByGroup = (opts, fix = false) => {
    let newOpts = opts;
    if (fix) {
      newOpts = fixListValuesGroupOrder(newOpts);
    }

    let nestedOpts = [];
    for (const o of newOpts) {
      const groupTitle = o.groupTitle;
      delete o.groupTitle;
      if (groupTitle) {
        o.grouplabel = groupTitle;
        let targetGroup;
        const lastO = nestedOpts[nestedOpts.length-1];
        if (lastO?.options && lastO.label === groupTitle) {
          targetGroup = lastO;
        } else {
          targetGroup = {
            label: groupTitle,
            options: []
          };
          nestedOpts.push(targetGroup);
        }
        targetGroup.options.push(o);
      } else {
        nestedOpts.push(o);
      }
    }

    return nestedOpts;
  };

  const renderOptionLabel = (option) => {
    const { tooltip } = option;
    let label = getOptionLabel(option);
    if (tooltip) {
      label = <Tooltip title={tooltip}>{label}</Tooltip>;
    }
    return label;
  };

  // rendering special 'Load more' option has side effect: on change rc-select will save its title as internal value in own state
  const optionsToRender = nestByGroup(
    filteredOptions
      ?.filter(option => !option.specialValue)
      .map((option) => ({
        label: getOptionIsCustom(option)
          ? <span className={"customSelectOption"}>{getOptionLabel(option)}</span>
          : renderOptionLabel(option),
        value: option.value,
        groupTitle: option.groupTitle,
        disabled: getOptionDisabled(option)
      }))
  );

  const onSpecialClick = (specialValue) => () => {
    const option = filteredOptions.find(opt => opt.specialValue == specialValue);
    onChange(null, specialValue, option);
  };

  const specialOptions = filteredOptions?.filter(option => !!option.specialValue).map((option) => (
    <a
      style={{ padding: "5px 10px", display: "block", cursor: "pointer" }}
      key={option.specialValue}
      disabled={getOptionDisabled(option)}
      onClick={onSpecialClick(option.specialValue)}
    >
      {getOptionLabel(option)}
    </a>
  ));

  const aOnSelect = async (newValue, option) => {
    // For both multiple/single `newValue` is string, `option` is {value, children}
    // ! Custom option is always `{}`
    const isAutoTokenization = multiple && !!option.props && !(option.value !== undefined || option.label !== undefined);
    if (isAutoTokenization) {
      // Ignore, already processed in `aOnChange`
      return;
    }
    if (isSpecialValue(option)) {
      await onChange(null, newValue, option);
    } else {
      if (multiple) {
        await onChange(null, newValue, option);
      }
    }
  };

  const aOnClear = () => {
    if (open) {
      // tip: if closed, search is hidden, so let's clear tags AND search value
      isClearAllClicked.current = true;
    }
  };


  const aOnChange = async (newValue, option) => {
    // For multiple `newValue` is array of strings, `option` is array of {value, children}
    // For single `newValue` is string/undefined, `option` is {value, children}/undefined
    // ! Custom option is always `{}`
    //
    // For multiple called on:
    // - click (x) at right (clear all)
    // - tag removal
    // - option selection (`aOnSelect` is also called after)
    // - trying to add new tag from search input (for mode "tags" - unwanted!)
    // - automatic tokenization (like pasting "1,2,3") - issue #1115
    //
    // For single called on:
    // - click (x) at right (clear all)
    // - option selection (`aOnSelect` is also called after)
    // ! NOT when trying to add new tag

    const isAddFromSearch 
      = multiple
      && newValue.length && newValue.length > aValue.length
      && newValue[newValue.length-1] == inputValue;
    const shouldIgnore = isSpecialValue(option) // use onSelect instead
      || mode === "tags" && isAddFromSearch // obsolete, we don't use tags mode
      || isClearAllClicked.current && inputValue // if there are tags AND input, clear input first
    ;
    isClearAllClicked.current = false;
    if (!shouldIgnore) {
      await onChange(null, newValue, option);
    }
  };

  // to keep compatibility with antD
  const aOnSearch = async (newInputValue) => {
    if (isClearAllClicked.current) {
      isClearAllClicked.current = false;
    }
    // if (newInputValue === "" && !open) {
    //   return; // ?
    // }

    await onInputChange(null, newInputValue);
  };

  const dropdownRender = useCallback((menu) => (
    <div>
      {menu}
      {specialOptions.length > 0
        && <>
          <Divider style={{ margin: "0px" }}/>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {specialOptions}
          </div>
        </>
      }
    </div>
  ), [filteredOptions]);

  const filterOption = useCallback((input, option) => {
    const keysForFilter = config.settings.listKeysForSearch
      .map(k => mapListItemToOptionKeys[k]);
    const valueForFilter = keysForFilter
      .map(k => (typeof option[k] == "string" ? option[k] : ""))
      .join("\0");
    const matches = valueForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    return matches;
  }, [config]);

  const selectProps = {};
  const antdMajorVersion = parseInt(antdVersion.split(".")[0]);
  if (antdMajorVersion >= 5) {
    selectProps.popupMatchSelectWidth
      = customProps?.popupMatchSelectWidth
        || customProps?.dropdownMatchSelectWidth
        || false;
  } else {
    selectProps.dropdownMatchSelectWidth
      = customProps?.popupMatchSelectWidth
        || customProps?.dropdownMatchSelectWidth
        || false;
  }

  const dropdownProps = {};
  if (antdMajorVersion >= 5) {
    dropdownProps.popupStyle
      = customProps?.popupStyle || customProps?.dropdownStyle || dropdownStyle;
  } else {
    dropdownProps.dropdownStyle
      = customProps?.dropdownStyle || customProps?.popupStyle || dropdownStyle;
  }

  return (
    <Select
      filterOption={useAsyncSearch ? false : filterOption}
      dropdownRender={dropdownRender}
      allowClear={true}
      notFoundContent={isLoading ? (config.settings.loadingLabel ?? "Loading...") : (config.settings.notFoundLabel ?? "Not found")}
      disabled={readonly}
      mode={mode}
      style={customProps?.style || style}
      key={"widget-autocomplete"}
      placeholder={customProps?.placeholder || dynamicPlaceholder}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onChange={aOnChange}
      onClear={aOnClear}
      onSelect={aOnSelect}
      onSearch={aOnSearch}
      showSearch
      size={renderSize}
      loading={isLoading}
      value={aValue}
      searchValue={inputValue}
      open={open}
      options={optionsToRender}
      {...selectProps}
      {...dropdownProps}
      {...customProps}
    >
    </Select>
  );
};
