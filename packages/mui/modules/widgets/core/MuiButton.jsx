import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

export default ({type, label, onClick, readonly, config}) => {
  const hideLabelsFor = {
    "addRuleGroup": true,
    "addRuleGroupExt": true,
  };
  const typeToIcon = {
    "delGroup": <DeleteIcon />,
    "delRuleGroup": <DeleteIcon />,
    "delRule": <DeleteIcon />,
    "addRule": <AddIcon />,
    "addGroup": <AddIcon />,
    "addRuleGroupExt": <AddIcon />,
    "addRuleGroup": <AddIcon />,
  };
  const typeToColor = {
    "addRule": "neutral",
    "addGroup": "primary",
    "delGroup": "secondary",
    "delRuleGroup": "secondary",
    "delRule": "secondary",
  };
  if (!label || hideLabelsFor[type]) {
    return (
      <IconButton
        size="small" 
        disabled={readonly} 
        onClick={onClick} 
        color={typeToColor[type]}
      >{typeToIcon[type]}</IconButton>
    );
  } else {
    return (
      <Button 
        size="small" 
        disabled={readonly} 
        onClick={onClick} 
        color={typeToColor[type]} 
        startIcon={typeToIcon[type]}
      >{label}</Button>
    );
  }
};
