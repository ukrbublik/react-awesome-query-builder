import React from "react";
import { IconButton, ActionButton, CommandBarButton, DefaultButton } from "@fluentui/react";

const hideLabelsFor = {
  "addSubRuleSimple": true,
  "delRuleGroup": true,
  "delRule": true,  
  // "addSubRule": true,
  // "addSubGroup": true,
  // "delGroup": true,
};
const useAction = {
  "addSubRuleSimple": true,
};

const FluentUIButton = (props) => {
  const { type, label, onClick, readonly, renderIcon, config } = props;

  let renderBtn;
  if (!label || hideLabelsFor[type]) {
    renderBtn = (bprops) => (
      <CommandBarButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        text={label}
        color="primary"
        styles={{
          root: {
            backgroundColor: "transparent"
          }
        }}
        {...bprops}
      />
    );
  } else if (useAction[type]) {
    renderBtn = (bprops) => (
      <ActionButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        {...bprops}
      />
    );
  } else {
    renderBtn = (bprops) => (
      <CommandBarButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        {...bprops}
      />
    );
  }

  const iconProps = {
    type,
    readonly,
    config,
    renderBtn,
  };
  const buttonIcon = renderIcon?.(iconProps);

  return buttonIcon;
};

export default FluentUIButton;
