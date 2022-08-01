import React from "react";
import { TextField } from "@fluentui/react";

export default (props) => {
  const {
    value,
    setValue,
    config,
    readonly,
    placeholder,
    maxLength,
    maxRows,
    fullWidth,
    customProps,
  } = props;
  const onChange = (e) => {
    let val = e.target.value;
    if (val === "") val = undefined; // don't allow empty value
    setValue(val);
  };
  const textValue = value || "";
  return (
    <TextField
      readonly={readonly}
      multiline
      rows={maxRows}
      maxLength={maxLength}
      placeholder={placeholder}
      value={textValue}
      onChange={onChange}
      {...customProps}
    />
  );
};
