import React from "react";
import { NumericFormat } from "react-number-format";
import { TextField } from "@fluentui/react";

const FluentUIPrice = (props) => {
  const {
    value,
    setValue,
    readonly,
    placeholder,
    label,
    ...numericFormatProps
  } = props;

  const handleValueChange = (values) => {
    const { floatValue } = values;
    setValue(floatValue === undefined ? null : floatValue);
  };

  return (
    <NumericFormat
      value={value}
      readonly={readonly}
      placeholder={placeholder}
      displayType="input"
      customInput={TextField}
      onValueChange={handleValueChange}
      {...numericFormatProps}
    />
  );
};

export default FluentUIPrice;
