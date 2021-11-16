import React from "react";
import omit from "lodash/omit";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import Chip from "@material-ui/core/Chip";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";

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
    const filtered = filterOptionsFn(options, params);
    const extended = extendOptions(filtered, params);
    return extended;
  };

  // styles
  const useStyles = makeStyles((theme) => ({
    // fix too small width
    input: {
      minWidth: inputWidth + " !important",
    }
  }));

  const useStylesChip = makeStyles((theme) => ({
    // fix height
    root: {
      height: "auto"
    },
    label: {
      marginTop: "3px",
      marginBottom: "3px",
    }
  }));

  const classesChip = useStylesChip();
  const classes = useStyles();

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
              {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
      classes={classesChip}
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
      return <React.Fragment>{option.renderTitle || option.title}</React.Fragment>;
    }
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <Autocomplete
        disableCloseOnSelect={multiple}
        fullWidth={fullWidth}
        multiple={multiple}
        style={style}
        classes={classes}
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
        groupBy={groupBy}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={getOptionDisabled}
        renderInput={renderInput}
        renderTags={renderTags}
        renderOption={renderOption}
        filterOptions={filterOptions}
        {...customAutocompleteProps}
      ></Autocomplete>
    </FormControl>
  );
};
