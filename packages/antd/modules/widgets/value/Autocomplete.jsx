import React, { useMemo, useCallback } from "react";
import { Select, Spin, Divider } from "antd";
import { calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../utils/domUtils";
import { Hooks } from "@react-awesome-query-builder/ui";
const { useListValuesAutocomplete } = Hooks;
const Option = Select.Option;

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

  const mode = !multiple ? undefined : (allowCustomValues ? "multiple" : "multiple");
  const dynamicPlaceholder = !readonly ? aPlaceholder : "";

  // rendering special 'Load more' option has side effect: on change rc-select will save its title as internal value in own state
  const renderedOptions = filteredOptions?.filter(option => !option.specialValue).map((option) => (
    <Option 
      key={option.value} 
      value={option.value}
      disabled={getOptionDisabled(option)}
    >
      <span className={getOptionIsCustom(option) ? "customSelectOption" : undefined}>
        {getOptionLabel(option)}
      </span>
    </Option>
  ));

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

  return (
    <Select
      filterOption={useAsyncSearch ? false : true}
      dropdownRender={dropdownRender}
      allowClear={true}
      notFoundContent={isLoading ? "Loading..." : "Not found"}
      disabled={readonly}
      mode={mode}
      style={customProps?.style || style}
      dropdownStyle={customProps?.dropdownStyle || dropdownStyle}
      key={"widget-autocomplete"}
      popupMatchSelectWidth={customProps?.popupMatchSelectWidth || customProps?.dropdownMatchSelectWidth || false}
      placeholder={customProps?.placeholder || dynamicPlaceholder}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onChange={aOnChange}
      onClear={aOnClear}
      onSelect={aOnSelect}
      onSearch={aOnSearch}
      showArrow
      showSearch
      size={renderSize}
      loading={isLoading}
      value={aValue}
      searchValue={inputValue}
      open={open}
      {...customProps}
    >
      {renderedOptions}
    </Select>
  );
};
