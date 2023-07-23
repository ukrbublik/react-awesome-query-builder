import React from "react";
import omit from "lodash/omit";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import Chip from "@material-ui/core/Chip";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { Hooks, Utils } from "@react-awesome-query-builder/ui";
const { useListValuesAutocomplete } = Hooks;

const nonCheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" style={{ marginRight: 10, marginTop: 4 }} />;
const checkedIcon = <CheckBoxIcon fontSize="small" style={{ marginRight: 10, marginTop: 4 }} />;
const defaultFilterOptions = createFilterOptions();
const emptyArray = [];


export default (props) => {
  const {
    allowCustomValues, multiple, disableClearable,
    value: selectedValue, customProps, readonly, config, filterOptionsConfig, errorText
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
    getOptionIsCustom,
    getOptionLabel,
    selectedListValue,
  } = useListValuesAutocomplete(props, {
    debounceTimeout: 100,
    multiple,
    uif: "mui"
  });

  // setings
  const {defaultSelectWidth, defaultSearchWidth} = config.settings;
  const {width, ...rest} = customProps || {};
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
    const extended = extendOptions(filtered);
    return extended;
  };

  const groupBy = (option) => option?.groupTitle;

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
    // parity with Antd
    const shouldRenderSelected = !multiple && !open;
    const selectedTitle = selectedListValue?.title ?? "";
    const shouldHide = multiple && !open;
    const value = shouldRenderSelected ? selectedTitle : (shouldHide ? "" : inputValue ?? "");
    return (
      <TextField 
        {...params}
        inputProps={{
          ...params.inputProps,
          value,
        }}
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
        error={!!errorText}
        //onChange={onInputChange}
        {...customInputProps}
      />
    );
  };

  const renderTags = (value, getTagProps) => value.map((option, index) => {
    const className = getOptionIsCustom(option) ? "customSelectOption" : undefined;
    const titleSpan = (
      <span className={className}>
        {getOptionLabel(option)}
      </span>
    );
    return <Chip
      key={option.value}
      classes={classesChip}
      label={titleSpan}
      size={"small"}
      //variant={getOptionIsCustom(option) ? "outlined" : undefined}
      {...getTagProps({ index })}
    />;
  });

  const renderOption = (option, { selected }) => {
    const { title, renderTitle, value, specialValue, isHidden } = option;
    const isSelected = selected;
    //const isSelected = multiple ? (selectedValue || []).includes(value) : selectedValue == value;
    const className = getOptionIsCustom(option) ? "customSelectOption" : undefined;
    const titleSpan = (
      <span className={className}>
        {renderTitle || title}
      </span>
    );
    if (isHidden)
      return null;
    if (multiple) {
      if (specialValue)
        return (
          <Box>
            {renderTitle || title}
          </Box>
        );
      else
        return (
          <Box>
            {selected ? checkedIcon : nonCheckedIcon}
            {titleSpan}
          </Box>
        );
    } else {
      if (specialValue)
        return <React.Fragment>{renderTitle || title}</React.Fragment>;
      else
        return <React.Fragment>{titleSpan}</React.Fragment>;
    }
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <Autocomplete
        disableClearable={disableClearable}
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
