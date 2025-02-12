import React from "react";
import { NumericFormat } from "react-number-format";

export default (props) => {
  const {
    value,
    setValue,
    readonly,
    placeholder,
    customProps,
    ...numericFormatProps
  } = props;

  const onValueChange = (values) => {
    let { floatValue } = values;
    setValue(floatValue !== undefined ? floatValue : undefined);
  };

  return (
    <NumericFormat
      value={value}
      placeholder={placeholder}
      disabled={readonly}
      onValueChange={onValueChange}
      {...customProps}
      {...numericFormatProps}
    />
  );
};
