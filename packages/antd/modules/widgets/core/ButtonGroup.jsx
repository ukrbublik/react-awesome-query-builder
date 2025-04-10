
import React from "react";
import { Space } from "antd";

export default ({children, config: {settings}}) => {
  const {renderSize} = settings;
  return <Space.Compact
    size={renderSize}
  >{children}</Space.Compact>;
};
