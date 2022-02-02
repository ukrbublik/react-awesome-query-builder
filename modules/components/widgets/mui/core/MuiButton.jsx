import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

export default ({type, label, onClick, readonly, config}) => {
  const typeToOnlyIcon = {
    "delGroup": <DeleteIcon />,
    "delRuleGroup": <DeleteIcon />,
    "delRule": <DeleteIcon />,
    "addRuleGroup": <AddIcon />,
  };
  const typeToIcon = {
    "addRule": <AddIcon />,
    "addGroup": <AddIcon />,
    "addRuleGroupExt": <AddIcon />,
  };
  const typeToColor = {
    "addRule": "neutral",
    "addGroup": "primary",
    "delGroup": "secondary",
    "delRuleGroup": "secondary",
    "delRule": "secondary",
  };
  if (typeToOnlyIcon[type])
    return <IconButton size="small" disabled={readonly} onClick={onClick} color={typeToColor[type]}>{typeToOnlyIcon[type]}</IconButton>;
  else
    return <Button size="small" disabled={readonly} onClick={onClick} color={typeToColor[type]} startIcon={typeToIcon[type]}>{label}</Button>;
};
