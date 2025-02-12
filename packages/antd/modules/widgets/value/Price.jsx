import React from "react";
import { NumericFormat } from "react-number-format";

export default (props) => {
  const {
    value,
    setValue,
    readonly,
    placeholder,
    ...numericFormatProps
  } = props;

  const handleChange = (values) => {
    let val = values.floatValue;
    setValue(val === undefined ? null : val);
  };

  return (
    <NumericFormat
      type="text"
      value={value}
      placeholder={placeholder}
      disabled={readonly}
      onValueChange={handleChange}
      {...numericFormatProps}
    />
  );
};
