import React from "react";
import { Space } from "antd";
// Button.Group is deprecated in Ant Design v5
const ButtonGroup = Space.Compact;

export default ({children, config: {settings}}) => {
  const {renderSize} = settings;
  return <ButtonGroup
    size={renderSize}
  >{children}</ButtonGroup>;
};
