import React from "react";
import { Input } from "reactstrap";

export default (props) => {
  const {value, setValue, config, readonly, placeholder, maxLength, maxRows, fullWidth} = props;
  const onChange = e => {
    let val = e.target.value;
    if (val === "")
      val = undefined; // don't allow empty value
    setValue(val);
  };
  const textValue = value || "";
  return (
    <Input
      type={"textarea"}
      bsSize={"sm"}
      value={textValue} 
      placeholder={placeholder}
      disabled={readonly}
      onChange={onChange}
      maxLength={maxLength}
      style={{
        width: fullWidth ? "100%" : undefined
      }}
    />
  );
};
