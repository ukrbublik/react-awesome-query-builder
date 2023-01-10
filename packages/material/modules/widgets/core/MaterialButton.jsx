import React from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

export default ({type, label, onClick, readonly, config}) => {
  const hideLabelsFor = {
    "addRuleGroup": true,
    "addRuleGroupExt": true,
  };
  const typeToIcon = {
    "delGroup": <DeleteIcon />,
    "delRuleGroup": <DeleteIcon />,
    "delRule": <DeleteIcon />,
    "addRuleGroup": <AddIcon />,
    "addRuleGroupExt": <AddIcon />,
    "addRule": <AddIcon />,
    "addGroup": <AddIcon />,
  };
  const typeToColor = {
    "addRule": "default",
    "addGroup": "primary",
    "delGroup": "secondary",
    "delRuleGroup": "secondary",
    "delRule": "secondary",
  };
  if (!label || hideLabelsFor[type])
    return <IconButton size="small" disabled={readonly} onClick={onClick} color={typeToColor[type]}>{typeToIcon[type]}</IconButton>;
  else
    return <Button size="small" disabled={readonly} onClick={onClick} color={typeToColor[type]} startIcon={typeToIcon[type]}>{label}</Button>;
};
