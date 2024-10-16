import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt, faUpDown } from "@fortawesome/free-solid-svg-icons";
import { Utils } from "@react-awesome-query-builder/ui";
const { DragIcon } = Utils;

const typeToIcon = {
  delGroup: faTrashAlt,
  delRuleGroup: faTrashAlt,
  delRule: faTrashAlt,
  addSubRuleSimple: faPlus,
  addSubRule: faPlus,
  addSubGroup: faPlus,
  addRule: faPlus,
  addGroup: faPlus,
  drag: faUpDown,
};

export default ({ type }) => {
  let icon = typeToIcon[type] 
    && <FontAwesomeIcon
      icon={typeToIcon[type]}
    /> || null;
  if (!icon && type === "drag") {
    icon = <DragIcon />;
  }

  return icon;
};
