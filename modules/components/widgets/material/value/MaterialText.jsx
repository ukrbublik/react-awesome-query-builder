import React from "react";
import TextField from "@material-ui/core/TextField";

export default (props) => {
  const {value, setValue, config, readonly, placeholder} = props;
  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };
  return (
    <TextField 
      value={value || ""}
      label={placeholder}
      InputProps={{
        readOnly: readonly,
      }}
      onChange={onChange}
    />
  );
};
