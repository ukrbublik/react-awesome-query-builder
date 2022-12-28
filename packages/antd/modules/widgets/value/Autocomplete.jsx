import React, { useMemo } from "react";
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
    getOptionLabel,
  } = useListValuesAutocomplete(props, {
    debounceTimeout: 100,
    multiple
  });

  const filteredOptions = extendOptions(options);

  const optionsMaxWidth = useMemo(() => {
    return filteredOptions.reduce((max, option) => {
      return Math.max(max, calcTextWidth(option.title, null));
    }, 0);
  }, [options]);

  const { defaultSelectWidth, defaultSearchWidth, renderSize } = config.settings;
  const placeholderWidth = calcTextWidth(placeholder);
  const aValue = value && value.length ? value : undefined;
  const width = aValue ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
  const dropdownWidth = optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
  const minWidth = width || defaultSelectWidth;
  
  const style = {
    width: (multiple ? undefined : minWidth),
    minWidth: minWidth
  };
  const dropdownStyle = {
    width: dropdownWidth,
  };

  const mode = !multiple ? undefined : (allowCustomValues ? "tags" : "multiple");
  const dynamicPlaceholder = !readonly ? aPlaceholder : "";

  // rendering special 'Load more' option has side effect: on change rc-select will save its title as internal value in own state
  const renderedOptions = filteredOptions?.filter(option => !option.specialValue).map((option) => (
    <Option 
      key={option.value} 
      value={option.value} 
      disabled={getOptionDisabled(option)}
    >
      {getOptionLabel(option)}
    </Option>
  ));

  const onSpecialClick = (specialValue) => () => {
    const option = filteredOptions.find(opt => opt.specialValue == specialValue);
    onChange(null, option);
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

  const aOnSelect = async (label, option) => {
    if (isSpecialValue(option)) {
      await onChange(label, option);
    }
  };

  const aOnChange = async (label, option) => {
    if (!isSpecialValue(option)) {
      await onChange(label, option);
    }
  };

  const dropdownRender = (menu) => (
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
  );

  return (
    <Select
      filterOption={useAsyncSearch ? false : true}
      dropdownRender={dropdownRender}
      allowClear={true}
      notFoundContent={isLoading ? "Loading..." : null}
      disabled={readonly}
      mode={mode}
      style={customProps?.style || style}
      dropdownStyle={customProps?.dropdownStyle || dropdownStyle}
      key={"widget-autocomplete"}
      dropdownMatchSelectWidth={customProps?.dropdownMatchSelectWidth || false}
      placeholder={customProps?.placeholder || dynamicPlaceholder}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onChange={aOnChange}
      onSelect={aOnSelect}
      onSearch={onSearch}
      showArrow
      showSearch
      size={renderSize}
      loading={isLoading}
      value={aValue}
      //searchValue={inputValue}
      open={open}
      {...customProps}
    >
      {renderedOptions}
    </Select>
  );
};
