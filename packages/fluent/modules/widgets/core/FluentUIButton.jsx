import React from "react";
import { IconButton, ActionButton, CommandBarButton } from "@fluentui/react";

const FluentUIButton = (props) => {
  var type = props.type,
    label = props.label,
    onClick = props.onClick,
    readonly = props.readonly;

  var typeToOnlyIcon = {
    delGroup: "Delete",
    delRuleGroup: "Delete",
    delRule: "Delete",
    addRuleGroup: "CirclePlus",
    addRuleGroupExt: "Add",
  };
  var typeToIcon = {
  };
  var typeToCommandIcon = {
    addRule: "Add",
    addGroup: "CirclePlus",
  };

  if (typeToOnlyIcon[type]) {
    return (
      <IconButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        iconProps={{ iconName: typeToOnlyIcon[type] }}
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
