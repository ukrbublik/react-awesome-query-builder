import React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

const hideLabelsFor = {
  "addRuleGroup": true,
  "addRuleGroupExt": true,
  "delGroup": true,
  "delRuleGroup": true,
  "delRule": true,
};

const typeToColor = {
  "addRule": "primary",
  "addGroup": "primary",
  "delGroup": "secondary",
  "delRuleGroup": "secondary",
  "delRule": "secondary",
};

export default (props) => {
  const {type, label, onClick, readonly, renderIcon} = props;
  const iconProps = {
    type,
    readonly,
  };
  const icon = renderIcon?.(iconProps);

  if (!label || hideLabelsFor[type]) {
    // For icons, use the label as aria-label for accessibility
    return (
      <IconButton
        size="small" 
        disabled={readonly} 
        onClick={onClick} 
        color={typeToColor[type]}
        aria-label={label}
      >{icon}</IconButton>
    );
  } else {
    return (
      <Button
        size="small" 
        disabled={readonly} 
        onClick={onClick} 
        color={typeToColor[type]} 
        startIcon={icon}
      >{label}</Button>
    );
  }
};
