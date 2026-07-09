import React, { useMemo } from "react";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Utils } from "@react-awesome-query-builder/ui";
const { NumericFormat, getNumberFormatProps } = Utils.NumberFormat;

export default function MaterialPriceWidget(props) {
  const {
    value,
    setValue,
    readonly,
    min,
    max,
    step,
    placeholder,
    customProps,

    prefix,
    suffix,
  } = props;

  const numericFormatProps = getNumberFormatProps(props, ["prefix", "suffix"]);

  const handleChange = (values) => {
    const newValue = values.floatValue;
    setValue(newValue === undefined ? null : newValue);
  };

  const formattedValue = value == undefined ? "" : value;

  const InputProps = useMemo(
    () => ({
      readOnly: readonly,
      startAdornment: (prefix != undefined ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined),
      endAdornment: (suffix != undefined ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined),
    }),
    [readonly]
  );

  // will not work without prop type="number"
  // const inputProps = useMemo(
  //   () => ({
  //     min,
  //     max,
  //   }),
  //   [min, max, step]
  // );

  return (
    <NumericFormat
      size="small"
      customInput={TextField}
      value={formattedValue}
      placeholder={!readonly ? placeholder : ""}
      InputProps={InputProps}
      //inputProps={inputProps}
      disabled={readonly}
      onValueChange={handleChange}
      variant="standard"
      //type="number"
      {...customProps}
      {...numericFormatProps}
    />
  );
}
