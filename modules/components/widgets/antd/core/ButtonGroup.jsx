import React from "react";
import { Button } from "antd";
const ButtonGroup = Button.Group;

export default ({children, config: {settings}}) => {
  const {renderSize} = settings;
  return <ButtonGroup
    size={renderSize}
  >{children}</ButtonGroup>;
};
