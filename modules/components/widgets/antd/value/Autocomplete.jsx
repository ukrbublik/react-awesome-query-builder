import React, { PureComponent, useMemo } from "react";
import PropTypes from "prop-types";
import { Select } from "antd";
import { calcTextWidth, SELECT_WIDTH_OFFSET_RIGHT } from "../../../../utils/domUtils";
import { mapListValues } from "../../../../utils/stuff";
import { useOnPropsChanged } from "../../../../utils/reactUtils";
import omit from "lodash/omit";
import useListValuesAutocomplete from "../../../../hooks/useListValuesAutocomplete";
const Option = Select.Option;

export function AutocompleteWidget(props) {
  const { config, placeholder, allowCustomValues, customProps, value, readonly, multiple } = this.props;

  const filterOption = (input, option) => {
    const dataForFilter = option.children || option.value;
    return dataForFilter.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  // hook
  const {
    open,
    onOpen,
    onClose,
    onChange,
    onSearch,
    inputValue,
    options,
    isInitialLoading,
    isLoading,
    aPlaceholder,
    extendOptions,
    getOptionSelected,
    getOptionDisabled,
    getOptionLabel,
  } = useListValuesAutocomplete(this.props, {
    debounceTimeout: 100,
    multiple
  });

  let optionsMaxWidth = useMemo(() => {
    options.reduce((max, option) => {
      max = Math.max(max, calcTextWidth(option.title, null));
    }, 0);
  }, [options]);

  const { renderSize } = config.settings;
  const placeholderWidth = calcTextWidth(placeholder);
  const aValue = value && value.length ? value : undefined;
  const width = aValue ? null : placeholderWidth + SELECT_WIDTH_OFFSET_RIGHT;
  const dropdownWidth = optionsMaxWidth + SELECT_WIDTH_OFFSET_RIGHT;
  const customSelectProps = omit(customProps, ["showCheckboxes"]);

  return (
    <Select
      disabled={readonly}
      mode={allowCustomValues ? "tags" : "multiple"}
      style={{
        minWidth: width,
        width: width,
      }}
      dropdownStyle={{
        width: dropdownWidth,
      }}
      key={"widget-autocomplete"}
      dropdownMatchSelectWidth={false}
      placeholder={placeholder}
      size={renderSize}
      loading={isLoading}
      value={aValue}
      open={open}
      onOpen={onOpen}
      onChange={onChange}
      onSearch={onSearch}
      filterOption={false}
      {...customSelectProps}
    >
      {options?.map(({ title, value }) => (
        <Option key={value} value={value}>{title}</Option>
      ))}
    </Select>
  );
}
