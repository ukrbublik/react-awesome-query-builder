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
import { styled } from "@mui/system";
import { useTheme } from "@mui/material/styles";
const { useListValuesAutocomplete } = Hooks;
const emptyArray = [];


export default (props) => {
  const {
    allowCustomValues, multiple, disableClearable,
    value: selectedValue, customProps, readonly, config, filterOptionsConfig, errorText,
    tooltipText,
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
    uif: "mui"
  });

  // setings
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
  const hasValue = selectedValue != null;
  // should be simple value to prevent re-render!s
  const value = hasValue ? selectedValue : (multiple ? emptyArray : null);

  const filterOptions = (options, params) => {
    const filtered = filterOptionsFn(options, params);
    const extended = extendOptions(filtered);
    return extended;
  };

  const groupBy = (option) => option?.group ? JSON.stringify(option.group) : option?.groupTitle;

  // render
  const renderInput = (params) => {
    // parity with Antd
    const shouldRenderSelected = !multiple && !open;
    const selectedTitle = selectedListValue?.title ?? "";
    const shouldHide = multiple && !open;
    const value = shouldRenderSelected ? selectedTitle : (shouldHide ? "" : inputValue ?? "");
    return (
      <TextField 
        variant="standard"
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
    const theme = useTheme();
    if (!groupMaybeJson) return null;
    let group;
    try {
      group = JSON.parse(groupMaybeJson);
    } catch (_) {
      group = {
        label: groupMaybeJson,
      };
    }
    let res = (
      <div style={{
        position: 'sticky',
        top: '-8px',
        padding: '4px 10px',
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.background.default,
      }}>
        {group.label}
      </div>
    );
    if (group.tooltip) {
      res = (
        <Tooltip title={group.tooltip} placement="left-start">{res}</Tooltip>
      );
    }
    return res;
  };

  const GroupItems = ({children}) => {
    return <>{children}</>;
  };

  const renderGroup = (params) => {
    let res = (
      <li key={params.key}>
        <GroupHeader groupMaybeJson={params.group} />
        <GroupItems>{params.children}</GroupItems>
      </li>
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
    const { title, renderTitle, value, isHidden, tooltip } = option;
    const isSelected = multiple ? (selectedValue || []).includes(value) : selectedValue == value;
    const className = getOptionIsCustom(option) ? "customSelectOption" : undefined;
    let titleSpan = (
      <span className={className}>
        {renderTitle || title}
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
      return <div {...props}>{renderTitle || title}</div>;
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
      <Tooltip title={tooltipText} placement="top-start">{res}</Tooltip>
    );
  }
  res = (
    <FormControl fullWidth={fullWidth}>{res}</FormControl>
  );
  return res;
};
