import React from "react";
import TextField from "@material-ui/core/TextField";
import FormControl from '@material-ui/core/FormControl';

export default (props) => {
  const {value, setValue, config, readonly, placeholder} = props;
  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };
  return (
    <FormControl>
      <TextField 
        value={value || ""}
        placeholder={placeholder}
        margin={"none"}
        InputProps={{
          readOnly: readonly,
        }}
        disabled={readonly}
        onChange={onChange}
      />
    </FormControl>
  );
};
