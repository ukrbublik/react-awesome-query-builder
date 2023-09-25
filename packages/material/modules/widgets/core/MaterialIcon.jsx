import React from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import DragHandle from "@material-ui/icons/DragHandle";
import Icon from "@material-ui/core/Icon";
import { Utils } from "@react-awesome-query-builder/ui";
const { DragIcon } = Utils;

const typeToIcon = {
  "delGroup": <DeleteIcon />,
  "delRuleGroup": <DeleteIcon />,
  "delRule": <DeleteIcon />,
  "addRuleGroup": <AddIcon />,
  "addRuleGroupExt": <AddIcon />,
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
  "drag": "inherit",
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
