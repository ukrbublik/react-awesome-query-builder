import React from "react";
import omit from "lodash/omit";
import TextField from '@material-ui/core/TextField';
import FormControl from "@material-ui/core/FormControl";
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

import useListValuesAutocomplete from '../../../../hooks/useListValuesAutocomplete';

const defaultFilterOptions = createFilterOptions();

export default (props) => {
  const {
    allowCustomValues,
    value: selectedValue, customProps, readonly, config
  } = props;
  const hasValue = selectedValue != null;

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
    debounceTimeout: 100
  });

  // setings
  const {defaultSliderWidth} = config.settings;
  const {width, ...rest} = customProps || {};
  const customInputProps = rest.input || {};
  const customAutocompleteProps = omit(rest.autocomplete || rest, ["showSearch"]);

  const filterOptions = (options, params) => {
    const filtered = defaultFilterOptions(options, params);
    const extended = extendOptions(filtered, params);
    return extended;
  };

  // Render
  const renderInput = (params) => {
    return (
      <TextField 
        {...params} 
        InputProps={{
          ...params.InputProps,
          readOnly: readonly,
          endAdornment: (
            <React.Fragment>
              {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          ),
        }}
        disabled={readonly}
        placeholder={!readonly ? aPlaceholder : ""}
        //onChange={onInputChange}
        {...customInputProps}
      />
    );
  };

  return (
    <FormControl>
      <Autocomplete
        fullWidth
        style={{ width: width || defaultSliderWidth }}
        freeSolo={allowCustomValues}
        loading={isInitialLoading}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        inputValue={inputValue}
        onInputChange={onInputChange}
        label={!readonly ? aPlaceholder : ""}
        onChange={onChange}
        value={hasValue ? selectedValue : null} // should be simple value to prevent re-render!
        getOptionSelected={getOptionSelected}
        disabled={readonly}
        readOnly={readonly}
        options={options}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={getOptionDisabled}
        renderInput={renderInput}
        filterOptions={filterOptions}
        {...customAutocompleteProps}
      ></Autocomplete>
    </FormControl>
  );
};
