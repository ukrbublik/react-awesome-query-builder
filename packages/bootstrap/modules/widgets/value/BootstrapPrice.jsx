import React from "react";
import { Input } from "reactstrap";
import { Utils } from "@react-awesome-query-builder/ui";
const { NumericFormat, getNumberFormatProps } = Utils.NumberFormat;

export default (props) => {
  const {
    value,
    setValue,
    readonly,
    placeholder,
    min,
    max,
    customProps,
  } = props;

  const numericFormatProps = getNumberFormatProps(props);

  const formattedValue = value == undefined ? "" : value;
  const isValid = value != undefined && (max == undefined || value <= max) && (min == undefined || value >= min);

  const handleChange = (values) => {
    let val = values.floatValue;
    setValue(val === undefined ? null : val);
  };

  return (
    <NumericFormat
      bsSize={"sm"}
      invalid={value != undefined && !isValid}
      customInput={Input}
      value={formattedValue}
      placeholder={placeholder}
      disabled={readonly}
      onValueChange={handleChange}
      {...customProps}
      {...numericFormatProps}
    />
  );
};
