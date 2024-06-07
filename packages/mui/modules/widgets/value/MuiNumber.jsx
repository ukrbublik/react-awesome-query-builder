import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

export default (props) => {
  const {value, setValue, config, readonly, min, max, step, placeholder, customProps} = props;
  
  const onChange = e => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = Number(val);
    setValue(val);
  };

  const numberValue = value == undefined ? "" : value;

  const InputProps = useMemo(() => ({
    readOnly: readonly,
  }), [
    readonly
  ]);

  const inputProps = useMemo(() => ({
    min,
    max,
    step,
  }), [
    min, max, step
  ]);
  
  return (
    <FormControl>
      <TextField 
        variant="standard"
        type="number"
        value={numberValue}
        placeholder={!readonly ? placeholder : ""}
        InputProps={InputProps}
        inputProps={inputProps}
        disabled={readonly}
        onChange={onChange}
        size="small"
        {...customProps}
      />
    </FormControl>
  );
};
