import React from "react";
import { Dropdown } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
import SearchableDropdown from "../SearchableDropdown";

const { mapListValues } = Utils.ListUtils;

export default ({
  listValues,
  value,
  setValue,
  readonly,
  placeholder,
  showSearch,
}) => {

  const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => {
      return { key: value, text: title };
    });

  const onChange = (_, item) => {
    if (item) {
      const currentItems = value ?? []
      const selectedItems = item.selected
        ? [...currentItems, item.key]
        : currentItems.filter((key) => key !== item.key);

      setValue(selectedItems);
    }
  };

  const DropdownType = showSearch ? SearchableDropdown : Dropdown;

  return (
    <DropdownType
      placeholder={placeholder || "Select options"}
      selectedKeys={value}
      // eslint-disable-next-line react/jsx-no-bind
      onChange={onChange}
      multiSelect
      options={renderOptions()}
      disabled={readonly}
    />
  );
};