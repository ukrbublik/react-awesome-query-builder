import React, { useState } from "react";
import { Dropdown } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { mapListValues } = Utils.ListUtils;

export default ({
  listValues,
  value,
  setValue,
  allowCustomValues,
  readonly,
  customProps,
}) => {
  const [selectedKeys, setSelectedKeys] = useState(value ?? []);

  const renderOptions = () =>
    mapListValues(listValues, ({ title, value }) => {
      return { key: value, text: title };
    });

  const onChange = (e, item) => {
    if (item) {
      setSelectedKeys(
        item.selected
          ? [...selectedKeys, item.key]
          : selectedKeys.filter((key) => key !== item.key)
      );
      setValue(selectedKeys);
    }
  };

  return (
    <Dropdown
      placeholder="Select options"
      selectedKeys={selectedKeys}
      // eslint-disable-next-line react/jsx-no-bind
      onChange={onChange}
      multiSelect
      options={renderOptions()}
      disabled={readonly}
    />
  );
};
