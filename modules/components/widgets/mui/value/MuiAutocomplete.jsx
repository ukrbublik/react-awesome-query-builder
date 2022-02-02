import React from "react";
import omit from "lodash/omit";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import useListValuesAutocomplete from "../../../../hooks/useListValuesAutocomplete";

const nonCheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const defaultFilterOptions = createFilterOptions();
const emptyArray = [];


export default (props) => {
  const {
    allowCustomValues, multiple,
    value: selectedValue, customProps, readonly, config, groupBy, filterOptionsConfig
  } = props;
  const filterOptionsFn = filterOptionsConfig ? createFilterOptions(filterOptionsConfig) : defaultFilterOptions;

  // hook
  const {
    open,
    onOpen,
    onClose,
    onChange,
    onInputChange,
    inputValue,
    options,
    isInitialLoading,
    isLoading,
    aPlaceholder,
    extendOptions,
    getOptionSelected,
    getOptionDisabled,
    getOptionLabel,
  } = useListValuesAutocomplete(props, {
    debounceTimeout: 100,
    multiple
  });

  // setings
  const {defaultSelectWidth, defaultSearchWidth} = config.settings;
  const {width, showCheckboxes, ...rest} = customProps || {};
  let customInputProps = rest.input || {};
  const inputWidth = customInputProps.width || defaultSearchWidth; // todo: use as min-width for Autocomplete comp
  customInputProps = omit(customInputProps, ["width"]);
  const customAutocompleteProps = omit(rest, ["showSearch", "showCheckboxes"]);

  const fullWidth = true;
  const minWidth = width || defaultSelectWidth;
  const style = {
    width: (multiple ? undefined : minWidth),
    minWidth: minWidth
  };
  const placeholder = !readonly ? aPlaceholder : "";
  const hasValue = selectedValue != null;
  // should be simple value to prevent re-render!s
  const value = hasValue ? selectedValue : (multiple ? emptyArray : null);
  
  const filterOptions = (options, params) => {
    const filtered = filterOptionsFn(options, params);
    const extended = extendOptions(filtered, params);
    return extended;
  };

  // render
  const renderInput = (params) => {
    return (
      <TextField 
        variant="standard"
        {...params} 
        InputProps={{
          ...params.InputProps,
          readOnly: readonly,
          endAdornment: (
            <React.Fragment>
              {isLoading ? <CircularProgress color="inherit" size={20}  /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
        disabled={readonly}
        placeholder={placeholder}
        //onChange={onInputChange}
        {...customInputProps}
      />
    );
  };

  const renderTags = (value, getTagProps) => value.map((option, index) => {
    return <Chip
      key={index}
      label={getOptionLabel(option)}
      {...getTagProps({ index })}
    />;
  });

  const isOptionEqualToValue = (option, value) => {
    return option?.value == value;
  };

  const renderOption = (props, option) => {
    const { title, renderTitle, value } = option;
    const selected = (selectedValue || []).includes(value);
    if (multiple && showCheckboxes != false) {
      return <div {...props}>
        <Checkbox
          icon={nonCheckedIcon}
          checkedIcon={checkedIcon}
          style={{ marginRight: 8 }}
          checked={selected}
        />
        {title}
      </div>;
    } else {
      return <div {...props}>{renderTitle || title}</div>;
    }
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <Autocomplete
        disableCloseOnSelect={multiple}
        fullWidth={fullWidth}
        multiple={multiple}
        style={style}
        freeSolo={allowCustomValues}
        loading={isInitialLoading}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        inputValue={inputValue}
        onInputChange={onInputChange}
        label={placeholder}
        onChange={onChange}
        value={value}
        disabled={readonly}
        readOnly={readonly}
        options={options}
        groupBy={groupBy}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={getOptionDisabled}
        renderInput={renderInput}
        //renderTags={renderTags}
        renderOption={renderOption}
        filterOptions={filterOptions}
        isOptionEqualToValue={isOptionEqualToValue}
        size="small"
        {...customAutocompleteProps}
      />
    </FormControl>
  );
};
