import React from "react";
import { TextField } from "@fluentui/react";

const FluentUIText = (props) => {
  var value = props.value,
    setValue = props.setValue,
    readonly = props.readonly,
    placeholder = props.placeholder,
    maxLength = props.maxLength;

  var onChange = function onChange(e, val) {
    if (val === "") val = undefined; // don't allow empty value
    setValue(val);
  };
  var textValue = value || "";

  return (
    <TextField
      value={textValue}
      placeholder={placeholder}
      disabled={readonly}
      onChange={onChange}
      maxLength={maxLength}
    />
  );
};
export default FluentUIText;
