import React, { useMemo } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { textFieldInputProps } from "../../utils/versions";

export default (props) => {
  const {value, setValue, config, readonly, min, max, step, placeholder, customProps} = props;
  const {renderSize} = config.settings;
  
  const onChange = e => {
    let val = e.target.value;
    if (val === "" || val === null)
      val = undefined;
    else
      val = Number(val);
    setValue(val);
  };

  const numberValue = value == undefined ? "" : value;

  const inputProps = useMemo(() => textFieldInputProps({
    readOnly: readonly,
  }, {
    min,
    max,
    step,
  }), [
    readonly, min, max, step
  ]);
  
  return (
    <FormControl>
      <TextField 
        variant="standard"
        type="number"
        value={numberValue}
        placeholder={!readonly ? placeholder : ""}
        {...inputProps}
        disabled={readonly}
        onChange={onChange}
        size={renderSize}
        {...customProps}
      />
    </FormControl>
  );
};
