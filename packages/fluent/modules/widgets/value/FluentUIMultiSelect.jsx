import React, { useState } from "react";
import { Dropdown } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
import { SearchableDropdown } from "../SearchableDropdown"

const { mapListValues } = Utils.ListUtils;

export default (props) => {
  const {
    listValues,
    value,
    setValue,
    readonly,
    placeholder,
    showSearch,
  } = props
  const [selectedKeys, setSelectedKeys] = useState(value ?? []);

  console.log('proppies', props)

  const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => {
      return { key: value, text: title };
    });

  const onChange = (e, item) => {
    if (item) {
      const newSelectedItems = item.selected
        ? [...selectedKeys, item.key]
        : selectedKeys.filter((key) => key !== item.key)

      setSelectedKeys(newSelectedItems);
      setValue(newSelectedItems);
    }
  };

  const DropdownType = showSearch ? SearchableDropdown : Dropdown

  return (
    <DropdownType
      placeholder={placeholder || "Select options"}
      // eslint-disable-next-line react/jsx-no-bind
      onChange={onChange}
      multiSelect
      options={renderOptions()}
      disabled={readonly}
    />
  );
};