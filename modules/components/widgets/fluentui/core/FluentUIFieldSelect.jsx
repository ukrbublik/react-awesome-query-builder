import React from "react";
import { Dropdown, DropdownMenuItemType } from "@fluentui/react";

const FluentUIFieldSelect = (props) => {
  var items = props.items,
    setField = props.setField,
    selectedKey = props.selectedKey,
    placeholder = props.placeholder;

  var onChange = function onChange(_, option) {
    if (option.key === undefined) return;
    setField(option.key.toString());
  };

  var renderOptions = function renderOptions(fields) {
    var options = [];
    Object.keys(fields).map(function (fieldKey) {
      var opt = {};
      var field = fields[fieldKey];
      var items = field.items,
        path = field.path,
        label = field.label,
        disabled = field.disabled;
      if (items) {
        opt.key = path;
        opt.text = label;
        opt.itemType = DropdownMenuItemType.Header;
      } else {
        opt.key = path;
        opt.text = label;
        opt.disabled = disabled;
      }
      options.push(opt);
    });
    return options;
  };

  return (
    <Dropdown
      placeholder={placeholder}
      options={renderOptions(items)}
      selectedKey={selectedKey}
      onChange={onChange}
      style={{ width: "auto" }}
    />
  );
};

export default FluentUIFieldSelect;
