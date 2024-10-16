import React, { memo } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

const hideLabelsFor = {
  "addSubRuleSimple": true,
  // "addSubRule": true,
  // "addSubGroup": true,
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

export default memo((props) => {
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
});
