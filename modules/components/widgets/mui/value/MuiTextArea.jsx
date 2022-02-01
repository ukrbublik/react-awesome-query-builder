import React from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

export default (props) => {
  const {value, setValue, config, readonly, placeholder, customProps, maxLength, maxRows, fullWidth} = props;
  const {defaultMaxRows} = config.settings;

  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };
  
  const textValue = value || "";

  return (
    <FormControl fullWidth={fullWidth}>
      <TextField 
        variant="standard"
        fullWidth={fullWidth}
        maxRows={maxRows || defaultMaxRows}
        multiline={true}
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
