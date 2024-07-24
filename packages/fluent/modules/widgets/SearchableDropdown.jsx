import React, { useState, useCallback, useMemo } from "react";
import { Dropdown, DropdownMenuItemType, SearchBox } from "@fluentui/react";

// Credits for this code belong to: https://github.com/microsoft/fluentui/issues/16566#issuecomment-853933969
const SearchableDropdown = (props) => {
  const {options, customProps, searchProps, ...dropdownProps} = props;
  const {searchProps: customSearchProps, ...customDropdownProps} = customProps ?? {};

  const [searchText, setSearchText] = useState("");

  const onSearchChange = useCallback((ev, newValue) => setSearchText(newValue), [setSearchText]);

  const calloutProps = { shouldRestoreFocus: false, setInitialFocus: false }; //not working

  const renderOption = useCallback((option) => {
    return (option.itemType === DropdownMenuItemType.Header 
        && option.key === "FilterHeader") 
      ? <SearchBox 
        onChange={onSearchChange} 
        underlined={true} 
        placeholder={searchProps?.placeholder}
        {...(customSearchProps ?? {})}
      /> 
      : <>{option.text}</>;
  }, [SearchBox, onSearchChange, customSearchProps, searchProps]);

  const onDismiss = useCallback(() => setSearchText(""), [setSearchText]);

  const dropdownOptions = useMemo(() => ([
    { key: "FilterHeader", text: "-", itemType: DropdownMenuItemType.Header },
    { key: "divider_filterHeader", text: "-", itemType: DropdownMenuItemType.Divider },
    ...options.map(option => !option.disabled && option.text.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      ? option : { ...option, hidden: true }
    ),
  ]), [options, searchText]);

  return (
    <Dropdown
      options={dropdownOptions}
      calloutProps={calloutProps}
      onRenderOption={renderOption}
      onDismiss={onDismiss}
      {...dropdownProps}
      {...customDropdownProps}
    />
  );
};

export default SearchableDropdown;