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
import styled from "@emotion/styled";

import useListValuesAutocomplete from "../../../../hooks/useListValuesAutocomplete";

const nonCheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const defaultFilterOptions = createFilterOptions();
const emptyArray = [];

const StyledAutocomplete = styled(Autocomplete)`
& .MuiAutocomplete-input {
  min-width: ${props => props.inputWidth || "0px"} !important;
}
`;

const StyledChip = styled(Chip)`
& .MuiChip-root {
  height: auto;
}
& .MuiChip-label {
  margin-top: 3px;
  margin-bottom: 3px;
}
`;

const StyledCircularProgress = styled(CircularProgress)`
right: 35px;
position: absolute;
`;

export default (props) => {
  const {
    allowCustomValues, multiple,
    value: selectedValue, customProps, readonly, config
  } = props;

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
  const inputWidth = customInputProps.width || defaultSearchWidth;
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
    const filtered = defaultFilterOptions(options, params);
    const extended = extendOptions(filtered, params);
    return extended;
  };

  // render
  const renderInput = (params) => {
    return (
      <TextField 
        {...params} 
        InputProps={{
          ...params.InputProps,
          readOnly: readonly,
          endAdornment: (
            <React.Fragment>
              {isLoading ? <StyledCircularProgress color="inherit" size={20}  /> : null}
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
    return <StyledChip
      key={index}
      label={getOptionLabel(option)}
      {...getTagProps({ index })}
    />;
  });

  const renderOption = (option, { selected }) => {
    if (multiple && showCheckboxes != false) {
      return <React.Fragment>
        <Checkbox
          icon={nonCheckedIcon}
          checkedIcon={checkedIcon}
          style={{ marginRight: 8 }}
          checked={selected}
        />
        {option.title}
      </React.Fragment>;
    } else {
      return <React.Fragment>{option.title}</React.Fragment>;
    }
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <StyledAutocomplete
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
        getOptionSelected={getOptionSelected}
        disabled={readonly}
        readOnly={readonly}
        options={options}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={getOptionDisabled}
        renderInput={renderInput}
        renderTags={renderTags}
        renderOption={renderOption}
        filterOptions={filterOptions}
        size="small"
        inputWidth={inputWidth}
        {...customAutocompleteProps}
      ></StyledAutocomplete>
    </FormControl>
  );
};
