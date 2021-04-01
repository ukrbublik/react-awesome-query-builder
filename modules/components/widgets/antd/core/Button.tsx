import React from "react";
import { Button } from "antd";
import { PlusOutlined, PlusCircleOutlined, DeleteFilled } from "@ant-design/icons";

export default ({type, onClick, label, config: {settings}}) => {
  const typeToIcon = {
    "addRule": <PlusOutlined />,
    "addGroup": <PlusCircleOutlined />,
    "delRule": <DeleteFilled />, //?
    "delGroup": <DeleteFilled />,

    "addRuleGroup": <PlusOutlined />,
    "delRuleGroup": <DeleteFilled />,
  };

  const typeToClass = {
    "addRule": "action action--ADD-RULE",
    "addGroup": "action action--ADD-GROUP",
    "delRule": "action action--DELETE", //?
    "delGroup": "action action--DELETE",

    "addRuleGroup": <PlusOutlined />,
    "delRuleGroup": <DeleteFilled />,
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
  );
};
