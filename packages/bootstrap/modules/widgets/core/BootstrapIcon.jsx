import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt, faUpDown } from "@fortawesome/free-solid-svg-icons";
import { Utils } from "@react-awesome-query-builder/ui";
const { DragIcon } = Utils;

export default ({ type }) => {
  const typeToIcon = {
    delGroup: faTrashAlt,
    delRuleGroup: faTrashAlt,
    delRule: faTrashAlt,
    addRuleGroup: faPlus,
    addRuleGroupExt: faPlus,
    addRule: faPlus,
    addGroup: faPlus,
    drag: faUpDown,
  };

  let icon = typeToIcon[type] && 
    <FontAwesomeIcon
      icon={typeToIcon[type]}
    />;
  if (!icon && type === "drag") {
    icon = <DragIcon />;
  }

  return icon;
};
