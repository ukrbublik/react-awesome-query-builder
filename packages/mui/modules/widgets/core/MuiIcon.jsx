import React from "react";
import DragHandle from "@mui/icons-material/DragHandle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Icon from "@mui/material/Icon";
import { Utils } from "@react-awesome-query-builder/ui";
const { DragIcon } = Utils;

const typeToIcon = {
  "delGroup": <DeleteIcon />,
  "delRuleGroup": <DeleteIcon />,
  "delRule": <DeleteIcon />,
  "addSubRuleSimple": <AddIcon />,
  "addSubRule": <AddIcon />,
  "addSubGroup": <AddIcon />,
  "addRule": <AddIcon />,
  "addGroup": <AddIcon />,
  "drag": <DragHandle />,
};

const typeToColor = {
  // "addRule": "primary",
  // "addGroup": "primary",
  // "delGroup": "secondary",
  // "delRuleGroup": "secondary",
  // "delRule": "secondary",
  "drag": "primary",
};

export default ({type, readonly}) => {
  let icon = typeToIcon[type] || null;
  if (!icon && type === "drag") {
    return <DragIcon />;
  }

  if (type === "drag") {
    return (
      <Icon
        size="small" 
        disabled={readonly} 
        color={typeToColor[type]}
      >{icon}</Icon>
    );
  } else {
    return icon;
  }
};
