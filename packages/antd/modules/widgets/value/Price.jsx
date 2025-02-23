import React from "react";
import { NumericFormat } from "react-number-format";
import { Input } from "antd";

export default (props) => {
  const {
    value,
    setValue,
    readonly,
    placeholder,
    config,
    ...numericFormatProps
  } = props;

  const handleChange = (values) => {
    let val = values.floatValue;
    setValue(val === undefined ? null : val);
  };
  const { renderSize } = config.settings;

  return (
    <NumericFormat
      customInput={Input}
      type="text"
      size={renderSize}
      value={value}
      placeholder={placeholder}
      disabled={readonly}
      onValueChange={handleChange}
      {...numericFormatProps}
    />
  );
};
