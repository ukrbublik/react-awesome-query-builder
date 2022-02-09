import React, { PureComponent, useMemo } from "react";
import PropTypes from "prop-types";
import { Select, Spin } from "antd";
import { calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../../../utils/domUtils";
import { mapListValues } from "../../../../utils/stuff";
import { useOnPropsChanged } from "../../../../utils/reactUtils";
import omit from "lodash/omit";
import useListValuesAutocomplete from "../../../../hooks/useListValuesAutocomplete";
const Option = Select.Option;

export default (props) => {
  const { config, placeholder, allowCustomValues, customProps, value, readonly, multiple } = props;

  const filterOption = (input, option) => {
    const dataForFilter = option.children || option.value;
    return dataForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  // hook
  const {
    open,
    onDropdownVisibleChange,
    onChange,
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

  let optionsMaxWidth = useMemo(() => {
    options.reduce((max, option) => {
      max = Math.max(max, calcTextWidth(option.title, null));
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

  return (
    <Select
      notFoundContent={isLoading ? "Loading..." : null}
      disabled={readonly}
      mode={mode}
      style={customProps?.style || style}
      dropdownStyle={customProps?.dropdownStyle || dropdownStyle}
      key={"widget-autocomplete"}
      dropdownMatchSelectWidth={customProps?.dropdownMatchSelectWidth || false}
      placeholder={customProps?.placeholder || dynamicPlaceholder}
      onDropdownVisibleChange={onDropdownVisibleChange}
      onChange={onChange}
      onSearch={onSearch}
      showArrow
      showSearch
      {...customProps}
      size={renderSize}
      loading={isLoading}
      value={aValue}
      open={open}
      filterOption={false}
    >
      {options?.map((option) => (
        <Option key={option.value} value={option.value} disabled={getOptionDisabled(option)}>{getOptionLabel(option)}</Option>
      ))}
    </Select>
  );
};
