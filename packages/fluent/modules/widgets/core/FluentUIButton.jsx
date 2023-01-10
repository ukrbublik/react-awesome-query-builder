import React from "react";
import { IconButton, ActionButton, CommandBarButton } from "@fluentui/react";

const FluentUIButton = (props) => {
  var type = props.type,
    label = props.label,
    onClick = props.onClick,
    readonly = props.readonly;

  const hideLabelsFor = {
    "addRuleGroup": true,
  };
  var typeToIcon = {
    addRuleGroup: "CirclePlus",
  };
  var typeToCommandIcon = {
    addRuleGroupExt: "Add",
    addRule: "Add",
    addGroup: "CirclePlus",
    delGroup: "Delete",
    delRuleGroup: "Delete",
    delRule: "Delete",
  };

  if (!label || hideLabelsFor[type]) {
    return (
      <IconButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        iconProps={{ iconName: typeToIcon[type] || typeToCommandIcon[type]  }}
        color="primary"
      />
    );
  } else if (typeToIcon[type]) {
    return (
      <ActionButton
        key={type}
        onClick={onClick}
        iconProps={{ iconName: typeToIcon[type] }}
        disabled={readonly}
        text={label}
      />
    );
  } else if (typeToCommandIcon[type]) {
    return (
      <CommandBarButton
        key={type}
        onClick={onClick}
        iconProps={{ iconName: typeToCommandIcon[type] }}
        disabled={readonly}
        text={label}
        color="primary"
        styles={{
          root: {
            backgroundColor: "transparent"
          }
        }}
      />
    );
  }
};

export default FluentUIButton;
