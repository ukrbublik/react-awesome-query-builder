import React from "react";
import { DragIcon } from "../../../utils";

export default ({type}) => {
  const typeToIcon = {
  };
  let icon = typeToIcon[type] || null;
  if (!icon && type === "drag") {
    icon = <DragIcon />;
  }

  return icon;
};
