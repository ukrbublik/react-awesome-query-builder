import React from "react";
import { Dropdown, DropdownMenuItemType } from "@fluentui/react";

const FluentUIFieldSelect = (props) => {
  var items = props.items,
    setField = props.setField,
    selectedKey = props.selectedKey,
    placeholder = props.placeholder,
    errorText = props.errorText;

  var onChange = function onChange(_, option) {
    if (option.key === undefined) return;
    setField(option.key.toString());
  };

  const onRenderTitle = function onRenderTitle(options) {
    const option = options[0];
    return (
      <div>
        <span>{option.title}</span>
      </div>
    );
  };

  var renderOptions = function renderOptions(fields, level = 0) {
    var options = [];
    var divKey = 0; 
    Object.keys(fields).map(function (fieldKey) {
      var opt = {};
      var field = fields[fieldKey];
      const prefix = "\u00A0\u00A0".repeat(level);
      var items = field.items,
        path = field.path,
        label = field.label,
        disabled = field.disabled;
      if (items) {
        opt.key = path;
        opt.title = label;
        opt.text = prefix + label;
        opt.itemType = DropdownMenuItemType.Header;
        var itemOptions=renderOptions(items, level+1);
        options.push(opt);
        for (var i of itemOptions) {
          options.push(i);
        }
        options.push({
          key: "divider_"+divKey.toString(),
          text: "-",
          title: "",
          itemType: DropdownMenuItemType.Divider
        });
        divKey +=1;
      } else {
        const optText = field.matchesType ? <b>{prefix + label}</b> : prefix + label;
        opt.key = path;
        opt.title = label;
        opt.text = optText;
        opt.disabled = disabled;
        options.push(opt);
      }
    });
    return options;
  };

  return (
    <Dropdown
      placeholder={placeholder}
      options={renderOptions(items)}
      selectedKey={selectedKey}
      onChange={onChange}
      onRenderTitle={onRenderTitle}
      dropdownWidth={"auto"}
      styles={{
        title : {
          color: errorText ? "red" : null,
        }
      }}
    />
  );
};

export default FluentUIFieldSelect;
