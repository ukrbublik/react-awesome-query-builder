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
  const { type, label, onClick, readonly, renderIcon } = props;

  let renderBtn;
  if (!label || hideLabelsFor[type]) {
    renderBtn = (bprops) => (
      <IconButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        color="primary"
        {...bprops}
      />
    );
  } else if (useAction[type]) {
    renderBtn = (bprops) => (
      <ActionButton
        key={type}
        onClick={onClick}
        disabled={readonly}
        text={label}
        {...bprops}
      />
    );
  } else {
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
  }

  const renderDefaultButton = (bprops) => (
    <DefaultButton
      key={type}
      onClick={onClick}
      disabled={readonly}
      text={label}
      color="primary"
      {...bprops}
    />
  );

  const iconProps = {
    type,
    readonly,
    renderBtn,
    renderDefaultButton,
  };
  const buttonIcon = renderIcon?.(iconProps);
  return buttonIcon;

};

export default FluentUIButton;
