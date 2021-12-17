import React from "react";
import { Button } from "antd";
import { PlusOutlined, PlusCircleOutlined, DeleteFilled } from "@ant-design/icons";

export default ({type, onClick, label, readonly, config: {settings}}) => {
  const typeToIcon = {
    "addRule": <PlusOutlined />,
    "addGroup": <PlusCircleOutlined />,
    "delRule": <DeleteFilled />, //?
    "delGroup": <DeleteFilled />,
    "delRuleGroup": <DeleteFilled />,
    "addRuleGroup": <PlusOutlined />,
  };

  const typeToClass = {
    "addRule": "action action--ADD-RULE",
    "addGroup": "action action--ADD-GROUP",
    "delRule": "action action--DELETE", //?
    "delGroup": "action action--DELETE",
    "delRuleGroup": "action action--DELETE",
    "addRuleGroup": <PlusOutlined />,
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
      disabled={readonly}
    >{btnLabel}</Button>
  );
};
