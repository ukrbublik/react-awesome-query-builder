import React from "react";
import { TextField } from "@fluentui/react";
import { Utils } from "@react-awesome-query-builder/ui";
const { NumericFormat, getNumberFormatProps } = Utils.NumberFormat;

const FluentUIPrice = (props) => {
  const {
    value,
    setValue,
    readonly,
    placeholder,
    min,
    max,
    customProps,

    prefix,
    suffix,
  } = props;

  const numericFormatProps = getNumberFormatProps(props, ["prefix", "suffix"]);

  const formattedValue = value == undefined ? "" : value;
  const isValid = value != undefined && (max == undefined || value <= max) && (min == undefined || value >= min);

  const handleValueChange = (values) => {
    const { floatValue } = values;
    setValue(floatValue === undefined ? null : floatValue);
  };

  return (
    <NumericFormat
      value={formattedValue}
      invalid={value != undefined && !isValid}
      readOnly={readonly}
      //disabled={readonly}
      placeholder={placeholder}
      customInput={TextField}
      onValueChange={handleValueChange}
      prefix={prefix}
      suffix={suffix}
      {...customProps}
      {...numericFormatProps}
    />
  );
};

export default FluentUIPrice;
