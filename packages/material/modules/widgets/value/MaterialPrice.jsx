import React from "react";
import TextField from "@material-ui/core/TextField";
import { NumericFormat } from "react-number-format";

export default function MaterialPriceWidget(props) {
  const {
    value,
    setValue,
    readonly,
    min,
    max,
    step,
    placeholder,
    thousandSeparator,
    thousandsGroupStyle,
    suffix,
    prefix,
    customProps,
  } = props;

  const handleChange = (values) => {
    const newValue = values.floatValue;
    setValue(newValue === undefined ? null : newValue);
  };

  const formattedValue = value == undefined ? "" : value;

  return (
    <NumericFormat
      customInput={TextField}
      value={formattedValue}
      placeholder={!readonly ? placeholder : ""}
      InputProps={{
        readOnly: readonly,
      }}
      inputProps={{
        min: min,
        max: max,
        step: step,
      }}
      disabled={readonly}
      onValueChange={handleChange}
      thousandSeparator={thousandSeparator}
      thousandsGroupStyle={thousandsGroupStyle}
      suffix={suffix}
      prefix={prefix}
      {...customProps}
    />
  );
}
