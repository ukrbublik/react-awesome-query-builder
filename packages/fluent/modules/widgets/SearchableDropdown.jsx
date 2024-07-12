import React, { useState } from "react";
import { Dropdown, DropdownMenuItemType, SearchBox } from "@fluentui/react";

// Credits for this code belong to: https://github.com/microsoft/fluentui/issues/16566#issuecomment-853933969
const SearchableDropdown = (props) => {
  const [searchText, setSearchText] = useState("");

  function renderOption(option) {
    return (option.itemType === DropdownMenuItemType.Header 
        && option.key === "FilterHeader") 
      ? <SearchBox 
        onChange={(ev, newValue) => setSearchText(newValue)} 
        underlined={true} 
        placeholder="Search options"
      /> 
      : <>{option.text}</>;
  }

  return (
    <Dropdown
      {...props}
      options={[
        { key: "FilterHeader", text: "-", itemType: DropdownMenuItemType.Header },
        { key: "divider_filterHeader", text: "-", itemType: DropdownMenuItemType.Divider },
        ...props.options.map(option => !option.disabled && option.text.toLowerCase().indexOf(searchText.toLowerCase()) > -1
          ? option : { ...option, hidden: true }
        ),
      ]}
      calloutProps={{ shouldRestoreFocus: false, setInitialFocus: false }} //not working
      onRenderOption={renderOption}
      onDismiss={() => setSearchText("")}
    />
  );
};

export default SearchableDropdown;