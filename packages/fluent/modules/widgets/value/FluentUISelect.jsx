import React, { useCallback, useMemo } from "react";
import { Dropdown } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
import SearchableDropdown from "../SearchableDropdown";
const { mapListValues } = Utils.ListUtils;

export default ({
  listValues,
  value,
  setValue,
  allowCustomValues,
  readonly,
  customProps,
  placeholder,
  searchPlaceholder,
  showSearch,
}) => {
  const onChange = useCallback((_, option) => {
    if (option.key === undefined) return;
    setValue(option.key.toString());
  }, [setValue]);

  const renderOptions = (listValues) => {
    var options = [];
    mapListValues(listValues, ({ title, value }) => {
      options.push({
        key: value,
        text: title,
      });
    });
    return options;
  };

  const DropdownType = showSearch ? SearchableDropdown : Dropdown;

  const searchProps = useMemo(() => ({
    placeholder: searchPlaceholder, // || "Search option"
  }), [searchPlaceholder]);

  const otherProps = {
    ...(customProps ?? {}),
    ...(showSearch ? {searchProps} : {}),
  };

  return (
    <DropdownType
      placeholder={placeholder || "Select option"}
      options={renderOptions(listValues)}
      selectedKey={value}
      onChange={onChange}
      dropdownWidth={"auto"}
      disabled={readonly}
      {...otherProps}
    />
  );
};
