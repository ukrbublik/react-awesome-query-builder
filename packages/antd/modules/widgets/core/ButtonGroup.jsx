import React from "react";
import { Button, Space, version as antdVersion } from "antd";

export default ({ children, config: { settings } }) => {
  const { renderSize } = settings;
  const antdMajorVersion = parseInt(antdVersion.split(".")[0]);

  if (antdMajorVersion >= 5) {
    return <Space.Compact size={renderSize}>{children}</Space.Compact>;
  } else {
    const ButtonGroup = Button.Group;
    return <ButtonGroup size={renderSize}>{children}</ButtonGroup>;
  }
};
