import React, {useCallback} from "react";
import omit from "lodash/omit";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Check from "@mui/icons-material/Check";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { Hooks } from "@react-awesome-query-builder/ui";
import { useTheme } from "@mui/material/styles";
import { muiVersion } from "../../utils/versions";
const { useListValuesAutocomplete } = Hooks;
const emptyArray = [];

// tip: option can contain `group: {label, title}` intead of `groupTitle`
// but it's internal format, made for field autocomplete
// see `JSON.stringify(option.group)` and `JSON.parse(groupMaybeJson)`

export default (props) => {
  const {
    allowCustomValues, multiple, disableClearable,
    value: selectedValue, customProps, readonly, config, filterOptionsConfig, errorText,
    tooltipText, isFieldAutocomplete, dontFixOptionsOrder,
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
    dontFixOptionsOrder,
  });

  // settings
  const {defaultSelectWidth, defaultSearchWidth, renderSize} = config.settings;
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
    const selectedTitle = selectedListValue?.title ?? value?.toString() ?? "";
    const shouldHide = multiple && !open;
    const renderValue = shouldRenderSelected ? selectedTitle : (shouldHide ? "" : inputValue ?? value?.toString() ?? "");
    // since v9 `params` contains `slotProps` (`input`, `htmlInput`) instead of `InputProps`, `inputProps`
    const useSlotProps = !!params.slotProps;
    const paramsInputProps = (useSlotProps ? params.slotProps.input : params.InputProps) ?? {};
    const paramsHtmlInputProps = (useSlotProps ? params.slotProps.htmlInput : params.inputProps) ?? {};
    const htmlInputProps = {
      "aria-label": ariaLabel,
      ...paramsHtmlInputProps,
      value: renderValue,
    };
    const inputProps = {
      ...paramsInputProps,
      readOnly: readonly,
      endAdornment: (
        <React.Fragment>
          {isLoading ? <CircularProgress color="inherit" size={20}  /> : null}
          {paramsInputProps.endAdornment}
        </React.Fragment>
      ),
    };
    return (
      <TextField 
        variant="standard"
        {...params}
        // since v9 `params.fullWidth` reflects `fullWidth` of Autocomplete (was always true before),
        // but input should always fill Autocomplete (its width is controlled by `style`)
        fullWidth={true}
        {...(useSlotProps ? {
          slotProps: {
            ...params.slotProps,
            input: inputProps,
            htmlInput: htmlInputProps,
          },
        } : {
          inputProps: htmlInputProps,
          InputProps: inputProps,
        })}
        size={renderSize}
        disabled={readonly}
        placeholder={placeholder}
        error={!!errorText}
        //onChange={onInputChange}
        {...customInputProps}
      />
    );
  };

  const GroupHeader = ({group}) => {
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
    const groupMaybeJson = params.group;
    let group;
    if (typeof groupMaybeJson === "string" && groupMaybeJson[0] === "{") {
      try {
        group = JSON.parse(groupMaybeJson);
      } catch (_) {
        // ignore
      }
    } else if (groupMaybeJson) {
      group = {
        label: groupMaybeJson,
      };
    }
    const groups = group ? (group.parentGroups ?? [group]) : [];
    let res = (
      <div key={params.key}>
        {groups.map((gr) => (<GroupHeader key={gr?.path} group={gr} />))}
        <GroupItems>{params.children}</GroupItems>
      </div>
    );
    return res;
  };

  const renderTags = (value, getItemProps) => value.map((option, index) => {
    // tip: `option` can be a primitive value, so use `key` provided by MUI (should not be spread into JSX)
    const { key, ...itemProps } = getItemProps({ index });
    return <Chip
      key={key ?? index}
      label={getOptionLabel(option)}
      size={"small"}
      variant={getOptionIsCustom(option) ? "outlined" : "filled"}
      {...itemProps}
    />;
  });
  // `renderTags` is deprecated since v7 and removed in v9 in favor of `renderValue`
  // (note: `renderValue` is also applied for single value, so use it only for multiple)
  const renderTagsProps = multiple ? (
    muiVersion >= 7 ? { renderValue: renderTags } : { renderTags }
  ) : {};

  const isOptionEqualToValue = (option, value) => {
    return option?.value == value;
  };

  const renderOption = (optionProps, option) => {
    // `key` should not be spread into JSX
    const { key, ...props } = optionProps;
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
      return <div key={key} {...props}>{finalTitle}</div>;
    } else if (multiple) {
      const itemContent = isSelected ? (
        <><ListItemIcon><Check /></ListItemIcon>{titleSpan}</>
      ) : (
        <ListItemText inset>{titleSpan}</ListItemText>
      );
      // tip: don't use MenuItem here - since v9 it throws error if rendered outside of Menu or MenuList
      return (
        <li key={key} {...props}>{itemContent}</li>
      );
    } else {
      return <div key={key} {...props}>{titleSpan}</div>;
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
      {...renderTagsProps}
      renderOption={renderOption}
      filterOptions={filterOptions}
      isOptionEqualToValue={isOptionEqualToValue}
      size={renderSize}
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
