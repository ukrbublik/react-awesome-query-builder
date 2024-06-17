import React, {useCallback} from "react";
import omit from "lodash/omit";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Check from "@mui/icons-material/Check";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { Hooks } from "@react-awesome-query-builder/ui";
import { useTheme } from "@mui/material/styles";
const { useListValuesAutocomplete } = Hooks;
const emptyArray = [];

// tip: option can contain `group: {label, title}` intead of `groupTitle`
// but it's internal format, made for field autocomplete
// see `JSON.stringify(option.group)` and `JSON.parse(groupMaybeJson)`

export default (props) => {
  const {
    allowCustomValues, multiple, disableClearable,
    value: selectedValue, customProps, readonly, config, filterOptionsConfig, errorText,
    tooltipText, isFieldAutocomplete,
  } = props;
  const stringifyOption = useCallback((option) => {
    const keysForFilter = config.settings.listKeysForSearch;
    const valueForFilter = keysForFilter
      .map(k => (typeof option[k] == "string" ? option[k] : ""))
      .join("\0");
    return valueForFilter;
  }, [config]);
  const defaultFilterOptionsConfig = {
    stringify: stringifyOption
  };
  const filterOptionsFn = createFilterOptions(filterOptionsConfig || defaultFilterOptionsConfig);

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
    uif: "mui",
    isFieldAutocomplete,
  });

  // settings
  const {defaultSelectWidth, defaultSearchWidth} = config.settings;
  const {width, ...rest} = customProps || {};
  let customInputProps = rest.input || {};
  const inputWidth = customInputProps.width || defaultSearchWidth; // todo: use as min-width for Autocomplete comp
  customInputProps = omit(customInputProps, ["width"]);
  const customAutocompleteProps = omit(rest, ["showSearch", "showCheckboxes"]);

  const fullWidth = false;
  const minWidth = width || defaultSelectWidth;
  const style = {
    width: (multiple ? undefined : minWidth),
    minWidth: minWidth
  };
  const placeholder = !readonly ? aPlaceholder : "";

  // For accessibility, always give the input field an aria-label
  const ariaLabel = placeholder || config.settings.fieldPlaceholder;

  const hasValue = selectedValue != null;
  // should be simple value to prevent re-render!s
  const value = hasValue ? selectedValue : (multiple ? emptyArray : null);

  const filterOptions = (options, params) => {
    const filtered = filterOptionsFn(options, params);
    const extended = extendOptions(filtered);
    return extended;
  };

  const groupBy = (option) => option?.group ? JSON.stringify(option.group) : option?.groupTitle;

  const theme = useTheme();

  // render
  const renderInput = (params) => {
    // parity with Antd
    const shouldRenderSelected = !multiple && !open;
    const selectedTitle = selectedListValue?.title ?? value.toString();
    const shouldHide = multiple && !open;
    const renderValue = shouldRenderSelected ? selectedTitle : (shouldHide ? "" : inputValue ?? value.toString());
    return (
      <TextField 
        variant="standard"
        {...params}
        inputProps={{
          "aria-label": ariaLabel,
          ...params.inputProps,
          value: renderValue,
        }}
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
        error={!!errorText}
        //onChange={onInputChange}
        {...customInputProps}
      />
    );
  };

  const GroupHeader = ({groupMaybeJson}) => {
    if (!groupMaybeJson) return null;
    let group = {
      label: groupMaybeJson,
    };
    if (typeof groupMaybeJson === "string" && groupMaybeJson[0] === "{") {
      try {
        group = JSON.parse(groupMaybeJson);
      } catch (_) {
        // ignore
      }
    }
    let groupLabel = group.label;
    if (groupLabel && group.tooltip) {
      groupLabel = (
        <Tooltip title={group.tooltip} placement="left-start"><span>{groupLabel}</span></Tooltip>
      );
    }
    let res = (
      <div style={{
        position: "sticky",
        top: "-8px",
        padding: "4px 10px",
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.background.default,
      }}>
        {groupLabel}
      </div>
    );
    return res;
  };

  const GroupItems = ({children}) => {
    return <>{children}</>;
  };

  const renderGroup = (params) => {
    let res = (
      <div key={params.key}>
        <GroupHeader groupMaybeJson={params.group} />
        <GroupItems>{params.children}</GroupItems>
      </div>
    );
    return res;
  };

  const renderTags = (value, getTagProps) => value.map((option, index) => {
    return <Chip
      key={option.value}
      label={getOptionLabel(option)}
      size={"small"}
      variant={getOptionIsCustom(option) ? "outlined" : "filled"}
      {...getTagProps({ index })}
    />;
  });

  const isOptionEqualToValue = (option, value) => {
    return option?.value == value;
  };

  const renderOption = (props, option) => {
    const { title, renderTitle, value, isHidden, tooltip, group, groupTitle } = option;
    const isGrouped = groupTitle || group;
    const isSelected = multiple ? (selectedValue || []).includes(value) : selectedValue == value;
    const className = getOptionIsCustom(option) ? "customSelectOption" : undefined;
    const prefix = !isFieldAutocomplete && isGrouped ? "\u00A0\u00A0" : "";
    const finalTitle = (renderTitle || prefix + title);
    let titleSpan = (
      <span className={className}>
        {finalTitle}
      </span>
    );
    if (tooltip) {
      titleSpan = (
        <Tooltip title={tooltip} placement="left-start">{titleSpan}</Tooltip>
      );
    }
    if (isHidden)
      return null;
    if (option.specialValue) {
      return <div {...props}>{finalTitle}</div>;
    } else if (multiple) {
      const itemContent = isSelected ? (
        <><ListItemIcon><Check /></ListItemIcon>{titleSpan}</>
      ) : (
        <ListItemText inset>{titleSpan}</ListItemText>
      );
      return (
        <MenuItem
          {...props}
          size={"small"}
          selected={isSelected}
        >{itemContent}</MenuItem>
      );
    } else {
      return <div {...props}>{titleSpan}</div>;
    }
  };
  
  let res = (
    <Autocomplete
      disableClearable={disableClearable}
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
      renderGroup={renderGroup}
      renderTags={renderTags}
      renderOption={renderOption}
      filterOptions={filterOptions}
      isOptionEqualToValue={isOptionEqualToValue}
      size="small"
      {...customAutocompleteProps}
    />
  );
  if (tooltipText) {
    res = (
      <Tooltip title={!open ? tooltipText : null} placement="top-start">{res}</Tooltip>
    );
  }
  res = (
    <FormControl fullWidth={fullWidth}>{res}</FormControl>
  );
  return res;
};
