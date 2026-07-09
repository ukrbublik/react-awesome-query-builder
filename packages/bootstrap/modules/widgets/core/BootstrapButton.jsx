import React from "react";
import { Button } from "reactstrap";

const hideLabelsFor = {
  "addSubRuleSimple": true,
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

export default (props) => {
  const { type, label, onClick, renderIcon, readonly, config } = props;
  const iconProps = {
    type,
    readonly,
    config,
  };
  const Icon = renderIcon?.(iconProps) || null;

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
