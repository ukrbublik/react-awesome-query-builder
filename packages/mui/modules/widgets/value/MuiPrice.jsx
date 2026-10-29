import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import { textFieldInputProps } from "../../utils/versions";
import { Utils } from "@react-awesome-query-builder/ui";
const { NumericFormat, getNumberFormatProps } = Utils.NumberFormat;


export default (props) => {
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
    const val = values.floatValue;
    setValue(val === undefined ? null : val);
  };

  const formattedValue = value == undefined ? "" : value;

  const inputProps = useMemo(
    () => textFieldInputProps({
      readOnly: readonly,
      startAdornment: (prefix != undefined ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined),
      endAdornment: (suffix != undefined ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined),
    }),
    [readonly, prefix, suffix]
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
    <FormControl>
      <NumericFormat
        size="small"
        customInput={TextField}
        value={formattedValue}
        placeholder={!readonly ? placeholder : ""}
        {...inputProps}
        //inputProps={inputProps}
        disabled={readonly}
        onValueChange={handleChange}
        variant="standard"
        //type="number"
        {...customProps}
        {...numericFormatProps}
      />
    </FormControl>
  );
};
