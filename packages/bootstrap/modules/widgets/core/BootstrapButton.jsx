import React from "react";
import { Button } from "reactstrap";

export default (props) => {
  const { type, label, onClick, renderIcon } = props;
  const Icon = renderIcon?.(props) || null;

  const hideLabelsFor = {
    "addRuleGroup": true,
    "delRuleGroup": true,
    "delRule": true,
  };
  const typeToColor = {
    addRule: "primary",
    addGroup: "primary",
    delGroup: "danger",
    delRuleGroup: "danger",
    delRule: "danger",
  };

  let isOnlyIcon = hideLabelsFor[type] || !label;

  if (!onClick) {
    return Icon;
  } else {
    return (
      <Button size="sm" color={typeToColor[type]} onClick={onClick}>
        {Icon}{!isOnlyIcon && label}
      </Button>
    );
  }
};
