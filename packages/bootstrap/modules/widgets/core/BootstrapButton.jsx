import React from "react";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

export default ({ type, label, onClick, config }) => {
  const hideLabelsFor = {
    "addRuleGroup": true
  };
  const typeToIcon = {
    delGroup: faTrashAlt,
    delRuleGroup: faTrashAlt,
    delRule: faTrashAlt,
    addRuleGroup: faPlus,
    addRuleGroupExt: faPlus,
    addRule: faPlus,
    addGroup: faPlus,
  };
  const typeToColor = {
    addRule: "primary",
    addGroup: "primary",
    delGroup: "danger",
    delRuleGroup: "danger",
    delRule: "danger",
  };

  let isOnlyIcon = hideLabelsFor[type] || !label;

  return (
    <Button size="sm" color={typeToColor[type]} onClick={onClick}>
      <FontAwesomeIcon icon={typeToIcon[type]} /> {!isOnlyIcon && label}
    </Button>
  );
};
