import React from 'react';
import { Button } from 'antd';

export default ({type, onClick, label, config: {settings}}) => {
  const typeToIcon = {
    "addRule": "plus",
    "addGroup": "plus-circle-o",
    "delRule": "delete", //?
    "delGroup": "delete",

    "addRuleGroup": "plus",
    "delRuleGroup": "delete",
  };

  const typeToClass = {
    "addRule": "action action--ADD-RULE",
    "addGroup": "action action--ADD-GROUP",
    "delRule": "action action--DELETE", //?
    "delGroup": "action action--DELETE",

    "addRuleGroup": "plus",
    "delRuleGroup": "delete",
  };

  const typeToType = {
    "delRule": "danger",
    "delGroup": "danger",
    "delRuleGroup": "danger",
  };

  const {renderSize} = settings;

  const btnLabel = type == "addRuleGroup" ? "" : label;

  return (
    <Button
      key={type}
      type={typeToType[type] || "default"}
      icon={typeToIcon[type]}
      className={typeToClass[type]}
      onClick={onClick}
      size={renderSize}
    >{btnLabel}</Button>
  )
};
