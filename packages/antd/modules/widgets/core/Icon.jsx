import React from "react";
import { PlusOutlined, PlusCircleOutlined, DeleteFilled, HolderOutlined, DragOutlined } from "@ant-design/icons";
import { Utils } from "@react-awesome-query-builder/ui";
const { DragIcon } = Utils;

const typeToIcon = {
  "addRule": <PlusOutlined />,
  "addGroup": <PlusCircleOutlined />,
  "delRule": <DeleteFilled />,
  "delGroup": <DeleteFilled />,
  "delRuleGroup": <DeleteFilled />,
  "addSubRuleSimple": <PlusOutlined />,
  "addSubRule": <PlusOutlined />,
  "addSubGroup": <PlusCircleOutlined />,
  "drag": HolderOutlined ? <HolderOutlined /> : <DragOutlined />, // Compatible with @ant-design/icons@4.x
};

export default ({type}) => {
  let icon = typeToIcon[type] || null;
  if (!icon && type === "drag") {
    icon = <DragIcon />;
  }

  return icon;
};
