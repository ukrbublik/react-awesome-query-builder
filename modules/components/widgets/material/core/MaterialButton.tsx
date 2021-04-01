import React from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

export default ({type, label, onClick, config}) => {
  const typeToOnlyIcon = {
    "delGroup": <DeleteIcon />,
    "delRule": <DeleteIcon />,
    "addRuleGroup": <AddIcon />,
  };
  const typeToIcon = {
    "addRule": <AddIcon />,
    "addGroup": <AddIcon />,
  };
  const typeToColor = {
    "addRule": "default",
    "addGroup": "primary",
    "delGroup": "secondary",
    "delRule": "secondary",
  };
  if (typeToOnlyIcon[type])
    return <IconButton size="small" onClick={onClick} color={typeToColor[type]}>{typeToOnlyIcon[type]}</IconButton>;
  else
    return <Button size="small" onClick={onClick} color={typeToColor[type]} startIcon={typeToIcon[type]}>{label}</Button>;
};
