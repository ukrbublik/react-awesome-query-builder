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
  const {type, label, onClick, readonly, renderIcon, config} = props;
  const {renderSize} = config.settings;
  const iconProps = {
    type,
    readonly,
    renderSize,
    config,
  };
  const icon = renderIcon?.(iconProps);

  if (!label || hideLabelsFor[type]) {
    // For icons, use the label as aria-label for accessibility
    return (
      <IconButton
        size={renderSize}
        disabled={readonly} 
        onClick={onClick} 
        color={typeToColor[type]}
        aria-label={label}
      >{icon}</IconButton>
    );
  } else {
    return (
      <Button 
        size={renderSize} 
        disabled={readonly} 
        onClick={onClick} 
        color={typeToColor[type]} 
        startIcon={icon}
      >{label}</Button>
    );
  }
});
