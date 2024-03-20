import React, {useState, useEffect} from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

export default (props) => {
  const {value, setValue, config, readonly, placeholder, customProps, maxLength, errorMessage} = props;
  const {showErrorMessage, optimizeRenderWithInternals} = config.settings;
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    if (value !== internalValue)
      setInternalValue(value);
  }, [value, errorMessage]);

  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value

    if (optimizeRenderWithInternals)
      setInternalValue(val);
    const didEmptinessChanged = !!val !== !!internalValue;
    const __isInternal = optimizeRenderWithInternals && !didEmptinessChanged;
    setValue(val, undefined, { __isInternal });
  };
  const canUseInternal = optimizeRenderWithInternals && (showErrorMessage ? true : !errorMessage);
  const textValue = (canUseInternal ? internalValue : value) || "";

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
