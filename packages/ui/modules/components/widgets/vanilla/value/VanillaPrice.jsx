import React from "react";
import { NumericFormat, getNumberFormatProps } from "../../../../utils/numberFormat";

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
  //const isValid = value != undefined && (max == undefined || value <= max) && (min == undefined || value >= min);

  const onValueChange = (values) => {
    let { floatValue } = values;
    setValue(floatValue !== undefined ? floatValue : undefined);
  };

  return (
    <NumericFormat
      value={formattedValue}
      placeholder={placeholder}
      disabled={readonly}
      onValueChange={onValueChange}
      {...customProps}
      {...numericFormatProps}
    />
  );
};
