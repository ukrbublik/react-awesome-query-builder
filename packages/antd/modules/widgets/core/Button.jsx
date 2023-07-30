import React from "react";
import { Button } from "antd";

const hideLabelsFor = {
  "addRuleGroup": true,
  "delGroup": true,
  "delRuleGroup": true,
  "delRule": true,
};

const typeToClass = {
  "addRule": "action action--ADD-RULE",
  "addGroup": "action action--ADD-GROUP",
  "delRule": "action action--DELETE",
  "delGroup": "action action--DELETE",
  "delRuleGroup": "action action--DELETE",
  "addRuleGroup": "action action--ADD-RULE",
};

const typeToType = {
  "delRule": "text",
  // "delGroup": "default",
  // "delRuleGroup": "default",
};

const dangerFor = {
  "delRule": true,
  "delGroup": true,
  "delRuleGroup": true,
};

export default (props) => {
  const {type, onClick, label, readonly, config: {settings}, renderIcon} = props;
  const {renderSize} = settings;
  const iconProps = {
    type,
    readonly,
  };
  const icon = renderIcon?.(iconProps);
  const btnLabel = hideLabelsFor[type] ? "" : label;

  return (
    <Button
      danger={dangerFor[type] === true}
      key={type}
      type={typeToType[type] || "default"}
      icon={icon}
      className={typeToClass[type]}
      onClick={onClick}
      size={renderSize}
      disabled={readonly}
    >{btnLabel}</Button>
  );
};
