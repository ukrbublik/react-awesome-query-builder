import React from "react";
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
  showSearch,
}) => {
  var onChange = function onChange(_, option) {
    if (option.key === undefined) return;
    setValue(option.key.toString());
  };

  var renderOptions = function renderOptions(fields) {
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

  return (
    <DropdownType
      placeholder={placeholder}
      options={renderOptions(listValues)}
      selectedKey={value}
      onChange={onChange}
      dropdownWidth={"auto"}
      disabled={readonly}
      {...customProps}
    />
  );
};
