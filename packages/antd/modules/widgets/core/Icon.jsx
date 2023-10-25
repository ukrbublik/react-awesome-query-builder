import React from "react";
import { PlusOutlined, PlusCircleOutlined, DeleteFilled, HolderOutlined } from "@ant-design/icons";
import { Utils } from "@react-awesome-query-builder/ui";
const { DragIcon } = Utils;

const typeToIcon = {
  "addRule": <PlusOutlined />,
  "addGroup": <PlusCircleOutlined />,
  "delRule": <DeleteFilled />,
  "delGroup": <DeleteFilled />,
  "delRuleGroup": <DeleteFilled />,
  "addRuleGroup": <PlusOutlined />,
  "addRuleGroupExt": <PlusOutlined />,
  "drag": <HolderOutlined />,
};

export default ({type}) => {
  let icon = typeToIcon[type] || null;
  if (!icon && type === "drag") {
    icon = <DragIcon />;
  }

  return icon;
};
