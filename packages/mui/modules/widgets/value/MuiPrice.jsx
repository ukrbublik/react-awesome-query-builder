import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { NumericFormat } from "react-number-format";

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
    ...numericFormatProps
  } = props;

  const handleChange = (values) => {
    const val = values.floatValue;
    setValue(val === undefined ? null : val);
  };

  const numberValue = value == undefined ? "" : value;

  const InputProps = useMemo(
    () => ({
      readOnly: readonly,
    }),
    [readonly]
  );

  const inputProps = useMemo(
    () => ({
      min,
      max,
    }),
    [min, max, step]
  );

  return (
    <FormControl>
      <NumericFormat
        size="small"
        customInput={TextField}
        value={numberValue}
        placeholder={!readonly ? placeholder : ""}
        InputProps={InputProps}
        inputProps={inputProps}
        disabled={readonly}
        onValueChange={handleChange}
        {...customProps}
        {...numericFormatProps}

      />
    </FormControl>
  );
};
