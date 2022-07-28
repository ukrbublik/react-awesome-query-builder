import React from "react";
import { mapListValues } from "../../../../utils/stuff";
import { Dropdown } from "@fluentui/react";
import omit from "lodash/omit";

export default ({
  listValues,
  value,
  setValue,
  allowCustomValues,
  readonly,
  customProps,
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

  return (
    <Dropdown
      options={renderOptions(listValues)}
      selectedKey={value}
      onChange={onChange}
      style={{ width: "auto" }}
      disabled={readonly}
    />
  );
};
