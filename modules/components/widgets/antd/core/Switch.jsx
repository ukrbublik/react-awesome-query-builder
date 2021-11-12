import React from "react";
import { Switch , Button } from "antd";
import { LockFilled, UnlockOutlined } from "@ant-design/icons";

export default ({value, setValue, label, checkedLabel, hideLabel, id, config, type}) => {
  const {renderSize} = config.settings;
  const onSwitch = switchValue => setValue(switchValue);
  const onClick = () => setValue(!value);
  const postfix = type;
  const showLabel = hideLabel ? null : (value ? (checkedLabel || label) : label);

  if (type == "lock") {
    return <Button
      key={id+postfix}
      type={value ? "danger" : undefined}
      icon={value ? <LockFilled /> : <UnlockOutlined />}
      onClick={onClick}
      checked={!!value}
      size={renderSize}
    >{showLabel}</Button>;
  }

  return <Switch
    key={id+postfix}
    checkedChildren={checkedLabel || label}
    unCheckedChildren={value ? (checkedLabel || label) : label}
    onChange={onSwitch}
    checked={!!value}
    size={renderSize}
  ></Switch>;
};
