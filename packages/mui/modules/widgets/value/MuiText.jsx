import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
const __isInternal = true; //true to optimize render

export default (props) => {
  const {value, setValue, config, readonly, placeholder, customProps, maxLength, valueError} = props;
  const [internalValue, setInternalValue] = useState(value);
  
  useEffect(() => {
    if (value !== internalValue)
      setInternalValue(value);
  }, [value]);

  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value

    if (__isInternal)
      setInternalValue(val);
    setValue(val, undefined, __isInternal);
  };

  const {showErrorMessage} = config.settings;
  const canUseInternal = showErrorMessage ? true : !valueError;
  let textValue = (__isInternal && canUseInternal ? internalValue : value) || "";

  return (
    <FormControl>
      <TextField 
        variant="standard"
        value={textValue}
        placeholder={!readonly ? placeholder : ""}
        InputProps={{
          readOnly: readonly,
        }}
        inputProps={{
          maxLength: maxLength,
        }}
        disabled={readonly}
        onChange={onChange}
        size="small"
        {...customProps}
      />
    </FormControl>
  );
};
